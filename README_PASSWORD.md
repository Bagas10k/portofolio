# Bagas Portfolio - Admin Password System

Sistem keamanan password untuk admin panel portfolio website.

## 📁 File Structure

```
web/
├── api/
│   ├── config.php              # Database config (remove ADMIN_PASSWORD after migration)
│   ├── login.php               # Updated: uses database + password_verify()
│   └── change_password.php     # NEW: API for changing password
├── admin/
│   ├── index.html              # Login page
│   ├── change-password.html    # NEW: Change password page
│   └── js/
│       └── change-password.js  # NEW: Password change logic
├── database.sql                # Updated: includes `admin` table
├── migrate_password.php        # NEW: One-time migration script (delete after use)
├── reset_admin_password.php    # NEW: Emergency password reset tool
├── SECURITY.md                 # NEW: Complete security documentation
├── SETUP_PASSWORD.md           # NEW: Step-by-step setup guide
└── README_PASSWORD.md          # This file
```

## 🚀 Quick Setup

### Untuk User Pertama Kali:

1. **Read Setup Guide**: Buka `SETUP_PASSWORD.md`
2. **Follow Steps 1-6**: Ikuti semua langkah dengan teliti
3. **Clean Up**: Hapus migration script setelah sukses
4. **Done!** ✅

### Estimasi Waktu:
- Setup: 5-10 menit
- Testing: 2-3 menit
- **Total**: ~15 menit

## 🔐 Key Features

### Security Improvements:
- ✅ Password hashing with bcrypt (instead of plain text)
- ✅ Database storage (instead of hardcoded in config)
- ✅ Password strength validation (min 8 characters)
- ✅ Session-based authentication
- ✅ Emergency reset tool with security key

### New Features:
- ✅ Change password from admin panel
- ✅ Password strength indicator (weak/medium/strong)
- ✅ User-friendly error messages
- ✅ Auto-redirect after successful password change

## 📖 Documentation

### For Setup:
- **SETUP_PASSWORD.md** - Complete setup guide (START HERE)

### For Security:
- **SECURITY.md** - Security documentation, best practices, troubleshooting

### For Emergency:
- **reset_admin_password.php** - Emergency password reset (delete after use)

## 🔑 Default Credentials

**Before Migration:**
- Password defined in: `api/config.php` → `ADMIN_PASSWORD`
- Value: `Bagassaputra83`

**After Migration:**
- Username: `admin` (automatic)
- Password: Same as before (`Bagassaputra83`)
- **MUST CHANGE** immediately after first login

**Security Key** (for emergency reset):
- Default: `BAGAS_RESET_2025_SECRET`
- Location: `reset_admin_password.php` line 10
- **IMPORTANT**: Save this somewhere safe!

## ⚠️ Important Security Notes

### Before Going Live:

1. ✅ Change default password
2. ✅ Delete `migrate_password.php`
3. ✅ Remove `ADMIN_PASSWORD` from `config.php`
4. ✅ Secure/delete `reset_admin_password.php`
5. ✅ Use HTTPS for production
6. ✅ Don't commit `config.php` to Git

### If You Forget Password:

1. Use `reset_admin_password.php`
2. Enter security key: `BAGAS_RESET_2025_SECRET`
3. Set new password
4. Delete/secure reset tool again

## 🧪 Testing Checklist

- [ ] Database migration successful
- [ ] Login with old password works
- [ ] Change password feature works
- [ ] Login with new password works
- [ ] Emergency reset tool works
- [ ] All admin pages show "Change Password" menu
- [ ] Password strength indicator displays correctly
- [ ] Form validation works (min 8 chars, matching passwords)
- [ ] Error messages display properly
- [ ] Success messages display and redirect works

## 🛠️ Troubleshooting

### "Admin user not found" error
→ Run `migrate_password.php` to create admin user

### Cannot login after migration
→ Check database connection in `config.php`

### Password change not working
→ Ensure you're logged in and current password is correct

### Emergency reset not accessible
→ Check if file exists and security key is correct

**More Help**: See `SECURITY.md` → Troubleshooting section

## 📞 Support

For issues:
1. Check `SETUP_PASSWORD.md` for setup steps
2. Review `SECURITY.md` for security docs
3. Verify database connection and tables exist
4. Check browser console for errors

## 🎯 Next Steps After Setup

1. ✅ Test all functionality
2. ✅ Change to strong password
3. ✅ Clean up migration files
4. ✅ Backup database
5. ✅ Deploy to production
6. ✅ Enable HTTPS

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Bagas

🔒 **Secure password system successfully implemented!**
