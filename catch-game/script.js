const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

let score = 0;
let gameStarted = false;
let isGameOver = false;

let level = 1;
const maxLevel = 5;


// =====================================================
// LEVEL TRANSITION
// =====================================================

let isLevelTransition = false;
let transitionLevel = 1;
let transitionEndTime = 0;

const transitionDuration = 3000; // 3 วินาที
const startMessageDuration = 1500; // "เริ่ม!" ค้าง 1.5 วินาที


// =====================================================
// SCORE / STATISTICS
// =====================================================

// รวมทั้งเกม
let targetCaught = 0;
let distractorCaught = 0;

let targetSpawned = 0;
let distractorSpawned = 0;

// เฉพาะ Level ปัจจุบัน
let levelTargetCaught = 0;
let levelTargetSpawned = 0;

let levelDistractorCaught = 0;
let levelDistractorSpawned = 0;

// =====================================================
// GAME TIME
// =====================================================

let startTime = 0;

const gameDuration = 10 * 60;


// =====================================================
// PLAYER
// =====================================================

const player = {

    width: 90,
    height: 15,

    x: 0,
    y: 0,

    color: '#FFFFFF'

};


let blocks = [];


// =====================================================
// LEVEL SPEED
// =====================================================

const speedMultiplier = [

    1.0,   // Level 1 - ช้าที่สุด
    1.2,   // Level 2
    1.5,   // Level 3
    2.0,   // Level 4
    3.0    // Level 5 - เร็วที่สุด

];


// =====================================================
// SPAWN INTERVAL
// =====================================================

const spawnInterval = [

      3500,  // Level 1
    3200,  // Level 2
    3000,  // Level 3
    2500,  // Level 4
    2200   // Level 5

];


// =====================================================
// TARGET / DISTRACTOR PATTERN
// =====================================================

// แดงประมาณ 70%
// เขียวประมาณ 30%

const spawnPattern = [

    "target",
    "target",
    "distractor",
    "target",
    "target",
    "distractor",
    "target",
    "target",
    "target",
    "distractor"

];

let patternIndex = 0;


function getNextType() {

    const type =
        spawnPattern[patternIndex];

    patternIndex++;

    if (
        patternIndex >=
        spawnPattern.length
    ) {

        patternIndex = 0;

    }

    return type;

}


// =====================================================
// RED CONTRAST
// =====================================================

const slider =
    document.getElementById(
        "contrast-slider"
    );

const value =
    document.getElementById(
        "contrast-value"
    );

let contrast = 100;


slider.addEventListener(
    "input",
    () => {

        contrast =
            Number(
                slider.value
            );

        value.innerText =
            contrast + "%";

        updatePreview();

    }
);


function getTargetColor() {

    const r =
        Math.round(
            30 +
            (contrast / 100) *
            225
        );

    return `rgb(${r},0,0)`;

}


// =====================================================
// GREEN CONTRAST
// =====================================================

const greenSlider =
    document.getElementById(
        "green-slider"
    );

const greenValue =
    document.getElementById(
        "green-value"
    );

let greenContrast = 100;


greenSlider.addEventListener(
    "input",
    () => {

        greenContrast =
            Number(
                greenSlider.value
            );

        greenValue.innerText =
            greenContrast + "%";

        updatePreview();

    }
);


function getDistractorColor() {

    const g =
        Math.round(
            30 +
            (greenContrast / 100) *
            225
        );

    return `rgb(0,${g},0)`;

}


// =====================================================
// PREVIEW
// =====================================================

function updatePreview() {

    document.getElementById(
        "target-preview"
    ).style.backgroundColor =
        getTargetColor();


    document.getElementById(
        "distractor-preview"
    ).style.backgroundColor =
        getDistractorColor();

}


updatePreview();

// =====================================================
// INIT
// =====================================================

