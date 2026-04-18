// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
  apiKey: "AIzaSyA_VII-o7zVyliueszM66wf1xYSn26dUbo",
  authDomain: "sokoauthication.firebaseapp.com",
  projectId: "sokoauthication",
  storageBucket: "sokoauthication.firebasestorage.app",
  messagingSenderId: "758223026817",
  appId: "1:758223026817:web:a485d29ea4ffbe143eab80",
  measurementId: "G-3J0QN5X2FF"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const playlistCollection = db.collection("playlist");

// ===================== PLAYER ELEMENTS =====================
const curr_track = document.querySelector("#audio"); // Your audio element
const now_playing = document.querySelector(".now-playing");
const track_art = document.querySelector(".track-art");
const track_name = document.querySelector(".track-name");
const track_artist = document.querySelector(".track-artist");

const playpause_btn = document.querySelector(".playpause-track i");
const seek_slider = document.querySelector(".seek_slider");
const volume_slider = document.querySelector(".volume_slider");
const curr_time = document.querySelector(".current-time");
const total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer;
let track_list = [];

// ===================== FIRESTORE FETCH =====================
async function fetchPlaylistFromFirestore() {
  try {
    const snapshot = await playlistCollection.get();

    track_list = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().title,
      artist: doc.data().artist,
      album: doc.data().album || "",
      genre: doc.data().genre || "",
      year: doc.data().year || "",
      mood: doc.data().mood || "",
      image: doc.data().thumbnail,
      path: doc.data().url,
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null
    }));

    if (track_list.length > 0) {
      loadTrack(track_index); // Load first track
      renderPlaylist(track_list);
    } else {
      now_playing.textContent = "No tracks found in Cloud";
    }
  } catch (err) {
    console.error("Error fetching playlist: ", err);
  }
}

// ===================== RENDER PLAYLIST =====================
function renderPlaylist(track_list) {
  const container = document.getElementById('homescreen');

  // Clear previous content
  container.innerHTML = '';

  // Create loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  container.appendChild(spinner);

  // Simulate async delay if needed
  setTimeout(() => {
    // Clear spinner
    container.innerHTML = '';

    track_list.forEach((track, index) => {
      const trackCard = document.createElement('div');
      trackCard.className = 'homescreen';
      trackCard.dataset.index = index;

      const defaultImage = 'DSC_0933.JPG~2.jpg';

      trackCard.innerHTML = `
        <img src="${defaultImage}" alt="${track.name}" />
        <div class="song-info">
          <p class="title">${track.name}</p>
          <p class="artist">${track.artist} • ${track.plays || '0'} plays</p>
        </div>
        <div class="download-icon">
          <i class="fa-solid fa-arrow-down"></i>
        </div>
        <div class="more-options">&#8942;</div>
      `;

      // Track click event
      trackCard.addEventListener('click', () => {
        track_index = index;
        loadTrack(track_index);
        playTrack();
      });

      // Download button click event
      const downloadBtn = trackCard.querySelector('.download-icon');
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent track click
        if (track.path) {
          download(track.path);
        } else {
          console.error('No download path for this track.');
        }
      });

      container.appendChild(trackCard);
    });
  }, 500); // Simulated loading delay
}


function download(path) {
  if (!path) {
    console.error("No file path provided");
    return;
  }

  // Create temporary <a> element to trigger download
  const a = document.createElement('a');
  a.href = path;           // GitHub raw file URL
  a.download = '';         // Optional: you can give a filename, e.g., 'song.mp3'
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// ===================== TRACK FUNCTIONS =====================
function loadTrack(index) {
  clearInterval(updateTimer);
  resetValues();

  curr_track.src = track_list[index].path;
  curr_track.load();
const defaultImage = 'DSC_0933.JPG~2.jpg';

// Use the track's image if it exists, otherwise fallback to defaultImage
const imageUrl = track_list[index].image ? track_list[index].image : defaultImage;

// Set the background image
track_art.style.backgroundImage = `url('${imageUrl}')`;
  track_name.textContent = track_list[index].name;
  track_artist.textContent = track_list[index].artist;
  now_playing.textContent = `PLAYING ${index + 1} OF ${track_list.length}`;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playPauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.classList.remove('fa-play-circle');
  playpause_btn.classList.add('fa-pause-circle');
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.classList.remove('fa-pause-circle');
  playpause_btn.classList.add('fa-play-circle');
}

function nextTrack() {
  track_index = (track_index + 1) % track_list.length;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  track_index = (track_index > 0) ? track_index - 1 : track_list.length - 1;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  const seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  if (!isNaN(curr_track.duration)) {
    const seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
    if (durationSeconds < 10) durationSeconds = "0" + durationSeconds;
    if (currentMinutes < 10) currentMinutes = "0" + currentMinutes;
    if (durationMinutes < 10) durationMinutes = "0" + durationMinutes;

    curr_time.textContent = `${currentMinutes}:${currentSeconds}`;
    total_duration.textContent = `${durationMinutes}:${durationSeconds}`;
  }
}

function toggle1() {

// Add the class if not already present

document.getElementById('appPlayer').classList.add('minimized');





document.getElementById("minibtn").style.display='none';

document.getElementById("maxbtn").style.display='block';

}

function toggle2() {

document.getElementById('appPlayer').classList.remove('minimized');

document.getElementById("homescreen").style.display='none';


document.getElementById("maxbtn").style.display='none';

document.getElementById("minibtn").style.display='block';



}
// ===================== INITIAL FETCH =====================
fetchPlaylistFromFirestore();