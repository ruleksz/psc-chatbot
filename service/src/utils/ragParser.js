/**
 * Utilitas untuk parsing dan chunking dokumen Markdown RAG berdasarkan heading.
 * Mengikuti spesifikasi: docs/rag-chunking-strategy.md
 */

/**
 * Parsing isi file markdown menjadi kumpulan chunk terstruktur.
 * 
 * @param {string} markdownText - Teks dokumen markdown
 * @param {string} sourceFile - Nama file sumber (misal: psc-chatbot-faq.md)
 * @returns {{ title: string, sourceFile: string, chunks: Array<{ chunk_index: number, heading: string, heading_parent: string|null, content: string }> }}
 */
export function parseMarkdownDocument(markdownText, sourceFile = "") {
    if (typeof markdownText !== "string") {
        throw new Error("markdownText harus berupa string");
    }

    const lines = markdownText.split(/\r?\n/);
    let title = "";
    const chunks = [];

    // 1. Ekstrak judul dokumen dari heading level 1 (# Title)
    for (const line of lines) {
        const match = line.match(/^#\s+(.+)$/);
        if (match) {
            title = match[1].trim();
            break;
        }
    }

    if (!title) {
        title = sourceFile ? sourceFile.replace(/\.[^/.]+$/, "") : "Dokumen RAG";
    }

    // 2. Bagi dokumen menjadi seksi-seksi berdasarkan ## (level 2) dan ### (level 3)
    let currentH2 = null;
    let currentH3 = null;
    let currentH3ContentLines = [];
    let currentH2IntroLines = [];

    function flushH3() {
        if (currentH3 && currentH3ContentLines.length > 0) {
            const rawContent = currentH3ContentLines.join("\n").trim();
            if (rawContent.length > 0) {
                chunks.push({
                    chunk_index: chunks.length,
                    heading: currentH3,
                    heading_parent: currentH2,
                    content: rawContent
                });
            }
        }
        currentH3 = null;
        currentH3ContentLines = [];
    }

    function flushH2Intro() {
        if (currentH2 && currentH2IntroLines.length > 0) {
            const rawContent = currentH2IntroLines.join("\n").trim();
            // Hanya buat chunk jika isi intro bermakna (bukan hanya metadata status/draf)
            if (rawContent.length > 0) {
                chunks.push({
                    chunk_index: chunks.length,
                    heading: currentH2,
                    heading_parent: null,
                    content: rawContent
                });
            }
        }
        currentH2IntroLines = [];
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Cek Level 2 heading: ## ...
        const h2Match = line.match(/^##\s+(.+)$/);
        if (h2Match) {
            flushH3();
            flushH2Intro();
            currentH2 = h2Match[1].trim();
            continue;
        }

        // Cek Level 3 heading: ### ...
        const h3Match = line.match(/^###\s+(.+)$/);
        if (h3Match) {
            flushH3();
            flushH2Intro(); // Jika ada intro sebelum H3, sudah selesai
            currentH3 = h3Match[1].trim();
            continue;
        }

        // Baris konten
        if (currentH3) {
            currentH3ContentLines.push(line);
        } else if (currentH2) {
            currentH2IntroLines.push(line);
        }
    }

    // Flush sisa
    flushH3();
    flushH2Intro();

    return {
        title,
        sourceFile,
        chunks
    };
}

