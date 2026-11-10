# Set Evaluasi Awal RAG PSC Chatbot

> **Status:** Draf evaluasi; jalankan setelah sumber FAQ dikonfirmasi.  
> **Tujuan:** Mengukur apakah pencarian menemukan bagian yang tepat dan apakah jawaban model sesuai sumber.  
> **Catatan:** Jawaban acuan merujuk pada draf [FAQ PSC Chatbot](./psc-chatbot-faq.md), bukan kebijakan final yang telah disahkan.

## Cara menggunakan set ini

Untuk setiap kasus, catat:

1. Potongan dokumen yang diambil sistem dan urutannya.
2. Apakah sumber acuan muncul di hasil pencarian teratas.
3. Jawaban model dan rujukan yang ditampilkan.
4. Penilaian manusia untuk ketepatan, dukungan sumber, dan penanganan kekosongan.
5. Waktu respons total.

Jangan menilai jawaban hanya dari kelancaran bahasanya. Jawaban harus sesuai dengan sumber yang benar-benar ditemukan.

## Pertanyaan yang jawabannya tersedia dalam FAQ

| ID | Pertanyaan uji | Sumber acuan | Inti jawaban yang diharapkan |
|---|---|---|---|
| A01 | Bagaimana cara mengirim pesan ke chatbot? | FAQ: “Bagaimana cara mengirim pesan?” | Ketik pesan lalu Enter atau tombol Kirim. Shift+Enter membuat baris baru. |
| A02 | Kalau saya tekan Shift+Enter, apakah pesannya langsung terkirim? | FAQ: “Bagaimana cara mengirim pesan?” | Tidak; Shift+Enter membuat baris baru. Enter mengirim pesan. |
| A03 | Ada batas jumlah karakter untuk pesan? | FAQ: “Berapa panjang pesan maksimal?” | Maksimal 4.000 karakter; pesan kosong tidak bisa dikirim. |
| A04 | Bagaimana memulai chat dari awal? | FAQ: “Bagaimana cara memulai percakapan baru?” | Pilih Percakapan baru. Percakapan dibuat saat pesan pertama dikirim tanpa ID percakapan lama. |
| A05 | Bagaimana membuka lagi percakapan lama? | FAQ: “Bagaimana cara membuka percakapan sebelumnya?” | Pilih judul percakapan pada sidebar. |
| A06 | Apakah chat saya bisa dihapus? | FAQ: “Apakah percakapan dapat dihapus?” | UI menyediakan tombol Hapus percakapan. Permanensi penghapusan dan pemulihan belum dikonfirmasi; jangan mengklaim lebih dari itu. |
| A07 | Saya bisa tanya strategi Valorant atau MLBB? | FAQ: “Topik apa yang bisa dibahas dengan PSC Esports Assistant?” | Bisa; strategi game kompetitif termasuk cakupan esports. |
| A08 | Bisa bantu pertanyaan yang tidak ada hubungannya dengan esports? | FAQ: “Apakah chatbot menjawab pertanyaan umum di luar esports?” | Asisten dibatasi untuk esports dan seharusnya menolak pertanyaan di luar cakupan. |
| A09 | Bisa kasih roster tim terbaru? | FAQ: “Apakah informasi jadwal, skor, atau roster selalu terkini?” | Roster dapat berubah; perlu sumber aktual dan jawaban tidak boleh dinyatakan pasti bila sumber tidak cukup. |
| A10 | Apa maksud angka [1] di jawaban? | FAQ: “Bagaimana cara membaca rujukan sumber pada jawaban?” | Itu rujukan ke sumber yang menyertai jawaban; cocokkan nomor dengan daftar sumber. |
| A11 | Kenapa chatbot bilang belum bisa memverifikasi? | FAQ: “Apa yang terjadi jika sumber tidak cukup?” | Sumber yang tersedia kurang; chatbot seharusnya tidak menebak. Pengguna dapat menambahkan konteks spesifik. |
| A12 | Apakah FAQ ini sudah otomatis dibaca chatbot? | FAQ: “Apakah chatbot saat ini menjawab dari dokumen internal PSC?” | Belum. Menambahkan dokumen FAQ tidak otomatis mengaktifkan RAG; perlu alur indeks dan retrieval. |

