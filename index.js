const express = require("express");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
const port = 3000;
const mongoURI = "mongodb+srv://buimyy2909:sQofBsk2FhYYlqEI@cluster0.phkewq3.mongodb.net/mydatabase";
const secretKey = crypto.randomBytes(32).toString("hex");

app.use(express.json());

const connectToDb = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("mydatabase");
    app.locals.db = database;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/inventory/products", (req, res) => {
  const db = req.app.locals.db;
  const inventoryCollection = db.collection("inventory");

  inventoryCollection.find({}).toArray((err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(products);
  });
});

app.get("/inventory/products/low-quantity", (req, res) => {
  const db = req.app.locals.db;
  const inventoryCollection = db.collection("inventory");

  inventoryCollection.find({ quantity: { $lt: 100 } }).toArray((err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(products);
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    return res.json({ token });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/orders", authenticate, (req, res) => {
  const db = req.app.locals.db;
  const ordersCollection = db.collection("orders");
  const inventoryCollection = db.collection("inventory");

  ordersCollection.aggregate([
    {
      $lookup: {
        from: "inventory",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
  ]).toArray((err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(orders);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Secret key: ${secretKey}`);
  connectToDb();
});