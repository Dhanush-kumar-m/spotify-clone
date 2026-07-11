/* Spotify Playlist Page Logic */

document.addEventListener('DOMContentLoaded', () => {
  renderPlaylist();
  setupPlaylistEvents();
});

// Render playlist page contents
function renderPlaylist() {
  const banner = document.getElementById('playlistBannerSection');
  const tracksBody = document.getElementById('playlistTracksTableBody');
  const mainPlayBtn = document.getElementById('playlistPlayMainBtn');
  
  if (!banner || !tracksBody) return;

  const playlistId = localStorage.getItem('selectedPlaylistId') || 'tamil-hits';
  const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  const songs = JSON.parse(localStorage.getItem('songsDb')) || [];
  const playerState = JSON.parse(localStorage.getItem('playerState')) || {};

  const currentPlaylist = playlists.find(p => p.id === playlistId) || playlists[0];
  
  // Set main panel gradient background dynamically
  const mainView = document.querySelector('.main-view');
  if (mainView && currentPlaylist.gradient) {
    mainView.style.background = currentPlaylist.gradient;
  }

  // Render Banner details
  banner.innerHTML = `
    <div class="banner-img-wrapper animate-fade-in">
      <img src="${currentPlaylist.artwork}" alt="${currentPlaylist.name}" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'" />
    </div>
    <div class="banner-info">
      <span class="banner-type">PLAYLIST</span>
      <h1 class="banner-title">${currentPlaylist.name}</h1>
      <p style="color:var(--text-muted); font-size:14px; margin-bottom:12px;">${currentPlaylist.desc}</p>
      <div class="banner-meta">
        <span class="banner-meta-author">${currentPlaylist.author}</span>
        <span class="dot-separator"></span>
        <span>${currentPlaylist.followers}</span>
        <span class="dot-separator"></span>
        <span>${currentPlaylist.songs.length} songs</span>
      </div>
    </div>
  `;

  // Render Play button state
  if (mainPlayBtn) {
    const isPlaylistPlaying = playerState.isPlaying && currentPlaylist.songs.includes(playerState.currentSongId);
    mainPlayBtn.innerHTML = isPlaylistPlaying ? getPauseSVG() : getPlaySVG();
  }

  // Render heart status
  updatePlaylistHeaderHeart(currentPlaylist.id);

  // Render Track List rows
  tracksBody.innerHTML = '';
  
  if (currentPlaylist.songs.length === 0) {
    tracksBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">
          No songs in this playlist.
        </td>
      </tr>
    `;
    return;
  }

  currentPlaylist.songs.forEach((songId, index) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const isActive = song.id === playerState.currentSongId ? 'active' : '';
    const rowClass = song.id === playerState.currentSongId ? 'track-row active' : 'track-row';
    const isLiked = isSongLiked(song.id) ? 'active' : '';
    const heartSVG = isSongLiked(song.id) ? getLikedHeartSVG() : getUnlikedHeartSVG();

    const rowHTML = `
      <tr class="${rowClass}" data-id="${song.id}">
        <td class="track-row-num" onclick="playPlaylistRow(${song.id})">
          <span class="track-row-num-val">${index + 1}</span>
          <svg class="track-row-play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </td>
        <td onclick="playPlaylistRow(${song.id})">
          <div class="track-title-col">
            <img class="track-artwork" src="${song.artwork}" alt="${song.album}" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'" />
            <div class="track-name-author">
              <span class="track-name-title">${song.title}</span>
              <span class="track-author-sub">${song.artist}</span>
            </div>
          </div>
        </td>
        <td onclick="playPlaylistRow(${song.id})">${song.album}</td>
        <td>1 day ago</td>
        <td class="track-duration-col">
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
            <button class="playlist-row-heart-btn ${isLiked}" onclick="toggleRowLike(event, ${song.id})">${heartSVG}</button>
            <span>${song.duration}</span>
          </div>
        </td>
      </tr>
    `;
    tracksBody.insertAdjacentHTML('beforeend', rowHTML);
  });
}

// Sync Liked check
function isSongLiked(songId) {
  const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  const liked = playlists.find(p => p.id === 'liked-songs');
  return liked && liked.songs.includes(songId);
}

// Setup events
function setupPlaylistEvents() {
  const mainPlayBtn = document.getElementById('playlistPlayMainBtn');
  if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', () => {
      const playlistId = localStorage.getItem('selectedPlaylistId') || 'tamil-hits';
      const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
      const playlist = playlists.find(p => p.id === playlistId);
      
      if (playlist && playlist.songs.length > 0) {
        let player = JSON.parse(localStorage.getItem('playerState'));
        
        // If current song is in this playlist, just toggle play
        if (playlist.songs.includes(player.currentSongId)) {
          if (typeof togglePlayState === 'function') togglePlayState();
        } else {
          // Play first track of playlist
          if (typeof playSongImmediately === 'function') {
            playSongImmediately(playlist.songs[0], playlist.songs);
          }
        }
      }
    });
  }

  // Click on playlist action row heart
  const headerHeartBtn = document.getElementById('playlistHeaderHeartBtn');
  if (headerHeartBtn) {
    headerHeartBtn.addEventListener('click', () => {
      alert('Playlist added to Your Library!');
      headerHeartBtn.classList.add('active');
    });
  }
}

// Update heart button next to main play button
function updatePlaylistHeaderHeart(playlistId) {
  const headerHeartBtn = document.getElementById('playlistHeaderHeartBtn');
  if (!headerHeartBtn) return;
  
  if (playlistId === 'liked-songs') {
    headerHeartBtn.style.display = 'none'; // No need for like button on Liked playlist itself
  } else {
    headerHeartBtn.style.display = 'block';
  }
}

// Trigger play row song
window.playPlaylistRow = function(songId) {
  const playlistId = localStorage.getItem('selectedPlaylistId') || 'tamil-hits';
  const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  const playlist = playlists.find(p => p.id === playlistId);
  const queue = playlist ? playlist.songs : [songId];

  if (typeof playSongImmediately === 'function') {
    playSongImmediately(songId, queue);
  }
}

// Toggle Row Like
window.toggleRowLike = function(event, songId) {
  event.stopPropagation(); // Avoid playing song on heart click
  if (typeof toggleSongLike === 'function') {
    toggleSongLike(songId);
    
    // Update player and table UI
    renderPlaylist();
    if (typeof updatePlayerHeartState === 'function') {
      updatePlayerHeartState(songId);
    }
  }
}

// SVGs
function getPlaySVG() {
  return `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
}

function getPauseSVG() {
  return `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}

function getUnlikedHeartSVG() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}

function getLikedHeartSVG() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}
