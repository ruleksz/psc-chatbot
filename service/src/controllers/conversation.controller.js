
import {
    createConversation,
    getConversations,
    getMessages,
    deleteConversation,
    findConversation
} from "../repositories/conversation.repository.js";

// Sementara untuk pengujian lokal.
// Ganti dengan ID dari autentikasi ketika fitur login tersedia.
const DEMO_USER_ID = 1;

function validId(value) {
    const n = Number(value);
    return Number.isSafeInteger(n) && n > 0;
}

// POST: Membuat percakapan
export async function postConversation(req, res) {
    try {
        const title =
            typeof req.body?.title === "string"
                ? req.body.title.trim()
                : "";

        if (title.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Judul maksimal 255 karakter."
            });
        }

        const id = await createConversation(
            DEMO_USER_ID,
            title || "Percakapan Baru"
        );

        return res.status(201).json({
            success: true,
            conversation_id: id,
            title: title || "Percakapan Baru"
        });
    } catch (error) {
        console.error("Create conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal membuat percakapan."
        });
    }
}

// GET: Semua percakapan
export async function listConversations(req, res) {
    try {
        const data = await getConversations(DEMO_USER_ID);

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("List conversations:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat."
        });
    }
}

// GET: Detail pesan
export async function detailConversation(req, res) {
    try {
        const { id } = req.params;

        if (!validId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid."
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

        const messages = await getMessages(
            id,
            DEMO_USER_ID
        );

        return res.json({
            success: true,
            conversation,
            messages
        });
    } catch (error) {
        console.error("Detail conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail percakapan."
        });
    }
}

// DELETE: Hapus percakapan
export async function removeConversation(req, res) {
    try {
        const { id } = req.params;

        if (!validId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid."
            });
        }

        const deleted = await deleteConversation(
            id,
            DEMO_USER_ID
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Percakapan tidak ditemukan."
            });
        }

        return res.json({
            success: true,
            message: "Percakapan berhasil dihapus."
        });
    } catch (error) {
        console.error("Delete conversation:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus percakapan."
        });
    }
}
