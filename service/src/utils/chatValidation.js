const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 10;

export function validateChatPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, status: 400, message: "Request body harus berupa objek JSON." };
    }

    if (typeof body.message !== "string" || body.message.trim().length === 0) {
        return { valid: false, status: 400, message: "Pesan tidak boleh kosong." };
    }

    const message = body.message.trim();
    if (message.length > MAX_MESSAGE_LENGTH) {
        return {
            valid: false,
            status: 413,
            message: `Pesan terlalu panjang. Maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
        };
    }

    if (body.history !== undefined && !Array.isArray(body.history)) {
        return { valid: false, status: 400, message: "Riwayat percakapan harus berupa array." };
    }

    const history = (body.history ?? []).slice(-MAX_HISTORY_MESSAGES);
    for (const item of history) {
        if (
            !item ||
            typeof item !== "object" ||
            !["user", "assistant"].includes(item.role) ||
            typeof item.content !== "string"
        ) {
            return {
                valid: false,
                status: 400,
                message: "Format riwayat percakapan tidak valid. Gunakan role user/assistant dan content berupa teks.",
            };
        }
    }

    return {
        valid: true,
        data: {
            message,
            history: history.map(({ role, content }) => ({
                role,
                content: content.slice(0, MAX_MESSAGE_LENGTH),
            })),
        },
    };
}
