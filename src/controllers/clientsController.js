// controllers/clientsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/clients
   NewClient - Добавление клиента
   ========================= */
const newClientSchema = z.object({
    FirmCode: z.string().max(12),
    ClientCode: z.string().max(12),
});

const newClientTypeMap = {
    FirmCode: sql.VarChar(12),
    ClientCode: sql.VarChar(12),
};

export const createClient = createStoredProcedureHandler(
    newClientSchema,
    "NewClient",
    newClientTypeMap,
    [],
    "Клиент успешно добавлен"
);

/* =========================
   DELETE /api/clients
   DelClient - Удаление клиента
   ========================= */
const delClientSchema = z.object({
    FirmCode: z.string().max(12),
    ClientCode: z.string().max(12),
});

const delClientTypeMap = {
    FirmCode: sql.VarChar(12),
    ClientCode: sql.VarChar(12),
};

export const deleteClient = createStoredProcedureHandler(
    delClientSchema,
    "DelClient",
    delClientTypeMap,
    [],
    "Клиент успешно удалён"
);

