const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const { User } = require("./models/user");
const { Order } = require("./models/order");

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

// Test route
app.get("/api/ping", (req, res) => {
	res.send("pong");
});

// Sync DB
try {
	sequelize.sync({ alter: true })
		.then(() => console.log("Database synced successfully"))
		.catch(err => {
			console.error("Error syncing database:", err);
			if (err && typeof err === 'object') {
				console.error("Error details:", JSON.stringify(err, null, 2));
			}
		});
} catch (err) {
	console.error("Sync DB threw:", err);
	if (err && typeof err === 'object') {
		console.error("Error details:", JSON.stringify(err, null, 2));
	}
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const { User } = require("./models/user");
const { Order } = require("./models/order");

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

// Test route
app.get("/api/ping", (req, res) => {
	res.send("pong");
});

// Sync DB
try {
	sequelize.sync({ alter: true })
		.then(() => console.log("Database synced successfully"))
		.catch(err => {
			console.error("Error syncing database:", err);
			if (err && typeof err === 'object') {
				console.error("Error details:", JSON.stringify(err, null, 2));
			}
		});
} catch (err) {
	console.error("Sync DB threw:", err);
	if (err && typeof err === 'object') {
		console.error("Error details:", JSON.stringify(err, null, 2));
	}
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
