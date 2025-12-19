document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    setupUpload();
});

function setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Click to browse
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag & drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(files) {
    for (let file of files) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert(`Invalid file type: ${file.name}. Only JPG, PNG, WEBP, and GIF allowed.`);
            continue;
        }

        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
            alert(`File too large: ${file.name}. Maximum size is 10MB.`);
            continue;
        }

        // Upload file
        await uploadImage(file);
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch('../api/gallery.php', {
            method: 'POST',
            body: formData
        });
        const json = await res.json();

        if (json.success) {
            console.log('Upload successful:', json.data);
            loadGallery(); // Reload gallery
        } else {
            alert('Upload failed: ' + json.message);
        }
    } catch (err) {
        console.error('Upload error:', err);
        alert('Error uploading image');
    }
}

async function loadGallery() {
    const container = document.getElementById('galleryContainer');
    container.innerHTML = '<div class="empty-state"><p>Loading...</p></div>';

    try {
        const res = await fetch('../api/gallery.php?t=' + new Date().getTime());
        const json = await res.json();

        if (json.success && json.data.length > 0) {
            const images = json.data;
            
            container.innerHTML = '<div class="gallery-grid"></div>';
            const grid = container.querySelector('.gallery-grid');

            images.forEach(img => {
                const item = createGalleryItem(img);
                grid.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="empty-state"><p>📭 No images yet. Upload some!</p></div>';
        }
    } catch (err) {
        console.error('Error loading gallery:', err);
        container.innerHTML = '<div class="empty-state"><p>Error loading gallery</p></div>';
    }
}

function createGalleryItem(img) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    const filesize = formatFileSize(img.filesize);
    const url = window.location.origin + '/' + img.filepath;
    
    div.innerHTML = `
        <img src="../${img.filepath}" alt="${img.filename}" class="gallery-image">
        <div class="gallery-info">
            <div class="gallery-filename" title="${img.filename}">${img.filename}</div>
            <div class="gallery-size">${filesize}</div>
        </div>
        <div class="gallery-actions">
            <button class="btn-copy" onclick="copyURL('${url}')">📋 Copy</button>
            <button class="btn-avatar" onclick="useAsAvatar('${img.filepath}', ${img.id})" style="background: var(--primary); color: var(--bg-primary);">👤 Avatar</button>
            <button class="btn-delete" onclick="deleteImage(${img.id})">🗑️</button>
        </div>
    `;
    
    return div;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function copyURL(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('URL copied to clipboard!');
    });
}

async function useAsAvatar(filepath, imageId) {
    if (!confirm('Use this image as your profile avatar?')) return;

    try {
        const formData = new FormData();
        formData.append('avatar_from_gallery', filepath);
        // Add other required fields (get from current profile)
        formData.append('name', 'placeholder');  // Will be ignored by server
        formData.append('role', 'placeholder');
        formData.append('tagline', 'placeholder');
        formData.append('about_text', 'placeholder');
        formData.append('email', 'placeholder');

        const res = await fetch('../api/profile.php', {
            method: 'POST',
            body: formData
        });
        const json = await res.json();

        if (json.success) {
            alert('Avatar updated successfully! Go to Profile page to see changes.');
        } else {
            alert('Failed to set avatar: ' + json.message);
        }
    } catch (err) {
        console.error('Error setting avatar:', err);
        alert('Error setting avatar');
    }
}

async function deleteImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
        const res = await fetch(`../api/gallery.php?id=${id}`, {
            method: 'DELETE'
        });
        const json = await res.json();

        if (json.success) {
            loadGallery(); // Reload gallery
        } else {
            alert('Delete failed: ' + json.message);
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting image');
    }
}
