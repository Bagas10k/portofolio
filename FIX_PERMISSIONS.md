# FIX PERMISSION ERROR - VPS

## ❌ Error yang Terjadi
```
Permission denied: /home/bagsaptr.my.id/public_html/data/skills.json
```

Web server tidak punya izin untuk menulis ke folder `data/`.

---

## ✅ SOLUSI (Pilih salah satu)

### **Cara 1: Via SSH Terminal** (Paling Mudah)
Login ke VPS via SSH, lalu jalankan:

```bash
cd /home/bagsaptr.my.id/public_html
chmod -R 775 data/
chown -R $USER:www-data data/
```

### **Cara 2: Via CyberPanel File Manager**
1. Login ke **CyberPanel**
2. Buka **File Manager** → Navigate ke `/home/bagsaptr.my.id/public_html/`
3. Klik kanan folder **`data`** → **Change Permissions**
4. Set permission ke **`775`** atau **`777`**
5. Centang **"Apply to subdirectories"**
6. Klik **OK**

### **Cara 3: Via FTP (FileZilla)**
1. Connect ke server via FTP
2. Navigate ke folder `public_html/data/`
3. Klik kanan folder `data` → **File Permissions**
4. Set numeric value ke **`775`** (atau `777` jika masih error)
5. Centang **"Recurse into subdirectories"**
6. Klik **OK**

---

## 🧪 Test Setelah Fix
Setelah set permission, coba:
1. Buka admin panel
2. Tambah skill atau education baru
3. Harusnya sukses tanpa error!

---

## ⚠️ Catatan Keamanan
- **`775`** = Recommended (owner & group bisa write, others read only)
- **`777`** = Semua user bisa write (kurang secure, tapi kadang diperlukan di shared hosting)

Jika `775` tidak work, coba `777`.
