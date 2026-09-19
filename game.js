
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const hpText = document.getElementById("hp");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const finalScore = document.getElementById("final-score");

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const fireButton = document.getElementById("fire-button");




/* ==================================================
   基本設定
================================================== */

let width = 0;
let height = 0;

let gameRunning = false;

let score = 0;
let hp = 3;

let level = 1;

let boss = null;

let bossActive = false;

let bossWarningTimer = 0;

let bossAttackTimer = 0;

let levelClearTimer = 0;

let bossSpawnScore = 3000;

let enemyKillCount = 0;


let lastTime = 0;

let enemyTimer = 0;
let difficultyTimer = 0;

let enemyInterval = 900;
let enemySpeed = 150;

let screenShake = 0;
let hitFlash = 0;

// ==============================
// アイテム
// ==============================

// 回復アイテム
let healCooldown = 0;
const healCooldownMax = 60;

// 必殺ビーム
let beamActive = false;
let beamTimer = 0;
const beamDuration = 6;

// ビームのダメージ
const beamDamage = 35;

// 必殺技を使ったか
let beamCooldown = 0;
const beamCooldownMax = 30;
/* ==================================================
   プレイヤー
================================================== */

const player = {

    x: 0,
    y: 0,

    width: 42,
    height: 55,

    speed: 330,

    movingLeft: false,
    movingRight: false,

    fireCooldown: 0,

    fireInterval: 0.13,

    engineTime: 0
};

/* ==================================================
   LINE LIFF
================================================== */

/* ==================================================
   LINE LIFF
================================================== */

const LIFF_ID = "2011666788-ny72UKwS";

let lineProfile = null;

/* ==================================================
   ランキングAPI
================================================== */

const RANKING_API =
    "https://long-truth-312b.htmlaaasd.workers.dev";
/* ==================================================
   LIFF初期化
================================================== */

async function initLIFF() {

    try {

        await liff.init({
            liffId: LIFF_ID
        });

        console.log("LIFF初期化成功");


        // LINEにログインしていない場合
        if (!liff.isLoggedIn()) {

            console.log("LINEログインが必要です");

            liff.login();

            return;
        }


        // LINEプロフィール取得
        lineProfile = await liff.getProfile();


        console.log("LINEプロフィール取得成功");

        console.log(
            "名前:",
            lineProfile.displayName
        );

        console.log(
            "画像:",
            lineProfile.pictureUrl
        );

        console.log(
            "User ID:",
            lineProfile.userId
        );


    } catch (error) {

        console.error(
            "LIFF初期化エラー:",
            error
        );

    }

}
/* ==================================================
   オブジェクト
================================================== */

let bullets = [];
let enemies = [];
let particles = [];
let stars = [];
let enemyBullets = [];
let levelTransitionText = "";



/* ==================================================
   リサイズ
================================================== */

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    player.y = height - 150;

    if (player.x === 0) {
        player.x = width / 2;
    }

    createStars();
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* ==================================================
   星
================================================== */

function createStars() {

    stars = [];

    for (let i = 0; i < 90; i++) {

        stars.push({

            x: Math.random() * width,

            y: Math.random() * height,

            size: Math.random() * 2 + 0.5,

            speed: Math.random() * 70 + 20,

            alpha: Math.random() * 0.7 + 0.3

        });

    }
}


/* ==================================================
   ゲーム開始
================================================== */

function startGame() {

    score = 0;
    hp = 3;

    level = 1;
    boss = null;
    bossActive = false;
    bossWarningTimer = 0;
    bossAttackTimer = 0;
    levelClearTimer = 0;
    bossSpawnScore = 3000;

    bullets = [];
    enemies = [];
    particles = [];
    explosions = [];

    enemyTimer = 0;
    difficultyTimer = 0;

    enemyInterval = 900;
    enemySpeed = 150;

    screenShake = 0;
    hitFlash = 0;

    // ==============================
// アイテムを完全リセット
// ==============================

// ==============================
// アイテムを完全リセット
// ==============================

// 最初からチャージ開始
healCooldown = healCooldownMax;

beamActive = false;
beamTimer = 0;

// ビームも最初からチャージ開始
beamCooldown = beamCooldownMax;

    player.x = width / 2;
    player.y = height - 150;

    player.fireCooldown = 0;

    updateHUD();

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    gameRunning = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


/* ==================================================
   ゲームオーバー
================================================== */

/* ==================================================
   スコア送信
================================================== */

async function sendScoreToRanking() {

    /* ------------------------------------------
       LINEプロフィールがない場合
    ------------------------------------------ */

    if (
        typeof lineProfile === "undefined" ||
        !lineProfile
    ) {

        console.log(
            "LINEプロフィールがないためスコア送信をスキップします"
        );

        return;

    }


    /* ------------------------------------------
       User ID確認
    ------------------------------------------ */

    if (!lineProfile.userId) {

        console.log(
            "LINE User IDがないためスコア送信をスキップします"
        );

        return;

    }


    /* ------------------------------------------
       送信データ
    ------------------------------------------ */

    const data = {

        userId:
            lineProfile.userId,

        displayName:
            lineProfile.displayName ||
            "LINEユーザー",

        pictureUrl:
            lineProfile.pictureUrl ||
            "",

        score:
            Number(score),

        level:
            Number(level)

    };


    console.log(
        "ランキングへスコア送信:",
        data
    );


    try {

        const response =
            await fetch(
                RANKING_API + "/score",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP ERROR: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "ランキング保存結果:",
            result
        );


        /* ------------------------------------------
           保存成功
        ------------------------------------------ */

        if (result.success) {

            if (result.updated) {

                if (result.inRanking) {

                    console.log(
                        "ランキング入り！",
                        result.rank + "位"
                    );

                } else {

                    console.log(
                        "スコア更新しましたが、現在50位圏外です"
                    );

                }

            } else {

                console.log(
                    "自己ベスト更新なし"
                );

            }

        }

    }
    catch (error) {

        console.error(
            "ランキング送信エラー:",
            error
        );

    }

}


/* ==================================================
   ゲームオーバー
================================================== */

function endGame() {

    /* ------------------------------------------
       ゲーム停止
    ------------------------------------------ */

    gameRunning = false;


    /* ------------------------------------------
       最終スコア表示
    ------------------------------------------ */

    finalScore.textContent =
        score;


    /* ------------------------------------------
       LINEプロフィール表示
    ------------------------------------------ */

    const profileImage =
        document.getElementById(
            "line-profile-image"
        );

    const profileName =
        document.getElementById(
            "line-profile-name"
        );


    if (
        typeof lineProfile !== "undefined" &&
        lineProfile
    ) {

        /* 名前 */

        if (profileName) {

            profileName.textContent =
                lineProfile.displayName ||
                "LINEユーザー";

        }


        /* アイコン */

        if (
            profileImage &&
            lineProfile.pictureUrl
        ) {

            profileImage.src =
                lineProfile.pictureUrl;

            profileImage.style.display =
                "block";

        }

    }

    else {

        if (profileName) {

            profileName.textContent =
                "ゲスト";

        }


        if (profileImage) {

            profileImage.style.display =
                "none";

        }

    }


    /* ------------------------------------------
       ゲームオーバー画面表示
    ------------------------------------------ */

    gameOverScreen.style.display =
        "flex";


    /* ------------------------------------------
       ランキングへ送信
       ※画面表示を止めない
    ------------------------------------------ */

    sendScoreToRanking();

}

/* ==================================================
   ランキングへスコア送信
================================================== */

async function submitScoreToRanking() {

    try {

        // LINEプロフィールが存在する場合
        if (typeof lineProfile !== "undefined" && lineProfile) {

            const response = await fetch(
                RANKING_API + "/score",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            lineProfile.userId,

                        displayName:
                            lineProfile.displayName ||
                            "LINEユーザー",

                        pictureUrl:
                            lineProfile.pictureUrl ||
                            "",

                        score:
                            score,

                        level:
                            level

                    })
                }
            );


            const result =
                await response.json();


            console.log(
                "ランキング送信結果:",
                result
            );

        } else {

            console.log(
                "LINEプロフィールがないためランキング送信をスキップ"
            );

        }

    } catch (error) {

        console.error(
            "ランキング送信エラー:",
            error
        );

    }

}
/* ==================================================
   LINE SHARE
================================================== */

