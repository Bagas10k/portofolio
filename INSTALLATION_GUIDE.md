# 🛠️ Installation Guide (Panduan Instalasi)

Dokumen ini menjelaskan cara menjalankan website ini dari awal, baik di **Localhost** (Laptop) maupun **VPS/Hosting**.

---

## 1️⃣ Persiapan (Requirements)
Pastikan Anda sudah menginstal:
*   **Localhost**: XAMPP, Laragon, atau MAMP.
*   **Hosting**: CyberPanel, cPanel, atau VPS dengan PHP & MySQL.

---

## 2️⃣ Cara Menjalankan di Localhost (XAMPP/Laragon)

1.  **Copy Folder Project**:
    *   Pindahkan folder project ini ke `htdocs` (XAMPP) atau `www` (Laragon).
    *   Contoh: `C:\xampp\htdocs\portfolio`

2.  **Buat Database**:
    *   Buka `localhost/phpmyadmin`.
    *   Buat database baru, misal beri nama: `bags_portofolio`.

3.  **Konfigurasi Database**:
    *   Buka file `api/config.php` dengan Text Editor (VS Code/Notepad).
    *   Edit bagian ini sesuai settingan komputer Anda:
        ```php
        define('DB_HOST', 'localhost');
        define('DB_USER', 'root');      // User default XAMPP biasanya 'root'
        define('DB_PASS', '');          // Password default XAMPP biasanya kosong
        define('DB_NAME', 'bags_portofolio');
        ```

4.  **Install Tabel Otomatis**:
    *   Buka browser dan akses: `http://localhost/portfolio/setup_database.php`
    *   Tunggu sampai muncul pesan "✅ All Done!".
    *   **PENTING**: Setelah sukses, hapus file `setup_database.php` agar aman.

5.  **Selesai!**
    *   Website utama: `http://localhost/portfolio`
    *   Login Admin: `http://localhost/portfolio/admin/index.html`
    *   **Password Default**: `Bagassaputra83` (Bisa diganti di `api/config.php`).

---

## 3️⃣ Cara Upload ke VPS / CyberPanel / Hosting

1.  **Upload File**:
    *   Masuk ke File Manager hosting Anda.
    *   Upload semua file project ke dalam folder `public_html`.

2.  **Buat Database di Hosting**:
    *   Buat Database baru & User Database baru di panel hosting Anda.
    *   Catat **Nama Database**, **Username**, dan **Password**-nya.

3.  **Edit Konfigurasi**:
    *   Edit file `api/config.php` di File Manager hosting.
    *   Masukkan detail database yang baru Anda buat.

4.  **Atur Izin File (Permission)**:
    *   Pastikan folder `assets/images/projects` dan `assets/images/profile` memiliki izin **777** (Writable) agar bisa upload foto.
    *   Di CyberPanel/Linux, klik kanan folder -> Change Permissions -> centang semua (777).

5.  **Jalankan Installasi**:
    *   Buka browser: `http://domain-anda.com/setup_database.php`
    *   Jika sukses, tabel akan dibuat otomatis.

6.  **Hapus File Setup**:
    *   Hapus `setup_database.php` dari File Manager.

---

## ❓ Troubleshooting (Masalah Umum)

*   **Gagal Upload Foto**: Cek permission folder `assets` harus 777.
*   **Database Error**: Cek kembali nama database/user/password di `api/config.php`.
*   **Halaman Putih/Blank**: Pastikan versi PHP di hosting minimal 7.4.

---

Selamat menggunakan Website Portfolio Dinamis Anda! 🚀
