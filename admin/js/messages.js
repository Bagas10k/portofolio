document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

async function loadMessages() {
    const list = document.getElementById('messagesList');
    list.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    try {
        const res = await fetch('../api/messages.php');
        const json = await res.json();
        
        list.innerHTML = '';
        if (json.data.length === 0) {
            list.innerHTML = '<tr><td colspan="4">No messages found.</td></tr>';
            return;
        }
        
        json.data.forEach(msg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${msg.date || '-'}</td>
                <td>
                    <div style="font-weight: 500; color: #fff">${msg.name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary)">${msg.email}</div>
                </td>
                <td>${msg.message}</td>
                <td>
                    <a href="mailto:${msg.email}" class="action-btn" style="background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; margin-right: 5px;">Reply</a>
                    <button class="action-btn btn-danger" onclick="deleteMessage('${msg.id}')">Delete</button>
                </td>
            `;
            list.appendChild(tr);
        });
        
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="4">Error loading messages.</td></tr>';
    }
}

async function deleteMessage(id) {
    if(!confirm('Delete this message?')) return;

    try {
        const res = await fetch(`../api/messages.php?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if(json.success) {
            loadMessages();
        } else {
            alert('Failed to delete: ' + json.message);
        }
    } catch(e) {
        console.error(e);
        alert('Error deleting message');
    }
}
