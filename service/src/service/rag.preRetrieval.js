/**
 * Modul Pra-Pengambilan (Pre-Retrieval) untuk RAG PSC Chatbot
 * 
 * Bertanggung jawab atas:
 * 1. Normalisasi teks & pembersihan karakter khusus
 * 2. Perluasan kata kunci & pemetaan sinonim bahasa Indonesia (Query Expansion)
 * 3. Resolusi konteks multi-turn (merangkai pertanyaan lanjutan menjadi self-contained query)
 * 
 * Mengikuti arsitektur 4-lapisan RAG (Pre-Retrieval) sesuai referensi Sisbite.
 */

// Kamus perluasan sinonim dan istilah fitur PSC Chatbot
const SYNONYM_MAP = {
    // Pengiriman pesan & shortcut
    kirim: ["kirim", "mengirim", "tekan enter", "tombol enter", "shortcut"],
    enter: ["enter", "shift+enter", "mengirim pesan", "baris baru"],
    shortcut: ["shortcut", "shift+enter", "enter", "tombol"],

    // Batasan pesan
    panjang: ["panjang pesan", "batas karakter", "karakter maksimal", "4000 karakter", "kuota"],
    karakter: ["karakter", "panjang pesan", "batas", "maksimal", "4000"],
    batas: ["batas", "maksimal", "panjang pesan", "limit", "4000"],

    // Percakapan baru & manajemen chat
    baru: ["percakapan baru", "memulai percakapan", "chat baru", "tombol plus", "sidebar"],
    lama: ["percakapan sebelumnya", "riwayat", "membuka percakapan", "history", "sidebar"],
    riwayat: ["riwayat", "percakapan sebelumnya", "history", "daftar percakapan"],
    hapus: ["menghapus percakapan", "hapus chat", "menghapus riwayat", "ikon tempat sampah", "permanen"],
    hilang: ["hilang permanen", "menghapus percakapan", "terhapus", "hapus"],

    // Sumber & sitasi
    rujukan: ["rujukan sumber", "angka [1]", "sumber web", "sitasi", "verifikasi"],
    angka: ["angka [1]", "rujukan sumber", "format rujukan", "sumber"],
    sitasi: ["sitasi", "rujukan sumber", "angka [1]", "sumber web resmi"],
    verifikasi: ["memverifikasi", "sumber tidak cukup", "sumber web", "belum menemukan"],

    // Topik & cakupan
    topik: ["topik yang dibahas", "pertanyaan umum", "cakupan", "esports", "game kompetitif"],
    umum: ["pertanyaan umum", "di luar esports", "cakupan asisten", "menolak"],
    strategi: ["topik apa yang bisa dibahas", "pertanyaan yang dapat dibantu", "strategi kompetitif", "game kompetitif"],
    valorant: ["topik apa yang bisa dibahas", "game kompetitif", "strategi", "esports"],
    mlbb: ["topik apa yang bisa dibahas", "game kompetitif", "strategi", "mobile legends"],
    roster: ["jadwal", "skor", "roster selalu terkini", "informasi terkini", "pembaruan"],
    jadwal: ["jadwal", "skor", "roster", "hasil pertandingan", "terkini"],

    // FAQ & RAG
    faq: ["dokumen internal psc", "faq otomatis dibaca", "basis pengetahuan", "rag"],
    rag: ["basis pengetahuan rag", "dokumen internal", "status rag", "faq"],
};

// Pola kata rujukan ambigu (anaphora) untuk query lanjutan
const ANAPHORIC_PATTERNS = [
    /^(kalau|jika|apakah)\s+(itu|hal itu|datanya|pesannya|fitur itu)/i,
    /^(apakah|bisa)\s+permanen\??$/i,
    /^(berapa|kapan)\s+(maksimalnya|batasnya|kuotanya)\??$/i,
    /^(bagaimana|gimana)\s+caranya\??$/i,
    /^(kenapa|mengapa)\s+bisa\s+begitu\??$/i,
];

/**
 * Membersihkan string dari tanda baca berlebih dan spasi ganda
 * @param {string} text 
 * @returns {string}
 */
