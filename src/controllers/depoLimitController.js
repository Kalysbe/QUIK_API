// src/controllers/depoLimitController.js
import DepoLimit from "../models/DepoLimit.js";

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

