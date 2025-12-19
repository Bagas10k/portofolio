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
                document.forms['profileForm']['instagram'].value = d.socials.instagram || '';
                document.forms['profileForm']['tiktok'].value = d.socials.tiktok || '';
            }
            
            if(d.avatar) {
                document.getElementById('currentAvatarPreview').innerHTML = `
                    <p style="margin: 0 0 5px; color: var(--text-secondary); font-weight: 500;">Current Avatar:</p>
                    <img src="../${d.avatar}" style="width:100px; height:100px; object-fit:cover; border-radius:8px; border:1px solid #333;">
                `;
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
    const formData = new FormData(form);

    try {
        const res = await fetch('../api/profile.php', {
            method: 'POST',
            body: formData
        });
        const json = await res.json();
        
        if (json.success) {
            if (json.warning) {
                alert('Profile updated! Note: ' + json.warning);
            } else {
                alert('Profile updated successfully!');
            }
            // Reload to show new avatar
            window.location.reload();
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
