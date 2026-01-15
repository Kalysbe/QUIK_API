// controllers/coreGroupsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/core-groups
   NewCoreGroup - Добавление группы мэтчинговых ядер
   ========================= */
const newCoreGroupSchema = z.object({
    GroupName: z.string().max(255),
});

const newCoreGroupTypeMap = {
    GroupName: sql.NVarChar(255),
};

export const createCoreGroup = createStoredProcedureHandler(
    newCoreGroupSchema,
    "NewCoreGroup",
    newCoreGroupTypeMap,
    [],
    "Группа мэтчинговых ядер успешно добавлена"
);

