const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const uploadText = document.getElementById('uploadText');
const form = document.getElementById('uploadForm');
const submitBtn = document.getElementById('submitBtn');

// Handle click to upload
dropZone.addEventListener('click', () => imageInput.click());

// Handle file selection
imageInput.addEventListener('change', handleFileSelect);

// Drag & Drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#00f2ff';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(255,255,255,0.1)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(255,255,255,0.1)';
    
    if (e.dataTransfer.files.length) {
        imageInput.files = e.dataTransfer.files;
        handleFileSelect();
    }
});

function handleFileSelect() {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Handle Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'Uploading...';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
        const res = await fetch('../api/upload.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success) {
            alert('Project uploaded successfully!');
            window.location.href = 'dashboard.html'; // Redirect to list
        } else {
            alert('Upload failed: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error uploading project');
    } finally {
        submitBtn.textContent = 'Post Project';
        submitBtn.disabled = false;
    }
});
