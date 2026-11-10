# Rancangan Teknis RAG PSC Chatbot

> **Status:** Usulan desain untuk prototipe, belum diimplementasikan.  
> **Batasan:** Dokumen ini tidak mengubah atau menetapkan pilihan vendor/produk. Pilihan indeks dan model embedding perlu diuji berdasarkan infrastruktur yang tersedia.

## 1. Tujuan prototipe

Menguji apakah PSC Chatbot dapat menjawab pertanyaan penggunaan aplikasi berdasarkan FAQ/panduan internal, mengambil bagian sumber yang relevan, dan mengakui saat jawabannya tidak tersedia.

Ruang lingkup awal disarankan hanya dokumen FAQ/panduan PSC Chatbot yang telah ditinjau. Jangan mencampur basis ini dengan fakta esports aktual seperti skor atau jadwal, karena alur sumber web yang sudah ada menangani jenis informasi tersebut dan informasinya cepat berubah.

## 2. Komponen dan tanggung jawab

| Komponen | Tanggung jawab |
|---|---|
| Frontend React | Mengirim pertanyaan dan menampilkan jawaban serta rujukan yang diberikan backend. |
| Backend Express | Memvalidasi permintaan, menerapkan aturan akses, melakukan retrieval, merangkai konteks, memanggil LLM, dan menyimpan jawaban/sumber. |
| Sumber dokumen | FAQ dan panduan internal yang sudah disetujui pemilik konten. |
| Proses ingestion | Mengekstrak teks, memecah bagian, menambahkan metadata, menghitung embedding, dan memperbarui indeks. Bisa dijalankan terpisah dari permintaan chat. |
| Indeks pencarian | Menyimpan teks potongan, metadata, dan representasi untuk menemukan bagian relevan. |
| LLM | Membuat jawaban dari pertanyaan dan konteks yang disediakan backend. Tidak diberi akses bebas ke database aplikasi. |
| MariaDB/MySQL aplikasi | Tetap menjadi penyimpanan akun dan percakapan; pemakaian sebagai indeks vektor perlu divalidasi terhadap versi dan kemampuan deployment. |

## 3. Alur ingestion dokumen

1. Pemilik konten menyetujui dokumen dan versinya.
2. Sistem membaca format yang disepakati dan mengekstrak teks.
3. Teks dibersihkan dengan tetap mempertahankan judul, heading, dan urutan bagian.
4. Bagian dipecah menurut struktur dokumen; FAQ sebaiknya menjaga pasangan pertanyaan-jawaban tetap bersama.
5. Setiap potongan diberi metadata: `document_id`, judul, bagian, versi, tanggal berlaku/pembaruan, status, dan aturan akses.
6. Sistem membuat embedding untuk potongan dan menyimpan teks serta metadata di indeks.
7. Saat dokumen berubah atau dicabut, indeks diperbarui agar versi lama tidak terus muncul.

Ukuran potongan dan overlap belum ditetapkan. Mulai dari pemisahan berdasarkan heading/FAQ, lalu uji beberapa konfigurasi menggunakan set evaluasi pada `rag-evaluation-set.md`.

## 4. Alur menjawab pertanyaan

1. Backend menerima pesan dan mempertahankan validasi yang sudah ada.
2. Pesan diklasifikasikan ke jalur yang sesuai: pertanyaan basis pengetahuan PSC, pertanyaan esports aktual yang memerlukan sumber web, atau di luar cakupan.
3. Untuk pertanyaan basis pengetahuan, backend menerapkan filter akses sebelum retrieval.
4. Sistem mencari potongan relevan. Untuk prototipe, bandingkan pencarian semantik dengan pencarian kata kunci/hybrid jika istilah produk atau nama fitur sering penting.
5. Backend memilih beberapa hasil teratas, memakai ambang relevansi, dan tidak mengirim konteks yang tidak relevan.
6. Prompt menyertakan pertanyaan, konteks berlabel sumber, dan instruksi untuk tidak mengarang serta mengakui jika konteks tidak cukup.
7. LLM membuat jawaban dengan rujukan ke metadata sumber.
8. Backend mengembalikan jawaban dan daftar rujukan. Catat metrik operasional dan evaluasi tanpa menyimpan data sensitif yang tidak diperlukan.

