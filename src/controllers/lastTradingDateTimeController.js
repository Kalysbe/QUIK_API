// controllers/lastTradingDateTimeController.js
import { detectSpFailure } from "../utils/storedProcedureHelper.js";
import { getMssqlPool } from "../config/dbMssql.js";

/* =========================
   GET /api/last-trading-date-time
   GetLastTradingDateTime - Получение даты и времени последней транзакции
   ========================= */
export const getLastTradingDateTime = async (req, res, next) => {
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

        const result = await request.execute("GetLastTradingDateTime");
        const { spFailed, reason } = detectSpFailure(result, infoObjects);

        if (spFailed) {
            return res.status(500).json({
                success: false,
                message: "Ошибка при получении даты и времени последней транзакции",
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

