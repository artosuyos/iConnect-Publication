# iConnect Publication — Publishing Guide

**Official Student Publication of the BSCS Department**  
Capiz State University – Mambusao Satellite College

---

## How to Publish a New Article

All articles live in one file: **`articles/index.js`**

This is a plain JavaScript file — no database, no backend, no login required.  
Open it in VS Code, Notepad++, or any text editor and follow the steps below.

---

### Step 1 — Prepare Your Cover Image

1. Name your image something simple and URL-friendly, e.g. `ai-in-education.jpg`
2. Place it inside:
   ```
   assets/images/articles/
   ```
3. Keep the filename in mind — you'll use it in the next step.

---

### Step 2 — Open `articles/index.js`

Open the file in your text editor. At the very top you will see a clearly labeled `ARTICLE TEMPLATE` comment block.

---

### Step 3 — Copy the Template & Fill It In

The template looks like this:

```js
{
  id: "my-article-slug-id",
  title: "Write Your Article Title Here",
  category: "Technology",  // Options: "News", "Features", "Opinion", "Technology", "Campus", "Creatives"
  featured: false,          // Set to: true if you want it as the main hero story on the homepage
  author: "Art Jayson Osuyos",
  role: "Editor-in-Chief",
  date: "August 10, 2026",
  readTime: "5 min read",
  image: "assets/images/articles/my-photo.jpg",
  excerpt: "Short 2-sentence summary of the story...",
  content: `
    <p>Write your first paragraph here.</p>
    <h2>Section Subheading</h2>
    <p>Continue your story here...</p>
    <blockquote>"Quote callout..."</blockquote>
    <ul>
      <li>Bullet point item</li>
    </ul>
  `
},
```

Copy this block, paste it at the **very top** of the `articlesData = [` array (right after the opening `[`), and fill in your details.

---

### Step 4 — Add Images Inside the Article Body

To embed a photo inside the article content itself, use this HTML inside the `content` field:

```html
<figure style="margin:2rem 0; text-align:center;">
  <img src="assets/images/articles/your-photo.jpg"
       alt="Caption text"
       style="border-radius:12px; max-height:400px; width:100%; object-fit:cover;" />
  <figcaption style="font-size:.88rem; color:#94a3b8; margin-top:.5rem; font-style:italic;">
    Your caption here
  </figcaption>
</figure>
```

---

### Step 5 — Set Featured Story (Optional)

Only one article should have `featured: true` at a time.  
Setting `featured: true` makes it the large hero card at the top of the homepage.  
Set all other articles to `featured: false`.

---

### Step 6 — Preview Locally

Open `index.html` directly in your browser (double-click the file).  
Your new article will appear automatically on:
- The **homepage** (featured or in the grid)
- The **category** filter tabs
- The **search** results
- Its own **article page** at `article.html?id=your-article-slug-id`

---

### Step 7 — Deploy to Vercel

1. Open your terminal in the project folder
2. Run:
   ```bash
   git add .
   git commit -m "Publish: Your Article Title"
   git push
   ```
3. Vercel automatically detects the push and deploys the updated site within ~30 seconds.

---

## How to Edit an Existing Article

1. Open `articles/index.js`
2. Find the article by its `id` or `title`
3. Change whatever you need
4. Save and push to GitHub — Vercel deploys automatically

---

## How to Remove an Article

1. Open `articles/index.js`
2. Find the article block (it starts with `{` and ends with `},`)
3. Delete the entire block including the trailing comma
4. Save and push

---

## File Structure Reference

```
iConnect/
├── index.html             ← Public homepage
├── article.html           ← Individual article view (shared template)
│
├── articles/
│   └── index.js           ← ✏️  YOUR CONTENT FILE — edit here to publish
│
├── assets/
│   └── images/
│       └── articles/      ← 🖼️  Drop all article images here
│
├── css/                   ← Stylesheets
└── js/                    ← Engine scripts (do not edit)
    ├── app.js
    ├── metadata.js
    ├── network.js
    ├── render.js
    └── search.js
```

---

## Content Formatting Tags (HTML cheat-sheet)

| What you want          | What to type                            |
|------------------------|-----------------------------------------|
| Paragraph              | `<p>Text here.</p>`                     |
| Bold text              | `<strong>bold</strong>`                 |
| Italic text            | `<em>italic</em>`                       |
| Section heading        | `<h2>Heading Text</h2>`                 |
| Smaller heading        | `<h3>Sub-heading</h3>`                  |
| Quote / Pull quote     | `<blockquote>"Quote text"</blockquote>` |
| Bullet list            | `<ul><li>Item</li><li>Item</li></ul>`   |
| Numbered list          | `<ol><li>Item</li><li>Item</li></ol>`   |
| Horizontal divider     | `<hr />`                                |
| Link                   | `<a href="https://url.com">Text</a>`    |