async function shareScore() {

    console.log("===== LINE SHARE CHECK =====");

    console.log(
        "LIFFブラウザ:",
        liff.isInClient()
    );

    console.log(
        "ShareTargetPicker:",
        liff.isApiAvailable("shareTargetPicker")
    );

    console.log(
        "ログイン:",
        liff.isLoggedIn()
    );

    console.log(
        "LIFF ID:",
        LIFF_ID
    );


    // シェア機能が使えない場合
    if (!liff.isApiAvailable("shareTargetPicker")) {

        if (!liff.isInClient()) {

            alert(
                "LINEのLIFFブラウザでゲームを開いてください。"
            );

        } else {

            alert(
                "現在のLINE環境ではLINEシェアを利用できません。"
            );

        }

        return;
    }


    const playerName =
        lineProfile?.displayName || "LINEユーザー";


    const gameUrl =
        "https://liff.line.me/" + LIFF_ID;


    const shareText =
`🚀 NEXUS SHOOTER

${playerName} が
${score} POINTSを獲得！

LEVEL ${level} 到達！

君はこの記録を超えられるか？

🎮 NEXUS SHOOTER
${gameUrl}`;


    try {

        const result =
            await liff.shareTargetPicker(
                [
                    {
                        type: "text",
                        text: shareText
                    }
                ],
                {
                    isMultiple: false
                }
            );


        if (result) {

            console.log(
                "LINEシェア成功",
                result
            );

        } else {

            console.log(
                "LINEシェアキャンセル"
            );

        }

    } catch (error) {

        console.error(
            "LINEシェアエラー:",
            error
        );

        alert(
            "LINEシェア中にエラーが発生しました。"
        );
    }
}
/* ==================================================
   HUD
================================================== */

function updateHUD() {

    scoreText.textContent = score;
    hpText.textContent = hp;

}


/* ==================================================
   スコア加算
================================================== */

function addScore(value) {

    score += value;

    updateHUD();

}

function useHealItem() {
    // HP満タンなら使えない
    if (hp >= 3) return;

    // まだチャージ中なら使えない
    if (healCooldown > 0) return;

    // HPを1回復
    hp++;

    // 60秒チャージ開始
    healCooldown = healCooldownMax;

    updateHUD();
    updateItemButtons();
}


/* ==================================================
   弾発射
================================================== */

function fireBullet() {

    if (!gameRunning) {
        return;
    }

    if (player.fireCooldown > 0) {
        return;
    }

    bullets.push({

        x: player.x,

        y: player.y - player.height / 2,

        width: 5,

        height: 22,

        speed: 700

    });

    player.fireCooldown =
        player.fireInterval;

}

function useBeam() {

    if (!gameRunning) {
        return;
    }

    if (beamActive) {
        return;
    }

    if (beamCooldown > 0) {
        return;
    }

    beamActive = true;
    beamTimer = beamDuration;

    updateItemButtons();
}
function updateBeam(deltaTime) {

    // ==============================
    // ビーム発射中
    // ==============================

    if (beamActive) {

        beamTimer -= deltaTime;

        if (beamTimer <= 0) {

            beamTimer = 0;
            beamActive = false;

            // 6秒発射終了
            // ここから30秒チャージ
            beamCooldown = beamCooldownMax;
        }

        return;
    }


    // ==============================
    // ビームチャージ中
    // ==============================

    if (beamCooldown > 0) {

        beamCooldown -= deltaTime;

        if (beamCooldown <= 0) {
            beamCooldown = 0;
        }
    }
}
/* ==================================================
   敵生成
================================================== */



