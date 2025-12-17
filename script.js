document.addEventListener('DOMContentLoaded', () => {
    // Load Dynamic Projects
    // Load Dynamic Content
    loadProfile();
    loadSkills();
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

async function loadProfile() {
    try {
        const res = await fetch('api/profile.php');
        const json = await res.json();
        if (json.success && json.data) {
            const p = json.data;
            document.title = `${p.name} | ${p.role}`;
            
            // Hero
            if(document.getElementById('heroName')) {
                document.getElementById('heroName').textContent = p.name;
                document.getElementById('heroName').setAttribute('data-text', p.name);
            }
            if(document.getElementById('heroRole')) document.getElementById('heroRole').innerHTML = p.role;
            if(document.getElementById('heroTagline')) document.getElementById('heroTagline').textContent = p.tagline;

            // About
            if(document.getElementById('aboutText')) document.getElementById('aboutText').innerHTML = `<p>${p.about_text.replace(/\n/g, '<br>')}</p>`;
            if(document.getElementById('statExp')) document.getElementById('statExp').textContent = p.years_exp;
            if(document.getElementById('statProjects')) document.getElementById('statProjects').textContent = p.projects_count;

            // Contact
            if(document.getElementById('contactEmail')) {
                const mailLink = document.getElementById('contactEmail');
                mailLink.textContent = p.email;
                mailLink.href = 'mailto:' + p.email;
            }

            // Socials
            if(document.getElementById('contactSocials') && p.socials) {
                const socialsContainer = document.getElementById('contactSocials');
                socialsContainer.innerHTML = '';
                
                Object.entries(p.socials).forEach(([key, url]) => {
                    if(url && url !== '#') {
                        const a = document.createElement('a');
                        a.href = url;
                        a.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                        socialsContainer.appendChild(a);
                    }
                });
            }
        }
    } catch (e) {
        console.error('Error loading profile:', e);
    }
}

async function loadSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    try {
        const res = await fetch('api/skills.php');
        const json = await res.json();
        
        if (json.success) {
            const skills = json.data;
            if (skills.length === 0) {
                container.innerHTML = '<div style="color:var(--text-secondary)">No skills added yet.</div>';
                return;
            }

            // Group by Category
            const categories = {};
            skills.forEach(s => {
                if (!categories[s.category]) categories[s.category] = [];
                categories[s.category].push(s);
            });

            container.innerHTML = '';
            
            for (const [catName, catSkills] of Object.entries(categories)) {
                const catDiv = document.createElement('div');
                catDiv.className = 'skill-category';
                
                let skillsHtml = '';
                catSkills.forEach(s => {
                    skillsHtml += `
                        <div class="skill-card">
                            <span class="icon">${s.icon}</span>
                            <span>${s.name}</span>
                        </div>
                    `;
                });

                catDiv.innerHTML = `
                    <h3>${catName}</h3>
                    <div class="skill-list">${skillsHtml}</div>
                `;
                container.appendChild(catDiv);
            }
        }
    } catch(e) {
        console.error(e);
        container.innerHTML = 'Error loading skills.';
    }
}
