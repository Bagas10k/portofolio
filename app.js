// app.js - Main Router & Page Renderers for Bagas Showcase Website

// Global State
let isAdminAuthenticated = false;
let currentAdminTab = 'projects';
let activeEditProject = null;
let activeEditBlog = null;

const CATEGORY_LABELS = {
  web: 'Web Application',
  photo: 'Design & Visual',
  video: 'Video Production',
  file: 'Digital Archive',
  other: 'Project Archive'
};

// ==========================================
// ROUTER SYSTEM
// ==========================================
const routes = {
  '/': renderHome,
  '/projects': renderProjects,
  '/tools': renderDesignerTools,
  '/blog': renderBlog,
  '/blog/:id': renderSingleBlog,
  '/about': renderAbout,
  '/contact': renderContact,
  '/admin': renderAdmin,
  '/notes': renderNotesApp
};

function handleRouting() {
  const hash = window.location.hash || '#/';
  let path = hash.substring(1);
  
  // Clean trailing slashes if any
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Guard admin-only Notes page
  if (path === '/notes' && !isAdminAuthenticated) {
    showToast('Akses ditolak. Silakan login sebagai admin untuk membuka Catatan.');
    window.location.hash = '#/admin';
    return;
  }

  // Update navbar links active state
  updateNavbarActiveLink(path);
  
  // Close mobile menu if open
  document.getElementById('mobileMenu').classList.remove('open');

  // Match routes with parameters (e.g. /blog/:id)
  let routeHandler = routes[path];
  let params = {};

  if (!routeHandler) {
    // Try matching param routes
    for (const key in routes) {
      if (key.includes('/:')) {
        const routeParts = key.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length === pathParts.length) {
          let match = true;
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              const paramName = routeParts[i].substring(1);
              params[paramName] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            routeHandler = routes[key];
            break;
          }
        }
      }
    }
  }

  const container = document.getElementById('app-router-view');
  
  // Transition Fade Out
  container.style.transition = 'opacity 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
  container.style.opacity = '0';
  setTimeout(() => {
    if (routeHandler) {
      routeHandler(container, params);
    } else {
      render404(container);
    }
    // Transition Fade In
    container.style.opacity = '1';
    lucide.createIcons();
    initLazyImages();
    window.scrollTo(0, 0);
  }, 280);
}

function updateNavbarActiveLink(path) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const linkPath = link.getAttribute('data-path');
    if (linkPath === '/' && path === '/') {
      link.classList.add('active');
    } else if (linkPath !== '/' && path.startsWith(linkPath)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ==========================================
// RENDERERS - USER FACING
// ==========================================

// 1. HOME PAGE
function renderHome(container) {
  const profile = Store.getProfile();
  const projects = Store.getProjects().filter(p => p.isFeatured).slice(0, 3);
  const blogs = Store.getBlogs().slice(0, 2);

  let featuredHtml = '';
  if (projects.length === 0) {
    featuredHtml = `
      <div class="empty-state">
        <div class="empty-icon-box"><i data-lucide="layers" class="icon-lg"></i></div>
        <h3>Belum ada proyek unggulan</h3>
        <p>Buka admin panel untuk menambahkan proyek baru.</p>
      </div>`;
  } else {
    featuredHtml = `
      <div class="projects-grid">
        ${projects.map(p => getProjectCardMarkup(p)).join('')}
      </div>`;
  }

  let blogsHtml = '';
  if (blogs.length === 0) {
    blogsHtml = `
      <div class="empty-state">
        <div class="empty-icon-box"><i data-lucide="book-open" class="icon-lg"></i></div>
        <h3>Belum ada artikel</h3>
        <p>Artikel blog terbaru akan muncul di sini nanti.</p>
      </div>`;
  } else {
    blogsHtml = `
      <div class="blog-grid">
        ${blogs.map(b => getBlogCardMarkup(b)).join('')}
      </div>`;
  }

  container.innerHTML = `
    <!-- HERO -->
    <section class="hero-sec container">
      <div class="hero-glow"></div>
      <div class="hero-grid">
        <div class="hero-content-area">
          <div class="hero-tagline">
            <i data-lucide="sparkles" class="icon-xs"></i> <span>Tersedia untuk Kolaborasi</span>
          </div>
          <h1 class="hero-h1">Halo, Saya <span class="hero-gradient">${escHtml(profile.name)}</span></h1>
          <p class="hero-desc">${escHtml(profile.title)}. ${escHtml(profile.bio)}</p>
          <div class="hero-btns">
            <a href="#/projects" class="btn btn-primary"><i data-lucide="layout"></i> Lihat Karya</a>
            <a href="#/contact" class="btn btn-secondary"><i data-lucide="send"></i> Kontak Saya</a>
          </div>
        </div>
        <div class="hero-avatar-area">
          <div class="avatar-border-glow">
            <img src="avatar.png" alt="${escHtml(profile.name)}" class="hero-avatar" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'" />
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="container">
      <div class="stats-bar">
        <div class="stat-box">
          <span class="stat-num">${Store.getProjects().length}</span>
          <span class="stat-name">Total Proyek</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${Store.getProjects().filter(p => p.category === 'web').length}</span>
          <span class="stat-name">Web App</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${Store.getBlogs().length}</span>
          <span class="stat-name">Artikel Blog</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${Store.getProjects().filter(p => p.category === 'photo' || p.category === 'video').length}</span>
          <span class="stat-name">Media & Desain</span>
        </div>
      </div>
    </section>

    <!-- FEATURED PROJECTS -->
    <section class="section container">
      <div class="section-head">
        <span class="section-tag">Karya Terpilih</span>
        <h2 class="section-title">Proyek Unggulan</h2>
        <p class="section-desc">Berikut adalah beberapa proyek terbaik yang baru-baru ini saya selesaikan.</p>
      </div>
      ${featuredHtml}
      <div style="text-align: center; margin-top: 40px;">
        <a href="#/projects" class="btn btn-secondary">Lihat Semua Proyek <i data-lucide="arrow-right"></i></a>
      </div>
    </section>

    <!-- LATEST BLOGS -->
    <section class="section container" style="border-top: 1px solid var(--border-light)">
      <div class="section-head">
        <span class="section-tag">Pemikiran & Artikel</span>
        <h2 class="section-title">Blog Terbaru</h2>
        <p class="section-desc">Eksplorasi wawasan seputar pemrograman, desain, dan arsitektur web modern.</p>
      </div>
      ${blogsHtml}
      <div style="text-align: center; margin-top: 40px;">
        <a href="#/blog" class="btn btn-secondary">Kunjungi Blog <i data-lucide="arrow-right"></i></a>
      </div>
    </section>
  `;
}

// 2. PROJECTS GALLERY
let activeFilter = 'all';
let searchQuery = '';

function renderProjects(container) {
  const allProjects = Store.getProjects();
  
  // Filter & Search Logic
  const filtered = allProjects.filter(p => {
    const matchCat = activeFilter === 'all' || p.category === activeFilter;
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.tech.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  let gridMarkup = '';
  if (filtered.length === 0) {
    gridMarkup = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="empty-icon-box"><i data-lucide="search-code" class="icon-lg"></i></div>
        <h3>Tidak ada proyek ditemukan</h3>
        <p>Coba gunakan filter lain atau ubah kata pencarian Anda.</p>
      </div>`;
  } else {
    gridMarkup = filtered.map(p => getProjectCardMarkup(p)).join('');
  }

  container.innerHTML = `
    <section class="section container">
      <div class="section-head">
        <span class="section-tag">Showcase</span>
        <h2 class="section-title">Galeri Proyek</h2>
        <p class="section-desc">Koleksi hasil kerja saya mulai dari aplikasi web, desain media, video cinematic, hingga arsip program.</p>
      </div>

      <!-- Filters & Search -->
      <div class="filter-container">
        <div class="filter-row">
          <div class="filter-tabs">
            <button class="filter-tab ${activeFilter === 'all' ? 'active' : ''}" onclick="setProjectFilter('all')">
              <i data-lucide="layers" class="icon-xs"></i> Semua
            </button>
            <button class="filter-tab ${activeFilter === 'web' ? 'active' : ''}" onclick="setProjectFilter('web')">
              <i data-lucide="globe" class="icon-xs"></i> Web
            </button>
            <button class="filter-tab ${activeFilter === 'photo' ? 'active' : ''}" onclick="setProjectFilter('photo')">
              <i data-lucide="image" class="icon-xs"></i> Desain/Foto
            </button>
            <button class="filter-tab ${activeFilter === 'video' ? 'active' : ''}" onclick="setProjectFilter('video')">
              <i data-lucide="video" class="icon-xs"></i> Video
            </button>
            <button class="filter-tab ${activeFilter === 'file' ? 'active' : ''}" onclick="setProjectFilter('file')">
              <i data-lucide="file-text" class="icon-xs"></i> File/Zip
            </button>
          </div>
          <div class="search-box">
            <i data-lucide="search" class="search-box-icon icon-sm"></i>
            <input type="text" class="search-box-input" id="projectSearchInput" placeholder="Cari nama proyek atau tech..." value="${escHtml(searchQuery)}" />
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="projects-grid" id="projectsGridWrapper">
        ${gridMarkup}
      </div>
    </section>
  `;

  // Bind search input listener
  const searchInput = document.getElementById('projectSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      // Fast updates inside wrapper to prevent layout rebuild
      const wrapper = document.getElementById('projectsGridWrapper');
      const reFiltered = Store.getProjects().filter(p => {
        const matchCat = activeFilter === 'all' || p.category === activeFilter;
        const matchSearch = !searchQuery || 
          p.title.toLowerCase().includes(searchQuery) ||
          p.description.toLowerCase().includes(searchQuery) ||
          p.tech.toLowerCase().includes(searchQuery);
        return matchCat && matchSearch;
      });
      if (reFiltered.length === 0) {
        wrapper.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1">
            <div class="empty-icon-box"><i data-lucide="search-code" class="icon-lg"></i></div>
            <h3>Tidak ada proyek ditemukan</h3>
            <p>Coba ubah kata kunci pencarian Anda.</p>
          </div>`;
      } else {
        wrapper.innerHTML = reFiltered.map(p => getProjectCardMarkup(p)).join('');
      }
      lucide.createIcons();
    });
  }
}

window.setProjectFilter = function(filterVal) {
  activeFilter = filterVal;
  renderProjects(document.getElementById('app-router-view'));
  lucide.createIcons();
};

function getProjectCardMarkup(p) {
  const catIcons = { web: 'globe', photo: 'image', video: 'video', file: 'file-text' };
  const catIcon = catIcons[p.category] || 'layers';
  const statusLabel = p.status === 'completed' ? 'Selesai' : 'Berjalan';
  const statusClass = p.status === 'completed' ? 'status-completed' : 'status-ongoing';

  const previewAction = p.category === 'photo' 
    ? `openLightbox('${p.mediaUrl}', '${escHtml(p.title)}')`
    : p.category === 'video'
      ? `openVideoModal('${p.liveUrl || p.mediaUrl}', '${escHtml(p.title)}')`
      : p.liveUrl 
        ? `window.open('${p.liveUrl}', '_blank')` 
        : `showToast('Tidak ada link live preview untuk proyek ini')`;

  const btnText = p.category === 'photo' ? 'Lihat Foto' : p.category === 'video' ? 'Putar Video' : 'Kunjungi Web';

  return `
    <div class="project-card">
      <div class="card-img-wrapper" onclick="${previewAction}" style="cursor:pointer">
        ${p.mediaUrl 
          ? `<div class="skeleton-box" style="position:absolute;inset:0;z-index:1;"></div>
             <img class="card-img lazy-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E" data-src="${escHtml(p.mediaUrl)}" alt="${escHtml(p.title)}" />`
          : `<div class="card-placeholder"><i data-lucide="${catIcon}" class="icon-lg"></i></div>`
        }
        <div class="card-badge">
          <i data-lucide="${catIcon}" class="icon-xs"></i> <span>${CATEGORY_LABELS[p.category] || p.category}</span>
        </div>
        <span class="card-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="card-body">
        <div class="card-info">
          <span class="card-year">${p.year || ''}</span>
        </div>
        <h3 class="card-title">${escHtml(p.title)}</h3>
        <p class="card-desc">${escHtml(p.description)}</p>
        <div class="card-tags">
          ${p.tech ? p.tech.split(',').map(t => `<span class="card-tag">${escHtml(t.trim())}</span>`).join('') : ''}
        </div>
        <div class="card-footer-btns">
          <button class="btn btn-primary btn-sm card-action-btn" onclick="${previewAction}">
            <i data-lucide="${p.category === 'video' ? 'play' : 'external-link'}" class="icon-xs"></i> ${btnText}
          </button>
          ${p.downloadUrl 
            ? `<a href="${escHtml(p.downloadUrl)}" target="_blank" class="btn btn-secondary btn-sm card-action-btn"><i data-lucide="download" class="icon-xs"></i> Download</a>`
            : ''
          }
        </div>
      </div>
    </div>
  `;
}

// 3. BLOG PAGE
let blogSearchQuery = '';

function renderBlog(container) {
  const blogs = Store.getBlogs();
  const filtered = blogs.filter(b => {
    return !blogSearchQuery || 
      b.title.toLowerCase().includes(blogSearchQuery) ||
      b.excerpt.toLowerCase().includes(blogSearchQuery) ||
      b.tags.toLowerCase().includes(blogSearchQuery);
  });

  let listMarkup = '';
  if (filtered.length === 0) {
    listMarkup = `
      <div class="empty-state">
        <div class="empty-icon-box"><i data-lucide="book-open" class="icon-lg"></i></div>
        <h3>Belum ada artikel ditemukan</h3>
        <p>Coba gunakan kata kunci pencarian yang lain.</p>
      </div>`;
  } else {
    listMarkup = `
      <div class="blog-grid">
        ${filtered.map(b => getBlogCardMarkup(b)).join('')}
      </div>`;
  }

  container.innerHTML = `
    <section class="section container">
      <div class="section-head">
        <span class="section-tag">Artikel</span>
        <h2 class="section-title">Blog Kreatif</h2>
        <p class="section-desc">Berbagi cerita seputar proses programming, solusi bug, tips desain, dan dokumentasi teknologi.</p>
      </div>

      <!-- Blog Filter/Search -->
      <div class="filter-container">
        <div class="filter-row" style="justify-content: flex-end;">
          <div class="search-box" style="max-width: 100%; width: 350px;">
            <i data-lucide="search" class="search-box-icon icon-sm"></i>
            <input type="text" class="search-box-input" id="blogSearchInput" placeholder="Cari tulisan..." value="${escHtml(blogSearchQuery)}" />
          </div>
        </div>
      </div>

      ${listMarkup}
    </section>
  `;

  const searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      blogSearchQuery = e.target.value.toLowerCase().trim();
      renderBlog(container);
      lucide.createIcons();
    });
  }
}

