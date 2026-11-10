/**
 * Modul Klasifikasi Jalur Pertanyaan (RAG Classifier)
 * Menentukan apakah pertanyaan menuju panduan/FAQ internal PSC ("psc_guide")
 * atau pertanyaan fakta/analisis esports aktual ("esports_factual").
 * 
 * Mengikuti spesifikasi: docs/rag-flow-diagram.md Bagian 3 (Opsi C: Hybrid)
 */

const RAG_CLASSIFIER_PROMPT = `
Kamu adalah pengklasifikasi jalur pertanyaan untuk sistem PSC Chatbot.

Tugasmu mengklasifikasikan pesan pengguna ke salah satu dari dua jalur:
1. "psc_guide": Pertanyaan mengenai cara penggunaan aplikasi PSC Chatbot, fitur (kirim pesan, hapus chat, percakapan baru, riwayat, batasan karakter, tombol), cara membaca rujukan sumber ([1]), kebijakan/FAQ internal aplikasi, atau status dokumen internal.
2. "esports_factual": Pertanyaan mengenai fakta aktual esports, game kompetitif (MLBB, Valorant, Dota 2, CS2, dll.), pemain, tim, turnamen, skor, jadwal, klasemen, roster, strategi, meta, patch, atau sejarah kompetisi.

CONTOH:
Input: Bagaimana cara mengirim pesan?
Output: {"route": "psc_guide"}

Input: Kalau tekan Shift+Enter apakah pesannya terkirim?
Output: {"route": "psc_guide"}

Input: Berapa batas karakter maksimal pesan?
Output: {"route": "psc_guide"}

Input: Bagaimana cara menghapus percakapan?
Output: {"route": "psc_guide"}

Input: Apa arti angka [1] di jawaban chatbot?
Output: {"route": "psc_guide"}

Input: Siapa juara MPL ID Season 13?
Output: {"route": "esports_factual"}

Input: Jelaskan strategi draft pick Mobile Legends.
Output: {"route": "esports_factual"}

Input: Kapan jadwal turnamen Valorant Champions berikutnya?
Output: {"route": "esports_factual"}

Keluarkan JSON valid saja tanpa teks penjelasan tambahan.
Format:
{"route": "psc_guide"}
atau
{"route": "esports_factual"}
`;

// Aturan kata kunci untuk deteksi cepat tanpa latensi API (Opsi B)
const PSC_GUIDE_PATTERNS = [
    // Pengiriman pesan & shortcut
    /(cara|bagaimana|gimana).*(mengirim|kirim|tulis|ngetik).*(pesan|chat|obrolan)/i,
    /(tombol|keyboard|shortcut).*(kirim|enter|shift)/i,
    /shift\s*\+\s*enter/i,
    /tekan\s+enter/i,

    // Batasan karakter / validasi
    /(panjang|batas|batasan|maksimal|limit).*(pesan|karakter|huruf|kata)/i,
    /berapa.*(panjang|karakter|huruf|kata).*(pesan|chat)/i,
    /pesan\s+(kosong|terlalu\s+panjang)/i,
    /4000\s+karakter/i,

    // Manajemen percakapan / riwayat
    /(cara|bagaimana|gimana).*(memulai|buka|buat).*(percakapan|chat|obrolan).*(baru|awal)/i,
    /percakapan\s+baru/i,
    /chat\s+baru/i,
    /(cara|bagaimana|gimana).*(buka|lihat|melihat|baca).*(percakapan|chat|riwayat).*(lama|sebelumnya|kemarin)/i,
    /riwayat\s+(chat|percakapan)/i,
    /(hapus|menghapus|clear).*(percakapan|chat|obrolan|riwayat)/i,
    /chat.*(bisa|dapat)\s+dihapus/i,
    /(pulihkan|memulihkan|restore).*(chat|percakapan)/i,

    // Penggunaan / kemampuan asisten PSC
    /topik\s+apa.*bisa\s+dibahas/i,
    /chatbot.*bisa\s+(menjawab|membantu|apa)/i,
    /(apa\s+itu|tentang)\s+psc\s+(esports\s+assistant|chatbot)/i,
    /apakah\s+chatbot\s+menjawab\s+pertanyaan/i,
    /(apakah|bisa)\s+(saya\s+)?tanya\s+.*(strategi|game|tentang|apapun)/i,
    /bisa\s+(bantu|tanya).*pertanyaan.*(umum|di\s+luar\s+esports)/i,
    /tidak\s+ada\s+hubungannya\s+dengan\s+esports/i,

    // Rujukan sumber & verifikasi
    /apa\s+(maksud|arti).*(angka\s+)?\[\s*1\s*\]/i,
    /\[\s*1\s*\]/i,
    /rujukan\s+sumber/i,
    /kenapa.*(chatbot|asisten).*belum\s+bisa\s+memverifikasi/i,
    /(sumber\s+tidak\s+cukup|belum\s+dapat\s+diverifikasi)/i,
    /(perbedaan|beda)\s+sumber\s+resmi\s+dan.*tepercaya/i,

    // RAG & Dokumen internal PSC
    /faq.*(sudah|otomatis|dibaca)/i,
    /apakah\s+chatbot.*dokumen\s+internal/i,
    /rag.*(sudah\s+aktif|kapan|diluncurkan)/i,
    /dokumen\s+internal\s+psc/i,

    // Unanswered / Pertanyaan operasional yang masuk evaluasi U01-U08
    /berapa\s+lama\s+psc\s+menyimpan/i,
    /datanya\s+hilang\s+permanen/i,
    /memulihkan\s+akun.*(kata\s+sandi|password)/i,
    /siapa\s+yang\s+harus\s+saya\s+hubungi/i,
    /semua\s+dokumen\s+internal\s+bisa\s+dilihat/i,
    /kapan\s+rag.*diluncurkan/i,
    /siapa\s+pemilik.*faq/i,
    /jawaban\s+esports\s+selalu\s+berasal\s+dari\s+basis\s+data/i,
];

