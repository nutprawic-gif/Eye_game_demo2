const holes = document.querySelectorAll('.hole');
const hitsDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const statusMsg = document.getElementById('status-msg');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');

let score = 0;

let level = 1;

let greenSpawned = 0;
let redSpawned = 0;

let greenHits = 0;
let redHits = 0;

let mistakes = 0; // ถ้ายังใช้ระบบหัวใจ
let isGameOver = false;

let gameInterval;
let countdownInterval;

let gameDuration = 10 * 60;
let timeLeft = gameDuration;

// Difficulty
let spawnInterval = 3000;
let moleLifetime = 5000; //ตุ่นค้างไว้5s

const redLevels = [
    "#ffd6d6", // Level 1
    "#ffb0b0", // Level 2
    "#ff8a8a", // Level 3
    "#ff4d4d", // Level 4
    "#ff0000"  // Level 5
];


function init() {
 console.log("holes =", holes.length);

    clearInterval(gameInterval);
    clearInterval(countdownInterval);

    hitsDisplay.innerText = score;
    
    updateLives();
    timerDisplay.innerText = "10:00";

    updateDifficulty();

    countdownInterval = setInterval(() => {

        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerDisplay.innerText =
            `${minutes}:${seconds.toString().padStart(2,'0')}`;

        if (timeLeft <= 0) {
            endGame("TIME UP!");
        }

    },1000);

}

function updateDifficulty(){

    level = Math.min(5, Math.floor(greenHits/30)+1);
    //การเกิดของตุ่น
    spawnInterval = [
        5000,
        4000,
        3000,
        2000,
        1000
    ][level-1];


    moleLifetime = [
       5000, // Level 1
       4000, // Level 2
       3000, // Level 3
       2000, // Level 4
       1000  // Level 5
    ][level-1];


    contrastGap = [
        35,
        25,
        18,
        12,
        5
    ][level-1];


    clearInterval(gameInterval);

    gameInterval = setInterval(checkAllHoles, spawnInterval);


    levelDisplay.innerText =
        "Level " + level;
}
function checkAllHoles(){

    if(isGameOver) return;

    holes.forEach(hole=>{

        if(!hole.querySelector(".mole")){

            createMoleInHole(hole);

        }

    });

}

function createMoleInHole(targetHole){

   const mole = document.createElement("div");

mole.classList.add("mole");

const isGreen = Math.random() < 0.3;

mole.dataset.type = isGreen ? "green" : "red";

if (isGreen) {

    greenSpawned++;

    // สีเขียวคงที่ทุก Level
    mole.style.backgroundColor = "#00e676";

} else {

    redSpawned++;

    // สีแดงเปลี่ยนตาม Level
    mole.style.backgroundColor =
        redLevels[level - 1];

}
    targetHole.appendChild(mole);

    setTimeout(()=>{

        mole.classList.add("active");

    },300);

    setTimeout(()=>{

        if(mole.parentNode){

            mole.classList.remove("active");

            setTimeout(()=>{

                mole.remove();

            },150);

        }

    },moleLifetime);

}

holes.forEach(hole=>{

    hole.addEventListener("mousedown",handleWhack);

    hole.addEventListener("touchstart",(e)=>{

        e.preventDefault();

        handleWhack.call(hole);

    });

});

function handleWhack(){

    if(isGameOver) return;

    const mole=this.querySelector(".mole.active");

    if(!mole){

        mistakes++;

        updateLives();

        if(mistakes>=3){

            endGame("GAME OVER");

        }

        return;

    }

   if (mole.dataset.type === "green") {

    greenHits++;

    score += 10;

} else {

    redHits++;

    score -= 20;

}

hitsDisplay.innerText = score;

mole.remove();

updateDifficulty();

}

function updateLives(){

    livesDisplay.innerHTML = "❤️".repeat(3-mistakes);

}

function endGame(msg){

    isGameOver = true;

    clearInterval(gameInterval);

    clearInterval(countdownInterval);

    statusMsg.innerText = msg;

   // คำนวณ Target Detection
    const detection = greenSpawned === 0
        ? 0
        : Math.round(
            (greenHits / greenSpawned) * 100
        );


    // แสดงผลสรุป
    document.getElementById("final-level").innerText =
        `Level : ${level}`;

    document.getElementById("final-score").innerText =
        `Score : ${score}`;

    document.getElementById("final-green").innerText =
        `Green Hits : ${greenHits}`;

    document.getElementById("final-red").innerText =
        `Red Hits : ${redHits}`;

    document.getElementById("final-accuracy").innerText =
        `Target Detection : ${detection}%`;

    overlay.style.display = "flex";

}
//กดstart ก่อนเริ่มเกมส์
document.getElementById("start-btn")
.addEventListener("click",()=>{

    document.getElementById("start-popup").style.display="none";

    score = 0;
    level = 1;

    greenSpawned = 0;
    redSpawned = 0;

    greenHits = 0;
    redHits = 0;

    mistakes = 0;

    timeLeft = gameDuration;

    isGameOver = false;

    init();

    checkAllHoles();

});

document.getElementById("restart-btn").addEventListener("click", () => {

    location.reload();

});
document.getElementById("home-btn").addEventListener("click", () => {

    window.location.href = "../index.html";

});
