const holes = document.querySelectorAll(".hole");

const hitsDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const overlay = document.getElementById("overlay");
const statusMsg = document.getElementById("status-msg");
const timerDisplay = document.getElementById("timer");
const levelDisplay = document.getElementById("level");

const startPopup = document.getElementById("start-popup");
const startBtn = document.getElementById("start-btn");

const restartBtn = document.getElementById("restart-btn");
const homeBtn = document.getElementById("home-btn");

const contrastSlider = document.getElementById("contrast-slider");
const greenSlider = document.getElementById("green-slider");

const contrastValue = document.getElementById("contrast-value");
const greenValue = document.getElementById("green-value");

const targetPreview = document.getElementById("target-preview");
const distractorPreview = document.getElementById("distractor-preview");


/* =========================
   Game Variables
========================= */

let score = 0;

let level = 1;

let targetSpawned = 0;
let distractorSpawned = 0;

let targetCaught = 0;
let distractorCaught = 0;

let targetMissed = 0;   
let mistakes = 0;

let isGameOver = false;

let gameInterval;
let countdownInterval;

const gameDuration = 10 * 60;
let timeLeft = gameDuration;


/* =========================
   Training Settings
========================= */

let selectedEye = "right";

let targetContrast = 100;
let distractorContrast = 100;


/* =========================
   Difficulty
========================= */

let spawnInterval = 5000;
let moleLifetime = 5000;
let isLevelTransition = false;
let transitionTimeout;


/* สีแดง Target */
const redColor = {
    r: 255,
    g: 0,
    b: 0
}
/* สีเขียว Distractor */
const greenColor = {
    r: 0,
    g: 180,
    b: 70
};


/* =========================
   Level Difficulty
========================= */

function updateDifficulty() {

    
    /* Spawn interval */

    spawnInterval = [
        6000,
        5500,
        5000,
        4500,
        4000
    ][level - 1];


    /* Mole lifetime */

    moleLifetime = [
        6000,
        5500,
        5000,
        4500,
        4000
    ][level - 1];


    clearInterval(gameInterval);

    gameInterval = setInterval(
        checkAllHoles,
        spawnInterval
    );


    levelDisplay.innerText =
        "Level " + level;
}


/* =========================
   Start / Init
========================= */

function init() {

    clearInterval(gameInterval);
    clearInterval(countdownInterval);


    hitsDisplay.innerText = score;

    updateLives();

    updateTimer();

    updateDifficulty();


    countdownInterval = setInterval(() => {

        if (isGameOver) return;

        timeLeft--;

        updateTimer();


        if (timeLeft <= 0) {

            endGame("TIME UP!");

        }

    }, 1000);
}


/* =========================
   Timer
========================= */

