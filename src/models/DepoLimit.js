// src/models/DepoLimit.js
import { DataTypes } from "sequelize";
import { pgSequelize } from "../config/sequelize.js";

const DepoLimit = pgSequelize.define(
  "DepoLimits",
  {
    LoadDate: { type: DataTypes.DATE },
    FirmId: { type: DataTypes.STRING(12), primaryKey: true },
    ClientCode: { type: DataTypes.STRING(12) },
    SecCode: { type: DataTypes.STRING(12) },
    Trdacc: { type: DataTypes.STRING(12) },
    LimitKind: { type: DataTypes.STRING(5) },
    LockedBuy: { type: DataTypes.DECIMAL(28, 8) },
    LockedBuyValue: { type: DataTypes.DECIMAL(28, 8) },
    LockedSellValue: { type: DataTypes.DECIMAL(28, 8) },
    CurrentBal: { type: DataTypes.DECIMAL(28, 8) },
    CurrentLimit: { type: DataTypes.DECIMAL(28, 8) },
    LockedSell: { type: DataTypes.DECIMAL(28, 8) },
    OpenBal: { type: DataTypes.DECIMAL(28, 8) },
    OpenLimit: { type: DataTypes.DECIMAL(28, 8) },
    AwgPositionPrice: { type: DataTypes.DECIMAL(19, 8) },
    WAPositionPriceCurrency: { type: DataTypes.STRING(4) },
    WAPositionPriceCurrencyAsIs: { type: DataTypes.STRING(4) },
  },
  {
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    id: false,
    hasPrimaryKey: true,
  }
);

export default DepoLimit;

