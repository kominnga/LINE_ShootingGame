const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const hpText = document.getElementById("hp");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const howtoButton =
    document.getElementById("howto-button");
const howtoScreen =
    document.getElementById("howto-screen");

const howtoCloseButton =
    document.getElementById("howto-close-button");

const howtoPcTab =
    document.getElementById("howto-pc-tab");

const howtoMobileTab =
    document.getElementById("howto-mobile-tab");

const howtoPcControls =
    document.getElementById("howto-pc-controls");

const howtoMobileControls =
    document.getElementById("howto-mobile-controls");
    const shieldButton =
    document.getElementById("shieldButton");

const bombButton =
    document.getElementById("bombButton");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const returnStartButton =document.getElementById("return-start-button");

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

let bombFlashTimer = 0;
// ========================================
// スキン能力
// ========================================



// ========================================
// コインシステム
// ========================================

let coins =
    Number(localStorage.getItem("nexus-coins")) || 0;


    function updateCoinDisplays() {

        const startCoins =
            document.getElementById("start-coins");

        const gameoverCoins =
            document.getElementById("gameover-coins");

            const garageCoins =
    document.getElementById("garage-coins");

        const currentCoins =
            Number(localStorage.getItem("nexus-coins")) || 0;

        if (startCoins) {
            startCoins.textContent =
                currentCoins.toLocaleString();
        }

        if (gameoverCoins) {
            gameoverCoins.textContent =
                currentCoins.toLocaleString();
        }

        if (garageCoins) {

    garageCoins.textContent =
        currentCoins.toLocaleString();

}
    } 


// コインを追加
function addCoins(amount) {

    amount = Math.floor(amount);

    if (amount <= 0) return;

    coins += amount;

    localStorage.setItem(
        "nexus-coins",
        String(coins)
    );

    updateCoinDisplays();

    console.log(`🪙 +${amount} COINS`);
}

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


// ========================================
// ITEM EFFECTS
// ========================================

// HEAL演出
let healEffectTimer = 0;
let healEffectParticles = [];

// SHIELD演出
let shieldHitTimer = 0;
let shieldHitX = 0;
let shieldHitY = 0;



// BOMB演出
let bombEffectTimer = 0;
let bombEffectRadius = 0;
let bombEffectParticles = [];
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

// ========================================
// BEAM EFFECT SYSTEM
// ========================================

// ビーム発射演出
let beamStartEffect = 0;

// ビームのエネルギー蓄積
let beamEnergy = 0;

// ビームヒット演出
let beamHitEffectTimer = 0;
let beamHitX = 0;
let beamHitY = 0;

// ビームが当たった瞬間の強さ
let beamImpactPower = 0;
// ================================
// SHIELD
// ================================
let shieldActive = false;
let shieldTimer = 0;
const shieldDuration = 8;

let shieldCooldown = 0;
const shieldCooldownMax = 30;

// ==============================
// SHIELD
// ==============================


// ================================
// BOMB
// ================================
let bombCooldown = 0;
const bombCooldownMax = 20;

// ========================================
// SKIN SYSTEM
// ========================================

const skins = [
    {
        id: "nexus-01",
        name: "NEXUS-01",
        price: 0
    },
    {
        id: "nexus-02",
        name: "NEXUS-02",
        price: 3000
    },
    {
        id: "nexus-03",
        name: "NEXUS-03",
        price: 5000
    },
    {
        id: "nexus-04",
        name: "NEXUS-04",
        price: 8000
    },
    {
        id: "nexus-05",
        name: "NEXUS-05",
        price: 12000
    }
];

let selectedSkinIndex = 0;

let equippedSkin =
    localStorage.getItem("nexus-equipped-skin")
    || "nexus-01";

const garageScreen =
    document.getElementById("garage-screen");

const garageButton =
    document.getElementById("garage-button");

const garageCloseButton =
    document.getElementById("garage-close-button");

const skinPrevButton =
    document.getElementById("skin-prev");

const skinNextButton =
    document.getElementById("skin-next");

const skinEquipButton =
    document.getElementById("skin-equip-button");

const skinName =
    document.getElementById("skin-name");

const skinNumber =
    document.getElementById("skin-number");

    const skinType =
    document.getElementById("skin-type");

const skinDescription =
    document.getElementById("skin-description");

const skinAbility =
    document.getElementById("skin-ability");

const skinStatus =
    document.getElementById("skin-status");

const skinPreviewCanvas =
    document.getElementById("skin-preview-canvas");

const skinPreviewCtx =
    skinPreviewCanvas
        ? skinPreviewCanvas.getContext("2d")
        : null;

// ========================================
// 所持スキン
// ========================================

let ownedSkins = JSON.parse(
    localStorage.getItem("nexus-owned-skins")
    || '["nexus-01"]'
);


saveOwnedSkins();

// NEXUS-01は必ず所持
if (!ownedSkins.includes("nexus-01")) {
    ownedSkins.push("nexus-01");
}

function isSkinOwned(skinId) {

    return ownedSkins.includes(skinId);

}

function saveOwnedSkins() {

    localStorage.setItem(
        "nexus-owned-skins",
        JSON.stringify(ownedSkins)
    );

}

// 現在装備しているスキンを探す
const equippedIndex = skins.findIndex(
    skin => skin.id === equippedSkin
);

if (equippedIndex >= 0) {
    selectedSkinIndex = equippedIndex;
}
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

        handleMenuScreen();

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


function updateGarage() {

    const skin =
        skins[selectedSkinIndex];

    if (!skin) {
        return;
    }

    const skinInfo = {

        "nexus-01": {
            type: "STANDARD TYPE",
            description:
                "バランスに優れた標準型機体。\nあらゆる状況に対応できる基本機。",
            ability:
                "ABILITY：標準性能"
        },

        "nexus-02": {
            type: "SPEED TYPE",
            description:
                "軽量化された高速機。\n高い機動力で敵の攻撃をかわす。",
            ability:
                "ABILITY：移動速度 +35%"
        },

        "nexus-03": {
            type: "ATTACK TYPE",
            description:
                "攻撃性能に特化した戦闘機。\n通常機より高速で弾を発射できる。",
            ability:
                "ABILITY：連射速度 +15%"
        },

        "nexus-04": {
            type: "BEAM TYPE",
            description:
                "特殊ビーム兵器を搭載した機体。\n広範囲を薙ぎ払う強力なビームを放つ。",
            ability:
                "ABILITY：ビーム幅 90 → 150"
        },

        "nexus-05": {
            type: "HEAVY TYPE",
            description:
                "重装甲を採用した高耐久機。\n圧倒的な耐久力で戦線に居座る。",
            ability:
                "ABILITY：MAX HP 3 → 5"
        }

    };

    const info =
        skinInfo[skin.id];

    // ========================================
    // 基本情報
    // ========================================

    if (skinName) {
        skinName.textContent =
            skin.name;
    }

    if (skinNumber) {
        skinNumber.textContent =
            `${selectedSkinIndex + 1} / ${skins.length}`;
    }

    if (skinType && info) {
        skinType.textContent =
            info.type;
    }

    if (skinDescription && info) {
        skinDescription.textContent =
            info.description;
    }

    if (skinAbility && info) {
        skinAbility.textContent =
            info.ability;
    }


    // ========================================
    // 所持・装備状態
    // ========================================

    const owned =
        isSkinOwned(skin.id);

    const equipped =
        skin.id === equippedSkin;


    if (skinStatus) {

        skinStatus.classList.remove(
            "skin-not-enough",
            "skin-sold-out"
        );

        if (equipped) {

            skinStatus.textContent =
                `✓ 装備中：${skin.name}`;

        }

        else if (owned) {

            skinStatus.textContent =
                `✓ 所持済み：${skin.name}  •  SOLD OUT`;

            skinStatus.classList.add(
                "skin-sold-out"
            );

        }

        else {

            skinStatus.textContent =
                `未所持：${skin.name}`;

        }
    }


    // ========================================
    // 購入 / 装備ボタン
    // ========================================

    if (skinEquipButton) {

        skinEquipButton.classList.remove(
            "garage-equipped",
            "garage-owned",
            "garage-buy",
            "garage-disabled"
        );


        // ------------------------------------
        // 装備中
        // ------------------------------------

        if (equipped) {

            skinEquipButton.textContent =
                "✓ EQUIPPED";

            skinEquipButton.disabled =
                true;

            skinEquipButton.classList.add(
                "garage-equipped"
            );

        }


        // ------------------------------------
        // 所持済み
        // ------------------------------------

        else if (owned) {

            skinEquipButton.textContent =
                "装備する";

            skinEquipButton.disabled =
                false;

            skinEquipButton.classList.add(
                "garage-owned"
            );

        }


        // ------------------------------------
        // 未所持
        // ------------------------------------

        else {

            skinEquipButton.textContent =
                `🪙 ${skin.price.toLocaleString()} COINS で購入`;

            skinEquipButton.disabled =
                false;

            skinEquipButton.classList.add(
                "garage-buy"
            );

        }

    }


    // ========================================
    // コイン表示
    // ========================================

    updateCoinDisplays();


    // ========================================
    // プレビュー更新
    // ========================================

    drawSkinPreview();


    // ========================================
    // 切り替え演出
    // ========================================

    playGaragePreviewAnimation(
        skin.id
    );

}
function useShield() {

    if (shieldActive) return;
    if (shieldCooldown > 0) return;

    shieldActive = true;
    shieldTimer = shieldDuration;

    shieldCooldown = shieldCooldownMax;

    screenShake = 8;

    updateItemButtons();
}
function useBomb() {

    if (bombCooldown > 0) return;

    bombCooldown = bombCooldownMax;

    screenShake = 20;
    hitFlash = 0.25;
    bombFlashTimer = 0.18;

        // ==============================
    // BOMB演出開始
    // ==============================

    bombEffectTimer = 1.0;
    bombEffectRadius = 0;

    bombEffectParticles = [];

    for (let i = 0; i < 45; i++) {

        const angle =
            Math.random() *
            Math.PI * 2;

        const speed =
            80 +
            Math.random() * 280;

        bombEffectParticles.push({

            x: player.x,
            y: player.y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                0.5 +
                Math.random() * 0.5,

            maxLife:
                0.5 +
                Math.random() * 0.5,

            size:
                2 +
                Math.random() * 5
        });
    }

    // 通常敵を全滅
    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        createExplosion(
            enemy.x,
            enemy.y,
            enemy.size * 1.5
        );

        score += enemy.score;

        addCoins(
            enemy.type === "normal"
                ? 10
                : enemy.type === "fast"
                ? 15
                : enemy.type === "big"
                ? 50
                : 10
        );          

        enemies.splice(i, 1);
    }

    // 敵弾を全消去
    enemyBullets = [];

    // BOSSにも100ダメージ
    if (boss && bossActive) {

        boss.hp -= 100;

        createExplosion(
            boss.x,
            boss.y,
            80
        );

        if (boss.hp <= 0) {
            defeatBoss();
            return;
        }
    }

    updateHUD();
    updateItemButtons();
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


