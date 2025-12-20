// Tools Landing Page Script

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Check for saved theme preference or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';

// Apply theme on load
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
} else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    }
});

// Tools Data
const toolsData = [
    {
        name: 'Color Picker',
        icon: '🎨',
        description: 'Advanced color picker dengan HEX, RGB, dan HSL converter',
        status: 'coming-soon',
        link: '#'
    },
    {
        name: 'JSON Formatter',
        icon: '📝',
        description: 'Format dan validate JSON data dengan mudah',
        status: 'coming-soon',
        link: '#'
    },
    {
        name: 'Image Optimizer',
        icon: '🖼️',
        description: 'Compress dan optimize images untuk web',
        status: 'coming-soon',
        link: '#'
    },
    {
        name: 'CSS Generator',
        icon: '✨',
        description: 'Generate CSS untuk shadows, gradients, dan borders',
        status: 'coming-soon',
        link: '#'
    },
    {
        name: 'Lorem Ipsum',
        icon: '📄',
        description: 'Generate placeholder text untuk design mockups',
        status: 'coming-soon',
        link: '#'
    },
    {
        name: 'QR Generator',
        icon: '📱',
        description: 'Create custom QR codes untuk URLs dan text',
        status: 'coming-soon',
        link: '#'
    }
];

// Render Tools Grid
function renderTools() {
    const toolsGrid = document.getElementById('toolsGrid');
    
    if (!toolsGrid) return;
    
    toolsGrid.innerHTML = '';
    
    toolsData.forEach((tool, index) => {
        const toolCard = document.createElement('div');
        toolCard.className = 'tool-card animate-on-scroll';
        toolCard.style.transitionDelay = `${index * 0.1}s`;
        
        const isAvailable = tool.status === 'available';
        const statusClass = tool.status === 'available' ? 'status-available' : 'status-coming-soon';
        const statusText = tool.status === 'available' ? 'Available' : 'Coming Soon';
        
        toolCard.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
                <span class="tool-status ${statusClass}">${statusText}</span>
            </div>
            ${isAvailable 
                ? `<a href="${tool.link}" class="tool-cta">OPEN TOOL</a>`
                : `<button class="tool-cta" disabled>COMING SOON</button>`
            }
        `;
        
        toolsGrid.appendChild(toolCard);
    });
}

// Scroll Animation Observer
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
    setupScrollAnimations();
});

// Add parallax effect to hero section (optional enhancement)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContainer = document.querySelector('.tools-hero-container');
    
    if (heroContainer && scrolled < window.innerHeight) {
        heroContainer.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContainer.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});
