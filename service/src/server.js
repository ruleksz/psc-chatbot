import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 PSC Chatbot API Server Running    ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}         ║
║  Status: ✅ Online                     ║
╚════════════════════════════════════════╝
    `);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});
