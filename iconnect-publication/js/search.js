/* ==========================================================================
   iCONNECT PUBLICATION — CLIENT-SIDE SEARCH ENGINE (js/search.js)
   Real-time search filtering title, category, author, excerpt, and content
   ========================================================================== */

(function (window) {
  'use strict';

  window.initSearchEngine = function () {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.search-results-wrapper');

    window.openSearchModal = function () {
      if (searchModal) {
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      }
    };

    window.closeSearchModal = function () {
      if (searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    };

    if (searchInput && resultsContainer) {
      searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim().toLowerCase();

        if (!query) {
          resultsContainer.innerHTML = `
            <p style="color:var(--text-muted); font-size:0.9rem; text-align:center;">Type above to instantly search publication stories...</p>
          `;
          return;
        }

        const articles = window.iConnectArticles || [];
        const matches = articles.filter(a => {
          return (
            (a.title && a.title.toLowerCase().includes(query)) ||
            (a.category && a.category.toLowerCase().includes(query)) ||
            (a.author && a.author.toLowerCase().includes(query)) ||
            (a.excerpt && a.excerpt.toLowerCase().includes(query)) ||
            (a.content && a.content.toLowerCase().includes(query))
          );
        });

        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div style="text-align:center; padding: 2rem 0;">
              <h4 style="color:#fff; font-family:var(--font-heading); margin-bottom:0.5rem;">No Results Found</h4>
              <p style="color:var(--text-muted); font-size:0.875rem;">No stories found matching "${query}".</p>
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = matches
          .map(
            m => `
            <div class="article-card" style="margin-bottom:1rem; flex-direction:row; height: auto;" onclick="closeSearchModal(); navigateToArticle('${m.id}')">
              <div style="width:120px; height:100px; flex-shrink:0; overflow:hidden;">
                <img src="${m.featuredImage || m.image}" alt="${m.title}" style="width:100%; height:100%; object-fit:cover;" />
              </div>
              <div style="padding:1rem;">
                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cheddar-yellow); text-transform:uppercase;">${m.category}</span>
                <h4 style="font-family:var(--font-heading); color:#fff; font-size:1.05rem; font-weight:700; margin:0.2rem 0;">${m.title}</h4>
                <span style="font-size:0.8rem; color:var(--text-subtle);">${m.author} &bull; ${m.date}</span>
              </div>
            </div>
          `
          )
          .join('');
      });
    }

    // Esc Key listener
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        window.closeSearchModal();
        if (window.closeArticleReaderModal) window.closeArticleReaderModal();
        if (window.closeLightbox) window.closeLightbox();
      }
    });
  };

})(window);
