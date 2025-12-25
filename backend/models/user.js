"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    role: { type: sequelize_1.DataTypes.ENUM('admin', 'supplier', 'customer'), allowNull: false, defaultValue: "customer" }
}, {
    sequelize: db_1.default,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const bcrypt = require('bcrypt');
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const bcrypt = require('bcrypt');
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});
//# sourceMappingURL=user.js.map