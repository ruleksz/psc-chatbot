import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownDocument } from "../src/utils/ragParser.js";

test("parseMarkdownDocument mengekstrak judul dokumen dari H1", () => {
    const md = `# Panduan Pengguna\n\n## Bagian 1\n### Sub-bagian\nIsi panduan`;
    const result = parseMarkdownDocument(md, "panduan.md");

    assert.equal(result.title, "Panduan Pengguna");
    assert.equal(result.sourceFile, "panduan.md");
    assert.equal(result.chunks.length, 1);
    assert.equal(result.chunks[0].heading, "Sub-bagian");
    assert.equal(result.chunks[0].heading_parent, "Bagian 1");
    assert.equal(result.chunks[0].content, "Isi panduan");
});

test("parseMarkdownDocument memecah setiap H3 menjadi chunk mandiri dan mempertahankan H2 sebagai parent", () => {
    const md = `
# FAQ PSC Chatbot

## Menggunakan chat

### Bagaimana cara mengirim pesan?
Ketik pesan pada kolom, lalu tekan Enter.
- Variasi: Cara bertanya ke bot?

### Berapa panjang pesan maksimal?
Maksimal 4000 karakter.
    `.trim();

    const result = parseMarkdownDocument(md, "psc-chatbot-faq.md");

    assert.equal(result.chunks.length, 2);
    assert.equal(result.chunks[0].chunk_index, 0);
    assert.equal(result.chunks[0].heading, "Bagaimana cara mengirim pesan?");
    assert.equal(result.chunks[0].heading_parent, "Menggunakan chat");
    assert.ok(result.chunks[0].content.includes("Ketik pesan"));
    assert.ok(result.chunks[0].content.includes("Cara bertanya"));

    assert.equal(result.chunks[1].chunk_index, 1);
    assert.equal(result.chunks[1].heading, "Berapa panjang pesan maksimal?");
    assert.equal(result.chunks[1].heading_parent, "Menggunakan chat");
    assert.ok(result.chunks[1].content.includes("4000 karakter"));
});

test("parseMarkdownDocument menangani seksi H2 tanpa H3 sebagai chunk tersendiri", () => {
    const md = `
# Basis Pengetahuan

## 1. Tentang PSC Chatbot
PSC Chatbot adalah aplikasi berbasis AI.
Cakupannya meliputi game kompetitif.
    `.trim();

    const result = parseMarkdownDocument(md, "kb.md");

    assert.equal(result.chunks.length, 1);
    assert.equal(result.chunks[0].heading, "1. Tentang PSC Chatbot");
    assert.equal(result.chunks[0].heading_parent, null);
    assert.ok(result.chunks[0].content.includes("PSC Chatbot adalah"));
});

