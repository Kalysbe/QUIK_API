// controllers/faceValuesController.js
import { z } from "zod";
import { createStoredProcedureHandler, detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   GetFaceValues - Получение номиналов облигаций
   ========================= */
export const getFaceValues = async (req, res, next) => {
    try {
        const secCode = req.query.SecCode || req.params.secCode || null;
        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => infoObjects.push({ message: info?.message ?? "" }));
        if (secCode) request.input("SecCode", sql.VarChar(12), secCode);

        const result = await request.execute("GetFaceValues");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) return res.status(500).json({ success: false, message: "Ошибка", reason });
        return res.status(200).json({ success: true, data: result.recordset ?? [] });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   AddFaceValue - Добавление номинала
   ========================= */
export const addFaceValue = createStoredProcedureHandler(
    z.object({
        SecCode: z.string().max(12),
        Date: z.number().int(),
        FaceValue: z.number(),
        FaceUnit: z.string().max(4).nullable().optional(),
    }),
    "AddFaceValue",
    { SecCode: sql.VarChar(12), Date: sql.Int, FaceValue: sql.Float, FaceUnit: sql.VarChar(4) },
    ["FaceUnit"], "Номинал успешно добавлен"
);

/* =========================
   DelFaceValue - Удаление номинала
   ========================= */
export const delFaceValue = createStoredProcedureHandler(
    z.object({
        SecCode: z.string().max(12),
        Date: z.number().int(),
        FaceUnit: z.string().max(4).nullable().optional(),
    }),
    "DelFaceValue",
    { SecCode: sql.VarChar(12), Date: sql.Int, FaceUnit: sql.VarChar(4) },
    ["FaceUnit"], "Номинал успешно удалён"
);

