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
