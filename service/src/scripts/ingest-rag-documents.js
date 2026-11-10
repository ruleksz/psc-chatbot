import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/database.js";
import { parseMarkdownDocument } from "../utils/ragParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direktori docs berada 3 tingkat di atas: service/src/scripts -> service/src -> service -> root -> docs
const DEFAULT_DOCS_DIR = path.resolve(__dirname, "../../../docs");

const TARGET_FILES = [
    "psc-chatbot-faq.md",
    "psc-chatbot-knowledge-base.md"
];

async function ensureSchema() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS \`rag_documents\` (
          \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(255) NOT NULL,
          \`source_file\` VARCHAR(255) NOT NULL,
          \`version\` VARCHAR(50) DEFAULT '1.0',
          \`status\` ENUM('active','archived') NOT NULL DEFAULT 'active',
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_source_file\` (\`source_file\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS \`rag_chunks\` (
          \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          \`document_id\` BIGINT UNSIGNED NOT NULL,
          \`chunk_index\` INT UNSIGNED NOT NULL,
          \`heading\` VARCHAR(255) DEFAULT NULL,
          \`heading_parent\` VARCHAR(255) DEFAULT NULL,
          \`content\` LONGTEXT NOT NULL,
          \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_chunk_document\` (\`document_id\`),
          FULLTEXT KEY \`ft_chunk_content\` (\`content\`, \`heading\`),
          CONSTRAINT \`fk_chunk_document\` FOREIGN KEY (\`document_id\`)
            REFERENCES \`rag_documents\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
}

export async function ingestDocument({ filePath, fileName, dryRun = false }) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File tidak ditemukan: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseMarkdownDocument(content, fileName);

    console.log(`📄 Memproses "${parsed.title}" (${fileName}) — ${parsed.chunks.length} potongan (chunks)`);

    if (dryRun) {
        parsed.chunks.forEach((chunk) => {
            const h = chunk.heading_parent ? `${chunk.heading_parent} > ${chunk.heading}` : chunk.heading;
            console.log(`   [Chunk #${chunk.chunk_index}] ${h} (${chunk.content.length} karakter)`);
        });
        return { documentId: null, title: parsed.title, chunkCount: parsed.chunks.length };
    }

    // Upsert rag_documents
    const [existingDocs] = await db.execute(
        `SELECT id FROM rag_documents WHERE source_file = ? LIMIT 1`,
        [fileName]
    );

    let documentId;
    if (existingDocs.length > 0) {
        documentId = existingDocs[0].id;
        await db.execute(
            `UPDATE rag_documents 
             SET title = ?, status = 'active', updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [parsed.title, documentId]
        );
        // Hapus chunks lama agar fresh
        await db.execute(`DELETE FROM rag_chunks WHERE document_id = ?`, [documentId]);
    } else {
        const [insertResult] = await db.execute(
            `INSERT INTO rag_documents (title, source_file, version, status) 
             VALUES (?, ?, '1.0', 'active')`,
            [parsed.title, fileName]
        );
        documentId = insertResult.insertId;
    }

    // Insert chunks
    for (const chunk of parsed.chunks) {
        await db.execute(
            `INSERT INTO rag_chunks (document_id, chunk_index, heading, heading_parent, content) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                documentId,
                chunk.chunk_index,
                chunk.heading || null,
                chunk.heading_parent || null,
                chunk.content
            ]
        );
    }

    console.log(`   ✅ Berhasil disimpan ke MySQL (document_id: ${documentId}, chunks: ${parsed.chunks.length})`);
    return { documentId, title: parsed.title, chunkCount: parsed.chunks.length };
}

export async function runIngestion({ docsDir = DEFAULT_DOCS_DIR, files = TARGET_FILES, dryRun = false } = {}) {
    console.log(`========================================`);
    console.log(`🚀 Memulai Ingestion Dokumen RAG`);
    console.log(`📂 Folder docs: ${docsDir}`);
    console.log(`⚙️  Mode: ${dryRun ? "DRY RUN (tanpa database)" : "DATABASE MYSQL"}`);
    console.log(`========================================`);

    if (!dryRun) {
        await ensureSchema();
    }

    let totalChunks = 0;
    const results = [];

    for (const fileName of files) {
        const filePath = path.join(docsDir, fileName);
        if (fs.existsSync(filePath)) {
            const res = await ingestDocument({ filePath, fileName, dryRun });
            results.push(res);
            totalChunks += res.chunkCount;
        } else {
            console.warn(`⚠️  File dilewati (tidak ada): ${fileName}`);
        }
    }

    console.log(`========================================`);
    console.log(`🎉 Ingestion selesai! Total dokumen: ${results.length}, Total chunks: ${totalChunks}`);
    console.log(`========================================`);

    return { results, totalChunks };
}

// Jalankan jika dieksekusi langsung
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const isDryRun = process.argv.includes("--dry-run");
    runIngestion({ dryRun: isDryRun })
        .then(() => {
            db.end();
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Gagal ingestion:", err);
            db.end();
            process.exit(1);
        });
}

