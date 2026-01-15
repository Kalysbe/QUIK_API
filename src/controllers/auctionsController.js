// controllers/auctionsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   AddAuctionSchedule - Добавление аукциона
   ========================= */
export const addAuctionSchedule = createStoredProcedureHandler(
    z.object({
        ClassCode: z.string().max(12),
        SecCode: z.string().max(12),
        IssuerCode: z.string().max(12),
        IssuerClientCode: z.string().max(12).nullable().optional(),
        OperatorCode: z.string().max(12),
        AuctionKind: z.number().int(),
        CustomAuctionId: z.number().int(),
        ParentCustomAuctionId: z.number().int().nullable().optional(),
        AuctionQty: z.number().int(),
        BuySell: z.number().int().min(0).max(1),
        AuctionDate: z.number().int(),
        OrderEntryPhaseStartTime: z.number().int(),
        OrderEntryPhaseDuration: z.number().int(),
        FulfillmentPhaseDuration: z.number().int(),
        OrderEntryNonCompetitiveEnabled: z.number().int().min(0).max(1),
        OrderExecutionModeByCutOffPriceEnabled: z.number().int().min(0).max(1),
        OrderPartialFulfillmentEnabled: z.number().int().min(0).max(1),
        OrderBooksDisabled: z.number().int().min(0).max(1),
        NoncompetitiveOrdersPercent: z.number(),
        MinAllowedPrice: z.number(),
        MaxAllowedPrice: z.number().optional(),
        IssuerOrderInOrderEntryPeriodEnabled: z.number().int().min(0).max(1).optional(),
    }),
    "AddAuctionSchedule",
    {
        ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), IssuerCode: sql.VarChar(12),
        IssuerClientCode: sql.VarChar(12), OperatorCode: sql.VarChar(12), AuctionKind: sql.Int,
        CustomAuctionId: sql.BigInt, ParentCustomAuctionId: sql.BigInt, AuctionQty: sql.BigInt,
        BuySell: sql.Int, AuctionDate: sql.Int, OrderEntryPhaseStartTime: sql.Int,
        OrderEntryPhaseDuration: sql.Int, FulfillmentPhaseDuration: sql.Int,
        OrderEntryNonCompetitiveEnabled: sql.Int, OrderExecutionModeByCutOffPriceEnabled: sql.Int,
        OrderPartialFulfillmentEnabled: sql.Int, OrderBooksDisabled: sql.Int,
        NoncompetitiveOrdersPercent: sql.Float, MinAllowedPrice: sql.Float, MaxAllowedPrice: sql.Float,
        IssuerOrderInOrderEntryPeriodEnabled: sql.Int,
    },
    ["IssuerClientCode", "ParentCustomAuctionId", "MaxAllowedPrice", "IssuerOrderInOrderEntryPeriodEnabled"],
    "Аукцион успешно добавлен"
);

/* =========================
   EditAuctionSchedule - Редактирование аукциона
   ========================= */
export const editAuctionSchedule = createStoredProcedureHandler(
    z.object({
        CustomAuctionId: z.number().int(),
        IssuerCode: z.string().max(12),
        IssuerClientCode: z.string().max(12).nullable().optional(),
        OperatorCode: z.string().max(12),
        AuctionDate: z.number().int(),
        AuctionQty: z.number().int(),
        OrderEntryPhaseStartTime: z.number().int(),
        OrderEntryPhaseDuration: z.number().int(),
        FulfillmentPhaseDuration: z.number().int(),
        OrderEntryNonCompetitiveEnabled: z.number().int().min(0).max(1),
        OrderExecutionModeByCutOffPriceEnabled: z.number().int().min(0).max(1),
        OrderPartialFulfillmentEnabled: z.number().int().min(0).max(1),
        OrderBooksDisabled: z.number().int().min(0).max(1),
        NoncompetitiveOrdersPercent: z.number(),
        MinAllowedPrice: z.number(),
        MaxAllowedPrice: z.number(),
        IssuerOrderInOrderEntryPeriodEnabled: z.number().int().min(0).max(1).optional(),
    }),
    "EditAuctionSchedule",
    {
        CustomAuctionId: sql.BigInt, IssuerCode: sql.VarChar(12), IssuerClientCode: sql.VarChar(12),
        OperatorCode: sql.VarChar(12), AuctionDate: sql.Int, AuctionQty: sql.BigInt,
        OrderEntryPhaseStartTime: sql.Int, OrderEntryPhaseDuration: sql.Int, FulfillmentPhaseDuration: sql.Int,
        OrderEntryNonCompetitiveEnabled: sql.Int, OrderExecutionModeByCutOffPriceEnabled: sql.Int,
        OrderPartialFulfillmentEnabled: sql.Int, OrderBooksDisabled: sql.Int,
        NoncompetitiveOrdersPercent: sql.Float, MinAllowedPrice: sql.Float, MaxAllowedPrice: sql.Float,
        IssuerOrderInOrderEntryPeriodEnabled: sql.Int,
    },
    ["IssuerClientCode", "IssuerOrderInOrderEntryPeriodEnabled"],
    "Аукцион успешно изменён"
);

/* =========================
   DeleteAuctionSchedule - Удаление аукциона
   ========================= */
export const deleteAuctionSchedule = createStoredProcedureHandler(
    z.object({ CustomAuctionId: z.number().int() }),
    "DeleteAuctionSchedule",
    { CustomAuctionId: sql.Int },
    [], "Аукцион успешно удалён"
);

/* =========================
   ChangeAuctionNotificationTime - Изменение времени нотификации
   ========================= */
export const changeAuctionNotificationTime = createStoredProcedureHandler(
    z.object({
        AuctionId: z.number().int(),
        Action: z.number().int().min(1).max(2),
        Time: z.number().int(),
        TemplateId: z.number().int(),
    }),
    "ChangeAuctionNotificationTime",
    { AuctionId: sql.Int, Action: sql.Int, Time: sql.Int, TemplateId: sql.Int },
    [], "Время нотификации изменено"
);

/* =========================
   ChangeAuctionDateAndTime - Изменение всех параметров расписания
   ========================= */
export const changeAuctionDateAndTime = createStoredProcedureHandler(
    z.object({
        AuctionId: z.number().int(),
        AuctionDate: z.number().int(),
        OrderEntryPhaseStartTime: z.number().int(),
        OrderEntryPhaseDuration: z.number().int(),
        IssuerPhaseDuration: z.number().int(),
    }),
    "ChangeAuctionDateAndTime",
    {
        AuctionId: sql.Int, AuctionDate: sql.Int, OrderEntryPhaseStartTime: sql.Int,
        OrderEntryPhaseDuration: sql.Int, IssuerPhaseDuration: sql.Int,
    },
    [], "Расписание аукциона изменено"
);

/* =========================
   ChangeAuctionTime - Изменение периодов и времени начала
   ========================= */
export const changeAuctionTime = createStoredProcedureHandler(
    z.object({
        AuctionId: z.number().int(),
        Action: z.number().int().min(1).max(3),
        Value: z.number().int(),
    }),
    "ChangeAuctionTime",
    { AuctionId: sql.Int, Action: sql.Int, Value: sql.Int },
    [], "Время аукциона изменено"
);

