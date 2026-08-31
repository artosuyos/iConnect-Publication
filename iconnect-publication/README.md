# iConnect Publication — Editorial & Publishing Guide

**The Official Student Publication of the BSCS Department**  
**Capiz State University – Mambusao Satellite College**  
*"Be the voice. Be the connection. Be the next link."*

---

## Overview

Welcome to the **iConnect Publication** website! This platform operates as a **100% static, standalone digital publication**.

- **No Databases**
- **No User Accounts or Complex Server CMS**
- **No Build Commands or Dev Servers Required**

As the sole publisher and administrator, your entire publishing workflow consists of modifying a single JavaScript file: [`js/articles.js`](file:///C:/Users/User/.gemini/antigravity/scratch/iconnect-publication/js/articles.js).

---

## Quick Publishing Workflow

When you want to publish a new story:

```text
1. Write Article ➔ 2. Save Image ➔ 3. Add to articles.js ➔ 4. Deploy to Vercel/Netlify
```

---

## Step-by-Step: How to Add a New Article

### Step 1: Add the Cover Image
1. Place your article cover image inside the folder:
   `assets/images/articles/`
2. Name your image clearly using lower-case letters and hyphens (e.g., `ai-summit-2026.jpg`).

### Step 2: Open `js/articles.js`
Open the file [`js/articles.js`](file:///C:/Users/User/.gemini/antigravity/scratch/iconnect-publication/js/articles.js) in your text editor (such as VS Code, Notepad++, or Antigravity).

### Step 3: Copy the Article Template
At the very top of `js/articles.js`, copy the **ARTICLE TEMPLATE** box:

```javascript
{
  id: "my-new-article-id",
  title: "Write Your Headline Here",
  category: "Technology", 
  featured: false,
  author: "Your Full Name",
  role: "Staff Reporter",
  date: "August 10, 2026",
  readTime: "5 min read",
  image: "./assets/images/articles/my-image.jpg",
  excerpt: "Write a short 2-sentence summary of your article here...",
  content: `
    <p>Write your first paragraph here.</p>
    
    <h2>First Subheading</h2>
    <p>Write more details here...</p>
    
    <blockquote>
      "Highlight an important statement or quote here."
    </blockquote>
    
    <ul>
      <li>First key point</li>
      <li>Second key point</li>
    </ul>
    
    <p>Closing paragraph...</p>
  `
},
```

### Step 4: Paste into `articlesData`
Paste your copied template right at the top of the `articlesData` array (just after `const articlesData = [`).

### Step 5: Fill in Your Article Details
- **`id`**: Create a unique slug (e.g., `"robotics-cup-2026"`).
- **`title`**: Write your main article headline.
- **`category`**: Choose ONE of the existing categories:
  - `"News"`
  - `"Features"`
  - `"Opinion"`
  - `"Technology"`
  - `"Campus"`
  - `"Creatives"`
- **`featured`**: Set `true` if you want this article to be the large hero story on the homepage. (Set `false` for normal articles).
- **`author`**: Writer's full name.
- **`role`**: Staff title (e.g., `"News Editor"`, `"BSCS Student"`).
- **`date`**: Publication date string (e.g., `"August 10, 2026"`).
- **`readTime`**: Reading time estimate (e.g., `"4 min read"`).
- **`image`**: Relative path to your image (e.g., `"./assets/images/articles/my-image.jpg"`).
- **`excerpt`**: 2-sentence summary for card previews and search results.
- **`content`**: Full story text formatted using simple HTML tags inside backticks (`` `...` ``).

### Step 6: Save & Preview
Save `js/articles.js` and open `index.html` in your web browser. Your new article will automatically appear on the Homepage, Category filter tab, Search index, and Full Reader View!

---

## How to Edit an Existing Article

1. Open `js/articles.js`.
2. Press `Ctrl + F` (or `Cmd + F`) and search for the article title or `id`.
3. Modify the text, dates, excerpts, or images as desired.
4. Save the file.

---

## How to Remove an Article

1. Open `js/articles.js`.
2. Locate the article block you want to delete.
3. Highlight the entire article object from `{` to `},` and delete it.
4. Save the file.

---

## Rich Text Formatting Cheatsheet

Inside the `content` field, you can write rich formatting using standard HTML:

### Paragraphs
```html
<p>This is a standard paragraph of article body text.</p>
```

### Subheadings
```html
<h2>Key Research Findings</h2>
```

### Block Quotes
```html
<blockquote>
  "Technology is best when it brings people together."
</blockquote>
```

### Bullet Lists
```html
<ul>
  <li>First important point</li>
  <li>Second important point</li>
</ul>
```

### Web Links
```html
<a href="https://example.com" target="_blank">Click here to visit external site</a>
```

### Inline Images with Captions
```html
<figure style="margin: 2rem 0; text-align: center;">
  <img src="./assets/images/articles/gallery-2.jpg" alt="Description" style="border-radius:12px; max-height:400px; width:100%; object-fit:cover;" />
  <figcaption style="font-size:0.88rem; color:#94a3b8; margin-top:0.5rem; font-style:italic;">Photo taken during the regional hackathon.</figcaption>
</figure>
```

---

## How to Deploy to Vercel

Hosting **iConnect Publication** on **Vercel** is free and takes less than 2 minutes.

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your project to GitHub / GitLab**:
   - Create a repository named `iconnect-publication`.
   - Push your project files to the repository.
2. **Log in to [Vercel](https://vercel.com)**:
   - Click **"Add New..."** ➔ **"Project"**.
   - Select your `iconnect-publication` GitHub repository.
3. **Deploy**:
   - Vercel automatically detects static HTML.
   - Click **"Deploy"**.
   - Your website will be live at `https://iconnect-publication.vercel.app`!

### Method 2: Deploy via Vercel CLI (Command Line)

If you have Node.js / Vercel CLI installed:

1. Open your terminal in the `iconnect-publication` directory.
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the prompts (press Enter for default options).
4. Run `npx vercel --prod` to deploy live to production.

---

## Local Testing

You can open `index.html` directly in any web browser without running a local web server:

```text
Double-click index.html ➔ Opens in Browser ➔ Fully Functional Offline
```

---

## Need Support?

For administrative or technical inquiries regarding the BSCS Student Publication platform, contact the **iConnect Editorial Board** at Capiz State University – Mambusao Satellite College.
