# Strategi Chunking dan Pilihan Pencarian RAG PSC Chatbot

> **Status:** Draf keputusan; pilihan final ditentukan setelah evaluasi baseline.  
> **Tujuan:** Menetapkan cara dokumen dipecah menjadi potongan (chunking) dan metode pencarian yang dipakai untuk retrieval, dengan mempertimbangkan bahwa database yang digunakan adalah MySQL (MariaDB).

---

## 1. Mengapa chunking penting

Model bahasa memiliki batas konteks (token window). Mengirim seluruh dokumen sekaligus tidak efisien dan bisa melewati batas token. Chunking memecah dokumen menjadi bagian-bagian kecil sehingga hanya bagian yang paling relevan yang dikirim ke LLM.

Kualitas retrieval sangat bergantung pada cara dokumen dipecah:
- Potongan terlalu kecil → konteks hilang, jawaban tidak lengkap.
- Potongan terlalu besar → terlalu banyak token terbuang, batas konteks terlampaui.
- Potongan yang memisahkan pasangan pertanyaan-jawaban FAQ → retrieval bisa menemukan pertanyaan tapi tidak jawabannya.

---

## 2. Strategi chunking yang disarankan untuk dokumen PSC

### Strategi utama: Pemisahan berdasarkan heading (structure-aware)

Dokumen PSC saat ini berformat Markdown dengan heading `##` dan `###`. Strategi ini memanfaatkan struktur tersebut:

```
## Menggunakan chat                        ← heading level 2

### Bagaimana cara mengirim pesan?         ← heading level 3 = chunk batas atas
Ketik pesan pada kolom...                  ← isi chunk
- Variasi pertanyaan: ...
- Sumber: ...
                                           ← baris kosong sebelum heading berikutnya
### Berapa panjang pesan maksimal?         ← heading level 3 berikutnya = chunk baru
Pesan dibatasi maksimal 4.000 karakter...
```

**Aturan pemisahan:**
- Setiap `###` beserta isinya sampai `###` berikutnya = satu chunk.
- Jika dokumen tidak punya `###`, gunakan `##` sebagai batas.
- Pertahankan heading `##` induk sebagai metadata chunk (`heading_parent`), bukan isi chunk.
- Pasangan pertanyaan-jawaban FAQ **tidak boleh dipisahkan** ke chunk berbeda.

**Metadata yang disimpan per chunk:**

| Field | Nilai contoh |
|---|---|
| `document_id` | 1 |
| `document_title` | "FAQ Penggunaan PSC Chatbot" |
| `source_file` | "psc-chatbot-faq.md" |
| `chunk_index` | 0 (urutan dalam dokumen) |
| `heading` | "Bagaimana cara mengirim pesan?" |
| `heading_parent` | "Menggunakan chat" |
| `content` | Teks lengkap isi chunk |

---

## 3. Ukuran chunk dan overlap

### Ukuran chunk

Untuk dokumen FAQ PSC yang ada sekarang, setiap pasangan `###`+isi cenderung pendek (50–300 kata). Ini sudah dalam rentang ideal untuk dikirim ke LLM.

Jangan menetapkan batas karakter tetap yang memotong di tengah kalimat. Biarkan batas alami dokumen (heading) yang menentukan ukuran.

Jika di masa depan ada dokumen panjang tanpa heading internal (misalnya panduan berhalaman), tambahkan batas sekunder: maksimal **500 kata per chunk** dengan **overlap 1–2 kalimat** dari akhir chunk sebelumnya.

### Overlap

Untuk dokumen FAQ dengan heading terstruktur, **overlap tidak diperlukan** karena setiap chunk sudah mandiri.

Overlap baru relevan jika ada dokumen naratif panjang tanpa heading. Tentukan setelah jenis dokumen yang akan diindeks dikonfirmasi.

---

## 4. Pilihan pencarian (retrieval)

### Pilihan 1 — MySQL FULLTEXT (disarankan untuk prototipe)

MySQL mendukung pencarian teks penuh (FULLTEXT) yang bisa langsung dipakai tanpa instalasi tambahan.

**Cara kerja:**
```sql
SELECT
  rc.id,
  rc.heading,
  rc.content,
  rd.title AS document_title,
  MATCH(rc.content) AGAINST(? IN BOOLEAN MODE) AS score
FROM rag_chunks rc
JOIN rag_documents rd ON rc.document_id = rd.id
WHERE rd.status = 'active'
  AND MATCH(rc.content) AGAINST(? IN BOOLEAN MODE) > 0
ORDER BY score DESC
LIMIT 5;
```

**Kelebihan:**
- Tidak butuh library tambahan.
- Terintegrasi langsung dengan MySQL yang sudah dipakai.
- Cepat untuk corpus kecil seperti FAQ PSC.
- Mudah di-debug (bisa dilihat langsung di phpMyAdmin).

