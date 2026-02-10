// controllers/paramsController.js
import pgPool from "../config/dbPostgres.js";

/**
 * GET /api/params
 * Возвращает данные из таблицы Params (PostgreSQL) с фильтрацией по всем столбцам.
 * Фильтры: query-параметры по имени столбца или JSON в параметре filters.
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

        let filtersFromParam = {};
        if (req.query.filters !== undefined) {
            if (typeof req.query.filters === "string") {
                try {
                    const parsed = JSON.parse(req.query.filters);
                    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                        filtersFromParam = parsed;
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: "Параметр filters должен быть объектом или JSON-строкой объекта",
                        });
                    }
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Не удалось распарсить JSON в параметре filters",
                    });
                }
            } else if (typeof req.query.filters === "object") {
                filtersFromParam = req.query.filters;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Параметр filters должен быть объектом или JSON-строкой объекта",
                });
            }
        }

        const directFilters = { ...req.query };
        delete directFilters.filters;

        const combinedFilters = { ...directFilters, ...filtersFromParam };

        const conditions = [];
        const params = [];

        for (const [key, value] of Object.entries(combinedFilters)) {
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
