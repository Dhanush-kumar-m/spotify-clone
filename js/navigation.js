/* Spotify Navigation Controls */

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
});

// Configure active page sidebar links and browse back/forward actions
function setupNavigation() {
  const currentPage = window.location.pathname.split('/').pop();
  
  // Sidebar navigation links highlighting
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');
  sidebarLinks.forEach(link => {
    const anchor = link.querySelector('a');
    if (anchor) {
      const pageName = anchor.getAttribute('href');
      if (currentPage === pageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });

  // Mobile navigation links highlighting
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    const pageName = link.getAttribute('href');
    if (currentPage === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Back/Forward arrows
  const backArrow = document.querySelector('.arrow-btn:first-child');
  const forwardArrow = document.querySelector('.arrow-btn:last-child');

  if (backArrow) {
    backArrow.addEventListener('click', () => {
      window.history.back();
    });
  }

  if (forwardArrow) {
    forwardArrow.addEventListener('click', () => {
      window.history.forward();
    });
  }
}