export function normalizeQuery(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .toLowerCase()
        .replace(/[^\w\s\[\]\+\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Menyelesaikan query lanjutan (multi-turn anaphora) berdasarkan riwayat chat
 * 
 * Contoh:
 * Riwayat: User "Bagaimana cara hapus chat?" -> Bot "Klik ikon sampah..."
 * Pertanyaan baru: "Apakah itu permanen?"
 * Hasil rewrote: "Apakah menghapus chat atau percakapan itu permanen?"
 * 
 * @param {string} currentQuery 
 * @param {Array<{ role: string, content: string }>} history 
 * @returns {string}
 */
export function resolveFollowUpQuery(currentQuery, history = []) {
    if (!Array.isArray(history) || history.length === 0) {
        return currentQuery;
    }

    const trimmed = currentQuery.trim();
    const isAnaphoric = ANAPHORIC_PATTERNS.some((pattern) => pattern.test(trimmed));

    if (!isAnaphoric) {
        return currentQuery;
    }

    // Ambil pesan user terakhir dari riwayat
    const lastUserMsg = [...history].reverse().find(
        (m) => m.role === "user" && typeof m.content === "string" && m.content.trim().length > 0
    );

    if (!lastUserMsg) {
        return currentQuery;
    }

    // Ekstrak entitas konteks dari pertanyaan sebelumnya
    const prevClean = normalizeQuery(lastUserMsg.content);
    let contextSubject = "";

    if (/hapus|tempat sampah|delete/.test(prevClean)) {
        contextSubject = "menghapus percakapan atau chat";
    } else if (/karakter|panjang|panjang pesan|kuota/.test(prevClean)) {
        contextSubject = "panjang karakter pesan maksimal";
    } else if (/baru|mulai awal|percakapan baru/.test(prevClean)) {
        contextSubject = "memulai percakapan baru";
    } else if (/lama|riwayat|buka lagi/.test(prevClean)) {
        contextSubject = "membuka percakapan riwayat sebelumnya";
    } else if (/kirim|enter|shift/.test(prevClean)) {
        contextSubject = "mengirim pesan dengan shortcut keyboard";
    } else if (/\[1\]|angka|rujukan|sumber/.test(prevClean)) {
        contextSubject = "rujukan sumber atau angka [1]";
    }

    if (contextSubject) {
        return `${trimmed} (konteks: ${contextSubject})`;
    }

    return currentQuery;
}

/**
 * Melakukan Query Expansion (Perluasan Kata Kunci & Sinonim)
 * 
 * @param {string} query - Pertanyaan pengguna
 * @param {Array<{ role: string, content: string }>} [history=[]] - Riwayat percakapan
 * @returns {{
 *   originalQuery: string,
 *   resolvedQuery: string,
 *   expandedQuery: string,
 *   keywords: string[]
 * }}
 */
export function expandQuery(query, history = []) {
    const raw = String(query || "").trim();
    if (!raw) {
        return {
            originalQuery: "",
            resolvedQuery: "",
            expandedQuery: "",
            keywords: [],
        };
    }

    // 1. Selesaikan multi-turn follow up jika ada
    const resolvedQuery = resolveFollowUpQuery(raw, history);
    const normalized = normalizeQuery(resolvedQuery);

    const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
    const addedKeywords = new Set(tokens);

    // 2. Deteksi sinonim dari kamus
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
        if (normalized.includes(key) || tokens.includes(key)) {
            synonyms.forEach((syn) => {
                syn.split(/\s+/).forEach((w) => addedKeywords.add(w));
            });
        }
    }

    // 3. Deteksi token spesifik seperti "[1]" atau "shift+enter"
    if (/\[\s*1\s*\]/.test(raw)) {
        addedKeywords.add("[1]");
        addedKeywords.add("rujukan");
        addedKeywords.add("sumber");
    }
    if (/shift\s*\+\s*enter/i.test(raw) || /shift\s+enter/i.test(raw)) {
        addedKeywords.add("shift+enter");
        addedKeywords.add("mengirim");
        addedKeywords.add("pesan");
    }

    const keywordArray = [...addedKeywords];
    const expandedQuery = `${resolvedQuery} ${keywordArray.join(" ")}`.trim();

    return {
        originalQuery: raw,
        resolvedQuery,
        expandedQuery,
        keywords: keywordArray,
    };
}
