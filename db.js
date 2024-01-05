const { MongoClient } = require("mongodb");

const db = {};

const connectToDb = () => {
  const client = new MongoClient("mongodb+srv://buimyy2909:sQofBsk2FhYYlqEI@cluster0.phkewq3.mongodb.net/");
  client.connect(() => {
    const database = client.db("mydatabase");
    db.inventory = database.collection("inventory");
    db.orders = database.collection("orders");
    db.users = database.collection("users");
  });
};

module.exports = { connectToDb, db };