// src/controllers/moneyLimitController.js
import MoneyLimit from "../models/MoneyLimit.js";

/* =========================
   GET /moneylimits
   ========================= */
export async function getMoneyLimits(req, res, next) {
  try {
    const moneyLimits = await MoneyLimit.findAll({
      raw: true, // Возвращает все столбцы как сырые данные
      order: [["FirmId", "ASC"]],
    });
    res.json(moneyLimits);
  } catch (err) {
    next(err);
  }
}

