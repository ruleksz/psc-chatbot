import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/database.js";
import { parseMarkdownDocument } from "../utils/ragParser.js";
import { expandQuery } from "./rag.preRetrieval.js";
import { rerankChunks } from "./rag.reranker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path fallback ke folder docs
const DOCS_DIR = path.resolve(__dirname, "../../../docs");
const DEFAULT_SOURCE_FILES = [
    "psc-chatbot-faq.md",
    "psc-chatbot-knowledge-base.md"
];

// Cache in-memory untuk fallback jika MySQL offline
let inMemoryChunksCache = null;

/**
 * Memuat chunks langsung dari file Markdown jika database tidak tersedia
 */
export function getInMemoryChunks() {
    if (inMemoryChunksCache) {
        return inMemoryChunksCache;
    }

    const allChunks = [];
    let docIdCounter = 1;

    for (const file of DEFAULT_SOURCE_FILES) {
        const fullPath = path.join(DOCS_DIR, file);
        if (fs.existsSync(fullPath)) {
            const raw = fs.readFileSync(fullPath, "utf-8");
            const parsed = parseMarkdownDocument(raw, file);
            parsed.chunks.forEach((chunk) => {
                allChunks.push({
                    id: allChunks.length + 1,
                    document_id: docIdCounter,
                    document_title: parsed.title,
                    source_file: file,
                    chunk_index: chunk.chunk_index,
                    heading: chunk.heading,
                    heading_parent: chunk.heading_parent,
                    content: chunk.content,
                });
            });
            docIdCounter++;
        }
    }

    inMemoryChunksCache = allChunks;
    return inMemoryChunksCache;
}

/**
 * Membersihkan dan menyusun query teks untuk pencarian MySQL BOOLEAN MODE
 * Menghilangkan karakter khusus SQL boolean, menambahkan wildcard prefix '*'
 */
