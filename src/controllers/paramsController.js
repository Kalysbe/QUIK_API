// controllers/paramsController.js
import pgPool from "../config/dbPostgres.js";

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

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}