function drawBombEffect() {

    if (bombEffectTimer <= 0) {
        return;
    }

    const progress =
        1 -
        bombEffectTimer / 1.0;

    const radius =
        progress * Math.max(width, height) * 0.75;

    const alpha =
        Math.max(
            0,
            1 - progress
        );

    ctx.save();

    // ==============================
    // 爆発リング
    // ==============================

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        `rgba(255,120,30,${alpha})`;

    ctx.lineWidth =
        15 * (1 - progress) + 3;

    ctx.shadowColor =
        "#ff6a00";

    ctx.shadowBlur = 35;

    ctx.stroke();


    // ==============================
    // 白い衝撃波
    // ==============================

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        radius * 0.82,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        `rgba(255,240,200,${alpha * 0.8})`;

    ctx.lineWidth = 4;

    ctx.stroke();


    // ==============================
    // 爆発粒子
    // ==============================

    for (const p of bombEffectParticles) {

        const pAlpha =
            Math.max(
                0,
                p.life / p.maxLife
            );

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,140,40,${pAlpha})`;

        ctx.shadowColor =
            "#ff7a00";

        ctx.shadowBlur = 12;

        ctx.fill();
    }

    ctx.restore();
}
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

function drawSkinPreview() {

    if (!skinPreviewCtx) return;

    const ctx = skinPreviewCtx;

    const width =
        skinPreviewCanvas.width;

    const height =
        skinPreviewCanvas.height;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const centerX =
        width / 2;

    const centerY =
        height / 2 + 5;

    const skin =
        skins[selectedSkinIndex];

    /*
        今回は5機体を
        仮デザインで表示する。

        次の段階で
        実際のゲーム内プレイヤー
        と完全に同じデザインへ変更する。
    */

    ctx.save();

    // 発光
    ctx.shadowBlur = 25;

    if (skin.id === "nexus-01") {
        ctx.shadowColor = "#38a8ff";
    }

    if (skin.id === "nexus-02") {
        ctx.shadowColor = "#35e0ff";
    }

    if (skin.id === "nexus-03") {
        ctx.shadowColor = "#ffb13b";
    }

    if (skin.id === "nexus-04") {
        ctx.shadowColor = "#d95cff";
    }

    if (skin.id === "nexus-05") {
        ctx.shadowColor = "#9b4dff";
    }


    // ==========================
    // 機体本体
    // ==========================

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY - 70
    );

    ctx.lineTo(
        centerX - 38,
        centerY + 50
    );

    ctx.lineTo(
        centerX,
        centerY + 32
    );

    ctx.lineTo(
        centerX + 38,
        centerY + 50
    );

    ctx.closePath();


    // スキンごとの色
    if (skin.id === "nexus-01") {

        ctx.fillStyle =
            "#168cff";
    }

    else if (skin.id === "nexus-02") {

        ctx.fillStyle =
            "#20d9e8";
    }

    else if (skin.id === "nexus-03") {

        ctx.fillStyle =
            "#d88925";
    }

    else if (skin.id === "nexus-04") {

        const gradient =
            ctx.createLinearGradient(
                centerX - 40,
                0,
                centerX + 40,
                0
            );

        gradient.addColorStop(
            0,
            "#ff4fd8"
        );

        gradient.addColorStop(
            0.5,
            "#8a5cff"
        );

        gradient.addColorStop(
            1,
            "#38c8ff"
        );

        ctx.fillStyle =
            gradient;
    }

    else if (skin.id === "nexus-05") {

        ctx.fillStyle =
            "#161020";
    }

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle =
        "rgba(255,255,255,0.7)";

    ctx.stroke();


    // ==========================
    // コックピット
    // ==========================

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY - 40
    );

    ctx.lineTo(
        centerX - 13,
        centerY + 8
    );

    ctx.lineTo(
        centerX + 13,
        centerY + 8
    );

    ctx.closePath();

    ctx.fillStyle =
        "#dff8ff";

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#5eeaff";

    ctx.fill();


    // ==========================
    // エンジン
    // ==========================

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff6b35";

    ctx.fillStyle =
        "#ff9d42";

    ctx.beginPath();

    ctx.moveTo(
        centerX - 13,
        centerY + 40
    );

    ctx.lineTo(
        centerX - 5,
        centerY + 70
    );

    ctx.lineTo(
        centerX,
        centerY + 48
    );

    ctx.lineTo(
        centerX + 5,
        centerY + 70
    );

    ctx.lineTo(
        centerX + 13,
        centerY + 40
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
}

function selectPreviousSkin() {

    selectedSkinIndex--;

    if (selectedSkinIndex < 0) {
        selectedSkinIndex =
            skins.length - 1;
    }

    updateGarage();
}


function selectNextSkin() {

    selectedSkinIndex++;

    if (selectedSkinIndex >= skins.length) {
        selectedSkinIndex = 0;
    }

    updateGarage();
}
function equipSelectedSkin() {

    const skin =
        skins[selectedSkinIndex];

    if (!skin) {
        return;
    }


    if (!isSkinOwned(skin.id)) {
        return;
    }


    if (
        skin.id ===
        equippedSkin
    ) {

        return;
    }


    equippedSkin =
        skin.id;


    localStorage.setItem(
        "nexus-equipped-skin",
        equippedSkin
    );


    updateGarage();


    playEquipAnimation(
        skin
    );
}

// ==================================================
// EQUIP COMPLETE
// ==================================================

function playEquipAnimation(skin) {

    if (!skin) {
        return;
    }


    let overlay =
        document.getElementById(
            "garage-equip-complete"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "garage-equip-complete";


        overlay.innerHTML = `

            <div class="equip-complete-line"></div>

            <div class="equip-complete-text">
                SYSTEM LINK
            </div>

            <div
                id="equip-complete-skin"
                class="equip-complete-skin">
            </div>

            <div class="equip-complete-status">
                ✓ EQUIPPED
            </div>

        `;


        document.body.appendChild(
            overlay
        );
    }


    document.getElementById(
        "equip-complete-skin"
    ).textContent =
        skin.name;


    overlay.classList.remove(
        "equip-complete-visible"
    );


    void overlay.offsetWidth;


    overlay.classList.add(
        "equip-complete-visible"
    );


    setTimeout(
        () => {

            overlay.classList.remove(
                "equip-complete-visible"
            );

        },
        1400
    );
}
/* ==================================================
   GARAGE 購入確認
================================================== */

let purchaseTargetSkin = null;

function openPurchaseConfirm(skin) {

    if (!skin) {
        return;
    }

    purchaseTargetSkin = skin;

    let modal =
        document.getElementById(
            "garage-purchase-modal"
        );

    // 初回だけ作成
    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "garage-purchase-modal";

        modal.innerHTML = `

            <div class="purchase-modal-panel">

                <div class="purchase-modal-label">
                    NEXUS GARAGE
                </div>

                <div
                    id="purchase-modal-title"
                    class="purchase-modal-title">
                    PURCHASE
                </div>

                <div
                    id="purchase-modal-skin"
                    class="purchase-modal-skin">
                </div>

                <div
                    id="purchase-modal-price"
                    class="purchase-modal-price">
                </div>

                <div
                    id="purchase-modal-balance"
                    class="purchase-modal-balance">
                </div>

                <div class="purchase-modal-question">
                    この機体を購入しますか？
                </div>

                <div class="purchase-modal-buttons">

                    <button
                        id="purchase-confirm-button"
                        type="button">
                        PURCHASE
                    </button>

                    <button
                        id="purchase-cancel-button"
                        type="button">
                        CANCEL
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const confirmButton =
            document.getElementById(
                "purchase-confirm-button"
            );

        const cancelButton =
            document.getElementById(
                "purchase-cancel-button"
            );

        confirmButton.addEventListener(
            "click",
            confirmPurchase
        );

        cancelButton.addEventListener(
            "click",
            closePurchaseConfirm
        );
    }

    const title =
        document.getElementById(
            "purchase-modal-skin"
        );

    const price =
        document.getElementById(
            "purchase-modal-price"
        );

    const balance =
        document.getElementById(
            "purchase-modal-balance"
        );

    title.textContent =
        skin.name;

    price.textContent =
        `🪙 ${skin.price.toLocaleString()} COINS`;

    balance.textContent =
        `現在の所持コイン：${coins.toLocaleString()} COINS`;

    modal.classList.add(
        "purchase-modal-visible"
    );
}
/* ==================================================
   GARAGE 購入アニメーション
================================================== */

function playPurchaseAnimation(skin) {

    if (!garageScreen) {
        return;
    }

    const panel =
        document.getElementById(
            "garage-panel"
        );

    if (panel) {

        panel.classList.remove(
            "purchase-success-flash"
        );

        void panel.offsetWidth;

        panel.classList.add(
            "purchase-success-flash"
        );
    }

    // ========================================
    // PURCHASED表示
    // ========================================

    const effect =
        document.createElement("div");

    effect.className =
        "purchase-success-effect";

    effect.innerHTML = `

        <div class="purchase-success-main">
            PURCHASED
        </div>

        <div class="purchase-success-skin">
            ${skin.name}
        </div>

        <div class="purchase-success-coin">
            🪙 PURCHASE COMPLETE
        </div>

    `;

    document.body.appendChild(
        effect
    );

    // ========================================
    // コインパーティクル
    // ========================================

    for (let i = 0; i < 16; i++) {

        const coin =
            document.createElement("span");

        coin.className =
            "purchase-coin-particle";

        coin.textContent =
            "🪙";

        coin.style.setProperty(
            "--particle-x",
            `${Math.random() * 280 - 140}px`
        );

        coin.style.setProperty(
            "--particle-y",
            `${Math.random() * -180 - 40}px`
        );

        coin.style.animationDelay =
            `${Math.random() * 0.15}s`;

        effect.appendChild(
            coin
        );
    }

    setTimeout(
        () => {

            effect.remove();

        },
        1600
    );

}


function closePurchaseConfirm() {

    const modal =
        document.getElementById(
            "garage-purchase-modal"
        );

    if (modal) {

        modal.classList.remove(
            "purchase-modal-visible"
        );

    }

    purchaseTargetSkin = null;
}