function getBlogCardMarkup(b) {
  const formattedDate = new Date(b.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `
    <div class="blog-card" onclick="window.location.hash = '#/blog/${b.id}'">
      <div class="blog-img-wrapper">
        ${b.coverUrl 
          ? `<div class="skeleton-box" style="position:absolute;inset:0;z-index:1;"></div>
             <img class="blog-img lazy-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E" data-src="${escHtml(b.coverUrl)}" alt="${escHtml(b.title)}" />`
          : `<div class="card-placeholder" style="position:absolute;inset:0;"><i data-lucide="book-open" class="icon-lg"></i></div>`
        }
      </div>
      <div class="blog-body">
        <div class="blog-meta">
          <div class="blog-meta-item"><i data-lucide="calendar" class="icon-xs"></i> <span>${formattedDate}</span></div>
          <div class="blog-meta-item"><i data-lucide="clock" class="icon-xs"></i> <span>${b.readTime || '3 min'}</span></div>
        </div>
        <h3 class="blog-title">${escHtml(b.title)}</h3>
        <p class="blog-excerpt">${escHtml(b.excerpt)}</p>
        <span class="blog-read-more">Baca Lengkap <i data-lucide="chevron-right" class="icon-xs"></i></span>
      </div>
    </div>
  `;
}

// 4. SINGLE BLOG VIEW
function renderSingleBlog(container, params) {
  const b = Store.getBlogById(params.id);
  if (!b) {
    container.innerHTML = `
      <div class="container section" style="text-align:center;">
        <h2>Artikel tidak ditemukan</h2>
        <a href="#/blog" class="btn btn-primary" style="margin-top:20px;">Kembali ke Blog</a>
      </div>`;
    return;
  }

  const formattedDate = new Date(b.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  container.innerHTML = `
    <section class="section container">
      <div class="single-blog">
        <a href="#/blog" class="blog-back-btn"><i data-lucide="arrow-left" class="icon-sm"></i> Kembali ke Blog</a>
        
        <div class="blog-header">
          ${b.tags ? b.tags.split(',').map(t => `<span class="blog-tag-badge">${escHtml(t.trim())}</span>`).join(' ') : ''}
          <h1>${escHtml(b.title)}</h1>
          <div class="blog-meta">
            <div class="blog-meta-item"><i data-lucide="calendar" class="icon-sm"></i> <span>Dipublikasikan pada ${formattedDate}</span></div>
            <div class="blog-meta-item"><i data-lucide="clock" class="icon-sm"></i> <span>Waktu baca: ${b.readTime}</span></div>
          </div>
        </div>

        ${b.coverUrl ? `<img src="${escHtml(b.coverUrl)}" alt="${escHtml(b.title)}" class="blog-cover" />` : ''}

        <article class="blog-content">
          ${b.content}
        </article>
      </div>
    </section>
  `;
}

// 5. ABOUT PAGE
function renderAbout(container) {
  const profile = Store.getProfile();
  container.innerHTML = `
    <section class="section container">
      <div class="section-head">
        <span class="section-tag">Biografi</span>
        <h2 class="section-title">Tentang Saya</h2>
        <p class="section-desc">Perjalanan, keahlian, dan apa saja yang saya lakukan sehari-hari.</p>
      </div>

      <div class="about-grid">
        <div class="about-left">
          <img src="avatar.png" alt="${escHtml(profile.name)}" class="about-img" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'" />
          <div class="skills-card" style="text-align: left;">
            <h3 style="font-size:1.15rem; margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="award" class="icon-sm" style="color:var(--primary);"></i> Keahlian Utama
            </h3>
            <div class="skills-grid">
              ${profile.skills.map(s => `<span class="skill-badge">${escHtml(s)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="about-right">
          <h2 style="font-size: 1.8rem; margin-bottom: 16px;">Hai, Saya ${escHtml(profile.name)}</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 24px; font-size:1.05rem;">
            ${escHtml(profile.bio)}
          </p>

          <h3 style="font-size:1.3rem; margin:32px 0 16px; border-bottom:1px solid var(--border-light); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="history" class="icon-sm"></i> Pengalaman & Perjalanan Kreatif
          </h3>
          <div class="timeline">
            <div class="timeline-item">
              <span class="timeline-date">2025 - Sekarang</span>
              <h4 class="timeline-title">Independent Creator & Web Developer</h4>
              <p class="timeline-desc">Fokus mengasah kemampuan membangun aplikasi web modern siap pakai, manajemen database lokal, serta optimasi visual desainer.</p>
            </div>
            <div class="timeline-item">
              <span class="timeline-date">2023 - 2025</span>
              <h4 class="timeline-title">Junior Developer & UI Designer</h4>
              <p class="timeline-desc">Bekerja membuat antarmuka pengguna interaktif, mendesain logo/branding kit perusahaan, dan menyempurnakan struktur SEO program frontend.</p>
            </div>
            <div class="timeline-item">
              <span class="timeline-date">2021 - 2023</span>
              <h4 class="timeline-title">Mulai Belajar Programming & Desain</h4>
              <p class="timeline-desc">Mempelajari dasar pemrograman (Python, HTML, CSS) dan tools desain grafis secara mandiri lewat berbagai proyek kecil.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 6. CONTACT PAGE
function renderContact(container) {
  const profile = Store.getProfile();
  container.innerHTML = `
    <section class="section container">
      <div class="section-head">
        <span class="section-tag">Hubungi</span>
        <h2 class="section-title">Mari Berkolaborasi</h2>
        <p class="section-desc">Ingin membuat proyek bersama, menawarkan kerja sama, atau sekadar bertanya? Kirimkan pesan Anda.</p>
      </div>

      <div class="contact-grid">
        <div class="contact-info-panel">
          <a href="mailto:${escHtml(profile.email)}" class="contact-card">
            <div class="contact-icon-wrapper"><i data-lucide="mail"></i></div>
            <div class="contact-details">
              <span class="contact-lbl">Email</span>
              <span class="contact-val">${escHtml(profile.email)}</span>
            </div>
          </a>
          <a href="${escHtml(profile.github)}" target="_blank" class="contact-card">
            <div class="contact-icon-wrapper"><i data-lucide="github"></i></div>
            <div class="contact-details">
              <span class="contact-lbl">GitHub</span>
              <span class="contact-val">${escHtml(profile.github.replace('https://', ''))}</span>
            </div>
          </a>
          <a href="${escHtml(profile.instagram)}" target="_blank" class="contact-card">
            <div class="contact-icon-wrapper"><i data-lucide="instagram"></i></div>
            <div class="contact-details">
              <span class="contact-lbl">Instagram</span>
              <span class="contact-val">${escHtml(profile.instagram.replace('https://', ''))}</span>
            </div>
          </a>
        </div>

        <div class="contact-form-card">
          <form id="contactForm" onsubmit="submitContactForm(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" id="senderName" class="form-input" placeholder="Masukkan nama Anda" required />
              </div>
              <div class="form-group">
                <label class="form-label">Alamat Email</label>
                <input type="email" id="senderEmail" class="form-input" placeholder="email@contoh.com" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Judul Pesan</label>
              <input type="text" id="messageSubject" class="form-input" placeholder="Kemitraan, Tanya Jawab, dll." required />
            </div>
            <div class="form-group">
              <label class="form-label">Isi Pesan</label>
              <textarea id="messageBody" class="form-input form-textarea" placeholder="Tuliskan pesan Anda secara mendetail..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Kirim Pesan <i data-lucide="send" class="icon-xs"></i></button>
          </form>
        </div>
      </div>
    </section>
  `;
}

window.submitContactForm = function(e) {
  e.preventDefault();
  const name = document.getElementById('senderName').value.trim();
  const email = document.getElementById('senderEmail').value.trim();
  const subject = document.getElementById('messageSubject').value.trim();
  const text = document.getElementById('messageBody').value.trim();

  Store.addMessage({ name, email, subject, text });
  showToast('Pesan berhasil terkirim! Terima kasih.');
  document.getElementById('contactForm').reset();
};

// ==========================================
// RENDERERS - ADMIN PORTAL
// ==========================================
function renderAdmin(container) {
  if (!isAdminAuthenticated) {
    renderAdminLogin(container);
    return;
  }

  // Dashboard Layout
  container.innerHTML = `
    <section class="section container">
      <div class="section-head" style="text-align:left; margin-bottom: 32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <span class="section-tag">Kontrol Panel</span>
          <h2 class="section-title">Dashboard Admin</h2>
        </div>
        <button class="btn btn-danger btn-sm" onclick="logoutAdmin()"><i data-lucide="log-out" class="icon-xs"></i> Keluar</button>
      </div>

      <div class="admin-grid">
        <aside class="admin-sidebar">
          <button class="admin-sidebar-btn ${currentAdminTab === 'projects' ? 'active' : ''}" onclick="switchAdminTab('projects')">
            <i data-lucide="layout" class="icon-xs"></i> Kelola Proyek
          </button>
          <button class="admin-sidebar-btn ${currentAdminTab === 'blogs' ? 'active' : ''}" onclick="switchAdminTab('blogs')">
            <i data-lucide="book-open" class="icon-xs"></i> Kelola Blog
          </button>
          <button class="admin-sidebar-btn ${currentAdminTab === 'messages' ? 'active' : ''}" onclick="switchAdminTab('messages')">
            <i data-lucide="inbox" class="icon-xs"></i> Pesan Masuk 
            ${Store.getMessages().filter(m => !m.read).length > 0 ? `<span style="background:var(--danger); color:white; font-size:0.7rem; padding:2px 6px; border-radius:10px; margin-left:auto;">${Store.getMessages().filter(m => !m.read).length}</span>` : ''}
          </button>
          <button class="admin-sidebar-btn ${currentAdminTab === 'profile' ? 'active' : ''}" onclick="switchAdminTab('profile')">
            <i data-lucide="user" class="icon-xs"></i> Edit Profil
          </button>
          <button class="admin-sidebar-btn ${currentAdminTab === 'assistant' ? 'active' : ''}" onclick="switchAdminTab('assistant')" style="border: 1px solid rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.05); color: var(--success); font-weight: bold;">
            <i data-lucide="bot" class="icon-xs"></i> Asisten WA Bot
          </button>
        </aside>

        <div class="admin-main-card" id="adminActiveTabContent">
          <!-- Active Tab Content Injected Here -->
        </div>
      </div>
    </section>
  `;

  renderActiveAdminTab();
}

function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="login-screen">
      <div class="login-head">
        <div class="login-icon"><i data-lucide="lock" class="icon-md"></i></div>
        <h3>Admin Authentikasi</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:6px;">Gunakan sandi default Anda untuk login</p>
      </div>
      <form onsubmit="handleAdminLogin(event)">
        <div class="form-group">
          <label class="form-label">Sandi Admin</label>
          <input type="password" id="adminPassInput" class="form-input" placeholder="Masukkan kata sandi..." required />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Masuk Panel <i data-lucide="arrow-right" class="icon-xs"></i></button>
      </form>
    </div>
  `;
}

window.handleAdminLogin = function(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPassInput').value;
  if (Store.verifyPassword(pass)) {
    isAdminAuthenticated = true;
    const btn = document.getElementById('navNotesBtn');
    const mobileBtn = document.getElementById('navNotesMobileBtn');
    if (btn) btn.style.display = 'inline-flex';
    if (mobileBtn) mobileBtn.style.display = 'inline-flex';
    if (window.lucide) window.lucide.createIcons();
    renderAdmin(document.getElementById('app-router-view'));
    showToast('Login berhasil! Selamat datang.');
  } else {
    showToast('Kata sandi yang Anda masukkan salah!');
  }
};

window.logoutAdmin = function() {
  isAdminAuthenticated = false;
  const btn = document.getElementById('navNotesBtn');
  const mobileBtn = document.getElementById('navNotesMobileBtn');
  if (btn) btn.style.display = 'none';
  if (mobileBtn) mobileBtn.style.display = 'none';
  renderAdmin(document.getElementById('app-router-view'));
  showToast('Berhasil keluar.');
};

window.switchAdminTab = function(tabName) {
  currentAdminTab = tabName;
  renderAdmin(document.getElementById('app-router-view'));
};

function renderActiveAdminTab() {
  const content = document.getElementById('adminActiveTabContent');
  if (!content) return;

  // Stop polling if switching away from assistant tab
  if (currentAdminTab !== 'assistant') {
    if (window.stopAssistantPolling) window.stopAssistantPolling();
  }

  if (currentAdminTab === 'projects') {
    renderAdminProjects(content);
  } else if (currentAdminTab === 'blogs') {
    renderAdminBlogs(content);
  } else if (currentAdminTab === 'messages') {
    renderAdminMessages(content);
  } else if (currentAdminTab === 'profile') {
    renderAdminProfile(content);
  } else if (currentAdminTab === 'assistant') {
    renderAdminAssistant(content);
    if (window.startAssistantPolling) window.startAssistantPolling();
  }
  lucide.createIcons();
}

// ADMIN TAB: PROJECTS
function renderAdminProjects(content) {
  const projects = Store.getProjects();
  content.innerHTML = `
    <div class="admin-card-head">
      <h3 class="admin-card-title">Daftar Proyek Anda</h3>
      <button class="btn btn-primary btn-sm" onclick="openProjectModal()"><i data-lucide="plus" class="icon-xs"></i> Tambah Proyek</button>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Judul Proyek</th>
            <th>Kategori</th>
            <th>Tahun</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => `
            <tr>
              <td style="font-weight:600;">${escHtml(p.title)}</td>
              <td><span style="font-size:0.8rem; text-transform:uppercase;">${CATEGORY_LABELS[p.category] || p.category}</span></td>
              <td><span style="font-family:'JetBrains Mono';">${p.year || '—'}</span></td>
              <td><span style="font-size:0.8rem;">${p.status === 'completed' ? 'Selesai' : 'Berjalan'}</span></td>
              <td><span style="color:${p.isFeatured ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:bold;">${p.isFeatured ? 'Ya' : 'Tidak'}</span></td>
              <td>
                <div class="action-cell">
                  <button class="btn btn-secondary btn-sm" onclick="openProjectModal('${p.id}')" title="Edit"><i data-lucide="edit" class="icon-xs"></i></button>
                  <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')" title="Hapus"><i data-lucide="trash-2" class="icon-xs"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${projects.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Belum ada proyek ditambahkan.</td></tr>' : ''}
        </tbody>
      </table>
    </div>

    <!-- MODAL ADD/EDIT PROJECT -->
    <div class="modal-overlay" id="projectEditModal" onclick="closeProjectModal(event)">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title" id="projModalTitle">Tambah Proyek</h3>
          <button class="modal-close-btn" onclick="closeProjectModal(null)"><i data-lucide="x"></i></button>
        </div>
        <form onsubmit="saveProjectForm(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Judul Proyek *</label>
              <input type="text" id="modalProjTitle" class="form-input" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kategori *</label>
                <select id="modalProjCategory" class="form-input" required>
                  <option value="web">Web Application</option>
                  <option value="photo">Desain / Foto</option>
                  <option value="video">Cinematic Video</option>
                  <option value="file">Dokumen / File Zip</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tahun Pembuatan</label>
                <input type="number" id="modalProjYear" class="form-input" placeholder="2026" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi Singkat *</label>
              <textarea id="modalProjDesc" class="form-input form-textarea" required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Daftar Teknologi (Pisahkan dengan koma)</label>
              <input type="text" id="modalProjTech" class="form-input" placeholder="React, Python, Figma, dll." />
            </div>
            <div class="form-group">
              <label class="form-label">Media URL (Thumbnail / Foto / Cover)</label>
              <input type="text" id="modalProjMedia" class="form-input" placeholder="https://unsplash.com/..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Live Preview URL</label>
                <input type="text" id="modalProjLive" class="form-input" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="form-label">Download / Source Code URL</label>
                <input type="text" id="modalProjDownload" class="form-input" placeholder="https://github.com/..." />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status Proyek</label>
                <select id="modalProjStatus" class="form-input">
                  <option value="completed">Selesai</option>
                  <option value="ongoing">Sedang Berjalan</option>
                </select>
              </div>
              <div class="form-group" style="flex-direction:row; align-items:center; gap:8px; margin-top:28px;">
                <input type="checkbox" id="modalProjFeatured" style="width:18px; height:18px; accent-color:var(--primary);" />
                <label class="form-label" for="modalProjFeatured" style="cursor:pointer; margin:0;">Tampilkan di Beranda (Featured)</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeProjectModal(null)">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Proyek</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

window.openProjectModal = function(id = null) {
  const modal = document.getElementById('projectEditModal');
  const title = document.getElementById('projModalTitle');
  
  if (id) {
    activeEditProject = Store.getProjectById(id);
    title.textContent = 'Edit Proyek';
    document.getElementById('modalProjTitle').value = activeEditProject.title;
    document.getElementById('modalProjCategory').value = activeEditProject.category;
    document.getElementById('modalProjYear').value = activeEditProject.year || '';
    document.getElementById('modalProjDesc').value = activeEditProject.description;
    document.getElementById('modalProjTech').value = activeEditProject.tech || '';
    document.getElementById('modalProjMedia').value = activeEditProject.mediaUrl || '';
    document.getElementById('modalProjLive').value = activeEditProject.liveUrl || '';
    document.getElementById('modalProjDownload').value = activeEditProject.downloadUrl || '';
    document.getElementById('modalProjStatus').value = activeEditProject.status || 'completed';
    document.getElementById('modalProjFeatured').checked = !!activeEditProject.isFeatured;
  } else {
    activeEditProject = null;
    title.textContent = 'Tambah Proyek';
    document.getElementById('modalProjTitle').value = '';
    document.getElementById('modalProjCategory').value = 'web';
    document.getElementById('modalProjYear').value = new Date().getFullYear();
    document.getElementById('modalProjDesc').value = '';
    document.getElementById('modalProjTech').value = '';
    document.getElementById('modalProjMedia').value = '';
    document.getElementById('modalProjLive').value = '';
    document.getElementById('modalProjDownload').value = '';
    document.getElementById('modalProjStatus').value = 'completed';
    document.getElementById('modalProjFeatured').checked = false;
  }

  modal.classList.add('open');
  lucide.createIcons();
};

window.closeProjectModal = function(e) {
  if (e && e.target !== document.getElementById('projectEditModal')) return;
  document.getElementById('projectEditModal').classList.remove('open');
};

window.saveProjectForm = function(e) {
  e.preventDefault();
  const projectData = {
    title: document.getElementById('modalProjTitle').value.trim(),
    category: document.getElementById('modalProjCategory').value,
    year: parseInt(document.getElementById('modalProjYear').value) || null,
    description: document.getElementById('modalProjDesc').value.trim(),
    tech: document.getElementById('modalProjTech').value.trim(),
    mediaUrl: document.getElementById('modalProjMedia').value.trim(),
    liveUrl: document.getElementById('modalProjLive').value.trim(),
    downloadUrl: document.getElementById('modalProjDownload').value.trim(),
    status: document.getElementById('modalProjStatus').value,
    isFeatured: document.getElementById('modalProjFeatured').checked
  };

  if (activeEditProject) {
    projectData.id = activeEditProject.id;
  }

  Store.saveProject(projectData);
  showToast(activeEditProject ? 'Proyek berhasil diperbarui' : 'Proyek baru ditambahkan');
  document.getElementById('projectEditModal').classList.remove('open');
  renderActiveAdminTab();
};

window.deleteProject = function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
    Store.deleteProject(id);
    showToast('Proyek berhasil dihapus');
    renderActiveAdminTab();
  }
};

// ADMIN TAB: BLOGS
function renderAdminBlogs(content) {
  const blogs = Store.getBlogs();
  content.innerHTML = `
    <div class="admin-card-head">
      <h3 class="admin-card-title">Kelola Artikel Blog</h3>
      <button class="btn btn-primary btn-sm" onclick="openBlogModal()"><i data-lucide="plus" class="icon-xs"></i> Tulis Artikel</button>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Judul Artikel</th>
            <th>Tag Kategori</th>
            <th>Waktu Baca</th>
            <th>Tanggal Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${blogs.map(b => `
            <tr>
              <td style="font-weight:600;">${escHtml(b.title)}</td>
              <td><span style="font-family:'JetBrains Mono'; font-size:0.8rem;">${escHtml(b.tags)}</span></td>
              <td>${b.readTime || '—'}</td>
              <td>${new Date(b.createdAt).toLocaleDateString('id-ID')}</td>
              <td>
                <div class="action-cell">
                  <button class="btn btn-secondary btn-sm" onclick="openBlogModal('${b.id}')" title="Edit"><i data-lucide="edit" class="icon-xs"></i></button>
                  <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}')" title="Hapus"><i data-lucide="trash-2" class="icon-xs"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
          ${blogs.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Belum ada tulisan di blog.</td></tr>' : ''}
        </tbody>
      </table>
    </div>

    <!-- MODAL WRITE/EDIT BLOG -->
    <div class="modal-overlay" id="blogEditModal" onclick="closeBlogModal(event)">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <h3 class="modal-title" id="blogModalTitle">Tulis Blog Post</h3>
          <button class="modal-close-btn" onclick="closeBlogModal(null)"><i data-lucide="x"></i></button>
        </div>
        <form onsubmit="saveBlogForm(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Judul Artikel *</label>
              <input type="text" id="modalBlogTitle" class="form-input" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kategori / Tags (Pisahkan dengan koma)</label>
                <input type="text" id="modalBlogTags" class="form-input" placeholder="Tech, Web Dev, UI/UX" />
              </div>
              <div class="form-group">
                <label class="form-label">Cover Image URL</label>
                <input type="text" id="modalBlogCover" class="form-input" placeholder="https://..." />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi Pendek / Kutipan *</label>
              <input type="text" id="modalBlogExcerpt" class="form-input" placeholder="Kutipan singkat isi tulisan..." required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Konten HTML *</label>
              <div class="editor-toolbar">
                <button type="button" class="editor-btn" onclick="insertHtmlTag('h2')" title="Header 2"><i data-lucide="heading-2" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('h3')" title="Header 3"><i data-lucide="heading-3" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('p')" title="Paragraf"><i data-lucide="pilcrow" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('b')" title="Tebal"><i data-lucide="bold" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('i')" title="Miring"><i data-lucide="italic" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('ul')" title="List Bullet"><i data-lucide="list" class="icon-xs"></i></button>
                <button type="button" class="editor-btn" onclick="insertHtmlTag('code')" title="Kode"><i data-lucide="code" class="icon-xs"></i></button>
              </div>
              <textarea id="modalBlogContent" class="form-input form-textarea editor-textarea" style="min-height:200px;" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeBlogModal(null)">Batal</button>
            <button type="submit" class="btn btn-primary">Publikasikan</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

window.openBlogModal = function(id = null) {
  const modal = document.getElementById('blogEditModal');
  const title = document.getElementById('blogModalTitle');

  if (id) {
    activeEditBlog = Store.getBlogById(id);
    title.textContent = 'Edit Artikel';
    document.getElementById('modalBlogTitle').value = activeEditBlog.title;
    document.getElementById('modalBlogTags').value = activeEditBlog.tags || '';
    document.getElementById('modalBlogCover').value = activeEditBlog.coverUrl || '';
    document.getElementById('modalBlogExcerpt').value = activeEditBlog.excerpt;
    document.getElementById('modalBlogContent').value = activeEditBlog.content;
  } else {
    activeEditBlog = null;
    title.textContent = 'Tulis Artikel Baru';
    document.getElementById('modalBlogTitle').value = '';
    document.getElementById('modalBlogTags').value = '';
    document.getElementById('modalBlogCover').value = '';
    document.getElementById('modalBlogExcerpt').value = '';
    document.getElementById('modalBlogContent').value = '';
  }

  modal.classList.add('open');
  lucide.createIcons();
};

window.closeBlogModal = function(e) {
  if (e && e.target !== document.getElementById('blogEditModal')) return;
  document.getElementById('blogEditModal').classList.remove('open');
};

window.insertHtmlTag = function(tag) {
  const textarea = document.getElementById('modalBlogContent');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  
  let replacement = '';
  if (tag === 'ul') {
    replacement = `<ul>\n  <li>${selected || 'Item list'}</li>\n</ul>`;
  } else {
    replacement = `<${tag}>${selected || ''}</${tag}>`;
  }

  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  textarea.focus();
  textarea.selectionStart = start + tag.length + 2;
  textarea.selectionEnd = textarea.selectionStart + (selected || '').length;
};

window.saveBlogForm = function(e) {
  e.preventDefault();
  const blogData = {
    title: document.getElementById('modalBlogTitle').value.trim(),
    tags: document.getElementById('modalBlogTags').value.trim(),
    coverUrl: document.getElementById('modalBlogCover').value.trim(),
    excerpt: document.getElementById('modalBlogExcerpt').value.trim(),
    content: document.getElementById('modalBlogContent').value
  };

  if (activeEditBlog) {
    blogData.id = activeEditBlog.id;
  }

  Store.saveBlog(blogData);
  showToast(activeEditBlog ? 'Artikel berhasil diperbarui' : 'Artikel baru berhasil diterbitkan');
  document.getElementById('blogEditModal').classList.remove('open');
  renderActiveAdminTab();
};

window.deleteBlog = function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
    Store.deleteBlog(id);
    showToast('Artikel berhasil dihapus');
    renderActiveAdminTab();
  }
};

// ADMIN TAB: MESSAGES
function renderAdminMessages(content) {
  const messages = Store.getMessages();
  content.innerHTML = `
    <div class="admin-card-head">
      <h3 class="admin-card-title">Pesan Masuk (${messages.length})</h3>
    </div>

    <div class="message-list">
      ${messages.map(m => {
        const dateStr = new Date(m.createdAt).toLocaleString('id-ID');
        return `
          <div class="message-item ${!m.read ? 'unread' : ''}" id="msg-card-${m.id}">
            <div class="message-item-header">
              <div>
                <span class="message-sender">${escHtml(m.name)}</span>
                <span style="color:var(--text-muted); font-size:0.9rem;"> &lt;${escHtml(m.email)}&gt;</span>
              </div>
              <span class="message-meta">${dateStr}</span>
            </div>
            <div style="font-weight:600; margin-bottom:8px; font-size:0.92rem;">Subjek: ${escHtml(m.subject)}</div>
            <p class="message-text">${escHtml(m.text)}</p>
            <div class="message-actions">
              ${!m.read 
                ? `<button class="btn btn-secondary btn-sm" onclick="markMessageRead('${m.id}')"><i data-lucide="check" class="icon-xs"></i> Tandai Dibaca</button>`
                : ''
              }
              <button class="btn btn-danger btn-sm" onclick="deleteMessage('${m.id}')"><i data-lucide="trash-2" class="icon-xs"></i> Hapus</button>
            </div>
          </div>
        `;
      }).join('')}
      ${messages.length === 0 ? '<div class="empty-state"><h3>Belum ada pesan masuk</h3><p>Pesan dari form kontak halaman pengguna akan tampil di sini.</p></div>' : ''}
    </div>
  `;
}

window.markMessageRead = function(id) {
  Store.markMessageRead(id);
  showToast('Pesan ditandai dibaca');
  renderActiveAdminTab();
};

window.deleteMessage = function(id) {
  if (confirm('Hapus pesan ini?')) {
    Store.deleteMessage(id);
    showToast('Pesan dihapus');
    renderActiveAdminTab();
  }
};

// ADMIN TAB: PROFILE
function renderAdminProfile(content) {
  const profile = Store.getProfile();
  content.innerHTML = `
    <div class="admin-card-head">
      <h3 class="admin-card-title">Edit Pengaturan Profil & Sandi</h3>
    </div>

    <form onsubmit="saveProfileForm(event)" style="margin-bottom:40px;">
      <h4 style="margin-bottom:16px; border-bottom:1px solid var(--border-light); padding-bottom:8px;">Data Personal</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nama Anda</label>
          <input type="text" id="adminProfName" class="form-input" value="${escHtml(profile.name)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Title / Peran Profesional</label>
          <input type="text" id="adminProfTitle" class="form-input" value="${escHtml(profile.title)}" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Biografi Deskripsi Singkat</label>
        <textarea id="adminProfBio" class="form-input form-textarea" required>${escHtml(profile.bio)}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email Kontak</label>
          <input type="email" id="adminProfEmail" class="form-input" value="${escHtml(profile.email)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Keahlian (Pisahkan dengan koma)</label>
          <input type="text" id="adminProfSkills" class="form-input" value="${escHtml(profile.skills.join(', '))}" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">GitHub Link</label>
          <input type="text" id="adminProfGithub" class="form-input" value="${escHtml(profile.github)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Instagram Link</label>
          <input type="text" id="adminProfInstagram" class="form-input" value="${escHtml(profile.instagram)}" />
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:10px;">Simpan Perubahan Profil</button>
    </form>

    <form onsubmit="savePasswordForm(event)" style="border-top: 1px solid var(--border-light); padding-top:30px;">
      <h4 style="margin-bottom:16px;">Ganti Sandi Admin</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kata Sandi Baru</label>
          <input type="password" id="adminNewPass" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Konfirmasi Kata Sandi Baru</label>
          <input type="password" id="adminNewPassConfirm" class="form-input" required />
        </div>
      </div>
      <button type="submit" class="btn btn-secondary" style="margin-top:10px;">Perbarui Sandi</button>
    </form>
  `;
}

window.saveProfileForm = function(e) {
  e.preventDefault();
  const profileData = {
    name: document.getElementById('adminProfName').value.trim(),
    title: document.getElementById('adminProfTitle').value.trim(),
    bio: document.getElementById('adminProfBio').value.trim(),
    email: document.getElementById('adminProfEmail').value.trim(),
    github: document.getElementById('adminProfGithub').value.trim(),
    instagram: document.getElementById('adminProfInstagram').value.trim(),
    skills: document.getElementById('adminProfSkills').value.split(',').map(s => s.trim()).filter(Boolean)
  };

  Store.updateProfile(profileData);
  showToast('Informasi profil berhasil diperbarui');
};

window.savePasswordForm = function(e) {
  e.preventDefault();
  const pass = document.getElementById('adminNewPass').value;
  const confirmPass = document.getElementById('adminNewPassConfirm').value;

  if (pass !== confirmPass) {
    showToast('Konfirmasi kata sandi tidak cocok!');
    return;
  }

  Store.changePassword(pass);
  showToast('Kata sandi admin berhasil diperbarui');
  document.getElementById('adminNewPass').value = '';
  document.getElementById('adminNewPassConfirm').value = '';
};

// ==========================================
// UTILITY VIEWS (404)
// ==========================================
function render404(container) {
  container.innerHTML = `
    <div class="container" style="text-align:center; padding: 100px 20px;">
      <h1 style="font-size:5rem; color:var(--primary);">404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p style="color:var(--text-secondary); margin:10px 0 30px;">Tautan yang Anda tuju mungkin sudah rusak atau dihapus.</p>
      <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
    </div>
  `;
}

// ==========================================
// POPUPS & LIGHTBOX LOGIC
// ==========================================
window.openLightbox = function(imgUrl, caption) {
  const lightbox = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  
  img.src = imgUrl;
  cap.textContent = caption;
  lightbox.classList.add('open');
  lucide.createIcons();
};

window.closeLightbox = function(e) {
  if (e && e.target !== document.getElementById('lightboxModal')) return;
  document.getElementById('lightboxModal').classList.remove('open');
};

window.openVideoModal = function(videoUrl, caption) {
  const modal = document.getElementById('videoModal');
  const container = document.getElementById('videoContainer');
  const cap = document.getElementById('videoCaption');
  
  cap.textContent = caption;
  
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    // Basic YouTube embed parsing
    let id = '';
    if (videoUrl.includes('youtube.com/watch?v=')) {
      id = videoUrl.split('watch?v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      id = videoUrl.split('youtu.be/')[1].split('?')[0];
    }
    container.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    // Normal HTML5 video element
    container.innerHTML = `<video src="${escHtml(videoUrl)}" controls autoplay></video>`;
  }

  modal.classList.add('open');
  lucide.createIcons();
};

window.closeVideoModal = function(e) {
  if (e && e.target !== document.getElementById('videoModal')) return;
  document.getElementById('videoContainer').innerHTML = ''; // Stop playback
  document.getElementById('videoModal').classList.remove('open');
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
window.showToast = function(msg) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toastMessage');
  
  text.textContent = msg;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

// Escape helper
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// SECRET BOT ASSISTANT TAB LOGIC
// ==========================================
let assistantPollInterval = null;
window.currentBotConfig = null;

window.startAssistantPolling = function() {
  if (assistantPollInterval) clearInterval(assistantPollInterval);
  
  // Fetch immediately
  fetchAssistantData();
  
  // Poll every 3 seconds
  assistantPollInterval = setInterval(fetchAssistantData, 3000);
};

window.stopAssistantPolling = function() {
  if (assistantPollInterval) {
    clearInterval(assistantPollInterval);
    assistantPollInterval = null;
  }
};

async function fetchAssistantData() {
  try {
    const [statusRes, logsRes, memoriesRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/logs'),
      fetch('/api/memories')
    ]);
    
    if (!statusRes.ok || !logsRes.ok || !memoriesRes.ok) return;
    
    const statusData = await statusRes.json();
    const logsData = await logsRes.json();
    const memoriesData = await memoriesRes.json();
    
    // Store in window cache
    window.currentBotConfig = statusData;
    
    // 1. Connection Status UI
    const statusLabel = document.getElementById('botConnectionStatusLabel');
    const qrBox = document.getElementById('waQrCodeBox');
    const connectedScreen = document.getElementById('waConnectedScreen');
    const btnToggle = document.getElementById('btnToggleWaConnection');
    
    if (statusLabel && qrBox && connectedScreen && btnToggle) {
      if (statusData.isConnected) {
        statusLabel.className = 'card-status status-completed';
        statusLabel.textContent = 'WhatsApp Terhubung';
        qrBox.style.display = 'none';
        connectedScreen.style.display = 'block';
        btnToggle.className = 'btn btn-danger btn-sm';
        btnToggle.textContent = 'Putuskan WhatsApp / Reset';
        
        const bossNumEl = connectedScreen.querySelector('p:last-child');
        if (bossNumEl) bossNumEl.textContent = `Nomor Bos: +${statusData.bosNumber}`;
      } else {
        statusLabel.className = 'card-status status-ongoing';
        statusLabel.textContent = 'Terputus';
        qrBox.style.display = 'flex';
        connectedScreen.style.display = 'none';
        btnToggle.className = 'btn btn-primary btn-sm';
        btnToggle.textContent = 'Segarkan Sesi';
        
        // Render QR Code Image or Loading Spinner
        if (statusData.qr) {
          qrBox.innerHTML = `<img src="${statusData.qr}" style="width:180px; height:180px; border-radius:8px; border:4px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.15);" alt="Scan QR Code" />`;
        } else {
          qrBox.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--text-secondary);">
              <div class="loader-spinner" style="width:30px; height:30px; border:3px solid var(--border-light); border-top-color:var(--primary); border-radius:50%; animation:spin 1s linear infinite;"></div>
              <span style="font-size:0.75rem;">Mempersiapkan sesi & QR...</span>
            </div>
          `;
        }
      }
    }
    
    // Update input values on form if they are not active and haven't been edited
    const inputBos = document.getElementById('botBosNumber');
    const selectEngine = document.getElementById('botAiEngine');
    const inputKey = document.getElementById('botApiKey');
    const inputSheets = document.getElementById('botSheetsId');
    const inputBriefing = document.getElementById('botBriefingTime');
    
    if (inputBos && document.activeElement !== inputBos && !inputBos.dataset.userEdited) {
      inputBos.value = statusData.bosNumber || '';
    }
    if (selectEngine && document.activeElement !== selectEngine) {
      selectEngine.value = statusData.aiEngine || 'gemini';
    }
    if (inputKey && document.activeElement !== inputKey && !inputKey.dataset.userEdited) {
      inputKey.value = statusData.apiKey || '';
    }
    if (inputSheets && document.activeElement !== inputSheets && !inputSheets.dataset.userEdited) {
      inputSheets.value = statusData.sheetsId || '';
    }
    if (inputBriefing && document.activeElement !== inputBriefing) {
      inputBriefing.value = statusData.dailyBriefingTime || '08:00';
    }
    
    // 2. Terminal Logs UI
    const terminal = document.getElementById('botTerminalLogs');
    if (terminal) {
      const shouldScroll = terminal.scrollTop + terminal.clientHeight >= terminal.scrollHeight - 10;
      
      const newHtml = logsData.map(log => `
        <div class="log-line">
          <span class="log-time">[${log.time}]</span>
          <span class="log-type-${log.type}">[${log.type}]</span> ${escHtml(log.text)}
        </div>
      `).join('');
      
      if (terminal.innerHTML !== newHtml) {
        terminal.innerHTML = newHtml;
        if (shouldScroll || terminal.innerHTML === '') {
          terminal.scrollTop = terminal.scrollHeight;
        }
      }
    }
    
    // 3. Memories Table UI
    const memoriesTable = document.getElementById('botMemoriesTableBody');
    if (memoriesTable) {
      const newHtml = memoriesData.map(m => `
        <tr>
          <td>${escHtml(m.fact)}</td>
          <td style="font-size:0.72rem; color:var(--text-muted); font-family:'JetBrains Mono';">${m.date}</td>
          <td>
            <button class="btn btn-danger btn-sm" style="padding:4px 8px;" onclick="deleteBotMemory(${m.id})" title="Lupakan"><i data-lucide="trash" class="icon-xs"></i></button>
          </td>
        </tr>
      `).join('');
      
      const emptyHtml = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">Bot belum diajarkan informasi apa pun.</td></tr>`;
      
      const targetHtml = memoriesData.length === 0 ? emptyHtml : newHtml;
      if (memoriesTable.innerHTML !== targetHtml) {
        memoriesTable.innerHTML = targetHtml;
        lucide.createIcons();
      }
    }
  } catch (err) {
    console.error('Error fetching assistant data:', err);
  }
}

function renderAdminAssistant(content) {
  // Use cached values if loaded, else defaults
  const config = window.currentBotConfig || {
    aiEngine: 'gemini',
    apiKey: '',
    bosNumber: '6281234567890',
    sheetsId: '',
    dailyBriefingTime: '08:00',
    isConnected: false,
    qr: ''
  };

  content.innerHTML = `
    <div class="admin-card-head">
      <h3 class="admin-card-title">🔬 Asisten Pintar WA Bot Panel</h3>
      <span class="card-status ${config.isConnected ? 'status-completed' : 'status-ongoing'}" id="botConnectionStatusLabel">
        ${config.isConnected ? 'WhatsApp Terhubung' : 'Terputus'}
      </span>
    </div>

    <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 30px; margin-top:20px; align-items: start;">
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        
        <div style="background:var(--bg-surface); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-light); text-align:center;">
          <h4 style="margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i data-lucide="qr-code" class="icon-sm"></i> WhatsApp Gateway Link
          </h4>
          <p style="font-size:0.8rem; color:var(--text-secondary);">Scan kode QR berikut menggunakan WhatsApp di ponsel Anda untuk menghubungkan Bot.</p>
          
          <div class="qr-code-box" id="waQrCodeBox" style="display: ${config.isConnected ? 'none' : 'flex'}">
            ${config.qr ? `<img src="${config.qr}" style="width:180px; height:180px; border-radius:8px; border:4px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.15);" alt="Scan QR Code" />` : `
              <div style="display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--text-secondary);">
                <div class="loader-spinner" style="width:30px; height:30px; border:3px solid var(--border-light); border-top-color:var(--primary); border-radius:50%; animation:spin 1s linear infinite;"></div>
                <span style="font-size:0.75rem;">Mempersiapkan sesi & QR...</span>
              </div>
            `}
          </div>
          
          <div id="waConnectedScreen" style="display: ${config.isConnected ? 'block' : 'none'}; padding: 20px 0;">
            <i data-lucide="check-circle" class="icon-lg" style="color:var(--success); margin-bottom:10px;"></i>
            <p style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">Sesi WhatsApp Bos Aktif</p>
            <p style="font-size:0.75rem; color:var(--text-muted);">Nomor Bos: +${config.bosNumber}</p>
          </div>
          
          <div style="margin-top:14px;">
            <button class="btn ${config.isConnected ? 'btn-danger' : 'btn-primary'} btn-sm" id="btnToggleWaConnection" onclick="toggleWaConnectionSim()">
              ${config.isConnected ? 'Putuskan WhatsApp / Reset' : 'Segarkan Sesi'}
            </button>
          </div>
        </div>

        <div style="background:var(--bg-surface); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-light);">
          <h4 style="margin-bottom:16px; border-bottom:1px solid var(--border-light); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="settings" class="icon-sm"></i> Konfigurasi Otak AI & Sheets
          </h4>
          <form onsubmit="saveBotConfigForm(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nomor Bos WhatsApp *</label>
                <input type="text" id="botBosNumber" class="form-input" value="${escHtml(config.bosNumber)}" placeholder="628123456789" oninput="this.dataset.userEdited='true'" required />
              </div>
              <div class="form-group">
                <label class="form-label">AI Engine Model</label>
                <select id="botAiEngine" class="form-input">
                  <option value="gemini" ${config.aiEngine === 'gemini' ? 'selected' : ''}>Gemini Pro NLP</option>
                  <option value="groq" ${config.aiEngine === 'groq' ? 'selected' : ''}>Groq Llama 3</option>
                  <option value="deepseek" ${config.aiEngine === 'deepseek' ? 'selected' : ''}>DeepSeek-R1</option>
                  <option value="local" ${config.aiEngine === 'local' ? 'selected' : ''}>Qwen 2.5 (Local Server)</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">AI API Key</label>
              <input type="password" id="botApiKey" class="form-input" value="${escHtml(config.apiKey)}" placeholder="AIzaSy..." oninput="this.dataset.userEdited='true'" />
            </div>
            <div class="form-group">
              <label class="form-label">Google Sheets Spreadsheet ID *</label>
              <input type="text" id="botSheetsId" class="form-input" value="${escHtml(config.sheetsId)}" oninput="this.dataset.userEdited='true'" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Waktu Briefing Pagi *</label>
                <input type="time" id="botBriefingTime" class="form-input" value="${escHtml(config.dailyBriefingTime)}" required />
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top:28px;">Simpan Konfigurasi</button>
            </div>
          </form>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:24px;">
        
        <div style="background:var(--bg-surface); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-light);">
          <h4 style="display:flex; align-items:center; justify-content:between; gap:8px; margin-bottom:8px;">
            <i data-lucide="terminal" class="icon-sm"></i> Terminal Aktivitas & Simulator WA
            <span style="background:rgba(56, 189, 248, 0.15); color:#38bdf8; font-size:0.65rem; padding:2px 8px; border-radius:4px; margin-left:auto; font-family:'JetBrains Mono';">REALTIME</span>
          </h4>
          
          <div class="cli-terminal" id="botTerminalLogs">
            <!-- Dynamically populated -->
          </div>
          
          <form onsubmit="submitBotSimulatorMsg(event)" class="cli-input-line">
            <span class="cli-prompt">Bos&gt;</span>
            <input type="text" id="botSimInput" class="cli-input" placeholder="Ketik pesan WhatsApp (misal: 'belanja 50 ribu' atau '#akubosmu wifi=kantor123')..." required />
            <button type="submit" style="display:none;"></button>
          </form>
        </div>

        <div style="background:var(--bg-surface); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-light);">
          <h4 style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="database" class="icon-sm"></i> Basis Memori Bot (#akubosmu)
          </h4>
          
          <div class="table-wrapper" style="max-height:160px; overflow-y:auto; margin-bottom:14px;">
            <table class="admin-table" style="font-size:0.8rem;">
              <thead>
                <tr>
                  <th>Informasi Memori</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="botMemoriesTableBody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>

          <form onsubmit="addBotMemoryForm(event)" style="display:flex; gap:10px;">
            <input type="text" id="newMemoryFact" class="form-input" style="font-size:0.85rem; padding:8px 12px;" placeholder="Ajarkan memori manual (cth: wifi password kantor)..." required />
            <button type="submit" class="btn btn-secondary btn-sm" style="padding:0 16px;"><i data-lucide="plus" class="icon-xs"></i></button>
          </form>
        </div>

      </div>

    </div>
  `;

  // Start background update immediately
  fetchAssistantData();
}

window.toggleWaConnectionSim = async function() {
  const btn = document.getElementById('btnToggleWaConnection');
  if (btn) btn.disabled = true;
  
  showToast('Menghubungi server untuk reset sesi...');
  try {
    const res = await fetch('/api/session/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('Sesi direset. Silakan scan QR baru.');
      fetchAssistantData();
    } else {
      showToast('Gagal mereset: ' + data.error);
    }
  } catch (err) {
    showToast('Koneksi server terputus.');
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.saveBotConfigForm = async function(e) {
  e.preventDefault();
  const config = {
    aiEngine: document.getElementById('botAiEngine').value,
    apiKey: document.getElementById('botApiKey').value.trim(),
    bosNumber: document.getElementById('botBosNumber').value.trim(),
    sheetsId: document.getElementById('botSheetsId').value.trim(),
    dailyBriefingTime: document.getElementById('botBriefingTime').value
  };

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Konfigurasi berhasil disimpan!');
      // Clear userEdited flag
      ['botBosNumber', 'botApiKey', 'botSheetsId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) delete el.dataset.userEdited;
      });
      fetchAssistantData();
    } else {
      showToast('Gagal menyimpan konfigurasi.');
    }
  } catch (err) {
    showToast('Koneksi server gagal.');
  }
};