function updateTimer() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;


    timerDisplay.innerText =
        `Time: ${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
}


/* =========================
   Spawn Mole
========================= */

function checkAllHoles() {

    if (isGameOver) return;

    holes.forEach(hole => {

        if (hole.querySelector(".mole")) {
            return;
        }

        // =====================================
        // Level 4-5
        // จำกัด Target สีแดงสูงสุด 3 ตัว
        // =====================================

        if (level >= 4) {

            const currentTargets =
                document.querySelectorAll(
                    '.mole[data-type="target"]'
                ).length;

            if (currentTargets >= 3) {

                createMoleInHole(
                    hole,
                    "distractor"
                );

                return;
            }
        }

        createMoleInHole(hole);

    });
}


/* =========================
   Create Mole
========================= */

function createMoleInHole( targetHole,forcedType = null) 
{

    if (isGameOver) return;


    const mole =
        document.createElement("div");


    mole.classList.add("mole");


    /*
        30% = Target สีแดง
        70% = Distractor สีเขียว
    */

    const isTarget =
    forcedType
        ? forcedType === "target"
        : Math.random() < 0.3;


    mole.dataset.type =
        isTarget
            ? "target"
            : "distractor";


    /* =========================
       Target
    ========================== */

    if (isTarget) {

        targetSpawned++;


        mole.style.backgroundColor =
            getTargetColor();

    }


    /* =========================
       Distractor
    ========================== */

    else {

        distractorSpawned++;


        mole.style.backgroundColor =
            getDistractorColor();

    }


    targetHole.appendChild(mole);


    /*
        Animation โผล่ขึ้นมา
    */

    setTimeout(() => {

        if (!mole.parentNode) return;

        mole.classList.add("active");

    }, 100);


    /*
        ตัวตุ่นอยู่ตามเวลาของ Level
    */

   setTimeout(() => {

    /*
        ถ้าตุ่นถูกกดไปแล้ว
        หรือถูกลบตอนเปลี่ยน Level
        จะไม่มี parentNode
        จึงไม่ถือว่าพลาด
    */

    if (!mole.parentNode) return;


    /*
        ถ้าเป็น Target สีแดง
        และหมดเวลาโดยไม่ได้กด
        = Target Missed
    */

    if (mole.dataset.type === "target") {

        targetMissed++;

    }


    mole.classList.remove("active");


    setTimeout(() => {

        if (mole.parentNode) {

            mole.remove();

        }

    }, 150);


}, moleLifetime);

}
// =====================================================
// TARGET COLOR (RED)
// ใช้สูตรเดียวกับ Catch Game
// =====================================================

function getTargetColor() {

    const r =
        Math.round(
            30 +
            (targetContrast / 100) * 225
        );

    return `rgb(${r},0,0)`;
}


// =====================================================
// DISTRACTOR COLOR (GREEN)
// =====================================================

function getDistractorColor() {

    const g =
        Math.round(
            30 +
            (distractorContrast / 100) * 225
        );

    return `rgb(0,${g},0)`;
}

function rgbToString(rgb) {

    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/* =========================
   Whack
========================= */

function handleWhack() {

    if (isGameOver || isLevelTransition) return;


    const mole =
        this.querySelector(".mole.active");


    /* =========================
       กดพื้นที่ว่าง
    ========================= */

   if (!mole) {

    mistakes++;

    updateLives();

    if (mistakes >= 3) {
        endGame("GAME OVER");
        return;
    }

    return;
}


    /* =========================
       Target
    ========================= */

    if (mole.dataset.type === "target") {

        targetCaught++;

        score += 10;

    }

    /* =========================
       Distractor
    ========================= */

    else {

        distractorCaught++;

        score -= 20;

    }


    hitsDisplay.innerText = score;

    mole.remove();


    /* =========================
       Check Level Up
    ========================= */

    let nextLevel = level;

    if (targetCaught >= 75) {
        nextLevel = 5;
    }
    else if (targetCaught >= 60) {
        nextLevel = 4;
    }
    else if (targetCaught >= 45) {
        nextLevel = 3;
    }
    else if (targetCaught >= 30) {
        nextLevel = 2;
    }


    if (nextLevel > level) {

        startLevelTransition(nextLevel);

        return;
    }


    updateDifficulty();
}

/* =========================
   Lives
========================= */

function updateLives() {

    const remaining =
        Math.max(
            0,
            3 - mistakes
        );


    livesDisplay.innerHTML =
        "❤️".repeat(remaining);
}


/* =========================
   Game Over
========================= */

function endGame(msg) {

    // หยุดเกมทันที
    isGameOver = true;

    clearInterval(gameInterval);
    clearInterval(countdownInterval);

    statusMsg.innerText = msg;

    const detection =
        targetSpawned === 0
            ? 0
            : Math.round(
                (targetCaught / targetSpawned) * 100
            );

    document.getElementById("final-level").innerText =
        `Level : ${level}/5`;

    document.getElementById("final-score").innerText =
        `Score : ${score}`;

    document.getElementById("final-green").innerText =
        `Target Caught : ${targetCaught}`;

    document.getElementById("final-missed").innerText =
        `Target Missed : ${targetMissed}`;

    document.getElementById("final-red").innerText =
        `Distractor Caught : ${distractorCaught}`;

    document.getElementById("final-accuracy").innerText =
        `Target Detection : ${detection}%`;

    // แสดงหน้าสรุป
    overlay.style.display = "flex";
}


/* =========================
   Start Game
========================= */

startBtn.addEventListener(
    "click",
    () => {

        startPopup.style.display =
            "none";


        overlay.style.display =
            "none";


        /*
            Reset Game
        */

        score = 0;

        level = 1;

        targetSpawned = 0;
        distractorSpawned = 0;

        targetCaught = 0;
        distractorCaught = 0;

        targetMissed = 0;
        mistakes = 0;

        timeLeft = gameDuration;

        isGameOver = false;


        /*
            อ่านค่าตาการฝึก
        */

        const selected =
            document.querySelector(
                'input[name="eye"]:checked'
            );


        if (selected) {

            selectedEye =
                selected.value;

        }


        /*
            เริ่มเกม
        */

        init();

        checkAllHoles();

    }
);


/* =========================
   Eye Selection
========================= */

document
    .querySelectorAll(
        'input[name="eye"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                selectedEye =
                    radio.value;

            }
        );

    });


/* =========================
   Red Slider
========================= */

if (contrastSlider) {

    contrastSlider.addEventListener(
        "input",
        () => {

            targetContrast =
                Number(
                    contrastSlider.value
                );


            contrastValue.innerText =
                `${targetContrast}%`;


            updatePreview();

        }
    );

}

/* =========================
   Level Countdown
========================= */

let levelCountdown = document.createElement("div");

levelCountdown.id = "level-countdown";

levelCountdown.style.position = "fixed";
levelCountdown.style.top = "0";
levelCountdown.style.left = "0";
levelCountdown.style.width = "100%";
levelCountdown.style.height = "100%";

levelCountdown.style.display = "none";
levelCountdown.style.alignItems = "center";
levelCountdown.style.justifyContent = "center";

levelCountdown.style.background = "rgba(0,0,0,0.75)";
levelCountdown.style.zIndex = "9999";

levelCountdown.style.fontSize = "80px";
levelCountdown.style.fontWeight = "bold";
levelCountdown.style.color = "white";

document.body.appendChild(levelCountdown);
/* =========================
   Level Transition
========================= */

function startLevelTransition(nextLevel) {

    isLevelTransition = true;

    clearInterval(gameInterval);

    /* =========================
       เอาตุ่นที่เหลือออก
    ========================= */

    holes.forEach(hole => {

        const mole = hole.querySelector(".mole");

        if (mole) {
            mole.remove();
        }

    });


    /* =========================
       แสดง Level ใหม่
    ========================= */

    level = nextLevel;

    levelDisplay.innerText =
        "Level " + level;


    /* =========================
       แสดง Countdown
       Level 2
       3
       2
       1
    ========================= */

    levelCountdown.style.display = "flex";


    /* แสดง Level 2 */

    levelCountdown.innerText =
        `Level ${nextLevel}`;


    /* หลังจาก 1 วินาที → 3 */

    transitionTimeout = setTimeout(() => {

        levelCountdown.innerText = "3";


        /* หลังจากอีก 1 วินาที → 2 */

        transitionTimeout = setTimeout(() => {

            levelCountdown.innerText = "2";


            /* หลังจากอีก 1 วินาที → 1 */

            transitionTimeout = setTimeout(() => {

                levelCountdown.innerText = "1";


                /* หลังจากอีก 1 วินาที → เริ่มเกม */

                transitionTimeout = setTimeout(() => {

                    levelCountdown.style.display = "none";

                    isLevelTransition = false;


                    /* ตั้งค่าความยากของ Level ใหม่ */

                    updateDifficulty();


                    /* สร้างตุ่น */

                    checkAllHoles();

                }, 1000);

            }, 1000);

        }, 1000);

    }, 1000);
}

/* =========================
   Green Slider
========================= */

if (greenSlider) {

    greenSlider.addEventListener(
        "input",
        () => {

            distractorContrast =
                Number(
                    greenSlider.value
                );


            greenValue.innerText =
                `${distractorContrast}%`;


            updatePreview();

        }
    );

}


/* =========================
   Preview
========================= */

function updatePreview() {

    if (targetPreview) {

        targetPreview.style
            .backgroundColor =
            getTargetColor();

    }


    if (distractorPreview) {

        distractorPreview.style
            .backgroundColor =
            getDistractorColor();

    }
}


/* =========================
   Initial Preview
========================= */

if (contrastSlider) {

    targetContrast =
        Number(
            contrastSlider.value
        );

}


if (greenSlider) {

    distractorContrast =
        Number(
            greenSlider.value
        );

}


if (contrastValue) {

    contrastValue.innerText =
        `${targetContrast}%`;

}


if (greenValue) {

    greenValue.innerText =
        `${distractorContrast}%`;

}


updatePreview();


/* =========================
   Hole Events
========================= */

holes.forEach(hole => {

    hole.addEventListener(
        "mousedown",
        handleWhack
    );


    hole.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            handleWhack.call(hole);

        },
        { passive: false }
    );

});


/* =========================
   Restart
========================= */

restartBtn.addEventListener(
    "click",
    () => {

        location.reload();

    }
);


/* =========================
   Main Menu
========================= */

homeBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "../index.html";

    }
);
