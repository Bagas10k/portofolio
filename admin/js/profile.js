document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

async function loadProfile() {
    try {
        const res = await fetch('../api/profile.php');
        const json = await res.json();
        
        if (json.success && json.data) {
            const d = json.data;
            document.forms['profileForm']['name'].value = d.name || '';
            document.forms['profileForm']['role'].value = d.role || '';
            document.forms['profileForm']['tagline'].value = d.tagline || '';
            document.forms['profileForm']['about_text'].value = d.about_text || '';
            document.forms['profileForm']['years_exp'].value = d.years_exp || '';
            document.forms['profileForm']['projects_count'].value = d.projects_count || '';
            document.forms['profileForm']['email'].value = d.email || '';
            
            if (d.socials) {
                document.forms['profileForm']['linkedin'].value = d.socials.linkedin || '';
                document.forms['profileForm']['github'].value = d.socials.github || '';
                document.forms['profileForm']['dribbble'].value = d.socials.dribbble || '';
            }
        }
    } catch (e) {
        console.error(e);
        alert('Error loading profile data');
    }
}

async function updateProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('saveBtn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const form = e.target;
    const data = {
        name: form.name.value,
        role: form.role.value,
        tagline: form.tagline.value,
        about_text: form.about_text.value,
        years_exp: form.years_exp.value,
        projects_count: form.projects_count.value,
        email: form.email.value,
        linkedin: form.linkedin.value,
        github: form.github.value,
        dribbble: form.dribbble.value
    };

    try {
        const res = await fetch('../api/profile.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const json = await res.json();
        
        if (json.success) {
            alert('Profile updated successfully!');
        } else {
            alert('Update failed: ' + json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error updating profile');
    } finally {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
    }
}
