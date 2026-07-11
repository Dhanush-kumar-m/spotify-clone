/* Spotify Music Player Logic - HTML5 Audio Engine */

let audio = null;

document.addEventListener('DOMContentLoaded', () => {
  initAudioElement();
  initPlayerUI();
  setupPlayerEvents();
});

// Initialize persistent audio element
function initAudioElement() {
  if (!audio) {
    audio = new Audio();
    
    // Get volume state from local storage or default to 0.5
    const state = JSON.parse(localStorage.getItem('playerState')) || {};
    audio.volume = state.volume !== undefined ? state.volume : 0.5;

    // Listen to native audio events
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      updateTimelineProgress(audio.currentTime, audio.duration);
    });

    audio.addEventListener('ended', () => {
      const state = JSON.parse(localStorage.getItem('playerState')) || {};
      if (state.repeat === 'track') {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Audio playback error:', err));
      } else {
        skipTrack(1);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      // Update total duration stamp when metadata loaded
      const durationLabels = document.querySelectorAll('.playback-timeline .time-stamp:last-child');
      durationLabels.forEach(label => {
        label.textContent = formatTime(Math.floor(audio.duration));
      });
    });
  }
}

// Load player state and sync UI controls
function initPlayerUI() {
  const state = JSON.parse(localStorage.getItem('playerState'));
  const songs = JSON.parse(localStorage.getItem('songsDb')) || [];
  
  if (!state || songs.length === 0) return;

  const currentSong = songs.find(s => s.id === state.currentSongId) || songs[0];

  // Update track details in footer
  const artwork = document.getElementById('playerArtwork');
  const title = document.getElementById('playerTrackTitle');
  const artist = document.getElementById('playerTrackArtist');
  
  if (artwork) artwork.src = currentSong.artwork;
  if (title) title.textContent = currentSong.title;
  if (artist) artist.textContent = currentSong.artist;

  // Toggle Heart liked state
  updatePlayerHeartState(currentSong.id);

  // Play/Pause icon toggling
  const playPauseBtns = document.querySelectorAll('.play-pause-toggle-btn');
  playPauseBtns.forEach(btn => {
    btn.innerHTML = state.isPlaying ? getPauseSVG() : getPlaySVG();
  });

  // Shuffle & Repeat states
  const shuffleBtn = document.getElementById('playerShuffleBtn');
  if (shuffleBtn) {
    if (state.shuffle) shuffleBtn.classList.add('active');
    else shuffleBtn.classList.remove('active');
  }

  const repeatBtn = document.getElementById('playerRepeatBtn');
  if (repeatBtn) {
    if (state.repeat === 'track') {
      repeatBtn.classList.add('active');
      repeatBtn.setAttribute('title', 'Repeat Track');
    } else {
      repeatBtn.classList.remove('active');
      repeatBtn.setAttribute('title', 'Repeat Off');
    }
  }

  // Volume slider sync
  const volBar = document.getElementById('volumeTrackFill');
  const volThumb = document.getElementById('volumeThumb');
  if (volBar && volThumb) {
    const percent = state.volume * 100;
    volBar.style.width = `${percent}%`;
    volThumb.style.left = `${percent}%`;
  }

  // Update HTML5 audio element
  if (audio) {
    // Normalise URL matching
    const currentSrc = audio.src ? decodeURIComponent(audio.src) : '';
    const targetSrc = currentSong.url ? decodeURIComponent(currentSong.url) : '';
    
    if (!currentSrc.includes(targetSrc) || audio.src === '') {
      audio.src = currentSong.url;
      audio.load();
    }

    audio.volume = state.volume;

    if (state.isPlaying) {
      // Catch autoplay blocking gracefully
      audio.play().catch(err => {
        console.log('Autoplay blocked or playback interrupted. Waiting for user interaction.');
        state.isPlaying = false;
        localStorage.setItem('playerState', JSON.stringify(state));
        
        playPauseBtns.forEach(btn => {
          btn.innerHTML = getPlaySVG();
        });
        
        const visualizer = document.getElementById('playerVisualizer');
        if (visualizer) visualizer.classList.remove('playing');
        
        // Sync main page controls if active
        syncPagesButtonsState(false);
      });
    } else {
      audio.pause();
    }
  }

  // Visualizer sync
  const visualizer = document.getElementById('playerVisualizer');
  if (visualizer) {
    if (state.isPlaying) {
      visualizer.classList.add('playing');
    } else {
      visualizer.classList.remove('playing');
    }
  }
}