function createEnemy() {

    const typeRandom = Math.random();

    let type;

    /*
        70% → 通常敵
        20% → 高速敵
        10% → 大型敵
    */

    if (typeRandom < 0.70) {

        type = "normal";

    } else if (typeRandom < 0.90) {

        type = "fast";

    } else {

        type = "big";

    }


    let size;
    let speed;
    let hp;
    let scoreValue;


    /* =================================
       通常敵
    ================================= */

    if (type === "normal") {

        size = 40;

        speed =
            enemySpeed +
            Math.random() * 70;

        hp = 1;

        scoreValue = 100;

    }


    /* =================================
       高速敵
    ================================= */

    if (type === "fast") {

        size = 28;

        speed = 350
        ;
            
        
        //enemySpeed * 1.7 + Math.random() * 100;

        hp = 1;

        scoreValue = 150;

    }


    /* =================================
       大型敵
    ================================= */

    if (type === "big") {

        size = 65;

        speed =
            enemySpeed * 0.65 +
            Math.random() * 40;

        hp = 4;

        scoreValue = 500;

    }


    const enemy = {

        x:
            Math.random() *
            (width - size) +
            size / 2,

        y:
            -size,

        width:
            size,

        height:
            size,

        speed:
            speed,

        rotation:
            Math.random() *
            Math.PI *
            2,

        rotationSpeed:
            (Math.random() - 0.5) * 4,

        hp:
            hp,

        maxHp:
            hp,

        type:
            type,

        score:
            scoreValue

    };


    enemies.push(enemy);

}


function createBoss() {

    bossActive = true;

    bossAttackTimer = 0;

    /*
        LEVELが上がるほどボスが強くなる
    */

    const bossHP =
        1200 +
        (level - 1) * 800;

    boss = {

        x: width / 2,

        y: -120,

        width: 120,

        height: 120,

        hp: bossHP,

        maxHp: bossHP,

        speed:
            80 +
            level * 15,

        direction: 1,

        phase: 0,

        attackLevel: 1,

        flash: 0

    };

    bossWarningTimer = 3;

}




/* ==================================================
   爆発
================================================== */

function createExplosion(
    x,
    y,
    amount = 20
) {

    for (let i = 0; i < amount; i++) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() *
            220 +
            50;

        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            size:
                Math.random() *
                4 +
                1,

            life:
                Math.random() *
                0.5 +
                0.3,

            maxLife: 0.8

        });

    }

    screenShake = 5;

}


/* ==================================================
   プレイヤー描画
================================================== */

function drawPlayer() {

    player.engineTime += 0.15;

    const flameSize =
        28 +
        Math.sin(player.engineTime) * 7;

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /* ===============================
       エンジン炎
    =============================== */

    ctx.beginPath();

    ctx.moveTo(-8, 20);

    ctx.lineTo(
        0,
        20 + flameSize
    );

    ctx.lineTo(8, 20);

    ctx.closePath();

    ctx.fillStyle = "#ff7b00";

    ctx.shadowColor = "#ff4500";
    ctx.shadowBlur = 25;

    ctx.fill();


    /* 内側の炎 */

    ctx.beginPath();

    ctx.moveTo(-4, 18);

    ctx.lineTo(
        0,
        18 + flameSize * 0.65
    );

    ctx.lineTo(4, 18);

    ctx.closePath();

    ctx.fillStyle = "#fff4a3";

    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;

    ctx.fill();


    /* ===============================
       本体
    =============================== */

    ctx.beginPath();

    ctx.moveTo(
        0,
        -32
    );

    ctx.lineTo(
        -22,
        24
    );

    ctx.lineTo(
        -4,
        16
    );

    ctx.lineTo(
        0,
        22
    );

    ctx.lineTo(
        4,
        16
    );

    ctx.lineTo(
        22,
        24
    );

    ctx.closePath();

    ctx.fillStyle = "#27dfff";

    ctx.shadowColor = "#00cfff";
    ctx.shadowBlur = 20;

    ctx.fill();


    /* ===============================
       翼
    =============================== */

    ctx.beginPath();

    ctx.moveTo(-12, 4);

    ctx.lineTo(-30, 19);

    ctx.lineTo(-17, 18);

    ctx.closePath();

    ctx.fillStyle = "#148dcc";

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(12, 4);

    ctx.lineTo(30, 19);

    ctx.lineTo(17, 18);

    ctx.closePath();

    ctx.fillStyle = "#148dcc";

    ctx.fill();


    /* ===============================
       コックピット
    =============================== */

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.restore();

}

function updateBeam(deltaTime) {

    // =========================
    // ビーム発射中
    // =========================

    if (beamActive) {

        beamTimer -= deltaTime;

        if (beamTimer <= 0) {

            beamTimer = 0;
            beamActive = false;

            // 発射終了 → 30秒チャージ開始
            beamCooldown = beamCooldownMax;
        }

        return;
    }


    // =========================
    // チャージ中
    // =========================

    if (beamCooldown > 0) {

        beamCooldown -= deltaTime;

        if (beamCooldown <= 0) {
            beamCooldown = 0;
        }
    }
}
function updateItems(deltaTime) {

    // ♡回復のチャージ
    if (healCooldown > 0) {

        healCooldown -= deltaTime;

        if (healCooldown < 0) {
            healCooldown = 0;
        }
    }

    updateItemButtons();
}
/* ==================================================
   弾描画
================================================== */

function drawBullet(bullet) {

    ctx.save();

    ctx.fillStyle = "#ffffff";

    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 20;

    ctx.fillRect(

        bullet.x -
        bullet.width / 2,

        bullet.y,

        bullet.width,

        bullet.height

    );

    ctx.restore();

}


/* ==================================================
   敵描画
================================================== */


