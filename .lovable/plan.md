Update the project on GitHub

The GitHub panel in Lovable is not visible to you, so this plan uses a direct route: download the current codebase and push it to your GitHub repository, then let the existing GitHub Pages workflow deploy it.

1. Export the codebase
   - Use the Lovable "Download codebase" option (or the GitHub export link) to get a ZIP of the current source.
   - This captures the latest header-text change, the landing page, and all regenerated data.

2. Push to your existing GitHub repository
   - Unzip the downloaded code and copy the files into your local clone of the GitHub repo.
   - Commit with a message like "Update header text and latest data".
   - Push to the default branch (usually `main` or `master`).

3. Verify the GitHub Pages workflow runs
   - The repo already contains `.github/workflows/deploy-github-pages.yml`.
   - After the push, open the "Actions" tab in GitHub and confirm the workflow runs.
   - The workflow will build the site and deploy it to GitHub Pages.

4. Confirm the live site updated
   - Once the workflow is green, open the GitHub Pages URL (usually `https://<username>.github.io/<repo>` or your custom domain).
   - Check that the hero text reads "Every school in the country, in one place" and "Select your country below".

If you already had a GitHub connection in Lovable but cannot see it, we will also check whether the GitHub integration is still linked and reconnect if needed.
