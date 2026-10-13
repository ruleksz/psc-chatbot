
import { generateChatReply } from "../service/chat.service.js";

import {
    createConversation,
    findConversation,
    getMessages,
    saveMessage
} from "../repositories/conversation.repository.js";

const DEMO_USER_ID = 1;

export async function postChat(req, res) {
    try {
        const { message, conversation_id } = req.body || {};

        // Validasi pesan
        if (
            typeof message !== "string" ||
            !message.trim() ||
            message.length > 4000
        ) {
            return res.status(400).json({
                success: false,
                message: "Pesan wajib diisi (maksimal 4000 karakter)."
            });
        }

        let conversationId = conversation_id;

        // Membuat percakapan baru
        if (conversationId === undefined ||
            conversationId === null) {

            conversationId = await createConversation(
                DEMO_USER_ID,
                message.trim().slice(0, 100)
            );

        } else {
            // Validasi ID percakapan
            const id = Number(conversationId);

            if (!Number.isSafeInteger(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "conversation_id tidak valid."
                });
            }

            const conversation = await findConversation(
                id,
                DEMO_USER_ID
            );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Percakapan tidak ditemukan."
                });
            }

            conversationId = id;
        }

        // Ambil riwayat SEBELUM menyimpan pesan baru
        const previousMessages = await getMessages(
            conversationId,
            DEMO_USER_ID
        );

        const history = previousMessages.map(item => ({
            role: item.role,
            content: item.content
        }));

        // Simpan pesan user
        await saveMessage({
            conversationId,
            role: "user",
            content: message.trim()
        });

        // Proses menggunakan AI yang sudah ada
        let result;

        try {
            result = await generateChatReply({
                message: message.trim(),
                history
            });
        } catch (error) {
            console.error("AI error:", error);
            console.error("Full error details:", {
                code: error.code,
                message: error.message,
                stack: error.stack
            });

            return res.status(502).json({
                success: false,
                conversation_id: conversationId,
                message: "AI gagal memproses pesan. Pesan pengguna sudah tersimpan.",
                error_code: error.code
            });
        }

        // Simpan jawaban AI ke MySQL
        await saveMessage({
            conversationId,
            role: "assistant",
            content: result.reply,
            model: result.model || null,
            sources: result.sources || []
        });

        // Kirim hasil ke Postman
        return res.json({
            success: true,
            conversation_id: conversationId,
            reply: result.reply,
            sources: result.sources || []
        });

    } catch (error) {
        console.error("Chat database error:", error);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server atau database."
        });
    }
}
