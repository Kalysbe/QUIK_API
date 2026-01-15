// controllers/calendarsController.js
import { z } from "zod";
import { createStoredProcedureHandler, executeStoredProcedure, detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool, sql } from "../config/dbMssql.js";

/* =========================
   POST /api/calendars
   NewCalendar - Добавление/Изменение календаря
   ========================= */
const newCalendarSchema = z.object({
    CalendarName: z.string().max(255),
    Enabled: z.number().int().min(0).max(1),
});

const newCalendarTypeMap = {
    CalendarName: sql.NVarChar(255),
    Enabled: sql.Bit,
};

export const createCalendar = createStoredProcedureHandler(
    newCalendarSchema,
    "NewCalendar",
    newCalendarTypeMap,
    [],
    "Календарь успешно добавлен или изменён"
);

/* =========================
   POST /api/calendars/date
   NewCalendarDate - Добавление/Изменение даты календаря
   ========================= */
const newCalendarDateSchema = z.object({
    CalendarName: z.string().max(255),
    Date: z.number().int(), // ГГГГММДД
    TradeIndicator: z.number().int().min(0).max(1), // 0 - нерабочий день, 1 - рабочий день
});

const newCalendarDateTypeMap = {
    CalendarName: sql.NVarChar(255),
    Date: sql.Int,
    TradeIndicator: sql.Bit,
};

export const createCalendarDate = createStoredProcedureHandler(
    newCalendarDateSchema,
    "NewCalendarDate",
    newCalendarDateTypeMap,
    [],
    "Дата календаря успешно добавлена или изменена"
);

/* =========================
   GET /api/calendars
   GetCalendars - Получение списка календарей
   ========================= */
export const getCalendars = async (req, res, next) => {
    try {
        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => {
            infoObjects.push({
                message: info?.message ?? "",
                number: info?.number,
                state: info?.state,
                class: info?.class,
                procName: info?.procName,
                lineNumber: info?.lineNumber,
            });
        });

        const result = await request.execute("GetCalendars");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) {
            return res.status(500).json({
                success: false,
                message: "Ошибка при получении списка календарей",
                reason,
            });
        }

        return res.status(200).json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   GET /api/calendars/:calendarName
   GetCalendar - Получение всех дат календаря
   ========================= */
export const getCalendar = async (req, res, next) => {
    try {
        const calendarName = req.params.calendarName || req.body.CalendarName;
        if (!calendarName) {
            return res.status(400).json({
                success: false,
                message: "CalendarName обязателен",
            });
        }

        const pool = await getMssqlPool();
        const request = pool.request();
        const infoObjects = [];

        request.on("info", (info) => {
            infoObjects.push({
                message: info?.message ?? "",
                number: info?.number,
                state: info?.state,
                class: info?.class,
                procName: info?.procName,
                lineNumber: info?.lineNumber,
            });
        });

        request.input("CalendarName", sql.NVarChar(255), calendarName);
        const result = await request.execute("GetCalendar");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) {
            return res.status(500).json({
                success: false,
                message: "Ошибка при получении данных календаря",
                reason,
            });
        }

        return res.status(200).json({
            success: true,
            data: result.recordset ?? [],
        });
    } catch (error) {
        return next(error);
    }
};

/* =========================
   DELETE /api/calendars/date
   DelCalendarDate - Удаление даты календаря
   ========================= */
const delCalendarDateSchema = z.object({
    CalendarName: z.string().max(255),
    Date: z.number().int(), // ГГГГММДД
});

const delCalendarDateTypeMap = {
    CalendarName: sql.NVarChar(255),
    Date: sql.Int,
};

export const deleteCalendarDate = createStoredProcedureHandler(
    delCalendarDateSchema,
    "DelCalendarDate",
    delCalendarDateTypeMap,
    [],
    "Дата календаря успешно удалена"
);

/* =========================
   DELETE /api/calendars
   DelCalendar - Удаление календаря
   ========================= */
const delCalendarSchema = z.object({
    CalendarName: z.string().max(255),
});

const delCalendarTypeMap = {
    CalendarName: sql.NVarChar(255),
};

export const deleteCalendar = createStoredProcedureHandler(
    delCalendarSchema,
    "DelCalendar",
    delCalendarTypeMap,
    [],
    "Календарь успешно удалён"
);

/* =========================
   POST /api/calendars/link-to-class
   LinkCalendarToClass - Привязывание календаря к классу
   ========================= */
const linkCalendarToClassSchema = z.object({
    ClassCode: z.string().max(12),
    CalendarName: z.string().max(255),
});

const linkCalendarToClassTypeMap = {
    ClassCode: sql.VarChar(12),
    CalendarName: sql.NVarChar(255),
};

export const linkCalendarToClass = createStoredProcedureHandler(
    linkCalendarToClassSchema,
    "LinkCalendarToClass",
    linkCalendarToClassTypeMap,
    [],
    "Календарь успешно привязан к классу"
);

/* =========================
   POST /api/calendars/link-to-security
   LinkCalendarToSecurity - Привязывание календаря к инструменту
   ========================= */
const linkCalendarToSecuritySchema = z.object({
    ClassCode: z.string().max(12),
    SecCode: z.string().max(12),
    CalendarName: z.string().max(255),
});

const linkCalendarToSecurityTypeMap = {
    ClassCode: sql.VarChar(12),
    SecCode: sql.VarChar(12),
    CalendarName: sql.NVarChar(255),
};

export const linkCalendarToSecurity = createStoredProcedureHandler(
    linkCalendarToSecuritySchema,
    "LinkCalendarToSecurity",
    linkCalendarToSecurityTypeMap,
    [],
    "Календарь успешно привязан к инструменту"
);

