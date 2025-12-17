# Setup Database di VPS - Langkah Mudah

## Langkah 1: Buat Database di CyberPanel

1. Login ke **CyberPanel** (https://bagsaptr.my.id:8090)
2. Klik **Databases** → **Create Database**
3. Isi form:
   - **Database Name**: `bagsaptr_portfolio`
   - **Database Username**: `bagsaptr_user` 
   - **Database Password**: (buat password kuat, catat!)
   - **Website**: pilih `bagsaptr.my.id`
4. Klik **Create Database**

## Langkah 2: Update Config Database

Edit file `api/config.php` di VPS, ubah bagian ini:

```php
// --- DATABASE CREDENTIALS ---
define('DB_HOST', 'localhost');
define('DB_USER', 'bagsaptr_user');      // ← username dari step 1
define('DB_PASS', 'PASSWORD_ANDA');       // ← password dari step 1  
define('DB_NAME', 'bagsaptr_portfolio');  // ← nama database dari step 1
```

## Langkah 3: Install Database Schema

Buka di browser:
```
https://bagsaptr.my.id/setup_database.php
```

Tunggu sampai muncul **"All Done!"**

## Langkah 4: Test

1. Login ke dashboard: `https://bagsaptr.my.id/admin/`
2. Coba tambah Project/Skill/Education
3. Cek apakah data muncul di website utama

## Langkah 5: Keamanan

Setelah setup berhasil, **HAPUS** file ini:
```bash
rm /home/bagsaptr.my.id/public_html/setup_database.php
```

---

## Troubleshooting

**Error "Access denied for user"**
→ Username/Password salah, cek lagi di CyberPanel

**Error "Unknown database"**  
→ Database belum dibuat, ulangi Langkah 1

**Error "Connection refused"**
→ MySQL service mati, restart via CyberPanel
