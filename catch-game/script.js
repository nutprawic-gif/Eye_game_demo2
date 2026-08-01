const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

let score = 0;
let gameStarted = false;
let isGameOver = false;

let level = 1;
const maxLevel = 5;

let targetCaught = 0;
let distractorCaught = 0;

let targetSpawned = 0;
let distractorSpawned = 0;

let startTime = 0;
let gameDuration = 10 * 60;

const player = { width: 90, height: 15, x: 0, y: 0, color: '#FFFFFF' };
let blocks = [];

const speedMultiplier = [
    1.0,   // Level 1
    1.2,   // Level 2
    1.4,   // Level 3
    1.6,   // Level 4
    1.8    // Level 5
];

const spawnInterval = [
    1000,
    850,
    700,
    550,
    400
];

//barปรับสีแดง
const slider = document.getElementById("contrast-slider");
const value = document.getElementById("contrast-value");
let contrast = 100;

slider.addEventListener("input", () => {
    contrast = Number(slider.value);
    value.innerText = contrast + "%";

    updatePreview();
});
function getTargetColor() {

    const g = Math.round(150 - (contrast / 100) * 150);
    const b = g;

    return `rgb(200, ${g}, ${b})`;
}
function updatePreview() {

    document.getElementById("target-preview").style.backgroundColor =
        getTargetColor();

    document.getElementById("distractor-preview").style.backgroundColor =
        getDistractorColor();

}

//ปรับbarสีเขียว
const greenSlider = document.getElementById("green-slider");
const greenValue = document.getElementById("green-value");

let greenContrast = 100;


greenSlider.addEventListener("input", () => {

    greenContrast = Number(greenSlider.value);

    greenValue.innerText = greenContrast + "%";

    updatePreview();

});
updatePreview();

function getDistractorColor(){

    const r = Math.round(150 - (greenContrast / 100) * 150);
    const b = r;

    return `rgb(${r},100,${b})`;

}


const accuracyGoal = [
    80, // Level 1 -> 2
    80, // Level 2 -> 3
    85, // Level 3 -> 4
    90, // Level 4 -> 5
    90
];


function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 70;
}

function handleMove(clientX) {
    if (isGameOver) return;
    player.x = clientX - player.width / 2;
    
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

window.addEventListener('touchmove', (e) => {
    handleMove(e.touches[0].clientX);
    e.preventDefault(); 
}, { passive: false });

window.addEventListener('mousemove', (e) => {
    handleMove(e.clientX);
});

let lastSpawnTime = 0;

function manageSpawning(currentTime) {

    const speed = speedMultiplier[level - 1];
    const interval = spawnInterval[level - 1];

    if (currentTime - lastSpawnTime > interval) {

        const type = Math.random() < 0.5 
    ? "target" 
    : "distractor";

     if(type==="target"){
    targetSpawned++;
}
else{
    distractorSpawned++;
}

        blocks.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            size: 30,
            type: type,
            speed: (2 + Math.random()) * speed
        });

        lastSpawnTime = currentTime;
    }
}
function update() {
    if (isGameOver) return;
    const elapsed = (Date.now() - startTime) / 1000;

    for (let i = blocks.length - 1; i >= 0; i--) {
        let b = blocks[i];
        b.y += b.speed;

        if (b.y + b.size > player.y && 
            b.x < player.x + player.width && 
            b.x + b.size > player.x) {
            
           if (b.type === "target") {

    score += 10;
    targetCaught++;

    const accuracy = (targetCaught + distractorCaught) === 0
    ? 0
    : (targetCaught / (targetCaught + distractorCaught)) * 100;
const targetGoal = [
    15,
    25,
    35,
    45,
    60
][level - 1];


if (
    targetCaught >= targetGoal &&
    accuracy >= accuracyGoal[level - 1] &&
    level < maxLevel
) {
    level++;
}

}
else {

    score -= 20;
    distractorCaught++;

}
blocks.splice(i, 1);
continue;
        }

        // ลบเมื่อหลุดจอ
        if (b.y > canvas.height) {
            blocks.splice(i, 1);
        }
    }

   if (elapsed >= gameDuration) {
    isGameOver = true;

    const accuracy = targetSpawned === 0
? 0
: Math.round(
    (targetCaught / targetSpawned) * 100
);
       overlay.style.display = "flex";

document.getElementById("final-level").innerText =
    `Level : ${level}/5`;

document.getElementById("final-score").innerText =
    `Score : ${score}`;

document.getElementById("final-green").innerText =
`Target Caught : ${targetCaught}`;

document.getElementById("final-red").innerText =
`Distractor Caught : ${distractorCaught}`;

document.getElementById("final-accuracy").innerText =
    `TargetAccuracy : ${accuracy}%`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

   blocks.forEach(b => {

    ctx.fillStyle =
        b.type === "target"
            ? getTargetColor()
            : getDistractorColor();

    ctx.fillRect(
        b.x,
        b.y,
        b.size,
        b.size
    );

});
    ctx.fillStyle = "white";

// LEVEL อยู่กึ่งกลางด้านบน
ctx.font = "bold 28px sans-serif";
ctx.textAlign = "center";
ctx.fillText(`LEVEL ${level}`, canvas.width / 2, 50);

// SCORE อยู่ด้านขวา
ctx.font = "bold 24px sans-serif";
ctx.textAlign = "right";
ctx.fillText(`Score: ${score}`, canvas.width - 20, 50);

    
   let timeLeft;

if (!gameStarted) {
    timeLeft = gameDuration;
} else {
    timeLeft = Math.max(
        0,
        gameDuration - (Date.now() - startTime) / 1000
    );
}
    let m = Math.floor(timeLeft / 60);
    let s = Math.floor(timeLeft % 60);
    ctx.fillText(`Time: ${m}:${s < 10 ? '0'+s : s}`,canvas.width -20, 85);
}


function loop(currentTime) {

    if (!gameStarted) {

        requestAnimationFrame(loop);

        return;

    }

    manageSpawning(currentTime);

    update();

    draw();

    if (!isGameOver)

        requestAnimationFrame(loop);

}
init();

window.addEventListener("resize", init);

// วาดหน้าจอครั้งแรก
//draw();

document.getElementById("start-btn").addEventListener("click", () => {

    document.getElementById("start-popup").style.display = "none";

    startTime = Date.now();

    gameStarted = true;

    requestAnimationFrame(loop);

});

document.getElementById("restart-btn").addEventListener("click", () => {
    location.reload();
});

document.getElementById("home-btn").addEventListener("click", () => {
    window.location.href = "../index.html";
});