function init() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    player.x =
        canvas.width / 2 -
        player.width / 2;


    player.y =
        canvas.height - 70;

}


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function handleMove(clientX) {

    if (isGameOver) {
        return;
    }


    player.x =
        clientX -
        player.width / 2;


    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.x >
        canvas.width -
        player.width
    ) {

        player.x =
            canvas.width -
            player.width;

    }

}


// =====================================================
// TOUCH MOVE
// =====================================================

window.addEventListener(
    'touchmove',
    (e) => {

        // ถ้ากำลังลาก Slider
        // ไม่ควบคุมเกม

        if (
            e.target.type ===
            "range"
        ) {

            return;

        }


        handleMove(
            e.touches[0].clientX
        );


        e.preventDefault();

    },
    {
        passive: false
    }
);


// =====================================================
// TOUCH START
// =====================================================

canvas.addEventListener(
    'touchstart',
    (e) => {

        if (
            isGameOver ||
            !gameStarted
        ) {

            return;

        }


        handleMove(
            e.touches[0].clientX
        );

    },
    {
        passive: true
    }
);


// =====================================================
// MOUSE
// =====================================================

window.addEventListener(
    'mousemove',
    (e) => {

        handleMove(
            e.clientX
        );

    }
);


// =====================================================
// LEVEL TRANSITION
// =====================================================

function startLevelTransition(nextLevel) {

    if (nextLevel > maxLevel) {
        return;
    }

    console.log("LEVEL TRANSITION →", nextLevel);

    // เปลี่ยน Level
    level = nextLevel;

    // เปิดโหมดพัก
    isLevelTransition = true;

    transitionLevel = nextLevel;

    // 3 วินาที
    transitionEndTime =
    Date.now()+transitionDuration+startMessageDuration;

    // =========================================
    // หยุดตุ่นทั้งหมดทันที
    // =========================================

    blocks = [];

    // =========================================
    // เริ่ม pattern ใหม่
    // =========================================

    patternIndex = 0;

   // =========================================
   // reset สถิติของ level ใหม่
   // =========================================

    levelTargetCaught = 0;
    levelTargetSpawned = 0;

    levelDistractorCaught = 0;
    levelDistractorSpawned = 0;
    // =========================================
    // ห้าม spawn ทันที
    // =========================================

    lastSpawnTime = performance.now();

}


// =====================================================
// SPAWNING
// =====================================================

let lastSpawnTime = 0;


function manageSpawning(
    currentTime
) {

    const speed =
        speedMultiplier[
            level - 1
        ];


    const interval =
        spawnInterval[
            level - 1
        ];


    if (
        currentTime -
        lastSpawnTime >
        interval
    ) {


        // ใช้ Pattern
        // แทนการสุ่ม

        const type =
            getNextType();


        // ==============================
        // TARGET
        // ==============================

        if (
            type ===
            "target"
        ) {

            targetSpawned++;

            levelTargetSpawned++;

        }


        // ==============================
        // DISTRACTOR
        // ==============================

       else {

    distractorSpawned++;

    // นับเขียวที่เกิดใน Level นี้
    levelDistractorSpawned++;

}


        // ==============================
        // CREATE BLOCK
        // ==============================

       blocks.push({

    x:
        Math.random() *
        (
            canvas.width -
            30
        ),

    y: -30,

    size: 30,

    type: type,

    speed: 2 * speed

});

        lastSpawnTime =
            currentTime;

    }

}


// =====================================================
// UPDATE
// =====================================================