function drawEnemy(enemy) {

    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );

    ctx.rotate(
        enemy.rotation
    );


    /* =================================
       通常敵
    ================================= */

    if (enemy.type === "normal") {

        ctx.beginPath();

        const spikes = 8;

        for (let i = 0; i < spikes; i++) {

            const angle =
                (Math.PI * 2 / spikes) * i;

            const radius =
                i % 2 === 0
                    ? enemy.width / 2
                    : enemy.width / 4;

            const x =
                Math.cos(angle) * radius;

            const y =
                Math.sin(angle) * radius;

            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }

        ctx.closePath();

        ctx.fillStyle =
            "#ff365f";

        ctx.shadowColor =
            "#ff003c";

        ctx.shadowBlur = 20;

        ctx.fill();


        /* 中央 */

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            enemy.width * 0.23,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffb0bd";

        ctx.fill();

    }


    /* =================================
       高速敵
    ================================= */

    if (enemy.type === "fast") {

        ctx.beginPath();

        ctx.moveTo(
            0,
            -enemy.height / 2
        );

        ctx.lineTo(
            enemy.width / 2,
            enemy.height / 2
        );

        ctx.lineTo(
            0,
            enemy.height / 4
        );

        ctx.lineTo(
            -enemy.width / 2,
            enemy.height / 2
        );

        ctx.closePath();

        ctx.fillStyle =
            "#b04cff";

        ctx.shadowColor =
            "#9b00ff";

        ctx.shadowBlur = 25;

        ctx.fill();


        /* 中央 */

        ctx.beginPath();

        ctx.arc(
            0,
            5,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();

    }


    /* =================================
       大型敵
    ================================= */

    if (enemy.type === "big") {

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            enemy.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ff9f1c";

        ctx.shadowColor =
            "#ff6600";

        ctx.shadowBlur = 30;

        ctx.fill();


        /* 装甲 */

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            enemy.width * 0.32,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#7a2600";

        ctx.fill();


        /* コア */

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            enemy.width * 0.16,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#fff1a8";

        ctx.shadowColor =
            "#ffffff";

        ctx.shadowBlur = 15;

        ctx.fill();

    }


    ctx.restore();


    /* =================================
       大型敵のHPバー
    ================================= */

    if (enemy.type === "big") {

        const barWidth = 65;

        const barHeight = 5;

        const hpRatio =
            enemy.hp /
            enemy.maxHp;


        ctx.fillStyle =
            "rgba(0,0,0,0.7)";

        ctx.fillRect(

            enemy.x -
            barWidth / 2,

            enemy.y -
            enemy.height / 2 -
            12,

            barWidth,

            barHeight

        );


        ctx.fillStyle =
            "#ff4d6d";

        ctx.fillRect(

            enemy.x -
            barWidth / 2,

            enemy.y -
            enemy.height / 2 -
            12,

            barWidth *
            hpRatio,

            barHeight

        );

    }

}

function checkBeamCollision() {
    if (!beamActive) return;

    const beamX = player.x;
    const beamWidth = 90;

    // ==============================
    // 通常の敵
    // ==============================

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        if (
            enemy.x + enemy.width / 2 > beamX - beamWidth / 2 &&
            enemy.x - enemy.width / 2 < beamX + beamWidth / 2
        ) {

            enemy.hp -= beamDamage * 0.016;

            if (enemy.hp <= 0) {

                score += enemy.score || 100;

                createExplosion(
                    enemy.x,
                    enemy.y,
                    enemy.width
                );

                enemies.splice(i, 1);

                updateHUD();
            }
        }
    }

    // ==============================
    // ボス
    // ==============================

    if (boss) {

        if (
            boss.x + boss.width / 2 > beamX - beamWidth / 2 &&
            boss.x - boss.width / 2 < beamX + beamWidth / 2
        ) {

            boss.hp -= beamDamage * 0.016;

            boss.flash = 0.08;

            if (boss.hp <= 0) {
                defeatBoss();
            }
        }
    }
}


function drawBoss() {

    if (!boss) {
        return;
    }

    ctx.save();

    ctx.translate(
        boss.x,
        boss.y
    );


    /* =================================
       外側リング
    ================================= */

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        boss.width / 2,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#5a0b78";

    ctx.shadowColor =
        "#d000ff";

    ctx.shadowBlur = 35;

    ctx.fill();


    /* =================================
       装甲
    ================================= */

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        boss.width * 0.37,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#26043d";

    ctx.fill();


    /* =================================
       コア
    ================================= */

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        boss.width * 0.19,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        boss.flash > 0
            ? "#ffffff"
            : "#ff2878";

    ctx.shadowColor =
        "#ff0066";

    ctx.shadowBlur = 30;

    ctx.fill();


    /* =================================
       4つの砲台
    ================================= */

    const turretPositions = [

        [-48, 0],

        [48, 0],

        [0, -48],

        [0, 48]

    ];


    for (
        const position of turretPositions
    ) {

        ctx.beginPath();

        ctx.arc(
            position[0],
            position[1],
            13,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#a72be2";

        ctx.shadowColor =
            "#e100ff";

        ctx.shadowBlur = 15;

        ctx.fill();

    }


    ctx.restore();


    /* =================================
       BOSS HP BAR
    ================================= */

    const barWidth =
        Math.min(
            width - 40,
            420
        );

    const barHeight = 12;

    const barX =
        width / 2 -
        barWidth / 2;

    const barY = 75;


    ctx.fillStyle =
        "rgba(0,0,0,0.75)";

    ctx.fillRect(
        barX,
        barY,
        barWidth,
        barHeight
    );


    const hpRatio =
        Math.max(
            0,
            boss.hp /
            boss.maxHp
        );


    ctx.fillStyle =
        "#ff2878";

    ctx.shadowColor =
        "#ff0066";

    ctx.shadowBlur = 15;

    ctx.fillRect(

        barX,

        barY,

        barWidth *
        hpRatio,

        barHeight

    );


    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 14px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(

        `BOSS  LEVEL ${level}`,

        width / 2,

        barY - 8

    );

}

function drawBeam() {
    if (!beamActive) return;

    ctx.save();

    const beamWidth = 90;
    const beamX = player.x;
    const beamTop = 0;
    const beamBottom = player.y - 20;

    // ==============================
    // 外側の強い光
    // ==============================

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        beamX - beamWidth / 2 - 25,
        beamTop,
        beamWidth + 50,
        beamBottom
    );

    ctx.globalAlpha = 1;

    // ==============================
    // 虹色グラデーション
    // ==============================

    const gradient = ctx.createLinearGradient(
        beamX - beamWidth / 2,
        0,
        beamX + beamWidth / 2,
        0
    );

    gradient.addColorStop(0.00, "#ff0000");
    gradient.addColorStop(0.16, "#ff8800");
    gradient.addColorStop(0.32, "#ffff00");
    gradient.addColorStop(0.48, "#00ff66");
    gradient.addColorStop(0.64, "#00ffff");
    gradient.addColorStop(0.80, "#4488ff");
    gradient.addColorStop(1.00, "#ff00ff");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        beamX - beamWidth / 2,
        beamTop,
        beamWidth,
        beamBottom
    );

    // ==============================
    // 中央の白い光
    // ==============================

    ctx.globalAlpha = 0.85;

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        beamX - 18,
        beamTop,
        36,
        beamBottom
    );

    // ==============================
    // 「ドパガキの頭の中」感
    // ランダムな光の帯
    // ==============================

    ctx.globalAlpha = 0.75;

    for (let i = 0; i < 18; i++) {

        const x =
            beamX -
            beamWidth / 2 +
            Math.random() * beamWidth;

        const y =
            Math.random() * beamBottom;

        const width =
            5 + Math.random() * 20;

        const height =
            2 + Math.random() * 10;

        const colors = [
            "#ff0055",
            "#ff8800",
            "#ffff00",
            "#00ff66",
            "#00ffff",
            "#0088ff",
            "#8800ff",
            "#ff00ff"
        ];

        ctx.fillStyle =
            colors[Math.floor(Math.random() * colors.length)];

        ctx.fillRect(
            x,
            y,
            width,
            height
        );
    }

    // ==============================
    // ビームの輪郭
    // ==============================

    ctx.globalAlpha = 0.9;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;

    ctx.strokeRect(
        beamX - beamWidth / 2,
        beamTop,
        beamWidth,
        beamBottom
    );

    ctx.restore();
}

