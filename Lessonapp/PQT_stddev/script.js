// Gamified Standard Deviation App Script

// Sound Synth via Web Audio API
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2); // A5
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  playError() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
};

// Fixed 6 Questions Data
const QUESTIONS = [
  // EASY CATEGORY
  {
    id: "e1",
    category: "easy",
    title: "Easy Q1: Target Practice Scores",
    type: "population",
    formulaName: "Population Std Dev (σ)",
    desc: "Calculate population standard deviation for 4 target scores:",
    data: [2, 4, 6, 8],
    n: 4,
    steps: [
      { label: "Step 1: Calculate Mean (μ)", key: "mean", target: 5.0, hint: "Sum of values (20) ÷ 4 items = 5" },
      { label: "Step 2: Sum of Squared Diff ∑(x - μ)²", key: "sumSq", target: 20.0, hint: "(2-5)² + (4-5)² + (6-5)² + (8-5)² = 9 + 1 + 1 + 9 = 20" },
      { label: "Step 3: Variance (σ²) = ∑(x - μ)² ÷ N", key: "variance", target: 5.0, hint: "Divide 20 by N=4. Variance = 5" },
      { label: "Step 4: Standard Deviation (σ) = √Variance", key: "stdDev", target: 2.24, hint: "√5 ≈ 2.24" }
    ]
  },
  {
    id: "e2",
    category: "easy",
    title: "Easy Q2: Sample Gaming Hours",
    type: "sample",
    formulaName: "Sample Std Dev (s)",
    desc: "A small sample of 3 gamers was surveyed:",
    data: [10, 12, 14],
    n: 3,
    steps: [
      { label: "Step 1: Calculate Sample Mean (x̄)", key: "mean", target: 12.0, hint: "(10 + 12 + 14) ÷ 3 = 12" },
      { label: "Step 2: Sum of Squared Diff ∑(x - x̄)²", key: "sumSq", target: 8.0, hint: "(10-12)² + (12-12)² + (14-12)² = 4 + 0 + 4 = 8" },
      { label: "Step 3: Sample Variance (s²) = ∑ ÷ (n - 1)", key: "variance", target: 4.0, hint: "Divide 8 by (n - 1) = 3 - 1 = 2. Variance = 4" },
      { label: "Step 4: Sample Std Dev (s) = √Variance", key: "stdDev", target: 2.0, hint: "√4 = 2.0" }
    ]
  },

  // MEDIUM CATEGORY
  {
    id: "m1",
    category: "medium",
    title: "Medium Q1: Server Ping Latency (ms)",
    type: "population",
    formulaName: "Population Std Dev (σ)",
    desc: "Entire population of 5 server test pings:",
    data: [10, 20, 30, 40, 50],
    n: 5,
    steps: [
      { label: "Step 1: Calculate Mean (μ)", key: "mean", target: 30.0, hint: "150 ÷ 5 = 30" },
      { label: "Step 2: Sum of Squared Diff ∑(x - μ)²", key: "sumSq", target: 1000.0, hint: "(-20)² + (-10)² + 0² + 10² + 20² = 400 + 100 + 0 + 100 + 400 = 1000" },
      { label: "Step 3: Variance (σ²) = ∑ ÷ N", key: "variance", target: 200.0, hint: "1000 ÷ 5 = 200" },
      { label: "Step 4: Standard Deviation (σ) = √Variance", key: "stdDev", target: 14.14, hint: "√200 ≈ 14.14" }
    ]
  },
  {
    id: "m2",
    category: "medium",
    title: "Medium Q2: Phone Battery Life (Hours)",
    type: "sample",
    formulaName: "Sample Std Dev (s)",
    desc: "Sample of 5 student phones tested:",
    data: [5, 8, 11, 12, 14],
    n: 5,
    steps: [
      { label: "Step 1: Calculate Mean (x̄)", key: "mean", target: 10.0, hint: "50 ÷ 5 = 10" },
      { label: "Step 2: Sum of Squared Diff ∑(x - x̄)²", key: "sumSq", target: 50.0, hint: "(5-10)² + (8-10)² + (11-10)² + (12-10)² + (14-10)² = 25 + 4 + 1 + 4 + 16 = 50" },
      { label: "Step 3: Sample Variance (s²) = ∑ ÷ (n - 1)", key: "variance", target: 12.5, hint: "Divide 50 by (5 - 1) = 4. Variance = 12.5" },
      { label: "Step 4: Sample Std Dev (s) = √Variance", key: "stdDev", target: 3.54, hint: "√12.5 ≈ 3.54" }
    ]
  },

  // HARD CATEGORY
  {
    id: "h1",
    category: "hard",
    title: "Hard Q1: Class Quiz Marks (%)",
    type: "population",
    formulaName: "Population Std Dev (σ)",
    desc: "All 6 students in advanced module:",
    data: [65, 70, 75, 80, 85, 90],
    n: 6,
    steps: [
      { label: "Step 1: Calculate Mean (μ)", key: "mean", target: 77.5, hint: "465 ÷ 6 = 77.5" },
      { label: "Step 2: Sum of Squared Diff ∑(x - μ)²", key: "sumSq", target: 437.5, hint: "(-12.5)² + (-7.5)² + (-2.5)² + (2.5)² + (7.5)² + (12.5)² = 437.5" },
      { label: "Step 3: Variance (σ²) = ∑ ÷ N", key: "variance", target: 72.92, hint: "437.5 ÷ 6 ≈ 72.92" },
      { label: "Step 4: Standard Deviation (σ) = √Variance", key: "stdDev", target: 8.54, hint: "√72.92 ≈ 8.54" }
    ]
  },
  {
    id: "h2",
    category: "hard",
    title: "Hard Q2: Esports Reaction Times (ms)",
    type: "sample",
    formulaName: "Sample Std Dev (s)",
    desc: "Random sample of 5 esports players:",
    data: [180, 190, 200, 210, 220],
    n: 5,
    steps: [
      { label: "Step 1: Calculate Mean (x̄)", key: "mean", target: 200.0, hint: "1000 ÷ 5 = 200" },
      { label: "Step 2: Sum of Squared Diff ∑(x - x̄)²", key: "sumSq", target: 1000.0, hint: "(-20)² + (-10)² + 0² + 10² + 20² = 1000" },
      { label: "Step 3: Sample Variance (s²) = ∑ ÷ (n - 1)", key: "variance", target: 250.0, hint: "1000 ÷ (5 - 1) = 250" },
      { label: "Step 4: Sample Std Dev (s) = √Variance", key: "stdDev", target: 15.81, hint: "√250 ≈ 15.81" }
    ]
  }
];

