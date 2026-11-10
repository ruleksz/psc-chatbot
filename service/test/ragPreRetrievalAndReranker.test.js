import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuery, expandQuery, resolveFollowUpQuery } from "../src/service/rag.preRetrieval.js";
import { scoreChunkRelevance, rerankChunks } from "../src/service/rag.reranker.js";

test("normalizeQuery membersihkan simbol dan spasi berlebih", () => {
    assert.equal(normalizeQuery("  Bagaimana cara??!!  Kirim pesan... "), "bagaimana cara kirim pesan");
    assert.equal(normalizeQuery("Shift+Enter"), "shift+enter");
});

test("resolveFollowUpQuery merangkai konteks multi-turn", () => {
    const history = [
        { role: "user", content: "Bagaimana cara hapus chat?" },
        { role: "assistant", content: "Klik tombol hapus percakapan." }
    ];

    const followUp = "Apakah itu permanen?";
    const resolved = resolveFollowUpQuery(followUp, history);
    assert.ok(resolved.includes("konteks: menghapus percakapan atau chat"));
});

test("expandQuery memperluas sinonim dan mendeteksi token khusus", () => {
    const res = expandQuery("Gimana cara kirim pesan?");
    assert.ok(res.keywords.includes("kirim"));
    assert.ok(res.keywords.includes("shortcut") || res.keywords.includes("enter"));

    const specialTokenRes = expandQuery("Apa arti [1] di chat?");
    assert.ok(specialTokenRes.keywords.includes("[1]"));
    assert.ok(specialTokenRes.keywords.includes("rujukan"));
});

test("scoreChunkRelevance memberi bobot tinggi pada kecocokan heading dan kata kunci kritis", () => {
    const chunkA = {
        heading: "Bagaimana cara mengirim pesan?",
        heading_parent: "Menggunakan chat",
        content: "Tekan enter atau pilih tombol kirim.",
        score: 10
    };
    const chunkB = {
        heading: "1. Tentang PSC Chatbot",
        heading_parent: null,
        content: "Aplikasi percakapan tentang esports.",
        score: 10
    };

    const scoreA = scoreChunkRelevance(chunkA, "cara kirim pesan", ["kirim", "pesan"]);
    const scoreB = scoreChunkRelevance(chunkB, "cara kirim pesan", ["kirim", "pesan"]);

    assert.ok(scoreA > scoreB, `Skor chunk A (${scoreA}) harus lebih tinggi dari chunk B (${scoreB})`);
});

test("rerankChunks menyaring noise dan mengurutkan secara tepat", () => {
    const chunks = [
        { id: 1, heading: "Umum", content: "Teks acak tanpa hubungan", score: 2 },
        { id: 2, heading: "Berapa panjang pesan maksimal?", content: "Maksimal 4000 karakter", score: 5 },
    ];

    const reranked = rerankChunks("panjang pesan", chunks, {
        keywords: ["panjang", "pesan", "karakter"],
        topK: 1,
        minScore: 5
    });

    assert.equal(reranked.length, 1);
    assert.equal(reranked[0].id, 2);
});