function drawEnemyBullets() {

    for (
        const bullet of enemyBullets
    ) {

        ctx.save();

        ctx.beginPath();

        ctx.arc(

            bullet.x,

            bullet.y,

            bullet.radius,

            0,

            Math.PI * 2

        );

        ctx.fillStyle =
            "#ff3d9a";

        ctx.shadowColor =
            "#ff0066";

        ctx.shadowBlur = 18;

        ctx.fill();

        ctx.restore();

    }

}



function defeatBoss() {
    if (!boss) return;

    const defeatedLevel = level;

    // ボス撃破エフェクト
    createExplosion(boss.x, boss.y, 120);
    createExplosion(boss.x, boss.y, 80);

    // ボーナス
    score += 5000 * level;

    // ボスを消す
    boss = null;
    bossActive = false;

    // 次のレベルへ
    level++;

    // レベルアップ演出
    levelClearTimer = 3;
    levelTransitionText = `LEVEL ${defeatedLevel} → LEVEL ${level}`;

    // 次のレベルを少し難しくする
    enemySpeed += 50;
    enemyInterval = Math.max(220, enemyInterval - 100);

    // 次のボス出現まで
    bossSpawnScore = score + 3000;

    updateHUD();
}



/* ==================================================
   星描画
================================================== */

function drawStars(deltaTime) {

    for (const star of stars) {

        star.y +=
            star.speed *
            deltaTime;

        if (star.y > height) {

            star.y = -5;

            star.x =
                Math.random() *
                width;

        }

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(

            star.x,

            star.y,

            star.size,

            star.size

        );

    }

    ctx.globalAlpha = 1;

}


/* ==================================================
   粒子描画
================================================== */

function updateParticles(deltaTime) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.vx *
            deltaTime;

        particle.y +=
            particle.vy *
            deltaTime;

        particle.vy +=
            180 *
            deltaTime;

        particle.life -=
            deltaTime;

        if (particle.life <= 0) {

            particles.splice(i, 1);

        }

    }

}


function drawParticles() {

    for (const particle of particles) {

        const alpha =
            particle.life /
            particle.maxLife;

        ctx.globalAlpha =
            Math.max(
                0,
                alpha
            );

        ctx.fillStyle =
            "#ffb52e";

        ctx.shadowColor =
            "#ff5500";

        ctx.shadowBlur =
            10;

        ctx.beginPath();

        ctx.arc(

            particle.x,

            particle.y,

            particle.size,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

    ctx.shadowBlur = 0;

}


/* ==================================================
   プレイヤー更新
================================================== */

function updatePlayer(deltaTime) {

    if (player.movingLeft) {

        player.x -=
            player.speed *
            deltaTime;

    }

    if (player.movingRight) {

        player.x +=
            player.speed *
            deltaTime;

    }


    const halfWidth =
        player.width / 2;


    if (
        player.x <
        halfWidth
    ) {

        player.x =
            halfWidth;

    }


    if (
        player.x >
        width -
        halfWidth
    ) {

        player.x =
            width -
            halfWidth;

    }


    if (
        player.fireCooldown >
        0
    ) {

        player.fireCooldown -=
            deltaTime;

    }


    /* 押しっぱなし連射 */

    if (
        fireButtonHeld &&
        player.fireCooldown <= 0
    ) {

        fireBullet();

    }

}


function updateLevelTransition(deltaTime) {

    if (
        levelClearTimer <= 0
    ) {

        return;

    }


    levelClearTimer -=
        deltaTime;


    if (
        levelClearTimer <= 0
    ) {

        /*
            敵を一度整理
        */

        enemies = [];

        bullets = [];

        enemyBullets = [];


        /*
            新しいLEVEL開始
        */

        enemyTimer = 0;

        difficultyTimer = 0;


        /*
            ボス出現条件を更新
        */

        bossSpawnScore =
            score +
            3000;

       
       
      
    }

}



/* ==================================================
   弾更新
================================================== */

function updateBullets(deltaTime) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.y -=
            bullet.speed *
            deltaTime;

        if (
            bullet.y <
            -30
        ) {

            bullets.splice(
                i,
                1
            );

        }

    }

}


/* ==================================================
   敵更新
================================================== */

