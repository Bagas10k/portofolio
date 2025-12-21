# GitHub Security - Important Files

## ⚠️ Files NOT in GitHub Repository

The following files contain **sensitive information** and are **NOT included** in this repository for security reasons:

### 🔐 Security Files:
- `reset_admin_password.php` - Emergency password reset tool
- `migrate_password.php` - Database migration script
- `api/config.php` - Database credentials

### 📄 Template Files Provided:
- `reset_admin_password.php.template` - Use this to create reset tool
- Instructions below on how to set up

---

## 🚀 Setup Instructions

### 1. Copy Template Files

```bash
# Copy reset password template
cp reset_admin_password.php.template reset_admin_password.php
```

### 2. Configure Security Key

Edit `reset_admin_password.php`:
```php
// Change this line:
define('RESET_SECURITY_KEY', 'CHANGE_THIS_TO_YOUR_SECRET_KEY_MINIMUM_20_CHARS');

// To your own secret key:
define('RESET_SECURITY_KEY', 'YOUR_UNIQUE_SECRET_KEY_HERE');
```

**Important:** Use a strong, random security key!

### 3. Configure Database

Edit `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');
```

### 4. Verify .gitignore

Make sure these files are in `.gitignore`:
```
reset_admin_password.php
migrate_password.php
api/config.php
```

---

## 🔒 Security Best Practices

1. **Never commit** actual `reset_admin_password.php` to GitHub
2. **Delete** `reset_admin_password.php` after using it
3. **Use strong** security keys (min 20 characters)
4. **Keep** `api/config.php` secret (database credentials)
5. **Enable** HTTPS on production server

---

## ❓ Questions?

See `README.md` for full documentation.

---

**Remember:** Security files are intentionally excluded from this repository. Follow setup instructions above to configure them properly.