## 5. Pemisahan dari alur chatbot saat ini

Proyek sudah memiliki alur pencarian sumber web untuk pertanyaan esports. RAG dokumen internal sebaiknya menjadi jalur retrieval yang jelas dan terpisah pada awalnya:

- Pertanyaan tentang panduan/FAQ internal → indeks dokumen PSC.
- Pertanyaan aktual tentang esports → alur sumber web yang sudah ada.
- Pertanyaan di luar cakupan → penolakan sesuai kebijakan asisten.
- Pertanyaan campuran → tentukan apakah perlu dua sumber; jika ya, labeli dan tampilkan sumber internal serta web secara terpisah.

Klasifikasi jalur harus diuji agar pertanyaan tidak dikirim ke indeks yang salah. Jangan menjadikan seluruh riwayat chat sebagai basis pengetahuan.

## 6. Kontrak data konseptual

Setiap potongan indeks setidaknya perlu memiliki:

- ID dokumen dan ID potongan yang stabil.
- Teks potongan.
- Embedding.
- Judul dokumen dan heading/bagian.
- Versi/status dokumen serta tanggal pembaruan.
- Informasi akses atau grup pengguna yang diizinkan.
- Lokasi untuk membuat rujukan manusiawi, seperti nomor halaman, URL internal, atau ID FAQ.

Indeks tidak menggantikan sumber asli. Simpan sumber kanonis terpisah dan perlakukan indeks sebagai salinan pencarian yang bisa dibangun ulang.

## 7. Keamanan dan kualitas

- Terapkan hak akses saat retrieval, bukan hanya di tampilan frontend.
- Jangan mengirim dokumen di luar izin pengguna ke LLM.
- Perlakukan teks dokumen sebagai data, bukan instruksi sistem; dokumen tidak boleh mengubah aturan atau cakupan chatbot.
- Sertakan identitas sumber pada setiap potongan agar sitasi tidak dibuat oleh model dari ingatan.
- Gunakan ambang retrieval dan jawaban abstain saat tidak ada hasil yang memadai.
- Catat versi dokumen dan konfigurasi indeks agar hasil evaluasi dapat direproduksi.
- Hindari memasukkan rahasia, kredensial, atau data personal ke korpus uji.

## 8. Evaluasi dan kriteria keputusan

Gunakan `rag-evaluation-set.md` sebelum dan sesudah perubahan konfigurasi. Ukur retrieval, ketepatan jawaban, dukungan sitasi, abstention, latensi, dan biaya.

Bandingkan setidaknya:

1. Pencarian kata kunci sebagai baseline.
2. Pencarian semantik menggunakan embedding.
3. Pencarian hybrid bila baseline menunjukkan masalah istilah spesifik.

Pilih pendekatan berdasarkan hasil pada pertanyaan uji, kualitas sitasi, waktu respons, biaya, kemudahan pembaruan, dan kemampuan deployment. Jangan memilih hanya karena satu jawaban demo terlihat bagus.

## 9. Tahapan kerja tanpa implementasi kode

1. Konfirmasi FAQ dan pemilik dokumen.
2. Tetapkan aturan akses dan sumber kanonis.
3. Jalankan penilaian manual atas 20 kasus evaluasi.
4. Pilih pendekatan indeks berdasarkan kebutuhan deployment dan hasil baseline.
5. Sepakati desain ingestion, metadata, dan format sitasi.
6. Setelah desain disetujui, implementasikan prototipe pada branch fitur dan evaluasi sebelum rilis.

## 10. Keputusan yang masih terbuka

- Apakah basis awal hanya FAQ/panduan atau termasuk dokumen lain.
- Format dokumen yang perlu didukung.
- Siapa yang boleh mengunggah, memperbarui, dan mencabut dokumen.
- Apakah semua dokumen boleh diakses semua pengguna.
- Lokasi indeks dan teknologi yang kompatibel dengan deployment.
- Model embedding, bahasa dokumen, dan biaya pemrosesan.
- Ambang relevansi, jumlah hasil, dan format sitasi.
- Prosedur retensi log dan data evaluasi.

