let seconds = 0;
let interval = null;
let running = false;

// INIT
displayRuns();
navigate('home'); // Set the initial active state

// TIMER
function updateTimer() {
  seconds++;
  let mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  let secs = String(seconds % 60).padStart(2, '0');
  document.getElementById("timer").textContent = `${mins}:${secs}`;
}

function toggleRun() {
  const icon = document.getElementById("playIcon");

  if (!running) {
    interval = setInterval(updateTimer, 1000);
    running = true;
    icon.textContent = "pause";
  } else {
    clearInterval(interval);
    running = false;
    icon.textContent = "play_arrow";
  }
}

function resetRun() {
  clearInterval(interval);
  running = false;
  seconds = 0;
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("playIcon").textContent = "play_arrow";
}

// SIDEBAR ANIMATION
function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("-translate-x-full");
}

function navigate(page) {
  // 1. Toggle Section Visibility
  ["home", "cadence", "about"].forEach(id => {
    const section = document.getElementById(id);
    const navBtn = document.getElementById(`nav-${id}`);

    // Hide/Show Sections
    section.classList.toggle("hidden", id !== page);

    // Update Button Styles
    if (id === page) {
      // ACTIVE styles (White text on purple background)
      navBtn.classList.add("bg-[#5e17eb]", "text-white");
      navBtn.classList.remove("text-gray-600", "hover:bg-gray-100");
    } else {
      // INACTIVE styles (Gray text, subtle hover)
      navBtn.classList.remove("bg-[#5e17eb]", "text-white");
      navBtn.classList.add("text-gray-600", "hover:bg-gray-100");
    }
  });

  // 2. Close Sidebar on mobile
  if (window.innerWidth < 768) {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar.classList.contains("-translate-x-full")) {
      toggleMenu();
    }
  }
}

// RUNS
let selectedMood = 3; // Default to 'OK'

function saveRun() {
  const timeStr = document.getElementById("timer").textContent;
  if (timeStr === "00:00") return; // Don't save empty runs

  // Pre-fill modal
  let runs = JSON.parse(localStorage.getItem("runs")) || [];
  document.getElementById("modalRunName").value = `Run ${runs.length + 1}`;
  document.getElementById("modalKM").value = "";
  document.getElementById("modalPace").value = "";

  // Show Modal
  document.getElementById("saveModal").classList.remove("hidden");
}

function calculatePace() {
  const km = parseFloat(document.getElementById("modalKM").value);
  const timeParts = document.getElementById("timer").textContent.split(':');
  const totalSeconds = (parseInt(timeParts[0]) * 60) + parseInt(timeParts[1]);

  if (km > 0) {
    const paceSecondsPerKm = totalSeconds / km;
    const pMins = Math.floor(paceSecondsPerKm / 60);
    const pSecs = Math.round(paceSecondsPerKm % 60).toString().padStart(2, '0');
    document.getElementById("modalPace").value = `${pMins}:${pSecs}`;
  }
}

function setMood(val) {
  selectedMood = val;
  const btns = document.querySelectorAll('.mood-btn');
  btns.forEach((btn, index) => {
    btn.style.opacity = (index + 1 === val) ? "1" : "0.3";
    btn.style.transform = (index + 1 === val) ? "scale(1.3)" : "scale(1)";
  });
}

// Updated confirmSave function
function confirmSave() {
  const runs = JSON.parse(localStorage.getItem("runs")) || [];

  // Map our 1-5 scale to Material Icon names
  const moodIcons = [
    "sentiment_very_dissatisfied",
    "sentiment_dissatisfied",
    "sentiment_neutral",
    "sentiment_satisfied",
    "sentiment_very_satisfied"
  ];

  // Capture current Date AND Time
  const now = new Date();
  const dateTimeString = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' @ ' +
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newRun = {
    id: Date.now(),
    title: document.getElementById("modalRunName").value || "Quick Run",
    time: document.getElementById("timer").textContent,
    km: document.getElementById("modalKM").value || "0",
    pace: document.getElementById("modalPace").value || "--",
    moodIcon: moodIcons[selectedMood - 1], // Store the icon name
    timestamp: dateTimeString
  };

  runs.push(newRun);
  localStorage.setItem("runs", JSON.stringify(runs));

  closeModal();
  resetRun();
  displayRuns();
}

// Update the visual "selection" state for icons
function setMood(val) {
  selectedMood = val;
  const btns = document.querySelectorAll('.mood-btn');
  const colors = ['text-red-500', 'text-orange-400', 'text-yellow-500', 'text-green-400', 'text-green-600'];

  btns.forEach((btn, index) => {
    // Remove all possible color classes first
    btn.classList.remove(...colors, 'text-gray-300');

    if (index + 1 === val) {
      btn.classList.add(colors[index]);
      btn.style.transform = "scale(1.2)";
    } else {
      btn.classList.add('text-gray-300');
      btn.style.transform = "scale(1)";
    }
  });
}

function closeModal() {
  document.getElementById("saveModal").classList.add("hidden");
}

function deleteRun(id) {
  let runs = JSON.parse(localStorage.getItem("runs")) || [];
  runs = runs.filter(r => r.id !== id);
  localStorage.setItem("runs", JSON.stringify(runs));
  displayRuns();
}

function updateTitle(id, value) {
  let runs = JSON.parse(localStorage.getItem("runs")) || [];
  runs = runs.map(r => r.id === id ? { ...r, title: value } : r);
  localStorage.setItem("runs", JSON.stringify(runs));
}

function displayRuns() {
  const history = document.getElementById("history");
  history.innerHTML = "";
  let runs = JSON.parse(localStorage.getItem("runs")) || [];

  runs.slice().reverse().forEach(run => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition";

    div.innerHTML = `
      <div class="flex items-center gap-4">
        <span class="material-icons text-gray-400">${run.moodIcon}</span>
        <div>
          <div class="flex items-baseline gap-2">
            <h4 class="font-bold text-gray-800">${run.title}</h4>
            <span class="text-[10px] text-gray-400 uppercase font-medium">${run.timestamp}</span>
          </div>
          <div class="flex gap-4 text-xs text-gray-500 mt-1">
            <span class="flex items-center gap-1"><span class="material-icons text-[14px]">timer</span> ${run.time}</span>
            <span class="flex items-center gap-1"><span class="material-icons text-[14px]">place</span> ${run.km}km</span>
            <span class="flex items-center gap-1"><span class="material-icons text-[14px]">speed</span> ${run.pace}/km</span>
          </div>
        </div>
      </div>
      <button onclick="deleteRun(${run.id})" class="text-gray-300 hover:text-red-500 transition">
        <span class="material-icons">delete_outline</span>
      </button>
    `;
    history.appendChild(div);
  });
}
// CADENCE
let taps = [];

function tapCadence() {
  const now = Date.now();
  taps.push(now);
  if (taps.length > 8) taps.shift();

  if (taps.length >= 4) {
    let intervals = [];
    for (let i = 1; i < taps.length; i++) {
      intervals.push(taps[i] - taps[i - 1]);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avg);

    let playlist = bpm < 160 ? "Strut"
      : bpm <= 164 ? "160–164"
        : bpm <= 169 ? "165–169"
          : "170+";

    document.getElementById("cadenceResult").innerHTML = `
      <div class="p-4 border rounded-xl animate-pulse">
        <div class="text-lg font-semibold">${bpm} BPM</div>
        <div class="text-sm text-gray-600">${playlist} Playlist</div>
      </div>
    `;
  }
}

// INIT
displayRuns();

// SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}