function buySelectedSkin() {

    const skin =
        skins[selectedSkinIndex];

    if (!skin) {
        return;
    }

    // すでに所持している
    if (isSkinOwned(skin.id)) {
        return;
    }

    // ========================================
    // 無料スキン
    // ========================================

    if (skin.price <= 0) {

        ownedSkins.push(
            skin.id
        );

        saveOwnedSkins();

        equippedSkin =
            skin.id;

        localStorage.setItem(
            "nexus-equipped-skin",
            equippedSkin
        );

        updateGarage();

        return;
    }

    // ========================================
    // コイン確認
    // ========================================

    if (coins < skin.price) {

        alert(
            `コインが足りません。\n\n` +
            `必要：🪙 ${skin.price.toLocaleString()} COINS\n` +
            `所持：🪙 ${coins.toLocaleString()} COINS`
        );

        return;
    }

    // ========================================
    // コインを支払う
    // ========================================

    coins -= skin.price;

    localStorage.setItem(
        "nexus-coins",
        String(coins)
    );

    // ========================================
    // 所持スキンに追加
    // ========================================

    ownedSkins.push(
        skin.id
    );

    saveOwnedSkins();

    // ========================================
    // 購入したら自動装備
    // ========================================

    equippedSkin =
        skin.id;

    localStorage.setItem(
        "nexus-equipped-skin",
        equippedSkin
    );

    // ========================================
    // 表示更新
    // ========================================

    updateCoinDisplays();
    updateGarage();

    alert(
        `${skin.name} を購入しました！ 🚀`
    );

}

// ==================================================
// 購入確認
// ==================================================



// ==================================================
// COINS不足
// ==================================================

function showCoinsNotEnough(skin) {

    if (!skin) {
        return;
    }


    const shortage =
        Math.max(
            0,
            skin.price - coins
        );


    if (skinStatus) {

        skinStatus.textContent =
            `⚠ COINS不足　あと ${shortage.toLocaleString()} COINS必要`;

        skinStatus.classList.add(
            "skin-not-enough"
        );
    }





    // 少し経ったら通常表示へ
    setTimeout(
        () => {

            if (
                skinStatus &&
                skins[selectedSkinIndex] === skin
            ) {

                updateGarage();
            }

        },
        1600
    );
}

// ==================================================
// PURCHASE COMPLETE
// ==================================================

function playPurchaseAnimation(skin) {

    if (!skin) {
        return;
    }


    let overlay =
        document.getElementById(
            "garage-purchase-complete"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "garage-purchase-complete";


        overlay.innerHTML = `

            <div class="purchase-complete-panel">

                <div class="purchase-complete-label">
                    NEXUS GARAGE
                </div>

                <div class="purchase-complete-title">
                    PURCHASED
                </div>

                <div
                    id="purchase-complete-skin"
                    class="purchase-complete-skin">
                </div>

                <div class="purchase-complete-line">
                </div>

                <div class="purchase-complete-sub">
                    PURCHASE COMPLETE
                </div>

                <div
                    id="purchase-complete-particles"
                    class="purchase-complete-particles">
                </div>

            </div>
        `;


        document.body.appendChild(
            overlay
        );
    }


    document.getElementById(
        "purchase-complete-skin"
    ).textContent =
        skin.name;


    const particleContainer =
        document.getElementById(
            "purchase-complete-particles"
        );


    particleContainer.innerHTML =
        "";


    // 軽量なコイン粒子
    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );

        particle.textContent =
            i % 2 === 0
                ? "✦"
                : "🪙";


        particle.style.setProperty(
            "--particle-x",
            `${(Math.random() - 0.5) * 260}px`
        );


        particle.style.setProperty(
            "--particle-y",
            `${-60 - Math.random() * 180}px`
        );


        particle.style.animationDelay =
            `${Math.random() * 0.25}s`;


        particleContainer.appendChild(
            particle
        );
    }


    overlay.classList.remove(
        "purchase-complete-visible"
    );


    void overlay.offsetWidth;


    overlay.classList.add(
        "purchase-complete-visible"
    );


    setTimeout(
        () => {

            overlay.classList.remove(
                "purchase-complete-visible"
            );

        },
        2600
    );
}

// ==================================================
// GARAGE 機体プレビュー演出
// ==================================================

// ==================================================
// GARAGE 機体切り替え演出
// ==================================================

function playGaragePreviewAnimation(
    skinId
) {

    if (!skinPreviewCanvas) {
        return;
    }


    // ========================================
    // 現在のアニメーションをリセット
    // ========================================

    skinPreviewCanvas.classList.remove(
        "garage-preview-enter",
        "garage-preview-nexus04"
    );


    void skinPreviewCanvas.offsetWidth;


    // ========================================
    // スキャン演出
    // ========================================

    skinPreviewCanvas.classList.add(
        "garage-preview-enter"
    );


    // ========================================
    // NEXUS-04専用
    // ========================================

    if (
        skinId ===
        "nexus-04"
    ) {

        skinPreviewCanvas.classList.add(
            "garage-preview-nexus04"
        );
    }
}
// ==================================================
// 購入確定
// ==================================================

function confirmPurchase() {

    const skin =
        purchaseTargetSkin;

    if (!skin) {
        return;
    }


    // 二重購入防止
    if (isSkinOwned(skin.id)) {

        closePurchaseConfirm();

        updateGarage();

        return;
    }


    // ========================================
    // 最終コインチェック
    // ========================================

    if (
        skin.price > 0 &&
        coins < skin.price
    ) {

        closePurchaseConfirm();

        showCoinsNotEnough(
            skin
        );

        return;
    }


    // ========================================
    // コイン消費
    // ========================================

    coins -=
        skin.price;


    localStorage.setItem(
        "nexus-coins",
        String(coins)
    );


    // ========================================
    // 所持登録
    // ========================================

    ownedSkins.push(
        skin.id
    );

    saveOwnedSkins();


    // ========================================
    // 自動装備
    // ========================================

    equippedSkin =
        skin.id;


    localStorage.setItem(
        "nexus-equipped-skin",
        equippedSkin
    );


    // ========================================
    // UI更新
    // ========================================

    closePurchaseConfirm();

    updateCoinDisplays();

    updateGarage();


    // ========================================
    // 購入成功演出
    // ========================================

    playPurchaseAnimation(
        skin
    );
}

// ==================================================
// 購入確認を閉じる
// ==================================================

function closePurchaseConfirm() {

    const modal =
        document.getElementById(
            "garage-purchase-modal"
        );

    if (modal) {

        modal.classList.remove(
            "purchase-modal-visible"
        );
    }

    purchaseTargetSkin =
        null;
}



function openGarage() {

    if (!garageScreen) {
        return;
    }

    garageScreen.style.display =
        "flex";

    updateCoinDisplays();

    updateGarage();

}

function closeGarage() {

    if (!garageScreen) {
        return;
    }

    garageScreen.style.display =
        "none";

    if (startScreen) {

        startScreen.style.display =
            "flex";

    }

    updateCoinDisplays();

}

if (garageButton) {

    garageButton.addEventListener(
        "click",
        openGarage
    );
}


if (garageCloseButton) {

    garageCloseButton.addEventListener(
        "click",
        closeGarage
    );
}





if (skinPrevButton) {

    skinPrevButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            selectPreviousSkin();
        }
    );
}

if (skinNextButton) {

    skinNextButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            selectNextSkin();
        }
    );
}

if (skinEquipButton) {

    skinEquipButton.addEventListener(
        "click",
        () => {

            const skin =
                skins[selectedSkinIndex];

            if (!skin) {
                return;
            }

            // ========================================
            // 未所持
            // ========================================

            if (!isSkinOwned(skin.id)) {

                // コイン不足
                if (coins < skin.price) {

                    buySelectedSkin();

                    return;
                }

                // 購入確認
                buySelectedSkin();

                return;
            }

            // ========================================
            // 所持済み → 装備
            // ========================================

            equipSelectedSkin();

        }
    );

}






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
    hp = getMaxHP();

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
    updateCoinDisplays();

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
beamCooldown = beamCooldownMax;

shieldActive = false;
shieldTimer = 0;
shieldCooldown = shieldCooldownMax;

bombCooldown = bombCooldownMax;

setItemControlsVisible(true);

    player.x = width / 2;
    player.y = height - 150;

    player.fireCooldown = 0;

    updateHUD();

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    setItemControlsVisible(true);
    gameRunning = true;

    lastTime = performance.now();

    updateCoinDisplays();
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

    setItemControlsVisible(false);
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
                    isMultiple: true
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

    const maxHP = getMaxHP();

    scoreText.textContent = score;
    hpText.textContent = `${hp} / ${maxHP}`;

}

// ========================================
// SKIN ABILITY SYSTEM
// ========================================

function getEquippedSkin() {

    return (
        localStorage.getItem("nexus-equipped-skin")
        || "nexus-01"
    );

}


function getMaxHP() {

    const skin = getEquippedSkin();

    if (skin === "nexus-05") {
        return 5;
    }

    return 3;
}


// 移動速度
function getPlayerSpeed() {

    const skin = getEquippedSkin();

    // NEXUS-02 SPEED TYPE
    if (skin === "nexus-02") {
        return 330 * 1.35;
    }

    return 330;
}


// 弾の発射間隔
function getFireInterval() {

    const skin = getEquippedSkin();

    // NEXUS-03 ATTACK TYPE
    if (skin === "nexus-03") {
        return 0.11;
    }

    return 0.13;
}


// ビーム幅
function getBeamWidth() {

    const skin = getEquippedSkin();

    // NEXUS-04 BEAM TYPE
    if (skin === "nexus-04") {
        return 150;
    }

    return 90;
}


/* ==================================================
   スコア加算
================================================== */

function addScore(value) {

    score += value;

    updateHUD();

}

