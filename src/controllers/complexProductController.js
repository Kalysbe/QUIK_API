// controllers/complexProductController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/complex-product
   SetComplexProduct - Добавление/изменение типа сложного финансового продукта
   ========================= */
const setComplexProductSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(30),
    ComplexProduct: z.number().int(),
});

const setComplexProductTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(30),
    ComplexProduct: sql.Int,
};

export const setComplexProduct = createStoredProcedureHandler(
    setComplexProductSchema,
    "SetComplexProduct",
    setComplexProductTypeMap,
    [],
    "Тип сложного финансового продукта успешно установлен"
);

