import { createHash, randomBytes } from "crypto";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pgPool from "../config/dbPostgres.js";

const SCHEMA_PATH = join(dirname(fileURLToPath(import.meta.url)), "../../sql/create_depositories.sql");

export function hashApiKey(key) {
  return createHash("sha256").update(String(key), "utf8").digest("hex");
}

function generateApiKey() {
  return `dep_${randomBytes(24).toString("base64url")}`;
}

/** Создаёт таблицы депозитариев, если их нет (идемпотентно). */
export async function ensureDepositorySchema() {
  const sql = await readFile(SCHEMA_PATH, "utf8");
  await pgPool.query(sql);
}

const DEPOSITORY_COLUMNS = `
  d.id, d.name, d.is_active, d.api_key_hint,
  (d.api_key_hash IS NOT NULL) AS has_key,
  d.created_at, d.updated_at
`;

export async function listDepositories() {
  const result = await pgPool.query(`
    SELECT ${DEPOSITORY_COLUMNS},
      (SELECT COUNT(*)::int FROM depository_rules r WHERE r.depository_id = d.id) AS rules_count
    FROM depositories d
    ORDER BY d.id
  `);
  return result.rows;
}

export async function getDepositoryById(id) {
  const result = await pgPool.query(`SELECT ${DEPOSITORY_COLUMNS} FROM depositories d WHERE d.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findDepositoryByApiKey(key) {
  const result = await pgPool.query(
    `SELECT ${DEPOSITORY_COLUMNS} FROM depositories d WHERE d.api_key_hash = $1`,
    [hashApiKey(key)]
  );
  return result.rows[0] ?? null;
}

/** Создаёт депозитарий и сразу выпускает ключ. Ключ возвращается один раз. */
export async function createDepository(name) {
  const apiKey = generateApiKey();
  const result = await pgPool.query(
    `INSERT INTO depositories (name, api_key_hash, api_key_hint)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [name, hashApiKey(apiKey), apiKey.slice(-4)]
  );
  const depository = await getDepositoryById(result.rows[0].id);
  return { depository, apiKey };
}

export async function updateDepository(id, { name, is_active }) {
  const result = await pgPool.query(
    `UPDATE depositories
     SET name = COALESCE($2, name),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, name ?? null, typeof is_active === "boolean" ? is_active : null]
  );
  return result.rowCount ? getDepositoryById(id) : null;
}

/** Выпускает новый ключ; старый перестаёт работать сразу. */
export async function regenerateApiKey(id) {
  const apiKey = generateApiKey();
  const result = await pgPool.query(
    `UPDATE depositories
     SET api_key_hash = $2, api_key_hint = $3, updated_at = NOW()
     WHERE id = $1`,
    [id, hashApiKey(apiKey), apiKey.slice(-4)]
  );
  return result.rowCount ? { depository: await getDepositoryById(id), apiKey } : null;
}

/** Отзывает ключ без выпуска нового. */
export async function revokeApiKey(id) {
  const result = await pgPool.query(
    `UPDATE depositories
     SET api_key_hash = NULL, api_key_hint = NULL, updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
  return result.rowCount ? getDepositoryById(id) : null;
}

export async function deleteDepository(id) {
  const result = await pgPool.query(`DELETE FROM depositories WHERE id = $1`, [id]);
  return result.rowCount > 0;
}

export async function listRules() {
  const result = await pgPool.query(`
    SELECT r.id, r.depository_id, d.name AS depository_name, r.resource, r.match_type, r.value, r.created_at
    FROM depository_rules r
    JOIN depositories d ON d.id = r.depository_id
    ORDER BY r.resource, r.match_type, r.value
  `);
  return result.rows;
}

export async function createRule({ depository_id, resource, match_type, value }) {
  const result = await pgPool.query(
    `INSERT INTO depository_rules (depository_id, resource, match_type, value)
     VALUES ($1, $2, $3, $4)
     RETURNING id, depository_id, resource, match_type, value, created_at`,
    [depository_id, resource, match_type, match_type === "default" ? "" : value]
  );
  return result.rows[0];
}

export async function deleteRule(id) {
  const result = await pgPool.query(`DELETE FROM depository_rules WHERE id = $1`, [id]);
  return result.rowCount > 0;
}

/** Классы из справочника Classes. */
export async function listClasses() {
  const result = await pgPool.query(`
    SELECT "ClassCode" AS code, MAX("ClassName") AS name
    FROM public."Classes"
    WHERE "ClassCode" IS NOT NULL AND "ClassCode" <> ''
    GROUP BY "ClassCode"
    ORDER BY "ClassCode"
  `);
  return result.rows;
}

/** Стандартные тэги денежных позиций — показываются всегда, даже если позиций с ними ещё нет. */
const KNOWN_TAGS = ["EQTV", "FX", "BRCL"];

/** Тэги: стандартные плюс встречающиеся в MoneyLimits. */
export async function listTags() {
  const result = await pgPool.query(
    `SELECT DISTINCT UPPER(TRIM("Tag")) AS v FROM public."MoneyLimits" WHERE "Tag" IS NOT NULL AND TRIM("Tag") <> ''`
  );
  const tags = new Set(KNOWN_TAGS);
  for (const row of result.rows) tags.add(row.v);
  return [...tags].sort().map((code) => ({ code, name: null }));
}

/** Торговые счета из DepoLimits и справочника Trdaccs. */
export async function listAccounts() {
  const result = await pgPool.query(`
    SELECT v FROM (
      SELECT DISTINCT "Trdacc" AS v FROM public."DepoLimits"
      UNION
      SELECT DISTINCT "TrdAccId" AS v FROM public."Trdaccs"
    ) s WHERE v IS NOT NULL AND v <> '' ORDER BY v
  `);
  return result.rows.map((r) => r.v);
}

/** Уникальные значения из исходных таблиц — для экрана "Покрытие" в админке. */
export async function listSourceValues() {
  const [accounts, tags, classes] = await Promise.all([listAccounts(), listTags(), listClasses()]);
  return {
    depo_account: accounts,
    money_tag: tags.map((r) => r.code),
    trade_class: classes.map((r) => r.code),
  };
}
