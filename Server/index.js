const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt= require("bcrypt")
const dotenv = require("dotenv")
const multer = require("multer");
const path = require("path");
const UserModel =require("./model/User");
const ProductModel = require('./model/Product');

//dotenv connect backend and frontend by express
dotenv.config();
const app = express()
app.use(express.json());
//For stored image
app.use("/uploads", express.static("uploads")); // Serve files

app.use(cors({
  origin: "https://mern-billing-iu0uixoug-celciya-effrins-projects.vercel.app", // Frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use((req, res, next) => {
  console.log("Request received from origin:", req.headers.origin);
  next();
});

//mongo DB connection code
mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("Connected to mongo DB"))
    .catch(err => console.log("Fail to connect", err));
    
app.listen(process.env.PORT,() =>{
    console.log(`server is running on port ${process.env.REACT_APP_FRONTEND_URL}`)
})


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


//register code
app.post("/register", async (req, res) => {
  try {
    const { name, mail, pass } = req.body;
    console.log("Received data:", name, mail, pass);

    const existingUser = await UserModel.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new UserModel({ name, mail, pass: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Registration error:", error); // Add this for debugging
    res.status(500).json({ error: error.message });
  }
});


//login code
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

app.get("/", (req, res) => {
  res.send("✅ MERN Billing Backend is running!");
});


// Add product with file
// ✅ Add product with file upload
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



// Fetch all products
app.get("/products", async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

// Update quantity on bill finish
app.put("/update-quantities", async (req, res) => {
  const items = req.body.items; // [{ _id, quantity }]
  try {
    for (let item of items) {
      await ProductModel.findByIdAndUpdate(item._id, { $inc: { quantity: -item.quantity } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Editing and deleting the data in the product.js
// Node + Express + MongoDB
app.put("/products/:id", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//Delete the data 
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





//To add the products in the DB
/*app.post("/add-product", async (req, res) => {
  try {
    const { name, image, price, quantity } = req.body;
    const newProduct = new ProductModel({ name, image, price, quantity });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});*/