function useHealItem() {

    if (!gameRunning) {
        return;
    }

    const maxHP = getMaxHP();

    // HP満タン
    if (hp >= maxHP) {
        return;
    }

    // クールダウン中
    if (healCooldown > 0) {
        return;
    }

    // HP +1
    hp++;

    // 60秒チャージ
    healCooldown = healCooldownMax;

    // ==============================
    // HEAL演出開始
    // ==============================

    healEffectTimer = 1.2;

    healEffectParticles = [];

    for (let i = 0; i < 18; i++) {

        healEffectParticles.push({
            x: player.x + (Math.random() - 0.5) * 45,
            y: player.y + 20 + Math.random() * 25,
            vx: (Math.random() - 0.5) * 25,
            vy: -40 - Math.random() * 50,
            life: 0.8 + Math.random() * 0.5,
            maxLife: 0.8 + Math.random() * 0.5,
            size: 2 + Math.random() * 3
        });

    }

    screenShake = 3;

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
    getFireInterval();

}
function drawHealEffect() {

    if (healEffectTimer <= 0) {
        return;
    }

    const progress =
        1 - healEffectTimer / 1.2;

    const radius =
        25 + progress * 45;

    const alpha =
        Math.max(0, 1 - progress);

    ctx.save();

    // ==============================
    // 回復リング
    // ==============================

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        `rgba(80, 255, 160, ${alpha})`;

    ctx.lineWidth = 4;

    ctx.shadowColor =
        "#50ffb0";

    ctx.shadowBlur = 20;

    ctx.stroke();


    // ==============================
    // +1 HP
    // ==============================

    ctx.font =
        "bold 22px Arial";

    ctx.textAlign = "center";

    ctx.fillStyle =
        `rgba(120, 255, 180, ${alpha})`;

    ctx.shadowColor =
        "#50ffb0";

    ctx.shadowBlur = 12;

    ctx.fillText(
        "+1 HP",
        player.x,
        player.y - 55 - progress * 20
    );


    // ==============================
    // 回復粒子
    // ==============================

    for (const p of healEffectParticles) {

        const pAlpha =
            Math.max(
                0,
                p.life / p.maxLife
            );

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(100,255,180,${pAlpha})`;

        ctx.fill();
    }

    ctx.restore();
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

    // ==============================
    // ビーム発射開始
    // ==============================

    beamActive = true;

    beamTimer = beamDuration;

    beamStartEffect = 0.35;

    beamEnergy = 0;

    beamHitEffectTimer = 0;

    beamImpactPower = 0;


    // ==============================
    // NEXUS-04 OVERDRIVE
    // ==============================

    if (
        getEquippedSkin() === "nexus-04"
    ) {

        screenShake = 18;

    } else {

        screenShake = 7;

    }

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
        60% → NORMAL
        15% → FAST
        10% → BIG
        10% → SHOOTER
         5% → SPLITTER
    */

    if (typeRandom < 0.60) {

        type = "normal";

    } else if (typeRandom < 0.75) {

        type = "fast";

    } else if (typeRandom < 0.85) {

        type = "big";

    } else if (typeRandom < 0.95) {

        type = "shooter";

    } else {

        type = "splitter";

    }


    let size;
    let speed;
    let hp;
    let scoreValue;
    let shootInterval = 0;


    /* =================================
       NORMAL
    ================================= */

    if (type === "normal") {

        size = 40;

        // 速度固定
        speed = 150;

        hp = 1;

        scoreValue = 100;

    }


    /* =================================
       FAST
    ================================= */

    if (type === "fast") {

        size = 28;

        // 速度固定
        speed = 350;

        hp = 1;

        scoreValue = 150;

    }


    /* =================================
       BIG
    ================================= */

    if (type === "big") {

        size = 65;

        // 速度固定
        speed = 80;

        hp = 3;

        scoreValue = 500;

    }


    /* =================================
       SHOOTER
    ================================= */

    if (type === "shooter") {

        size = 38;

        speed = 105;

        hp = 2;

        scoreValue = 200;

        shootInterval = 1.6;

    }


    /* =================================
       SPLITTER
    ================================= */

    if (type === "splitter") {

        size = 46;

        speed = 95;

        hp = 2;

        scoreValue = 300;

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
            scoreValue,

        shootTimer:
            0,

        shootInterval:
            shootInterval

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

/* ==================================================
   プレイヤー描画
   SKIN対応
================================================== */

function drawPlayer() {

    player.engineTime += 0.15;

    const flameSize =
        28 +
        Math.sin(player.engineTime) * 7;

    /*
        GARAGEで装備したスキンを取得
    */
    const currentSkin =
        localStorage.getItem("nexus-equipped-skin")
        || "nexus-01";


    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    /* ==================================================
       エンジン炎
    ================================================== */

    ctx.beginPath();

    ctx.moveTo(-8, 20);

    ctx.lineTo(
        0,
        20 + flameSize
    );

    ctx.lineTo(8, 20);

    ctx.closePath();

    let flameColor = "#ff7b00";
    let flameShadow = "#ff4500";

    if (currentSkin === "nexus-02") {
        flameColor = "#39eaff";
        flameShadow = "#00cfff";
    }

    else if (currentSkin === "nexus-03") {
        flameColor = "#ff9d32";
        flameShadow = "#ff5a00";
    }

    else if (currentSkin === "nexus-04") {
        flameColor = "#d95cff";
        flameShadow = "#7b4dff";
    }

    else if (currentSkin === "nexus-05") {
        flameColor = "#8b4dff";
        flameShadow = "#4c16a8";
    }

    ctx.fillStyle = flameColor;

    ctx.shadowColor = flameShadow;
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


    /* ==================================================
       NEXUS-01
       標準型
    ================================================== */

    if (currentSkin === "nexus-01") {

        /* 本体 */

        ctx.beginPath();

        ctx.moveTo(0, -32);

        ctx.lineTo(-22, 24);

        ctx.lineTo(-4, 16);

        ctx.lineTo(0, 22);

        ctx.lineTo(4, 16);

        ctx.lineTo(22, 24);

        ctx.closePath();

        ctx.fillStyle = "#27dfff";

        ctx.shadowColor = "#00cfff";
        ctx.shadowBlur = 20;

        ctx.fill();


        /* 左翼 */

        ctx.beginPath();

        ctx.moveTo(-12, 4);

        ctx.lineTo(-30, 19);

        ctx.lineTo(-17, 18);

        ctx.closePath();

        ctx.fillStyle = "#148dcc";

        ctx.fill();


        /* 右翼 */

        ctx.beginPath();

        ctx.moveTo(12, 4);

        ctx.lineTo(30, 19);

        ctx.lineTo(17, 18);

        ctx.closePath();

        ctx.fillStyle = "#148dcc";

        ctx.fill();


        /* コックピット */

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
    }


    /* ==================================================
       NEXUS-02
       高速型
    ================================================== */

    else if (currentSkin === "nexus-02") {

        ctx.beginPath();

        ctx.moveTo(0, -38);

        ctx.lineTo(-14, 25);

        ctx.lineTo(-5, 18);

        ctx.lineTo(0, 25);

        ctx.lineTo(5, 18);

        ctx.lineTo(14, 25);

        ctx.closePath();

        ctx.fillStyle = "#20d9e8";

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 25;

        ctx.fill();


        /* 細い翼 */

        ctx.beginPath();

        ctx.moveTo(-7, 2);

        ctx.lineTo(-28, 20);

        ctx.lineTo(-12, 16);

        ctx.closePath();

        ctx.fillStyle = "#0da4c0";

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(7, 2);

        ctx.lineTo(28, 20);

        ctx.lineTo(12, 16);

        ctx.closePath();

        ctx.fill();


        /* 高速型コア */

        ctx.beginPath();

        ctx.arc(
            0,
            -12,
            6,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20;

        ctx.fill();
    }


    /* ==================================================
       NEXUS-03
       重装型
    ================================================== */

    else if (currentSkin === "nexus-03") {

        /* 重い本体 */

        ctx.beginPath();

        ctx.moveTo(0, -28);

        ctx.lineTo(-27, -2);

        ctx.lineTo(-32, 25);

        ctx.lineTo(-10, 20);

        ctx.lineTo(0, 28);

        ctx.lineTo(10, 20);

        ctx.lineTo(32, 25);

        ctx.lineTo(27, -2);

        ctx.closePath();

        ctx.fillStyle = "#d88925";

        ctx.shadowColor = "#ff8c00";
        ctx.shadowBlur = 18;

        ctx.fill();


        /* 装甲 */

        ctx.fillStyle = "#8e5418";

        ctx.fillRect(
            -28,
            2,
            12,
            22
        );

        ctx.fillRect(
            16,
            2,
            12,
            22
        );


        /* 中央コア */

        ctx.beginPath();

        ctx.arc(
            0,
            -7,
            9,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#fff1b0";

        ctx.shadowColor = "#ffb52e";
        ctx.shadowBlur = 20;

        ctx.fill();
    }


    /* ==================================================
       NEXUS-04
       BEAM型
    ================================================== */

    else if (currentSkin === "nexus-04") {

        /* 虹色グラデーション */

        const gradient =
            ctx.createLinearGradient(
                -30,
                0,
                30,
                0
            );

        gradient.addColorStop(
            0,
            "#ff4fd8"
        );

        gradient.addColorStop(
            0.25,
            "#8a5cff"
        );

        gradient.addColorStop(
            0.5,
            "#38c8ff"
        );

        gradient.addColorStop(
            0.75,
            "#5cffaa"
        );

        gradient.addColorStop(
            1,
            "#ffe45c"
        );


        ctx.beginPath();

        ctx.moveTo(0, -34);

        ctx.lineTo(-25, 25);

        ctx.lineTo(-6, 16);

        ctx.lineTo(0, 24);

        ctx.lineTo(6, 16);

        ctx.lineTo(25, 25);

        ctx.closePath();

        ctx.fillStyle = gradient;

        ctx.shadowColor = "#c85cff";
        ctx.shadowBlur = 30;

        ctx.fill();


        /* BEAMコア */

        ctx.beginPath();

        ctx.arc(
            0,
            -9,
            8,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 30;

        ctx.fill();
    }


    /* ==================================================
       NEXUS-05
       VOID型
    ================================================== */

    else if (currentSkin === "nexus-05") {

        /* VOID本体 */

        ctx.beginPath();

        ctx.moveTo(0, -36);

        ctx.lineTo(-25, 25);

        ctx.lineTo(-5, 17);

        ctx.lineTo(0, 26);

        ctx.lineTo(5, 17);

        ctx.lineTo(25, 25);

        ctx.closePath();

        ctx.fillStyle = "#130d20";

        ctx.shadowColor = "#8b4dff";
        ctx.shadowBlur = 30;

        ctx.fill();


        /* 紫の外装ライン */

        ctx.strokeStyle = "#9b5cff";

        ctx.lineWidth = 2;

        ctx.stroke();


        /* VOID翼 */

        ctx.beginPath();

        ctx.moveTo(-12, 2);

        ctx.lineTo(-34, 22);

        ctx.lineTo(-16, 17);

        ctx.closePath();

        ctx.fillStyle = "#24113d";

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(12, 2);

        ctx.lineTo(34, 22);

        ctx.lineTo(16, 17);

        ctx.closePath();

        ctx.fill();


        /* VOIDコア */

        ctx.beginPath();

        ctx.arc(
            0,
            -9,
            7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#d9a3ff";

        ctx.shadowColor = "#a94dff";
        ctx.shadowBlur = 30;

        ctx.fill();
    }

    drawLevelTransitionInvincibility();

    ctx.restore();

}

function showHowToPC() {

    if (howtoPcControls) {
        howtoPcControls.style.display = "block";
    }

    if (howtoMobileControls) {
        howtoMobileControls.style.display = "none";
    }

    if (howtoPcTab) {
        howtoPcTab.classList.add("active");
    }

    if (howtoMobileTab) {
        howtoMobileTab.classList.remove("active");
    }
}


function showHowToMobile() {

    if (howtoPcControls) {
        howtoPcControls.style.display = "none";
    }

    if (howtoMobileControls) {
        howtoMobileControls.style.display = "block";
    }

    if (howtoPcTab) {
        howtoPcTab.classList.remove("active");
    }

    if (howtoMobileTab) {
        howtoMobileTab.classList.add("active");
    }
}
function updateBeam(deltaTime) {

    // ==============================
    // 発射開始演出
    // ==============================

    if (beamStartEffect > 0) {

        beamStartEffect -= deltaTime;

        if (beamStartEffect < 0) {
            beamStartEffect = 0;
        }
    }


    // ==============================
    // ビーム発射中
    // ==============================

    if (beamActive) {

        beamTimer -= deltaTime;


        // エネルギーを徐々に上昇
        beamEnergy +=
            deltaTime * 5;

        if (beamEnergy > 1) {
            beamEnergy = 1;
        }


        // ==========================
        // ビーム終了
        // ==========================

        if (beamTimer <= 0) {

            beamTimer = 0;

            beamActive = false;

            beamEnergy = 0;

            // 発射終了
            // ここから30秒チャージ
            beamCooldown =
                beamCooldownMax;
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


    // ==============================
    // ヒット演出
    // ==============================

    if (beamHitEffectTimer > 0) {

        beamHitEffectTimer -=
            deltaTime;

        beamImpactPower =
            Math.max(
                0,
                beamHitEffectTimer / 0.22
            );

        if (beamHitEffectTimer <= 0) {

            beamHitEffectTimer = 0;
            beamImpactPower = 0;
        }
    }
}
function updateItems(deltaTime) {

    // HEAL
    if (healCooldown > 0) {
        healCooldown -= deltaTime;
        if (healCooldown < 0) {
            healCooldown = 0;
        }
    }

    

    // SHIELD
    if (shieldCooldown > 0) {
        shieldCooldown -= deltaTime;
        if (shieldCooldown < 0) {
            shieldCooldown = 0;
        }
    }

    // SHIELD 持続時間
    if (shieldActive) {

        shieldTimer -= deltaTime;

        if (shieldTimer <= 0) {

            shieldTimer = 0;
            shieldActive = false;
        }
    }

    // BOMB
    if (bombCooldown > 0) {

        bombCooldown -= deltaTime;

        if (bombCooldown < 0) {
            bombCooldown = 0;
        }
    }
        // ==============================
    // HEAL演出更新
    // ==============================

    if (healEffectTimer > 0) {

        healEffectTimer -= deltaTime;

        for (const p of healEffectParticles) {

            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            p.life -= deltaTime;
        }

        if (healEffectTimer <= 0) {

            healEffectTimer = 0;
            healEffectParticles = [];
        }
    }

        // SHIELD被弾演出
    if (shieldHitTimer > 0) {

        shieldHitTimer -= deltaTime;

        if (shieldHitTimer < 0) {
            shieldHitTimer = 0;
        }
    }

        // ==============================
    // BOMB演出更新
    // ==============================

    if (bombEffectTimer > 0) {

        bombEffectTimer -= deltaTime;

        bombEffectRadius +=
            Math.max(width, height) *
            0.75 *
            deltaTime;

        for (const p of bombEffectParticles) {

            p.x +=
                p.vx *
                deltaTime;

            p.y +=
                p.vy *
                deltaTime;

            p.vx *= 0.97;
            p.vy *= 0.97;

            p.life -= deltaTime;
        }

        if (bombEffectTimer <= 0) {

            bombEffectTimer = 0;
            bombEffectParticles = [];
            bombEffectRadius = 0;
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

    /* =================================
   SHOOTER
================================= */

if (enemy.type === "shooter") {

    /* 本体 */

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
        "#27d9ff";

    ctx.shadowColor =
        "#00aaff";

    ctx.shadowBlur = 25;

    ctx.fill();


    /* 射撃コア */

    ctx.beginPath();

    ctx.arc(
        0,
        7,
        6,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#ffffff";

    ctx.shadowBlur = 15;

    ctx.fill();


    /* 前方砲口 */

    ctx.beginPath();

    ctx.rect(
        -4,
        enemy.height / 2 - 3,
        8,
        9
    );

    ctx.fillStyle =
        "#0077aa";

    ctx.fill();

}
/* =================================
   SPLITTER
================================= */

/* =================================
   SPLITTER
================================= */

if (enemy.type === "splitter") {

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        enemy.width / 2,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#43ff88";

    ctx.shadowColor =
        "#00ff66";

    ctx.shadowBlur =
        25;

    ctx.fill();


    /* 分裂ライン */

    ctx.strokeStyle =
        "#c8ffdc";

    ctx.lineWidth =
        3;

    ctx.beginPath();

    ctx.moveTo(
        -enemy.width * 0.28,
        -enemy.height * 0.28
    );

    ctx.lineTo(
        enemy.width * 0.28,
        enemy.height * 0.28
    );

    ctx.moveTo(
        enemy.width * 0.28,
        -enemy.height * 0.28
    );

    ctx.lineTo(
        -enemy.width * 0.28,
        enemy.height * 0.28
    );

    ctx.stroke();


    /* 中央コア */

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#ffffff";

    ctx.shadowBlur =
        15;

    ctx.fill();

}

/* =================================
   SPLIT CHILD
================================= */

if (enemy.type === "split-child") {

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
        "#8affb5";

    ctx.shadowColor =
        "#00ff66";

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

    if (!beamActive) {
        return;
    }


    const beamX =
        player.x;

    const beamWidth =
        getBeamWidth();


    const isOverdrive =
        getEquippedSkin() ===
        "nexus-04";


    let hitSomething = false;


    // ==================================================
    // 通常敵
    // ==================================================

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        if (
            enemy.x +
                enemy.width / 2 >
                beamX -
                beamWidth / 2 &&

            enemy.x -
                enemy.width / 2 <
                beamX +
                beamWidth / 2
        ) {

            enemy.hp -=
                beamDamage *
                0.016;


            // ビームヒット位置
            beamHitX =
                enemy.x;

            beamHitY =
                enemy.y;

            hitSomething = true;


            // 敵撃破
            if (enemy.hp <= 0) {

                score +=
                    enemy.score ||
                    100;


                // コイン
                if (
                    enemy.type ===
                    "normal"
                ) {

                    addCoins(10);

                } else if (
                    enemy.type ===
                    "fast"
                ) {

                    addCoins(15);

                } else if (
                    enemy.type ===
                    "big"
                ) {

                    addCoins(50);

                } else {

                    addCoins(10);
                }


                createExplosion(
                    enemy.x,
                    enemy.y,
                    isOverdrive
                        ? Math.min(
                            enemy.width,
                            35
                        )
                        : Math.min(
                            enemy.width,
                            25
                        )
                );


                // ヒット演出
                beamHitEffectTimer =
                    isOverdrive
                        ? 0.22
                        : 0.16;


                beamImpactPower = 1;


                enemies.splice(
                    i,
                    1
                );

                /* =================================
   SPLITTER分裂
================================= */

if (enemy.type === "splitter") {

    for (let s = 0; s < 2; s++) {

        const childSize = 22;

        enemies.push({

            x:
                enemy.x +
                (s === 0 ? -14 : 14),

            y:
                enemy.y,

            width:
                childSize,

            height:
                childSize,

            speed:
                145,

            rotation:
                Math.random() *
                Math.PI * 2,

            rotationSpeed:
                (Math.random() - 0.5) * 6,

            hp:
                1,

            maxHp:
                1,

            type:
                "split-child",

            score:
                50,

            shootTimer:
                0,

            shootInterval:
                0

        });

    }

}
            }
        }
    }


    // ==================================================
    // BOSS
    // ==================================================

    if (
        boss &&
        bossActive &&
        bossWarningTimer <= 0
    ) {

        if (
            boss.x +
                boss.width / 2 >
                beamX -
                beamWidth / 2 &&

            boss.x -
                boss.width / 2 <
                beamX +
                beamWidth / 2
        ) {

            boss.hp -=
                beamDamage *
                0.016;


            boss.flash =
                isOverdrive
                    ? 0.14
                    : 0.08;


            beamHitX =
                boss.x;

            beamHitY =
                boss.y;


            beamHitEffectTimer =
                isOverdrive
                    ? 0.22
                    : 0.16;


            beamImpactPower = 1;


            hitSomething = true;


            // BOSS撃破
            if (boss.hp <= 0) {

                defeatBoss();

                return;
            }
        }
    }


    if (hitSomething) {

        updateHUD();
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

    if (!beamActive) {
        return;
    }

    const skin =
        getEquippedSkin();

    const isOverdrive =
        skin === "nexus-04";

    const time =
        performance.now() / 1000;

    const beamWidth =
        getBeamWidth();

    const beamX =
        player.x;

    const beamTop =
        0;

    const beamBottom =
        Math.max(
            0,
            player.y - 20
        );


    // ==============================
    // ビームの出力
    // ==============================

    const power =
        Math.min(
            1,
            beamEnergy
        );


    ctx.save();


    // ==================================================
    // ① 発射口のチャージリング
    // ==================================================

    const muzzlePulse =
        1 +
        Math.sin(time * 12) * 0.12;

    const muzzleRadius =
        (isOverdrive ? 48 : 36) *
        muzzlePulse;


    ctx.beginPath();

    ctx.arc(
        beamX,
        beamBottom,
        muzzleRadius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        isOverdrive
            ? "rgba(0,255,255,0.95)"
            : "rgba(255,255,255,0.9)";

    ctx.lineWidth =
        isOverdrive ? 5 : 3;

    ctx.shadowColor =
        isOverdrive
            ? "#00ffff"
            : "#ffffff";

    ctx.shadowBlur =
        isOverdrive ? 30 : 20;

    ctx.stroke();


    // ==================================================
    // ② ビーム全体の外側グロー
    // ==================================================

    const glowWidth =
        beamWidth +
        (isOverdrive ? 55 : 35);


    const glowGradient =
        ctx.createLinearGradient(
            beamX - glowWidth / 2,
            0,
            beamX + glowWidth / 2,
            0
        );

    glowGradient.addColorStop(
        0,
        "rgba(255,0,100,0)"
    );

    glowGradient.addColorStop(
        0.2,
        "rgba(255,80,180,0.22)"
    );

    glowGradient.addColorStop(
        0.5,
        "rgba(255,255,255,0.32)"
    );

    glowGradient.addColorStop(
        0.8,
        "rgba(80,220,255,0.22)"
    );

    glowGradient.addColorStop(
        1,
        "rgba(0,255,255,0)"
    );


    ctx.fillStyle =
        glowGradient;

    ctx.globalAlpha =
        0.75;


    ctx.fillRect(
        beamX - glowWidth / 2,
        beamTop,
        glowWidth,
        beamBottom
    );


    ctx.globalAlpha = 1;


    // ==================================================
    // ③ メインRAINBOWビーム
    // ==================================================

    const rainbow =
        ctx.createLinearGradient(
            beamX - beamWidth / 2,
            0,
            beamX + beamWidth / 2,
            0
        );


    rainbow.addColorStop(
        0.00,
        "#ff1744"
    );

    rainbow.addColorStop(
        0.16,
        "#ff9100"
    );

    rainbow.addColorStop(
        0.32,
        "#ffee00"
    );

    rainbow.addColorStop(
        0.48,
        "#00ff88"
    );

    rainbow.addColorStop(
        0.64,
        "#00eaff"
    );

    rainbow.addColorStop(
        0.80,
        "#397bff"
    );

    rainbow.addColorStop(
        1.00,
        "#ff22dd"
    );


    ctx.fillStyle =
        rainbow;

    ctx.globalAlpha =
        0.88 +
        Math.sin(time * 10) * 0.08;


    ctx.fillRect(
        beamX - beamWidth / 2,
        beamTop,
        beamWidth,
        beamBottom
    );


    ctx.globalAlpha = 1;


    // ==================================================
    // ④ 中央エネルギーコア
    // ==================================================

    const coreWidth =
        isOverdrive
            ? 34
            : 24;


    const core =
        ctx.createLinearGradient(
            beamX - coreWidth / 2,
            0,
            beamX + coreWidth / 2,
            0
        );


    core.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );

    core.addColorStop(
        0.25,
        "rgba(255,255,255,0.8)"
    );

    core.addColorStop(
        0.5,
        "#ffffff"
    );

    core.addColorStop(
        0.75,
        "rgba(255,255,255,0.8)"
    );

    core.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );


    ctx.fillStyle =
        core;

    ctx.shadowColor =
        "#ffffff";

    ctx.shadowBlur =
        isOverdrive ? 30 : 18;


    ctx.fillRect(
        beamX - coreWidth / 2,
        beamTop,
        coreWidth,
        beamBottom
    );


    // ==================================================
    // ⑤ 流れるエネルギーライン
    // ==================================================

    const lineCount =
        isOverdrive ? 9 : 5;


    for (
        let i = 0;
        i < lineCount;
        i++
    ) {

        const offset =
            (
                time *
                (
                    isOverdrive
                        ? 520
                        : 380
                ) +
                i *
                (
                    beamBottom /
                    lineCount
                )
            ) %
            beamBottom;


        const y =
            beamBottom -
            offset;


        const wave =
            Math.sin(
                time * 7 + i
            ) * 10;


        const lineWidth =
            isOverdrive
                ? 18
                : 12;


        ctx.beginPath();

        ctx.moveTo(
            beamX -
            beamWidth / 2 +
            8,
            y
        );

        ctx.lineTo(
            beamX +
            wave,
            y - 18
        );

        ctx.lineTo(
            beamX +
            beamWidth / 2 -
            8,
            y
        );


        ctx.strokeStyle =
            i % 2 === 0
                ? "rgba(255,255,255,0.72)"
                : "rgba(0,255,255,0.55)";


        ctx.lineWidth =
            lineWidth;


        ctx.shadowColor =
            "#ffffff";

        ctx.shadowBlur =
            12;


        ctx.stroke();
    }


    // ==================================================
    // ⑥ ビーム外周ライン
    // ==================================================

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
        isOverdrive
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,255,255,0.75)";


    ctx.lineWidth =
        isOverdrive ? 4 : 2;


    ctx.strokeRect(
        beamX -
        beamWidth / 2,

        beamTop,

        beamWidth,

        beamBottom
    );


    // ==================================================
    // ⑦ 通常ビームのエネルギー波
    // ==================================================

    for (let i = 0; i < 3; i++) {

        const waveProgress =
            (
                time * 1.8 +
                i * 0.33
            ) % 1;


        const radius =
            25 +
            waveProgress * 55;


        const alpha =
            (1 - waveProgress) *
            0.45;


        ctx.beginPath();

        ctx.arc(
            beamX,
            beamBottom,
            radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            `rgba(255,255,255,${alpha})`;

        ctx.lineWidth = 2;

        ctx.stroke();
    }


    // ==================================================
    // ⑧ NEXUS-04 OVERDRIVE専用
    // ==================================================

    if (isOverdrive) {

        // --------------------------------
        // 巨大エネルギーリング
        // --------------------------------

        for (let i = 0; i < 4; i++) {

            const progress =
                (
                    time * 1.7 +
                    i * 0.25
                ) % 1;


            const radius =
                35 +
                progress * 100;


            const alpha =
                (1 - progress) *
                0.75;


            ctx.beginPath();

            ctx.arc(
                beamX,
                beamBottom,
                radius,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                i % 2 === 0
                    ? `rgba(0,255,255,${alpha})`
                    : `rgba(255,0,255,${alpha})`;


            ctx.lineWidth =
                3;


            ctx.shadowColor =
                i % 2 === 0
                    ? "#00ffff"
                    : "#ff00ff";


            ctx.shadowBlur =
                18;


            ctx.stroke();
        }


        // --------------------------------
        // 左右に放出される波動
        // --------------------------------

        for (let i = 0; i < 6; i++) {

            const waveProgress =
                (
                    time * 2.4 +
                    i * 0.17
                ) % 1;


            const y =
                beamBottom -
                waveProgress *
                beamBottom;


            const waveSize =
                15 +
                Math.sin(
                    time * 8 + i
                ) * 12;


            ctx.beginPath();

            ctx.moveTo(
                beamX -
                beamWidth / 2,
                y
            );

            ctx.lineTo(
                beamX -
                beamWidth / 2 -
                waveSize,
                y + 12
            );

            ctx.lineTo(
                beamX -
                beamWidth / 2,
                y + 24
            );


            ctx.strokeStyle =
                i % 2 === 0
                    ? "#00ffff"
                    : "#ff00ff";


            ctx.lineWidth =
                3;


            ctx.shadowColor =
                ctx.strokeStyle;

            ctx.shadowBlur =
                16;


            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                beamX +
                beamWidth / 2,
                y
            );

            ctx.lineTo(
                beamX +
                beamWidth / 2 +
                waveSize,
                y + 12
            );

            ctx.lineTo(
                beamX +
                beamWidth / 2,
                y + 24
            );

            ctx.stroke();
        }


        // --------------------------------
        // OVERDRIVE中央コア
        // --------------------------------

        const overdriveCore =
            ctx.createRadialGradient(
                beamX,
                beamBottom,
                0,
                beamX,
                beamBottom,
                75
            );


        overdriveCore.addColorStop(
            0,
            "#ffffff"
        );

        overdriveCore.addColorStop(
            0.18,
            "#00ffff"
        );

        overdriveCore.addColorStop(
            0.45,
            "#7b2cff"
        );

        overdriveCore.addColorStop(
            0.7,
            "#ff00ff"
        );

        overdriveCore.addColorStop(
            1,
            "rgba(255,0,255,0)"
        );


        ctx.beginPath();

        ctx.arc(
            beamX,
            beamBottom,
            75,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            overdriveCore;


        ctx.globalAlpha =
            0.85 +
            Math.sin(time * 12) * 0.12;


        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            45;


        ctx.fill();


        ctx.globalAlpha = 1;
    }


    // ==================================================
    // ⑨ 発射口の中央コア
    // ==================================================

    ctx.beginPath();

    ctx.arc(
        beamX,
        beamBottom,
        isOverdrive ? 20 : 14,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.shadowColor =
        isOverdrive
            ? "#00ffff"
            : "#ffffff";


    ctx.shadowBlur =
        isOverdrive
            ? 35
            : 20;


    ctx.fill();


    ctx.restore();


    // ==================================================
    // ⑩ ビームヒットエフェクト
    // ==================================================

    if (beamImpactPower > 0) {

        ctx.save();

        const impactRadius =
            20 +
            (
                1 -
                beamImpactPower
            ) *
            (
                isOverdrive
                    ? 80
                    : 55
            );


        ctx.beginPath();

        ctx.arc(
            beamHitX,
            beamHitY,
            impactRadius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            isOverdrive
                ? `rgba(0,255,255,${beamImpactPower})`
                : `rgba(255,255,255,${beamImpactPower})`;


        ctx.lineWidth =
            isOverdrive
                ? 7
                : 4;


        ctx.shadowColor =
            isOverdrive
                ? "#00ffff"
                : "#ffffff";


        ctx.shadowBlur =
            25;


        ctx.stroke();


        ctx.restore();
    }
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
    const bossScore = 5000 * level;

    score += bossScore;

// BOSS撃破コイン
addCoins(500 * level);

    // ボスを消す
    boss = null;
    bossActive = false;

    // 次のレベルへ
    level++;

    // レベルアップ演出
    levelClearTimer = 3;
    levelTransitionText = `LEVEL ${defeatedLevel} → LEVEL ${level}`;

    // 次のレベルを少し難しくする
    // 次のレベルでも敵速度は固定
enemyInterval =
    Math.max(
        300,
        enemyInterval - 100
    );
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


    const currentSpeed = getPlayerSpeed();

    if (player.movingLeft) {

        player.x -=
            currentSpeed *
            deltaTime;

    }

    if (player.movingRight) {

        player.x +=
            currentSpeed *
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

            /* =================================
   SHOOTER攻撃
   前方向（画面下方向）のみ
================================= */

if (
    enemy.type === "shooter" &&
    enemy.shootInterval > 0
) {

    enemy.shootTimer += deltaTime;

    if (
        enemy.shootTimer >=
        enemy.shootInterval
    ) {

        enemy.shootTimer = 0;

        enemyBullets.push({

            x: enemy.x,

            y:
                enemy.y +
                enemy.height / 2,

            // 前方向＝真下
            vx: 0,

            vy: 190,

            radius: 6

        });

    }

}

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

             if (enemy.hp <= 0) {

    const defeatedEnemyType = enemy.type;
    const defeatedEnemyX = enemy.x;
    const defeatedEnemyY = enemy.y;

    enemies.splice(i, 1);

    createExplosion(
        defeatedEnemyX,
        defeatedEnemyY,
        defeatedEnemyType === "big"
            ? 45
            : defeatedEnemyType === "splitter"
                ? 35
                : defeatedEnemyType === "fast"
                    ? 18
                    : 25
    );

    addScore(enemy.score);

    addCoins(
        defeatedEnemyType === "normal"
            ? 10
            : defeatedEnemyType === "fast"
            ? 15
            : defeatedEnemyType === "big"
            ? 50
            : defeatedEnemyType === "shooter"
            ? 25
            : defeatedEnemyType === "splitter"
            ? 40
            : defeatedEnemyType === "split-child"
            ? 5
            : 10
    );

    // SPLITTER → 2体に分裂
    if (defeatedEnemyType === "splitter") {

        for (let s = 0; s < 2; s++) {

            const childSize = 22;

            enemies.push({
                x: defeatedEnemyX + (s === 0 ? -16 : 16),
                y: defeatedEnemyY,

                width: childSize,
                height: childSize,

                speed: 145,

                rotation:
                    Math.random() * Math.PI * 2,

                rotationSpeed:
                    (Math.random() - 0.5) * 6,

                hp: 1,
                maxHp: 1,

                type: "split-child",

                score: 50,

                shootTimer: 0,
                shootInterval: 0
            });
        }
    }

    destroyed = true;
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

                break;

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

        // ボス撃破後のレベル移行中は完全無敵
    if (levelClearTimer > 0) {
        return;
    }

    // ビーム中
    if (beamActive) {
        return;
    }

    // シールド中
    if (shieldActive) {

        shieldHitTimer = 0.35;

        shieldHitX = player.x;
        shieldHitY = player.y;

        screenShake = 4;

        return;
    }

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


function drawLevelTransitionInvincibility() {

    if (levelClearTimer <= 0) {
        return;
    }

    const pulse =
        Math.sin(performance.now() * 0.012) * 5;

    const radius = 42 + pulse;

    ctx.save();

    // 外側のリング
    ctx.beginPath();
    ctx.arc(
        player.x,
        player.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(120, 220, 255, 0.95)";

    ctx.lineWidth = 3;

    ctx.shadowColor =
        "rgba(80, 200, 255, 1)";

    ctx.shadowBlur = 20;

    ctx.stroke();

    // 内側のリング
    ctx.beginPath();
    ctx.arc(
        player.x,
        player.y,
        radius - 8,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(180, 240, 255, 0.35)";

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.restore();
}
function drawShield() {

    if (!shieldActive) {
        return;
    }

    const now =
        performance.now();

    const pulse =
        Math.sin(now * 0.008) * 4;

    const radius =
        42 + pulse;

    ctx.save();

    // ==============================
    // 外側のガードリング
    // ==============================

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(80, 200, 255, 0.95)";

    ctx.lineWidth = 4;

    ctx.shadowColor =
        "#35cfff";

    ctx.shadowBlur = 20;

    ctx.stroke();


    // ==============================
    // 内側フィールド
    // ==============================

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        radius - 8,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(50,180,255,0.08)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(150,240,255,0.3)";

    ctx.lineWidth = 2;

    ctx.stroke();


    // ==============================
    // 回転するガードライン
    // ==============================

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(
        now * 0.0015
    );

    for (let i = 0; i < 6; i++) {

        ctx.rotate(
            Math.PI / 3
        );

        ctx.beginPath();

        ctx.moveTo(
            radius - 5,
            0
        );

        ctx.lineTo(
            radius + 5,
            0
        );

        ctx.strokeStyle =
            "rgba(150,240,255,0.9)";

        ctx.lineWidth = 3;

        ctx.stroke();
    }

    ctx.restore();


    // ==============================
    // 被弾した瞬間
    // ==============================

    if (shieldHitTimer > 0) {

        const hitProgress =
            1 -
            shieldHitTimer / 0.35;

        const hitRadius =
            18 +
            hitProgress * 35;

        const alpha =
            Math.max(
                0,
                shieldHitTimer / 0.35
            );

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            shieldHitX,
            shieldHitY,
            hitRadius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(220,250,255,${alpha})`;

        ctx.lineWidth = 5;

        ctx.shadowColor =
            "#ffffff";

        ctx.shadowBlur = 25;

        ctx.stroke();

        ctx.restore();
    }
}
function setItemControlsVisible(visible) {

    const itemControls =
        document.getElementById("itemControls");

    if (!itemControls) return;

    if (visible) {
        itemControls.style.display = "flex";
    } else {
        itemControls.style.display = "none";
    }
}
function updateItemButtons() {

    const healButton =
        document.getElementById("healButton");

    const beamButton =
        document.getElementById("beamButton");

    const shieldButton =
        document.getElementById("shieldButton");

    const bombButton =
        document.getElementById("bombButton");


    // ==============================
    // ♡ 回復
    // ==============================

    if (healButton) {

        const maxHP = getMaxHP();

        if (hp >= maxHP) {

            healButton.classList.add("item-unavailable");

            healButton.innerHTML =
                "♡<span>HP MAX</span>";

        } else if (healCooldown > 0) {

            healButton.classList.add("item-unavailable");

            healButton.innerHTML =
                `♡<span>あと ${Math.ceil(healCooldown)}秒</span>`;

        } else {

            healButton.classList.remove("item-unavailable");

            healButton.innerHTML =
                "♡<span>回復可能！</span>";
        }
    }


    // ==============================
    // 🌈 必殺ビーム
    // ==============================

    if (beamButton) {

        if (beamActive) {

            beamButton.classList.add("item-unavailable");

            beamButton.innerHTML =
                `🌈<span>発射中 ${beamTimer.toFixed(1)}秒</span>`;

        } else if (beamCooldown > 0) {

            beamButton.classList.add("item-unavailable");

            beamButton.innerHTML =
                `🌈<span>あと ${Math.ceil(beamCooldown)}秒</span>`;

        } else {

            beamButton.classList.remove("item-unavailable");

            beamButton.innerHTML =
                "🌈<span>発射可能！</span>";
        }
    }


    // ==============================
    // 🛡️ SHIELD
    // ==============================

    if (shieldButton) {

        if (shieldActive) {

            shieldButton.classList.add("item-unavailable");

            shieldButton.innerHTML =
                `🛡️<span>展開中 ${shieldTimer.toFixed(1)}秒</span>`;

        } else if (shieldCooldown > 0) {

            shieldButton.classList.add("item-unavailable");

            shieldButton.innerHTML =
                `🛡️<span>あと ${Math.ceil(shieldCooldown)}秒</span>`;

        } else {

            shieldButton.classList.remove("item-unavailable");

            shieldButton.innerHTML =
                "🛡️<span>使用可能！</span>";
        }
    }


    // ==============================
    // 💣 BOMB
    // ==============================

    if (bombButton) {

        if (bombCooldown > 0) {

            bombButton.classList.add("item-unavailable");

            bombButton.innerHTML =
                `💣<span>あと ${Math.ceil(bombCooldown)}秒</span>`;

        } else {

            bombButton.classList.remove("item-unavailable");

            bombButton.innerHTML =
                "💣<span>使用可能！</span>";
        }
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

drawHealEffect();

drawShield();

drawBombEffect();


    ctx.restore();


    /* 被弾フラッシュ */

    /* BOMBフラッシュ */

if (bombFlashTimer > 0) {

    ctx.fillStyle =
        `rgba(255,220,170,${bombFlashTimer})`;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}

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


        if (bombFlashTimer > 0) {

        bombFlashTimer -= deltaTime;

        if (bombFlashTimer < 0) {
            bombFlashTimer = 0;
        }
    }

}
}