**Kekurangan:**
- Bergantung pada kecocokan kata kunci; tidak memahami sinonim atau variasi bahasa alami.
- Jika pengguna bertanya "bagaimana cara ngirim chat?" dan dokumen menyebut "mengirim pesan", skor bisa rendah.
- Untuk Bahasa Indonesia, tokenisasi default MySQL mungkin kurang optimal.

**Mitigasi untuk prototipe:**
- Simpan variasi pertanyaan (`Variasi pertanyaan:`) yang sudah ada di dokumen FAQ sebagai bagian dari isi chunk, sehingga istilah alternatif ikut terindeks.
- Uji dengan set evaluasi `rag-evaluation-set.md` dan catat kasus yang gagal karena variasi kata.

---

### Pilihan 2 — MySQL + ChromaDB (embedding/semantik)

Jika hasil evaluasi Pilihan 1 menunjukkan banyak kegagalan karena variasi kata, tambahkan ChromaDB sebagai vector store terpisah.

**Alur:**
1. Saat ingestion: hitung embedding teks chunk menggunakan model embedding (misalnya `multilingual-e5-small` via `@xenova/transformers` di Node.js) → simpan ke ChromaDB.
2. Saat retrieval: hitung embedding pesan pengguna → cari di ChromaDB → ambil ID chunk → query MySQL untuk teks dan metadata.

**Model embedding yang bisa dipertimbangkan:**

| Model | Bahasa | Ukuran | Cara pakai di Node.js |
|---|---|---|---|
| `multilingual-e5-small` | Multilingual (termasuk ID) | ~120MB | `@xenova/transformers` (lokal) |
| `paraphrase-multilingual-MiniLM-L12-v2` | Multilingual | ~420MB | `@xenova/transformers` (lokal) |
| Groq/OpenAI embedding API | Bergantung model | — | API call (biaya per token) |

**Kelebihan:** Memahami sinonim dan variasi bahasa alami.  
**Kekurangan:** Butuh instalasi ChromaDB (Python atau Docker), proses ingestion embedding, dan kompleksitas deployment lebih tinggi.

**Rekomendasi:** Tunda Pilihan 2 sampai baseline Pilihan 1 dievaluasi. Jika ≥ 30% kasus evaluasi gagal karena variasi kata, baru pertimbangkan pindah.

---

### Pilihan 3 — Hybrid (FULLTEXT + semantik)

Gabungkan skor FULLTEXT MySQL dan skor semantik ChromaDB menggunakan bobot:

```
skor_final = (bobot_fulltext × skor_fulltext) + (bobot_semantik × skor_semantik)
```

Pilihan ini paling akurat tapi juga paling kompleks. Pertimbangkan hanya setelah kedua pilihan sebelumnya sudah diuji.

---

## 5. Ambang relevansi

Ambang (threshold) adalah skor minimum agar sebuah chunk dianggap relevan dan diikutkan dalam konteks.

**Untuk FULLTEXT MySQL:** Mulai tanpa ambang tetap (hanya `score > 0`), lalu amati distribusi skor pada set evaluasi. Setelah baseline dijalankan, tentukan ambang berdasarkan nilai yang memisahkan hasil relevan dari yang tidak relevan.

**Untuk semantik ChromaDB:** Mulai dengan cosine similarity ≥ 0.5, evaluasi, dan sesuaikan.

Jangan menetapkan ambang sebelum ada data baseline, karena angka yang salah bisa menyebabkan semua pertanyaan tidak menemukan chunk (terlalu tinggi) atau mengirim chunk tidak relevan ke LLM (terlalu rendah).

---

## 6. Ringkasan keputusan untuk prototipe

| Aspek | Keputusan prototipe | Catatan |
|---|---|---|
| Strategi chunking | Pemisahan berdasarkan heading `###` | Cocok untuk FAQ Markdown yang ada |
| Ukuran chunk | Alami (satu heading + isinya) | Tidak ada batas karakter tetap untuk tahap ini |
| Overlap | Tidak diperlukan | Dokumen FAQ sudah modular per heading |
| Metode retrieval | FULLTEXT MySQL | Mulai tanpa dependensi baru |
| Jumlah hasil teratas | Top-5 | Evaluasi dan sesuaikan |
| Ambang relevansi | `score > 0` (baseline) | Tentukan nilai tetap setelah baseline dijalankan |
| Vector store | MySQL saja (prototipe) | Tambahkan ChromaDB jika evaluasi menunjukkan perlu |

---

## 7. Hal yang perlu diuji setelah implementasi

Gunakan kasus A01–A12 dari `rag-evaluation-set.md`:

1. Apakah chunk yang benar muncul di top-5 untuk setiap pertanyaan?
2. Berapa banyak kasus gagal karena variasi kata (bukan karena dokumen tidak ada)?
3. Apakah skor FULLTEXT cukup membedakan chunk relevan dari tidak relevan?
4. Berapa latensi retrieval rata-rata untuk corpus saat ini?

Catat hasilnya sebelum memutuskan apakah perlu pindah dari Pilihan 1 ke Pilihan 2.