function updateEnemies(deltaTime) {

    enemyTimer +=
        deltaTime;

    difficultyTimer +=
        deltaTime;


        if (enemies.length === 0 && enemyTimer >= 1) {
        enemyTimer = 0;
        createEnemy();
    }
    if (
        enemyTimer >=
        enemyInterval
    ) {

        enemyTimer = 0;

        createEnemy();

    }


    /* 10秒ごとに難しくする */

    if (
        difficultyTimer >=
        10
    ) {

        difficultyTimer = 0;

        enemySpeed += 15;

        enemyInterval =
            Math.max(
                300,
                enemyInterval - 50
            );

    }


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        enemy.y +=
            enemy.speed *
            deltaTime;

        enemy.rotation +=
            enemy.rotationSpeed *
            deltaTime;


        /* 画面下 */

        if (
            enemy.y >
            height +
            enemy.height
        ) {

            enemies.splice(
                i,
                1
            );

            damagePlayer();

        }
        if (
    !bossActive &&
    levelClearTimer <= 0 &&
    score >= bossSpawnScore
) {

    enemies = [];

    createBoss();

}

    }

}

function updateBoss(deltaTime) {

    if (!bossActive || !boss) {
        return;
    }


    /* =================================
       警告時間
    ================================= */

    if (bossWarningTimer > 0) {

        bossWarningTimer -=
            deltaTime;

        return;

    }


    /* =================================
       登場
    ================================= */

    if (boss.y < 130) {

        boss.y +=
            100 *
            deltaTime;

        return;

    }


    /* =================================
       左右移動
    ================================= */

    boss.x +=
        boss.speed *
        boss.direction *
        deltaTime;


    if (
        boss.x <
        boss.width / 2
    ) {

        boss.x =
            boss.width / 2;

        boss.direction = 1;

    }


    if (
        boss.x >
        width -
        boss.width / 2
    ) {

        boss.x =
            width -
            boss.width / 2;

        boss.direction = -1;

    }


    /* =================================
       ダメージ点滅
    ================================= */

    if (boss.flash > 0) {

        boss.flash -=
            deltaTime;

    }


    /* =================================
       攻撃
    ================================= */

    bossAttackTimer +=
        deltaTime;


    const attackInterval =
        Math.max(
            0.35,
            1.1 -
            level * 0.08
        );


    if (
        bossAttackTimer >=
        attackInterval
    ) {

        bossAttackTimer = 0;

        bossShoot();

    }


    /* =================================
       HPによる第2段階
    ================================= */

    if (
        boss.hp <
        boss.maxHp * 0.5
    ) {

        boss.attackLevel = 2;

    }

}

function bossShoot() {

    if (!boss) {
        return;
    }


    /*
        レベルが高いほど弾数が増える
    */

    let bulletCount =
        5 +
        level;


    /*
        HPが半分以下になると
        弾幕が強化される
    */

    if (
        boss.attackLevel >= 2
    ) {

        bulletCount += 4;

    }


    const angleOffset =
        Math.random() *
        Math.PI *
        2;


    for (
        let i = 0;
        i < bulletCount;
        i++
    ) {

        const angle =
            angleOffset +
            (
                Math.PI * 2 /
                bulletCount
            ) * i;


        const speed =
            120 +
            level * 15;


        enemyBullets.push({

            x: boss.x,

            y: boss.y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            radius: 6

        });

    }

}


function updateEnemyBullets(deltaTime) {

    for (
        let i = enemyBullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            enemyBullets[i];


        bullet.x +=
            bullet.vx *
            deltaTime;

        bullet.y +=
            bullet.vy *
            deltaTime;


        /* 画面外 */

        if (

            bullet.x < -30 ||

            bullet.x > width + 30 ||

            bullet.y < -30 ||

            bullet.y > height + 30

        ) {

            enemyBullets.splice(
                i,
                1
            );

            continue;

        }


        /* プレイヤーとの距離 */

        const dx =
            bullet.x -
            player.x;

        const dy =
            bullet.y -
            player.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            bullet.radius +
            18
        ) {

            enemyBullets.splice(
                i,
                1
            );

            damagePlayer();

        }

    }

}







/* ==================================================
   当たり判定
================================================== */


function checkCollisions() {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        let destroyed = false;


        /* =================================
           弾 vs 敵
        ================================= */

        for (
            let j = bullets.length - 1;
            j >= 0;
            j--
        ) {

            const bullet =
                bullets[j];


            if (
                isColliding(
                    bullet,
                    enemy
                )
            ) {

                /* 弾を消す */

                bullets.splice(
                    j,
                    1
                );


                /* 敵HPを減らす */

                enemy.hp--;


                /* 被弾エフェクト */

                createExplosion(
                    bullet.x,
                    bullet.y,
                    enemy.type === "big"
                        ? 6
                        : 10
                );


                /* =================================
                   敵撃破
                ================================= */

                if (
                    enemy.hp <= 0
                ) {

                    enemies.splice(
                        i,
                        1
                    );


                    createExplosion(

                        enemy.x,

                        enemy.y,

                        enemy.type === "big"
                            ? 45
                            : enemy.type === "fast"
                                ? 18
                                : 25

                    );


                    addScore(
                        enemy.score
                    );


                    destroyed =
                        true;

                    break;

                }

            }

        }


        if (destroyed) {

            continue;

        }


        /* =================================
           敵 vs プレイヤー
        ================================= */

        if (
            isPlayerHit(
                enemy
            )
        ) {

            enemies.splice(
                i,
                1
            );


            createExplosion(

                enemy.x,

                enemy.y,

                20

            );


            damagePlayer();

        }

    }

}

function checkBossCollision() {

    if (
        !bossActive ||
        !boss ||
        bossWarningTimer > 0
    ) {

        return;

    }


    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        const dx =
            bullet.x -
            boss.x;

        const dy =
            bullet.y -
            boss.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            boss.width / 2
        ) {

            bullets.splice(
                i,
                1
            );


            /*
                ボスはかなり硬い
            */

            boss.hp -= 10;

            boss.flash = 0.08;


            createExplosion(
                bullet.x,
                bullet.y,
                4
            );


            if (
                boss.hp <= 0
            ) {

                defeatBoss();

            }

        }

    }

}






/* ==================================================
   矩形判定
================================================== */

function isColliding(
    a,
    b
) {

    return (

        a.x -
        a.width / 2 <
        b.x +
        b.width / 2 &&

        a.x +
        a.width / 2 >
        b.x -
        b.width / 2 &&

        a.y <
        b.y +
        b.height / 2 &&

        a.y +
        a.height >
        b.y -
        b.height / 2

    );

}


/* ==================================================
   プレイヤー被弾
================================================== */

