// src/controllers/trdaccController.js
import Trdacc from "../models/Trdacc.js";
import { Op } from "sequelize";

/* =========================
   GET /trdaccs
   Фильтрация по FirmId через query параметр
   ========================= */
export async function getTrdaccs(req, res, next) {
  try {
    const { FirmId } = req.query;
    
    const whereClause = {};
    if (FirmId) {
      whereClause.FirmId = FirmId;
    }

    const trdaccs = await Trdacc.findAll({
      where: whereClause,
      raw: true, // Возвращает все столбцы как сырые данные
      order: [["FirmId", "ASC"]],
    });
    
    res.json(trdaccs);
  } catch (err) {
    next(err);
  }
}