function update() {

    if (isGameOver) {
        return;
    }

    const elapsed =
        (Date.now() - startTime) / 1000;


   // =================================================
// LEVEL TRANSITION
// =================================================

if (isLevelTransition) {

    // Timer เกมยังเดินต่อ
    if (elapsed >= gameDuration) {

        endGame();

        return;

    }

    // ยังอยู่ในช่วงพัก
    if (Date.now() < transitionEndTime) {

        // ❗ไม่ขยับตุ่น
        // ❗ไม่ spawn ตุ่น
        return;

    }

    // =============================================
    // หมดเวลา 3 วินาที
    // =============================================

    isLevelTransition = false;

    lastSpawnTime = performance.now();

    return;
}

    // =================================================
    // MOVE BLOCKS
    // =================================================

    for (
        let i = blocks.length - 1;
        i >= 0;
        i--
    ) {

        let b = blocks[i];

        b.y += b.speed;


        // collision
        if (
            b.y + b.size > player.y &&
            b.x < player.x + player.width &&
            b.x + b.size > player.x
        ) {

            if (b.type === "target") {

                score += 10;

                targetCaught++;

                levelTargetCaught++;

                const accuracy =
                    levelTargetSpawned === 0
                        ? 0
                        : (
                            levelTargetCaught /
                            levelTargetSpawned
                        ) * 100;


                const targetGoal = [

                    10,
                     15,
                     20,
                     25,
                     30

                ][level - 1];


                // LEVEL UP
              if (
             levelTargetCaught >= targetGoal &&
            !isLevelTransition
            ) {

    // ถ้าอยู่ Level 5 และผ่านเป้าหมาย → จบเกม
    if (level === maxLevel) {

        endGame();
        return;

    }

    // Level 1-4 → ขึ้น Level ถัดไป
    startLevelTransition(level + 1);

    return;
}

            }

            else {

                score -= 20;

                distractorCaught++;

                // นับการกดเขียวผิดใน Level นี้
                levelDistractorCaught++;

                }


            blocks.splice(i, 1);

            continue;

        }


        // ลบเมื่อตกพ้นจอ
        if (
            b.y > canvas.height
        ) {

            blocks.splice(i, 1);

        }

    }


    // Game Over
    if (elapsed >= gameDuration) {

        endGame();

    }

}

// =====================================================
// DRAW
// =====================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // =================================================
    // PLAYER
    // =================================================

    ctx.fillStyle =
        player.color;


    ctx.fillRect(

        player.x,

        player.y,

        player.width,

        player.height

    );


    // =================================================
    // BLOCKS
    // =================================================

    blocks.forEach(
        b => {

            ctx.fillStyle =

                b.type ===
                "target"

                    ? getTargetColor()

                    : getDistractorColor();


            ctx.fillRect(

                b.x,

                b.y,

                b.size,

                b.size

            );

        }
    );


    // =================================================
    // LEVEL
    // =================================================

    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 28px sans-serif";


    ctx.textAlign =
        "center";


    ctx.fillText(

        `LEVEL ${level}`,

        canvas.width / 2,

        50

    );


    // =================================================
    // SCORE
    // =================================================

    ctx.font =
        "bold 24px sans-serif";


    ctx.textAlign =
        "right";


    ctx.fillText(

        `Score: ${score}`,

        canvas.width - 20,

        50

    );


    // =================================================
    // TIME
    // =================================================

    let timeLeft;


    if (!gameStarted) {

        timeLeft =
            gameDuration;

    }

    else {

        timeLeft =

            Math.max(

                0,

                gameDuration -
                (
                    Date.now() -
                    startTime
                ) / 1000

            );

    }


    let m =
        Math.floor(
            timeLeft / 60
        );


    let s =
        Math.floor(
            timeLeft % 60
        );


    ctx.fillText(

        `Time: ${m}:${s < 10 ? '0' + s : s}`,

        canvas.width - 20,

        85

    );


    // =================================================
    // ACCURACY
    // =================================================

    const accuracy =

        levelTargetSpawned === 0

            ? 0

            :

            (
                levelTargetCaught /
                levelTargetSpawned
            ) * 100;


    ctx.textAlign =
        "left";


    ctx.fillText(

        `Accuracy: ${Math.round(accuracy)}%`,

        20,

        50

    );

// =================================================
// FALSE POSITIVE
// =================================================

const falsePositive =

    levelDistractorSpawned === 0

        ? 0

        :

        (
            levelDistractorCaught /
            levelDistractorSpawned
        ) * 100;


