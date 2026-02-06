Absolutely! Here’s **Day 2 backend + database setup boilerplate code** in a ready-to-paste format for your TypeScript project. This includes:

* PostgreSQL connection
* Sequelize models (`User` & `Order`)
* Express server
* JWT authentication middleware

You can paste these files directly into your project.

---

## **1️⃣ `.env`**

```env
DB_NAME=blockchain_oms
DB_USER=postgres
DB_PASSWORD=secret
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## **2️⃣ `backend/config/db.ts`**

```typescript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        logging: false
    }
);

export default sequelize;
```

---

## **3️⃣ `backend/models/user.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class User extends Model {}

User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "customer" } // customer/admin/vendor
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true
});
```

---

## **4️⃣ `backend/models/order.ts`**

```typescript
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


User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });
```

---

## **5️⃣ `backend/middleware/auth.ts`**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
```

---

## **6️⃣ `backend/server.ts`**

```typescript
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db";
import { User } from "./models/user";
import { Order } from "./models/order";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());


app.get("/api/ping", (req: Request, res: Response) => {
    res.send("pong");
});


sequelize.sync({ alter: true })
    .then(() => console.log("Database synced successfully"))
    .catch(err => console.log("Error syncing database:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---


1. Test the server:

```bash
npx ts-node backend/server.ts
```

2. Open Postman → GET `http://localhost:5000/api/ping` → should return `"pong"`
3. Check PostgreSQL → tables `users` and `orders` should exist