// Deteksi cepat pola esports aktual
const ESPORTS_FACTUAL_PATTERNS = [
    /\b(skor|jadwal|klasemen|bracket|standing|schedule|roster|transfer)\b/i,
    /\b(juara|pemenang|winner|champion|runner[\s-]?up)\b/i,
    /\b(turnamen|kompetisi|playoff|regular\s+season|grand\s+final|msc|m1|m2|m3|m4|m5|m6)\b/i,
    /\b(mpl|vct|ti\d+|iem|esl|blast|fncs|algs|pgl|lck|lpl|lec)\b/i,
    /\b(build|item|counter|combo|draft|gameplay|patch|meta)\s+(hero|agent|champion)\b/i,
];

/**
 * Klasifikasi dengan aturan pola teks (cepat, 0 token)
 * @param {string} text
 * @returns {"psc_guide" | "esports_factual" | null}
 */
export function classifyRouteByRules(text) {
    const normalized = String(text || "").trim();

    // Cek pattern panduan/FAQ PSC dulu
    for (const pattern of PSC_GUIDE_PATTERNS) {
        if (pattern.test(normalized)) {
            return "psc_guide";
        }
    }

    // Cek pattern fakta esports aktual
    for (const pattern of ESPORTS_FACTUAL_PATTERNS) {
        if (pattern.test(normalized)) {
            return "esports_factual";
        }
    }

    return null;
}

/**
 * Klasifikasi jalur pesan (Hybrid: Rule-based + LLM classifier)
 * 
 * @param {Object} params
 * @param {OpenAI} [params.groq] - Instance OpenAI/Groq client
 * @param {string} [params.model] - Nama model Groq
 * @param {string} params.message - Pesan dari user
 * @param {Array} [params.history] - Riwayat percakapan
 * @returns {Promise<"psc_guide" | "esports_factual">}
 */
export async function classifyQueryRoute({ groq, model, message, history = [] }) {
    // 1. Coba klasifikasi berbasis aturan (Opsi B)
    const ruleResult = classifyRouteByRules(message);
    if (ruleResult) {
        console.log(`[RAG Classifier] Matched by rules -> ${ruleResult}`);
        return ruleResult;
    }

    // 2. Jika tidak ada groq client atau aturan tidak cocok, coba LLM jika tersedia
    if (!groq || !model) {
        // Default ke esports_factual jika ambigu tanpa LLM
        return "esports_factual";
    }

    try {
        const safeHistory = Array.isArray(history) ? history : [];
        const recentHistory = safeHistory
            .slice(-4)
            .filter(({ role, content }) =>
                (role === "user" || role === "assistant") &&
                typeof content === "string"
            )
            .map(({ role, content }) => ({
                role,
                content: content.slice(0, 1000),
            }));

        const completion = await groq.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: RAG_CLASSIFIER_PROMPT,
                },
                ...recentHistory,
                {
                    role: "user",
                    content: "Klasifikasikan jalur pesan berikut:\n\n" + String(message),
                },
            ],
            temperature: 0,
            response_format: {
                type: "json_object",
            },
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw);

        if (parsed.route === "psc_guide" || parsed.route === "esports_factual") {
            console.log(`[RAG Classifier] Classified by LLM -> ${parsed.route}`);
            return parsed.route;
        }

        return "esports_factual";
    } catch (error) {
        console.warn(`[RAG Classifier] LLM classification error: ${error.message}, falling back to esports_factual`);
        return "esports_factual";
    }
}
