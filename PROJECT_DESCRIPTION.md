# 🌐 Portfolio Website Documentation

## 📝 Overview
This is a **Dynamic Personal Portfolio Website** built with **PHP (Native), HTML, CSS (Vanilla), and JavaScript**. It features a modern, responsive design and a comprehensive **Admin Dashboard** that allows the owner to manage all content without writing code.

The website is designed to be lightweight, fast, and secure, using a MySQL database to store dynamic data.

---

## 🚀 Key Features

### 🎨 Frontend (Public)
*   **Dynamic Content**: All sections (Hero, About, Skills, Education, Projects, Messages) are loaded dynamically from the database.
*   **Modern UI**:
    *   **Dark/Light Mode**: User preference saved in LocalStorage.
    *   **Animations**: Smooth scrolling and scroll-triggered fade-in effects.
    *   **Responsive**: Fully optimized for Desktop, Tablet, and Mobile.
*   **Education Timeline**: A vertical, animated timeline showcasing academic history.
*   **Contact Form**: Visitors can send messages directly to the Admin Dashboard.

### 🛠️ Admin Dashboard (Private)
*   **Secure Access**: Password-protected login system with secure session management.
*   **Projects Manager**:
    *   Add new projects with images.
    *   **Auto-Image Compression**: Uploaded images are automatically resized and compressed for performance.
    *   Delete projects.
*   **Skills Manager**: Add/Delete skills with custom icons.
*   **Education Manager**: Add/Delete education history for the timeline.
*   **Profile Manager**:
    *   Update basic info (Name, Role, Bio).
    *   **Avatar Upload**: Change profile picture instantly.
    *   Update Social Media links.
*   **Messages**: View inquiries from the contact form.

---

## 💻 Tech Stack

*   **Backend**: PHP 7.4+ (Native, OOP style for DB connection).
*   **Database**: MySQL / MariaDB.
*   **Frontend**: HTML5, CSS3 (Custom Variables), JavaScript (Fetch API).
*   **Server**: Apache/Nginx (Compatible with XAMPP, Laragon, CyberPanel, cPanel).

---

## 📂 Folder Structure

```
/
├── admin/              # Admin Dashboard Files (HTML/JS)
├── api/                # PHP API Endpoints (JSON)
│   ├── config.php      # Database Configuration
│   └── ...             # (projects.php, profile.php, etc.)
├── assets/             # Images, Icons (SVG), Uploads
├── css/                # Global Styles
├── index.html          # Main Frontend Page
├── script.js           # Main Frontend Logic
├── setup_database.php  # Auto-Installation Script
└── database.sql        # Database Backup Schema
```