window.addBotMemoryForm = async function(e) {
  e.preventDefault();
  const input = document.getElementById('newMemoryFact');
  const fact = input.value.trim();
  if (!fact) return;

  try {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fact })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Memori diajarkan!');
      input.value = '';
      fetchAssistantData();
    } else {
      showToast('Gagal menambahkan memori.');
    }
  } catch (err) {
    showToast('Koneksi server gagal.');
  }
};

window.deleteBotMemory = async function(id) {
  if (confirm('Lupakan memori ini?')) {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Memori dilupakan!');
        fetchAssistantData();
      } else {
        showToast('Gagal menghapus memori.');
      }
    } catch (err) {
      showToast('Koneksi server gagal.');
    }
  }
};

window.submitBotSimulatorMsg = async function(e) {
  e.preventDefault();
  const inputEl = document.getElementById('botSimInput');
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  
  // Optimistically append User's message to terminal
  const terminal = document.getElementById('botTerminalLogs');
  if (terminal) {
    const timeStr = new Date().toTimeString().split(' ')[0];
    terminal.innerHTML += `
      <div class="log-line">
        <span class="log-time">[${timeStr}]</span>
        <span class="log-type-INCOMING">[INCOMING]</span> Bos (Dashboard): "${escHtml(text)}"
      </div>
    `;
    terminal.scrollTop = terminal.scrollHeight;
  }

  try {
    const res = await fetch('/api/chat/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!data.success) {
      showToast('Simulator error: ' + data.error);
    } else {
      // Force refresh data to display the responses from server
      setTimeout(fetchAssistantData, 300);
    }
  } catch (err) {
    showToast('Koneksi server gagal.');
  }
};

