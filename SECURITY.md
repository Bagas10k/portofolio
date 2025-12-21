# Security Documentation

## Admin Authentication System

This portfolio website uses a secure password-based authentication system with the following security features:

### 🔐 Security Features

1. **Password Hashing**: All passwords are hashed using PHP's `password_hash()` function with bcrypt algorithm
2. **Database Storage**: Credentials are stored in the database, not in code files
3. **Password Strength**: Minimum 8 characters required for passwords
4. **Session-Based Auth**: Login sessions are managed securely via PHP sessions

---

## Password Management

### First-Time Setup

1. **Run Migration Script**:
   - Access: `http://yourwebsite.com/migrate_password.php`
   - This script creates the admin user with your existing password
   - **IMPORTANT**: Delete this file after successful migration

2. **Default Login**:
   - Username: `admin` (automatic)
   - Password: `Bagassaputra83` (same as before)

3. **Change Password Immediately**:
   - After first login, go to **Change Password** menu
   - Set a new, strong password
   - Use combination of uppercase, lowercase, numbers, and symbols

### Changing Your Password

1. Login to admin panel
2. Click **Change Password** in the sidebar menu
3. Enter your current password
4. Enter new password (minimum 8 characters)
5. Confirm new password
6. Submit to update

The system will validate:
- Current password is correct
- New password meets strength requirements
- New and confirm passwords match

---

## Emergency Password Reset

If you forget your admin password, use the emergency reset tool:

### Steps:

1. **Access Reset Tool**:
   ```
   http://yourwebsite.com/reset_admin_password.php
   ```

2. **Security Key Required**:
   - Default key: `BAGAS_RESET_2025_SECRET`
   - You can change this in the file: `reset_admin_password.php` line 10

3. **Enter New Password**:
   - Minimum 8 characters
   - Confirm password required

4. **Security Note**:
   - **DELETE** `reset_admin_password.php` after use
   - Or rename it to something random/difficult to guess
   - Or protect it with `.htaccess` password

### Optional: Protect Reset Tool with .htaccess

Create/update `.htaccess` in web root:

```apache
<Files "reset_admin_password.php">
    AuthType Basic
    AuthName "Restricted Access"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Files>
```

---

## Security Best Practices

### ✅ DO:
- Use strong, unique passwords
- Change password regularly
- Delete migration script after first use
- Delete or protect emergency reset tool
- Keep database credentials secure
- Use HTTPS for your website

### ❌ DON'T:
- Share your admin password
- Use simple/common passwords
- Leave migration/reset scripts accessible
- Commit passwords to Git/GitHub
- Use the same password across multiple sites

---

## File Security Checklist

After setup, ensure these files are secured:

- [ ] **Delete** `migrate_password.php` (after migration)
- [ ] **Delete or Protect** `reset_admin_password.php` (after use)
- [ ] **Remove** `ADMIN_PASSWORD` from `api/config.php` (after testing login works)
- [ ] **Add to .gitignore**: `api/config.php` (database credentials)
- [ ] **Verify** database credentials are not in version control

---

## Database Security

The `admin` table structure:

```sql
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);
```

- **password_hash**: Stores bcrypt hash (never plain text)
- **username**: Currently fixed to 'admin'
- **updated_at**: Tracks last password change

---

## Troubleshooting

### Cannot Login After Migration

1. Check if migration script ran successfully
2. Verify `admin` table exists in database
3. Check browser console for errors
4. Try emergency reset tool

### "Admin user not found" Error

- Run `migrate_password.php` to create admin user
- Check database connection in `api/config.php`
- Verify `admin` table exists

### Password Change Not Working

- Ensure you're logged in
- Verify current password is correct
- Check new password meets minimum 8 characters
- Check browser console for errors

---

## Support

For security issues or questions, review this documentation first. Common issues are usually related to:
1. Migration not run
2. Database connection issues
3. Session configuration
4. File permissions

**Remember**: Always delete sensitive setup/reset files after use!

---

**Last Updated**: December 2025  
**Version**: 1.0