## Pertanyaan yang jawabannya belum tersedia atau perlu konfirmasi

Untuk kasus ini, hasil yang benar adalah menyatakan informasi belum tersedia/terkonfirmasi dan tidak mengarang kebijakan.

| ID | Pertanyaan uji | Mengapa belum terjawab | Perilaku yang diharapkan |
|---|---|---|---|
| U01 | Berapa lama PSC menyimpan percakapan saya? | Kebijakan retensi belum dikonfirmasi. | Mengatakan kebijakan belum tersedia pada sumber; tidak menyebut durasi. |
| U02 | Kalau saya menghapus chat, apakah datanya hilang permanen? | Dampak penghapusan dan pemulihan belum dikonfirmasi. | Menyebut tombol hapus tersedia, tetapi permanensi perlu dikonfirmasi. |
| U03 | Bagaimana cara memulihkan akun kalau lupa kata sandi? | Prosedur pemulihan akun tidak ada di FAQ. | Mengakui belum ada panduan; tidak mengarang langkah. |
| U04 | Siapa yang harus saya hubungi jika chatbot bermasalah? | Kontak dukungan belum dicantumkan. | Menyatakan kontak belum tersedia pada sumber. |
| U05 | Apakah semua dokumen internal bisa dilihat seluruh pengguna? | Aturan akses dokumen belum ditentukan. | Tidak membuat klaim akses; menyatakan perlu konfirmasi. |
| U06 | Kapan RAG PSC Chatbot akan diluncurkan? | Jadwal implementasi belum ditetapkan. | Menyatakan jadwal belum tersedia; tidak menebak tanggal. |
| U07 | Siapa pemilik dan penanggung jawab pembaruan FAQ? | Pemilik konten belum ditetapkan. | Mengakui informasi belum tersedia. |
| U08 | Apakah jawaban esports selalu berasal dari basis data internal PSC? | Implementasi saat ini belum menunjukkan retrieval dokumen internal. | Menjelaskan RAG internal belum terlihat aktif pada implementasi yang ditinjau. |

## Metrik dan rubrik

### Retrieval

- **Recall@k:** apakah sumber acuan muncul di antara k hasil teratas. Mulai dengan k=3 dan k=5.
- **MRR:** seberapa tinggi posisi hasil relevan pertama.
- **Precision@k:** berapa banyak hasil teratas yang benar-benar relevan.

### Jawaban

Beri nilai 0–2 untuk setiap dimensi:

| Dimensi | 0 | 1 | 2 |
|---|---|---|---|
| Ketepatan | Salah atau tidak menjawab | Sebagian benar | Benar dan menjawab pertanyaan |
| Dukungan sumber | Klaim tidak didukung | Didukung sebagian | Semua klaim utama didukung |
| Rujukan | Tidak ada/salah | Ada tetapi kurang tepat | Menunjuk sumber yang mendukung |
| Abstention | Mengarang saat sumber kosong | Ragu tetapi masih berspekulasi | Mengakui kekosongan dengan tepat |

Kasus A06 perlu dinilai dengan toleransi khusus: jawaban tidak boleh menyimpulkan penghapusan permanen. Kasus U01–U08 harus mendapat nilai abstention tertinggi hanya jika model tidak mengarang informasi.

### Target awal sebelum uji

Tetapkan target setelah baseline dijalankan. Untuk prototipe, target praktis yang dapat didiskusikan adalah sumber acuan muncul di top-5 pada sebagian besar kasus terjawab, tidak ada klaim penting tanpa dukungan, dan semua kasus tanpa jawaban ditangani tanpa mengarang. Target angka final sebaiknya disepakati tim setelah melihat baseline.

