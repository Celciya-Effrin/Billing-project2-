const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const UserModel = require("./model/User");
const ProductModel = require("./model/Product");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Serve uploaded image files statically
app.use("/uploads", express.static("uploads"));

// Enable CORS for frontend hosted on Vercel
app.use(cors({
  origin: "https://mern-billing-iu0uixoug-celciya-effrins-projects.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Route: Welcome message
app.get("/", (req, res) => {
  res.send("✅ MERN Billing Backend is running!");
});

// ✅ Route: User registration
app.post("/register", async (req, res) => {
  try {
    const { name, mail, pass } = req.body;
    const existingUser = await UserModel.findOne({ mail });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new UserModel({ name, mail, pass: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Route: User login
app.post("/login", async (req, res) => {
  try {
    const { mail, pass } = req.body;
    const user = await UserModel.findOne({ mail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Route: Add product (with file upload)
app.post("/add-product", upload.single("file"), async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const newProduct = new ProductModel({
      name,
      price,
      quantity,
      image: imagePath,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Update quantities on bill finish
app.put("/update-quantities", async (req, res) => {
  const items = req.body.items; // Format: [{ _id, quantity }]
  try {
    for (let item of items) {
      await ProductModel.findByIdAndUpdate(item._id, {
        $inc: { quantity: -item.quantity },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Edit a product
app.put("/products/:id", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Local development server (not used by Vercel deployment)
const PORT = 3001;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Local server running at http://localhost:${PORT}`);
  });
}
