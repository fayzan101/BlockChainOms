import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { User } from "./user";

export class Order extends Model {}

Order.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    items: { type: DataTypes.JSONB, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" } // pending, shipped, delivered
}, {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true
});

// Define relationship
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });
