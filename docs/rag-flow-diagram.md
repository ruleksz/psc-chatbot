# Diagram Alur Teknis RAG PSC Chatbot

> **Status:** Draf rancangan; belum diimplementasikan.  
> **Tujuan:** Menggambarkan secara teknis bagaimana alur RAG dokumen internal menyisip ke dalam arsitektur `chat.service.js` yang sudah ada, tanpa mengganggu alur sumber web yang sudah berjalan.

---

## 1. Alur keseluruhan sistem (saat ini vs. sesudah RAG)

### Alur saat ini

```
Pengguna
  │
  ▼
[chat.controller.js]
  ├─ Validasi pesan (panjang, tipe)
  ├─ Buat/validasi conversation_id
  ├─ Ambil riwayat percakapan dari MySQL
  └─ Simpan pesan user ke MySQL
        │
        ▼
[chat.service.js — generateChatReply()]
  │
  ├─ Tahap 1: Cek getVerifiedEsportsAnswer()
  │     ├─ Cocok (M1/M-Series) → kembalikan jawaban hardcoded
  │     └─ Tidak cocok → lanjut
  │
  ├─ Tahap 2: isEsportsRelated() via Groq (classifier)
  │     ├─ false → kembalikan out-of-scope response
  │     └─ true → lanjut
  │
  ├─ Tahap 3: findOfficialSources() (pencarian web)
  │     ├─ Berhasil & ada hasil → pakai OFFICIAL_SOURCE_PROMPT
  │     ├─ Berhasil & tidak ada → pakai UNVERIFIED_SOURCE_PROMPT
  │     └─ Gagal → pakai UNVERIFIED_SOURCE_PROMPT
  │
  └─ Tahap 4: Groq API → kembalikan { reply, sources, model, usage }
        │
        ▼
[chat.controller.js]
  └─ Simpan jawaban AI ke MySQL → kirim response ke frontend
```

---

### Alur sesudah RAG ditambahkan

```
Pengguna
  │
  ▼
[chat.controller.js]
  ├─ Validasi pesan (tidak berubah)
  ├─ Buat/validasi conversation_id (tidak berubah)
  ├─ Ambil riwayat percakapan dari MySQL (tidak berubah)
  └─ Simpan pesan user ke MySQL (tidak berubah)
        │
        ▼
[chat.service.js — generateChatReply()]
  │
  ├─ Tahap 1: Cek getVerifiedEsportsAnswer()  ← TIDAK BERUBAH
  │     ├─ Cocok → kembalikan jawaban hardcoded
  │     └─ Tidak cocok → lanjut
  │
  ├─ Tahap 2: isEsportsRelated() via Groq     ← TIDAK BERUBAH
  │     ├─ false → kembalikan out-of-scope response
  │     └─ true → lanjut
  │
  ├─ Tahap 2b: classifyQueryRoute()           ← BARU
  │     ├─ "psc_guide" → pertanyaan tentang panduan/FAQ PSC Chatbot
  │     │       │
  │     │       ▼
  │     │   [rag.service.js] — retrieveChunks()
  │     │       ├─ Ada potongan relevan
  │     │       │     └─ susun rag_context → pakai RAG_KNOWLEDGE_PROMPT
  │     │       └─ Tidak ada potongan relevan
  │     │             └─ pakai RAG_NO_RESULT_PROMPT
  │     │
  │     └─ "esports_factual" → pertanyaan fakta esports
  │             │
  │             ▼ (lanjut ke Tahap 3 seperti biasa)
  │
  ├─ Tahap 3: findOfficialSources()            ← TIDAK BERUBAH
  │     (hanya dijalankan untuk jalur "esports_factual")
  │
  └─ Tahap 4: Groq API                         ← TIDAK BERUBAH (strukturnya)
        │
        ▼
[chat.controller.js]
  └─ Simpan jawaban + rag_sources ke MySQL → kirim response
```

---

## 2. Komponen baru yang perlu dibuat

| File | Tanggung jawab |
|---|---|
| `service/src/service/rag.service.js` | Menghubungkan ke vector store, menjalankan retrieval, menyusun `rag_context` |
| `service/src/service/rag.classifier.js` | Mengklasifikasikan pesan ke jalur `psc_guide` atau `esports_factual` |
| `service/src/database/rag_migration.sql` | Skema tabel MySQL untuk dokumen dan potongan (lihat Bagian 4) |
| `docs/rag-chunking-strategy.md` | Keputusan chunking dan pilihan vector store |
| `docs/rag-prompt-templates.md` | Template prompt RAG (sudah dibuat) |

---

## 3. Klasifikasi jalur query (`classifyQueryRoute`)

Sebelum retrieval, backend perlu menentukan apakah pertanyaan menuju dokumen internal atau sumber web. Ada dua pendekatan:

### Opsi A — Classifier LLM (mirip `isEsportsRelated`)

Kirim pesan ke Groq dengan prompt singkat yang mengembalikan JSON:

```json
{ "route": "psc_guide" }
```
atau
```json
{ "route": "esports_factual" }
```

**Kelebihan:** Fleksibel, bisa menangani variasi bahasa.  
**Kekurangan:** Menambah satu panggilan API (latensi + biaya).

### Opsi B — Aturan kata kunci

Deteksi berdasarkan kata kunci seperti "cara", "bagaimana", "tombol", "fitur", "percakapan", "hapus chat", "kirim pesan", "shift+enter", dsb.

