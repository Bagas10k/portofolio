document.addEventListener('DOMContentLoaded', () => {
    // Load Dynamic Projects
    // Load Dynamic Content
    loadProfile();
    loadSkills();
    if(typeof loadEducation === 'function') loadEducation(); 
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
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
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

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    function updateIcons(isLight) {
        console.log('Updating icons, isLight:', isLight);
        if(isLight) {
            if(sunIcon) sunIcon.style.display = 'none';
            if(moonIcon) moonIcon.style.display = 'block';
        } else {
            if(sunIcon) sunIcon.style.display = 'block';
            if(moonIcon) moonIcon.style.display = 'none';
        }
    }
    
    // Check local storage on page load
    const currentTheme = localStorage.getItem('theme');
    console.log('Current theme from localStorage:', currentTheme);
    
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        updateIcons(true);
    } else {
        body.classList.remove('light-mode');
        updateIcons(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLightMode = body.classList.contains('light-mode');
            
            console.log('Theme toggled! Light mode:', isLightMode);
            
            if (isLightMode) {
                localStorage.setItem('theme', 'light');
                updateIcons(true);
            } else {
                localStorage.setItem('theme', 'dark');
                updateIcons(false);
            }
        });
    } else {
        console.error('Theme toggle button not found!');
    }


    // Initialize Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    // Contact Form Handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Sending...';

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                const res = await fetch('api/messages.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                const json = await res.json();
                
                if (json.success) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    alert('Failed to send: ' + json.message);
                }
            } catch (err) {
                console.error(err);
                alert('Error sending message.');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});

async function loadProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    try {
        const res = await fetch('api/get_projects.php?t=' + new Date().getTime());
        const text = await res.text();
        console.log('Homepage Projects Raw:', text);
        
        let projects;
        try {
            projects = JSON.parse(text);
        } catch (e) {
            console.error('Homepage JSON Error:', text);
            return;
        }

        if (projects.length > 0) {
            grid.innerHTML = '';
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card animate-on-scroll';
                card.innerHTML = `
                    <div class="project-image">
                        <img src="${p.image}" alt="${p.title}">
                    </div>
                    <div class="project-content">
                        <div class="project-tags">
                            ${(p.tags || []).map(t => `<span>${t}</span>`).join('')}
                        </div>
                        <h3 class="project-title">${p.title}</h3>
                        <p class="project-desc">${p.description}</p>
                        <a href="${p.link}" class="project-link" target="_blank">View Project <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No projects found. Add one in the dashboard!</p>';
        }

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
        const res = await fetch('api/profile.php?t=' + new Date().getTime());
        const json = await res.json();
        if (json.success && json.data) {
            const p = json.data;
            document.title = `${p.name} | ${p.role}`;
            
            
            // Avatar - show if exists in database
            const avatarImages = document.querySelectorAll('.avatar-image');
            const avatarContainers = document.querySelectorAll('.image-frame, .image-frame-poster, #heroAvatarContainer');
            
            if(p.avatar) {
                const timestampedSrc = p.avatar + '?t=' + new Date().getTime();
                
                avatarImages.forEach(img => {
                    img.src = timestampedSrc;
                });

                avatarContainers.forEach(container => {
                     container.style.display = 'block';
                });
            } else {
                // Hide containers if no avatar
                avatarContainers.forEach(container => {
                     container.style.display = 'none';
                });
            }
            
            // Hero
            if(document.getElementById('heroName')) {
                document.getElementById('heroName').textContent = p.name;
                document.getElementById('heroName').setAttribute('data-text', p.name);
            }
            if(document.getElementById('heroRole')) document.getElementById('heroRole').innerHTML = p.role;
            if(document.getElementById('heroTagline')) document.getElementById('heroTagline').textContent = p.tagline;

            // About
            if(document.getElementById('aboutText') && p.about_text) {
                document.getElementById('aboutText').innerHTML = `<p>${p.about_text.replace(/\n/g, '<br>')}</p>`;
            } else if (document.getElementById('aboutText')) {
                document.getElementById('aboutText').innerHTML = '<p>No bio available.</p>';
            }

            if(document.getElementById('statExp')) document.getElementById('statExp').textContent = p.years_exp || '0';
            if(document.getElementById('statProjects')) document.getElementById('statProjects').textContent = p.projects_count || '0';

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
        // Optional: display error on screen for easier debugging
        // if(document.getElementById('aboutText')) document.getElementById('aboutText').innerText = 'Error loading profile: ' + e.message;
    }
}

async function loadSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    try {
        const res = await fetch('api/skills.php?t=' + new Date().getTime());
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

async function loadEducation() {
    const container = document.getElementById('educationTimeline');
    if (!container) return;

    try {
        const res = await fetch('api/education.php?t=' + new Date().getTime());
        const json = await res.json();
        
        if (json.success) {
            const data = json.data;
            if (data.length === 0) {
                container.innerHTML = '<p>No education history available.</p>';
                return;
            }

            container.innerHTML = data.map(edu => `
                <div class="timeline-item animate-on-scroll">
                    <span class="timeline-year">${edu.year}</span>
                    <div class="timeline-content">
                        <h3>${edu.school}</h3>
                        <h4>${edu.degree}</h4>
                        ${edu.description ? `<p>${edu.description}</p>` : ''}
                    </div>
                </div>
            `).join('');
            
            // Re-observe for animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            container.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
        }
    } catch (err) {
        console.error('Error loading education:', err);
        container.innerHTML = '<p>Error loading education history.</p>';
    }
}
