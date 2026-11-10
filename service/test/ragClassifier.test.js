import test from "node:test";
import assert from "node:assert/strict";
import { classifyRouteByRules, classifyQueryRoute } from "../src/service/rag.classifier.js";

test("classifyRouteByRules mengklasifikasikan pertanyaan panduan/fitur PSC ke 'psc_guide'", () => {
    const guideQueries = [
        "Bagaimana cara mengirim pesan ke chatbot?",
        "Kalau saya tekan Shift+Enter, apakah pesannya langsung terkirim?",
        "Ada batas jumlah karakter untuk pesan?",
        "Bagaimana memulai chat dari awal?",
        "Bagaimana membuka lagi percakapan lama?",
        "Apakah chat saya bisa dihapus?",
        "Bisa bantu pertanyaan yang tidak ada hubungannya dengan esports?",
        "Apa maksud angka [1] di jawaban?",
        "Kenapa chatbot bilang belum bisa memverifikasi?",
        "Apakah FAQ ini sudah otomatis dibaca chatbot?",
        "Berapa lama PSC menyimpan percakapan saya?",
        "Kalau saya menghapus chat, apakah datanya hilang permanen?",
        "Bagaimana cara memulihkan akun kalau lupa kata sandi?",
        "Siapa yang harus saya hubungi jika chatbot bermasalah?",
        "Apakah semua dokumen internal bisa dilihat seluruh pengguna?",
        "Kapan RAG PSC Chatbot akan diluncurkan?",
        "Siapa pemilik dan penanggung jawab pembaruan FAQ?",
        "Apakah jawaban esports selalu berasal dari basis data internal PSC?"
    ];

    for (const q of guideQueries) {
        const route = classifyRouteByRules(q);
        assert.equal(route, "psc_guide", `Gagal mengklasifikasikan ke psc_guide: "${q}"`);
    }
});

test("classifyRouteByRules mengklasifikasikan pertanyaan fakta/turnamen esports ke 'esports_factual'", () => {
    const factualQueries = [
        "Siapa juara turnamen MPL ID Season 13?",
        "Kapan jadwal pertandingan VCT Masters Madrid?",
        "Bagaimana klasemen sementara MPL Season 14?",
        "Bisa kasih info roster terbaru RRQ?",
        "Jelaskan build item dan draft hero Mobile Legends"
    ];

    for (const q of factualQueries) {
        const route = classifyRouteByRules(q);
        assert.equal(route, "esports_factual", `Gagal mengklasifikasikan ke esports_factual: "${q}"`);
    }
});

test("classifyQueryRoute menggunakan aturan pola jika cocok tanpa memanggil LLM", async () => {
    const route = await classifyQueryRoute({
        message: "Bagaimana cara mengirim pesan?"
    });
    assert.equal(route, "psc_guide");
});

test("classifyQueryRoute fallback ke esports_factual jika ambigu dan tanpa LLM", async () => {
    const route = await classifyQueryRoute({
        message: "Halo test"
    });
    assert.equal(route, "esports_factual");
});