**Kelebihan:** Cepat, tanpa biaya API tambahan.  
**Kekurangan:** Kurang fleksibel untuk variasi pertanyaan yang tidak terduga.

### Opsi C — Hybrid

Gunakan aturan kata kunci dulu; jika tidak cocok, gunakan classifier LLM.

**Rekomendasi untuk prototipe:** Mulai dengan Opsi B (kata kunci) agar cepat diuji, lalu tingkatkan ke Opsi C jika banyak pertanyaan lolos klasifikasi yang salah.

---

## 4. Skema MySQL untuk RAG

Karena MySQL tidak mendukung pencarian vektor secara native, ada dua pendekatan yang bisa dipilih:

### Pilihan 1 — Hanya MySQL (keyword/fulltext, tanpa embedding)

```sql
-- Tabel dokumen sumber
CREATE TABLE rag_documents (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)    NOT NULL,
  source_file VARCHAR(255)    NOT NULL COMMENT 'Nama file asli, misal: psc-chatbot-faq.md',
  version     VARCHAR(50)     DEFAULT NULL,
  status      ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel potongan dokumen (chunks)
CREATE TABLE rag_chunks (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT UNSIGNED NOT NULL,
  chunk_index INT UNSIGNED    NOT NULL COMMENT 'Urutan potongan dalam dokumen',
  heading     VARCHAR(255)    DEFAULT NULL COMMENT 'Heading/bagian asal potongan',
  content     LONGTEXT        NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_chunk_content (content),
  KEY idx_chunk_document (document_id),
  CONSTRAINT fk_chunk_document FOREIGN KEY (document_id)
    REFERENCES rag_documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Pencarian:** Gunakan `MATCH(content) AGAINST(? IN BOOLEAN MODE)` — gratis, tidak perlu library tambahan, cocok untuk prototipe.

### Pilihan 2 — MySQL + ChromaDB terpisah (embedding/semantik)

MySQL tetap menyimpan dokumen dan metadata. ChromaDB (dijalankan lokal) menyimpan embedding dan melayani pencarian semantik.

```
Backend Node.js
  ├─ MySQL       → metadata dokumen, teks chunk, log evaluasi
  └─ ChromaDB    → embedding vector, pencarian semantik (via HTTP localhost)
```

**Kelebihan:** Lebih akurat untuk pertanyaan dengan variasi bahasa alami.  
**Kekurangan:** Butuh proses ingestion embedding (model embedding + ChromaDB harus berjalan), lebih kompleks untuk deployment.

**Rekomendasi untuk prototipe:** Mulai dengan **Pilihan 1 (fulltext MySQL)** karena tidak butuh dependensi baru dan langsung bisa diuji. Jika hasil evaluasi menunjukkan banyak pertanyaan tidak terjawab karena variasi kata, baru pindah ke Pilihan 2.

---

## 5. Alur ingestion dokumen

```
Dokumen .md disetujui pemilik konten
  │
  ▼
Script ingestion (dijalankan manual/terpisah dari server)
  ├─ Baca file .md
  ├─ Pecah berdasarkan heading (##, ###)
  ├─ Setiap pasangan heading+isi = satu chunk
  ├─ Simpan ke rag_documents dan rag_chunks di MySQL
  └─ (Opsional, Pilihan 2) Hitung embedding dan simpan ke ChromaDB
```

File ingestion disarankan sebagai script Node.js terpisah di:  
`service/src/scripts/ingest-rag-documents.js`

Script ini dijalankan sekali saat dokumen diperbarui, bukan saat server menerima permintaan chat.

---

## 6. Alur retrieval saat permintaan chat masuk

```
Pesan pengguna: "Bagaimana cara mengirim pesan?"
  │
  ▼
classifyQueryRoute() → "psc_guide"
  │
  ▼
retrieveChunks(pesan)
  ├─ Pilihan 1: MATCH(content) AGAINST('cara mengirim pesan' IN BOOLEAN MODE)
  │             → kembalikan top-5 baris rag_chunks
  └─ Pilihan 2: Embedding pesan → cari di ChromaDB → ambil chunk_id
                → query MySQL WHERE id IN (chunk_id_list)
  │
  ▼
Filter: buang potongan dengan skor di bawah ambang
  │
  ├─ Ada potongan → susun rag_context → kirim ke Groq dengan RAG_KNOWLEDGE_PROMPT
  └─ Kosong      → kirim ke Groq dengan RAG_NO_RESULT_PROMPT
```

---

## 7. Nilai kembalian yang diperbarui

Saat RAG aktif, `generateChatReply` perlu mengembalikan:

```js
{
  reply: "...",
  sources: [...],          // sumber web (sudah ada)
  rag_sources: [           // sumber dokumen internal (baru)
    {
      document_title: "FAQ PSC Chatbot",
      heading: "Bagaimana cara mengirim pesan?",
      chunk_index: 0,
      document_id: 1
    }
  ],
  model: "...",
  usage: { ... }
}
```

---

## 8. Keputusan yang masih perlu disepakati

- Pilihan pencarian: fulltext MySQL saja, atau tambahkan ChromaDB?
- Ambang relevansi untuk fulltext: berapa skor minimum `MATCH ... AGAINST`?
- Berapa jumlah chunk teratas yang dikirim ke LLM?
- Apakah `rag_sources` disimpan ke tabel `messages` di MySQL bersama `sources`?
- Apakah frontend menampilkan `rag_sources` dengan tampilan berbeda dari sumber web?
