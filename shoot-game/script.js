const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const overlay = document.getElementById('overlay');
const startPopup = document.getElementById('start-popup');
const startBtn = document.getElementById('start-btn');
const statusMsg = document.getElementById('status-msg');
const finalScoreMsg = document.getElementById('final-score');
const TOP_MARGIN = 90;

let gameStarted = false;
let score = 0;
let combo = 1;
// =========================
// Training Settings
// =========================

let targetContrast = 100;
let distractorContrast = 100;

const contrastSlider = document.getElementById("contrast-slider");
const greenSlider = document.getElementById("green-slider");

const contrastValue = document.getElementById("contrast-value");
const greenValue = document.getElementById("green-value");

const targetPreview = document.getElementById("target-preview");
const distractorPreview = document.getElementById("distractor-preview");
let maxCombo = 1;

let timeLeft = 600;
let isGameOver = false;

let level = 1;

let targetSpawned = 0;
let targetCaught = 0;
let targetMissed = 0;

let distractorSpawned = 0;
let distractorCaught = 0;

let targets = [];
let particles = [];

let lastTime = Date.now();

const TARGETS_PER_LEVEL = 15;
const MAX_LEVEL = 5;

const SPAWN_DELAY = 1.5;

let redSpawnCooldown = 0;
let greenSpawnCooldown = 0;
// =========================
// Red Target
// =========================

function getTargetColor() {

    const r = Math.round(
        30 + (targetContrast / 100) * 225
    );

    return `rgb(${r}, 0, 0)`;
}


// =========================
// Green Distractor
// =========================

function getDistractorColor() {

    const g = Math.round(
        30 + (distractorContrast / 100) * 225
    );

    return `rgb(0, ${g}, 0)`;
}

// =========================
// Slider
// =========================

contrastSlider.addEventListener("input", () => {

    targetContrast =
        Number(contrastSlider.value);

    contrastValue.innerText =
        `${targetContrast}%`;

    targetPreview.style.backgroundColor =
        getTargetColor();
});


greenSlider.addEventListener("input", () => {

    distractorContrast =
        Number(greenSlider.value);

    greenValue.innerText =
        `${distractorContrast}%`;

    distractorPreview.style.backgroundColor =
        getDistractorColor();
});

class Target {
    constructor(type) {
        this.type = type;
        this.radius = Math.random() * (50 - 30) + 30;

        let speedBase;

if (type === 'good') {
    // 🔴 Target
    speedBase = [
        3,
        5,
        7,
        9,
        11
    ][level - 1];

} else {
    // 🟢 Distractor
    speedBase = 2;
}

        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = Math.random() * (canvas.height - TOP_MARGIN - this.radius * 2) + TOP_MARGIN + this.radius;

        this.vx = (Math.random() - 0.5) * speedBase;
        this.vy = (Math.random() - 0.5) * speedBase;

        this.color =
    (type === 'good')
        ? getTargetColor()
        : getDistractorColor();
        this.life = Math.random() * 2 + 8;
    }

