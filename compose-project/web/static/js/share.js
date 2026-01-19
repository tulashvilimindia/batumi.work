/**
 * Social Share Buttons
 * Lightweight sharing functionality for job postings
 */

const ShareButtons = {
  facebook: (url, title) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      'facebook-share',
      'width=580,height=400'
    );
  },

  telegram: (url, title) => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      'telegram-share',
      'width=580,height=400'
    );
  },

  whatsapp: (url, title) => {
    const text = `${title}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      'whatsapp-share'
    );
  },

  linkedin: (url, title) => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      'linkedin-share',
      'width=580,height=400'
    );
  },

  copyLink: async (url, button) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(window.location.pathname.startsWith('/en') ? 'Link copied!' : 'ლინკი დაკოპირდა!');

      // Visual feedback on button
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '✓';
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('copied');
        }, 2000);
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(window.location.pathname.startsWith('/en') ? 'Link copied!' : 'ლინკი დაკოპირდა!');
    }
  },

  // Native share if available (mobile)
  native: async (url, title, text) => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title, text });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }
};

// Toast notification
function showToast(message) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Initialize share buttons on page load
function initShareButtons() {
  document.querySelectorAll('.share-buttons').forEach(container => {
    const url = container.dataset.url || window.location.href;
    const title = container.dataset.title || document.title;

    // Facebook
    const fbBtn = container.querySelector('.share-fb');
    if (fbBtn) {
      fbBtn.addEventListener('click', () => ShareButtons.facebook(url, title));
    }

    // Telegram
    const tgBtn = container.querySelector('.share-tg');
    if (tgBtn) {
      tgBtn.addEventListener('click', () => ShareButtons.telegram(url, title));
    }

    // WhatsApp
    const waBtn = container.querySelector('.share-wa');
    if (waBtn) {
      waBtn.addEventListener('click', () => ShareButtons.whatsapp(url, title));
    }

    // LinkedIn
    const liBtn = container.querySelector('.share-li');
    if (liBtn) {
      liBtn.addEventListener('click', () => ShareButtons.linkedin(url, title));
    }

    // Copy link
    const copyBtn = container.querySelector('.share-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => ShareButtons.copyLink(url, copyBtn));
    }

    // Native share (mobile)
    const nativeBtn = container.querySelector('.share-native');
    if (nativeBtn) {
      if (navigator.share) {
        nativeBtn.addEventListener('click', () => ShareButtons.native(url, title, ''));
      } else {
        nativeBtn.style.display = 'none';
      }
    }
  });
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShareButtons);
} else {
  initShareButtons();
}

// Export for manual use
window.ShareButtons = ShareButtons;
window.showToast = showToast;
