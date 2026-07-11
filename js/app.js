/* Spotify UI Clone - App Initialization & Mock Data */

document.addEventListener('DOMContentLoaded', () => {
  initMockData();
  setupGlobalEvents();
  renderSidebarLibrary();
});

// Initialize database in localStorage
function initMockData() {
  // Clear legacy cache if song URLs are missing to trigger database rebuild
  const songsDbCheck = JSON.parse(localStorage.getItem('songsDb'));
  if (songsDbCheck && songsDbCheck.length > 0 && !songsDbCheck[0].url) {
    localStorage.clear();
  }

  // Current User Profile
  if (!localStorage.getItem('spotifyUser')) {
    const userProfile = {
      name: 'Dhanushkumar',
      avatar: 'assets/images/user_avatar.jpg',
      playlistsCount: 4
    };
    localStorage.setItem('spotifyUser', JSON.stringify(userProfile));
  }

  // 1. Song Library database containing popular Tamil tracks
  if (!localStorage.getItem('songsDb')) {
    const songsDb = [
      { 
        id: 1, 
        title: 'Badass', 
        artist: 'Anirudh Ravichander', 
        album: 'Leo', 
        duration: '3:49', 
        artwork: 'assets/albums/leo.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        freq: 220, 
        melody: [220, 246, 277, 329, 277, 246, 220, 165]
      },
      { 
        id: 2, 
        title: 'Ponni Nadhi', 
        artist: 'A.R. Rahman', 
        album: 'Ponniyin Selvan - 1', 
        duration: '5:02', 
        artwork: 'assets/albums/ps1.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        freq: 293.66,
        melody: [293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 220.00]
      },
      { 
        id: 3, 
        title: 'Naa Ready', 
        artist: 'Anirudh Ravichander', 
        album: 'Leo', 
        duration: '4:08', 
        artwork: 'assets/albums/leo.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        freq: 261.63,
        melody: [261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63, 196.00]
      },
      { 
        id: 4, 
        title: 'Kutty Story', 
        artist: 'Anirudh Ravichander', 
        album: 'Master', 
        duration: '5:24', 
        artwork: 'assets/albums/master.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        freq: 329.63,
        melody: [329.63, 392.00, 440.00, 493.88, 440.00, 392.00, 329.63, 293.66]
      },
      { 
        id: 5, 
        title: 'Thuli Thuli', 
        artist: 'Yuvan Shankar Raja', 
        album: 'Paiyaa', 
        duration: '4:46', 
        artwork: 'assets/albums/paiyaa.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        freq: 349.23,
        melody: [349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 261.63]
      },
      { 
        id: 6, 
        title: 'Adiye Kolluthe', 
        artist: 'Harris Jayaraj', 
        album: 'Vaaranam Aayiram', 
        duration: '5:13', 
        artwork: 'assets/albums/va.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        freq: 440.00,
        melody: [440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00, 329.63]
      },
      { 
        id: 7, 
        title: 'Hukum - Alappara', 
        artist: 'Anirudh Ravichander', 
        album: 'Jailer', 
        duration: '3:27', 
        artwork: 'assets/albums/jailer.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        freq: 277.18,
        melody: [277.18, 311.13, 369.99, 415.30, 369.99, 311.13, 277.18, 207.65]
      },
      { 
        id: 8, 
        title: 'Vaseegara', 
        artist: 'Harris Jayaraj', 
        album: 'Minnale', 
        duration: '5:01', 
        artwork: 'assets/albums/minnale.jpg',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        freq: 311.13,
        melody: [311.13, 349.23, 392.00, 466.16, 392.00, 349.23, 311.13, 233.08]
      }
    ];
    localStorage.setItem('songsDb', JSON.stringify(songsDb));
  }

  // 2. Playlists database (linking track IDs)
  if (!localStorage.getItem('playlistsDb')) {
    const playlistsDb = [
      {
        id: 'tamil-hits',
        name: 'Tamil Hits 2026',
        desc: 'The hottest Tamil releases from Kollywood, featuring Anirudh Ravichander and A.R. Rahman.',
        author: 'Spotify',
        followers: '320,400 likes',
        artwork: 'assets/playlists/tamil_hits.jpg',
        gradient: 'linear-gradient(to bottom, #115e59 0%, #121212 100%)',
        songs: [1, 2, 3, 7]
      },
      {
        id: 'arr-melodies',
        name: 'A.R. Rahman Special',
        desc: 'A collection of evergreen melodies composed by the Mozart of Madras.',
        author: 'Dhanushkumar',
        followers: '85,200 likes',
        artwork: 'assets/playlists/arr_special.jpg',
        gradient: 'linear-gradient(to bottom, #1e3a8a 0%, #121212 100%)',
        songs: [2, 8]
      },
      {
        id: 'anirudh-rage',
        name: 'Anirudh Rage Playlist',
        desc: 'High-energy chartbusters from the rockstar Anirudh Ravichander.',
        author: 'Spotify',
        followers: '190,500 likes',
        artwork: 'assets/playlists/anirudh_rage.jpg',
        gradient: 'linear-gradient(to bottom, #991b1b 0%, #121212 100%)',
        songs: [1, 3, 4, 7]
      },
      {
        id: 'liked-songs',
        name: 'Liked Songs',
        desc: 'Your personal collection of tracks you love.',
        author: 'Dhanushkumar',
        followers: '5 songs',
        artwork: 'assets/playlists/liked_songs.jpg',
        gradient: 'linear-gradient(to bottom, #3b0764 0%, #121212 100%)',
        songs: [5, 6, 8, 2, 1]
      }
    ];
    localStorage.setItem('playlistsDb', JSON.stringify(playlistsDb));
  }

  // 3. Artists database
  if (!localStorage.getItem('artistsDb')) {
    const artistsDb = [
      {
        id: 'anirudh',
        name: 'Anirudh Ravichander',
        listeners: '21,500,600 monthly listeners',
        artwork: 'assets/artists/anirudh.jpg',
        banner: 'assets/artists/anirudh_banner.jpg',
        bio: 'Anirudh Ravichander is an Indian music composer and singer, who works predominantly in Tamil cinema. He is widely considered one of the leading film composers in modern Indian cinema.',
        popularSongs: [1, 3, 4, 7]
      },
      {
        id: 'rahman',
        name: 'A.R. Rahman',
        listeners: '28,900,400 monthly listeners',
        artwork: 'assets/artists/rahman.jpg',
        banner: 'assets/artists/rahman_banner.jpg',
        bio: 'Allahrakha Rahman, known professionally as A.R. Rahman, is an Indian music composer, singer, and songwriter. He has won two Academy Awards, two Grammy Awards, and a BAFTA Award.',
        popularSongs: [2, 8]
      }
    ];
    localStorage.setItem('artistsDb', JSON.stringify(artistsDb));
  }

  // 4. Albums database
  if (!localStorage.getItem('albumsDb')) {
    const albumsDb = [
      {
        id: 'leo',
        title: 'Leo',
        artist: 'Anirudh Ravichander',
        year: '2023',
        artwork: 'assets/albums/leo.jpg',
        songs: [1, 3]
      },
      {
        id: 'ps1',
        title: 'Ponniyin Selvan - 1',
        artist: 'A.R. Rahman',
        year: '2022',
        artwork: 'assets/albums/ps1.jpg',
        songs: [2]
      }
    ];
    localStorage.setItem('albumsDb', JSON.stringify(albumsDb));
  }

  // 5. Active Player State (persisted inside localStorage)
  if (!localStorage.getItem('playerState')) {
    const initialPlayer = {
      currentSongId: 1, // Default song "Badass"
      isPlaying: false,
      volume: 0.5,
      shuffle: false,
      repeat: 'none', // none, context, track
      queue: [1, 2, 3, 4, 5, 6, 7, 8],
      queueIndex: 0
    };
    localStorage.setItem('playerState', JSON.stringify(initialPlayer));
  }
}

