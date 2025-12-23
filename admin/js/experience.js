document.addEventListener('DOMContentLoaded', () => {
    loadExperiences();

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
                    <td>
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
