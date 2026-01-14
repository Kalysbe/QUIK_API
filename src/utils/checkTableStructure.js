// src/utils/checkTableStructure.js
import pgPool from "../config/dbPostgres.js";

/**
 * Получает структуру таблицы из PostgreSQL
 * @param {string} tableName - Имя таблицы
 * @param {string} schema - Схема (по умолчанию 'public')
 * @returns {Promise<Array>} Массив объектов с информацией о столбцах
 */
export async function getTableStructure(tableName, schema = 'public') {
  try {
    const query = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = $2
      ORDER BY ordinal_position;
    `;
    
    const result = await pgPool.query(query, [schema, tableName]);
    return result.rows;
  } catch (error) {
    console.error(`Ошибка при получении структуры таблицы ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Выводит структуру всех указанных таблиц
 */
export async function checkTables() {
  const tables = ['Firms', 'DepoLimits', 'MoneyLimits', 'Trdaccs'];
  
  console.log('\n🔍 Проверка структуры таблиц PostgreSQL...\n');
  
  for (const tableName of tables) {
    try {
      console.log(`\n📋 Таблица: ${tableName}`);
      console.log('─'.repeat(80));
      
      const columns = await getTableStructure(tableName);
      
      if (columns.length === 0) {
        console.log(`⚠️  Таблица "${tableName}" не найдена или пуста`);
      } else {
        console.log('Столбцы:');
        columns.forEach((col, index) => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`  ${index + 1}. ${col.column_name} - ${col.data_type}${length} ${nullable}${defaultVal}`);
        });
      }
    } catch (error) {
      console.error(`❌ Ошибка при проверке таблицы ${tableName}:`, error.message);
    }
  }
  
  console.log('\n✅ Проверка завершена\n');
}

// Если запускается напрямую
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  checkTables()
    .then(() => {
      pgPool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Критическая ошибка:', err);
      pgPool.end();
      process.exit(1);
    });
}