ctx.fillText(

    `False Positive: ${Math.round(falsePositive)}%`,

    20,

    80

);


    // =================================================
    // LEVEL TRANSITION SCREEN
    // =================================================

   if (isLevelTransition) {

    // พื้นหลังมืด
    ctx.fillStyle =
        "rgba(0, 0, 0, 0.75)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign = "center";

    ctx.fillStyle = "white";


    // ==============================
    // LEVEL
    // ==============================

    ctx.font =
        "bold 42px sans-serif";

    ctx.fillText(
        `LEVEL ${transitionLevel}`,
        canvas.width / 2,
        canvas.height / 2 - 60
    );


    // ==============================
    // MESSAGE
    // ==============================

    ctx.font =
        "bold 24px sans-serif";

    ctx.fillText(
        "เตรียมตัวให้พร้อม",
        canvas.width / 2,
        canvas.height / 2 - 15
    );


    // ==============================
    // COUNTDOWN
    // ==============================

    const now = Date.now();

    const countdownEndTime =
    transitionEndTime -
    startMessageDuration;

    const remaining =
    countdownEndTime - now;

    ctx.font =
    "bold 60px sans-serif";

    if (remaining > 0) {

    const countdown =
        Math.ceil(
            remaining / 1000
        );

    ctx.fillText(
        countdown,
        canvas.width / 2,
        canvas.height / 2 + 70
    );

    } else {

    // แสดง "เริ่ม!" ค้าง
    ctx.fillText(
        "เริ่ม!",
        canvas.width / 2,
        canvas.height / 2 + 70
    );

}


    ctx.textAlign = "left";

}

}

// =====================================================
// END GAME / GAME SUMMARY
// =====================================================


function endGame() {

    // ป้องกันการเรียกซ้ำ
    if (isGameOver) {
        return;
    }

    isGameOver = true;

    // หยุดตุ่นทั้งหมด
    blocks = [];

    // =========================================
    // ACCURACY รวมทั้งเกม
    // =========================================

    const finalAccuracy =
        targetSpawned === 0
            ? 0
            : Math.round(
                (targetCaught / targetSpawned) * 100
            );

    // =========================================
    // แสดงผลในหน้าสรุป
    // =========================================

    document.getElementById("final-level").innerText =
        `Level : ${level}/${maxLevel}`;

    document.getElementById("final-score").innerText =
        `Score : ${score}`;

    document.getElementById("final-green").innerText =
        `Target Caught : ${targetCaught}`;

    document.getElementById("final-red").innerText =
        `Distractor Caught : ${distractorCaught}`;

    document.getElementById("final-accuracy").innerText =
        `Target Detection : ${finalAccuracy}%`;

    // =========================================
    // แสดงหน้าสรุป
    // =========================================

    overlay.style.display = "flex";
}

// =====================================================
// GAME LOOP
// =====================================================

function loop(currentTime) {

    if (!gameStarted) {

        requestAnimationFrame(loop);

        return;

    }

    // =========================================
    // ถ้าอยู่ระหว่างพัก
    // ห้าม spawn
    // =========================================

    if (!isLevelTransition) {

        manageSpawning(currentTime);

    }

    update();

    draw();

    if (!isGameOver) {

        requestAnimationFrame(loop);

    }

}


// =====================================================
// INIT
// =====================================================

init();


window.addEventListener(
    "resize",
    init
);


// =====================================================
// START BUTTON
// =====================================================

document
    .getElementById(
        "start-btn"
    )
    .addEventListener(
        "click",
        () => {


            document.getElementById(
                "start-popup"
            ).style.display =
                "none";


            startTime =
                Date.now();


            gameStarted =
                true;


            requestAnimationFrame(
                loop
            );

        }
    );


// =====================================================
// RESTART
// =====================================================

document
    .getElementById(
        "restart-btn"
    )
    .addEventListener(
        "click",
        () => {

            location.reload();

        }
    );


// =====================================================
// HOME
// =====================================================

document
    .getElementById(
        "home-btn"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );
