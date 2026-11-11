// src/controllers/adminController.js
// Управление депозитариями, их API-ключами и правилами принадлежности данных.
import { z } from "zod";
import * as repo from "../repositories/depositoriesRepository.js";
import { MATCH_TYPES, RESOURCES, resolveOwner } from "../services/depositoryAccess.js";

function validationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Ошибка валидации данных",
    errors: (error?.issues || []).map((e) => ({
      field: e.path?.join(".") || "",
      message: e.message || "Ошибка валидации",
    })),
  });
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ success: false, message: "Некорректный id" });
    return null;
  }
  return id;
}

function notFound(res, what = "Депозитарий") {
  return res.status(404).json({ success: false, message: `${what} не найден` });
}

function isUniqueViolation(err) {
  return err?.code === "23505";
}

/* ---------- Депозитарии ---------- */

export async function listDepositories(req, res, next) {
  try {
    res.json({ success: true, data: await repo.listDepositories() });
  } catch (err) {
    next(err);
  }
}

const createDepositorySchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(200),
});

export async function createDepository(req, res, next) {
  try {
    const parsed = createDepositorySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const { depository, apiKey } = await repo.createDepository(parsed.data.name);
    res.status(201).json({
      success: true,
      message: "Депозитарий создан. Сохраните ключ — повторно он не показывается.",
      data: depository,
      api_key: apiKey,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ success: false, message: "Депозитарий с таким названием уже есть" });
    }
    next(err);
  }
}

const updateDepositorySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.is_active !== undefined, "Нечего обновлять");

export async function updateDepository(req, res, next) {
  try {
    const id = parseId(req, res);
    if (!id) return;
    const parsed = updateDepositorySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const depository = await repo.updateDepository(id, parsed.data);
    if (!depository) return notFound(res);
    res.json({ success: true, data: depository });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ success: false, message: "Депозитарий с таким названием уже есть" });
    }
    next(err);
  }
}

export async function regenerateKey(req, res, next) {
  try {
    const id = parseId(req, res);
    if (!id) return;
    const result = await repo.regenerateApiKey(id);
    if (!result) return notFound(res);
    res.json({
      success: true,
      message: "Выпущен новый ключ, старый больше не действует. Сохраните ключ — повторно он не показывается.",
      data: result.depository,
      api_key: result.apiKey,
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeKey(req, res, next) {
  try {
    const id = parseId(req, res);
    if (!id) return;
    const depository = await repo.revokeApiKey(id);
    if (!depository) return notFound(res);
    res.json({ success: true, message: "Ключ отозван", data: depository });
  } catch (err) {
    next(err);
  }
}

export async function deleteDepository(req, res, next) {
  try {
    const id = parseId(req, res);
    if (!id) return;
    if (!(await repo.deleteDepository(id))) return notFound(res);
    res.json({ success: true, message: "Депозитарий и его правила удалены" });
  } catch (err) {
    next(err);
  }
}

/* ---------- Правила ---------- */

export async function listRules(req, res, next) {
  try {
    res.json({ success: true, data: await repo.listRules() });
  } catch (err) {
    next(err);
  }
}

const createRuleSchema = z
  .object({
    depository_id: z.number().int().positive(),
    resource: z.enum(Object.keys(RESOURCES)),
    match_type: z.enum(MATCH_TYPES),
    value: z.string().trim().max(100).optional().default(""),
  })
  .refine((v) => v.match_type === "default" || v.value.length > 0, {
    message: "Укажите значение",
    path: ["value"],
  });

export async function createRule(req, res, next) {
  try {
    const parsed = createRuleSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    const depository = await repo.getDepositoryById(parsed.data.depository_id);
    if (!depository) return notFound(res);
    const rule = await repo.createRule(parsed.data);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({
        success: false,
        message: "Такое правило уже назначено (значение может принадлежать только одному депозитарию)",
      });
    }
    next(err);
  }
}

export async function deleteRule(req, res, next) {
  try {
    const id = parseId(req, res);
    if (!id) return;
    if (!(await repo.deleteRule(id))) return notFound(res, "Правило");
    res.json({ success: true, message: "Правило удалено" });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/classes — список классов для галочек в админке. */
export async function listClasses(req, res, next) {
  try {
    res.json({ success: true, data: await repo.listClasses() });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/tags — список тэгов для галочек в админке. */
export async function listTags(req, res, next) {
  try {
    res.json({ success: true, data: await repo.listTags() });
  } catch (err) {
    next(err);
  }
}

/* ---------- Проверка и покрытие ---------- */

/** GET /api/admin/coverage — кому принадлежит каждое значение из исходных таблиц. */
export async function getCoverage(req, res, next) {
  try {
    const [rules, depositories, values] = await Promise.all([
      repo.listRules(),
      repo.listDepositories(),
      repo.listSourceValues(),
    ]);
    const names = new Map(depositories.map((d) => [d.id, d.name]));
    const data = {};
    for (const [resource, list] of Object.entries(values)) {
      data[resource] = list.map((value) => {
        const owner = resolveOwner(rules, resource, value);
        return { value, depository_id: owner, depository_name: owner ? names.get(owner) : null };
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/resolve?resource=depo_account&value=1-3101-83 */
export async function resolveValue(req, res, next) {
  try {
    const { resource, value } = req.query;
    if (!RESOURCES[resource]) {
      return res.status(400).json({ success: false, message: "Неизвестный resource" });
    }
    const [rules, depositories] = await Promise.all([repo.listRules(), repo.listDepositories()]);
    const owner = resolveOwner(rules, resource, value);
    const depository = depositories.find((d) => d.id === owner) ?? null;
    res.json({ success: true, data: { resource, value: value ?? "", depository } });
  } catch (err) {
    next(err);
  }
}
