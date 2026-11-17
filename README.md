# Photographer portfolio template

A minimal, no-build portfolio for GitHub Pages. Pages: Home (hero + project feed), Works (grid), project pages, Info, Contact.

## Use it
1. Edit **content.js**. It is the only file you need to change: name, titles, bio, clients, contact and projects.
2. Put your photos in **images/** and reference them like `"images/hero.jpg"`. Empty paths show grey placeholder tiles.
3. To add a project, copy one block in `projects` and give it a new `id`.
4. Upload everything to a GitHub repo, then Settings → Pages → deploy from the `main` branch (root).

## Tips
- Export photos at about 2400 px on the long edge, JPG or WebP, under 500 KB each, so the site loads quickly.
- `ratio` sets the cover crop for each project ("3/2" landscape, "4/5" portrait).
- The counter on first load plays once per visit. Delete the preloader block at the bottom of index.html to remove it.
- Dark mode follows the visitor's system setting.
