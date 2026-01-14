import pgPool from "../config/dbPostgres.js";

export async function getInstruments() {
    try {
        console.log("🔍 Получаем инструменты из PostgreSQL...");
        const result = await pgPool.query('SELECT * FROM public."Securities"');
    console.log(`✅ Найдено ${result.rows.length} инструментов`);
        return result.rows;
    } catch (error) {
        console.error("❌ Ошибка при получении инструментов:", error.message);
        // если хочешь видеть полную ошибку (включая stacktrace)
        // console.error(error);
        return [];
    }
}