function buildBooleanSearchQuery(rawQuery) {
    const cleaned = String(rawQuery || "")
        .replace(/[+\-><()~*"@]/g, " ")
        .trim();

    const terms = cleaned
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2);

    if (terms.length === 0) {
        return "";
    }

    // Menggunakan operator OR alami dengan wildcard prefix
    return terms.map((term) => `${term}*`).join(" ");
}

// Stopwords bahasa Indonesia umum untuk penyaringan bobot pencarian
const INDONESIAN_STOPWORDS = new Set([
    "yang", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "dan", "atau",
    "ini", "itu", "juga", "sudah", "akan", "bisa", "dapat", "adalah", "yaitu",
    "saya", "kami", "kita", "kamu", "anda", "mereka", "dia", "ia",
    "kalau", "jika", "bila", "apakah", "bagaimana", "kenapa", "mengapa", "apa", "siapa", "kapan", "di mana"
]);

/**
 * Ekstrak kata dasar / stem sederhana bahasa Indonesia untuk meningkatkan matching
 */
function getWordStems(word) {
    const stems = [word];
    // Awalan me-, mem-, men-, meng-, meny-, di-, ter-, ber-, per-, pe-
    const prefixRegex = /^(meng|meny|men|mem|me|di|ter|ber|per|pe)/;
    // Akhiran -kan, -an, -i, -nya
    const suffixRegex = /(kan|an|i|nya)$/;

    let stripped = word.replace(prefixRegex, "");
    if (stripped.length >= 3) stems.push(stripped);

    let strippedSuffix = word.replace(suffixRegex, "");
    if (strippedSuffix.length >= 3) stems.push(strippedSuffix);

    let strippedBoth = stripped.replace(suffixRegex, "");
    if (strippedBoth.length >= 3) stems.push(strippedBoth);

    return [...new Set(stems)];
}

/**
 * Mencari chunks di in-memory cache menggunakan keyword & semantic heuristic scoring
 */
function searchInMemoryChunks(query, limit = 5) {
    const chunks = getInMemoryChunks();
    const lowerQuery = String(query || "").toLowerCase();

    // Deteksi token khusus seperti [1], shift+enter
    const specialTokens = [];
    if (/\[\s*1\s*\]/.test(lowerQuery)) specialTokens.push("[1]");
    if (/shift\s*\+\s*enter/i.test(lowerQuery) || /shift\s+enter/i.test(lowerQuery)) {
        specialTokens.push("shift+enter");
    }

    const rawTerms = lowerQuery
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 2);

    // Filter stopwords, tapi pertahankan jika semua kata terfilter
    const filteredTerms = rawTerms.filter((t) => !INDONESIAN_STOPWORDS.has(t));
    const activeTerms = filteredTerms.length > 0 ? filteredTerms : rawTerms;

    if (activeTerms.length === 0 && specialTokens.length === 0) {
        return [];
    }

    const scored = chunks.map((chunk) => {
        let score = 0;
        const textToSearch = `${chunk.heading || ""} ${chunk.heading_parent || ""} ${chunk.content}`.toLowerCase();
        const headingText = `${chunk.heading || ""} ${chunk.heading_parent || ""}`.toLowerCase();

        // 1. Cek token spesial
        for (const token of specialTokens) {
            if (token === "[1]" && (textToSearch.includes("[1]") || textToSearch.includes("rujukan"))) {
                score += 25;
            }
            if (token === "shift+enter" && textToSearch.includes("shift+enter")) {
                score += 30;
            }
        }

        // 2. Cek kata dan stem
        for (const term of activeTerms) {
            const stems = getWordStems(term);

            for (const stem of stems) {
                if (headingText.includes(stem)) {
                    score += 8;
                } else if (textToSearch.includes(stem)) {
                    score += 3;
                }
            }
        }

        return {
            ...chunk,
            score,
        };
    });

    return scored
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Mengambil potongan dokumen internal yang relevan (retrieval)
 * Menggunakan arsitektur 4 tahap:
 * 1. Pra-pengambilan (Pre-Retrieval / Query Expansion)
 * 2. Temu balik calon dokumen (Hybrid Fulltext & In-Memory)
 * 3. Pascapengambilan (Post-Retrieval / Reranking & Context Noise Pruning)
 * 
 * @param {string} query - Pertanyaan pengguna
 * @param {Object} [options]
 * @param {number} [options.limit=5] - Jumlah potongan maksimal
 * @param {number} [options.minScore=0] - Ambang batas skor minimal
 * @param {Array} [options.history=[]] - Riwayat percakapan untuk resolusi multi-turn
 * @returns {Promise<Array<{ id: number, heading: string, heading_parent: string|null, content: string, document_title: string, document_id: number, chunk_index: number, score: number, rerank_score?: number }>>}
 */
export async function retrieveChunks(query, { limit = 5, minScore = 0, history = [] } = {}) {
    if (!query || !query.trim()) {
        return [];
    }

    // Tahap 1: Pra-Pengambilan (Pre-Retrieval)
    const analysis = expandQuery(query, history);
    const targetQuery = analysis.resolvedQuery;
    const booleanQuery = buildBooleanSearchQuery(analysis.expandedQuery);
    const candidateLimit = Math.max(limit * 3, 15);

    let candidates = [];

    // Tahap 2: Pengambilan Calon Dokumen (Hybrid / MySQL Fulltext & In-Memory)
    try {
        let rows = [];

        if (booleanQuery) {
            // 1. Coba FULLTEXT BOOLEAN MODE
            const [ftRows] = await db.execute(
                `SELECT
                    rc.id,
                    rc.heading,
                    rc.heading_parent,
                    rc.content,
                    rd.title AS document_title,
                    rd.id AS document_id,
                    rc.chunk_index,
                    MATCH(rc.content, rc.heading) AGAINST(? IN BOOLEAN MODE) AS score
                 FROM rag_chunks rc
                 JOIN rag_documents rd ON rc.document_id = rd.id
                 WHERE rd.status = 'active'
                   AND MATCH(rc.content, rc.heading) AGAINST(? IN BOOLEAN MODE) > 0
                 ORDER BY score DESC
                 LIMIT ?`,
                [booleanQuery, booleanQuery, candidateLimit]
            );

            rows = ftRows;
        }

        // 2. Jika FULLTEXT BOOLEAN menghasilkan 0, coba NATURAL LANGUAGE MODE
        if (rows.length === 0) {
            const [nlRows] = await db.execute(
                `SELECT
                    rc.id,
                    rc.heading,
                    rc.heading_parent,
                    rc.content,
                    rd.title AS document_title,
                    rd.id AS document_id,
                    rc.chunk_index,
                    MATCH(rc.content, rc.heading) AGAINST(?) AS score
                 FROM rag_chunks rc
                 JOIN rag_documents rd ON rc.document_id = rd.id
                 WHERE rd.status = 'active'
                   AND MATCH(rc.content, rc.heading) AGAINST(?) > 0
                 ORDER BY score DESC
                 LIMIT ?`,
                [targetQuery, targetQuery, candidateLimit]
            );

            rows = nlRows;
        }

        // 3. Jika masih 0, coba fallback LIKE pada heading dan content
        if (rows.length === 0) {
            const keywords = analysis.keywords
                .filter((w) => w.length >= 3)
                .slice(0, 4);

            if (keywords.length > 0) {
                const likeClauses = keywords.map(() => "(rc.heading LIKE ? OR rc.content LIKE ?)").join(" OR ");
                const params = [];
                keywords.forEach((kw) => {
                    params.push(`%${kw}%`, `%${kw}%`);
                });
                params.push(candidateLimit);

                const [likeRows] = await db.execute(
                    `SELECT
                        rc.id,
                        rc.heading,
                        rc.heading_parent,
                        rc.content,
                        rd.title AS document_title,
                        rd.id AS document_id,
                        rc.chunk_index,
                        1 AS score
                     FROM rag_chunks rc
                     JOIN rag_documents rd ON rc.document_id = rd.id
                     WHERE rd.status = 'active'
                       AND (${likeClauses})
                     LIMIT ?`,
                    params
                );

                rows = likeRows;
            }
        }

        if (rows && rows.length > 0) {
            candidates = rows;
        }
    } catch (dbError) {
        console.warn(`[RAG Service] MySQL retrieval tidak dapat dilakukan (${dbError.message}). Menggunakan in-memory fallback.`);
    }

    // Fallback in-memory jika MySQL tidak menghasilkan kandidat
    if (candidates.length === 0) {
        candidates = searchInMemoryChunks(analysis.expandedQuery, candidateLimit);
    }

    // Tahap 3: Pascapengambilan (Post-Retrieval / Reranking & Context Noise Pruning)
    const reranked = rerankChunks(targetQuery, candidates, {
        keywords: analysis.keywords,
        topK: limit,
        minScore: minScore || 5,
    });

    return reranked;
}

/**
 * Menyusun konteks potongan dokumen berlabel sumber untuk prompt LLM
 * Mengikuti spesifikasi: docs/rag-prompt-templates.md Bagian 4
 * 
 * Format:
 * [Sumber 1 — Judul Dokumen: Heading/Bagian]
 * Isi potongan...
 * 
 * @param {Array} chunks
 * @returns {string}
 */
export function buildRagContext(chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        return "";
    }

    return chunks
        .map((chunk, index) => {
            const labelParts = [`Sumber ${index + 1}`];
            const title = chunk.document_title || "Dokumen Internal PSC";
            const heading = chunk.heading || "";

            const headerLabel = heading ? `${title}: ${heading}` : title;
            return `[${labelParts[0]} — ${headerLabel}]\n${chunk.content}`;
        })
        .join("\n\n");
}

/**
 * Menstandarkan metadata sumber dokumen untuk dikembalikan ke API/frontend
 * Mengikuti spesifikasi: docs/rag-flow-diagram.md Bagian 7
 * 
 * @param {Array} chunks
 * @returns {Array<{ id: number, document_title: string, heading: string, heading_parent: string|null, chunk_index: number, document_id: number }>}
 */
export function serializeRagSources(chunks) {
    if (!Array.isArray(chunks)) {
        return [];
    }

    return chunks.map((chunk, index) => ({
        id: index + 1,
        document_title: chunk.document_title || "Dokumen Internal PSC",
        heading: chunk.heading || "",
        heading_parent: chunk.heading_parent || null,
        chunk_index: chunk.chunk_index ?? index,
        document_id: chunk.document_id ?? null,
    }));
}