function isPlayerHit(
    enemy
) {

    const dx =
        enemy.x -
        player.x;

    const dy =
        enemy.y -
        player.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    return (
        distance <
        enemy.width / 2 +
        20
    );

}


/* ==================================================
   ダメージ
================================================== */

function damagePlayer() {

    hp--;

    screenShake = 12;

    hitFlash = 0.25;

    updateHUD();

    if (hp <= 0) {

        createExplosion(
            player.x,
            player.y,
            45
        );

        endGame();

    }

}
function updateItemButtons() {

    const healButton =
        document.getElementById("healButton");

    const beamButton =
        document.getElementById("beamButton");

    if (!healButton || !beamButton) {
        return;
    }


    // ==============================
    // ♡ 回復
    // ==============================

    if (hp >= 3) {

        healButton.disabled = true;

        healButton.innerHTML =
            "♡<span>HP MAX</span>";

    } else if (healCooldown > 0) {

        healButton.disabled = true;

        healButton.innerHTML =
            `♡<span>あと ${Math.ceil(healCooldown)}秒</span>`;

    } else {

        healButton.disabled = false;

        healButton.innerHTML =
            "♡<span>回復可能！</span>";
    }


    // ==============================
    // 🌈 必殺ビーム
    // ==============================

    if (beamActive) {

        beamButton.disabled = true;

        beamButton.innerHTML =
            `🌈<span>発射中 ${beamTimer.toFixed(1)}秒</span>`;

    } else if (beamCooldown > 0) {

        beamButton.disabled = true;

        beamButton.innerHTML =
            `🌈<span>あと ${Math.ceil(beamCooldown)}秒</span>`;

    } else {

        beamButton.disabled = false;

        beamButton.innerHTML =
            "🌈<span>発射可能！</span>";
    }
}
/* ==================================================
   画面シェイク
================================================== */

function updateEffects(
    deltaTime
) {

    if (screenShake > 0) {

        screenShake -=
            30 *
            deltaTime;

        if (screenShake < 0) {
            screenShake = 0;
        }

    }

    if (hitFlash > 0) {

        hitFlash -=
            deltaTime;

        if (hitFlash < 0) {
            hitFlash = 0;
        }

    }

}


/* ==================================================
   ゲームループ
================================================== */

function gameLoop(
    currentTime
) {

    if (!gameRunning) {
        return;
    }


    const deltaTime =
        Math.min(
            (currentTime -
                lastTime) /
            1000,

            0.05
        );

    lastTime =
        currentTime;


    updateEffects(
        deltaTime
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* 画面シェイク */

    ctx.save();

    if (screenShake > 0) {

        ctx.translate(

            (Math.random() -
                0.5) *
                screenShake,

            (Math.random() -
                0.5) *
                screenShake

        );

    }


    /* 背景 */

    drawStars(
        deltaTime
    );


    /* 更新 */

   updatePlayer(deltaTime);

updateBullets(deltaTime);

updateEnemies(deltaTime);

updateBoss(deltaTime);

updateBeam(deltaTime);

updateEnemyBullets(deltaTime);

updateParticles(deltaTime);

updateLevelTransition(deltaTime);

updateItems(deltaTime);

checkCollisions();

checkBossCollision();


for (const bullet of bullets) {
    drawBullet(bullet);
}

for (const enemy of enemies) {
    drawEnemy(enemy);
}

drawEnemyBullets();

drawBoss();

drawParticles();

drawBeam();

checkBeamCollision();


drawPlayer();


    ctx.restore();


    /* 被弾フラッシュ */

    if (hitFlash > 0) {

        ctx.fillStyle =
            `rgba(255,50,80,${hitFlash})`;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

    }


    requestAnimationFrame(
        gameLoop
    );


    if (levelClearTimer > 0 && levelTransitionText) {
    ctx.save();

    // 暗い背景
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, width, height);

    // LEVEL 1 → LEVEL 2
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Arial";
    ctx.fillText(
        levelTransitionText,
        width / 2,
        height / 2
    );

    ctx.restore();



}
}

const healButton =
    document.getElementById("healButton");

const beamButton =
    document.getElementById("beamButton");


healButton.addEventListener(
    "click",
    () => {
        useHealItem();
    }
);


beamButton.addEventListener(
    "click",
    () => {
        useBeam();
    }
);


/* ==================================================
   ボタン操作
================================================== */


/* ---------- 左 ---------- */

function startLeft(e) {

    e.preventDefault();

    player.movingLeft = true;

}

function stopLeft(e) {

    e.preventDefault();

    player.movingLeft = false;

}


leftButton.addEventListener(
    "touchstart",
    startLeft,
    { passive: false }
);

leftButton.addEventListener(
    "touchend",
    stopLeft,
    { passive: false }
);

leftButton.addEventListener(
    "touchcancel",
    stopLeft,
    { passive: false }
);

leftButton.addEventListener(
    "mousedown",
    startLeft
);

leftButton.addEventListener(
    "mouseup",
    stopLeft
);

leftButton.addEventListener(
    "mouseleave",
    stopLeft
);


/* ---------- 右 ---------- */

function startRight(e) {

    e.preventDefault();

    player.movingRight = true;

}

function stopRight(e) {

    e.preventDefault();

    player.movingRight = false;

}


rightButton.addEventListener(
    "touchstart",
    startRight,
    { passive: false }
);

rightButton.addEventListener(
    "touchend",
    stopRight,
    { passive: false }
);

rightButton.addEventListener(
    "touchcancel",
    stopRight,
    { passive: false }
);

rightButton.addEventListener(
    "mousedown",
    startRight
);

rightButton.addEventListener(
    "mouseup",
    stopRight
);

rightButton.addEventListener(
    "mouseleave",
    stopRight
);


/* ==================================================
   連射ボタン
================================================== */

let fireButtonHeld = false;


function startFire(e) {

    e.preventDefault();

    fireButtonHeld = true;

    fireBullet();

}


function stopFire(e) {

    e.preventDefault();

    fireButtonHeld = false;

}


fireButton.addEventListener(
    "touchstart",
    startFire,
    { passive: false }
);