// App State
let appState = {
  studentName: "",
  activeCategory: "easy",
  activeQuestionId: "e1",
  currentStepIndex: 0,
  userProgress: {
    completedQuestions: [],
    attempts: {},
    totalPoints: 0,
    streak: 0
  }
};

// DOM References
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkLoginModal();
});

function checkLoginModal() {
  const modal = document.getElementById("loginModal");
  modal.style.display = "flex";
}

async function handleStudentLogin() {
  const nameInput = document.getElementById("studentNameInput").value.trim();
  if (!nameInput) {
    alert("Please enter your Student Name / ID to start!");
    return;
  }
  appState.studentName = nameInput;
  StudentTracker.setStudent(nameInput);
  
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("studentDisplayName").textContent = nameInput;

  // Load progress from Firestore/localStorage
  const progress = await StudentTracker.loadProgress();
  appState.userProgress = progress;

  updateTopStats();
  renderCategoryButtons();
  selectQuestion(appState.activeQuestionId);
}

function updateTopStats() {
  document.getElementById("userPoints").textContent = appState.userProgress.totalPoints || 0;
  document.getElementById("userStreak").textContent = appState.userProgress.streak || 0;
}

function renderCategoryButtons() {
  const cats = ["easy", "medium", "hard"];
  cats.forEach(cat => {
    const qInCat = QUESTIONS.filter(q => q.category === cat);
    const completedCount = qInCat.filter(q => appState.userProgress.completedQuestions.includes(q.id)).length;
    
    const badge = document.getElementById(`badge-${cat}`);
    if (badge) badge.textContent = `${completedCount}/${qInCat.length}`;

    const btn = document.getElementById(`cat-btn-${cat}`);
    if (btn) {
      btn.classList.toggle("active", appState.activeCategory === cat);
    }
  });

  // Render question sub-bar buttons
  const qContainer = document.getElementById("questionSelectorBar");
  qContainer.innerHTML = "";
  
  const activeQuestions = QUESTIONS.filter(q => q.category === appState.activeCategory);
  activeQuestions.forEach((q, idx) => {
    const isCompleted = appState.userProgress.completedQuestions.includes(q.id);
    const isActive = q.id === appState.activeQuestionId;
    
    const btn = document.createElement("button");
    btn.className = `q-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    btn.innerHTML = `Q${idx + 1} ${isCompleted ? '✓' : ''}`;
    btn.onclick = () => selectQuestion(q.id);
    qContainer.appendChild(btn);
  });
}

function switchCategory(cat) {
  appState.activeCategory = cat;
  const firstQ = QUESTIONS.find(q => q.category === cat);
  if (firstQ) {
    selectQuestion(firstQ.id);
  }
}

function selectQuestion(qId) {
  appState.activeQuestionId = qId;
  appState.currentStepIndex = 0;

  const q = QUESTIONS.find(item => item.id === qId);
  if (!q) return;

  renderCategoryButtons();

  // Render Question Header Card
  document.getElementById("qTitle").textContent = q.title;
  document.getElementById("qDesc").textContent = q.desc;
  document.getElementById("qDataValues").textContent = `[ ${q.data.join(", ")} ]`;

  const pill = document.getElementById("qTypePill");
  pill.textContent = q.formulaName;
  pill.className = `type-pill ${q.type}`;

  // Render Dot Plot Canvas Visualizer
  drawDotPlot(q.data);

  // Render Step Wizard Cards
  renderStepWizard(q);
}

function renderStepWizard(q) {
  const wizardContainer = document.getElementById("stepWizardContainer");
  wizardContainer.innerHTML = "";

  q.steps.forEach((step, idx) => {
    const isActive = idx === appState.currentStepIndex;
    const isDone = idx < appState.currentStepIndex;

    const card = document.createElement("div");
    card.className = `step-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`;
    
    card.innerHTML = `
      <div class="step-header">
        <span>${step.label}</span>
        <span>${isDone ? 'COMPLETED ✓' : (isActive ? 'CURRENT' : 'LOCKED')}</span>
      </div>
      <div class="step-input-group">
        <input type="number" step="0.01" id="step-input-${idx}" class="step-input" 
               placeholder="Your answer..." ${!isActive ? 'disabled' : ''} />
        ${isActive ? `<button class="comic-btn primary" onclick="submitStepAnswer(${idx})">CHECK</button>` : ''}
      </div>
      ${isActive ? `
        <div style="margin-top: 8px;">
          <button class="comic-btn hint-btn" onclick="toggleHint(${idx})">💡 HINT</button>
          <div id="hint-box-${idx}" class="hint-box">${step.hint}</div>
        </div>
      ` : ''}
    `;
    wizardContainer.appendChild(card);
  });
}

function toggleHint(idx) {
  const box = document.getElementById(`hint-box-${idx}`);
  if (box) {
    box.style.display = box.style.display === "block" ? "none" : "block";
  }
}

async function submitStepAnswer(stepIdx) {
  const q = QUESTIONS.find(item => item.id === appState.activeQuestionId);
  if (!q) return;

  const inputEl = document.getElementById(`step-input-${stepIdx}`);
  const userVal = parseFloat(inputEl.value);
  const targetVal = q.steps[stepIdx].target;

  if (isNaN(userVal)) {
    alert("Please enter a valid number!");
    return;
  }

  // Allow margin of error (±0.05)
  const isCorrect = Math.abs(userVal - targetVal) <= 0.05;

  if (isCorrect) {
    SoundFX.playSuccess();
    appState.currentStepIndex++;

    if (appState.currentStepIndex >= q.steps.length) {
      // Question Fully Completed!
      triggerConfetti();
      const updated = await StudentTracker.saveQuestionAttempt(q.id, true, appState.currentStepIndex);
      if (updated) appState.userProgress = updated;
      
      updateTopStats();
      renderCategoryButtons();
      
      alert(`🎉 GREAT JOB! Question completed successfully! +100 PTS!`);
      // Auto move or re-render
      selectQuestion(q.id);
    } else {
      renderStepWizard(q);
    }
  } else {
    SoundFX.playError();
    await StudentTracker.saveQuestionAttempt(q.id, false, appState.currentStepIndex);
    inputEl.style.borderColor = "var(--primary)";
    alert("Incorrect! Check the formula hint or recalculate.");
  }
}

// Dot Plot Visualization on Canvas
function drawDotPlot(data) {
  const canvas = document.getElementById("dotPlotCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Handle high resolution canvas sizing
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio || 300;
  canvas.height = rect.height * window.devicePixelRatio || 120;
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const w = rect.width;
  const h = rect.height;

  ctx.clearRect(0, 0, w, h);

  const minVal = Math.min(...data) - 2;
  const maxVal = Math.max(...data) + 2;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;

  // Draw Number Line Axis
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, h - 30);
  ctx.lineTo(w - 30, h - 30);
  ctx.stroke();

  // Scale converter
  const getX = (val) => 30 + ((val - minVal) / (maxVal - minVal)) * (w - 60);

  // Draw Mean Line
  const meanX = getX(mean);
  ctx.strokeStyle = "#ff4757";
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(meanX, 10);
  ctx.lineTo(meanX, h - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Mean Text Label
  ctx.fillStyle = "#ff4757";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(`Mean (${mean.toFixed(1)})`, meanX - 25, 15);

  // Plot Data Dots & Distance Spread Bars
  data.forEach((val) => {
    const x = getX(val);
    const y = h - 45;

    // Draw spread line to mean
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(meanX, y);
    ctx.stroke();

    // Draw Dot
    ctx.fillStyle = "#2ecc71";
    ctx.strokeStyle = "#2f3542";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Value text below axis
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(val, x - 6, h - 10);
  });
}

// Simple Particle Confetti
function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#ff4757", "#2ed573", "#ffa502", "#1e90ff", "#70a1ff"];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.7) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      alpha: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

function setupEventListeners() {
  window.addEventListener("resize", () => {
    const q = QUESTIONS.find(item => item.id === appState.activeQuestionId);
    if (q) drawDotPlot(q.data);
  });
}
