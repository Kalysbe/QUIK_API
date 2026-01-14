// src/models/Firm.js
import { DataTypes } from "sequelize";
import { pgSequelize } from "../config/sequelize.js";

const Firm = pgSequelize.define(
  "Firms",
  {
    Exchange: { type: DataTypes.STRING(12) },
    FirmId: { type: DataTypes.STRING(12), primaryKey: true },
    FirmName: { type: DataTypes.STRING(128) },
    Status: { type: DataTypes.STRING(20) },
    StatusFlag: { type: DataTypes.INTEGER },
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

export default Firm;

