// controllers/couponsController.js
import { z } from "zod";
import { createStoredProcedureHandler, detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   GetCoupons - Получение значений купонов
   ========================= */
export const getCoupons = async (req, res, next) => {
    try {
        const assetCode = req.query.AssetCode || req.params.assetCode || null;
        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => infoObjects.push({ message: info?.message ?? "" }));
        if (assetCode) request.input("AssetCode", sql.VarChar(12), assetCode);

        const result = await request.execute("GetCoupons");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) return res.status(500).json({ success: false, message: "Ошибка", reason });
        return res.status(200).json({ success: true, data: result.recordset ?? [] });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   EditCoupon - Добавление/редактирование/удаление купона
   ========================= */
export const editCoupon = createStoredProcedureHandler(
    z.object({
        Action: z.number().int().min(0).max(2), // 0 - вставка, 1 - редактирование, 2 - удаление
        AssetCode: z.string().max(12),
        EmitDate: z.number().int(),
        ExpireDate: z.number().int(),
        Value: z.number().nullable().optional(),
        ValueUnits: z.number().int().nullable().optional(),
    }),
    "EditCoupon",
    {
        Action: sql.Int,
        AssetCode: sql.VarChar(12),
        EmitDate: sql.Int,
        ExpireDate: sql.Int,
        Value: sql.Float,
        ValueUnits: sql.Int,
    },
    ["Value", "ValueUnits"], "Купон успешно обработан"
);

