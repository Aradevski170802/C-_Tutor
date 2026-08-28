# C# Visual Guide

An animated, click-through beginner's guide to C# fundamentals, built as a static site
(no build step, no framework) so it can be hosted for free on GitHub Pages.

Covers:

- **Arrays** — how inserting an element shifts everything after it
- **2D Arrays** — rows/columns, writing into a cell, and inserting into one row
- **Searching** — linear search in a 1D array and a nested-loop search in a 2D array
- **For loops** — a for loop's counter walking an array, plus nested loops over a grid
- **Strings** — indexing, `foreach`, immutability, and common string methods
- **Functions (Methods)** — how a value flows through a call, and the call stack via recursion

Every lesson has **Step** / **Play** / **Reset** controls next to the real C# code, so a
student can go at their own pace and see exactly which line of code causes which change.

## Running it locally

No build tools needed — it's plain HTML/CSS/JS. Just open [`index.html`](index.html)
directly in a browser, or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Publishing on GitHub Pages

1. Create a new (empty) repository on GitHub — call it whatever you like, e.g. `csharp-visual-guide`.
2. From inside this folder, initialize and push it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: C# visual guide"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`,
   folder `/ (root)`.
5. Save. GitHub will give you a URL like `https://<your-username>.github.io/<your-repo>/`
   within a minute or two.

## Folder structure

```
index.html            Home page with links to every lesson
css/style.css          Shared design system (light + dark mode)
js/main.js              Nav + theme toggle, shared on every page
js/viz-core.js          Shared animation helpers (array rendering, code highlighting, step player)
js/pages/*.js           One script per lesson, driving that lesson's animation
pages/*.html            One page per lesson
```

To add a new lesson: copy an existing page in `pages/`, add a script in `js/pages/`,
and link it from the nav in every page (and from `index.html`'s lesson grid).
