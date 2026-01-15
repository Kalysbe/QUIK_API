// controllers/personsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   NewPerson - Добавление/Изменение физического лица
   ========================= */
export const createPerson = createStoredProcedureHandler(
    z.object({
        PersonId: z.number().int().nullable().optional(),
        FirstName: z.string().max(128),
        MiddleName: z.string().max(128),
        LastName: z.string().max(128),
    }),
    "NewPerson",
    {
        PersonId: sql.Int,
        FirstName: sql.NVarChar(128),
        MiddleName: sql.NVarChar(128),
        LastName: sql.NVarChar(128),
    },
    ["PersonId"], "Физическое лицо успешно добавлено/изменено"
);

/* =========================
   DelPerson - Удаление физического лица
   ========================= */
export const deletePerson = createStoredProcedureHandler(
    z.object({ PersonId: z.number().int() }),
    "DelPerson",
    { PersonId: sql.Int },
    [], "Физическое лицо успешно удалено"
);

/* =========================
   LinkPersonToClient - Привязывание физического лица к клиенту
   ========================= */
export const linkPersonToClient = createStoredProcedureHandler(
    z.object({
        FirmCode: z.string().max(12),
        ClientCode: z.string().max(12),
        PersonId: z.number().int().nullable().optional(),
    }),
    "LinkPersonToClient",
    {
        FirmCode: sql.VarChar(12),
        ClientCode: sql.VarChar(12),
        PersonId: sql.Int,
    },
    ["PersonId"], "Физическое лицо успешно привязано к клиенту"
);

