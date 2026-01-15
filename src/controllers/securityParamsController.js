// controllers/securityParamsController.js
import { z } from "zod";
import { createStoredProcedureHandler } from "../utils/storedProcedureHelper.js";
import { sql } from "../config/dbMssql.js";

/* =========================
   SetFutSecurityStepPrice - Стоимость шага цены (фьючерсы)
   ========================= */
export const setFutSecurityStepPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), StepPrice: z.number() }),
    "SetFutSecurityStepPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), StepPrice: sql.Float },
    [], "Стоимость шага цены (фьючерс) установлена"
);

/* =========================
   SetOptSecurityStepPrice - Стоимость шага цены (опционы)
   ========================= */
export const setOptSecurityStepPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), StepPrice: z.number() }),
    "SetOptSecurityStepPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), StepPrice: sql.Float },
    [], "Стоимость шага цены (опцион) установлена"
);

/* =========================
   SetSpreadSecurityStepPrice - Стоимость шага цены (спреды)
   ========================= */
export const setSpreadSecurityStepPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), StepPrice: z.number() }),
    "SetSpreadSecurityStepPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), StepPrice: sql.Float },
    [], "Стоимость шага цены (спред) установлена"
);

/* =========================
   SetSecurityPrevPrice - Цена закрытия
   ========================= */
export const setSecurityPrevPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), PrevPrice: z.number() }),
    "SetSecurityPrevPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), PrevPrice: sql.Float },
    [], "Цена закрытия установлена"
);

/* =========================
   SetFutSecurityCollateral - ГО (фьючерсы)
   ========================= */
export const setFutSecurityCollateral = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), SellDepo: z.number(), BuyDepo: z.number() }),
    "SetFutSecurityCollateral",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), SellDepo: sql.Float, BuyDepo: sql.Float },
    [], "ГО (фьючерс) установлено"
);

/* =========================
   SetOptSecurityCollateral - ГО (опционы)
   ========================= */
export const setOptSecurityCollateral = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), SellDepo: z.number(), BuyDepo: z.number() }),
    "SetOptSecurityCollateral",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), SellDepo: sql.Float, BuyDepo: sql.Float },
    [], "ГО (опцион) установлено"
);

/* =========================
   SetSpreadSecurityCollateral - ГО (спреды)
   ========================= */
export const setSpreadSecurityCollateral = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), SellDepo: z.number(), BuyDepo: z.number() }),
    "SetSpreadSecurityCollateral",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), SellDepo: sql.Float, BuyDepo: sql.Float },
    [], "ГО (спред) установлено"
);

/* =========================
   SetFutSecurityClPrice - Котировка клиринга (фьючерсы)
   ========================= */
export const setFutSecurityClPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), ClPrice: z.number() }),
    "SetFutSecurityClPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), ClPrice: sql.Float },
    [], "Котировка клиринга (фьючерс) установлена"
);

/* =========================
   SetOptSecurityClPrice - Котировка клиринга (опционы)
   ========================= */
export const setOptSecurityClPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), ClPrice: z.number() }),
    "SetOptSecurityClPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), ClPrice: sql.Float },
    [], "Котировка клиринга (опцион) установлена"
);

/* =========================
   SetSpreadSecurityClPrice - Котировка клиринга (спреды)
   ========================= */
export const setSpreadSecurityClPrice = createStoredProcedureHandler(
    z.object({ ClassCode: z.string().max(12), SecCode: z.string().max(12), ClPrice: z.number() }),
    "SetSpreadSecurityClPrice",
    { ClassCode: sql.VarChar(12), SecCode: sql.VarChar(12), ClPrice: sql.Float },
    [], "Котировка клиринга (спред) установлена"
);

