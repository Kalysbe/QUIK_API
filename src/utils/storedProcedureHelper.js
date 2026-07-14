// utils/storedProcedureHelper.js
// Универсальный хелпер для выполнения хранимых процедур
import { getMssqlPool, sql } from "../config/dbMssql.js";
import logger from "./logger.js";

const BUSINESS_ERROR_RE =
    /unable|error|ошибк|does not exist|not found|already exists|duplicate|invalid|constraint|violat|unique key|primary key/i;

export function matchesBusinessErrorText(s) {
    return BUSINESS_ERROR_RE.test(s || "");
}

export function detectSpFailure(result, infoObjects) {
    const infoMessages = (infoObjects || []).map(i => i.message ?? "");
    const matchesErrText = matchesBusinessErrorText;

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

export function normalizeNullables(data, nullableKeys = []) {
    const out = { ...data };
    for (const k of nullableKeys) {
        if (out[k] === "" || out[k] === undefined) out[k] = null;
    }
    return out;
}

// Универсальная функция для выполнения хранимой процедуры
export async function executeStoredProcedure(
    procedureName,
    data,
    typeMap,
    nullableKeys = [],
    res,
    next,
    successMessage = "Операция выполнена успешно"
) {
    try {
        const normalizedData = normalizeNullables(data, nullableKeys);
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

        // Добавляем параметры
        for (const [key, value] of Object.entries(normalizedData)) {
            const sqlType = typeMap[key] ?? sql.NVarChar;
            request.input(key, sqlType, value ?? null);
        }

        const result = await request.execute(procedureName);
        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);

        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: `Процедура ${procedureName} вернула ошибку`,
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: successMessage,
            resultset: result.recordset ?? [],
            rowsAffected: result.rowsAffected,
            output: result.output ?? {},
            returnValue: result.returnValue ?? null,
            info: infoMessages,
        });
    } catch (error) {
        const isMssqlError =
            error?.name === "RequestError" ||
            error?.name === "ConnectionError" ||
            error?.code === "EREQUEST" ||
            error?.code === "ETIMEOUT" ||
            error?.code === "ECONNRESET" ||
            error?.originalError;

        if (isMssqlError) {
            const sqlMessage = error.originalError?.message || error.message || "";
            const sqlInfo = {
                message: sqlMessage,
                number: error.originalError?.number ?? error.number,
                state: error.originalError?.state ?? error.state,
                class: error.originalError?.class ?? error.class,
                lineNumber: error.originalError?.lineNumber ?? error.lineNumber,
                serverName: error.originalError?.serverName,
                procName: error.originalError?.procName ?? error.procName ?? procedureName,
                precedingErrors: error.precedingErrors?.map((e) => e.message),
            };

            // NewFirm и др. делают RAISERROR при дубликатах/бизнес-ошибках —
            // это конфликт данных (409), а не внутренняя ошибка сервера (500).
            const isBusinessError = matchesBusinessErrorText(sqlMessage);
            const statusCode = isBusinessError ? 409 : 500;

            logger.error(`MSSQL procedure ${procedureName} failed`, {
                statusCode,
                procedureName,
                sql: sqlInfo,
                errorName: error.name,
                errorCode: error.code,
            });

            return res.status(statusCode).json({
                success: false,
                message: isBusinessError
                    ? `Процедура ${procedureName} вернула ошибку`
                    : `Ошибка при выполнении процедуры ${procedureName}`,
                reason: sqlMessage,
                sql: sqlInfo,
            });
        }

        return next(error);
    }
}

// Универсальная функция для валидации и выполнения
export function createStoredProcedureHandler(
    schema,
    procedureName,
    typeMap,
    nullableKeys = [],
    successMessage = "Операция выполнена успешно"
) {
    return async (req, res, next) => {
        try {
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) {
                const issues = parsed.error?.issues || parsed.error?.errors || [];
                return res.status(400).json({
                    success: false,
                    message: "Ошибка валидации данных",
                    errors: issues.map((e) => ({
                        field: e.path?.join(".") || "",
                        message: e.message || "Ошибка валидации",
                    })),
                });
            }

            return await executeStoredProcedure(
                procedureName,
                parsed.data,
                typeMap,
                nullableKeys,
                res,
                next,
                successMessage
            );
        } catch (error) {
            return next(error);
        }
    };
}

