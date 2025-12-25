const { DataTypes, Model } = require('sequelize');
const db = require('../config/db');

class Product extends Model {}

Product.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  createdBy: { type: DataTypes.INTEGER, allowNull: false }, // userId
}, {
  sequelize: db,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true
});

module.exports = { Product };