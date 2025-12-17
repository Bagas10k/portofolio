# VPS Deployment Guide

Since you have cloned the repo on your VPS, you need to ensure the **Permissions** are correct so that PHP can write to the JSON files and upload images.

## Quick Fix (Linux/Mac)

1.  Open your terminal/SSH.
2.  Navigate to your project folder.
3.  Run the setup script:
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

## Manual Fix

If you cannot run the script, execute these commands manually inside your project folder:

```bash
# Create folders
mkdir -p data
mkdir -p assets/images/projects

# Allow PHP to write to these folders (777 is easiest for beginners, 755/775 is more secure)
chmod -R 777 data
chmod -R 777 assets/images/projects
```

## Common Issues

1.  **403 Forbidden / 500 Error on Upload**:
    - Usually caused by permissions. Run the `chmod` commands above.
    - Check if `assets/images/projects` exists.

2.  **Changes not saving**:
    - Check if `data/*.json` files are writable (`chmod 666 data/*.json`).

3.  **Nginx/Apache Config**:
    - Ensure your web server points to the root of this folder.
    - Ensure `post_max_size` and `upload_max_filesize` in `php.ini` are large enough (e.g., 10M).
