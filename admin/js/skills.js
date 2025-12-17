document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    
    document.getElementById('addSkillForm').addEventListener('submit', addSkill);
});

async function loadSkills() {
    const list = document.getElementById('skillsList');
    list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    try {
        const res = await fetch('../api/skills.php');
        const json = await res.json();
        
        list.innerHTML = '';
        if (json.data.length === 0) {
            list.innerHTML = '<tr><td colspan="4">No skills found.</td></tr>';
            return;
        }
        
        json.data.forEach(skill => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${skill.category}</td>
                <td>${skill.name}</td>
                <td><span style="background:rgba(255,255,255,0.1); padding: 2px 8px; border-radius:4px">${skill.icon}</span></td>
                <td>
                    <button class="action-btn btn-danger" onclick="deleteSkill('${skill.id}')">Delete</button>
                </td>
            `;
            list.appendChild(tr);
        });
        
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="4">Error loading skills.</td></tr>';
    }
}

async function addSkill(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Adding...';
    btn.disabled = true;
    
    const data = {
        name: form.name.value,
        category: form.category.value,
        icon: form.icon.value
    };
    
    try {
        const res = await fetch('../api/skills.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const json = await res.json();
        
        if (json.success) {
            form.reset();
            loadSkills();
        } else {
            alert('Error: ' + json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error adding skill');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function deleteSkill(id) {
    if (!confirm('Start removing this skill?')) return;
    
    try {
        const res = await fetch(`../api/skills.php?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if(json.success) loadSkills();
        else alert(json.message);
    } catch (e) {
        alert('Error deleting skill');
    }
}
