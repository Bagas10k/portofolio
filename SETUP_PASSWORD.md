# Secure Password System - Setup Guide

## 🚀 Quick Start Setup

Ikuti langkah-langkah ini untuk mengimplementasikan sistem password yang aman:

### Step 1: Update Database Schema

**Jalankan query SQL berikut** di phpMyAdmin atau database manager Anda:

```sql
-- Admin Table for Secure Authentication
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**ATAU** import ulang file `database.sql` (sudah include tabel admin).

---

### Step 2: Run Migration Script

1. Buka browser, akses:
   ```
   http://yourwebsite.com/migrate_password.php
   ```

2. Script akan:
   - Membaca password lama dari `config.php`
   - Hash password menggunakan bcrypt
   - Insert ke tabel `admin`
   - Menampilkan konfirmasi sukses

3. **Setelah sukses**, simpan informasi:
   - Username: `admin`
   - Password: `Bagassaputra83` (sama seperti sebelumnya)

4. **PENTING**: Catat security key untuk emergency reset:
   ```
   Security Key: BAGAS_RESET_2025_SECRET
   ```
   Simpan di tempat aman (notes pribadi, password manager)

---

### Step 3: Test Login

1. Buka: `http://yourwebsite.com/admin/index.html`
2. Login dengan password: `Bagassaputra83`
3. Jika berhasil masuk dashboard → Migration sukses! ✅

**Jika gagal login:**
- Check console browser untuk error
- Verify tabel `admin` ada di database
- Jalankan ulang migration script

---

### Step 4: Change Password

**SEGERA setelah login pertama kali:**

1. Klik menu **Change Password** di sidebar
2. Current Password: `Bagassaputra83`
3. New Password: (buat password baru yang kuat)
4. Confirm Password: (ulangi password baru)
5. Klik **Change Password**

**Password Requirements:**
- Minimum 8 karakter
- Rekomendasi: kombinasi huruf besar, kecil, angka, simbol
- Contoh strong password: `MyP@ssw0rd2025!`

---

### Step 5: Security Cleanup

Setelah **confirm login dengan password baru berhasil**:

**A. Delete Migration Script**
```bash
# Via FTP/File Manager, hapus file:
migrate_password.php
```

**B. Update config.php** - Hapus baris ini:
```php
// File: api/config.php
// HAPUS atau COMMENT 3 baris ini:
// DEPRECATED: Remove this after running migrate_password.php and confirming login works
// Password is now stored securely in database with hashing
define('ADMIN_PASSWORD', 'Bagassaputra83');
```

**C. Secure Emergency Reset Tool**

Pilih salah satu:

**Opsi 1: Delete** (paling aman)
```bash
# Hapus file jika yakin tidak akan lupa password
reset_admin_password.php
```

**Opsi 2: Rename** (backup)
```bash
# Rename ke nama yang sulit ditebak
reset_admin_password.php → reset_bagas_12345.php
```

**Opsi 3: Protect dengan .htaccess**
```apache
# File: .htaccess (di root folder)
<Files "reset_admin_password.php">
    Order Deny,Allow
    Deny from all
    # Hanya izinkan IP tertentu (ganti dengan IP Anda)
    Allow from 123.456.789.0
</Files>
```

---

### Step 6: Test Change Password

1. Login ke admin panel
2. Klik **Change Password**
3. Test ganti password sekali lagi
4. Logout dan login dengan password terbaru
5. Jika berhasil → Setup complete! 🎉

---

## 📋 Setup Checklist

- [ ] Tabel `admin` dibuat di database
- [ ] Migration script dijalankan dan sukses
- [ ] Test login dengan password lama berhasil
- [ ] Password diubah ke password baru yang kuat
- [ ] Test login dengan password baru berhasil
- [ ] File `migrate_password.php` sudah dihapus
- [ ] `ADMIN_PASSWORD` dihapus dari `config.php`
- [ ] File `reset_admin_password.php` sudah di-secure/hapus
- [ ] Security key dicatat di tempat aman

---

## 🆘 Emergency: Lupa Password

1. Access emergency reset tool:
   ```
   http://yourwebsite.com/reset_admin_password.php
   ```

2. Masukkan security key: `BAGAS_RESET_2025_SECRET`

3. Set password baru (min 8 karakter)

4. Login dengan password baru

5. **JANGAN LUPA**: Hapus/protect reset tool setelah digunakan

---

## 📚 Additional Resources

- **Full Documentation**: Baca `SECURITY.md` untuk info lengkap
- **Troubleshooting**: Check section Troubleshooting di `SECURITY.md`
- **Best Practices**: Review security best practices di `SECURITY.md`

---

## ⚠️ Important Notes

1. **Jangan skip Step 4** - Harus ganti password setelah migration
2. **Backup database** sebelum migration (just in case)
3. **Catat security key** sebelum delete reset tool
4. **Test login** setelah setiap perubahan password
5. **Gunakan HTTPS** untuk website production

---

**Setup Time**: ~5-10 menit  
**Skill Level**: Beginner-friendly  
**Last Updated**: December 2025

🎯 **Setelah setup complete, sistem password Anda akan jauh lebih aman dari sebelumnya!**
