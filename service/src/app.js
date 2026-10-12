import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PSC Chatbot API is running 🚀"
    });
});

// Chat routes
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

export default app;