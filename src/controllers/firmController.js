// src/controllers/firmController.js
import Firm from "../models/Firm.js";

/* =========================
   GET /firms
   ========================= */
export async function getFirms(req, res, next) {
  try {
    const firms = await Firm.findAll({
      raw: true, // Возвращает все столбцы как сырые данные
      order: [["FirmId", "ASC"]],
    });
    res.json(firms);
  } catch (err) {
    next(err);
  }
}