// Update Heart Liked icon status
function updatePlayerHeartState(songId) {
  const heartBtn = document.getElementById('playerHeartBtn');
  if (!heartBtn) return;

  const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  const likedPlaylist = playlists.find(p => p.id === 'liked-songs');

  if (likedPlaylist && likedPlaylist.songs.includes(songId)) {
    heartBtn.classList.add('active');
    heartBtn.innerHTML = getLikedHeartSVG();
  } else {
    heartBtn.classList.remove('active');
    heartBtn.innerHTML = getUnlikedHeartSVG();
  }
}

// Setup Event Listeners
function setupPlayerEvents() {
  // Liking track
  const heartBtn = document.getElementById('playerHeartBtn');
  if (heartBtn) {
    heartBtn.addEventListener('click', () => {
      const state = JSON.parse(localStorage.getItem('playerState'));
      toggleSongLike(state.currentSongId);
      updatePlayerHeartState(state.currentSongId);
      
      // Update playlist table rendering if active
      if (window.location.pathname.includes('playlist.html') && typeof renderPlaylist === 'function') {
        renderPlaylist();
      }
    });
  }

  // Play Pause controls
  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.play-pause-toggle-btn');
    if (playBtn) {
      togglePlayState();
    }
  });

  // Next & Previous track controls
  const nextBtn = document.getElementById('playerNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      skipTrack(1);
    });
  }

  const prevBtn = document.getElementById('playerPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      skipTrack(-1);
    });
  }

  // Shuffle toggle
  const shuffleBtn = document.getElementById('playerShuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      let state = JSON.parse(localStorage.getItem('playerState'));
      state.shuffle = !state.shuffle;
      localStorage.setItem('playerState', JSON.stringify(state));
      
      if (state.shuffle) shuffleBtn.classList.add('active');
      else shuffleBtn.classList.remove('active');
    });
  }

  // Repeat toggle
  const repeatBtn = document.getElementById('playerRepeatBtn');
  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      let state = JSON.parse(localStorage.getItem('playerState'));
      state.repeat = state.repeat === 'none' ? 'track' : 'none';
      localStorage.setItem('playerState', JSON.stringify(state));
      
      if (state.repeat === 'track') {
        repeatBtn.classList.add('active');
      } else {
        repeatBtn.classList.remove('active');
      }
    });
  }

  // Volume Bar scrubbing
  const volumeSlider = document.getElementById('volumeSliderContainer');
  if (volumeSlider) {
    volumeSlider.addEventListener('click', (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      
      let state = JSON.parse(localStorage.getItem('playerState'));
      state.volume = percent;
      localStorage.setItem('playerState', JSON.stringify(state));

      if (audio) audio.volume = percent;

      // Sync display
      const volBar = document.getElementById('volumeTrackFill');
      const volThumb = document.getElementById('volumeThumb');
      if (volBar) volBar.style.width = `${percent * 100}%`;
      if (volThumb) volThumb.style.left = `${percent * 100}%`;
    });
  }

  // Playback Slider scrubbing
  const progressSlider = document.getElementById('progressSliderContainer');
  if (progressSlider) {
    progressSlider.addEventListener('click', (e) => {
      if (!audio || !audio.duration) return;
      const rect = progressSlider.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = percent * audio.duration;
    });
  }
}

// Toggle play states
function togglePlayState() {
  let state = JSON.parse(localStorage.getItem('playerState'));
  state.isPlaying = !state.isPlaying;
  localStorage.setItem('playerState', JSON.stringify(state));

  initPlayerUI();

  // Sync playlists play icons if active
  syncPagesButtonsState(state.isPlaying);
}

