# FIX PERMISSION ERROR - VPS (ADVANCED)

## Error masih muncul setelah chmod 775?

Coba langkah ini:

### 1. Set Permission 777 (Full Access)
```bash
cd /home/bagsaptr.my.id/public_html
chmod -R 777 data/
```

### 2. Set Owner ke Web Server User
Coba satu per satu sampai berhasil:

**Untuk Apache:**
```bash
chown -R www-data:www-data data/
```

**Untuk Nginx:**
```bash
chown -R nginx:nginx data/
```

**Untuk CyberPanel/OpenLiteSpeed:**
```bash
chown -R nobody:nobody data/
```

**Atau gunakan user Anda sendiri:**
```bash
chown -R bagsaptr:bagsaptr data/
```

### 3. Fix Parent Directory Permission
```bash
cd /home/bagsaptr.my.id
chmod 755 public_html
cd public_html
chmod 755 .
chmod -R 777 data/
```

### 4. Buat Test File untuk Cek Permission
```bash
cd /home/bagsaptr.my.id/public_html/data
touch test.txt
echo "test" > test.txt
```

Jika command ini GAGAL, berarti permission parent directory yang masalah.

### 5. Check Current Owner & Permission
```bash
ls -la /home/bagsaptr.my.id/public_html/ | grep data
```

Kirim output command ini ke saya untuk analisa.

---

## Alternative: Gunakan Temporary Directory
Jika semua gagal, kita bisa pindah storage ke `/tmp`:

Edit `api/config.php`:
```php
define('PROJECTS_FILE', '/tmp/portfolio_data/projects.json');
define('EDUCATION_FILE', '/tmp/portfolio_data/education.json');
// dst...
```

`/tmp` biasanya always writable.
