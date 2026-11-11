// Какие счета, тэги и классы доступны депозитарию по его ключу,
// и единый формат ответа 403, когда в запросе чужие значения.
import { normalizeValue, resolveOwner } from "./depositoryAccess.js";
import { listAccounts, listClasses, listTags } from "../repositories/depositoriesRepository.js";

const SOURCES = {
  depo_account: async () => listAccounts(),
  money_tag: async () => (await listTags()).map((t) => t.code),
  trade_class: async () => (await listClasses()).map((c) => c.code),
};

/** Сколько значений перечислять в тексте сообщения (полный список — в отдельном поле). */
const MESSAGE_LIMIT = 20;

/**
 * Значения ресурса, которые принадлежат депозитарию из access (администратору — все).
 * Кандидаты: значения из таблиц БД плюс точные значения из правил
 * (чтобы был виден и тэг/счёт, по которому ещё нет данных).
 */
export async function availableValuesFor(access, resource) {
  // ключ — нормализованное значение (для сравнения), значение — как записано в БД
  const candidates = new Map();
  const add = (raw) => {
    const key = normalizeValue(raw);
    if (key && !candidates.has(key)) candidates.set(key, String(raw).trim());
  };
  (await SOURCES[resource]()).forEach(add);
  const rules = access.isAdmin ? [] : access.rules;
  for (const rule of rules) {
    if (rule.resource === resource && rule.match_type === "exact") add(rule.value);
  }
  return [...candidates.values()]
    .filter((v) => access.isAdmin || resolveOwner(access.rules, resource, v) === access.depository.id)
    .sort();
}

const WORDS = {
  depo_account: {
    one: "Торговый счёт", many: "Торговые счета", available: "Доступные вам счета",
    none: "ни одного торгового счёта", error: "FORBIDDEN_ACCOUNT", field: "accounts", availableField: "available_accounts",
  },
  money_tag: {
    one: "Тэг", many: "Тэги", available: "Доступные вам тэги",
    none: "ни одного тэга", error: "FORBIDDEN_TAG", field: "tags", availableField: "available_tags",
  },
  trade_class: {
    one: "Класс", many: "Классы", available: "Доступные вам классы",
    none: "ни одного класса", error: "FORBIDDEN_CLASS", field: "classes", availableField: "available_classes",
  },
};

function listForMessage(values) {
  if (values.length <= MESSAGE_LIMIT) return values.join(", ");
  return `${values.slice(0, MESSAGE_LIMIT).join(", ")} и ещё ${values.length - MESSAGE_LIMIT}`;
}

/** Отправляет 403: какие значения чужие и какие доступны. */
export async function sendForbidden(res, access, resource, foreign, suffix = "") {
  const w = WORDS[resource];
  const available = await availableValuesFor(access, resource);
  const notOwned =
    foreign.length === 1
      ? `${w.one} ${foreign[0]} не принадлежит вашему депозитарию.`
      : `${w.many} ${listForMessage(foreign)} не принадлежат вашему депозитарию.`;
  const availableText = available.length
    ? `${w.available}: ${listForMessage(available)}.`
    : `За вашим депозитарием пока не закреплено ${w.none} — обратитесь к бирже.`;
  return res.status(403).json({
    success: false,
    message: [notOwned, availableText, suffix].filter(Boolean).join(" "),
    error: w.error,
    [w.field]: foreign,
    [w.availableField]: available,
  });
}
