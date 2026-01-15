// controllers/crossratesController.js
import { z } from "zod";
import { createStoredProcedureHandler, detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   GetCrossrates - Получение кросс-курсов
   ========================= */
export const getCrossrates = async (req, res, next) => {
    try {
        const date = req.query.Date ? parseInt(req.query.Date) : null;
        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => infoObjects.push({ message: info?.message ?? "" }));
        if (date) request.input("Date", sql.Int, date);

        const result = await request.execute("GetCrossrates");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) return res.status(500).json({ success: false, message: "Ошибка", reason });
        return res.status(200).json({ success: true, data: result.recordset ?? [] });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   EditCrossrate - Добавление/редактирование/удаление кросс-курса
   ========================= */
export const editCrossrate = createStoredProcedureHandler(
    z.object({
        Action: z.number().int().min(0).max(2),
        CurrencyCode: z.string().max(4),
        Rate: z.number(),
        Date: z.number().int().nullable().optional(),
        IsMainCurrency: z.number().int().min(0).max(1).nullable().optional(),
    }),
    "EditCrossrate",
    {
        Action: sql.Int,
        CurrencyCode: sql.VarChar(4),
        Rate: sql.Float,
        Date: sql.Int,
        IsMainCurrency: sql.Int,
    },
    ["Date", "IsMainCurrency"], "Кросс-курс успешно обработан"
);

