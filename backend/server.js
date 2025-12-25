"use strict";
// ...existing code...
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
// const sequelize = require("./config/db");
// const { User } = require("./models/user");
// const { Order } = require("./models/order");
// Global error handlers for better diagnostics
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Register routes after app is initialized
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get("/api/ping", (req, res) => {
    res.send("pong");
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Prisma handles DB schema via migration, no sync needed
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map