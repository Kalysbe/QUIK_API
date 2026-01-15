// controllers/extraParamsController.js
import { z } from "zod";
import { createStoredProcedureHandler, detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   GetSecurityExtraParamsValues - Получение дополнительных параметров
   ========================= */
export const getSecurityExtraParamsValues = async (req, res, next) => {
    try {
        const { ClassCode, SecCode } = req.query;
        if (!ClassCode || !SecCode) {
            return res.status(400).json({ success: false, message: "ClassCode и SecCode обязательны" });
        }

        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => infoObjects.push({ message: info?.message ?? "" }));
        request.input("Classcode", sql.VarChar(12), ClassCode);
        request.input("Seccode", sql.VarChar(12), SecCode);

        const result = await request.execute("GetSecurityExtraParamsValues");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) return res.status(500).json({ success: false, message: "Ошибка", reason });
        return res.status(200).json({ success: true, data: result.recordset ?? [] });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   EditSecurityExtraParamsValue - Редактирование дополнительных параметров
   ========================= */
export const editSecurityExtraParamsValue = createStoredProcedureHandler(
    z.object({
        Action: z.number().int().min(0).max(2),
        Classcode: z.string().max(12),
        Seccode: z.string().max(12),
        ParamDbName: z.string().max(16),
        Value: z.number().int(),
    }),
    "EditSecurityExtraParamsValue",
    {
        Action: sql.Int,
        Classcode: sql.VarChar(12),
        Seccode: sql.VarChar(12),
        ParamDbName: sql.VarChar(16),
        Value: sql.BigInt,
    },
    [], "Дополнительный параметр успешно обработан"
);