// ==========================================
// PARTICLES & INITIALIZATION
// ==========================================
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

function initMobileMenu() {
  const burger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function init3dCanvas() {
  const container = document.getElementById('canvas3d-container');
  if (!container) return;

  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded.');
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050811, 0.018);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 16, 36);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const width = 150;
  const height = 150;
  const segments = 45;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.18,
    transparent: true,
    opacity: 0.55
  });

  const points = new THREE.Points(geometry, pointsMaterial);
  scene.add(points);

  const starsGeom = new THREE.BufferGeometry();
  const starsCount = 200;
  const starsPos = new Float32Array(starsCount * 3);
  
  for (let i = 0; i < starsCount * 3; i += 3) {
    starsPos[i] = (Math.random() - 0.5) * 220;
    starsPos[i+1] = Math.random() * 90 - 15;
    starsPos[i+2] = (Math.random() - 0.5) * 220;
  }
  
  starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
  const starsMaterial = new THREE.PointsMaterial({
    color: 0x06b6d4,
    size: 0.15,
    transparent: true,
    opacity: 0.75
  });
  const starField = new THREE.Points(starsGeom, starsMaterial);
  scene.add(starField);

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    targetRotY = nx * 0.3;
    targetRotX = ny * 0.18;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const positions = geometry.attributes.position.array;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const index = (i * (segments + 1) + j) * 3;
        const x = positions[index];
        const z = positions[index + 2];
        
        const wave1 = Math.sin(x * 0.07 + time * 0.95) * Math.cos(z * 0.07 + time * 0.95) * 3.8;
        const wave2 = Math.sin(x * 0.15 - time * 0.5) * 1.8;
        
        positions[index + 1] = wave1 + wave2;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    currentRotX += (targetRotX - currentRotX) * 0.06;
    currentRotY += (targetRotY - currentRotY) * 0.06;

    points.rotation.y = time * 0.025 + currentRotY;
    points.rotation.z = time * 0.015;
    
    starField.rotation.y = -time * 0.008 + currentRotY * 0.5;

    // Dynamic color updates for light-mode blending
    const isLightMode = document.body.classList.contains('light-mode');
    scene.fog.color.setHex(isLightMode ? 0xf8fafc : 0x050811);
    pointsMaterial.color.setHex(isLightMode ? 0x8b5cf6 : 0x8b5cf6);
    starsMaterial.color.setHex(isLightMode ? 0x06b6d4 : 0x06b6d4);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let cursorVisible = false;

function initCustomCursor() {
  const dot = document.getElementById('customCursorDot');
  const ring = document.getElementById('customCursorRing');
  if (!dot || !ring) return;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursorVisible) {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      cursorVisible = true;
    }
    
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    cursorVisible = false;
  });

  function updateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    
    requestAnimationFrame(updateRing);
  }
  updateRing();

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('a, button, select, input, textarea, .project-card, .blog-card, .filter-tab, .lightbox-close, .admin-sidebar-btn');
    if (el) {
      document.body.classList.add('cursor-hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('a, button, select, input, textarea, .project-card, .blog-card, .filter-tab, .lightbox-close, .admin-sidebar-btn');
    if (el) {
      document.body.classList.remove('cursor-hovering');
    }
  });
}

function init3dTilt() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.project-card, .blog-card');
    if (!card) {
      document.querySelectorAll('.project-card, .blog-card').forEach(c => {
        c.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s, box-shadow 0.4s';
        c.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
      return;
    }
    
    // Low transition time while moving inside the card ensures ultra-smooth zero-lag mouse tracking
    card.style.transition = 'transform 0.08s ease-out, border-color 0.4s, box-shadow 0.4s';
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    
    const dx = (x / w) - 0.5;
    const dy = (y / h) - 0.5;
    
    const rotateY = dx * 16; // 16deg max tilt
    const rotateX = -dy * 16;
    
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;
  });
}

function initLazyImages() {
  const lazyImages = document.querySelectorAll('.lazy-img');
  lazyImages.forEach(img => {
    const tempImg = new Image();
    tempImg.src = img.getAttribute('data-src');
    tempImg.onload = () => {
      img.src = tempImg.src;
      img.classList.add('loaded');
      const skeleton = img.previousElementSibling;
      if (skeleton && skeleton.classList.contains('skeleton-box')) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 750);
      }
    };
  });
}