drawShield();


const healButton =
    document.getElementById("healButton");

const beamButton =
    document.getElementById("beamButton");


/* ==================================================
   アイテムボタン操作
   PC・スマホ両対応
================================================== */


/* ---------- 回復 ---------- */

function pressHealButton(e) {

    e.preventDefault();

    if (!gameRunning) {
        return;
    }

    useHealItem();
}


/* ---------- ビーム ---------- */

function pressBeamButton(e) {

    e.preventDefault();

    if (!gameRunning) {
        return;
    }

    useBeam();
}


/* ==================================================
   スマホ・タッチ操作
================================================== */

/* ==================================================
   アイテムボタン
   スマホ・PC両対応
================================================== */


/* ---------- 回復 ---------- */

// ==================================================
// アイテムボタン
// ==================================================



/* ==================================================
   アイテムボタン操作
   スマホ・PC共通
================================================== */

function pressHealItem(e) {

    e.preventDefault();

    if (!gameRunning) {
        return;
    }

    useHealItem();
}


function pressBeamItem(e) {

    e.preventDefault();

    if (!gameRunning) {
        return;
    }

    useBeam();
}


/* ==================================================
   pointerdown
   スマホ・タブレット・PC共通
================================================== */

if (healButton) {

    healButton.addEventListener(
        "pointerdown",
        pressHealItem
    );

}


