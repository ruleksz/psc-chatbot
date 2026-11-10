import test from "node:test";
import assert from "node:assert/strict";
import {
    retrieveChunks,
    buildRagContext,
    serializeRagSources,
    getInMemoryChunks
} from "../src/service/rag.service.js";

test("getInMemoryChunks memuat chunk dari file docs secara utuh", () => {
    const chunks = getInMemoryChunks();
    assert.ok(chunks.length >= 20, `Jumlah chunks minimal 20, didapat: ${chunks.length}`);
    assert.ok(chunks.some((c) => c.heading && c.heading.includes("mengirim pesan")));
});

test("retrieveChunks menemukan chunk yang tepat untuk pertanyaan FAQ", async () => {
    const chunks = await retrieveChunks("Bagaimana cara mengirim pesan?");
    assert.ok(chunks.length > 0);
    assert.ok(
        chunks[0].heading.includes("mengirim pesan") ||
        chunks[0].content.includes("Enter")
    );
});

test("retrieveChunks menemukan chunk untuk pertanyaan batas karakter", async () => {
    const chunks = await retrieveChunks("Berapa panjang pesan maksimal?");
    assert.ok(chunks.length > 0);
    assert.ok(
        chunks[0].heading.includes("panjang pesan") ||
        chunks[0].content.includes("4.000")
    );
});

test("buildRagContext memformat potongan dokumen dengan label [Sumber N — ...]", () => {
    const mockChunks = [
        {
            document_title: "FAQ PSC Chatbot",
            heading: "Cara Kirim Pesan",
            content: "Tekan enter untuk mengirim pesan."
        },
        {
            document_title: "FAQ PSC Chatbot",
            heading: "Batas Karakter",
            content: "Maksimal 4000 karakter."
        }
    ];

    const context = buildRagContext(mockChunks);
    assert.ok(context.includes("[Sumber 1 — FAQ PSC Chatbot: Cara Kirim Pesan]"));
    assert.ok(context.includes("Tekan enter untuk mengirim pesan."));
    assert.ok(context.includes("[Sumber 2 — FAQ PSC Chatbot: Batas Karakter]"));
    assert.ok(context.includes("Maksimal 4000 karakter."));
});

test("buildRagContext mengembalikan string kosong jika chunks kosong", () => {
    assert.equal(buildRagContext([]), "");
    assert.equal(buildRagContext(null), "");
});

test("serializeRagSources mengembalikan format array terstandarisasi", () => {
    const mockChunks = [
        {
            id: 10,
            document_title: "FAQ PSC Chatbot",
            heading: "Cara Kirim Pesan",
            heading_parent: "Menggunakan chat",
            chunk_index: 0,
            document_id: 1
        }
    ];

    const serialized = serializeRagSources(mockChunks);
    assert.equal(serialized.length, 1);
    assert.deepEqual(serialized[0], {
        id: 1,
        document_title: "FAQ PSC Chatbot",
        heading: "Cara Kirim Pesan",
        heading_parent: "Menggunakan chat",
        chunk_index: 0,
        document_id: 1
    });
});

