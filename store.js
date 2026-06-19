// store.js - Data Storage Manager for Bagas Showcase Website

const STORAGE_KEYS = {
  PROJECTS: 'bagas_showcase_projects',
  BLOGS: 'bagas_showcase_blogs',
  MESSAGES: 'bagas_showcase_messages',
  PROFILE: 'bagas_showcase_profile',
  AUTH: 'bagas_showcase_auth_pass',
  NOTES: 'bagas_showcase_notes'
};

const DEFAULT_PROFILE = {
  name: 'Bagas',
  title: 'Full Stack Developer & Designer',
  bio: 'Saya adalah seorang developer dan desainer yang berfokus pada pembuatan website modern, aplikasi fungsional, dan aset visual premium. Website ini merupakan galeri karya dan tempat saya berbagi pemikiran.',
  email: 'bagas@email.com',
  github: 'https://github.com/bagas',
  instagram: 'https://instagram.com/bagas',
  linkedin: 'https://linkedin.com/in/bagas',
  skills: ['HTML5/CSS3', 'JavaScript (ES6+)', 'Node.js', 'UI/UX Design', 'Figma', 'Python', 'Web Security']
};

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'E-Commerce Dashboard Interface',
    category: 'web',
    description: 'Sebuah dashboard manajemen e-commerce modern dengan visualisasi data penjualan real-time, manajemen inventaris, dan optimasi load-time di bawah 1 detik.',
    tech: 'React, Chart.js, TailwindCSS',
    year: 2026,
    status: 'completed',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    liveUrl: 'https://example.com',
    downloadUrl: 'https://github.com',
    isFeatured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'proj-2',
    title: 'Minimalist Abstract Wallpaper Pack',
    category: 'photo',
    description: 'Seri wallpaper abstrak minimalis dengan resolusi tinggi (4K/8K) menggunakan palet warna neon cyberpunk dan bentuk geometris presisi.',
    tech: 'Figma, Adobe Illustrator',
    year: 2026,
    status: 'completed',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    liveUrl: '',
    downloadUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    isFeatured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: 'proj-3',
    title: 'Cinematic Tech Reveal 2026',
    category: 'video',
    description: 'Video teaser intro teknologi dengan transisi dinamis, efek glitch 3D, dan sound design futuristik untuk pembukaan acara teknologi.',
    tech: 'After Effects, Premiere Pro',
    year: 2026,
    status: 'completed',
    mediaUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    liveUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    downloadUrl: '',
    isFeatured: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12
  }
];

const DEFAULT_BLOGS = [
  {
    id: 'blog-1',
    title: 'Membangun Arsitektur Web Modern di Tahun 2026',
    excerpt: 'Bagaimana perkembangan teknologi web terkini membantu kita membuat aplikasi yang lebih responsif, aman, dan mudah dikelola tanpa overhead berlebih.',
    content: '<h2>Pendahuluan</h2><p>Teknologi web terus berkembang dengan kecepatan luar biasa. Di tahun 2026, fokus utama bergeser dari sekadar library yang kompleks ke efisiensi runtime, minimalisasi JavaScript di sisi klien, dan optimalisasi core web vitals secara native.</p><h3>1. Kebangkitan Native Web API</h3><p>Sekarang browser modern mendukung fitur-fitur canggih secara bawaan. Pemanfaatan Web Components dan native routing bawaan browser membuat kita bisa mengurangi ukuran bundle hingga 80%.</p><h3>2. Keamanan yang Lebih Ketat</h3><p>Dengan integrasi sistem CSP (Content Security Policy) dan manajemen token yang lebih canggih, aplikasi frontend menjadi lebih kebal terhadap serangan XSS dan CSRF.</p><p>Kesimpulannya, teruslah mengeksplorasi native API untuk menjaga performa web showcase Anda tetap optimal.</p>',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: 'Web Dev, Tech, Future',
    readTime: '4 min',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'blog-2',
    title: 'Pentingnya Konsistensi Visual dalam Portfolio UI/UX',
    excerpt: 'Desain bukan hanya tentang keindahan estetika, melainkan bagaimana sistem visual yang konsisten dapat meningkatkan keterbacaan dan interaksi pengguna.',
    content: '<h2>Mengapa Estetika Saja Tidak Cukup?</h2><p>Banyak portofolio menampilkan desain yang tampak memukau tetapi sulit dinavigasi. Konsistensi dalam layout grid, tipografi, dan warna merupakan kunci utama kenyamanan pengguna.</p><h3>Langkah Menjaga Konsistensi:</h3><ul><li>Gunakan skala font yang konsisten (misal: rasio Golden Ratio).</li><li>Pilih 3 warna dominan dan terapkan aturan 60-30-10.</li><li>Pastikan seluruh icon menggunakan set yang sama (seperti Lucide Icons).</li></ul>',
    coverUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: 'Desain, UI/UX, Tips',
    readTime: '3 min',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  }
];

