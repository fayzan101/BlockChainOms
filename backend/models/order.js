"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const user_1 = require("./user");
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    items: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    status: { type: sequelize_1.DataTypes.STRING, allowNull: false, defaultValue: "pending" } // pending, shipped, delivered
}, {
    sequelize: db_1.default,
    modelName: "Order",
    tableName: "orders",
    timestamps: true
});
// Define relationship
user_1.User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(user_1.User, { foreignKey: "userId" });
//# sourceMappingURL=order.js.map