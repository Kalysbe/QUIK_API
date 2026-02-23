// controllers/currencyInfoController.js
import pgPool from "../config/dbPostgres.js";

/**
 * GET /api/currency-info
 * Возвращает данные из таблицы CurrencyInfo (PostgreSQL).
 * Поля: TradeDate, CurrCode, CurrFullName.
 * Фильтрация по любому столбцу через query-параметры.
 */
export async function getCurrencyInfo(req, res, next) {
    try {
        const tableName = "CurrencyInfo";

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

        const outputFields = ["TradeDate", "CurrCode", "CurrFullName"].filter((c) =>
            columnNames.has(c)
        );
        const selectCols =
            outputFields.length > 0
                ? outputFields.map((c) => `"${c}"`).join(", ")
                : "*";

        const filters = { ...req.query };

        const conditions = [];
        const params = [];

        for (const [key, value] of Object.entries(filters)) {
            if (!columnNames.has(key)) continue;
            params.push(value);
            conditions.push(`"${key}" = $${params.length}`);
        }

        const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const orderCol = columnNames.has("TradeDate")
            ? '"TradeDate"'
            : columnNames.has("CurrCode")
              ? '"CurrCode"'
              : null;
        const orderClause = orderCol ? ` ORDER BY ${orderCol} DESC` : "";
        const query = `SELECT ${selectCols} FROM public."${tableName}"${whereClause}${orderClause}`;

        const result = await pgPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}
