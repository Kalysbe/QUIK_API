// controllers/tradeCreationController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   SetClassNormalTradeCreationMode - Установка обычного режима генерации сделок
   ========================= */
export const setClassNormalTradeCreationMode = createStoredProcedureHandler(
    z.object({ FirmCode: z.string().max(12), ClassCode: z.string().max(12) }),
    "SetClassNormalTradeCreationMode",
    { FirmCode: sql.VarChar(12), ClassCode: sql.VarChar(12) },
    [], "Обычный режим генерации сделок установлен"
);

/* =========================
   SetClassLayerTradeCreationParams - Параметры генерации сделок с брокером
   ========================= */
export const setClassLayerTradeCreationParams = createStoredProcedureHandler(
    z.object({
        FirmCode: z.string().max(12),
        ClassCode: z.string().max(12),
        BrokerFirmCode: z.string().max(12),
        BrokerAccount: z.string().max(12),
        BrokerClientCode: z.string().max(12),
    }),
    "SetClassLayerTradeCreationParams",
    {
        FirmCode: sql.VarChar(12),
        ClassCode: sql.VarChar(12),
        BrokerFirmCode: sql.VarChar(12),
        BrokerAccount: sql.VarChar(12),
        BrokerClientCode: sql.VarChar(12),
    },
    [], "Параметры генерации сделок с брокером установлены"
);

/* =========================
   SetClassByBrokerQuotesTradeCreationMode - Режим исполнения заявок по котировкам брокера
   ========================= */
export const setClassByBrokerQuotesTradeCreationMode = createStoredProcedureHandler(
    z.object({
        ClassCode: z.string().max(12),
        BrokerFirmCode: z.string().max(12),
        BrokerClientCode: z.string().max(12),
    }),
    "SetClassByBrokerQuotesTradeCreationMode",
    {
        ClassCode: sql.VarChar(12),
        BrokerFirmCode: sql.VarChar(12),
        BrokerClientCode: sql.VarChar(12),
    },
    [], "Режим исполнения заявок по котировкам брокера установлен"
);

