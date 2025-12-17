document.addEventListener('DOMContentLoaded', () => {
    loadEducation();

    const form = document.getElementById('addEducationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            school: document.getElementById('schoolName').value,
            degree: document.getElementById('degree').value,
            year: document.getElementById('year').value,
            description: document.getElementById('description').value
        };

        try {
            const res = await fetch('../api/education.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert('Education added successfully!');
                form.reset();
                loadEducation();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add education.');
        }
    });
});

async function loadEducation() {
    const list = document.getElementById('educationList');
    list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const res = await fetch('../api/education.php?t=' + Date.now());
        const json = await res.json();

        if (json.success && json.data.length > 0) {
            list.innerHTML = json.data.map(edu => `
                <tr>
                    <td>${edu.year}</td>
                    <td><strong>${edu.school}</strong></td>
                    <td>${edu.degree}</td>
                    <td>
                        <button class="action-btn btn-danger" onclick="deleteEducation('${edu.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } else {
            list.innerHTML = '<tr><td colspan="4">No education history found.</td></tr>';
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
        const res = await fetch(`../api/education.php?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        
        if (json.success) {
            loadEducation();
        } else {
            alert('Error deleting: ' + json.message);
        }
    } catch (err) {
        alert('Failed to delete.');
    }
}
