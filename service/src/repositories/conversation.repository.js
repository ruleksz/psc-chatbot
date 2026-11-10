import db from "../config/database.js";

let hasRagSourcesColumn = null;

async function checkRagSourcesColumn() {
    if (hasRagSourcesColumn !== null) return hasRagSourcesColumn;
    try {
        const [cols] = await db.execute("SHOW COLUMNS FROM messages LIKE 'rag_sources'");
        hasRagSourcesColumn = cols.length > 0;
    } catch {
        hasRagSourcesColumn = false;
    }
    return hasRagSourcesColumn;
}

// 1. MEMBUAT PERCAKAPAN BARU
export async function createConversation(userId, title) {
    const [result] = await db.execute(
        `INSERT INTO conversations (user_id, title)
         VALUES (?, ?)`,
        [userId, title || "Percakapan Baru"]
    );

    return result.insertId;
}

// 2. MENYIMPAN PESAN USER ATAU AI
export async function saveMessage({
    conversationId,
    role,
    content,
    model = null,
    sources = [],
    ragSources = []
}) {
    const canSaveRagSources = await checkRagSourcesColumn();

    let insertId;

    if (canSaveRagSources) {
        const [result] = await db.execute(
            `INSERT INTO messages
             (conversation_id, role, content, model, sources, rag_sources)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                conversationId,
                role,
                content,
                model,
                JSON.stringify(sources),
                JSON.stringify(ragSources)
            ]
        );
        insertId = result.insertId;
    } else {
        const [result] = await db.execute(
            `INSERT INTO messages
             (conversation_id, role, content, model, sources)
             VALUES (?, ?, ?, ?, ?)`,
            [
                conversationId,
                role,
                content,
                model,
                JSON.stringify(sources)
            ]
        );
        insertId = result.insertId;
    }

    const conversationTitle =
        content.length > 36
            ? `${content.slice(0, 36)}...`
            : content;

    await db.execute(
        `UPDATE conversations
         SET title = CASE
                WHEN ? = 'user' AND title = 'Percakapan Baru' THEN ?
                ELSE title
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [role, conversationTitle, conversationId]
    );

    return insertId;
}

// 3. MENGAMBIL SEMUA RIWAYAT PERCAKAPAN
export async function getConversations(userId) {
    const [rows] = await db.execute(
        `SELECT id, title, created_at, updated_at
         FROM conversations
         WHERE user_id = ?
         ORDER BY updated_at DESC, id DESC`,
        [userId]
    );

    return rows;
}

// 4. MENGAMBIL DETAIL PESAN
export async function getMessages(conversationId, userId) {
    const canSelectRagSources = await checkRagSourcesColumn();
    const selectQuery = canSelectRagSources
        ? `SELECT m.id, m.role, m.content,
                  m.model, m.sources, m.rag_sources, m.created_at
           FROM messages m
           INNER JOIN conversations c
              ON m.conversation_id = c.id
           WHERE m.conversation_id = ?
             AND c.user_id = ?
           ORDER BY m.id ASC`
        : `SELECT m.id, m.role, m.content,
                  m.model, m.sources, m.created_at
           FROM messages m
           INNER JOIN conversations c
              ON m.conversation_id = c.id
           WHERE m.conversation_id = ?
             AND c.user_id = ?
           ORDER BY m.id ASC`;

    const [rows] = await db.execute(selectQuery, [conversationId, userId]);
    return rows;
}

// 5. MENCARI PERCAKAPAN BERDASARKAN ID
export async function findConversation(id, userId) {
    const [rows] = await db.execute(
        `SELECT id, user_id, title, created_at, updated_at
         FROM conversations
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [id, userId]
    );

    return rows[0] || null;
}

// 6. MENGHAPUS PERCAKAPAN
export async function deleteConversation(conversationId, userId) {
    const [result] = await db.execute(
        `DELETE FROM conversations
         WHERE id = ? AND user_id = ?`,
        [conversationId, userId]
    );

    return result.affectedRows > 0;
}