if (beamButton) {

    beamButton.addEventListener(
        "pointerdown",
        pressBeamItem
    );

}


// スマホ・タブレット・PC共通
if (healButton) {
    healButton.addEventListener(
        "pointerdown",
        pressHealItem
    );
}

if (beamButton) {
    beamButton.addEventListener(
        "pointerdown",
        pressBeamItem
    );
}

/* ---------- PC ---------- */




/* ==================================================
   キーボード操作
   1 = 回復
   2 = ビーム

   ※既存のkeydown側でも使えるので、
   ここでは追加しない
================================================== */

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

if (event.key === "3") {
    useShield();
}

if (event.key === "4") {
    useBomb();
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

if (howtoCloseButton) {
    howtoCloseButton.addEventListener(
        "click",
        closeHowTo
    );
}

if (returnStartButton) {

    returnStartButton.addEventListener(
        "click",
        returnToStartScreen
    );

}
const shareButton =
    document.getElementById("share-button");

if (shareButton) {

    shareButton.addEventListener(
        "click",
        shareScore
    );

}


if (shieldButton) {
    shieldButton.addEventListener(
        "click",
        useShield
    );
}

if (bombButton) {
    bombButton.addEventListener(
        "click",
        useBomb
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

/* ==================================================
   ランキング画面を開く
================================================== */

function openRanking() {

    if (!rankingScreen) {
        console.error("rankingScreen が見つかりません");
        return;
    }


    /* ==========================================
       他の画面を確実に閉じる
    ========================================== */

    if (startScreen) {
        startScreen.style.display = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (garageScreen) {
        garageScreen.style.display = "none";
    }

    if (howtoScreen) {
        howtoScreen.style.display = "none";
    }


    /* ==========================================
       ランキング画面を表示
    ========================================== */

    rankingScreen.style.display = "flex";


    /* ==========================================
       ランキングを毎回再取得
    ========================================== */

    loadRanking();

}

function openHowTo() {

    if (!howtoScreen) return;

    // 他の画面を全部閉じる
    if (startScreen) {
        startScreen.style.display = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (rankingScreen) {
        rankingScreen.style.display = "none";
    }

    if (garageScreen) {
        garageScreen.style.display = "none";
    }

    // ゲーム操作UIを隠す
    const controls =
        document.getElementById("controls");

    const itemControls =
        document.getElementById("itemControls");

    if (controls) {
        controls.style.display = "none";
    }

    if (itemControls) {
        itemControls.style.display = "none";
    }

    // HOW TOを表示
    howtoScreen.style.display = "flex";

    // PCを初期表示
    showHowToPC();
}
function closeHowTo() {

    if (!howtoScreen) return;

    howtoScreen.style.display = "none";

    // ゲーム操作UIを戻す
    const controls =
        document.getElementById("controls");

    const itemControls =
        document.getElementById("itemControls");

    if (controls) {
        controls.style.display = "";
    }

    if (itemControls) {
        itemControls.style.display = "";
    }

    // スタート画面へ
    if (startScreen) {
        startScreen.style.display = "flex";
    }

    // LINEメニューの ?screen=howto を消す
    window.history.replaceState(
        {},
        "",
        window.location.pathname
    );
}


/* ==================================================
   ランキング画面を閉じる
================================================== */

/* ==================================================
   ランキング画面を閉じる
================================================== */

function closeRanking() {

    if (!rankingScreen) {
        return;
    }


    /* ==========================================
       ランキングを確実に非表示
    ========================================== */

    rankingScreen.style.display = "none";


    /* ==========================================
       他の画面を全部閉じる
    ========================================== */

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (garageScreen) {
        garageScreen.style.display = "none";
    }

    if (howtoScreen) {
        howtoScreen.style.display = "none";
    }


    /* ==========================================
       START画面へ戻る
    ========================================== */

    if (startScreen) {
        startScreen.style.display = "flex";
    }

}



/* ==================================================
   HOW TOを開く
================================================== */

function openHowTo() {

    if (!howtoScreen) return;

    // 他の画面を全部閉じる
    if (startScreen) {
        startScreen.style.display = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (rankingScreen) {
        rankingScreen.style.display = "none";
    }

    if (garageScreen) {
        garageScreen.style.display = "none";
    }

    // HOW TOを表示
    howtoScreen.style.display = "flex";

    // 最初はPC操作
    showHowToPC();
}




/* ==================================================
   HOW TOを閉じる
================================================== */

function closeHowTo() {

    if (!howtoScreen) return;

    // HOW TOを閉じる
    howtoScreen.style.display = "none";

    // スタート画面を表示
    if (startScreen) {
        startScreen.style.display = "flex";
    }

}
/* ==================================================
   HOW TO 操作切り替え
================================================== */

function showHowToPC() {

    if (howtoPcControls) {
        howtoPcControls.style.display = "block";
    }

    if (howtoMobileControls) {
        howtoMobileControls.style.display = "none";
    }

    if (howtoPcTab) {
        howtoPcTab.classList.add("active");
    }

    if (howtoMobileTab) {
        howtoMobileTab.classList.remove("active");
    }

}


function showHowToMobile() {

    if (howtoPcControls) {
        howtoPcControls.style.display = "none";
    }

    if (howtoMobileControls) {
        howtoMobileControls.style.display = "block";
    }

    if (howtoPcTab) {
        howtoPcTab.classList.remove("active");
    }

    if (howtoMobileTab) {
        howtoMobileTab.classList.add("active");
    }

}

/* ==================================================
   仮ランキング
   ※後でCloudflare Workerに置き換える
================================================== */

/* ==================================================
   オンラインランキング取得
================================================== */

/* ==================================================
   オンラインランキング取得
================================================== */

async function loadRanking() {

    if (!rankingList) {
        return;
    }

    rankingList.innerHTML = `
        <div class="ranking-loading">
            RANKING LOADING...
        </div>
    `;

    try {

        /* ==========================================
           LINE User ID
        ========================================== */

        let myUserId = "";

        if (
            lineProfile &&
            typeof lineProfile.userId === "string" &&
            lineProfile.userId.trim() !== ""
        ) {
            myUserId = lineProfile.userId.trim();
        }


        /* ==========================================
           URL作成
        ========================================== */

        let rankingUrl =
            RANKING_API + "/ranking";

        if (myUserId) {

            rankingUrl +=
                "?userId=" +
                encodeURIComponent(myUserId);

        }


        console.log(
            "ランキングAPI:",
            rankingUrl
        );


        /* ==========================================
           APIアクセス
        ========================================== */

        const response =
            await fetch(
                rankingUrl,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "ランキングHTTP:",
            response.status
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
            "ランキング結果:",
            result
        );


        /* ==========================================
           API結果確認
        ========================================== */

        if (
            !result ||
            result.success !== true ||
            !Array.isArray(result.ranking)
        ) {

            throw new Error(
                "ランキングデータが不正です"
            );

        }


        /* ==========================================
           MY BEST
        ========================================== */

        const myBestScore =
            document.getElementById(
                "my-best-score"
            );

        const myBestLevel =
            document.getElementById(
                "my-best-level"
            );

        const myBestRank =
            document.getElementById(
                "my-best-rank"
            );


        if (result.myBest) {

            if (myBestScore) {

                myBestScore.textContent =
                    (
                        Number(
                            result.myBest.score
                        ) || 0
                    ).toLocaleString();

            }


            if (myBestLevel) {

                myBestLevel.textContent =
                    Number(
                        result.myBest.level
                    ) || 1;

            }


            if (myBestRank) {

                const rank =
                    Number(
                        result.myBest.rank
                    ) || 0;

                myBestRank.textContent =
                    rank > 0
                        ? rank
                        : "--";

            }

        }

        else {

            if (myBestScore) {
                myBestScore.textContent = "0";
            }

            if (myBestLevel) {
                myBestLevel.textContent = "1";
            }

            if (myBestRank) {
                myBestRank.textContent = "--";
            }

        }


        /* ==========================================
           ランキング
        ========================================== */

        const rankingData =
            result.ranking;


        if (rankingData.length === 0) {

            rankingList.innerHTML = `
                <div class="ranking-loading">
                    まだランキングデータがありません。
                </div>
            `;

            return;

        }


        /* ==========================================
           ランキング描画
        ========================================== */

        rankingList.innerHTML = "";


        rankingData.forEach(
            (player, index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "ranking-item";


                /* 自分 */

                const isMe =
                    !!(
                        myUserId &&
                        player.userId ===
                            myUserId
                    );


                if (isMe) {

                    item.classList.add(
                        "ranking-me"
                    );

                }


                /* 順位 */

                const rank =
                    index + 1;


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


                /* 名前 */

                const name =
                    escapeRankingText(
                        player.displayName ||
                        "LINEユーザー"
                    );


                /* スコア */

                const playerScore =
                    Number(
                        player.score
                    ) || 0;


                /* ==================================
                   HTML
                ================================== */

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
                            class="ranking-icon
                                   ranking-icon-empty">
                        </div>
                        `
                    }

                    <div class="ranking-name">

                        ${name}

                        ${
                            isMe
                            ?
                            `
                            <span class="ranking-you">
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


    }
    catch (error) {

        console.error(
            "ランキング取得エラー:",
            error
        );


        const myBestScore =
            document.getElementById(
                "my-best-score"
            );

        const myBestLevel =
            document.getElementById(
                "my-best-level"
            );

        const myBestRank =
            document.getElementById(
                "my-best-rank"
            );


        if (myBestScore) {
            myBestScore.textContent = "--";
        }

        if (myBestLevel) {
            myBestLevel.textContent = "--";
        }

        if (myBestRank) {
            myBestRank.textContent = "--";
        }


        rankingList.innerHTML = `

            <div class="ranking-loading">

                RANKING ERROR

                <br>

                <span
                    style="
                        display:block;
                        margin-top:8px;
                        font-size:11px;
                        opacity:0.55;
                    "
                >
                    ${escapeRankingText(
                        error.message ||
                        "Unknown error"
                    )}
                </span>

                <button
                    id="ranking-retry-button"
                    type="button"
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

/* ========================================
   GAME OVER → START
======================================== */

function returnToStartScreen() {

    // ゲーム停止
    gameRunning = false;

    // 敵・弾・エフェクトを消去
    bullets = [];
    enemies = [];
    particles = [];
    explosions = [];
    enemyBullets = [];

    // ボスを消去
    boss = null;
    bossActive = false;

    // ボス関連
    bossWarningTimer = 0;
    bossAttackTimer = 0;
    levelClearTimer = 0;

    // レベル関連
    levelTransitionText = "";
    bossSpawnScore = 3000;
    enemyKillCount = 0;

    // ビーム停止
    beamActive = false;
    beamTimer = 0;

    // アイテムチャージを初期化
    healCooldown = healCooldownMax;
    beamCooldown = beamCooldownMax;

    setItemControlsVisible(false);

    // 操作を解除
    player.movingLeft = false;
    player.movingRight = false;

    fireButtonHeld = false;

    player.fireCooldown = 0;

    // エフェクト解除
    screenShake = 0;
    hitFlash = 0;

    // スコア初期化
    score = 0;

    // 装備中機体に合わせてHP設定
    hp = getMaxHP();

    updateHUD();
    updateItemButtons();

    // GAME OVERを閉じる
    gameOverScreen.style.display = "none";

    // START画面を表示
    startScreen.style.display = "flex";

    // 他の画面も閉じる
    if (rankingScreen) {
        rankingScreen.style.display = "none";

        startScreen.style.display = "flex";
    }

    if (garageScreen) {
        garageScreen.style.display = "none";

        startScreen.style.display = "flex";
    }
}

/* ==================================================
   ボタン
================================================== */


if (howtoButton) {
    howtoButton.addEventListener(
        "click",
        openHowTo
    );
}
if (rankingButton) {

    rankingButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            openRanking();

        }
    );

}

if (howtoPcTab) {
    howtoPcTab.addEventListener(
        "click",
        showHowToPC
    );
}

if (howtoMobileTab) {
    howtoMobileTab.addEventListener(
        "click",
        showHowToMobile
    );
}


if (rankingButtonGameOver) {

    rankingButtonGameOver.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            openRanking();

        }
    );

}


if (rankingCloseButton) {

    rankingCloseButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeRanking();

        }
    );

}

/* ==================================================
   HOW TO BUTTON
================================================== */

if (howtoCloseButton) {

    howtoCloseButton.addEventListener(
        "click",
        closeHowTo
    );

}


if (howtoPcTab) {

    howtoPcTab.addEventListener(
        "click",
        showHowToPC
    );

}




if (howtoMobileTab) {

    howtoMobileTab.addEventListener(
        "click",
        showHowToMobile
    );

}

function handleMenuScreen() {

    const params = new URLSearchParams(
        window.location.search
    );

    const screen = params.get("screen");

    console.log(
        "LINE MENU SCREEN:",
        screen
    );


    // ========================================
    // 通常のゲーム
    // ========================================

    if (
        !screen ||
        screen === "game"
    ) {

        if (startScreen) {
            startScreen.style.display = "flex";
        }

        return;
    }


    // ========================================
    // ランキング
    // ========================================

    if (screen === "ranking") {

        if (startScreen) {
            startScreen.style.display = "none";
        }

        if (gameOverScreen) {
            gameOverScreen.style.display = "none";
        }

        openRanking();

        return;
    }


    // ========================================
    // GARAGE
    // ========================================

    if (screen === "garage") {

        if (startScreen) {
            startScreen.style.display = "none";
        }

        if (gameOverScreen) {
            gameOverScreen.style.display = "none";
        }

        openGarage();

        return;
    }


    // ========================================
    // HOW TO
    // ========================================

    if (screen === "howto") {

        openHowTo();

        return;
    }

}


initLIFF();