window.triggerThemeToggle = function(e) {
  const overlay = document.getElementById('themeRippleOverlay');
  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');
  if (!overlay) return;

  const isLight = document.body.classList.contains('light-mode');

  overlay.style.setProperty('--ripple-x', `${e.clientX}px`);
  overlay.style.setProperty('--ripple-y', `${e.clientY}px`);
  overlay.style.background = isLight ? '#050811' : '#f8fafc';
  overlay.classList.add('animating');

  setTimeout(() => {
    if (isLight) {
      document.body.classList.remove('light-mode');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    } else {
      document.body.classList.add('light-mode');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
    lucide.createIcons();
  }, 400);

  setTimeout(() => {
    overlay.classList.remove('animating');
  }, 850);
};

// ==========================================
// DESIGNER TOOLS PAGE & CALCULATORS
// ==========================================

// Global state for tools
window.paletteState = {
  baseColor: '#818cf8',
  rule: 'complementary',
  colors: ['#818cf8', '#38bdf8', '#0f172a', '#e2e8f0', '#ffffff'],
  locked: [false, false, false, false, false],
  exportFormat: 'css'
};

window.contrastState = {
  fg: '#ffffff',
  bg: '#0f172a'
};

window.aspectState = {
  w: 1920,
  h: 1080,
  targetW: 1280,
  targetH: 720
};

window.glassState = {
  color: '#ffffff',
  opacity: 3,
  blur: 18,
  saturation: 225,
  radius: 27,
  borderOpacity: 10
};

// Math Helpers for Color Calculations
function hexToHsl(hex) {
  hex = hex.replace(/#/g, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`.toLowerCase();
}

function hexToRgb(hex) {
  hex = hex.replace(/#/g, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

// Relative Luminance for WCAG Contrast calculations
function getLuminance(hex) {
  let rgb = hexToRgb(hex);
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  
  let a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  let l1 = getLuminance(hex1);
  let l2 = getLuminance(hex2);
  let bright = Math.max(l1, l2);
  let dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

// GCD helper for aspect ratio simplification
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

// Main Page Switcher inside tools subview
window.switchToolsTab = function(tabId) {
  // Remove active classes
  document.querySelectorAll('.tools-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tool-panel').forEach(panel => panel.classList.remove('active'));
  
  // Set current active
  const activeBtn = document.querySelector(`.tools-tab-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  const activePanel = document.getElementById(`toolPanel-${tabId}`);
  if (activePanel) activePanel.classList.add('active');
  
  // Trigger specific tab setup
  if (tabId === 'harmony') {
    updatePalette();
  } else if (tabId === 'contrast') {
    updateContrast();
  } else if (tabId === 'ratio') {
    updateAspectRatio();
  } else if (tabId === 'glass') {
    updateGlassmorphism();
  } else if (tabId === 'golden') {
    updateGoldenRatio();
  }
};

// --- TOOL 1: COLOR HARMONY FUNCTIONS ---
function generateHarmonyColors(baseHex, rule) {
  const hsl = hexToHsl(baseHex);
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;
  let palette = [];
  
  if (rule === 'monochromatic') {
    palette = [
      hslToHex(h, s, Math.max(12, l - 35)),
      hslToHex(h, s, Math.max(25, l - 15)),
      baseHex,
      hslToHex(h, s, Math.min(85, l + 15)),
      hslToHex(h, s, Math.min(97, l + 35))
    ];
  } else if (rule === 'analogous') {
    palette = [
      hslToHex((h - 30 + 360) % 360, s, l),
      hslToHex((h - 15 + 360) % 360, s, l),
      baseHex,
      hslToHex((h + 15) % 360, s, l),
      hslToHex((h + 30) % 360, s, l)
    ];
  } else if (rule === 'complementary') {
    palette = [
      hslToHex(h, s, Math.max(15, l - 20)),
      baseHex,
      hslToHex((h + 180) % 360, s, l),
      hslToHex((h + 180) % 360, s, Math.min(85, l + 20)),
      hslToHex((h + 180) % 360, Math.max(10, s - 20), Math.min(95, l + 35))
    ];
  } else if (rule === 'triadic') {
    palette = [
      hslToHex(h, s, Math.max(15, l - 20)),
      baseHex,
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
      hslToHex((h + 240) % 360, s, Math.min(90, l + 20))
    ];
  } else if (rule === 'split-complementary') {
    palette = [
      hslToHex(h, s, Math.max(15, l - 20)),
      baseHex,
      hslToHex((h + 150) % 360, s, l),
      hslToHex((h + 210) % 360, s, l),
      hslToHex((h + 210) % 360, s, Math.min(90, l + 20))
    ];
  }
  
  return palette;
}

window.toggleColorLock = function(index) {
  window.paletteState.locked[index] = !window.paletteState.locked[index];
  const lockBtn = document.getElementById(`lockBtn-${index}`);
  if (lockBtn) {
    if (window.paletteState.locked[index]) {
      lockBtn.classList.add('locked');
      lockBtn.innerHTML = '<i data-lucide="lock" style="width:14px; height:14px;"></i>';
    } else {
      lockBtn.classList.remove('locked');
      lockBtn.innerHTML = '<i data-lucide="unlock" style="width:14px; height:14px;"></i>';
    }
    lucide.createIcons();
  }
};

window.promoteToPrimary = function(index) {
  const chosenColor = window.paletteState.colors[index];
  window.paletteState.baseColor = chosenColor;
  
  const basePicker = document.getElementById('harmonyBaseColorPicker');
  const baseHex = document.getElementById('harmonyBaseColorHex');
  if (basePicker) basePicker.value = chosenColor;
  if (baseHex) baseHex.value = chosenColor;
  
  updatePalette();
};

window.copyColorToClipboard = function(hexStr) {
  navigator.clipboard.writeText(hexStr).then(() => {
    showToast(`HEX ${hexStr.toUpperCase()} disalin ke papan klip!`);
  });
};

window.switchExportTab = function(format) {
  window.paletteState.exportFormat = format;
  document.querySelectorAll('.exporter-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.exporter-tab-btn[data-format="${format}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  updateExporterCode();
};

window.copyExportedCode = function() {
  const codeEl = document.getElementById('exporterCodeText');
  if (codeEl) {
    navigator.clipboard.writeText(codeEl.textContent).then(() => {
      showToast(`Kode ekspor palet ${window.paletteState.exportFormat.toUpperCase()} berhasil disalin!`);
    });
  }
};

window.toggleExporterDrawer = function() {
  const drawer = document.getElementById('harmonyExporterDrawer');
  const btn = document.getElementById('btnToggleExporter');
  if (drawer && btn) {
    if (drawer.style.display === 'none') {
      drawer.style.display = 'block';
      btn.innerHTML = '<i data-lucide="eye-off" class="icon-xs"></i> Sembunyikan Kode';
    } else {
      drawer.style.display = 'none';
      btn.innerHTML = '<i data-lucide="code" class="icon-xs"></i> Ekspor Kode CSS/SCSS';
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};

function updatePalette() {
  const state = window.paletteState;
  const generated = generateHarmonyColors(state.baseColor, state.rule);
  
  // Blend generated harmony, ignoring locked slots
  for (let i = 0; i < 5; i++) {
    if (!state.locked[i]) {
      state.colors[i] = generated[i];
    }
  }
  
  // Render swatches
  for (let i = 0; i < 5; i++) {
    const block = document.getElementById(`swatchBlock-${i}`);
    const hexText = document.getElementById(`swatchHex-${i}`);
    if (block) block.style.backgroundColor = state.colors[i];
    if (hexText) hexText.textContent = state.colors[i];
  }
  
  // Update Live Mockup colors
  const mockupHero = document.getElementById('mockupHeroPreview');
  const mockupTag = document.getElementById('mockupTagline');
  const mockupTitle = document.getElementById('mockupTitle');
  const mockupDesc = document.getElementById('mockupDesc');
  const mockupPrimary = document.getElementById('mockupPrimaryBtn');
  const mockupSecondary = document.getElementById('mockupSecondaryBtn');
  
  if (mockupHero) mockupHero.style.backgroundColor = state.colors[0]; // Dark Base
  if (mockupTag) {
    mockupTag.style.backgroundColor = `${state.colors[2]}1a`; // 10% opacity accent
    mockupTag.style.color = state.colors[2]; // Accent color
  }
  if (mockupTitle) mockupTitle.style.color = state.colors[4]; // Title text color
  if (mockupDesc) mockupDesc.style.color = `${state.colors[4]}b3`; // 70% body color
  if (mockupPrimary) {
    mockupPrimary.style.backgroundColor = state.colors[2]; // Accent button
    mockupPrimary.style.color = state.colors[0]; // Background text contrast
  }
  if (mockupSecondary) {
    mockupSecondary.style.borderColor = state.colors[3]; // Soft border color
    mockupSecondary.style.color = state.colors[3]; // Soft text accent
  }
  
  // Update Exporter
  updateExporterCode();
}

function updateExporterCode() {
  const state = window.paletteState;
  const codeEl = document.getElementById('exporterCodeText');
  if (!codeEl) return;
  
  let codeStr = '';
  if (state.exportFormat === 'css') {
    codeStr = `:root {\n` +
      `  --color-base: ${state.colors[0]};\n` +
      `  --color-surface: ${state.colors[1]};\n` +
      `  --color-primary: ${state.colors[2]};\n` +
      `  --color-secondary: ${state.colors[3]};\n` +
      `  --color-text: ${state.colors[4]};\n` +
      `}`;
  } else if (state.exportFormat === 'scss') {
    codeStr = `$color-base: ${state.colors[0]};\n` +
      `$color-surface: ${state.colors[1]};\n` +
      `$color-primary: ${state.colors[2]};\n` +
      `$color-secondary: ${state.colors[3]};\n` +
      `$color-text: ${state.colors[4]};`;
  } else if (state.exportFormat === 'json') {
    codeStr = JSON.stringify({
      base: state.colors[0],
      surface: state.colors[1],
      primary: state.colors[2],
      secondary: state.colors[3],
      text: state.colors[4]
    }, null, 2);
  }
  
  codeEl.textContent = codeStr;
}

// --- TOOL 2: WCAG CONTRAST CHECKER FUNCTIONS ---
window.swapContrastColors = function() {
  const fgPicker = document.getElementById('contrastFgColorPicker');
  const bgPicker = document.getElementById('contrastBgColorPicker');
  const fgHex = document.getElementById('contrastFgColorHex');
  const bgHex = document.getElementById('contrastBgColorHex');
  
  if (fgPicker && bgPicker && fgHex && bgHex) {
    const temp = window.contrastState.fg;
    window.contrastState.fg = window.contrastState.bg;
    window.contrastState.bg = temp;
    
    fgPicker.value = window.contrastState.fg;
    fgHex.value = window.contrastState.fg;
    bgPicker.value = window.contrastState.bg;
    bgHex.value = window.contrastState.bg;
    
    updateContrast();
  }
};

function updateContrast() {
  const fg = window.contrastState.fg;
  const bg = window.contrastState.bg;
  
  const ratio = getContrastRatio(fg, bg);
  
  // Update ratio text
  const ratioValEl = document.getElementById('contrastRatioVal');
  if (ratioValEl) ratioValEl.textContent = ratio.toFixed(2) + ':1';
  
  // Calculate badges
  const badgeAA = document.getElementById('badgeAA');
  const badgeAAA = document.getElementById('badgeAAA');
  const badgeAALarge = document.getElementById('badgeAALarge');
  const badgeAAALarge = document.getElementById('badgeAAALarge');
  
  if (badgeAA) {
    if (ratio >= 4.5) {
      badgeAA.className = 'contrast-status-badge pass';
      badgeAA.textContent = 'Lulus (Pass)';
    } else {
      badgeAA.className = 'contrast-status-badge fail';
      badgeAA.textContent = 'Gagal (Fail)';
    }
  }
  
  if (badgeAAA) {
    if (ratio >= 7.0) {
      badgeAAA.className = 'contrast-status-badge pass';
      badgeAAA.textContent = 'Lulus (Pass)';
    } else {
      badgeAAA.className = 'contrast-status-badge fail';
      badgeAAA.textContent = 'Gagal (Fail)';
    }
  }
  
  if (badgeAALarge) {
    if (ratio >= 3.0) {
      badgeAALarge.className = 'contrast-status-badge pass';
      badgeAALarge.textContent = 'Lulus (Pass)';
    } else {
      badgeAALarge.className = 'contrast-status-badge fail';
      badgeAALarge.textContent = 'Gagal (Fail)';
    }
  }
  
  if (badgeAAALarge) {
    if (ratio >= 4.5) {
      badgeAAALarge.className = 'contrast-status-badge pass';
      badgeAAALarge.textContent = 'Lulus (Pass)';
    } else {
      badgeAAALarge.className = 'contrast-status-badge fail';
      badgeAAALarge.textContent = 'Gagal (Fail)';
    }
  }
  
  // Update sample window
  const sampleWin = document.getElementById('contrastSampleWindow');
  if (sampleWin) {
    sampleWin.style.backgroundColor = bg;
    sampleWin.style.color = fg;
  }
}

// --- TOOL 3: ASPECT RATIO CALCULATOR ---
window.setAspectPreset = function(wVal, hVal) {
  window.aspectState.w = wVal;
  window.aspectState.h = hVal;
  
  const origW = document.getElementById('aspectOrigW');
  const origH = document.getElementById('aspectOrigH');
  
  if (origW) origW.value = wVal;
  if (origH) origH.value = hVal;
  
  document.querySelectorAll('.aspect-preset-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.aspect-preset-btn[onclick="setAspectPreset(${wVal}, ${hVal})"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Update targets based on current target width
  recalcAspectRatio('w');
};

window.onAspectInput = function(dimension) {
  const origW = document.getElementById('aspectOrigW');
  const origH = document.getElementById('aspectOrigH');
  const targW = document.getElementById('aspectTargW');
  const targH = document.getElementById('aspectTargH');
  
  if (dimension === 'origW' || dimension === 'origH') {
    window.aspectState.w = parseInt(origW.value) || 16;
    window.aspectState.h = parseInt(origH.value) || 9;
    
    // Clear active presets
    document.querySelectorAll('.aspect-preset-btn').forEach(btn => btn.classList.remove('active'));
    recalcAspectRatio('w');
  } else if (dimension === 'targW') {
    window.aspectState.targetW = parseInt(targW.value) || 1280;
    recalcAspectRatio('w');
  } else if (dimension === 'targH') {
    window.aspectState.targetH = parseInt(targH.value) || 720;
    recalcAspectRatio('h');
  }
};

function recalcAspectRatio(basedOn) {
  const state = window.aspectState;
  const divisor = gcd(state.w, state.h);
  const ratioStr = `${state.w / divisor}:${state.h / divisor}`;
  
  const lbl = document.getElementById('aspectCalculatedRatioLbl');
  if (lbl) lbl.textContent = ratioStr;
  
  const targW = document.getElementById('aspectTargW');
  const targH = document.getElementById('aspectTargH');
  
  if (basedOn === 'w') {
    state.targetH = Math.round(state.targetW * (state.h / state.w));
    if (targH) targH.value = state.targetH;
  } else {
    state.targetW = Math.round(state.targetH * (state.w / state.h));
    if (targW) targW.value = state.targetW;
  }
  
  updateAspectRatio();
}

function updateAspectRatio() {
  const state = window.aspectState;
  const previewBox = document.getElementById('aspectRatioPreviewBox');
  if (!previewBox) return;
  
  const maxW = 200;
  const maxH = 180;
  let boxW, boxH;
  
  if (state.w / state.h > maxW / maxH) {
    boxW = maxW;
    boxH = Math.round(maxW * (state.h / state.w));
  } else {
    boxH = maxH;
    boxW = Math.round(maxH * (state.w / state.h));
  }
  
  previewBox.style.width = `${boxW}px`;
  previewBox.style.height = `${boxH}px`;
  
  const div = gcd(state.w, state.h);
  previewBox.innerHTML = `
    <div style="font-size:0.95rem; font-weight:700;">${state.w / div}:${state.h / div}</div>
    <div style="font-size:0.6rem; opacity:0.8; margin-top:2px;">${state.targetW} x ${state.targetH}</div>
  `;
}

// --- TOOL 4: GLASSMORPHISM CSS GENERATOR ---
window.onGlassSliderInput = function() {
  const picker = document.getElementById('glassColorPicker');
  const opac = document.getElementById('glassOpacitySlider');
  const blur = document.getElementById('glassBlurSlider');
  const sat = document.getElementById('glassSaturationSlider');
  const rad = document.getElementById('glassRadiusSlider');
  const bopac = document.getElementById('glassBorderOpacitySlider');
  
  if (!picker) return;
  
  window.glassState = {
    color: picker.value,
    opacity: parseInt(opac.value),
    blur: parseInt(blur.value),
    saturation: parseInt(sat.value),
    radius: parseInt(rad.value),
    borderOpacity: parseInt(bopac.value)
  };
  
  // Update numerical texts
  document.getElementById('glassOpacityVal').textContent = opac.value + '%';
  document.getElementById('glassBlurVal').textContent = blur.value + 'px';
  document.getElementById('glassSaturationVal').textContent = sat.value + '%';
  document.getElementById('glassRadiusVal').textContent = rad.value + 'px';
  document.getElementById('glassBorderOpacityVal').textContent = bopac.value + '%';
  
  updateGlassmorphism();
};

function updateGlassmorphism() {
  const state = window.glassState;
  const rgb = hexToRgb(state.color);
  
  const bgStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.opacity / 100})`;
  const filterStyle = `blur(${state.blur}px) saturate(${state.saturation}%)`;
  const borderStyle = `1px solid rgba(255, 255, 255, ${state.borderOpacity / 100})`;
  const radiusStyle = `${state.radius}px`;
  
  const glassCard = document.getElementById('glassPreviewElement');
  if (glassCard) {
    glassCard.style.backgroundColor = bgStyle;
    glassCard.style.backdropFilter = filterStyle;
    glassCard.style.webkitBackdropFilter = filterStyle;
    glassCard.style.border = borderStyle;
    glassCard.style.borderRadius = radiusStyle;
  }
  
  const cssCode = document.getElementById('glassCodeText');
  if (cssCode) {
    cssCode.textContent = `background: ${bgStyle};\n` +
      `backdrop-filter: ${filterStyle};\n` +
      `-webkit-backdrop-filter: ${filterStyle};\n` +
      `border-radius: ${radiusStyle};\n` +
      `border: ${borderStyle};`;
  }
}

window.copyGlassCss = function() {
  const codeEl = document.getElementById('glassCodeText');
  if (codeEl) {
    navigator.clipboard.writeText(codeEl.textContent).then(() => {
      showToast('Kode CSS Glassmorphism berhasil disalin!');
    });
  }
};

window.updateGoldenRatio = function() {
  const modeSelect = document.getElementById('goldenModeSelect');
  const inputEl = document.getElementById('goldenInputVal');
  if (!modeSelect || !inputEl) return;

  const mode = modeSelect.value;
  const val = parseFloat(inputEl.value) || 0;
  const phi = 1.61803398875;

  let larger = 0;
  let smaller = 0;
  let total = 0;

  if (mode === 'base-larger') {
    larger = val;
    smaller = val / phi;
    total = larger + smaller;
    document.getElementById('goldenInputLabel').textContent = 'Masukkan Nilai A (Bagian Besar)';
  } else if (mode === 'base-smaller') {
    smaller = val;
    larger = val * phi;
    total = larger + smaller;
    document.getElementById('goldenInputLabel').textContent = 'Masukkan Nilai B (Bagian Kecil)';
  } else if (mode === 'base-total') {
    total = val;
    larger = val / phi;
    smaller = total - larger;
    document.getElementById('goldenInputLabel').textContent = 'Masukkan Nilai Total (A + B)';
  }

  // Update display values
  document.getElementById('goldenResLarger').textContent = larger.toFixed(2) + ' px';
  document.getElementById('goldenResSmaller').textContent = smaller.toFixed(2) + ' px';
  document.getElementById('goldenResTotal').textContent = total.toFixed(2) + ' px';

  // Update visual boxes
  const boxA = document.getElementById('goldenBoxA');
  const boxB = document.getElementById('goldenBoxB');
  if (boxA && boxB) {
    const pctA = total > 0 ? (larger / total) * 100 : 50;
    const pctB = total > 0 ? (smaller / total) * 100 : 50;
    boxA.style.width = pctA + '%';
    boxA.textContent = `A (${pctA.toFixed(1)}%)`;
    boxB.style.width = pctB + '%';
    boxB.textContent = `B (${pctB.toFixed(1)}%)`;
  }

  // Suggest typography scale
  let baseFont = 16;
  if (val > 8 && val < 60) {
    baseFont = Math.round(val);
  } else if (smaller > 8 && smaller < 60) {
    baseFont = Math.round(smaller);
  }

  const h3Font = Math.round(baseFont * phi);
  const h2Font = Math.round(h3Font * phi);
  const h1Font = Math.round(h2Font * phi);
  const giantFont = Math.round(h1Font * phi);

  document.getElementById('typoBase').textContent = baseFont + ' px';
  document.getElementById('typoH3').textContent = h3Font + ' px';
  document.getElementById('typoH2').textContent = h2Font + ' px';
  document.getElementById('typoH1').textContent = h1Font + ' px';
  document.getElementById('typoHero').textContent = giantFont + ' px';
};

// --- CORE TOOLS PAGE INJECTION ---
function renderDesignerTools(container) {
  container.innerHTML = `
    <div class="container" style="padding-top:100px; padding-bottom:60px;">
      <div class="tools-container">
        
        <div class="tools-header-card">
          <h2 class="tools-title"><i data-lucide="palette" class="icon-lg"></i> Alat Desain Kreatif ⬡</h2>
          <p class="tools-desc">Suite peralatan interaktif gratis untuk desainer grafis dan web desainer. Didesain secara profesional menggunakan perhitungan matematika warna untuk membantu menyelesaikan proyek desain Anda secara instan.</p>
        </div>
        
        <!-- Tab Navigation -->
        <div class="tools-tabs-nav">
          <button class="tools-tab-btn active" data-tab="harmony" onclick="switchToolsTab('harmony')">
            <i data-lucide="palette"></i> Harmoni Warna
          </button>
          <button class="tools-tab-btn" data-tab="contrast" onclick="switchToolsTab('contrast')">
            <i data-lucide="eye"></i> WCAG Kontras
          </button>
          <button class="tools-tab-btn" data-tab="ratio" onclick="switchToolsTab('ratio')">
            <i data-lucide="maximize"></i> Rasio Aspek
          </button>
          <button class="tools-tab-btn" data-tab="glass" onclick="switchToolsTab('glass')">
            <i data-lucide="layers"></i> CSS Glassmorphism
          </button>
          <button class="tools-tab-btn" data-tab="golden" onclick="switchToolsTab('golden')">
            <i data-lucide="compass"></i> Rasio Emas (Golden Ratio)
          </button>
        </div>

        <div class="tools-active-panel-container">
          
          <!-- TAB 1: HARMONI WARNA -->
          <div class="tool-panel active" id="toolPanel-harmony">
            
            <!-- TOP ROW: DISPLAY & PREVIEW -->
            <div class="harmony-top-row">
              <!-- Left: Mockup Preview -->
              <div class="tool-card harmony-mockup-card">
                <h3 class="tool-card-title" style="margin-bottom: 12px;">
                  <i data-lucide="monitor" class="icon-sm"></i> Pratinjau Tampilan (Real-time Preview)
                </h3>
                <div class="mockup-container">
                  <div class="mockup-navbar">
                    <div class="mockup-dot mockup-dot-red"></div>
                    <div class="mockup-dot mockup-dot-yellow"></div>
                    <div class="mockup-dot mockup-dot-green"></div>
                    <span style="font-size:0.6rem; color:rgba(255,255,255,0.4); margin-left:6px; font-family:'JetBrains Mono';">bagas-design-hero.html</span>
                  </div>
                  <div class="mockup-hero" id="mockupHeroPreview">
                    <span class="mockup-tagline" id="mockupTagline">Kombinasi Sempurna</span>
                    <h4 class="mockup-title" id="mockupTitle">Membangun Estetika Visual Tanpa Batas</h4>
                    <p class="mockup-desc" id="mockupDesc">Palet warna ini diuji langsung menggunakan arsitektur visual nyata untuk efektivitas optimal desainer.</p>
                    <div class="mockup-actions">
                      <button class="mockup-btn mockup-btn-primary" id="mockupPrimaryBtn">Mulai Desain</button>
                      <button class="mockup-btn mockup-btn-secondary" id="mockupSecondaryBtn">Pelajari Lebih Lanjut</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right: Palette Swatches -->
              <div class="tool-card harmony-palette-card">
                <h3 class="tool-card-title" style="margin-bottom: 12px;">
                  <i data-lucide="palette" class="icon-sm"></i> Palet Harmonis Anda
                </h3>
                <div class="palette-swatches vertical-palette">
                  ${[0, 1, 2, 3, 4].map(idx => `
                    <div class="swatch-card vertical-swatch">
                      <div class="swatch-color-block-mini" id="swatchBlock-${idx}" onclick="copyColorToClipboard(window.paletteState.colors[${idx}])" title="Klik untuk salin"></div>
                      <div class="swatch-info-row">
                        <span class="swatch-hex" id="swatchHex-${idx}">#ffffff</span>
                        <div class="swatch-buttons" style="display:flex; gap:8px;">
                          <button class="swatch-icon-btn ${window.paletteState.locked[idx] ? 'locked' : ''}" id="lockBtn-${idx}" onclick="toggleColorLock(${idx})" title="Kunci warna saat diacak">
                            <i data-lucide="${window.paletteState.locked[idx] ? 'lock' : 'unlock'}"></i>
                          </button>
                          <button class="swatch-icon-btn set-base" onclick="promoteToPrimary(${idx})" title="Jadikan Warna Utama">
                            <i data-lucide="star"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- BOTTOM ROW: SETTINGS & CONTROLS -->
            <div class="harmony-bottom-row">
              <div class="tool-card">
                <div class="harmony-controls-header">
                  <h3 class="tool-card-title" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                    <i data-lucide="sliders" class="icon-sm"></i> Pengaturan & Penyesuaian
                  </h3>
                  <button class="btn btn-secondary btn-sm" id="btnToggleExporter" onclick="toggleExporterDrawer()" style="display:flex; align-items:center; gap:8px;">
                    <i data-lucide="code" class="icon-xs"></i> Ekspor Kode CSS/SCSS
                  </button>
                </div>
                
                <div class="form-row" style="margin-top: 20px;">
                  <div class="form-group" style="flex:0.35;">
                    <label class="form-label">Warna Utama</label>
                    <div style="display:flex; gap:10px;">
                      <input type="color" id="harmonyBaseColorPicker" class="form-input" style="padding:4px; height:42px; width:45px; cursor:pointer;" value="${window.paletteState.baseColor}" />
                      <input type="text" id="harmonyBaseColorHex" class="form-input" style="font-family:'JetBrains Mono'; text-transform:uppercase;" value="${window.paletteState.baseColor}" placeholder="#818CF8" required />
                    </div>
                  </div>
                  <div class="form-group" style="flex:0.65;">
                    <label class="form-label">Aturan Harmoni Desain</label>
                    <select id="harmonyRuleSelect" class="form-input">
                      <option value="complementary" ${window.paletteState.rule === 'complementary' ? 'selected' : ''}>Komplementer (Kontras Tinggi)</option>
                      <option value="analogous" ${window.paletteState.rule === 'analogous' ? 'selected' : ''}>Analog (Warna Sebelah)</option>
                      <option value="monochromatic" ${window.paletteState.rule === 'monochromatic' ? 'selected' : ''}>Monokromatis (Varian Terang/Gelap)</option>
                      <option value="triadic" ${window.paletteState.rule === 'triadic' ? 'selected' : ''}>Triadik (Segitiga Seimbang)</option>
                      <option value="split-complementary" ${window.paletteState.rule === 'split-complementary' ? 'selected' : ''}>Komplementer Pecah</option>
                    </select>
                  </div>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                  <button class="btn btn-primary btn-sm" style="flex: 1; display:flex; justify-content:center; align-items:center; gap:8px;" id="harmonyBtnRandomBase">
                    <i data-lucide="refresh-cw" class="icon-xs"></i> Acak Warna Utama
                  </button>
                </div>

                <!-- Code Exporter Drawer (Collapsed by default) -->
                <div class="exporter-drawer" id="harmonyExporterDrawer" style="display: none; margin-top: 20px; animation: slideDown 0.3s ease-out;">
                  <div class="exporter-tabs">
                    <button class="exporter-tab-btn active" data-format="css" onclick="switchExportTab('css')">CSS Variables</button>
                    <button class="exporter-tab-btn" data-format="scss" onclick="switchExportTab('scss')">SCSS</button>
                    <button class="exporter-tab-btn" data-format="json" onclick="switchExportTab('json')">JSON</button>
                  </div>
                  <div class="exporter-code-panel">
                    <pre class="exporter-code" id="exporterCodeText"></pre>
                    <button class="btn btn-primary btn-sm exporter-copy-btn" onclick="copyExportedCode()">Salin Kode</button>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
          
          <!-- TAB 2: WCAG KONTRAS -->
          <div class="tool-panel" id="toolPanel-contrast">
            <div class="tool-grid-layout">
              
              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="settings" class="icon-sm"></i> Pengaturan Kontras</h3>
                <div class="form-group">
                  <label class="form-label">Warna Teks (Foreground) *</label>
                  <div style="display:flex; gap:10px;">
                    <input type="color" id="contrastFgColorPicker" class="form-input" style="padding:4px; height:42px; width:45px; cursor:pointer;" value="${window.contrastState.fg}" />
                    <input type="text" id="contrastFgColorHex" class="form-input" style="font-family:'JetBrains Mono'; text-transform:uppercase;" value="${window.contrastState.fg}" required />
                  </div>
                </div>
                <div class="form-group" style="margin-top:16px;">
                  <label class="form-label">Warna Latar Belakang (Background) *</label>
                  <div style="display:flex; gap:10px;">
                    <input type="color" id="contrastBgColorPicker" class="form-input" style="padding:4px; height:42px; width:45px; cursor:pointer;" value="${window.contrastState.bg}" />
                    <input type="text" id="contrastBgColorHex" class="form-input" style="font-family:'JetBrains Mono'; text-transform:uppercase;" value="${window.contrastState.bg}" required />
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:20px; display:flex; justify-content:center; align-items:center; gap:8px;" onclick="swapContrastColors()">
                  <i data-lucide="refresh-cw" class="icon-xs"></i> Tukar Warna (Swap)
                </button>
              </div>

              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="eye" class="icon-sm"></i> Evaluasi WCAG Compliance</h3>
                
                <div class="contrast-ratio-display-large">
                  <div class="contrast-ratio-val" id="contrastRatioVal">21.00:1</div>
                  <div class="contrast-ratio-lbl">Contrast Ratio</div>
                </div>

                <div class="contrast-badge-box">
                  <span class="contrast-badge-name">WCAG AA (Teks Normal)</span>
                  <span class="contrast-status-badge pass" id="badgeAA">Lulus</span>
                </div>
                <div class="contrast-badge-box">
                  <span class="contrast-badge-name">WCAG AAA (Teks Normal)</span>
                  <span class="contrast-status-badge pass" id="badgeAAA">Lulus</span>
                </div>
                <div class="contrast-badge-box">
                  <span class="contrast-badge-name">WCAG AA (Teks Besar)</span>
                  <span class="contrast-status-badge pass" id="badgeAALarge">Lulus</span>
                </div>
                <div class="contrast-badge-box">
                  <span class="contrast-badge-name">WCAG AAA (Teks Besar)</span>
                  <span class="contrast-status-badge pass" id="badgeAAALarge">Lulus</span>
                </div>

                <h4 style="font-size:0.8rem; color:var(--text-secondary); margin:20px 0 8px;">Visual Mockup Text:</h4>
                <div class="contrast-preview-window" id="contrastSampleWindow">
                  <div class="contrast-preview-title">Judul Teks Desain</div>
                  <p class="contrast-preview-body">Ini adalah pratinjau teks biasa berukuran kecil untuk mengecek kenyamanan visual mata saat dibaca.</p>
                </div>
              </div>

            </div>
          </div>

          <!-- TAB 3: RASIO ASPEK -->
          <div class="tool-panel" id="toolPanel-ratio">
            <div class="tool-grid-layout">
              
              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="settings" class="icon-sm"></i> Pengaturan Rasio</h3>
                
                <label class="form-label">Presets Standar</label>
                <div class="aspect-ratio-presets">
                  <button class="aspect-preset-btn active" onclick="setAspectPreset(16, 9)">16:9 (HD/Web)</button>
                  <button class="aspect-preset-btn" onclick="setAspectPreset(9, 16)">9:16 (TikTok)</button>
                  <button class="aspect-preset-btn" onclick="setAspectPreset(1, 1)">1:1 (Insta)</button>
                  <button class="aspect-preset-btn" onclick="setAspectPreset(4, 5)">4:5 (Insta Tall)</button>
                  <button class="aspect-preset-btn" onclick="setAspectPreset(4, 3)">4:3 (Photo)</button>
                  <button class="aspect-preset-btn" onclick="setAspectPreset(21, 9)">21:9 (Cinematic)</button>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Lebar Asli (W)</label>
                    <input type="number" id="aspectOrigW" class="form-input" value="${window.aspectState.w}" oninput="onAspectInput('origW')" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tinggi Asli (H)</label>
                    <input type="number" id="aspectOrigH" class="form-input" value="${window.aspectState.h}" oninput="onAspectInput('origH')" required />
                  </div>
                </div>

                <div class="form-row" style="margin-top:16px; border-top:1px dashed var(--border-light); padding-top:16px;">
                  <div class="form-group">
                    <label class="form-label">Lebar Target (px)</label>
                    <input type="number" id="aspectTargW" class="form-input" value="${window.aspectState.targetW}" oninput="onAspectInput('targW')" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tinggi Target (px)</label>
                    <input type="number" id="aspectTargH" class="form-input" value="${window.aspectState.targetH}" oninput="onAspectInput('targH')" required />
                  </div>
                </div>
              </div>

              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="maximize" class="icon-sm"></i> Hasil Skala & Viewport</h3>
                <div class="contrast-ratio-display-large" style="padding:14px 0; margin-bottom:16px;">
                  <div class="contrast-ratio-val" id="aspectCalculatedRatioLbl" style="font-size:1.8rem;">16:9</div>
                  <div class="contrast-ratio-lbl">Rasio Penyederhanaan</div>
                </div>
                
                <label class="form-label">Pratinjau Geometris:</label>
                <div class="aspect-preview-canvas">
                  <div class="aspect-preview-box" id="aspectRatioPreviewBox">
                    16:9
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- TAB 4: GLASSMORPHISM -->
          <div class="tool-panel" id="toolPanel-glass">
            <div class="tool-grid-layout">
              
              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="settings" class="icon-sm"></i> Pengaturan Efek Kaca</h3>
                
                <div class="form-group" style="margin-bottom:12px;">
                  <label class="form-label">Warna Dasar Glass</label>
                  <input type="color" id="glassColorPicker" class="form-input" style="padding:4px; height:42px; width:45px; cursor:pointer;" value="${window.glassState.color}" oninput="onGlassSliderInput()" />
                </div>

                <div class="tool-slider-group">
                  <div class="tool-slider-header">
                    <span>Opacity (Transparansi)</span>
                    <span class="tool-slider-val" id="glassOpacityVal">${window.glassState.opacity}%</span>
                  </div>
                  <input type="range" id="glassOpacitySlider" class="tool-slider-input" min="0" max="100" value="${window.glassState.opacity}" oninput="onGlassSliderInput()" />
                </div>

                <div class="tool-slider-group">
                  <div class="tool-slider-header">
                    <span>Backdrop Blur (Kekaburan)</span>
                    <span class="tool-slider-val" id="glassBlurVal">${window.glassState.blur}px</span>
                  </div>
                  <input type="range" id="glassBlurSlider" class="tool-slider-input" min="0" max="30" value="${window.glassState.blur}" oninput="onGlassSliderInput()" />
                </div>

                <div class="tool-slider-group">
                  <div class="tool-slider-header">
                    <span>Saturation (Kejenuhan Warna)</span>
                    <span class="tool-slider-val" id="glassSaturationVal">${window.glassState.saturation}%</span>
                  </div>
                  <input type="range" id="glassSaturationSlider" class="tool-slider-input" min="100" max="300" value="${window.glassState.saturation}" oninput="onGlassSliderInput()" />
                </div>

                <div class="tool-slider-group">
                  <div class="tool-slider-header">
                    <span>Border Radius (Kelengkungan)</span>
                    <span class="tool-slider-val" id="glassRadiusVal">${window.glassState.radius}px</span>
                  </div>
                  <input type="range" id="glassRadiusSlider" class="tool-slider-input" min="0" max="50" value="${window.glassState.radius}" oninput="onGlassSliderInput()" />
                </div>

                <div class="tool-slider-group">
                  <div class="tool-slider-header">
                    <span>Border Opacity</span>
                    <span class="tool-slider-val" id="glassBorderOpacityVal">${window.glassState.borderOpacity}%</span>
                  </div>
                  <input type="range" id="glassBorderOpacitySlider" class="tool-slider-input" min="0" max="100" value="${window.glassState.borderOpacity}" oninput="onGlassSliderInput()" />
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:24px;">
                <div class="tool-card">
                  <h3 class="tool-card-title"><i data-lucide="eye" class="icon-sm"></i> Pratinjau Desain Glassmorphism</h3>
                  <div class="glass-backdrop">
                    <div class="glass-bubble glass-bubble-1"></div>
                    <div class="glass-bubble glass-bubble-2"></div>
                    
                    <div class="glass-preview-element" id="glassPreviewElement">
                      <div class="glass-preview-title">Bagas.show</div>
                      <div class="glass-preview-desc">Efek Glassmorphism Premium</div>
                    </div>
                  </div>
                </div>

                <div class="exporter-drawer">
                  <div class="exporter-tabs">
                    <button class="exporter-tab-btn active">CSS Properties</button>
                  </div>
                  <div class="exporter-code-panel">
                    <pre class="exporter-code" id="glassCodeText" style="color:#a5b4fc;"></pre>
                    <button class="btn btn-primary btn-sm exporter-copy-btn" onclick="copyGlassCss()">Salin CSS</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- TAB 5: GOLDEN RATIO -->
          <div class="tool-panel" id="toolPanel-golden">
            <div class="tool-grid-layout">
              
              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="compass" class="icon-sm"></i> Kalkulator Golden Ratio</h3>
                
                <div class="form-group" style="margin-bottom:16px;">
                  <label class="form-label">Mode Perhitungan</label>
                  <select id="goldenModeSelect" class="form-input">
                    <option value="base-larger">Ketahui Nilai A (Lebih Besar) -> Dapatkan B & Total</option>
                    <option value="base-smaller">Ketahui Nilai B (Lebih Kecil) -> Dapatkan A & Total</option>
                    <option value="base-total">Ketahui Nilai Total (Layar/Kolom) -> Dapatkan Pembagian A & B</option>
                  </select>
                </div>

                <div class="form-group" style="margin-bottom:16px;">
                  <label class="form-label" id="goldenInputLabel">Masukkan Nilai Input (px / pt)</label>
                  <input type="number" id="goldenInputVal" class="form-input" value="1000" required />
                </div>

                <div class="golden-results-box" style="margin-top:20px; display:flex; flex-direction:column; gap:12px;">
                  <div class="result-row" style="display:flex; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:12px;">
                    <span style="font-weight:600; color:var(--text-secondary);">Bagian Besar (A)</span>
                    <span id="goldenResLarger" style="font-family:'JetBrains Mono'; font-weight:700; color:var(--primary);">618.03 px</span>
                  </div>
                  <div class="result-row" style="display:flex; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:12px;">
                    <span style="font-weight:600; color:var(--text-secondary);">Bagian Kecil (B)</span>
                    <span id="goldenResSmaller" style="font-family:'JetBrains Mono'; font-weight:700; color:var(--secondary);">381.97 px</span>
                  </div>
                  <div class="result-row" style="display:flex; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:12px;">
                    <span style="font-weight:600; color:var(--text-secondary);">Total Keseluruhan (A + B)</span>
                    <span id="goldenResTotal" style="font-family:'JetBrains Mono'; font-weight:700; color:var(--success);">1000.00 px</span>
                  </div>
                </div>
              </div>

              <div class="tool-card">
                <h3 class="tool-card-title"><i data-lucide="layout" class="icon-sm"></i> Visualisasi & Rekomendasi Grid</h3>
                
                <div class="golden-visual-canvas" style="background:rgba(0, 0, 0, 0.2); border:1px solid var(--border-light); border-radius:16px; padding:20px; display:flex; flex-direction:column; gap:20px; align-items:stretch;">
                  <!-- Spiral box diagram -->
                  <div class="golden-grid-preview" style="display:flex; height:100px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                    <div id="goldenBoxA" style="background:var(--primary); opacity:0.85; display:flex; justify-content:center; align-items:center; color:#000; font-weight:800; font-size:0.95rem; transition:width 0.3s ease;">
                      A (61.8%)
                    </div>
                    <div id="goldenBoxB" style="background:var(--secondary); opacity:0.85; display:flex; justify-content:center; align-items:center; color:#000; font-weight:800; font-size:0.85rem; transition:width 0.3s ease;">
                      B (38.2%)
                    </div>
                  </div>
                  
                  <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
                    <p style="margin-bottom:8px; font-weight:700; color:var(--text-primary);">Rekomendasi Skala Tipografi (Golden Scale):</p>
                    <ul style="padding-left:16px; display:flex; flex-direction:column; gap:6px; list-style-type: disc;">
                      <li>Ukuran Dasar Body: <span id="typoBase" style="font-family:'JetBrains Mono'; font-weight:600; color:var(--primary);">16 px</span></li>
                      <li>Sub-judul (H3): <span id="typoH3" style="font-family:'JetBrains Mono'; font-weight:600; color:var(--secondary);">26 px</span></li>
                      <li>Judul Artikel (H2): <span id="typoH2" style="font-family:'JetBrains Mono'; font-weight:600; color:var(--secondary);">42 px</span></li>
                      <li>Judul Utama (H1): <span id="typoH1" style="font-family:'JetBrains Mono'; font-weight:600; color:var(--success);">68 px</span></li>
                      <li>Hero Banner (Giant): <span id="typoHero" style="font-family:'JetBrains Mono'; font-weight:600; color:var(--success);">110 px</span></li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Bind direct DOM input events
  const pickerFg = document.getElementById('contrastFgColorPicker');
  const pickerBg = document.getElementById('contrastBgColorPicker');
  const hexFg = document.getElementById('contrastFgColorHex');
  const hexBg = document.getElementById('contrastBgColorHex');

  if (pickerFg && pickerBg && hexFg && hexBg) {
    pickerFg.addEventListener('input', (e) => {
      hexFg.value = e.target.value;
      window.contrastState.fg = e.target.value;
      updateContrast();
    });
    pickerBg.addEventListener('input', (e) => {
      hexBg.value = e.target.value;
      window.contrastState.bg = e.target.value;
      updateContrast();
    });
    hexFg.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
        pickerFg.value = val;
        window.contrastState.fg = val;
        updateContrast();
      }
    });
    hexBg.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
        pickerBg.value = val;
        window.contrastState.bg = val;
        updateContrast();
      }
    });
  }

  // Bind Color Harmony input events
  const pickerBase = document.getElementById('harmonyBaseColorPicker');
  const hexBase = document.getElementById('harmonyBaseColorHex');
  const ruleSelect = document.getElementById('harmonyRuleSelect');
  const btnRandom = document.getElementById('harmonyBtnRandomBase');
  
  if (pickerBase && hexBase && ruleSelect && btnRandom) {
    pickerBase.addEventListener('input', (e) => {
      hexBase.value = e.target.value;
      window.paletteState.baseColor = e.target.value;
      updatePalette();
    });
    
    hexBase.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
        pickerBase.value = val;
        window.paletteState.baseColor = val;
        updatePalette();
      }
    });
    
    ruleSelect.addEventListener('change', (e) => {
      window.paletteState.rule = e.target.value;
      updatePalette();
    });
    
    btnRandom.addEventListener('click', () => {
      let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      pickerBase.value = randomColor;
      hexBase.value = randomColor;
      window.paletteState.baseColor = randomColor;
      updatePalette();
    });
  }

  // Bind Golden Ratio input events
  const goldenInput = document.getElementById('goldenInputVal');
  const goldenSelect = document.getElementById('goldenModeSelect');
  if (goldenInput && goldenSelect) {
    goldenInput.addEventListener('input', () => {
      updateGoldenRatio();
    });
    goldenSelect.addEventListener('change', () => {
      updateGoldenRatio();
    });
  }

  // Initialize calculations on first render
  updatePalette();
  updateContrast();
  updateAspectRatio();
  updateGlassmorphism();
  updateGoldenRatio();
}

