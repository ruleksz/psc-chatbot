# FAQ Penggunaan PSC Chatbot

> **Status:** Draf untuk ditinjau pemilik proyek  
> **Tujuan:** Kandidat dokumen sumber untuk prototipe RAG PSC Chatbot.  
> **Catatan:** Jawaban di bawah disusun dari implementasi yang tersedia. Konfirmasi kembali sebelum dipublikasikan kepada pengguna.

## Menggunakan chat

### Bagaimana cara mengirim pesan?

Ketik pesan pada kolom **“Tulis pesan di sini...”**, lalu tekan **Enter** atau pilih tombol **Kirim**. Untuk membuat baris baru tanpa mengirim pesan, tekan **Shift+Enter**.

- **Variasi pertanyaan:** Bagaimana cara bertanya ke chatbot?; Tombol apa untuk mengirim pesan?
- **Sumber:** `client/src/components/Chat/ChatInput.jsx`

### Berapa panjang pesan maksimal?

Pesan dibatasi maksimal 4.000 karakter oleh backend. Pesan kosong juga tidak dapat dikirim.

- **Variasi pertanyaan:** Apakah ada batas karakter?; Kenapa pesan saya tidak bisa dikirim?
- **Sumber:** `service/src/controllers/chat.controller.js`

### Bagaimana cara memulai percakapan baru?

Pilih tombol **“Percakapan baru”** pada sidebar. Percakapan baru juga dibuat ketika pesan pertama dikirim tanpa ID percakapan yang sudah ada.

- **Variasi pertanyaan:** Bagaimana membuka chat baru?; Cara memulai obrolan dari awal?
- **Sumber:** `client/src/components/Sidebar/NewChatButton.jsx`; `service/src/controllers/chat.controller.js`

### Bagaimana cara membuka percakapan sebelumnya?

Pilih judul percakapan pada sidebar untuk membuka percakapan tersebut.

- **Variasi pertanyaan:** Di mana riwayat chat saya?; Bagaimana membuka chat lama?
- **Sumber:** `client/src/components/Sidebar/ConversationItem.jsx`

### Apakah percakapan dapat dihapus?

Antarmuka menyediakan tombol **“Hapus percakapan”** di samping judul percakapan. **Perlu konfirmasi:** apakah penghapusan menghapus seluruh pesan secara permanen dan apakah tersedia cara untuk memulihkannya.

- **Variasi pertanyaan:** Bagaimana menghapus riwayat chat?; Bisakah chat yang dihapus dipulihkan?
- **Sumber:** `client/src/components/Sidebar/ConversationItem.jsx`
- **Status jawaban:** Sebagian perlu konfirmasi

## Cakupan jawaban

### Topik apa yang bisa dibahas dengan PSC Esports Assistant?

Asisten ditujukan untuk topik yang berhubungan langsung dengan esports, seperti game kompetitif, pemain, tim, turnamen, strategi, statistik, dan industri esports.

- **Variasi pertanyaan:** Chatbot ini bisa menjawab apa?; Bisa tanya tentang strategi esports?
- **Sumber:** aturan cakupan pada `service/src/service/chat.service.js`

### Apakah chatbot menjawab pertanyaan umum di luar esports?

Asisten dibatasi untuk topik yang berkaitan langsung dengan esports. Jika pertanyaan tidak berkaitan dengan esports, asisten akan menolak dengan sopan.

- **Variasi pertanyaan:** Bisa tanya hal umum?; Apakah chatbot ini asisten serbaguna?
- **Sumber:** aturan cakupan pada `service/src/service/chat.service.js`

### Apakah informasi jadwal, skor, atau roster selalu terkini?

Jadwal, skor, roster, dan statistik adalah informasi yang dapat berubah. Jawaban tentang fakta aktual perlu diperiksa terhadap sumber yang tersedia; jika sumber tidak cukup, asisten seharusnya menyatakan keterbatasannya.

- **Variasi pertanyaan:** Apakah hasil pertandingan terbaru tersedia?; Bisakah saya memastikan roster terbaru?
- **Sumber:** instruksi akurasi dan sumber pada `service/src/service/chat.service.js`

### Bagaimana cara membaca rujukan sumber pada jawaban?

Jika jawaban menggunakan sumber web, rujukan dapat ditampilkan dengan nomor seperti **[1]**. Cocokkan nomor tersebut dengan daftar sumber yang menyertai jawaban.

- **Variasi pertanyaan:** Apa arti [1] di jawaban?; Di mana sumber jawaban chatbot?
- **Sumber:** instruksi sumber dan serialisasi sumber pada `service/src/service/chat.service.js`

### Apa yang terjadi jika sumber tidak cukup?

Asisten seharusnya menjelaskan bahwa informasi belum dapat diverifikasi dan tidak menebak fakta atau membuat sumber. Coba tambahkan konteks seperti nama game, turnamen, tim, pemain, atau tahun.

- **Variasi pertanyaan:** Kenapa chatbot tidak memberi jawaban pasti?; Apa yang harus dilakukan jika sumbernya kurang?
- **Sumber:** instruksi sumber pada `service/src/service/chat.service.js`

## Status basis pengetahuan RAG

### Apakah chatbot saat ini menjawab dari dokumen internal PSC?

Belum ada alur pencarian dokumen internal yang terlihat pada implementasi yang ditinjau. Dokumen FAQ ini disiapkan sebagai bahan awal untuk merancang dan menguji RAG; keberadaannya sendiri belum membuat chatbot memakai dokumen tersebut.

- **Variasi pertanyaan:** Apakah chatbot sudah membaca FAQ internal?; Apakah RAG sudah aktif?
- **Sumber:** tinjauan alur `service/src/service/chat.service.js` dan `service/src/controllers/chat.controller.js`

## Pertanyaan yang belum dapat dijawab dari implementasi

Informasi berikut perlu dikonfirmasi oleh pemilik proyek sebelum FAQ dilengkapi:

- Bagaimana pengguna membuat akun, masuk, atau memulihkan akses akun.
- Apakah pengguna dapat mengubah judul percakapan.
- Berapa lama pesan dan percakapan disimpan.
- Bagaimana menghubungi dukungan jika terjadi masalah.
- Dokumen internal apa yang akan diindeks untuk RAG dan siapa yang boleh mengaksesnya.

