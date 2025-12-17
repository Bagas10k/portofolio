document.addEventListener('DOMContentLoaded', () => {
    // Load Dynamic Projects
    loadProjects();

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // Close mobile menu on click

            const targetId = this.getAttribute('href');
            const targetOption = document.querySelector(targetId);
            
            if (targetOption) {
                targetOption.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    // We will add 'fade-in' class to elements in HTML to use this
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
});

async function loadProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    try {
        const res = await fetch('api/get_projects.php');
        const projects = await res.json();

        // Clear placeholder content if we have data
        if (projects.length > 0) grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card animate-on-scroll';
            
            // Build Tags HTML
            const tagsHtml = project.tags.map(tag => `<span>${tag}</span>`).join('');

            card.innerHTML = `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" class="project-thumb">
                    <div class="project-overlay">
                        <a href="${project.link}" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.desc}</p>
                    <div class="project-tags">${tagsHtml}</div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Re-run observer for new elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.project-card').forEach(el => observer.observe(el));

    } catch (err) {
        console.error('Failed to load projects:', err);
    }
}
