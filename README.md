# Bagas Showcase & Blog ⬡

Website portofolio pribadi Single Page Application (SPA) premium dengan desain **Glassmorphism Gelap**, dilengkapi dengan **Suite Alat Desain**, **Aplikasi Catatan (Notes) Admin Pro**, dan **WhatsApp Bot Assistant** yang terintegrasi secara real-time ke backend Node.js.

---

## ✨ Fitur Utama

### 🎨 1. Portofolio & Blog SPA
- **Router Hash SPA Bawaan**: Navigasi instan antar halaman tanpa reload (`#/`, `#/projects`, `#/tools`, `#/blog`, `#/about`, `#/contact`, `#/admin`).
- **WebGL 3D Background**: Grid data 3D bergelombang interaktif menggunakan **Three.js** yang mengikuti pergerakan mouse.
- **Riak Efek Tema (Smooth Ripple Theme Toggle)**: Animasi transisi sirkular 60fps untuk beralih antara tema gelap premium dan terang minimalis.
- **Galeri Multi-Media**: Media player video bawaan (.mp4 / YouTube embed) dan lightbox foto resolusi tinggi.

### 📐 2. Suite Alat Desain Grafis (Design Suite)
- **Harmoni Warna HSL**: Perhitungan matematika warna (Komplementer, Analog, Monokrom, Triadik, Split-Komplementer) dengan mockup landing page real-time dan generator kode CSS/SCSS/JSON.
- **Kalkulator Rasio Emas (Golden Ratio)**: Pembagian ukuran layout ideal ($\phi \approx 1.618$) dan saran skala tipografi (Body, H3, H2, H1, Hero).
- **Kontras WCAG**: Penguji rasio kontras teks (Foreground vs Background) berdasarkan standar aksesibilitas **WCAG AA** dan **WCAG AAA**.
- **Generator Glassmorphism**: Slider interaktif untuk visualisasi efek bias kaca dan salin kode CSS langsung.
- **Rasio Aspek (Aspect Ratio Scale)**: Penyederhanaan dimensi gambar geometris dan skala target viewport.

### 📝 3. Aplikasi Catatan Admin (Notes Workspace)
- **Editor Rich Text & Markdown Code Block**: Menulis catatan terformat dengan pintasan otomatis untuk blok kode (sintaks ` ``` `).
- **Papan Catatan Tempel (Sticky Board)**: Kertas catatan tempel warna-warni yang dapat dipindahkan secara bebas (*drag-and-drop*) dengan posisi koordinat $X, Y$ persisten.
- **Kanvas Lukis Sketsa Tangan**: Menggambar diagram ide menggunakan HTML5 Canvas langsung di dalam browser dan menyematkannya sebagai gambar ke catatan.
- **Vault Terenkripsi (Client-Side Encryption)**: Mengunci catatan penting menggunakan enkripsi simetris XOR Base64 dengan kata sandi rahasia.
- **Kecerdasan Buatan AI Gemini**: Meringkas catatan panjang (*Summarize*) dan mengembangkan poin ide pendek (*Expand*) menggunakan Google Gemini API.

### 🤖 4. WhatsApp Bot Assistant (Admin Dashboard)
- **Gateway Mandiri**: Integrasi backend Puppeteer & `whatsapp-web.js` untuk menghubungkan nomor WhatsApp pribadi sebagai bot asisten pintar.
- **Pencatatan Keuangan Otomatis**: Chat langsung ke WA (misal: `"beli bensin 50 ribu"`) otomatis diparse secara cerdas menggunakan Gemini AI dan dicatat langsung ke **Google Sheets**.
- **Basis Memori Pintar**: Ajarkan bot informasi baru dengan hashtag `#akubosmu` yang otomatis disimpan ke basis data `bot_memories.json`.
- **Auto-Timeout QR Code**: Fitur penghemat daya otomatis yang membatasi pembuatan QR Code WhatsApp hingga 5 kali jika tidak dipindai.
- **Simulator Terminal Log**: Kotak terminal simulasi pesan langsung pada dashboard admin untuk menguji respons bot tanpa perlu mengirim pesan WA fisik.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism & animations), JavaScript (ES6+), Three.js (WebGL 3D), Lucide Icons.
- **Backend**: Node.js, Express.js, Cors.
- **Libraries**:
  - `whatsapp-web.js` (WhatsApp Web API client)
  - `googleapis` (Google Sheets v4 API)
  - `@google/generative-ai` (Gemini Pro AI SDK)
  - `qrcode` (QR Code terminal generator)

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- [Git](https://git-scm.com/)

### Langkah Penginstalan

1. **Kloning Repository**
   ```bash
   git clone https://github.com/Bagas10k/portofolio.git
   cd portofolio
   ```

2. **Instal Dependensi NPM**
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**
   ```bash
   npm start
   ```

4. **Buka Browser**
   Akses website secara lokal di: **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Panduan Konfigurasi API

Akses Admin Dashboard rahasia di **`http://localhost:3000/#/admin`** (Sandi default: `admin`).

### 1. Menghubungkan Google Sheets (Pencatatan Keuangan)
1. Buka [Google Cloud Console](https://console.cloud.google.com/), buat proyek baru, dan aktifkan **Google Sheets API**.
2. Buat **Service Account**, buat kunci akses bertipe **JSON**, lalu unduh.
3. Ubah nama berkas JSON tersebut menjadi `credentials.json` dan taruh di root direktori proyek (`/portofolio/credentials.json`).
4. Bagikan akses sunting (Editor) Google Spreadsheet Anda ke email Service Account tersebut (tertera di `client_email` di berkas JSON).
5. Masukkan **Spreadsheet ID** Anda (terdapat pada URL Spreadsheet antara `/d/` dan `/edit`) ke kolom konfigurasi di Dashboard Admin.

### 2. Menghubungkan Gemini AI API
1. Dapatkan API Key Gemini secara gratis di [Google AI Studio](https://aistudio.google.com/).
2. Masukkan API Key tersebut ke kolom **AI API Key** di Dashboard Admin lalu simpan.

---

## 📁 Struktur Folder
```text
portofolio/
├── .wwebjs_auth/       # Kredensial sesi login WhatsApp (Diabaikan oleh Git)
├── node_modules/       # Modul Node.js (Diabaikan oleh Git)
├── credentials.json    # Kunci Google Service Account (Diabaikan oleh Git)
├── notes.json          # Database catatan admin (Diabaikan oleh Git)
├── bot_config.json     # Konfigurasi asisten WA (Diabaikan oleh Git)
├── bot_memories.json   # Basis data memori bot (Diabaikan oleh Git)
├── .gitignore          # Daftar file yang diabaikan oleh Git
├── index.html          # Struktur Single Page App
├── style.css           # Kumpulan style visual & animasi Glassmorphism
├── app.js              # Logika frontend router, views, & calculator events
├── store.js            # Modul pengelola localStorage & enkripsi vault
├── server.js           # Server Node.js untuk API WhatsApp Bot & Gemini
├── package.json        # Pengaturan dependencies & script NPM
└── README.md           # Berkas petunjuk ini
```

---

## 🔒 Lisensi & Hak Cipta
© 2026 Bagas. Hak Cipta Dilindungi.
Dibuat dengan dedikasi tinggi untuk portofolio developer premium.
