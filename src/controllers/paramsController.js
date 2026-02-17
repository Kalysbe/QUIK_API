// controllers/paramsController.js
import pgPool from "../config/dbPostgres.js";

/**
 * GET /api/params
 * Возвращает данные из таблицы Params (PostgreSQL) с фильтрацией по всем столбцам.
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

        const whereClause = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const query = `SELECT * FROM public."${tableName}"${whereClause}`;

        const result = await pgPool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}
