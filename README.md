<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/102yVwjh16u42mXnBXSIxap60aIcF9PTt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

### Prerequisites
- GitHub account
- Repository created on GitHub

### Deployment Steps

1. **Install deployment dependencies:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update configuration:**
   - In `package.json`, update the `homepage` field with your GitHub username and repository name:
     ```json
     "homepage": "https://yourusername.github.io/equiptrack---device-management"
     ```
   - The `base` path in `vite.config.ts` should match your repository name (already configured)

3. **Deploy using one of the following methods:**

   **Method 1: Manual Deployment (using gh-pages)**
   ```bash
   npm run deploy
   ```
   Then configure GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Select `gh-pages` branch as source
   - Save

   **Method 2: Automatic Deployment (using GitHub Actions)**
   - Push your code to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Configure Pages in Settings → Pages:
     - Select "GitHub Actions" as source
     - Save

4. **Access your deployed app:**
   ```
   https://yourusername.github.io/equiptrack---device-management/
   ```

### Notes
- Replace `yourusername` with your actual GitHub username
- The repository name in `homepage` and `base` must match exactly
- Deployment may take a few minutes to become available
- All data is stored locally in the browser using localStorage

## Data Backup and Restore

### Export Data (Backup)

To backup your device data:

1. Click the **"导出"** (Export) button in the header
2. A JSON file will be downloaded automatically
3. The file name includes a timestamp: `equiptrack-backup-YYYY-MM-DD-HHmmss.json`
4. Save this file in a safe location

**Export file format:**
- Contains all devices and history records
- Includes metadata (version, export date)
- JSON format for easy reading and editing

### Import Data (Restore)

To restore data from a backup:

1. Click the **"导入"** (Import) button in the header
2. Select a previously exported JSON file
3. Review the import preview (device count, history count, export date)
4. Confirm the import (this will replace all current data)
5. Data will be restored and the page will refresh

**Important Notes:**
- ⚠️ **Importing will replace all current data** - make sure to export your current data first if needed
- Only valid JSON files exported from this app can be imported
- The import process validates data format before applying
- If validation fails, you'll see a detailed error message

### Best Practices

1. **Regular Backups**: Export your data regularly to prevent data loss
2. **Safe Storage**: Keep backup files in multiple locations (cloud storage, external drive)
3. **Before Major Changes**: Always export before making significant changes
4. **File Naming**: Keep the original timestamp in the filename to track backup dates

### Data Format

The exported JSON file structure:
```json
{
  "version": "1.0",
  "exportDate": "2024-12-03T12:00:00.000Z",
  "data": {
    "devices": [...],
    "history": [...]
  }
}
```
