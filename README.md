
# Photographer portfolio template

A minimal, no-build portfolio for GitHub Pages. Pages: Home (hero + project feed), Works (grid), project pages, Info, Contact.

## Use it
1. Upload the files to a GitHub repository and enable GitHub Pages from the `main` branch (root).
2. Open `manager.html` on the published site and log in with the repository owner, repository name and a fine-grained GitHub token that has Contents read and write access.
3. Edit your profile, contact details, projects and images, then choose **Publish changes**. You can also use **Export backup** and **Import backup** to move or save a configuration.
4. The manager detects the repository default branch automatically and uses `content.js` and `images/` as its internal paths. Repository details and token are entered when you log in; the token is kept only in page memory and cleared on logout or when the page closes.

You can still edit **content.js** directly if you prefer. Put photos in **images/** and use paths like `"images/hero.jpg"`; empty paths show grey placeholder tiles.

## Manager notes
- The manager is a static browser page and publishes through the GitHub REST API. Changes are committed to the configured repository after you confirm publishing.
- The repository must already contain this template and have GitHub Pages enabled.

## Tips
- Export photos at about 2400 px on the long edge, JPG or WebP, under 500 KB each, so the site loads quickly.
- `ratio` sets the cover crop for each project ("3/2" landscape, "4/5" portrait).
- The counter on first load plays once per visit. Delete the preloader block at the bottom of index.html to remove it.
- Dark mode follows the visitor's system setting.
