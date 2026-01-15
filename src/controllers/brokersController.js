// controllers/brokersController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   POST /api/brokers
   NewBroker - Добавление клиента с типом «Брокер»
   ========================= */
const newBrokerSchema = z.object({
    FirmCode: z.string().max(12),
    BrokerCode: z.string().max(12),
});

const newBrokerTypeMap = {
    FirmCode: sql.VarChar(12),
    BrokerCode: sql.VarChar(12),
};

export const createBroker = createStoredProcedureHandler(
    newBrokerSchema,
    "NewBroker",
    newBrokerTypeMap,
    [],
    "Брокер успешно добавлен"
);

