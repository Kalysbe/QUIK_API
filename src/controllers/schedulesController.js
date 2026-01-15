// controllers/schedulesController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/schedules
   NewScheduleAction - Добавление события для расписания торгов
   ========================= */
const newScheduleActionSchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12).optional(),
    EventCode: z.string().max(9), // O, C, S, A, P, L
    EventTime: z.string().max(9), // HH:MM:SS
    CancelOrders: z.number().int().min(0).max(1).optional(),
    ApplyTradesStopOrders: z.number().int().min(0).max(2).optional(),
});

const newScheduleActionTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
    EventCode: sql.VarChar(9),
    EventTime: sql.VarChar(9),
    CancelOrders: sql.Bit,
    ApplyTradesStopOrders: sql.Int,
};

export const createScheduleAction = createStoredProcedureHandler(
    newScheduleActionSchema,
    "NewScheduleAction",
    newScheduleActionTypeMap,
    ["SecCode"],
    "Событие расписания успешно добавлено"
);

