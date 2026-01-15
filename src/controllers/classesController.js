// controllers/classesController.js
import { z } from "zod";
import { getMssqlPool, sql } from "../config/dbMssql.js";

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

/* =========================
   POST /api/classes
   NewClass - Добавление класса
   ========================= */
const newClassSchema = z.object({
    ClassCode: z.string().max(12),
});

export const createClass = async (req, res, next) => {
    try {
        const parsed = newClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        const result = await request.execute("NewClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/bond
   NewBondClass - Добавление класса облигаций
   ========================= */
const newBondClassSchema = z.object({
    ClassCode: z.string().max(12),
    MatchingMode: z.number().int().min(0).max(1), // 0 - двойной встречный аукцион, 1 - односторонний аукцион
});

export const createBondClass = async (req, res, next) => {
    try {
        const parsed = newBondClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        request.input("MatchingMode", sql.Int, parsed.data.MatchingMode);
        const result = await request.execute("NewBondClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewBondClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс облигаций успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewBondClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/futures
   NewFutClass - Добавление класса фьючерсов
   ========================= */
const newFutClassSchema = z.object({
    ClassCode: z.string().max(12),
});

export const createFutClass = async (req, res, next) => {
    try {
        const parsed = newFutClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        const result = await request.execute("NewFutClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewFutClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс фьючерсов успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewFutClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/fx
   NewFxClass - Добавление класса валютообмена
   ========================= */
const newFxClassSchema = z.object({
    ClassCode: z.string().max(12),
});

export const createFxClass = async (req, res, next) => {
    try {
        const parsed = newFxClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        const result = await request.execute("NewFxClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewFxClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс валютообмена успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewFxClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/options
   NewOptClass - Добавление класса опционов
   ========================= */
const newOptClassSchema = z.object({
    ClassCode: z.string().max(12),
});

export const createOptClass = async (req, res, next) => {
    try {
        const parsed = newOptClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        const result = await request.execute("NewOptClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewOptClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс опционов успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewOptClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/spread
   NewSpreadClass - Добавление класса спредов
   ========================= */
const newSpreadClassSchema = z.object({
    ClassCode: z.string().max(12),
    MatchingMode: z.number().int().min(0).max(1), // 0 - двойной встречный аукцион, 1 - односторонний аукцион
    ZeroOrNegativePriceAllowed: z.number().int().optional(), // Признак допустимости ввода отрицательных цен
});

export const createSpreadClass = async (req, res, next) => {
    try {
        const parsed = newSpreadClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        request.input("MatchingMode", sql.Int, parsed.data.MatchingMode);
        if (parsed.data.ZeroOrNegativePriceAllowed !== undefined) {
            request.input("ZeroOrNegativePriceAllowed", sql.Int, parsed.data.ZeroOrNegativePriceAllowed);
        }
        const result = await request.execute("NewSpreadClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewSpreadClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс спредов успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewSpreadClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

/* =========================
   POST /api/classes/certificate
   NewCertificateClass - Добавление класса цифровых свидетельств
   ========================= */
const newCertificateClassSchema = z.object({
    ClassCode: z.string().max(12),
});

export const createCertificateClass = async (req, res, next) => {
    try {
        const parsed = newCertificateClassSchema.safeParse(req.body);
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

        request.input("ClassCode", sql.VarChar(12), parsed.data.ClassCode);
        const result = await request.execute("NewCertificateClass");

        const { spFailed, reason, infoMessages } = detectSpFailure(result, infoObjects);
        if (spFailed) {
            return res.status(409).json({
                success: false,
                message: "Процедура NewCertificateClass вернула ошибку",
                reason,
                returnValue: result.returnValue ?? null,
                output: result.output ?? {},
                info: infoObjects,
                recordset: result.recordset ?? [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Класс цифровых свидетельств успешно добавлен",
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
                message: "Ошибка при выполнении процедуры NewCertificateClass",
                sql: sqlInfo,
            });
        }

        return next(error);
    }
};

