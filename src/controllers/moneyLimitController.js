// src/controllers/moneyLimitController.js
import MoneyLimit from "../models/MoneyLimit.js";
import { z } from "zod";
import { writeLimFile } from "../utils/limFileWriter.js";
import { runFillLimits } from "../utils/fillLimitsRunner.js";
import { filterRowsForAccess, findForeignValues } from "../services/depositoryAccess.js";
import { availableValuesFor, sendForbidden } from "../services/availableValues.js";

/* =========================
   GET /moneylimits/tags — тэги, доступные депозитарию по его ключу
   ========================= */
export async function getAvailableTags(req, res, next) {
  try {
    res.json({ success: true, data: await availableValuesFor(req.access, "money_tag") });
  } catch (err) {
    next(err);
  }
}

const moneyLimitItemSchema = z.object({
  FIRM_ID: z.union([z.string().min(1), z.number()]),
  TAG: z.string().min(1),
  CURR_CODE: z.string().min(1),
  CLIENT_CODE: z.union([z.string().min(1), z.number()]),
  LIMIT_KIND: z.union([z.string().min(1), z.number()]),
  OPEN_BALANCE: z.union([z.string().min(1), z.number()]),
  OPEN_LIMIT: z.union([z.string().min(1), z.number()]),
  LEVERAGE: z.union([z.string().min(1), z.number()]),
});

const moneyLimitArraySchema = z.array(moneyLimitItemSchema).min(1);

function formatMoneyLimitLine(item) {
  return (
    `MONEY: FIRM_ID = ${String(item.FIRM_ID)}; ` +
    `TAG = ${item.TAG}; ` +
    `CURR_CODE = ${item.CURR_CODE}; ` +
    `CLIENT_CODE = ${String(item.CLIENT_CODE)}; ` +
    `LIMIT_KIND = ${String(item.LIMIT_KIND)}; ` +
    `OPEN_BALANCE = ${String(item.OPEN_BALANCE)}; ` +
    `OPEN_LIMIT = ${String(item.OPEN_LIMIT)}; ` +
    `LEVERAGE = ${String(item.LEVERAGE)};`
  );
}

/* =========================
   GET /moneylimits
   ========================= */
export async function getMoneyLimits(req, res, next) {
  try {
    const { firmId } = req.query;
    const options = {
      raw: true,
      order: [["FirmId", "ASC"]],
    };
    if (firmId != null && String(firmId).trim() !== "") {
      options.where = { FirmId: String(firmId).trim() };
    }
    const moneyLimits = await MoneyLimit.findAll(options);
    res.json(filterRowsForAccess(req.access, moneyLimits, "money_tag", "Tag"));
  } catch (err) {
    next(err);
  }
}

/* =========================
   POST /moneylimits
   ========================= */
export async function createMoneyLimitsFile(req, res, next) {
  try {
    const parsed = moneyLimitArraySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors: (parsed.error?.issues || []).map((e) => ({
          field: e.path?.join(".") || "",
          message: e.message || "Ошибка валидации",
        })),
      });
    }

    const foreignTags = findForeignValues(
      req.access,
      "money_tag",
      parsed.data.map((item) => item.TAG)
    );
    if (foreignTags.length > 0) {
      return sendForbidden(res, req.access, "money_tag", foreignTags, "Файл не сформирован.");
    }

    const lines = parsed.data.map(formatMoneyLimitLine);
    const { filePath, fileName } = await writeLimFile(lines, "money");
    const fillLimits = await runFillLimits(fileName);

    if (fillLimits.error || fillLimits.exitCode !== 0) {
      return res.status(500).json({
        success: false,
        fileName,
        outputLog: fillLimits.outputLog ?? "",
      });
    }

    return res.status(200).json({
      success: true,
      fileName,
      outputLog: fillLimits.outputLog ?? "",
    });
  } catch (err) {
    return next(err);
  }
}

