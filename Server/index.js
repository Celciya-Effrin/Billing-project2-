const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const UserModel = require("./model/User");
const ProductModel = require("./model/Product");

// Configure environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (e.g., manifest.json or direct browser nav)
    if (!origin || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// DB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Health check
app.get("/", (req, res) => {
  res.send("✅ MERN Billing Backend is running!");
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes (register, login, product management)
app.post("/register", async (req, res) => {
  try {
    const { name, mail, pass } = req.body;
    const existingUser = await UserModel.findOne({ mail });
    if (existingUser) return res.status(400).json({ error: "Email exists" });

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new UserModel({ name, mail, pass: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { mail, pass } = req.body;
    const user = await UserModel.findOne({ mail });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/add-product", upload.single("file"), async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const newProduct = new ProductModel({ name, price, quantity, image: imagePath });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

app.put("/update-quantities", async (req, res) => {
  const items = req.body.items;
  try {
    for (let item of items) {
      await ProductModel.findByIdAndUpdate(item._id, { $inc: { quantity: -item.quantity } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export the app (Important for Vercel)
module.exports = app;
