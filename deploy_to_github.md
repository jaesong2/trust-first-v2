# Deploy to GitHub Pages (Trust-First V2)

This project is a static app (`index.html` + CSS + JS), so GitHub Pages deployment is straightforward.

## 1) Push code to GitHub
1. Create a GitHub repo (or use your existing one).
2. Push this project to the `main` branch.

## 2) Enable Pages
1. Open your repo on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (root)
4. Save.

GitHub will provide a URL like:
`https://<your-username>.github.io/<repo-name>/`

## 3) Verify
- Open the Pages URL on desktop and mobile.
- Confirm pantry add/search/match flows work.
- Confirm localStorage persists after refresh.

## 4) Recommended production checks
- Test in Safari (iOS), Chrome (Android/Desktop), and Edge.
- Ensure no console errors.
- Confirm app still works if onboarding is reset in Settings.

## 5) Updating deployment
Every push to `main` triggers a fresh deploy.

---

If you later move to a build-based setup (Vite/React/etc.), update Pages to deploy from the generated build folder.
