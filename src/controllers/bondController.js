// controllers/instrumentsController.js
import Security from "../models/Security.js";
import { z } from "zod";
import { getMssqlPool, sql } from "../config/dbMssql.js";
import { Op } from "sequelize";

/* =========================
   GET /instruments
   ========================= */
export async function getInstruments(req, res, next) {
    try {
        const securities = await Security.findAll({
            where: {
                [Op.or]: [
                    { ClassCode: { [Op.like]: '%GD%' } },
                    { ClassCode: { [Op.like]: '%GBA%' } }
                ]
            },
            order: [["TradeDate", "DESC"]],
        });
        res.json(securities);
    } catch (err) {
        next(err);
    }
}

/* =========================
   Zod-схема входных данных
   ========================= */
const instrumentSchema = z.object({
    ClassCode: z.string().max(12),
    GroupName: z.string().max(255),
    SecCode: z.string().max(12),
    ShortNameRus: z.string().max(32),
    FullNameRus: z.string().max(128),
    ISIN: z.string().max(12),
    MinStep: z.number(),
    FaceValue: z.number(),
    Currency: z.string().max(4),
    TradeCurrency: z.string().max(4),
    MarketCode: z.string().max(4),
    BasisType: z.number().int(),
    BondInterestType: z.number().int(),
    CouponFrequency: z.number().int(),
    EmissionDate: z.number().int(),
    CalcModeACI: z.number().int(),
    YieldMatCalcMethod: z.number().int(),
    Scale: z.number().int(),
    MatDate: z.number().int(), // при необходимости замените на дату
    LotSize: z.number().int(),
    SettleCode: z.string().max(12),
    CalendarName: z.string().max(255),
    ShortNameEng: z.string().max(32),
    FullNameEng: z.string().max(128),
    CFI: z.string().max(6),
    SubType: z.number().int().nullable(),
    // StockCode: z.string().max(12),
    // SedolCode: z.string().max(7),
    // RicCode: z.string().max(32),
    // CusipCode: z.string().max(9),
    // FigiCode: z.string().max(20),
    // QtyScale: z.number().int().nullable(),
    QtyMultiplier: z.number().int().nullable(),
    Enabled: z.number().int(),
    RegNumber: z.string().max(30).nullable(),
});

/* =========================
   Хелперы
   ========================= */
function normalizeNullables(data) {
    const nullableKeys = ["SubType", "QtyMultiplier", "RegNumber"];
    const out = { ...data };
    for (const k of nullableKeys) {
        if (out[k] === "") out[k] = null;
    }
    return out;
}

// сопоставление типов для строгой передачи параметров в SP
const typeMap = {
    ClassCode: sql.VarChar(12),
    GroupName: sql.NVarChar(255),
    SecCode: sql.VarChar(12),
    ShortNameRus: sql.NVarChar(32),
    FullNameRus: sql.NVarChar(128),
    ISIN: sql.VarChar(12),
    MinStep: sql.Float,
    FaceValue: sql.Float,
    Currency: sql.VarChar(4),
    TradeCurrency: sql.VarChar(4),
    MarketCode: sql.VarChar(4),
    BasisType: sql.Int,
    BondInterestType: sql.Int,
    EmissionDate: sql.Int,
    CalcModeACI: sql.Int,
    YieldMatCalcMethod: sql.Int,
    CouponFrequency: sql.Int,
    Scale: sql.Int,
    MatDate: sql.Int, // если это дата — конвертируйте и используйте sql.Date
    LotSize: sql.Int,
    SettleCode: sql.VarChar(12),
    CalendarName: sql.NVarChar(255),
    ShortNameEng: sql.VarChar(32),
    FullNameEng: sql.VarChar(128),
    CFI: sql.VarChar(6),
    SubType: sql.Int,
    // StockCode: sql.VarChar(12),
    // SedolCode: sql.VarChar(7),
    // RicCode: sql.VarChar(32),
    // CusipCode: sql.VarChar(9),
    // FigiCode: sql.VarChar(20),
    // QtyScale: sql.Int,
    QtyMultiplier: sql.Int,
    Enabled: sql.Int,
    RegNumber: sql.VarChar(30),
};

