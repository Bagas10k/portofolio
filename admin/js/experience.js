document.addEventListener('DOMContentLoaded', () => {
    loadExperiences();

    // Add Form Handler
    const form = document.getElementById('addExperienceForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            organization: document.getElementById('organization').value,
            position: document.getElementById('position').value,
            year_start: document.getElementById('yearStart').value,
            year_end: document.getElementById('yearEnd').value || 'Present',
            description: document.getElementById('description').value
        };

        try {
            const res = await fetch('../api/experiences.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert('Experience added successfully!');
                form.reset();
                loadExperiences();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add experience.');
        }
    });

    // Edit Form Handler
    const editForm = document.getElementById('editExperienceForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                id: document.getElementById('editId').value,
                organization: document.getElementById('editOrganization').value,
                position: document.getElementById('editPosition').value,
                year_start: document.getElementById('editYearStart').value,
                year_end: document.getElementById('editYearEnd').value || 'Present',
                description: document.getElementById('editDescription').value
            };

            try {
                const res = await fetch('../api/experiences.php', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.success) {
                    alert('Experience updated successfully!');
                    closeEditModal();
                    loadExperiences();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to update experience.');
            }
        });
    }
});

async function loadExperiences() {
    const list = document.getElementById('experienceList');
    list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const res = await fetch('../api/experiences.php?t=' + Date.now());
        const json = await res.json();

        if (json.success && json.data.length > 0) {
            list.innerHTML = json.data.map(exp => `
                <tr>
                    <td>${exp.year_start} - ${exp.year_end}</td>
                    <td><strong>${exp.organization}</strong></td>
                    <td>${exp.position}</td>
                    <td style="display:flex; gap:5px;">
                        <button class="action-btn btn-primary" onclick="openEditModal(${exp.id}, '${escapeHtml(exp.organization)}', '${escapeHtml(exp.position)}', '${exp.year_start}', '${exp.year_end}', '${escapeHtml(exp.description || '')}')">Edit</button>
                        <button class="action-btn btn-danger" onclick="deleteExperience('${exp.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            list.innerHTML = '<tr><td colspan="4">No experience history found.</td></tr>';
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, ' ');
}

function openEditModal(id, organization, position, yearStart, yearEnd, description) {
    document.getElementById('editId').value = id;
    document.getElementById('editOrganization').value = organization;
    document.getElementById('editPosition').value = position;
    document.getElementById('editYearStart').value = yearStart;
    document.getElementById('editYearEnd').value = yearEnd;
    document.getElementById('editDescription').value = description;
    
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

async function deleteExperience(id) {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
        const res = await fetch(`../api/experiences.php?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        
        if (json.success) {
            loadExperiences();
        } else {
            alert('Error deleting: ' + json.message);
        }
    } catch (err) {
        alert('Failed to delete.');
    }
}
