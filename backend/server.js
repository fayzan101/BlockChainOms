"use strict";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blockchain OMS API',
            version: '1.0.0',
            description: 'API documentation for Blockchain Order Management System',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
dotenv.config();
const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many login/register attempts, please try again later.'
});
app.use('/api/auth', authLimiter);



app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);


app.get("/api/ping", (req, res) => {
    res.send("pong");
});


app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}\nSwagger docs at http://localhost:${PORT}/api-docs`));
