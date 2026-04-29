const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let lastScrollTime = Date.now();
let scrollIntensity = 0;
let tabSwitchCount = 0;
let lastTabSwitch = Date.now();
let isCooldown = false;

const sounds = {
  gentle: ['sounds/gentle1.mp3', 'sounds/gentle2.mp3'],
  medium: ['sounds/medium1.mp3'],
  intense: ['sounds/intense1.mp3', 'sounds/intense2.mp3'],
  climax: ['sounds/climax.mp3'],
  afterglow: ['sounds/afterglow.mp3']
};

// Preload sounds (optional but smoother)
let audioBuffers = {};

async function loadSound(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

// Play a random sound from a category
async function playSound(category, volume = 1) {
  if (isCooldown) return;
  
  const files = sounds[category];
  const randomFile = files[Math.floor(Math.random() * files.length)];
  
  if (!audioBuffers[randomFile]) {
    audioBuffers[randomFile] = await loadSound(randomFile);
  }
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[randomFile];
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;
  
  source.connect(gainNode).connect(audioContext.destination);
  source.start(0);
  
  isCooldown = true;
  setTimeout(() => { isCooldown = false; }, 800); // prevent spam
}

// Scroll detection
let scrollTimeout;
window.addEventListener('scroll', () => {
  const now = Date.now();
  const timeSinceLast = now - lastScrollTime;
  lastScrollTime = now;
  
  scrollIntensity = Math.min(100, scrollIntensity + (1000 / (timeSinceLast + 50)));
  
  clearTimeout(scrollTimeout);
  
  let category = 'gentle';
  let vol = 0.6;
  
  if (scrollIntensity > 70) {
    category = 'intense';
    vol = 1;
  } else if (scrollIntensity > 35) {
    category = 'medium';
    vol = 0.85;
  }
  
  playSound(category, vol);
  
  // Update UI text seductively
  document.getElementById('status').textContent = 
    scrollIntensity > 60 ? "Yes... harder~ 💦" : "Mmm... keep stroking me 😌";
  
  scrollTimeout = setTimeout(() => {
    // After stopping scroll → possible climax
    if (scrollIntensity > 55) {
      playSound('climax', 0.9);
      document.getElementById('status').textContent = "Ahhh... that was so good~";
      document.body.classList.add('afterglow');
      setTimeout(() => {
        document.body.classList.remove('afterglow');
        document.getElementById('status').textContent = "Ready for round two? 😉";
      }, 2500);
    }
    scrollIntensity = 0;
  }, 400);
});

// Tab switching detection (the "needy" part)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const now = Date.now();
    if (now - lastTabSwitch < 1500) {  // switched back quickly
      tabSwitchCount++;
      if (tabSwitchCount > 2) {
        playSound('intense', 1);
        document.getElementById('status').textContent = "You keep teasing me by leaving... I like it 😈";
      } else {
        playSound('gentle', 0.7);
        document.getElementById('status').textContent = "Welcome back... missed my strokes? 💕";
      }
    } else {
      tabSwitchCount = 0;
    }
    lastTabSwitch = now;
  }
});

// Initial interaction to unlock audio (browsers block autoplay)
document.body.addEventListener('click', () => {
  if (audioContext.state === 'suspended') audioContext.resume();
}, { once: true });

console.log("%cStrokeMyTab ready 💋 Scroll or switch tabs to play!", "color: hotpink; font-size: 16px");