function syncPagesButtonsState(isPlaying) {
  if (window.location.pathname.includes('playlist.html') && typeof renderPlaylist === 'function') {
    renderPlaylist();
  }
  if (window.location.pathname.includes('artist.html') && typeof renderArtist === 'function') {
    renderArtist();
  }
  if (window.location.pathname.includes('album.html') && typeof renderAlbum === 'function') {
    renderAlbum();
  }
}

// Play specific song (triggered from cards or list rows)
window.playSongImmediately = function(songId, contextQueue = null) {
  let state = JSON.parse(localStorage.getItem('playerState'));
  
  if (contextQueue && contextQueue.length > 0) {
    state.queue = contextQueue;
    state.queueIndex = contextQueue.indexOf(songId);
  }

  state.currentSongId = songId;
  state.isPlaying = true;

  localStorage.setItem('playerState', JSON.stringify(state));
  
  // Update source immediately to prevent delay
  const songs = JSON.parse(localStorage.getItem('songsDb')) || [];
  const currentSong = songs.find(s => s.id === songId);
  if (currentSong && audio) {
    audio.src = currentSong.url;
    audio.load();
  }

  initPlayerUI();

  // Update layout play buttons
  const mainPlayBtn = document.getElementById('playlistPlayMainBtn');
  if (mainPlayBtn) {
    mainPlayBtn.innerHTML = getPauseSVG();
  }
}

// Skip tracks next/previous
function skipTrack(direction) {
  let state = JSON.parse(localStorage.getItem('playerState'));
  const songs = JSON.parse(localStorage.getItem('songsDb')) || [];
  
  if (songs.length === 0) return;

  let nextIndex = state.queueIndex + direction;

  // Handle bounds
  if (nextIndex >= state.queue.length) {
    nextIndex = 0;
  } else if (nextIndex < 0) {
    nextIndex = state.queue.length - 1;
  }

  // Shuffle mode skip
  if (state.shuffle && direction > 0) {
    nextIndex = Math.floor(Math.random() * state.queue.length);
  }

  state.queueIndex = nextIndex;
  state.currentSongId = state.queue[nextIndex];

  localStorage.setItem('playerState', JSON.stringify(state));

  // Pre-load next track src
  const currentSong = songs.find(s => s.id === state.currentSongId);
  if (currentSong && audio) {
    audio.src = currentSong.url;
    audio.load();
  }

  initPlayerUI();

  // Sync pages
  syncPagesButtonsState(state.isPlaying);
}

// Toggle Song Like/Favorite in local storage
function toggleSongLike(songId) {
  let playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  const likedIndex = playlists.findIndex(p => p.id === 'liked-songs');

  if (likedIndex !== -1) {
    const list = playlists[likedIndex].songs;
    const songIndex = list.indexOf(songId);

    if (songIndex !== -1) {
      list.splice(songIndex, 1); // Unlike
    } else {
      list.push(songId); // Like
    }

    playlists[likedIndex].songs = list;
    playlists[likedIndex].followers = `${list.length} songs`;
    localStorage.setItem('playlistsDb', JSON.stringify(playlists));
  }
}

// Format integer seconds to 'M:SS'
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Update UI Timeline fills
function updateTimelineProgress(currentTime, totalDuration) {
  const elapsedLabel = document.getElementById('playerTimeElapsed');
  const percent = (currentTime / totalDuration) * 100;

  if (elapsedLabel) elapsedLabel.textContent = formatTime(currentTime);

  const fill = document.getElementById('playerTimelineFill');
  const thumb = document.getElementById('playerTimelineThumb');
  
  if (fill) fill.style.width = `${percent}%`;
  if (thumb) thumb.style.left = `${percent}%`;
}

// SVG helpers
function getPlaySVG() {
  return `<svg viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>`;
}

function getPauseSVG() {
  return `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}

function getUnlikedHeartSVG() {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}

function getLikedHeartSVG() {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}
