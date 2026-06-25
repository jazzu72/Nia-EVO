const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const voiceBtn = document.getElementById("voice-btn");
const voiceStatus = document.getElementById("voice-status");

function addMessage(text, who = "nia") {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${who}`;
  wrapper.textContent = text;
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage("Jason, your sovereign console is online. Voice and text channels are active.");

/* --- Send message to NIA backend --- */
async function sendToNIA(text) {
  const response = await fetch("/nia/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await response.json();
  const reply = data.nia?.decision || "Instruction processed.";

  addMessage(reply, "nia");
}

/* --- Text chat --- */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  sendToNIA(text);
});

/* --- Voice chat --- */
let recognition = null;
let listening = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    voiceStatus.textContent = "Listening...";
    voiceBtn.classList.add("active");
  };

  recognition.onend = () => {
    listening = false;
    voiceStatus.textContent = "Mic idle";
    voiceBtn.classList.remove("active");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    addMessage(transcript, "user");
    sendToNIA(transcript);
  };
}

voiceBtn.addEventListener("click", () => {
  if (!recognition) {
    voiceStatus.textContent = "Voice not supported.";
    return;
  }

  if (!listening) recognition.start();
  else recognition.stop();
});

// --- NIA HOLOGRAPHIC AVATAR ENGINE ---
const avatarContainer = document.getElementById("nia-avatar");

if (avatarContainer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    avatarContainer.clientWidth / avatarContainer.clientHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(
    avatarContainer.clientWidth,
    avatarContainer.clientHeight
  );
  avatarContainer.appendChild(renderer.domElement);

  // Hologram core
  const geometry = new THREE.SphereGeometry(1.2, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00eaff,
    emissive: 0x0088ff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.85,
    roughness: 0.2,
    metalness: 0.8
  });

  const core = new THREE.Mesh(geometry, material);
  scene.add(core);

  // Glow ring
  const ringGeometry = new THREE.RingGeometry(1.4, 1.8, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Lighting
  const light = new THREE.PointLight(0x00eaff, 2, 50);
  light.position.set(0, 0, 4);
  scene.add(light);

  camera.position.z = 4;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    core.rotation.y += 0.003;
    ring.rotation.z += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  // Voice-reactive pulse
  function pulseAvatar() {
    core.material.emissiveIntensity = 1.2;
    setTimeout(() => {
      core.material.emissiveIntensity = 0.6;
    }, 300);
  }

  // Hook into NIA replies
  const originalAddMessage = addMessage;
  addMessage = function (text, who = "nia") {
    originalAddMessage(text, who);
    if (who === "nia") pulseAvatar();
  };
}

// --- NIA HOLOGRAM EMOTION STATES ---
const NIA_EMOTION = {
  calm: {
    color: 0x00eaff,
    emissive: 0x0088ff,
    intensity: 0.6,
    ringColor: 0x22c55e,
    ringOpacity: 0.35
  },
  focused: {
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    intensity: 0.9,
    ringColor: 0x3b82f6,
    ringOpacity: 0.45
  },
  alert: {
    color: 0xf87171,
    emissive: 0xef4444,
    intensity: 1.3,
    ringColor: 0xf43f5e,
    ringOpacity: 0.55
  },
  strategic: {
    color: 0xa855f7,
    emissive: 0x9333ea,
    intensity: 1.1,
    ringColor: 0x8b5cf6,
    ringOpacity: 0.5
  },
  founderEngaged: {
    color: 0x22c55e,
    emissive: 0x16a34a,
    intensity: 1.4,
    ringColor: 0x4ade80,
    ringOpacity: 0.6
  }
};

// Apply emotion to hologram
function setNIAEmotion(state) {
  if (!core || !ring) return;

  const e = NIA_EMOTION[state] || NIA_EMOTION.calm;

  core.material.color.setHex(e.color);
  core.material.emissive.setHex(e.emissive);
  core.material.emissiveIntensity = e.intensity;

  ring.material.color.setHex(e.ringColor);
  ring.material.opacity = e.ringOpacity;
}

// Emotion mapping based on NIA's directive
function mapDirectiveToEmotion(directive) {
  directive = directive.toLowerCase();

  if (directive.includes("advance aggressively")) return "alert";
  if (directive.includes("advance selectively")) return "focused";
  if (directive.includes("probe")) return "strategic";
  if (directive.includes("retreat")) return "alert";
  if (directive.includes("hold")) return "calm";

  return "calm";
}

// Modify sendToNIA to apply emotion
const originalSendToNIA = sendToNIA;
sendToNIA = async function(text) {
  const response = await fetch("/nia/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await response.json();
  const reply = data.nia?.decision || "Instruction processed.";

  addMessage(reply, "nia");

  // Emotion state from directive
  const directive = data.nia?.strategy?.directive || "";
  const emotion = mapDirectiveToEmotion(directive);
  setNIAEmotion(emotion);
};

// --- NIA VOICE OUTPUT ENGINE ---
function niaSpeak(text) {
  if (!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);

  // Voice styling
  utter.pitch = 1.15;       // Slightly elevated, Wakanda‑tech tone
  utter.rate = 0.92;        // Calm, authoritative pacing
  utter.volume = 1.0;       // Full presence
  utter.lang = "en-US";     // Clear English output

  // Choose a premium‑sounding voice if available
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.toLowerCase().includes("female") ||
    v.name.toLowerCase().includes("zira") ||
    v.name.toLowerCase().includes("samantha")
  );

  if (preferred) utter.voice = preferred;

  speechSynthesis.cancel(); // Stop any previous speech
  speechSynthesis.speak(utter);
}

// Patch addMessage to trigger voice output
const originalAddMessageForVoice = addMessage;
addMessage = function(text, who = "nia") {
  originalAddMessageForVoice(text, who);

  if (who === "nia") {
    niaSpeak(text);   // Speak NIA's reply
    if (typeof setNIAEmotion === "function") {
      setNIAEmotion("founderEngaged"); // Visual sync
    }
  }
};

// When NIA speaks, memory-driven emotion boost
function memoryPulse() {
  if (typeof setNIAEmotion === "function") {
    setNIAEmotion("founderEngaged");
  }
}

const originalSpeak = niaSpeak;
niaSpeak = function(text) {
  originalSpeak(text);
  memoryPulse();
};
