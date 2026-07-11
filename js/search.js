/* Spotify Search Logic */

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  setupSearchEvents();
});

// Browse Categories data
const searchCategories = [
  { name: 'Tamil Hits', color: '#115e59', artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150&fit=crop' },
  { name: 'Podcasts', color: '#27856a', artwork: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&h=150&fit=crop' },
  { name: 'New Releases', color: '#1e3a8a', artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop' },
  { name: 'Melody & Romance', color: '#881337', artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop' },
  { name: 'Hip-Hop', color: '#7c2d12', artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop' },
  { name: 'Rock & Rage', color: '#7f1d1d', artwork: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&h=150&fit=crop' },
  { name: 'Live Concerts', color: '#581c87', artwork: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&h=150&fit=crop' },
  { name: 'Focus & Study', color: '#14532d', artwork: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&h=150&fit=crop' }
];

// Render browse categories grid
function renderCategories() {
  const container = document.getElementById('searchCategoriesGrid');
  if (!container) return;

  container.innerHTML = '';
  searchCategories.forEach(cat => {
    const cardHTML = `
      <div class="category-card" style="background-color: ${cat.color};" onclick="openPlaylistDetails('tamil-hits')">
        <h3 class="category-title">${cat.name}</h3>
        <img class="category-img" src="${cat.artwork}" alt="${cat.name}" />
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// Setup search events
function setupSearchEvents() {
  const searchInput = document.getElementById('searchBarInput');
  const resultsContainer = document.getElementById('searchResultsContainer');
  const defaultSections = document.getElementById('searchDefaultSections');

  if (!searchInput || !resultsContainer || !defaultSections) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length === 0) {
      resultsContainer.style.display = 'none';
      defaultSections.style.display = 'block';
      return;
    }

    // Filter songsDb
    const songs = JSON.parse(localStorage.getItem('songsDb')) || [];
    const filtered = songs.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.artist.toLowerCase().includes(query) || 
      s.album.toLowerCase().includes(query)
    );

    defaultSections.style.display = 'none';
    resultsContainer.style.display = 'block';

    renderSearchResults(filtered, resultsContainer);
  });
}

// Render search results table
function renderSearchResults(songs, container) {
  if (songs.length === 0) {
    container.innerHTML = `
      <h3 style="margin-bottom:16px;">No results found for your search</h3>
      <p style="color:var(--text-muted); font-size:14px;">Please make sure your words are spelled correctly or try using other keywords.</p>
    `;
    return;
  }

  // Get active song to highlight row
  const player = JSON.parse(localStorage.getItem('playerState'));
  const currentSongId = player ? player.currentSongId : null;

  let rowsHTML = '';
  songs.forEach((song, idx) => {
    const isActive = song.id === currentSongId ? 'active' : '';
    rowsHTML += `
      <tr class="track-row ${isActive}" onclick="playSearchedSong(${song.id}, [${songs.map(s => s.id).join(',')}])">
        <td class="track-row-num">
          <span class="track-row-num-val">${idx + 1}</span>
          <svg class="track-row-play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </td>
        <td>
          <div class="track-title-col">
            <img class="track-artwork" src="${song.artwork}" alt="${song.album}" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'" />
            <div class="track-name-author">
              <span class="track-name-title">${song.title}</span>
              <span class="track-author-sub">${song.artist}</span>
            </div>
          </div>
        </td>
        <td>${song.album}</td>
        <td class="track-duration-col">${song.duration}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <h3 style="margin-bottom:16px;">Songs</h3>
    <table class="track-table">
      <thead>
        <tr>
          <th style="width:50px;">#</th>
          <th>Title</th>
          <th>Album</th>
          <th style="width:100px;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  `;
}

// Trigger play searched item
window.playSearchedSong = function(songId, queueList) {
  if (typeof playSongImmediately === 'function') {
    playSongImmediately(songId, queueList);
  }
}
