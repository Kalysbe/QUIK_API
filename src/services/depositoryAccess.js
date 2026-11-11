// Правила принадлежности данных депозитариям.
// Чистые функции без обращения к БД — правила передаются параметром.

export const RESOURCES = {
  depo_account: { label: "Торговый счёт (DepoLimits.Trdacc)" },
  money_tag: { label: "Тэг (MoneyLimits.Tag)" },
  trade_class: { label: "Класс (Trades.ClassCode)" },
};

export const MATCH_TYPES = ["exact", "prefix", "contains", "default"];

export function normalizeValue(value) {
  return String(value ?? "").trim().toUpperCase();
}

function matchScore(rule, value) {
  const ruleValue = normalizeValue(rule.value);
  switch (rule.match_type) {
    case "exact":
      return value === ruleValue ? 3_000_000 : -1;
    case "prefix":
      return ruleValue && value.startsWith(ruleValue) ? 2_000_000 + ruleValue.length : -1;
    case "contains":
      return ruleValue && value.includes(ruleValue) ? 1_000_000 + ruleValue.length : -1;
    case "default":
      return 0;
    default:
      return -1;
  }
}

/**
 * Возвращает id депозитария-владельца значения или null.
 * Побеждает самое конкретное правило: exact > prefix > contains > default
 * (внутри prefix/contains — более длинное значение).
 * Если два депозитария совпали с одинаковой конкретностью — владельца нет (никто не видит).
 * Пустое значение не принадлежит никому.
 * Учитываются правила и неактивных депозитариев, чтобы их данные не "перетекали" в default.
 */
export function resolveOwner(rules, resource, rawValue) {
  const value = normalizeValue(rawValue);
  if (!value) return null;

  let owner = null;
  let bestScore = -1;
  let tie = false;

  for (const rule of rules) {
    if (rule.resource !== resource) continue;
    const score = matchScore(rule, value);
    if (score < 0) continue;
    if (score > bestScore) {
      bestScore = score;
      owner = rule.depository_id;
      tie = false;
    } else if (score === bestScore && rule.depository_id !== owner) {
      tie = true;
    }
  }

  return tie ? null : owner;
}

/**
 * Оставляет только строки, принадлежащие депозитарию из req.access.
 * Администратор видит всё.
 */
export function filterRowsForAccess(access, rows, resource, field) {
  if (!access) {
    throw new Error("filterRowsForAccess: нет контекста доступа (не подключён depositoryAuth)");
  }
  if (access.isAdmin) return rows;
  const depositoryId = access.depository.id;
  return rows.filter((row) => resolveOwner(access.rules, resource, row[field]) === depositoryId);
}

/**
 * Возвращает уникальные значения, которые НЕ принадлежат депозитарию (для проверки записи).
 */
export function findForeignValues(access, resource, values) {
  if (!access) {
    throw new Error("findForeignValues: нет контекста доступа (не подключён depositoryAuth)");
  }
  if (access.isAdmin) return [];
  const depositoryId = access.depository.id;
  const foreign = new Set();
  for (const value of values) {
    if (resolveOwner(access.rules, resource, value) !== depositoryId) {
      foreign.add(String(value ?? ""));
    }
  }
  return [...foreign];
}