    update(dt) {
        this.x += this.vx * dt * 45;
        this.y += this.vy * dt * 45;
        this.life -= dt;

        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
        if (this.y - this.radius < TOP_MARGIN || this.y + this.radius > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.min(1, this.life * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.alpha = 1;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.alpha -= 0.02;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function spawnTarget(type) {

    const tType =
        type || (Math.random() > 0.5 ? 'good' : 'bad');

    targets.push(new Target(tType));

    if (tType === 'good') {

        targetSpawned++;

    } else {

        distractorSpawned++;

    }
}

function maintainTargets(dt) {

    redSpawnCooldown -= dt;
    greenSpawnCooldown -= dt;

    const redCount =
        targets.filter(t => t.type === 'good').length;

    const greenCount =
        targets.filter(t => t.type === 'bad').length;


    // =========================
    // 🔴 RED
    // =========================

    // ถ้าแดงหมด → เกิดแดง 3 ตัวพร้อมกัน
    if (redCount === 0 && redSpawnCooldown <= 0) {

        spawnTarget('good');
        spawnTarget('good');
        spawnTarget('good');

        redSpawnCooldown = SPAWN_DELAY;
    }


    // =========================
    // 🟢 GREEN
    // =========================

    // ถ้าเขียวหายไป → เกิดใหม่ทีละ 1 ตัว
    if (greenCount < 3 && greenSpawnCooldown <= 0) {

        spawnTarget('bad');

        greenSpawnCooldown = SPAWN_DELAY;
    }
}
function handleInput(ex, ey) {

    if (isGameOver) return;

    let hit = false;

    for (let i = targets.length - 1; i >= 0; i--) {

        const t = targets[i];

        const dist = Math.hypot(
            ex - t.x,
            ey - t.y
        );

        if (dist < t.radius) {

            hit = true;

            createParticles(
                t.x,
                t.y,
                t.color
            );

            // =========================
            // 🔴 RED = TARGET
            // =========================

            if (t.type === 'good') {

                targetCaught++;

                score += 10 * combo;

                combo++;

                if (combo > maxCombo) {
                    maxCombo = combo;
                }

                updateLevel();

                // ลบแดงที่ยิง
                targets.splice(i, 1);

                // นับแดงที่เหลือ
                const redCount =
                    targets.filter(t => t.type === 'good').length;

                // ถ้าแดงหมด → รอ 1.5 วิ
                // แล้วเกิดแดง 3 ตัวพร้อมกัน
                if (redCount === 0) {
                    redSpawnCooldown = SPAWN_DELAY;
                }

            }

            // =========================
            // 🟢 GREEN = DISTRACTOR
            // =========================

            else {

                distractorCaught++;

                combo = 1;

                // ลบเขียวที่ยิง
                targets.splice(i, 1);

                // รอ 1.5 วิ
                // แล้วเกิดเขียวใหม่ 1 ตัว
                greenSpawnCooldown = SPAWN_DELAY;
            }

            break;
        }
    }

    // =========================
    // ยิงไม่โดน
    // =========================

    if (!hit) {
        combo = 1;
    }

    updateUI();
}


function createParticles(x, y, color) {
    for (let i = 0; i < 12; i++) particles.push(new Particle(x, y, color));
}

function updateLevel() {

    level = Math.min(
        MAX_LEVEL,
        Math.floor(targetCaught / TARGETS_PER_LEVEL) + 1
    );

    if (levelDisplay) {

        levelDisplay.innerText =
            `Level ${level}`;

    }
}

function updateUI() {

    scoreDisplay.innerText = score;

    comboDisplay.innerText = combo;

    if (levelDisplay) {

        levelDisplay.innerText =
            `Level ${level}`;

    }
}

canvas.addEventListener('mousedown', e => {
    handleInput(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

function update() {
    if (isGameOver) return;
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    timeLeft -= dt;
    let mins = Math.floor(timeLeft / 60);
    let secs = Math.floor(timeLeft % 60);
    timeDisplay.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;

   if (timeLeft <= 0) {

    isGameOver = true;

    statusMsg.innerText = "TIME UP!";

    // =========================
    // Accuracy
    // =========================
    // 🔴 Target Caught = ถูก
    // 🔴 Target Missed = ผิด
    // 🟢 Distractor Caught = ผิด
    // 🟢 Distractor ที่ไม่ยิง = ไม่คิด

    const totalAttempts =
        targetCaught +
        targetMissed +
        distractorCaught;

    const detection =
        totalAttempts === 0
            ? 0
            : Math.round(
                (targetCaught / totalAttempts) * 100
            );

    document.getElementById('final-level').innerText =
        `Level : ${level}/5`;

    document.getElementById('final-score').innerText =
        `Score : ${score}`;

    document.getElementById('final-target').innerText =
        `Target Caught : ${targetCaught}`;
        
    document.getElementById('final-target-missed').innerText =
    `Target Missed : ${targetMissed}`;

    document.getElementById('final-distractor').innerText =
        `Distractor Caught : ${distractorCaught}`;

    document.getElementById('final-accuracy').innerText =
        `Target Detection : ${detection}%`;

    document.getElementById('final-combo').innerText =
        `Max Combo : ${maxCombo}`;

    overlay.style.display = 'flex';
}

    for (let i = targets.length - 1; i >= 0; i--) {

    targets[i].update(dt);

    if (targets[i].life <= 0) {

        // ถ้าเป็น Target สีแดง
        // และหมดเวลาโดยไม่ได้กด
        // = Target Missed
        if (targets[i].type === 'good') {
            targetMissed++;
        }

        targets.splice(i, 1);
    }
}
    
    maintainTargets(dt);

    particles.forEach((p, index) => {
        p.update();
        if (p.alpha <= 0) particles.splice(index, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => p.draw());
    targets.forEach(t => t.draw());
}

function loop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(loop);
}

function startGame() {

    gameStarted = true;

    startPopup.style.display = 'none';

    score = 0;
    combo = 1;
    maxCombo = 1;

    level = 1;

    targetSpawned = 0;
    targetCaught = 0;
    targetMissed = 0;

    distractorSpawned = 0;
    distractorCaught = 0;

    timeLeft = 600;

    isGameOver = false;

    targets = [];
    particles = [];

    lastTime = Date.now();

    updateUI();

    init();

    // =========================
    // สร้างเป้าชุดแรกพร้อมกัน
    // 🔴 แดง 3 ตัว
    // 🟢 เขียว 3 ตัว
    // =========================

    for (let i = 0; i < 3; i++) {
        spawnTarget('good');
    }

    for (let i = 0; i < 3; i++) {
        spawnTarget('bad');
    }

    // ไม่มีการรอในตอนเริ่มเกม
    redSpawnCooldown = 0;
    greenSpawnCooldown = 0;

    requestAnimationFrame(loop);
}

// =========================
// Initial Training Settings
// =========================

targetContrast = Number(contrastSlider.value);
distractorContrast = Number(greenSlider.value);

contrastValue.innerText = `${targetContrast}%`;
greenValue.innerText = `${distractorContrast}%`;

targetPreview.style.backgroundColor =
    getTargetColor();

distractorPreview.style.backgroundColor =
    getDistractorColor();

startBtn.addEventListener('click', startGame);

window.addEventListener('resize', () => {

    if (gameStarted) {
        init();
    }

});
