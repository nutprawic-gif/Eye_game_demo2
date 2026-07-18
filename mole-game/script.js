const holes = document.querySelectorAll('.hole');
const hitsDisplay = document.getElementById('hits');
const livesDisplay = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const statusMsg = document.getElementById('status-msg');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');

let hits = 0;
let mistakes = 0;
let isGameOver = false;

let gameInterval;
let countdownInterval;

let gameDuration = 10 * 60;
let timeLeft = gameDuration;

// Difficulty
let spawnInterval = 3000;
let moleLifetime = 3000;
let contrastGap = 35;
let baseLightness = 50;

function init() {

    hitsDisplay.innerText = hits;
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

    spawnInterval = Math.max(700,3000-hits*40);

    moleLifetime = Math.max(700,3000-hits*25);

    contrastGap = Math.max(5,35-hits*0.5);

    clearInterval(gameInterval);

    gameInterval = setInterval(checkAllHoles,spawnInterval);

    const level = Math.floor(hits/10)+1;

    levelDisplay.innerText = "Level " + level;

}

function checkAllHoles(){

    if(isGameOver) return;

    holes.forEach(hole=>{

        if(!hole.querySelector(".mole") && Math.random()<0.45){

            createMoleInHole(hole);

        }

    });

}

function createMoleInHole(targetHole){

    const mole=document.createElement("div");

    mole.classList.add("mole");

    const moleLightness = baseLightness + contrastGap;

    mole.style.backgroundColor =
        `hsl(120,70%,${moleLightness}%)`;

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

    hits++;

    hitsDisplay.innerText = hits;

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

    overlay.style.display = "flex";

    setTimeout(()=>{

        window.location.href="../index.html";

    },3000);

}

init();