fireButton.addEventListener(
    "touchend",
    stopFire,
    { passive: false }
);

fireButton.addEventListener(
    "touchcancel",
    stopFire,
    { passive: false }
);

fireButton.addEventListener(
    "mousedown",
    startFire
);

fireButton.addEventListener(
    "mouseup",
    stopFire
);

fireButton.addEventListener(
    "mouseleave",
    stopFire
);


/* ==================================================
   キーボード
================================================== */

window.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        ) {

            player.movingLeft = true;

        }


        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        ) {

            player.movingRight = true;

        }


        if (
            e.code === "Space"
        ) {

            e.preventDefault();

            fireButtonHeld = true;

        }

        if (e.key === "1") {
    useHealItem();
}

if (e.key === "2") {
    useBeam();
}

    }
);


window.addEventListener(
    "keyup",
    (e) => {

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        ) {

            player.movingLeft = false;

        }


        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        ) {

            player.movingRight = false;

        }


        if (
            e.code === "Space"
        ) {

            fireButtonHeld = false;

        }

    }
);


/* ==================================================
   スタート
================================================== */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);
const shareButton =
    document.getElementById("share-button");

if (shareButton) {

    shareButton.addEventListener(
        "click",
        shareScore
    );

}

/* ==================================================
   RANKING UI
================================================== */

const rankingScreen =
    document.getElementById("ranking-screen");

const rankingList =
    document.getElementById("ranking-list");

const rankingButton =
    document.getElementById("ranking-button");

const rankingButtonGameOver =
    document.getElementById("ranking-button-gameover");

const rankingCloseButton =
    document.getElementById("ranking-close-button");


/* ==================================================
   ランキング画面を開く
================================================== */

function openRanking() {

    if (!rankingScreen) return;

    rankingScreen.style.display = "flex";

    loadRanking();

}


/* ==================================================
   ランキング画面を閉じる
================================================== */

function closeRanking() {

    if (!rankingScreen) return;

    rankingScreen.style.display = "none";

}


/* ==================================================
   仮ランキング
   ※後でCloudflare Workerに置き換える
================================================== */

/* ==================================================
   オンラインランキング取得
================================================== */

async function loadRanking() {

    if (!rankingList) return;


    rankingList.innerHTML = `
        <div class="ranking-loading">
            RANKING LOADING...
        </div>
    `;


    try {

        const response = await fetch(
            RANKING_API + "/ranking",
            {
                method: "GET"
            }
        );


        if (!response.ok) {
            throw new Error(
                "HTTP ERROR: " + response.status
            );
        }


        const result =
            await response.json();


        console.log(
            "ランキング取得結果:",
            result
        );


        if (
            !result.success ||
            !Array.isArray(result.ranking)
        ) {

            throw new Error(
                "ランキングデータが不正です"
            );

        }


        const rankingData =
            result.ranking;


        // =========================================
        // ランキングがまだ存在しない場合
        // =========================================

        if (rankingData.length === 0) {

            rankingList.innerHTML = `
                <div class="ranking-loading">
                    まだランキングデータがありません。
                </div>
            `;

            return;
        }


        rankingList.innerHTML = "";


        // =========================================
        // ランキング表示
        // =========================================

        rankingData.forEach(
            (player, index) => {

                const item =
                    document.createElement("div");


                item.className =
                    "ranking-item";


                // 自分かどうか
                let isMe = false;


                if (
                    typeof lineProfile !== "undefined" &&
                    lineProfile &&
                    player.userId === lineProfile.userId
                ) {

                    isMe = true;

                }


                if (isMe) {

                    item.classList.add(
                        "ranking-me"
                    );

                }


                // 順位
                const rank =
                    index + 1;


                // メダル
                let rankDisplay =
                    String(rank);


                if (rank === 1) {
                    rankDisplay = "🥇";
                }

                else if (rank === 2) {
                    rankDisplay = "🥈";
                }

                else if (rank === 3) {
                    rankDisplay = "🥉";
                }


                // 名前
                const name =
                    escapeRankingText(
                        player.displayName ||
                        "LINEユーザー"
                    );


                // スコア
                const playerScore =
                    Number(player.score) || 0;


                // =================================
                // HTML生成
                // =================================

                item.innerHTML = `

                    <div class="ranking-number">
                        ${rankDisplay}
                    </div>

                    ${
                        player.pictureUrl
                        ?
                        `
                        <img
                            class="ranking-icon"
                            src="${escapeRankingAttribute(
                                player.pictureUrl
                            )}"
                            alt=""
                        >
                        `
                        :
                        `
                        <div
                            class="ranking-icon"
                            style="
                                background:
                                rgba(255,255,255,0.12);
                            "
                        ></div>
                        `
                    }

                    <div class="ranking-name">

                        ${name}

                        ${
                            isMe
                            ?
                            `
                            <span
                                style="
                                    color:#00dcff;
                                    font-size:12px;
                                    margin-left:5px;
                                "
                            >
                                YOU
                            </span>
                            `
                            :
                            ""
                        }

                    </div>

                    <div class="ranking-score">
                        ${playerScore.toLocaleString()}
                    </div>

                `;


                rankingList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "ランキング取得エラー:",
            error
        );


        rankingList.innerHTML = `

            <div class="ranking-loading">

                ランキングを
                取得できませんでした。

                <br>

                <button
                    id="ranking-retry-button"
                    style="
                        margin-top:15px;
                        padding:10px 20px;
                        border:none;
                        border-radius:8px;
                        background:rgba(255,255,255,0.12);
                        color:white;
                        cursor:pointer;
                    "
                >
                    RETRY
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "ranking-retry-button"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadRanking
            );

        }

    }

}


/* ==================================================
   ランキング用文字列安全化
================================================== */

function escapeRankingText(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function escapeRankingAttribute(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


/* ==================================================
   ボタン
================================================== */

if (rankingButton) {

    rankingButton.addEventListener(
        "click",
        openRanking
    );

}


if (rankingButtonGameOver) {

    rankingButtonGameOver.addEventListener(
        "click",
        openRanking
    );

}


if (rankingCloseButton) {

    rankingCloseButton.addEventListener(
        "click",
        closeRanking
    );

}

initLIFF();