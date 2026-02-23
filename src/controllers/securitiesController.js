// controllers/securitiesController.js
import { z } from "zod";
import { getMssqlPool, sql } from "../config/dbMssql.js";
import pgPool from "../config/dbPostgres.js";

// Хелперы
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

    let reason =
        infoMessages.find(matchesErrText) ||
        (recordsetHasFailureFlag ? "Stored procedure reported failure via recordset" : null) ||
        (outputLooksLikeError ? "Stored procedure reported failure via output params" : null) ||
        (nonZeroReturn ? `Stored procedure returned non-zero code: ${result.returnValue}` : null) ||
        "Business error from stored procedure";

    return { spFailed, reason, infoMessages };
}

function normalizeNullables(data, nullableKeys) {
    const out = { ...data };
    for (const k of nullableKeys) {
        if (out[k] === "" || out[k] === undefined) out[k] = null;
    }
    return out;
}

/**
 * Resolve output column: prefer primary name, fallback to alternate if primary doesn't exist.
 */
function resolveOutputColumn(columnNames, primary, alternates = []) {
    if (columnNames.has(primary)) return primary;
    for (const alt of alternates) {
        if (columnNames.has(alt)) return alt;
    }
    return null;
}

/* =========================
   GET /api/securities
   Возвращает TradeDate, ClassCode, SecCode, FaceUnit, SecShortName, SecFullName.
   Фильтрация по любому столбцу через query-параметры.
   ========================= */
export async function getSecurities(req, res, next) {
    try {
        const tableName = "Securities";

        const columnsResult = await pgPool.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
            ORDER BY ordinal_position;
            `,
            [tableName]
        );

        if (columnsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Таблица "${tableName}" не найдена в схеме public`,
            });
        }

        const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));

        const selectParts = [];
        const baseCols = ["TradeDate", "ClassCode", "SecCode", "FaceUnit"];
        for (const c of baseCols) {
            if (columnNames.has(c)) selectParts.push(`"${c}"`);
        }
        const shortCol = resolveOutputColumn(columnNames, "SecShortName", ["ShortName"]);
        if (shortCol) selectParts.push(`"${shortCol}" AS "SecShortName"`);
        const fullCol = resolveOutputColumn(columnNames, "SecFullName", ["FullName"]);
        if (fullCol) selectParts.push(`"${fullCol}" AS "SecFullName"`);

        const selectCols = selectParts.join(", ");
        const filters = { ...req.query };

        const conditions = [];
        const params = [];

        for (const [key, value] of Object.entries(filters)) {
            if (!columnNames.has(key)) continue;
            params.push(value);
            conditions.push(`"${key}" = $${params.length}`);
        }

        const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const orderCol = columnNames.has("TradeDate") ? '"TradeDate"' : '"ClassCode"';
        const query = `SELECT ${selectCols} FROM public."${tableName}"${whereClause} ORDER BY ${orderCol} DESC`;

        const result = await pgPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/* =========================
   POST /api/securities/stock
   NewSecurity - Добавление/Изменение акции
   ========================= */
const newSecuritySchema = z.object({
    ClassCode: z.string().max(12),
    GroupName: z.string().max(255),
    SecCode: z.string().max(12),
    ShortName: z.string().max(32),
    FullName: z.string().max(128),
    ISIN: z.string().max(12),
    MinStep: z.number().int(),
    FaceValue: z.number(),
    FaceUnit: z.string().max(4),
    Scale: z.number().int(),
    MatDate: z.number().int(),
    LotSize: z.number().int(),
    SettleCode: z.string().max(12),
    CalendarName: z.string().max(255),
    ShortNameEng: z.string().max(32).optional(),
    FullNameEng: z.string().max(128).optional(),
    CFI: z.string().max(6).optional(),
    ListLevel: z.number().int().optional(),
    SubType: z.number().int().nullable().optional(),
    StockCode: z.string().max(12).optional(),
    SedolCode: z.string().max(7).optional(),
    RicCode: z.string().max(32).optional(),
    CusipCode: z.string().max(9).optional(),
    FigiCode: z.string().max(20).optional(),
    QtyScale: z.number().int().nullable().optional(),
    QtyMultiplier: z.number().int().nullable().optional(),
    Enabled: z.number().int().min(0).max(1).default(1),
    RegNumber: z.string().max(30).nullable().optional(),
    ComplexProduct: z.number().int().nullable().optional(),
});

const newSecurityTypeMap = {
    ClassCode: sql.VarChar(12),
    GroupName: sql.NVarChar(255),
    SecCode: sql.VarChar(12),
    ShortName: sql.NVarChar(32),
    FullName: sql.NVarChar(128),
    ISIN: sql.VarChar(12),
    MinStep: sql.Int,
    FaceValue: sql.Float,
    FaceUnit: sql.VarChar(4),
    Scale: sql.Int,
    MatDate: sql.Int,
    LotSize: sql.Int,
    SettleCode: sql.VarChar(12),
    CalendarName: sql.NVarChar(255),
    ShortNameEng: sql.VarChar(32),
    FullNameEng: sql.VarChar(128),
    CFI: sql.VarChar(6),
    ListLevel: sql.Int,
    SubType: sql.Int,
    StockCode: sql.VarChar(12),
    SedolCode: sql.VarChar(7),
    RicCode: sql.VarChar(32),
    CusipCode: sql.VarChar(9),
    FigiCode: sql.VarChar(20),
    QtyScale: sql.Int,
    QtyMultiplier: sql.Int,
    Enabled: sql.Bit,
    RegNumber: sql.VarChar(30),
    ComplexProduct: sql.Int,
};

export const createSecurity = async (req, res, next) => {
    try {
        const parsed = newSecuritySchema.safeParse(req.body);
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

        const data = normalizeNullables(parsed.data, ["SubType", "QtyScale", "QtyMultiplier", "RegNumber", "ComplexProduct"]);

        const pool = await getMssqlPool();
        const request = pool.request();
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

        for (const [key, value] of Object.entries(data)) {
            const t = newSecurityTypeMap[key] ?? sql.NVarChar;
            request.input(key, t, value ?? null);
        }

        const result = await request.execute("NewSecurity");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewSecurity вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Инструмент (акция) успешно добавлен или обновлён",
            resultset: result.recordset ?? [],
            rowsAffected: result.rowsAffected,
            output: result.output ?? {},
            returnValue: result.returnValue ?? null,
            info: infoMessages,
        });
    } catch (error) {
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
                message: "Ошибка при выполнении процедуры NewSecurity",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