// Initialize default data if not present
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(DEFAULT_BLOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUTH)) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'admin');
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify({ notes: [], folders: ['Bisnis', 'Kuliah', 'Coding'], stickies: [] }));
  }
}

initStorage();

const Store = {
  // --- AUTH ---
  verifyPassword(input) {
    const pass = localStorage.getItem(STORAGE_KEYS.AUTH);
    return input === pass;
  },
  changePassword(newPass) {
    if (!newPass) return false;
    localStorage.setItem(STORAGE_KEYS.AUTH, newPass);
    return true;
  },

  // --- PROFILE ---
  getProfile() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || DEFAULT_PROFILE;
  },
  updateProfile(profileData) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
    return true;
  },

  // --- PROJECTS ---
  getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
  },
  getProjectById(id) {
    return this.getProjects().find(p => p.id === id);
  },
  saveProject(project) {
    const list = this.getProjects();
    if (project.id) {
      const idx = list.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...project, updatedAt: Date.now() };
      }
    } else {
      project.id = 'proj-' + Math.random().toString(36).substr(2, 9);
      project.createdAt = Date.now();
      list.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
    return project;
  },
  deleteProject(id) {
    let list = this.getProjects();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
    return true;
  },

  // --- BLOGS ---
  getBlogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS)) || [];
  },
  getBlogById(id) {
    return this.getBlogs().find(b => b.id === id);
  },
  saveBlog(blog) {
    const list = this.getBlogs();
    const words = (blog.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200)) + ' min read';
    
    if (blog.id) {
      const idx = list.findIndex(b => b.id === blog.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...blog, readTime, updatedAt: Date.now() };
      }
    } else {
      blog.id = 'blog-' + Math.random().toString(36).substr(2, 9);
      blog.readTime = readTime;
      blog.createdAt = Date.now();
      list.unshift(blog);
    }
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(list));
    return blog;
  },
  deleteBlog(id) {
    let list = this.getBlogs();
    list = list.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(list));
    return true;
  },

  // --- MESSAGES ---
  getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
  },
  addMessage(msg) {
    const list = this.getMessages();
    msg.id = 'msg-' + Math.random().toString(36).substr(2, 9);
    msg.createdAt = Date.now();
    msg.read = false;
    list.unshift(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    return msg;
  },
  markMessageRead(id) {
    const list = this.getMessages();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    }
    return true;
  },
  deleteMessage(id) {
    let list = this.getMessages();
    list = list.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    return true;
  },

  // --- NOTES APP METHODS (WITH BACKEND SYNC & VAULT CRYPTO) ---
  async getNotesData() {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Backend sync failed, loading notes from local storage:', e.message);
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || { notes: [], folders: ['Bisnis', 'Kuliah', 'Coding'], stickies: [] };
  },

  async saveNotesData(data) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data));
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (e) {
      console.warn('Backend save notes sync failed, saved locally:', e.message);
      return false;
    }
  },

  encrypt(text, password) {
    if (!password) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  },

  decrypt(cipherText, password) {
    if (!password) return cipherText;
    try {
      const decoded = atob(cipherText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (e) {
      return null; // Decryption failed
    }
  }
};

window.Store = Store;