// ==========================================
// NOTES APPLICATION MODULE
// ==========================================
let notesData = { notes: [], folders: ['Bisnis', 'Kuliah', 'Coding'], stickies: [] };
let currentNotesFolder = 'all';
let currentNotesTag = '';
let selectedNoteId = null;
let activeNotesView = 'editor'; // 'editor' or 'stickies'
let activeDecryptedNoteId = null;
let noteDecryptedContent = {}; // noteId -> password string
let notesSearchQuery = '';
let notesAutoSaveTimeout = null;

// Canvas state
let canvasCtx = null;
let isDrawing = false;
let drawColor = '#000000';
let drawLineWidth = 3;

async function renderNotesApp(container) {
  window.renderNotesApp = renderNotesApp;
  // Fetch notes data from server/local
  notesData = await Store.getNotesData();
  
  // Clean selected note ID if it has been deleted
  if (selectedNoteId && !notesData.notes.some(n => n.id === selectedNoteId)) {
    selectedNoteId = null;
  }
  
  // Set default selection if empty
  if (!selectedNoteId && notesData.notes.length > 0 && activeNotesView === 'editor') {
    const visibleNotes = getFilteredNotes();
    if (visibleNotes.length > 0) {
      selectedNoteId = visibleNotes[0].id;
    }
  }

  container.innerHTML = `
    <div class="container" style="padding-top:100px; padding-bottom:60px;">
      <div class="tools-header-card" style="margin-bottom: 24px;">
        <h2 class="tools-title"><i data-lucide="notebook" class="icon-lg"></i> Ruang Catatan Admin ⬡</h2>
        <p class="tools-desc">Ruang kerja catatan pribadi Anda yang aman. Mendukung Markdown, Sketsa Kanvas, Enkripsi Vault, Papan Catatan Tempel, dan Ringkasan Kecerdasan AI.</p>
      </div>

      <div class="notes-container">
        
        <!-- SIDEBAR (Folders & Tags) -->
        <aside class="notes-sidebar">
          <div class="notes-section-title">
            <span>Folder</span>
            <button class="btn-add-item" onclick="addNewFolder()" title="Tambah Folder"><i data-lucide="plus" style="width:14px; height:14px;"></i></button>
          </div>
          <div class="notes-list-group">
            <button class="notes-item-btn ${currentNotesFolder === 'all' && !currentNotesTag ? 'active' : ''}" onclick="filterNotesFolder('all')">
              <span><i data-lucide="folder-open" class="icon-xs" style="margin-right:6px; vertical-align:middle;"></i> Semua Catatan</span>
              <span class="notes-item-count">${notesData.notes.length}</span>
            </button>
            ${notesData.folders.map(f => {
              const count = notesData.notes.filter(n => n.folder === f).length;
              return `
                <button class="notes-item-btn ${currentNotesFolder === f ? 'active' : ''}" onclick="filterNotesFolder('${f}')">
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><i data-lucide="folder" class="icon-xs" style="margin-right:6px; vertical-align:middle;"></i> ${f}</span>
                  <span class="notes-item-count">${count}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="notes-section-title">
            <span>Tags</span>
          </div>
          <div class="notes-list-group" style="max-height: 120px;">
            ${getAllTags().map(t => {
              const count = notesData.notes.filter(n => (n.tags || []).includes(t)).length;
              return `
                <button class="notes-item-btn ${currentNotesTag === t ? 'active' : ''}" onclick="filterNotesTag('${t}')">
                  <span># ${t}</span>
                  <span class="notes-item-count">${count}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="notes-section-title" style="margin-top: 30px;">
            <span>Workspace</span>
          </div>
          <div class="notes-list-group">
            <button class="notes-item-btn ${activeNotesView === 'editor' ? 'active' : ''}" onclick="switchNotesView('editor')">
              <span><i data-lucide="file-text" class="icon-xs" style="margin-right:6px; vertical-align:middle;"></i> Editor Catatan</span>
            </button>
            <button class="notes-item-btn ${activeNotesView === 'stickies' ? 'active' : ''}" onclick="switchNotesView('stickies')">
              <span><i data-lucide="sticky-note" class="icon-xs" style="margin-right:6px; vertical-align:middle;"></i> Catatan Tempel</span>
              <span class="notes-item-count" style="color:var(--secondary); font-weight:bold;">${notesData.stickies.length}</span>
            </button>
          </div>
        </aside>

        <!-- MIDDLE COLUMN (NOTES LIST) -->
        ${activeNotesView === 'editor' ? `
          <div class="notes-list-col">
            <div class="notes-search-box">
              <div class="notes-search-wrapper">
                <i data-lucide="search" class="notes-search-icon"></i>
                <input type="text" class="notes-search-input" id="notesSearchInput" placeholder="Cari catatan..." value="${notesSearchQuery}" oninput="searchNotes(this.value)" />
              </div>
            </div>
            
            <div style="padding: 12px; border-bottom:1px solid var(--border-light);">
              <button class="btn btn-primary btn-sm" style="width: 100%; display:flex; justify-content:center; align-items:center; gap:6px;" onclick="createNewNote()">
                <i data-lucide="plus-circle" class="icon-xs"></i> Catatan Baru
              </button>
            </div>

            <div class="notes-list-scroll">
              ${getFilteredNotes().map(note => {
                const isActive = note.id === selectedNoteId;
                const isNoteEncrypted = note.isEncrypted;
                const dateText = new Date(note.updatedAt || note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                const excerpt = isNoteEncrypted ? '🔐 Catatan Terkunci Password.' : (note.content || '').replace(/<[^>]*>/g, '').substring(0, 45);
                return `
                  <div class="notes-card ${isActive ? 'active' : ''}" onclick="selectNote('${note.id}')">
                    <div class="notes-card-title">
                      ${isNoteEncrypted ? '<i data-lucide="lock" class="icon-xs" style="color:var(--primary);"></i>' : '<i data-lucide="file" class="icon-xs"></i>'}
                      <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${note.title || 'Catatan Baru'}</span>
                    </div>
                    <p class="notes-card-excerpt">${excerpt || 'Belum ada konten...'}</p>
                    <div class="notes-card-footer">
                      <span>${note.folder || 'Umum'}</span>
                      <span>${dateText}</span>
                    </div>
                  </div>
                `;
              }).join('')}
              ${getFilteredNotes().length === 0 ? `
                <div style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding-top: 40px;">Tidak ada catatan.</div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- RIGHT WORKSPACE COLUMN -->
        <div class="notes-editor-col">
          ${activeNotesView === 'stickies' ? renderStickyBoard() : renderEditorWorkspace()}
        </div>

      </div>
    </div>

    <!-- CANVAS SKETCH MODAL -->
    <div class="canvas-sketch-modal" id="canvasSketchModal">
      <div class="canvas-sketch-card">
        <div class="canvas-sketch-toolbar">
          <div class="canvas-tool-group">
            <h4 style="margin:0; font-weight:700; color:#fff;"><i data-lucide="pencil" class="icon-xs" style="vertical-align:middle; margin-right:4px;"></i> Kanvas Coretan Ide</h4>
          </div>
          <div class="canvas-tool-group">
            <span style="font-size:0.75rem; color:rgba(255,255,255,0.6);">Ketebalan:</span>
            <input type="range" min="1" max="15" value="${drawLineWidth}" id="canvasThickness" oninput="changeCanvasThickness(this.value)" style="width:70px; height:4px; accent-color:var(--primary);" />
            <span id="canvasThicknessLbl" style="font-family:'JetBrains Mono'; font-size:0.75rem; width:22px; text-align:right;">${drawLineWidth}px</span>
          </div>
          <div class="canvas-tool-group">
            <div class="canvas-color-dot ${drawColor === '#000000' ? 'active' : ''}" style="background:#000000;" onclick="changeCanvasColor('#000000', this)"></div>
            <div class="canvas-color-dot ${drawColor === '#ef4444' ? 'active' : ''}" style="background:#ef4444;" onclick="changeCanvasColor('#ef4444', this)"></div>
            <div class="canvas-color-dot ${drawColor === '#10b981' ? 'active' : ''}" style="background:#10b981;" onclick="changeCanvasColor('#10b981', this)"></div>
            <div class="canvas-color-dot ${drawColor === '#3b82f6' ? 'active' : ''}" style="background:#3b82f6;" onclick="changeCanvasColor('#3b82f6', this)"></div>
            <div class="canvas-color-dot ${drawColor === '#f59e0b' ? 'active' : ''}" style="background:#f59e0b;" onclick="changeCanvasColor('#f59e0b', this)"></div>
          </div>
          <div class="canvas-tool-group">
            <button class="btn btn-secondary btn-sm" onclick="clearCanvasSketch()"><i data-lucide="trash-2" class="icon-xs"></i> Hapus</button>
            <button class="btn btn-primary btn-sm" onclick="saveCanvasSketch()"><i data-lucide="check" class="icon-xs"></i> Simpan</button>
            <button class="btn btn-secondary btn-sm" style="background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);" onclick="closeCanvasSketchModal()"><i data-lucide="x" class="icon-xs"></i> Batal</button>
          </div>
        </div>
        <canvas id="sketchpadCanvas" class="sketchpad-element" width="810" height="450"></canvas>
      </div>
    </div>
  `;

  // Bind icons
  lucide.createIcons();

  if (activeNotesView === 'stickies') {
    // Stickies dragging events initialized via inline attributes in HTML template
  } else {
    initNotesEditorBindings();
  }
};

function renderStickyBoard() {
  return `
    <div class="sticky-board-toggle-row">
      <h3 style="font-size:1.1rem; font-weight:700; margin:0; display:flex; align-items:center; gap:8px; color:var(--text-primary);">
        <i data-lucide="sticky-note" class="icon-sm"></i> Papan Catatan Tempel (Sticky Board)
      </h3>
      <button class="btn btn-primary btn-sm" style="display:flex; align-items:center; gap:6px;" onclick="addNewStickyNote()">
        <i data-lucide="plus" class="icon-xs"></i> Tempel Catatan Baru
      </button>
    </div>
    <div class="sticky-board" id="stickyBoard">
      ${notesData.stickies.map(s => `
        <div class="sticky-note sticky-note-${s.color || 'yellow'}" id="sticky-${s.id}" style="left:${s.x || 20}px; top:${s.y || 20}px;" onmousedown="startStickyDrag(event, '${s.id}')" ontouchstart="startStickyDrag(event, '${s.id}')">
          <div class="sticky-note-header">
            <button class="sticky-note-btn" onclick="changeStickyColor('${s.id}')" title="Ubah Warna"><i data-lucide="palette" style="width:12px; height:12px;"></i></button>
            <button class="sticky-note-btn" onclick="deleteStickyNote('${s.id}')" title="Hapus Catatan" style="color:#7f1d1d;"><i data-lucide="trash-2" style="width:12px; height:12px;"></i></button>
          </div>
          <textarea class="sticky-note-textarea" placeholder="Tulis catatan cepat..." oninput="updateStickyNoteText('${s.id}', this.value)">${s.text || ''}</textarea>
        </div>
      `).join('')}
      ${notesData.stickies.length === 0 ? `
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--text-muted); font-size:0.85rem; pointer-events:none;">Papan kosong. Klik tombol di atas untuk menempel catatan baru.</div>
      ` : ''}
    </div>
  `;
}

function renderEditorWorkspace() {
  if (!selectedNoteId) {
    return `
      <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:center; align-items:center; color:var(--text-muted); gap:12px; min-height:400px;">
        <i data-lucide="edit-3" class="icon-lg" style="width:40px; height:40px; opacity:0.5;"></i>
        <span>Silakan buat atau pilih catatan untuk memulai menulis.</span>
      </div>
    `;
  }
  
  const note = notesData.notes.find(n => n.id === selectedNoteId);
  if (!note) return '';

  const isEncrypted = note.isEncrypted;
  const isUnlocked = activeDecryptedNoteId === note.id;
  
  if (isEncrypted && !isUnlocked) {
    return `
      <div class="notes-vault-lock-screen">
        <div class="notes-vault-icon"><i data-lucide="lock" style="width:28px; height:28px;"></i></div>
        <h3 style="font-weight:700; margin:0; color:#fff;">Catatan Terkunci Vault</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem; max-width:300px;">Catatan ini terenkripsi. Silakan masukkan kata sandi Anda untuk membukanya.</p>
        <div style="display:flex; gap:8px; margin-top:10px; max-width:300px; width:100%;">
          <input type="password" id="vaultPasswordInput" class="form-input" placeholder="Masukkan sandi..." style="flex-grow:1;" onkeydown="if(event.key==='Enter') unlockVaultNote('${note.id}')" />
          <button class="btn btn-primary btn-sm" onclick="unlockVaultNote('${note.id}')">Buka</button>
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:16px; background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);" onclick="deleteActiveNote('${note.id}')"><i data-lucide="trash-2" class="icon-xs"></i> Hapus Catatan</button>
      </div>
    `;
  }

  const content = isEncrypted ? Store.decrypt(note.content, noteDecryptedContent[note.id]) : note.content;
  
  return `
    <div class="notes-editor-header">
      <div class="notes-editor-title-row">
        <input type="text" class="notes-editor-title-input" id="notesEditorTitle" value="${note.title || ''}" placeholder="Tanpa Judul" oninput="triggerNotesAutoSaveSoon()" />
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="toggleVaultLock('${note.id}')" title="${isEncrypted ? 'Dekripsi Permanen' : 'Kunci Catatan dengan Sandi'}">
            <i data-lucide="${isEncrypted ? 'unlock' : 'lock'}" class="icon-xs" style="color:${isEncrypted ? 'var(--success)' : 'inherit'};"></i>
          </button>
          <button class="btn btn-secondary btn-sm" style="background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);" onclick="deleteActiveNote('${note.id}')" title="Hapus Catatan">
            <i data-lucide="trash-2" class="icon-xs"></i>
          </button>
        </div>
      </div>
      
      <div class="notes-editor-meta-row">
        <div class="notes-meta-badge">
          <i data-lucide="folder" style="width:12px; height:12px;"></i>
          <select id="notesEditorFolder" onchange="changeNoteFolder(this.value)" style="background:transparent; border:none; color:inherit; font-family:inherit; outline:none; font-size:0.8rem; font-weight:600; cursor:pointer;">
            ${notesData.folders.map(f => `<option value="${f}" ${note.folder === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
        
        <div class="notes-meta-badge">
          <i data-lucide="tag" style="width:12px; height:12px;"></i>
          <input type="text" id="notesEditorTags" value="${(note.tags || []).join(', ')}" placeholder="Tambah tag (koma)..." oninput="triggerNotesAutoSaveSoon()" style="background:transparent; border:none; color:inherit; font-family:inherit; outline:none; font-size:0.8rem; font-weight:600; width:120px;" />
        </div>

        <span style="font-size:0.75rem; color:var(--text-muted); margin-left:auto;">
          Status: <span id="notesAutoSaveIndicator" style="font-weight:bold; color:var(--success);">Siap</span>
        </span>
      </div>
    </div>

    <!-- RICH TEXT EDITOR TOOLBAR -->
    <div class="notes-editor-toolbar">
      <button class="toolbar-btn" onclick="formatText('bold')" title="Tebal (Ctrl+B)"><i data-lucide="bold"></i></button>
      <button class="toolbar-btn" onclick="formatText('italic')" title="Miring (Ctrl+I)"><i data-lucide="italic"></i></button>
      <button class="toolbar-btn" onclick="formatText('underline')" title="Garis Bawah (Ctrl+U)"><i data-lucide="underline"></i></button>
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn" onclick="formatText('formatBlock', '<h2>')" title="Judul H2">H2</button>
      <button class="toolbar-btn" onclick="formatText('formatBlock', '<h3>')" title="Judul H3">H3</button>
      <button class="toolbar-btn" onclick="formatText('formatBlock', '<p>')" title="Paragraf Biasa">P</button>
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn" onclick="formatText('insertUnorderedList')" title="Bullet List"><i data-lucide="list"></i></button>
      <button class="toolbar-btn" onclick="formatText('insertOrderedList')" title="Numbered List"><i data-lucide="list-ordered"></i></button>
      <div class="toolbar-divider"></div>
      <button class="toolbar-btn" onclick="openCanvasSketchModal()" title="Gambar Sketsa Kanvas"><i data-lucide="pencil"></i></button>
      <button class="toolbar-btn" onclick="promptInsertLink()" title="Sematkan Gambar / Link Web"><i data-lucide="link"></i></button>
      <div class="toolbar-divider"></div>
      <button class="btn btn-secondary btn-sm" onclick="runNoteAI('summarize')" style="padding: 4px 8px; font-size:0.72rem; display:flex; align-items:center; gap:4px; font-weight:bold; color:var(--primary);">
        <i data-lucide="sparkles" class="icon-xs"></i> Ringkas AI
      </button>
      <button class="btn btn-secondary btn-sm" onclick="runNoteAI('expand')" style="padding: 4px 8px; font-size:0.72rem; display:flex; align-items:center; gap:4px; font-weight:bold; color:var(--success);">
        <i data-lucide="sparkles" class="icon-xs"></i> Kembangkan Ide
      </button>
    </div>

    <!-- EDITOR BODY WORKSPACE -->
    <div class="notes-editor-body-wrapper">
      <div class="notes-editor-editable" contenteditable="true" id="notesEditorEditable" placeholder="Mulai ketik isi catatan di sini...">${content || ''}</div>
    </div>
  `;
}

function getAllTags() {
  const set = new Set();
  notesData.notes.forEach(note => {
    (note.tags || []).forEach(t => {
      if (t.trim()) set.add(t.trim());
    });
  });
  return Array.from(set);
}

function getFilteredNotes() {
  let list = notesData.notes;
  if (currentNotesFolder !== 'all') {
    list = list.filter(n => n.folder === currentNotesFolder);
  }
  if (currentNotesTag) {
    list = list.filter(n => (n.tags || []).includes(currentNotesTag));
  }
  if (notesSearchQuery) {
    list = list.filter(n => 
      (n.title || '').toLowerCase().includes(notesSearchQuery) || 
      (n.content || '').toLowerCase().includes(notesSearchQuery)
    );
  }
  return list;
}

window.filterNotesFolder = function(folder) {
  currentNotesFolder = folder;
  currentNotesTag = '';
  renderNotesApp(document.getElementById('app-router-view'));
};

window.filterNotesTag = function(tag) {
  currentNotesTag = tag;
  currentNotesFolder = 'all';
  renderNotesApp(document.getElementById('app-router-view'));
};

window.switchNotesView = function(view) {
  activeNotesView = view;
  renderNotesApp(document.getElementById('app-router-view'));
};

window.searchNotes = function(q) {
  notesSearchQuery = q.toLowerCase();
  const filtered = getFilteredNotes();
  if (selectedNoteId && !filtered.some(n => n.id === selectedNoteId)) {
    selectedNoteId = filtered.length > 0 ? filtered[0].id : null;
  }
  renderNotesApp(document.getElementById('app-router-view'));
};

window.createNewNote = async function() {
  const newNote = {
    id: 'note-' + Math.random().toString(36).substr(2, 9),
    title: 'Catatan Baru',
    content: '',
    folder: currentNotesFolder !== 'all' ? currentNotesFolder : 'Bisnis',
    tags: [],
    isEncrypted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    versions: []
  };
  notesData.notes.unshift(newNote);
  selectedNoteId = newNote.id;
  await Store.saveNotesData(notesData);
  renderNotesApp(document.getElementById('app-router-view'));
};

window.selectNote = function(id) {
  if (notesAutoSaveTimeout) {
    clearTimeout(notesAutoSaveTimeout);
    saveNotesChangesImmediately();
  }
  selectedNoteId = id;
  renderNotesApp(document.getElementById('app-router-view'));
};

window.deleteActiveNote = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus catatan ini secara permanen?')) {
    notesData.notes = notesData.notes.filter(n => n.id !== id);
    if (selectedNoteId === id) {
      selectedNoteId = null;
    }
    await Store.saveNotesData(notesData);
    renderNotesApp(document.getElementById('app-router-view'));
  }
};

window.formatText = function(command, value = null) {
  document.execCommand(command, false, value);
  triggerNotesAutoSaveSoon();
};

function triggerNotesAutoSaveSoon() {
  const indicator = document.getElementById('notesAutoSaveIndicator');
  if (indicator) {
    indicator.textContent = 'Mengetik...';
    indicator.style.color = 'var(--secondary)';
  }
  
  if (notesAutoSaveTimeout) clearTimeout(notesAutoSaveTimeout);
  notesAutoSaveTimeout = setTimeout(() => {
    saveNotesChangesImmediately();
  }, 2000);
}

async function saveNotesChangesImmediately() {
  if (!selectedNoteId) return;
  const note = notesData.notes.find(n => n.id === selectedNoteId);
  if (!note) return;
  
  const titleEl = document.getElementById('notesEditorTitle');
  const editableEl = document.getElementById('notesEditorEditable');
  const tagsEl = document.getElementById('notesEditorTags');
  
  if (!titleEl || !editableEl) return;
  
  const titleVal = titleEl.value.trim() || 'Tanpa Judul';
  const rawContent = editableEl.innerHTML;
  const tagsVal = tagsEl ? tagsEl.value.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  let finalContent = rawContent;
  
  if (note.isEncrypted) {
    const pass = noteDecryptedContent[note.id];
    if (pass) {
      finalContent = Store.encrypt(rawContent, pass);
    }
  }
  
  // Save version history (keeps up to 5)
  if (note.content !== finalContent) {
    if (!note.versions) note.versions = [];
    note.versions.unshift({
      content: note.content,
      updatedAt: note.updatedAt || note.createdAt
    });
    if (note.versions.length > 5) note.versions.pop();
  }
  
  note.title = titleVal;
  note.content = finalContent;
  note.tags = tagsVal;
  note.updatedAt = Date.now();
  
  const success = await Store.saveNotesData(notesData);
  
  const indicator = document.getElementById('notesAutoSaveIndicator');
  if (indicator) {
    indicator.textContent = success ? 'Tersimpan (Online)' : 'Tersimpan Lokal';
    indicator.style.color = success ? 'var(--success)' : 'var(--text-muted)';
  }
  
  updateNotesSidebarsAndLists();
}

function updateNotesSidebarsAndLists() {
  // Update card display details in the list
  notesData.notes.forEach(note => {
    const blockTitle = document.querySelector(`.notes-card[onclick="selectNote('${note.id}')"] .notes-card-title span`);
    const blockExcerpt = document.querySelector(`.notes-card[onclick="selectNote('${note.id}')"] .notes-card-excerpt`);
    if (blockTitle) blockTitle.textContent = note.title;
    if (blockExcerpt) {
      blockExcerpt.textContent = note.isEncrypted ? '🔐 Catatan Terkunci Password.' : note.content.replace(/<[^>]*>/g, '').substring(0, 45) || 'Belum ada konten...';
    }
  });
}

window.addNewFolder = async function() {
  const name = prompt('Masukkan nama folder baru:');
  if (name && name.trim()) {
    const trimmed = name.trim();
    if (!notesData.folders.includes(trimmed)) {
      notesData.folders.push(trimmed);
      await Store.saveNotesData(notesData);
      renderNotesApp(document.getElementById('app-router-view'));
    } else {
      showToast('Folder tersebut sudah terdaftar!');
    }
  }
};

window.changeNoteFolder = async function(folder) {
  if (!selectedNoteId) return;
  const note = notesData.notes.find(n => n.id === selectedNoteId);
  if (note) {
    note.folder = folder;
    note.updatedAt = Date.now();
    await Store.saveNotesData(notesData);
    renderNotesApp(document.getElementById('app-router-view'));
  }
};

window.unlockVaultNote = function(id) {
  const note = notesData.notes.find(n => n.id === id);
  if (!note) return;
  const input = document.getElementById('vaultPasswordInput');
  if (!input) return;
  const pass = input.value;
  
  const decrypted = Store.decrypt(note.content, pass);
  if (decrypted !== null) {
    activeDecryptedNoteId = note.id;
    noteDecryptedContent[note.id] = pass;
    renderNotesApp(document.getElementById('app-router-view'));
  } else {
    showToast('Kata sandi salah! Gagal membongkar enkripsi catatan.');
  }
};

window.toggleVaultLock = async function(id) {
  const note = notesData.notes.find(n => n.id === id);
  if (!note) return;
  
  if (note.isEncrypted) {
    if (confirm('Apakah Anda ingin mematikan enkripsi dan membuat catatan ini dibaca publik kembali?')) {
      const pass = noteDecryptedContent[note.id];
      const decrypted = Store.decrypt(note.content, pass);
      if (decrypted !== null) {
        note.isEncrypted = false;
        note.content = decrypted;
        note.updatedAt = Date.now();
        delete noteDecryptedContent[note.id];
        activeDecryptedNoteId = null;
        await Store.saveNotesData(notesData);
        renderNotesApp(document.getElementById('app-router-view'));
        showToast('Enkripsi dinonaktifkan.');
      }
    }
  } else {
    const pass = prompt('Masukkan kata sandi baru untuk mengenkripsi catatan ini:');
    if (pass) {
      const confirmPass = prompt('Konfirmasi kata sandi baru:');
      if (pass === confirmPass) {
        const editableEl = document.getElementById('notesEditorEditable');
        const rawContent = editableEl ? editableEl.innerHTML : note.content;
        const encrypted = Store.encrypt(rawContent, pass);
        
        note.isEncrypted = true;
        note.content = encrypted;
        note.updatedAt = Date.now();
        
        noteDecryptedContent[note.id] = pass;
        activeDecryptedNoteId = note.id;
        
        await Store.saveNotesData(notesData);
        renderNotesApp(document.getElementById('app-router-view'));
        showToast('Catatan berhasil dikunci & dienkripsi di vault.');
      } else {
        showToast('Konfirmasi kata sandi tidak cocok!');
      }
    }
  }
};

window.runNoteAI = async function(action) {
  if (!selectedNoteId) return;
  const editableEl = document.getElementById('notesEditorEditable');
  if (!editableEl) return;
  
  const plainText = editableEl.innerText;
  if (!plainText.trim()) {
    showToast('Tidak ada teks catatan untuk diproses oleh AI.');
    return;
  }
  
  showToast('Kecerdasan AI sedang memproses teks catatan Anda...');
  try {
    const res = await fetch('/api/notes/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text: plainText })
    });
    
    if (res.ok) {
      const data = await res.json();
      const formatted = data.result
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
        .replace(/## (.*?)\n/g, '<h2>$1</h2>')
        .replace(/- (.*?)\n/g, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
      
      editableEl.innerHTML += `<br/><br/><hr/><br/><b>💡 AI Response (${action === 'summarize' ? 'Ringkasan' : 'Pengembangan Ide'}):</b><br/>${formatted}`;
      triggerNotesAutoSaveSoon();
      showToast('AI sukses memproses catatan!');
    } else {
      const errorData = await res.json();
      showToast('Gagal memproses AI: ' + errorData.error);
    }
  } catch (err) {
    showToast('Gagal menghubungi server AI: ' + err.message);
  }
};

// Canvas hand drawing operations
window.openCanvasSketchModal = function() {
  const modal = document.getElementById('canvasSketchModal');
  if (!modal) return;
  modal.classList.add('open');
  
  const canvas = document.getElementById('sketchpadCanvas');
  canvasCtx = canvas.getContext('2d');
  canvasCtx.strokeStyle = drawColor;
  canvasCtx.lineWidth = drawLineWidth;
  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';
  
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', startDrawingTouch);
  canvas.addEventListener('touchmove', drawTouch);
  canvas.addEventListener('touchend', stopDrawing);
};

function startDrawing(e) {
  isDrawing = true;
  canvasCtx.beginPath();
  canvasCtx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  canvasCtx.lineTo(e.offsetX, e.offsetY);
  canvasCtx.stroke();
}

function startDrawingTouch(e) {
  isDrawing = true;
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const touch = e.touches[0];
  canvasCtx.beginPath();
  canvasCtx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function drawTouch(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const touch = e.touches[0];
  canvasCtx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  canvasCtx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

window.changeCanvasColor = function(color, dotEl) {
  drawColor = color;
  if (canvasCtx) canvasCtx.strokeStyle = color;
  document.querySelectorAll('.canvas-color-dot').forEach(el => el.classList.remove('active'));
  dotEl.classList.add('active');
};

window.changeCanvasThickness = function(val) {
  drawLineWidth = val;
  if (canvasCtx) canvasCtx.lineWidth = val;
  document.getElementById('canvasThicknessLbl').textContent = val + 'px';
};

window.clearCanvasSketch = function() {
  const canvas = document.getElementById('sketchpadCanvas');
  if (canvasCtx && canvas) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

window.closeCanvasSketchModal = function() {
  document.getElementById('canvasSketchModal').classList.remove('open');
};

window.saveCanvasSketch = function() {
  const canvas = document.getElementById('sketchpadCanvas');
  if (!canvas) return;
  
  const dataURL = canvas.toDataURL('image/png');
  const editableEl = document.getElementById('notesEditorEditable');
  if (editableEl) {
    editableEl.focus();
    document.execCommand('insertImage', false, dataURL);
    triggerNotesAutoSaveSoon();
    showToast('Sketsa kanvas tersemat ke dalam catatan!');
  }
  closeCanvasSketchModal();
};

window.promptInsertLink = function() {
  const url = prompt('Masukkan URL (gambar, dokumen, atau link web):');
  if (url) {
    let content = '';
    if (url.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
      content = `<img src="${url}" style="max-width:100%; border-radius:12px; margin: 10px 0;" />`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let vidId = '';
      if (url.includes('youtube.com/watch?v=')) vidId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1].split('?')[0];
      content = `<iframe src="https://www.youtube.com/embed/${vidId}" style="width:100%; height:300px; border-radius:12px; border:none; margin:10px 0;"></iframe>`;
    } else {
      content = `<a href="${url}" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">🔗 Tautan Tersemat: ${url}</a>`;
    }
    
    const editableEl = document.getElementById('notesEditorEditable');
    if (editableEl) {
      editableEl.focus();
      document.execCommand('insertHTML', false, content);
      triggerNotesAutoSaveSoon();
    }
  }
};

// Draggable Sticky Notes board operations
window.addNewStickyNote = async function() {
  const colors = ['yellow', 'blue', 'green', 'purple', 'pink'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const newSticky = {
    id: 'sticky-' + Math.random().toString(36).substr(2, 9),
    text: '',
    color: randomColor,
    x: 40 + Math.random() * 150,
    y: 40 + Math.random() * 150
  };
  notesData.stickies.push(newSticky);
  await Store.saveNotesData(notesData);
  renderNotesApp(document.getElementById('app-router-view'));
};

window.changeStickyColor = async function(id) {
  const sticky = notesData.stickies.find(s => s.id === id);
  if (sticky) {
    const colors = ['yellow', 'blue', 'green', 'purple', 'pink'];
    const curIdx = colors.indexOf(sticky.color);
    sticky.color = colors[(curIdx + 1) % colors.length];
    
    const el = document.getElementById(`sticky-${id}`);
    if (el) {
      el.className = `sticky-note sticky-note-${sticky.color}`;
    }
    await Store.saveNotesData(notesData);
  }
};

window.deleteStickyNote = async function(id) {
  notesData.stickies = notesData.stickies.filter(s => s.id !== id);
  await Store.saveNotesData(notesData);
  renderNotesApp(document.getElementById('app-router-view'));
};

window.updateStickyNoteText = function(id, text) {
  const sticky = notesData.stickies.find(s => s.id === id);
  if (sticky) {
    sticky.text = text;
    if (notesAutoSaveTimeout) clearTimeout(notesAutoSaveTimeout);
    notesAutoSaveTimeout = setTimeout(async () => {
      await Store.saveNotesData(notesData);
    }, 1500);
  }
};

// Drag and drop mechanics
let dragNote = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

window.startStickyDrag = function(e, id) {
  if (e.target.tagName === 'TEXTAREA' || e.target.closest('button')) {
    return;
  }
  
  dragNote = document.getElementById(`sticky-${id}`);
  if (!dragNote) return;
  
  document.querySelectorAll('.sticky-note').forEach(el => el.style.zIndex = 10);
  dragNote.style.zIndex = 100;
  
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  
  dragOffsetX = clientX - dragNote.offsetLeft;
  dragOffsetY = clientY - dragNote.offsetTop;
  
  document.addEventListener('mousemove', handleStickyDrag);
  document.addEventListener('mouseup', stopStickyDrag);
  document.addEventListener('touchmove', handleStickyDrag);
  document.addEventListener('touchend', stopStickyDrag);
};

function handleStickyDrag(e) {
  if (!dragNote) return;
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  
  let newX = clientX - dragOffsetX;
  let newY = clientY - dragOffsetY;
  
  const board = document.getElementById('stickyBoard');
  if (board) {
    newX = Math.max(0, Math.min(newX, board.clientWidth - dragNote.clientWidth));
    newY = Math.max(0, Math.min(newY, board.clientHeight - dragNote.clientHeight));
  }
  
  dragNote.style.left = newX + 'px';
  dragNote.style.top = newY + 'px';
}

async function stopStickyDrag() {
  if (!dragNote) return;
  const id = dragNote.id.split('-')[1];
  const sticky = notesData.stickies.find(s => s.id === id);
  if (sticky) {
    sticky.x = parseInt(dragNote.style.left) || 20;
    sticky.y = parseInt(dragNote.style.top) || 20;
    await Store.saveNotesData(notesData);
  }
  dragNote = null;
  document.removeEventListener('mousemove', handleStickyDrag);
  document.removeEventListener('mouseup', stopStickyDrag);
  document.removeEventListener('touchmove', handleStickyDrag);
  document.removeEventListener('touchend', stopStickyDrag);
}

function initNotesEditorBindings() {
  const editor = document.getElementById('notesEditorEditable');
  if (editor) {
    editor.addEventListener('keyup', (e) => {
      // Inline Markdown triple backticks conversion to pre/code blocks
      let text = editor.innerText;
      if (text.includes('```')) {
        const formatted = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        editor.innerHTML = formatted;
        placeCaretAtEnd(editor);
      }
      triggerNotesAutoSaveSoon();
    });
    
    // Tab space alignment helper
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '  ');
      }
    });
  }
}

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// SETUP LISTENERS
window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('footerYear').textContent = new Date().getFullYear();
  initNavScroll();
  initMobileMenu();
  init3dCanvas();
  initCustomCursor();
  init3dTilt();
  handleRouting();
});

// ESCAPE TO CLOSE MODALS
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox(null);
    closeVideoModal(null);
    const projModal = document.getElementById('projectEditModal');
    if (projModal) projModal.classList.remove('open');
    const blogModal = document.getElementById('blogEditModal');
    if (blogModal) blogModal.classList.remove('open');
  }
});
