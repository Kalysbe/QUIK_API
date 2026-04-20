// controllers/paramsController.js
import pgPool from "../config/dbPostgres.js";

/** TradeDate в ответе API: строка dd-mm-yyyy (календарный день в POSTGRES_TIMEZONE или локали сервера Node, не UTC). */
function formatTradeDateDdMmYyyy(value) {
    if (value == null) return value;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const tz = process.env.POSTGRES_TIMEZONE;
    if (tz) {
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: tz,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).formatToParts(d);
        const day = parts.find((p) => p.type === "day")?.value ?? "";
        const month = parts.find((p) => p.type === "month")?.value ?? "";
        const year = parts.find((p) => p.type === "year")?.value ?? "";
        return `${day}-${month}-${year}`;
    }
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}-${mm}-${yyyy}`;
}

function mapRowTradeDateToDdMmYyyy(row) {
    if (!row || !Object.prototype.hasOwnProperty.call(row, "TradeDate")) return row;
    return { ...row, TradeDate: formatTradeDateDdMmYyyy(row.TradeDate) };
}

/**
 * GET /api/params
 * Возвращает список активных торгов из таблицы Params (PostgreSQL).
 * В ответе только поля: ClassCode, SecCode, status, tradingstatus.
 * Фильтры: query-параметры по имени столбца. Пример: GET /api/params?paramName=value
 */
export async function getParams(req, res, next) {
    try {
        const tableName = "Params";

        const columnsResult = await pgPool.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
            ORDER BY ordinal_position;
            `,
            [tableName]
        );

        if (columnsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Таблица "${tableName}" не найдена в схеме public`,
            });
        }

        const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
        const filters = { ...req.query };

        const conditions = [];
        const params = [];

        for (const [key, value] of Object.entries(filters)) {
            if (!columnNames.has(key)) continue;
            params.push(value);
            conditions.push(`"${key}" = $${params.length}`);
        }

        // Default behavior for active trades:
        // - only today's TradeDate
        // - only status "торгуется"
        if (!Object.prototype.hasOwnProperty.call(filters, "TradeDate") && columnNames.has("TradeDate")) {
            conditions.push(`"TradeDate"::date = CURRENT_DATE`);
        }

        if (!Object.prototype.hasOwnProperty.call(filters, "status") && columnNames.has("status")) {
            params.push("торгуется");
            conditions.push(`"status" = $${params.length}`);
        }

        const listFields = ["ClassCode", "SecCode", "status", "tradingstatus"];
        const selectedFields = listFields
            .filter((field) => columnNames.has(field))
            .map((field) => `"${field}"`)
            .join(", ");

        if (!selectedFields) {
            return res.status(400).json({
                success: false,
                message: 'В таблице "Params" отсутствуют требуемые поля для списка',
            });
        }

        const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const query = `SELECT ${selectedFields} FROM public."${tableName}"${whereClause}`;

        const result = await pgPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/params/details/:ClassCode/:SecCode
 * Возвращает один объект с полными данными из Params по паре ClassCode + SecCode
 * за последний торговый день (максимальный TradeDate).
 */
export async function getParamsDetails(req, res, next) {
    try {
        const { ClassCode, SecCode } = req.params;

        if (!ClassCode || !SecCode) {
            return res.status(400).json({
                success: false,
                message: "Path-параметры ClassCode и SecCode обязательны",
            });
        }

        const query = `
            SELECT *
            FROM public."Params"
            WHERE "ClassCode" = $1
              AND "SecCode" = $2
            ORDER BY "TradeDate" DESC NULLS LAST
            LIMIT 1
        `;

        const result = await pgPool.query(query, [String(ClassCode), String(SecCode)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Объект не найден по указанным ClassCode и SecCode",
            });
        }

        res.json(mapRowTradeDateToDdMmYyyy(result.rows[0]));
    } catch (err) {
        next(err);
    }
}

const PARAMS_TABLE = "Params";
/** TradeDate в ответе — строка DD-MM-YYYY по правилам PostgreSQL (часовой пояс сессии БД, как в pgAdmin). */
const PARAMS_OPEN_TRADING_SQL = `
    SELECT
        p."ClassCode",
        p."SecCode",
        to_char(p."TradeDate", 'DD-MM-YYYY') AS "TradeDate",
        p."status",
        p."tradingstatus"
    FROM public."${PARAMS_TABLE}" p
    WHERE p."TradeDate" = (SELECT MAX("TradeDate") FROM public."${PARAMS_TABLE}")
      AND p."status" = 'торгуется'
      AND p."tradingstatus" = 'открыта'
`;

/**
 * GET /api/params/actual
 * Актуальные Params за максимальный TradeDate при status = 'торгуется' и tradingstatus = 'открыта'.
 * В ответе: ClassCode, SecCode, TradeDate (DD-MM-YYYY), status, tradingstatus.
 */
export async function getParamsActual(req, res, next) {
    try {
        const columnsResult = await pgPool.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
            `,
            [PARAMS_TABLE]
        );

        if (columnsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Таблица "${PARAMS_TABLE}" не найдена в схеме public`,
            });
        }

        const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
        const required = ["ClassCode", "SecCode", "TradeDate", "status", "tradingstatus"];
        const missing = required.filter((c) => !columnNames.has(c));
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `В таблице "Params" отсутствуют столбцы: ${missing.join(", ")}`,
            });
        }

        const result = await pgPool.query(PARAMS_OPEN_TRADING_SQL);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/params/actual/exists
 * true, если для последнего TradeDate есть строки с status = 'торгуется' и tradingstatus = 'открыта'.
 */
export async function getParamsActualExists(req, res, next) {
    try {
        const columnsResult = await pgPool.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
            `,
            [PARAMS_TABLE]
        );

        if (columnsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Таблица "${PARAMS_TABLE}" не найдена в схеме public`,
            });
        }

        const columnNames = new Set(columnsResult.rows.map((row) => row.column_name));
        const required = ["TradeDate", "status", "tradingstatus"];
        const missing = required.filter((c) => !columnNames.has(c));
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `В таблице "Params" отсутствуют столбцы: ${missing.join(", ")}`,
            });
        }

        const existsQuery = `
            SELECT EXISTS (
                SELECT 1
                FROM public."${PARAMS_TABLE}" p
                WHERE p."TradeDate" = (SELECT MAX("TradeDate") FROM public."${PARAMS_TABLE}")
                  AND p."status" = 'торгуется'
                  AND p."tradingstatus" = 'открыта'
            ) AS "exists"
        `;
        const result = await pgPool.query(existsQuery);
        res.json(result.rows[0].exists === true);
    } catch (err) {
        next(err);
    }
}
