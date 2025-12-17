# VPS Deployment Guide (CyberPanel Edition)

Sepertinya masalahnya adalah **Permission Denied**. Server menolak script PHP untuk mengubah izin folder karena folder tersebut mungkin milik `root` atau user lain.

## Solusi via CyberPanel (Paling Ampuh)

Karena Anda menggunakan **CyberPanel**, cara termudah adalah menggunakan **File Manager** bawaan CyberPanel.

1.  Login ke **CyberPanel**.
2.  Masuk ke menu **Websites** > **List Websites**.
3.  Cari website Anda, lalu klik **File Manager**.
4.  Masuk ke folder `public_html`.

### Langkah 1: Fix Folder 'data'
1.  Cari folder bernama `data`.
2.  Klik Kanan pada folder `data` -> pilih **Change Permissions** (atau *Chmod*).
3.  Ubah nilainya menjadi **777**.
4.  Centang **Recursive** (agar file di dalamnya juga ikut berubah) jika ada opsi itu.
5.  Klik **Change**.

### Langkah 2: Fix Folder Gambar
1.  Masuk ke folder `assets` > `images`.
2.  Cari folder `projects`. (Jika belum ada, buat dulu: Klik **New Folder** > namai `projects`).
3.  Klik Kanan pada folder `projects` -> pilih **Change Permissions**.
4.  Ubah nilainya menjadi **777**.
5.  Klik **Change**.

### Langkah 3: Fix Ownership (Alternatif)
Jika cara di atas masih gagal, gunakan fitur **Fix Permissions** global:
1.  Di menu CyberPanel (Sidebar kiri).
2.  Cari **Websites** > **List Websites**.
3.  Ada tombol bernama **Fix Permissions** di baris website Anda (mungkin perlu klik 'Manage' dulu).
4.  Ini akan mengembalikan kepemilikan file ke user yang benar.

Setelah melakukan ini, coba buka kembali halaman `setup.php` tadi. Seharusnya sekarang statusnya menjadi **[PASSED]**.