// эвристика определения «логической» ошибки SP, когда исключения нет
function detectSpFailure(result, infoObjects) {
    const infoMessages = infoObjects.map(i => i.message ?? "");
    const matchesErrText = (s) =>
        /unable|error|ошибк|does not exist|not found|already exists|duplicate|invalid|constraint|violat/i.test(s || "");

    const infoLooksLikeError = infoMessages.some(matchesErrText);

    const recordsetHasFailureFlag =
        Array.isArray(result.recordset) &&
        result.recordset.length > 0 &&
        (result.recordset[0]?.Success === false ||
            matchesErrText(JSON.stringify(result.recordset[0] || {})));

    const outputLooksLikeError =
        result.output &&
        Object.values(result.output).some((v) => matchesErrText(String(v)));

    const nonZeroReturn =
        typeof result.returnValue === "number" && result.returnValue !== 0;

    const spFailed = nonZeroReturn || infoLooksLikeError || recordsetHasFailureFlag || outputLooksLikeError;

    // сформируем reason
    let reason =
        infoMessages.find(matchesErrText) ||
        (recordsetHasFailureFlag ? "Stored procedure reported failure via recordset" : null) ||
        (outputLooksLikeError ? "Stored procedure reported failure via output params" : null) ||
        (nonZeroReturn ? `Stored procedure returned non-zero code: ${result.returnValue}` : null) ||
        "Business error from stored procedure";

    return { spFailed, reason, infoMessages };
}

/* =========================
   POST /instruments
   ========================= */
export const createInstrument = async (req, res, next) => {
    try {
        // 1) Валидация (без throw)
        const parsed = instrumentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Ошибка валидации данных",
                errors: parsed.error.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
        }

        const data = normalizeNullables(parsed.data);

        // 2) Подготовка запроса MSSQL
        const pool = await getMssqlPool();
        const request = pool.request();

        // Собираем INFO/PRINT из конкретного вызова
        const infoObjects = [];
        request.on("info", (info) => {
            infoObjects.push({
                message: info?.message ?? "",
                number: info?.number,
                state: info?.state,
                class: info?.class,
                procName: info?.procName,
                lineNumber: info?.lineNumber,
            });
        });

        // Передаем параметры с типами
        for (const [key, value] of Object.entries(data)) {
            const t = typeMap[key] ?? sql.NVarChar;
            request.input(key, t, value ?? null);
        }

        // 3) Вызов процедуры
        const result = await request.execute("NewBondSecurity");

        // 4) Распознаём «мягкую» ошибку
        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            // 409 — бизнес-конфликт/валидация на стороне БД (можно 422)
            return res.status(409).json({
                success: false,
                message: "Процедура NewBondSecurity вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        // 5) Успех
        return res.status(200).json({
            success: true,
            message: "Инструмент успешно добавлен или обновлён",
            resultset: result.recordset ?? [],
            rowsAffected: result.rowsAffected,
            output: result.output ?? {},
            returnValue: result.returnValue ?? null,
            info: infoMessages,
        });
    } catch (error) {
        // Ошибки mssql (THROW/RAISERROR высокого уровня, таймауты, конверсия типов)
        const isMssqlError =
            error?.name === "RequestError" ||
            error?.code === "EREQUEST" ||
            error?.originalError;

        if (isMssqlError) {
            const sqlInfo = {
                message: error.originalError?.message || error.message,
                number: error.originalError?.number,
                state: error.originalError?.state,
                class: error.originalError?.class,
                lineNumber: error.originalError?.lineNumber,
                serverName: error.originalError?.serverName,
                procName: error.originalError?.procName,
                precedingErrors: error.precedingErrors?.map((e) => e.message),
            };

            return res.status(500).json({
                success: false,
                message: "Ошибка при выполнении процедуры NewBondSecurity",
                sql: sqlInfo,
            });
        }

        // Любая иная — в централизованный обработчик
        return next(error);
    }
};

/* =========================
   Глобальные события MSSQL
   ========================= */
sql.on("error", (err) => console.error("❌ MSSQL Global error:", err));
sql.on("info", (info) =>
    console.warn("ℹ️ MSSQL Global info:", info?.message ?? info)
);
