// controllers/tagsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/tags
   NewTag - Добавление кода позиции
   ========================= */
const newTagSchema = z.object({
    Tag: z.string().max(4),
});

const newTagTypeMap = {
    Tag: sql.VarChar(4),
};

export const createTag = createStoredProcedureHandler(
    newTagSchema,
    "NewTag",
    newTagTypeMap,
    [],
    "Код позиции успешно добавлен"
);

/* =========================
   POST /api/tags/add-to-class
   AddTagToClass - Привязывание кода позиции к классу
   ========================= */
const addTagToClassSchema = z.object({
    Tag: z.string().max(4),
    ClassCode: z.string().max(12),
});

const addTagToClassTypeMap = {
    Tag: sql.VarChar(4),
    ClassCode: sql.VarChar(12),
};

export const addTagToClass = createStoredProcedureHandler(
    addTagToClassSchema,
    "AddTagToClass",
    addTagToClassTypeMap,
    [],
    "Код позиции успешно привязан к классу"
);

