// src/models/MoneyLimit.js
import { DataTypes } from "sequelize";
import { pgSequelize } from "../config/sequelize.js";

const MoneyLimit = pgSequelize.define(
  "MoneyLimits",
  {
    LoadDate: { type: DataTypes.DATE },
    FirmId: { type: DataTypes.STRING(12), primaryKey: true },
    ClientCode: { type: DataTypes.STRING(12) },
    Tag: { type: DataTypes.STRING(4) },
    CurrCode: { type: DataTypes.STRING(4) },
    LimitKind: { type: DataTypes.STRING(5) },
    Leverage: { type: DataTypes.DECIMAL(19, 4) },
    LockedValueCoef: { type: DataTypes.DECIMAL(19, 4) },
    CurrentBal: { type: DataTypes.DECIMAL(28, 8) },
    CurrentLimit: { type: DataTypes.DECIMAL(28, 8) },
    Locked: { type: DataTypes.DECIMAL(19, 8) },
    OpenBal: { type: DataTypes.DECIMAL(28, 8) },
    OpenLimit: { type: DataTypes.DECIMAL(28, 8) },
    LockedMarginValue: { type: DataTypes.DECIMAL(19, 6) },
    AwgPositionPrice: { type: DataTypes.DECIMAL(19, 8) },
    OrdersCollateral: { type: DataTypes.DECIMAL(19, 8) },
    PositionsCollateral: { type: DataTypes.DECIMAL(19, 8) },
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

export default MoneyLimit;

