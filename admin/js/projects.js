document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

async function loadProjects() {
    const listContainer = document.getElementById('projectsList');
    listContainer.innerHTML = '<tr><td colspan="4" style="text-align:center">Loading...</td></tr>';

    try {
        // Fetch projects from json (or api if we had a dedicated list api, but reading json is fine for now if publicly accessible or via php wrapper. 
        // We defined 'DATA_FILE' as valid. Let's assume we can fetch data/projects.json directly or via a simple PHP proxy.
        // Direct JSON fetch might cache, better to use a small PHP helper or just timestamp it.
        // Actually, we need to read it. Let's use a small PHP script 'api/get_projects.php' if it exists or create one.
        // Checking directory list... 'get_projects.php' exists!
        const res = await fetch('../api/get_projects.php');
        const data = await res.json();
        
        // Response format checking...
        // get_projects.php usually returns list directly or {data: []}
        const projects = Array.isArray(data) ? data : (data.data || []);

        listContainer.innerHTML = '';
        if (projects.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="4" style="text-align:center">No projects found.</td></tr>';
            return;
        }

        projects.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="../${p.image}" alt="${p.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>${p.title}</td>
                <td style="color: var(--text-secondary);">${p.desc.substring(0, 50)}...</td>
                <td>
                    <button class="action-btn btn-danger" onclick="deleteProject('${p.id}')">Delete</button>
                </td>
            `;
            listContainer.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #ff4d4d">Error loading projects.</td></tr>';
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const res = await fetch('../api/delete_project.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id})
        });
        const data = await res.json();

        if (data.success) {
            loadProjects();
        } else {
            alert('Failed to delete: ' + data.message);
        }
    } catch (err) {
        alert('Error deleting project');
        console.error(err);
    }
}
