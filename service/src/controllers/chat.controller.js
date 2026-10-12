import { generateChatReply } from "../service/chat.service.js";
import { validateChatPayload } from "../utils/chatValidation.js";

export async function postChat(req, res) {
    const validation = validateChatPayload(req.body);
    if (!validation.valid) {
        return res.status(validation.status).json({
            success: false,
            message: validation.message,
        });
    }

    try {
        const result = await generateChatReply(validation.data);
        return res.json({
            success: true,
            reply: result.reply,
            sources: result.sources,
        });
    } catch (error) {
        if (error.code === "MISSING_API_KEY") {
            return res.status(503).json({
                success: false,
                message: "Layanan AI belum dikonfigurasi. Periksa OPENAI_API_KEY pada backend.",
            });
        }

        // Detail error hanya dicatat di backend, tidak dikirim kepada pengguna.
        console.error("Chat request failed:", error.message);
        return res.status(502).json({
            success: false,
            message: "Maaf, chatbot belum dapat memproses pesan. Coba lagi beberapa saat lagi.",
        });
    }
}