// Render Sidebar Library playlists
function renderSidebarLibrary() {
  const libraryContainer = document.getElementById('sidebarLibraryList');
  if (!libraryContainer) return;

  const playlists = JSON.parse(localStorage.getItem('playlistsDb')) || [];
  libraryContainer.innerHTML = '';

  playlists.forEach(pl => {
    const itemHTML = `
      <li class="library-item" onclick="openPlaylistDetails('${pl.id}')">
        <img class="library-item-img" src="${pl.artwork}" alt="${pl.name}" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'" />
        <div class="library-item-info">
          <span class="library-item-name">${pl.name}</span>
          <span class="library-item-meta">Playlist • ${pl.author}</span>
        </div>
      </li>
    `;
    libraryContainer.insertAdjacentHTML('beforeend', itemHTML);
  });
}

// Global Nav Setup
function setupGlobalEvents() {
  // Populate User Profile name & avatar in header
  const user = JSON.parse(localStorage.getItem('spotifyUser'));
  if (user) {
    const userProfileText = document.querySelector('.header-user-profile span');
    const userProfileImg = document.querySelector('.header-user-avatar');
    
    if (userProfileText) userProfileText.textContent = user.name;
    if (userProfileImg) {
      userProfileImg.src = user.avatar;
      userProfileImg.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
      };
    }
  }

  // Handle dropdown click (just log out mock alert or toggle light mode placeholder)
  const profileBtn = document.getElementById('headerUserProfileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      alert(`Logged in as ${user ? user.name : 'Dhanushkumar'} • Spotify Premium Student`);
    });
  }
}

// Dynamic Navigation helpers
window.openPlaylistDetails = function(playlistId) {
  localStorage.setItem('selectedPlaylistId', playlistId);
  window.location.href = 'playlist.html';
};

window.openArtistDetails = function(artistId) {
  localStorage.setItem('selectedArtistId', artistId);
  window.location.href = 'artist.html';
};

window.openAlbumDetails = function(albumId) {
  localStorage.setItem('selectedAlbumId', albumId);
  window.location.href = 'album.html';
};
