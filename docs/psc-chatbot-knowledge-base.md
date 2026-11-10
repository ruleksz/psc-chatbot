
# Basis Pengetahuan Internal PSC Chatbot

> **Status:** Draf awal untuk eksperimen RAG  
> **Tujuan:** Menjadi contoh sumber pengetahuan untuk menguji pencarian dan jawaban PSC Chatbot.  
> **Catatan:** Dokumen ini disusun dari perilaku dan struktur proyek yang tersedia. Bagian bertanda **Perlu konfirmasi** belum dapat dipastikan dari kode.

## 1. Tentang PSC Chatbot

PSC Chatbot adalah aplikasi chatbot dengan antarmuka React/Vite dan backend Node.js/Express. Backend menghubungkan aplikasi dengan layanan model bahasa. Aplikasi menyimpan akun dan riwayat percakapan di MariaDB/MySQL.

PSC Esports Assistant adalah asisten dalam aplikasi yang fokus membahas dunia esports secara global. Cakupannya meliputi game kompetitif, pemain profesional, pelatih, analis, tim, organisasi, roster, transfer, turnamen, jadwal, hasil, klasemen, statistik, strategi, draft, meta, patch kompetitif, sejarah, industri, kontrak, hadiah, dan ekosistem esports.

## 2. Pertanyaan yang dapat dibantu

Contoh topik yang sesuai:

- Strategi kompetitif untuk game esports.
- Informasi umum tentang tim, pemain, turnamen, atau organisasi esports.
- Analisis pertandingan, draft, atau meta.
- Sejarah dan perkembangan industri esports.
- Pertanyaan lanjutan yang konteks esports-nya sudah jelas dalam percakapan.

Pertanyaan umum yang tidak berhubungan langsung dengan esports berada di luar cakupan asisten. Untuk pertanyaan yang ambigu, pengguna dapat diminta menjelaskan kaitannya dengan esports.

## 3. Fakta aktual dan sumber

Informasi seperti skor, jadwal, roster, transfer, statistik, bracket, klasemen, hadiah, dan tanggal dapat berubah. Untuk fakta aktual, jawaban sebaiknya didukung sumber yang dapat diperiksa.

Alur proyek menyediakan pencarian sumber web dan mengelompokkan sumber sebagai **official**, **trusted**, atau **web**. Sumber resmi perlu dibedakan dari sumber tepercaya non-resmi. Jawaban yang memakai hasil pencarian web dapat menyertakan rujukan bernomor seperti `[1]` agar pengguna dapat memeriksa sumbernya.

Jika sumber yang ditemukan tidak cukup untuk memastikan jawaban, asisten seharusnya menyatakan keterbatasan tersebut dan tidak menebak atau membuat sumber, URL, kutipan, skor, jadwal, atau statistik.

## 4. Prinsip menjawab

1. Jawab hanya topik yang berkaitan langsung dengan esports.
2. Gunakan bahasa yang dipakai pengguna dengan jelas dan alami.
3. Bedakan fakta yang didukung sumber dari analisis atau prediksi.
4. Jangan mengarang fakta atau mengklaim telah melakukan pencarian jika pencarian tidak dilakukan.
5. Untuk fakta aktual, jelaskan jika sumber tidak cukup atau jika sumber penting yang tersedia bukan sumber resmi.
6. Jika sumber saling bertentangan, jelaskan adanya konflik dan jangan memilih salah satu tanpa dasar.
7. Jika pertanyaan di luar cakupan, tolak dengan sopan tanpa menjawab substansinya.

## 5. Batasan informasi dokumen ini

Dokumen ini menjelaskan cakupan dan prinsip jawaban PSC Esports Assistant. Dokumen ini **bukan** kumpulan data terkini tentang jadwal, hasil pertandingan, roster, statistik, atau klasemen. Untuk informasi tersebut, gunakan sumber aktual yang sesuai.

Dokumen ini juga tidak menjelaskan prosedur operasional seperti cara menghubungi admin, kebijakan retensi data, tingkat layanan, atau prosedur pemulihan akun. Informasi tersebut perlu ditambahkan setelah dikonfirmasi oleh pemilik proyek.

## 6. FAQ untuk pengujian awal RAG

### Apa itu PSC Esports Assistant?

PSC Esports Assistant adalah asisten dalam PSC Chatbot yang membantu pertanyaan seputar esports secara global.

### Apakah asisten dapat menjawab pertanyaan di luar esports?

Asisten dibatasi untuk topik yang berhubungan langsung dengan esports. Untuk pertanyaan di luar cakupan, asisten seharusnya menolak dengan sopan.

### Apakah jadwal dan hasil pertandingan selalu bisa dipastikan?

Jadwal dan hasil merupakan fakta aktual yang dapat berubah. Jawaban perlu didukung sumber yang memadai; jika sumber tidak cukup, asisten seharusnya menyatakan bahwa informasi belum dapat diverifikasi.

### Apa perbedaan sumber resmi dan sumber tepercaya?

Sumber resmi berasal dari penyelenggara, pengembang, liga, atau organisasi terkait. Sumber tepercaya dapat membantu memberi konteks, tetapi tidak boleh disebut sebagai sumber resmi jika memang bukan.

### Bagaimana asisten seharusnya menjawab jika sumber berbeda pendapat?

Asisten seharusnya menjelaskan bahwa terdapat perbedaan antar sumber dan tidak menyatakan salah satunya sebagai fakta pasti tanpa alasan yang didukung sumber.

## 7. Hal yang perlu dikonfirmasi sebelum dipakai produksi

- Apakah nama resmi produk yang ditampilkan kepada pengguna adalah “PSC Chatbot”, “PSC Esports Assistant”, atau keduanya untuk konteks berbeda.
- Dokumen dan sumber apa yang disetujui sebagai basis pengetahuan internal.
- Pemilik konten dan proses pembaruan atau pencabutan dokumen.
- Aturan akses pengguna terhadap dokumen.
- Kebijakan penyimpanan dan penghapusan percakapan.
- Kontak dukungan atau prosedur eskalasi, jika tersedia.

