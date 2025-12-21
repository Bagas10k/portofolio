// Change Password Functionality
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('changePasswordForm');
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const strengthBarFill = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');
    const alertBox = document.getElementById('alertBox');

    // Password strength checker
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        const strength = checkPasswordStrength(password);
        
        // Remove all strength classes
        strengthBarFill.className = 'strength-bar-fill';
        
        if (password.length === 0) {
            strengthText.textContent = '';
            return;
        }
        
        if (strength.score < 3) {
            strengthBarFill.classList.add('strength-weak');
            strengthText.textContent = 'Weak password';
            strengthText.style.color = '#ff4d4d';
        } else if (strength.score < 5) {
            strengthBarFill.classList.add('strength-medium');
            strengthText.textContent = 'Medium strength';
            strengthText.style.color = '#ffa500';
        } else {
            strengthBarFill.classList.add('strength-strong');
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#4caf50';
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current_password').value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Client-side validation
        if (newPassword.length < 8) {
            showAlert('New password must be at least 8 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showAlert('New password must be different from current password', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Changing...';

        try {
            const response = await fetch('../api/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                form.reset();
                strengthBarFill.className = 'strength-bar-fill';
                strengthText.textContent = '';
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Change Password';
        }
    });

    // Helper function to check password strength
    function checkPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        
        return { score };
    }

    // Helper function to show alerts
    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type} show`;
        
        // Auto-hide error alerts after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                alertBox.classList.remove('show');
            }, 5000);
        }
    }
});
