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
            container.innerHTML = `<div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 20px; opacity: 0.5;">
                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No images yet. Upload some!</p>
            </div>`;
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
            <button class="btn-copy" onclick="copyURL('${url}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 4px;">
                    <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18M8 4C8 2.89543 8.89543 2 10 2H15.1716C15.702 2 16.2107 2.21071 16.5858 2.58579L19.4142 5.41421C19.7893 5.78929 20 6.29799 20 6.82843V16C20 17.1046 19.1046 18 18 18M8 4H6C4.89543 4 4 4.89543 4 6V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Copy
            </button>
            <button class="btn-avatar" onclick="useAsAvatar('${img.filepath}', ${img.id})" style="background: var(--primary); color: var(--bg-primary);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 4px;">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Avatar
            </button>
            <button class="btn-delete" onclick="deleteImage(${img.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
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
