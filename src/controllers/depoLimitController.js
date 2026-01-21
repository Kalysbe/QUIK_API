// src/controllers/depoLimitController.js
import DepoLimit from "../models/DepoLimit.js";
import { z } from "zod";
import { writeLimFile } from "../utils/limFileWriter.js";
import { runFillLimits } from "../utils/fillLimitsRunner.js";

const depoLimitItemSchema = z.object({
  FIRM_ID: z.union([z.string().min(1), z.number()]),
  SECCODE: z.string().min(1),
  CLIENT_CODE: z.union([z.string().min(1), z.number()]),
  LIMIT_KIND: z.union([z.string().min(1), z.number()]),
  OPEN_BALANCE: z.union([z.string().min(1), z.number()]),
  OPEN_LIMIT: z.union([z.string().min(1), z.number()]),
  TRDACCID: z.string().min(1),
});

const depoLimitArraySchema = z.array(depoLimitItemSchema).min(1);

function formatDepoLimitLine(item) {
  return (
    `DEPO: FIRM_ID = ${String(item.FIRM_ID)}; ` +
    `SECCODE = ${item.SECCODE}; ` +
    `CLIENT_CODE = ${String(item.CLIENT_CODE)}; ` +
    `LIMIT_KIND = ${String(item.LIMIT_KIND)}; ` +
    `OPEN_BALANCE = ${String(item.OPEN_BALANCE)}; ` +
    `OPEN_LIMIT = ${String(item.OPEN_LIMIT)}; ` +
    `TRDACCID = ${item.TRDACCID};`
  );
}

/* =========================
   GET /depolimits
   ========================= */
export async function getDepoLimits(req, res, next) {
  try {
    const depoLimits = await DepoLimit.findAll({
      raw: true, // Возвращает все столбцы как сырые данные
      order: [["FirmId", "ASC"]],
    });
    res.json(depoLimits);
  } catch (err) {
    next(err);
  }
}

/* =========================
   POST /depolimits
   ========================= */
export async function createDepoLimitsFile(req, res, next) {
  try {
    const parsed = depoLimitArraySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors:
          parsed.error?.errors?.map((e) => ({
            field: e.path?.join(".") || "",
            message: e.message || "Ошибка валидации",
          })) || [{ message: "Ошибка валидации данных" }],
      });
    }

    const lines = parsed.data.map(formatDepoLimitLine);
    const { filePath, fileName } = await writeLimFile(lines, "depo");
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

