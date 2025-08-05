import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({

  origin: 'https://duodude.in', // Allow only your front-end origin

  origin: [
    'http://localhost:5173', // Local development
    'https://duodude.vercel.app', // Vercel deployment
    /^https:\/\/duodude.*\.vercel\.app$/, // Any Vercel preview deployments
    'https://duodude.in' // Custom domain if you have one
  ],

  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import heroSlideRoutes from './routes/heroSlideRoutes.js';

app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("API is running..."));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
