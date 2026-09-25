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

// ========================================
// D1 COIN SYSTEM
// ========================================

let coins = 0;

// 今回のプレイで獲得したコイン
// ゲーム終了時にまとめてD1へ送信する
let pendingCoins = 0;

// ==================================================
// 機体EXP
// ==================================================

let pendingMachineExp = 0;

let machineExpSyncing = false;

// D1から読み込み済みか
let coinsLoadedFromServer = false;


// ==================================================
// 機体レベル・EXP
// ==================================================

let machineProgress = {};

// 現在選択中の機体のレベル情報
function getMachineProgress(skinId = getEquippedSkin()) {

    if (
        !machineProgress ||
        !machineProgress[skinId]
    ) {
        return {
            level: 1,
            exp: 0
        };
    }

    return {
        level:
            Math.max(
                1,
                Math.min(
                    99,
                    Number(
                        machineProgress[skinId].level
                    ) || 1
                )
            ),

        exp:
            Math.max(
                0,
                Number(
                    machineProgress[skinId].exp
                ) || 0
            )
    };
}
// ========================================
// コイン表示
// ========================================

function updateCoinDisplays() {

    const startCoins =
        document.getElementById("start-coins");

    const gameoverCoins =
        document.getElementById("gameover-coins");

    const garageCoins =
        document.getElementById("garage-coins");


    const currentCoins =
        Math.max(
            0,
            Math.floor(coins)
        );


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


// ========================================
// D1からプレイヤー情報取得
// ========================================

// ========================================
// D1からプレイヤー情報取得
// ========================================

async function loadPlayerData() {

    if (
        typeof lineProfile === "undefined" ||
        !lineProfile ||
        !lineProfile.userId
    ) {

        console.log(
            "LINEプロフィールがないためD1読み込みをスキップ"
        );

        return;
    }

    try {

        console.log(
            "D1プレイヤーデータ取得開始"
        );

        const response =
            await fetch(
                RANKING_API +
                "/player?userId=" +
                encodeURIComponent(
                    lineProfile.userId
                ),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        console.log(
            "D1 PLAYER HTTP:",
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
            "D1 PLAYER RESULT:",
            result
        );


        if (
            result.success &&
            result.player
        ) {

            const player =
                result.player;


            // ========================================
            // COINS
            // ========================================

            coins =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            player.coins
                        ) || 0
                    )
                );


            // ========================================
            // 所持機体
            // ========================================

            if (
                Array.isArray(
                    player.ownedSkins
                )
            ) {

                ownedSkins =
                    player.ownedSkins.filter(
                        id =>
                            skins.some(
                                skin =>
                                    skin.id === id
                            )
                    );

            }
            else {

                ownedSkins = [
                    "nexus-01"
                ];

            }


            // NEXUS-01は必ず所持

            if (
                !ownedSkins.includes(
                    "nexus-01"
                )
            ) {

                ownedSkins.unshift(
                    "nexus-01"
                );

            }


            // ========================================
            // 装備機体
            // ========================================

            if (
                skins.some(
                    skin =>
                        skin.id ===
                        player.equippedSkin
                )
            ) {

                equippedSkin =
                    player.equippedSkin;

            }
            else {

                equippedSkin =
                    "nexus-01";

            }


            // ========================================
            // 選択位置
            // ========================================

            const equippedIndex =
                skins.findIndex(
                    skin =>
                        skin.id ===
                        equippedSkin
                );

            if (
                equippedIndex >= 0
            ) {

                selectedSkinIndex =
                    equippedIndex;

            }


            // ========================================
            // ローカルキャッシュ
            // ========================================

            localStorage.setItem(
                "nexus-coins",
                String(coins)
            );

            saveOwnedSkins();

            localStorage.setItem(
                "nexus-equipped-skin",
                equippedSkin
            );


            coinsLoadedFromServer =
                true;


            updateCoinDisplays();

            updateGarage();


            console.log(
                "🪙 D1 COINS:",
                coins
            );

            console.log(
                "🚀 D1 OWNED SKINS:",
                ownedSkins
            );

            console.log(
                "⚡ D1 EQUIPPED SKIN:",
                equippedSkin
            );

        }

    }
    catch (error) {

        console.error(
            "D1プレイヤーデータ取得エラー:",
            error
        );

    }

}

// ==================================================
// D1から機体レベル・EXPを取得
// ==================================================

async function loadMachineProgress() {

    if (
        typeof lineProfile === "undefined" ||
        !lineProfile ||
        !lineProfile.userId
    ) {

        console.log(
            "LINEプロフィールがないため機体データ取得をスキップ"
        );

        return;
    }

    try {

        console.log(
            "🚀 機体レベルデータ取得開始"
        );

        const response =
            await fetch(
                RANKING_API +
                "/machine?userId=" +
                encodeURIComponent(
                    lineProfile.userId
                )
            );

        console.log(
            "🚀 MACHINE GET HTTP:",
            response.status
        );

        const result =
            await response.json();

        console.log(
            "🚀 MACHINE GET RESULT:",
            result
        );

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "機体データ取得失敗"
            );

        }

        machineProgress =
            result.machines || {};

        console.log(
            "✅ 機体レベルデータ読み込み成功:",
            machineProgress
        );

        // ガレージ表示を更新
        updateGarage();

    }
    catch (error) {

        console.error(
            "❌ 機体レベルデータ取得エラー:",
            error
        );

    }

}

// ========================================
// コインを追加
// ========================================

function addCoins(amount) {

    amount =
        Math.floor(
            Number(amount) || 0
        );


    if (amount <= 0) {
        return;
    }


    /*
     * ゲーム中はローカル変数だけ変更。
     *
     * D1への通信はしない。
     */

    coins += amount;


    pendingCoins += amount;


    updateCoinDisplays();


    console.log(
        `🪙 +${amount} COINS`
    );


    console.log(
        `🪙 今回の獲得予定: +${pendingCoins}`
    );

}
// ==================================================
// 機体EXPを追加
// ==================================================

// ==================================================
// 機体EXPを追加
// ==================================================

function addMachineExp(amount) {

    amount =
        Math.floor(
            Number(amount) || 0
        );

    if (amount <= 0) {
        return;
    }

    // ========================================
    // 現在の機体
    // ========================================

    const skinId =
        getEquippedSkin();

    if (!skinId) {
        return;
    }

    // ========================================
    // 現在の進行状況
    // ========================================

    if (
        !machineProgress[skinId]
    ) {

        machineProgress[skinId] = {
            level: 1,
            exp: 0
        };

    }

    const machine =
        machineProgress[skinId];

    const oldLevel =
        machine.level;

    // ========================================
    // EXP追加
    // ========================================

    machine.exp += amount;

    pendingMachineExp += amount;

    // ========================================
    // レベルアップ判定
    // ========================================

    while (
        machine.level < 99 &&
        machine.exp >=
            machine.level * 500
    ) {

        machine.exp -=
            machine.level * 500;

        machine.level++;

    }

    // ========================================
    // Lv99
    // ========================================

    if (
        machine.level >= 99
    ) {

        machine.level = 99;
        machine.exp = 0;

    }

    // ========================================
    // レベルアップ演出
    // ========================================

    if (
        machine.level > oldLevel
    ) {

        showMachineLevelUp(
            oldLevel,
            machine.level
        );

    }

    console.log(
        `🚀 +${amount} MACHINE EXP`
    );

    console.log(
        `🚀 ${skinId} LEVEL:`,
        machine.level
    );

    console.log(
        `🚀 CURRENT EXP:`,
        machine.exp
    );

    console.log(
        `🚀 今回の獲得予定EXP: +${pendingMachineExp}`
    );

    // ========================================
    // ガレージ更新
    // ========================================

    if (
        typeof updateGarage === "function"
    ) {

        updateGarage();

    }

}

// ==================================================
// MACHINE LEVEL UP DRAW
// ==================================================

function drawMachineLevelUp() {

    if (
        machineLevelUpTimer <= 0
    ) {
        return;
    }

    const alpha =
        Math.min(
            1,
            machineLevelUpTimer
        );

    ctx.save();

    // ========================================
    // 全体フラッシュ
    // ========================================

    ctx.fillStyle =
        `rgba(80, 220, 255, ${
            0.08 * alpha
        })`;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    // ========================================
    // 中央位置
    // ========================================

    const centerX =
        width / 2;

    const centerY =
        height * 0.38;

    // ========================================
    // エネルギーリング
    // ========================================

    const ringProgress =
        1 -
        Math.min(
            1,
            machineLevelUpTimer / 3
        );

    const ringRadius =
        40 +
        ringProgress * 180;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        ringRadius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        `rgba(80, 230, 255, ${
            0.65 * alpha
        })`;

    ctx.lineWidth = 3;

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "rgba(80,230,255,0.9)";

    ctx.stroke();

    ctx.shadowBlur = 0;

    // ========================================
    // LEVEL UP
    // ========================================

    ctx.textAlign = "center";

    ctx.font =
        "800 34px Arial";

    ctx.fillStyle =
        `rgba(255,255,255,${alpha})`;

    ctx.fillText(
        "LEVEL UP",
        centerX,
        centerY - 50
    );

    // ========================================
    // LEVEL
    // ========================================

    ctx.font =
        "900 54px Arial";

    ctx.fillStyle =
        `rgba(80,230,255,${alpha})`;

    ctx.fillText(
        `LV ${machineLevelUpNewLevel}`,
        centerX,
        centerY + 10
    );

    // ========================================
    // 成長段階
    // ========================================

    if (
        machineLevelUpStage
    ) {

        ctx.font =
            "700 18px Arial";

        ctx.fillStyle =
            `rgba(190,245,255,${alpha})`;

        ctx.fillText(
            machineLevelUpStage.name,
            centerX,
            centerY + 48
        );

    }

    ctx.restore();

}

// ==================================================
// MACHINE LEVEL UP UPDATE
// ==================================================

function updateMachineLevelUp(
    deltaTime
) {

    if (
        machineLevelUpTimer <= 0
    ) {
        return;
    }

    machineLevelUpTimer -=
        deltaTime;

    if (
        machineLevelUpTimer < 0
    ) {

        machineLevelUpTimer = 0;

    }

}

// ==================================================
// 機体EXPをD1へ同期
// ==================================================

async function syncPendingMachineExp() {

    if (machineExpSyncing) {
        return;
    }

    if (pendingMachineExp <= 0) {
        return;
    }

    if (
        typeof lineProfile === "undefined" ||
        !lineProfile ||
        !lineProfile.userId
    ) {
        console.log(
            "LINEプロフィールがないため機体EXP同期をスキップ"
        );
        return;
    }

    const skinId = getEquippedSkin();

    if (!skinId) {
        return;
    }

    const expToSend = pendingMachineExp;

    machineExpSyncing = true;

    try {

        console.log(
            "🚀 機体EXP D1同期開始:",
            skinId,
            expToSend
        );

        const response = await fetch(
            RANKING_API + "/machine/exp",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: lineProfile.userId,
                    skinId: skinId,
                    exp: expToSend
                }),

                keepalive: true
            }
        );

    console.log(
    "🚀 MACHINE EXP HTTP:",
    response.status
);

// ========================================
// Workerの生レスポンスを取得
// ========================================



console.log(
    "🚀 MACHINE EXP HTTP:",
    response.status
);

// ========================================
// Workerから生レスポンスを取得
// ========================================

const responseText = await response.text();
console.log(
    "🚀 MACHINE EXP RAW RESPONSE:",
    responseText
);

// ========================================
// JSON解析
// ========================================

let result;

try {

    result = JSON.parse(responseText);

} catch (error) {

    console.error(
        "❌ MACHINE EXP JSON解析失敗:",
        responseText
    );

    throw error;
}

console.log(
    "🚀 MACHINE EXP RESULT:",
    result
);

// ========================================
// HTTPエラー確認
// ========================================

if (!response.ok) {

    throw new Error(
        "HTTP ERROR: " + response.status
    );

}

// ========================================
// Worker処理結果確認
// ========================================




        if (!result.success) {
            throw new Error(
                result.message ||
                "機体EXP同期に失敗しました"
            );
        }

        // 同期成功した分だけ減らす
        pendingMachineExp -= expToSend;

        if (pendingMachineExp < 0) {
            pendingMachineExp = 0;
        }

        console.log(
            "✅ 機体EXP D1同期成功"
        );

        console.log(
            "🚀 残り未同期EXP:",
            pendingMachineExp
        );

    } catch (error) {

        console.error(
            "❌ 機体EXP D1同期エラー:",
            error
        );

    } finally {

        machineExpSyncing = false;
    }
}

// ========================================
// 今回獲得したコインをD1へ送信
// ========================================

async function syncPendingCoins() {

    if (pendingCoins <= 0) {

        console.log(
            "今回送信するコインはありません"
        );

        return;

    }


    if (
        typeof lineProfile === "undefined" ||
        !lineProfile ||
        !lineProfile.userId
    ) {

        console.log(
            "LINEユーザーではないためコイン送信をスキップ"
        );

        return;

    }


    const amount =
        Math.floor(
            pendingCoins
        );


    try {

        console.log(
            "🪙 D1へコイン送信:",
            amount
        );


        const response =
            await fetch(
                RANKING_API +
                "/coins",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            userId:
                                lineProfile.userId,

                            amount:
                                amount

                        })
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
            "🪙 コイン保存結果:",
            result
        );


        if (
            result.success
        ) {

            /*
             * D1の値を正式な値として採用
             */

            coins =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            result.coins
                        ) || 0
                    )
                );


            /*
             * 同じコインを
             * もう一度送らない
             */

            pendingCoins = 0;


            updateCoinDisplays();


            console.log(
                "🪙 D1同期完了:",
                coins
            );

        }

    }
    catch (error) {

        /*
         * 失敗した場合は
         * pendingCoinsを残す。
         *
         * 次回ゲーム終了時に
         * 再送できるようにする。
         */

        console.error(
            "🪙 D1コイン同期エラー:",
            error
        );

    }

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

let enemyInterval = 1100;
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

        await loadPlayerData();

        await loadMachineProgress();
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
// 機体 LEVEL / EXP
// ========================================

const machine =
    getMachineProgress(
        skin.id
    );

    const growthStage =
    getMachineGrowthStage(
        machine.level
    );
const machineLevel =
    machine.level;

const machineExp =
    machine.exp;

const nextExp =
    machineLevel >= 99
        ? 0
        : machineLevel * 500;

const expRatio =
    machineLevel >= 99
        ? 1
        : nextExp > 0
            ? Math.min(
                1,
                machineExp / nextExp
            )
            : 0;


            const machineLevelValue =
    document.getElementById(
        "machine-level-value"
    );

const machineExpText =
    document.getElementById(
        "machine-exp-text"
    );

const machineExpFill =
    document.getElementById(
        "machine-exp-fill"
    );

const machineLevelBonus =
    document.getElementById(
        "machine-level-bonus"
    );

if (machineLevelValue) {

    machineLevelValue.textContent =
        `LEVEL ${machineLevel}`;

}

if (machineExpText) {

    if (machineLevel >= 99) {

        machineExpText.textContent =
            "MAX LEVEL";

    }
    else {

        machineExpText.textContent =
            `EXP ${machineExp.toLocaleString()} / ${nextExp.toLocaleString()}`;

    }

}

if (machineExpFill) {

    machineExpFill.style.width =
        `${expRatio * 100}%`;

}

if (machineLevelBonus) {

    const bonus =
        Math.min(
            49,
            (machineLevel - 1) * 0.5
        );

    machineLevelBonus.textContent =
        `LEVEL BONUS：+${bonus.toFixed(1)}%`;

}
console.log(
    "🚀 GARAGE MACHINE:",
    skin.id,
    machineLevel,
    machineExp,
    nextExp
);

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

    const growthStageElement =
    document.getElementById(
        "machine-growth-stage"
    );

const growthDescriptionElement =
    document.getElementById(
        "machine-growth-description"
    );

if (growthStageElement) {

    growthStageElement.textContent =
        growthStage.name;

}

if (growthDescriptionElement) {

    growthDescriptionElement.textContent =
        growthStage.description;

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
async function equipSelectedSkin() {

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


    const isLineUser =
        typeof lineProfile !== "undefined" &&
        lineProfile &&
        lineProfile.userId;


    // ========================================
    // LINE → D1
    // ========================================

    if (isLineUser) {

        console.log(
            "⚡ D1装備開始:",
            skin.id
        );

        try {

            const response =
                await fetch(
                    RANKING_API +
                    "/skin/equip",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                userId:
                                    lineProfile.userId,

                                skinId:
                                    skin.id

                            })
                    }
                );


            console.log(
                "⚡ SKIN EQUIP HTTP:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "⚡ SKIN EQUIP RESULT:",
                result
            );


            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.error ||
                    "機体の装備に失敗しました"
                );

                return;
            }


            equippedSkin =
                result.equippedSkin ||
                skin.id;


            localStorage.setItem(
                "nexus-equipped-skin",
                equippedSkin
            );


            updateGarage();


            playEquipAnimation(
                skin
            );


            console.log(
                "✅ D1装備保存成功:",
                equippedSkin
            );

        }
        catch (error) {

            console.error(
                "❌ D1装備エラー:",
                error
            );

            alert(
                "機体装備中に通信エラーが発生しました。"
            );

        }

        return;
    }


    // ========================================
    // PC単体
    // ========================================

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

// ==================================================
// 購入確定
// D1対応版
// ==================================================

// ==================================================
// 購入確定
// ==================================================

let purchaseProcessing = false;

async function confirmPurchase() {

    const skin =
        purchaseTargetSkin;

    if (!skin) {
        return;
    }


    // ========================================
    // 二重購入防止
    // ========================================

    if (isSkinOwned(skin.id)) {

        closePurchaseConfirm();

        updateGarage();

        return;
    }


    const isLineUser =
        typeof lineProfile !== "undefined" &&
        lineProfile &&
        lineProfile.userId;


    // ========================================
    // LINE / LIFF
    // → D1購入
    // ========================================

    if (isLineUser) {

        console.log(
            "🛒 D1購入開始:",
            skin.id
        );

        try {

            const response =
                await fetch(
                    RANKING_API +
                    "/skin/purchase",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                userId:
                                    lineProfile.userId,

                                skinId:
                                    skin.id,

                                price:
                                    skin.price

                            })
                    }
                );


            console.log(
                "🛒 SKIN PURCHASE HTTP:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "🛒 SKIN PURCHASE RESULT:",
                result
            );


            // ========================================
            // 失敗
            // ========================================

            if (
                !response.ok ||
                !result.success
            ) {

                closePurchaseConfirm();


                if (
                    result.error ===
                    "コインが不足しています"
                ) {

                    showCoinsNotEnough(
                        skin
                    );

                }
                else {

                    alert(
                        result.error ||
                        "機体の購入に失敗しました"
                    );

                }

                return;
            }


            // ========================================
            // D1の最新コイン
            // ========================================

            coins =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            result.coins
                        ) || 0
                    )
                );


            // ========================================
            // D1の所持機体
            // ========================================

            if (
                Array.isArray(
                    result.ownedSkins
                )
            ) {

                ownedSkins =
                    result.ownedSkins.filter(
                        id =>
                            skins.some(
                                skinData =>
                                    skinData.id === id
                            )
                    );

            }


            if (
                !ownedSkins.includes(
                    "nexus-01"
                )
            ) {

                ownedSkins.unshift(
                    "nexus-01"
                );

            }


            // ========================================
            // D1の装備機体
            // ========================================

            equippedSkin =
                result.equippedSkin ||
                skin.id;


            // ========================================
            // ローカルキャッシュ
            // ========================================

            localStorage.setItem(
                "nexus-coins",
                String(coins)
            );

            saveOwnedSkins();

            localStorage.setItem(
                "nexus-equipped-skin",
                equippedSkin
            );


            // ========================================
            // 選択位置
            // ========================================

            const index =
                skins.findIndex(
                    skinData =>
                        skinData.id ===
                        equippedSkin
                );

            if (index >= 0) {

                selectedSkinIndex =
                    index;

            }


            // ========================================
            // UI
            // ========================================

            closePurchaseConfirm();

            updateCoinDisplays();

            updateGarage();


            // ========================================
            // 購入演出
            // ========================================

            playPurchaseAnimation(
                skin
            );


            console.log(
                "✅ D1購入成功"
            );

            console.log(
                "🪙 COINS:",
                coins
            );

            console.log(
                "🚀 OWNED:",
                ownedSkins
            );

            console.log(
                "⚡ EQUIPPED:",
                equippedSkin
            );

        }
        catch (error) {

            console.error(
                "❌ D1購入エラー:",
                error
            );

            closePurchaseConfirm();

            alert(
                "機体購入中に通信エラーが発生しました。"
            );

        }

        return;
    }


    // ========================================
    // PC単体
    // → 従来のlocalStorage
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


    coins -=
        skin.price;


    localStorage.setItem(
        "nexus-coins",
        String(coins)
    );


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


    closePurchaseConfirm();

    updateCoinDisplays();

    updateGarage();


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

                // 購入確認画面を開く
                openPurchaseConfirm(skin);

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

async function endGame() {

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

await sendScoreToRanking();

await syncPendingCoins();
await syncPendingMachineExp();
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

// ==================================================
// MACHINE LEVEL BONUS
// ==================================================

// ==================================================
// 機体レベルによる成長ボーナス
// ==================================================

function getMachineLevelBonus() {

    const machine =
        getMachineProgress();

    const stage =
        getMachineGrowthStage(
            machine.level
        );

    const normalGrowth =
        Math.min(
            0.49,
            (machine.level - 1) *
            0.005
        );

    return Math.max(
        normalGrowth,
        stage.bonus
    );

}

// ========================================
// 🚀 MACHINE POWER GROWTH
// 機体レベルによる総合性能成長
// ========================================

function getMachinePowerRate() {
    const machine = getMachineProgress();
    const level = Math.max(
        1,
        Math.min(99, Number(machine.level) || 1)
    );

    /*
        Lv1   = 100%
        Lv10  = 110%
        Lv25  = 125%
        Lv50  = 150%
        Lv75  = 175%
        Lv99  = 200%
    */

    if (level >= 99) {
        return 2.00;
    }

    if (level >= 75) {
        return 1.75;
    }

    if (level >= 50) {
        return 1.50;
    }

    if (level >= 25) {
        return 1.25;
    }

    if (level >= 10) {
        return 1.10;
    }

    // Lv1～9
    return 1.00;
}


// 攻撃力倍率
function getMachineAttackRate() {
    return getMachinePowerRate();
}


// 防御・耐久倍率
function getMachineDefenseRate() {
    const rate = getMachinePowerRate();

    // 攻撃倍率より少し控えめ
    return 1 + (rate - 1) * 0.75;
}


// 移動速度倍率
function getMachineSpeedRate() {
    return getMachinePowerRate();
}


// 射撃速度倍率
// ========================================
// 🔫 MACHINE FIRE RATE GROWTH
// 射撃速度の成長を少し抑える
// ========================================

function getMachineFireRate() {
    const powerRate = getMachinePowerRate();

    /*
        攻撃力などはしっかり成長させるが、
        射撃速度だけは成長を抑える。

        Lv1   = 100%
        Lv10  = 103%
        Lv25  = 108%
        Lv50  = 115%
        Lv75  = 123%
        Lv99  = 130%
    */

    return 1 + (powerRate - 1) * 0.30;
}


// ビーム性能倍率
function getMachineBeamRate() {
    return getMachinePowerRate();
}


function getMaxHP() {
    const skin = getEquippedSkin();
    const machine = getMachineProgress();

    if (skin === "nexus-05") {
        const level = Math.max(
            1,
            Math.min(
                99,
                Number(machine.level) || 1
            )
        );

        if (level >= 99) return 10;
        if (level >= 75) return 9;
        if (level >= 50) return 8;
        if (level >= 25) return 7;
        if (level >= 10) return 6;

        return 5;
    }

    // 通常機体
    return 3;
}
// ==================================================
// 機体成長段階
// ==================================================

function getMachineGrowthStage(level) {

    level = Math.max(
        1,
        Math.min(
            99,
            Number(level) || 1
        )
    );

    if (level >= 99) {

        return {
            id: "max",
            name: "NEXUS FORM",
            shortName: "MAX",
            description:
                "限界性能へ到達した最終形態。",
            bonus: 0.49
        };

    }

    if (level >= 75) {

        return {
            id: "stage-4",
            name: "OVERDRIVE",
            shortName: "IV",
            description:
                "機体出力を限界領域まで引き上げた強化形態。",
            bonus: 0.37
        };

    }

    if (level >= 50) {

        return {
            id: "stage-3",
            name: "AWAKEN",
            shortName: "III",
            description:
                "高出力コアが覚醒した強化形態。",
            bonus: 0.245
        };

    }

    if (level >= 25) {

        return {
            id: "stage-2",
            name: "ASSAULT",
            shortName: "II",
            description:
                "戦闘性能を大幅に強化した形態。",
            bonus: 0.12
        };

    }

    if (level >= 10) {

        return {
            id: "stage-1",
            name: "BOOST",
            shortName: "I",
            description:
                "機体性能が強化された初期進化形態。",
            bonus: 0.045
        };

    }

    return {
        id: "base",
        name: "STANDARD",
        shortName: "BASE",
        description:
            "標準状態。これから成長していく。",
        bonus: 0
    };
}


// ==================================================
// LEVEL UP 演出
// ==================================================

let machineLevelUpTimer = 0;
let machineLevelUpOldLevel = 1;
let machineLevelUpNewLevel = 1;
let machineLevelUpStage = null;

function showMachineLevelUp(
    oldLevel,
    newLevel
) {

    if (
        newLevel <= oldLevel
    ) {
        return;
    }

    machineLevelUpOldLevel =
        oldLevel;

    machineLevelUpNewLevel =
        newLevel;

    machineLevelUpStage =
        getMachineGrowthStage(
            newLevel
        );

        // 🚀 新しい機体性能倍率
const newPowerRate = getMachinePowerRate();

console.log(
    "🚀 MACHINE POWER:",
    Math.round(newPowerRate * 100) + "%"
);
    machineLevelUpTimer = 3.0;

    screenShake = 12;

    hitFlash = 0.08;

    console.log(
        "🚀 MACHINE LEVEL UP:",
        oldLevel,
        "→",
        newLevel
    );

    console.log(
        "🚀 GROWTH STAGE:",
        machineLevelUpStage.name
    );

    console.log(
    "🚀 ATTACK:",
    Math.round(getMachineAttackRate() * 100) + "%"
);

console.log(
    "🚀 SPEED:",
    Math.round(getMachineSpeedRate() * 100) + "%"
);

console.log(
    "🚀 FIRE:",
    Math.round(getMachineFireRate() * 100) + "%"
);

console.log(
    "🚀 BEAM:",
    Math.round(getMachineBeamRate() * 100) + "%"
);

    // ガレージ表示も更新
    if (
        typeof updateGarage === "function"
    ) {
        updateGarage();
    }
}

function getPlayerSpeed() {
    const skin = getEquippedSkin();
    const levelBonus = getMachineLevelBonus();

    let baseSpeed = 330;

    // NEXUS-02 SPEED
    if (skin === "nexus-02") {
        baseSpeed *= 1.35;
    }

    // 機体レベルによる成長
    return baseSpeed * (1 + levelBonus);
}


function getFireInterval() {
    const skin = getEquippedSkin();
    const fireRate = getMachineFireRate();

    let baseInterval = 0.13;

    // NEXUS-03 ATTACK
    if (skin === "nexus-03") {
        baseInterval = 0.16;
    }

    // レベルが高いほど発射間隔が短くなる
    return Math.max(
        0.045,
        baseInterval / fireRate
    );
}

// ビーム幅
function getBeamWidth() {
    const skin = getEquippedSkin();
    const level = Math.max(
        1,
        Math.min(
            99,
            Number(getMachineProgress().level) || 1
        )
    );

    if (skin === "nexus-04") {

        // Lv1 → 150
        // Lv10 → 165
        // Lv25 → 187
        // Lv50 → 225
        // Lv75 → 262
        // Lv99 → 300

        if (level >= 99) {
            return 300;
        }

        if (level >= 75) {
            return 262;
        }

        if (level >= 50) {
            return 225;
        }

        if (level >= 25) {
            return 187;
        }

        if (level >= 10) {
            return 165;
        }

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

    const skin = getEquippedSkin();

    /* =================================
       NEXUS-03 DUAL FIRE
       2発同時発射
    ================================= */

    if (skin === "nexus-03") {

        // 左弾
        bullets.push({

            x:
                player.x - 9,

            y:
                player.y -
                player.height / 2,

            width: 5,

            height: 22,

            speed: 700

        });

        // 右弾
        bullets.push({

            x:
                player.x + 9,

            y:
                player.y -
                player.height / 2,

            width: 5,

            height: 22,

            speed: 700

        });

    } else {

        /* =================================
           通常機体
           1発
        ================================= */

        bullets.push({

            x:
                player.x,

            y:
                player.y -
                player.height / 2,

            width: 5,

            height: 22,

            speed: 700

        });

    }

    /* =================================
       発射間隔
    ================================= */

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
/* ==================================================
   敵生成
================================================== */

function getEnemyDifficultyRate() {

    const currentLevel =
        Math.max(
            1,
            Number(level) || 1
        );

    return Math.min(
        1.40,
        1 +
        (currentLevel - 1) * 0.035
    );
}



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

/*
    敵出現率

    55% → NORMAL
    14% → FAST
    10% → BIG
    9%  → SHOOTER
    5%  → SPLITTER
    7%  → ZIGZAG
*/

if (typeRandom < 0.55) {

    type = "normal";

} else if (typeRandom < 0.69) {

    type = "fast";

} else if (typeRandom < 0.79) {

    type = "big";

} else if (typeRandom < 0.88) {

    type = "shooter";

} else if (typeRandom < 0.93) {

    type = "splitter";

} else {

    type = "zigzag";

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

    speed = 150;

    hp = 1;

    scoreValue = 120;

}


    /* =================================
       FAST
    ================================= */

if (type === "fast") {

    size = 30;

    speed = 340;

    hp = 1;

    scoreValue = 200;

}


    /* =================================
       BIG
    ================================= */

if (type === "big") {

    size = 68;

    speed = 80;

    hp = 4;

    scoreValue = 650;

}

    /* =================================
       SHOOTER
    ================================= */

if (type === "shooter") {

    size = 40;

    speed = 100;

    hp = 2;

    scoreValue = 300;

    shootInterval = 1.4;

}


if (type === "splitter") {

    size = 48;

    speed = 75;

    hp = 2;

    scoreValue = 400;

}
    /* =================================
   ZIGZAG
================================= */
if (type === "zigzag") {

    size = 38;

    speed = 145;

    hp = 1;

    scoreValue = 250;

}
const enemyStartX =
    Math.random() *
    (width - size) +
    size / 2;

const enemy = {

    x:
        enemyStartX,

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
            shootInterval,

            // ZIGZAG用
        baseX:
            enemyStartX,

        zigzagTime:
            Math.random() *
            Math.PI *
            2,

        zigzagAmplitude:
            70 +
            Math.random() * 35,

        zigzagFrequency:
            2.5 +
            Math.random() * 0.8

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
        800 +
        (level - 1) * 500;

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
// ========================================
// 🌌 MACHINE LEVEL AURA
// 機体レベルに応じたオーラ
// ========================================

// ==================================================
// 🌌 MACHINE LEVEL AURA
// 機体がエネルギーを「まとっている」演出
// ==================================================

function drawMachineLevelAura(currentSkin) {

    const machine =
        getMachineProgress();

    const level =
        Math.max(
            1,
            Math.min(
                99,
                Number(machine.level) || 1
            )
        );

    // Lv10未満は通常状態
    if (level < 10) {
        return;
    }


    // ==================================================
    // オーラ段階
    // ==================================================

    let auraPower = 0;

    if (level >= 99) {
        auraPower = 5;
    }

    else if (level >= 75) {
        auraPower = 4;
    }

    else if (level >= 50) {
        auraPower = 3;
    }

    else if (level >= 25) {
        auraPower = 2;
    }

    else {
        auraPower = 1;
    }


    // ==================================================
    // スキンごとのエネルギーカラー
    // ==================================================

    let auraRGB = "39, 234, 255";

    if (currentSkin === "nexus-02") {
        auraRGB = "57, 255, 136";
    }

    else if (currentSkin === "nexus-03") {
        auraRGB = "255, 157, 50";
    }

    else if (currentSkin === "nexus-04") {
        auraRGB = "190, 92, 255";
    }

    else if (currentSkin === "nexus-05") {
        auraRGB = "155, 92, 255";
    }


    // ==================================================
    // アニメーション時間
    // ==================================================

    const time =
        performance.now() * 0.001;


    // ==================================================
    // 機体サイズ
    // ==================================================

    const coreSize =
        28 +
        auraPower * 3;


    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";


    // ==================================================
    // ① 機体を包む「内側のエネルギー」
    // ==================================================

    const corePulse =
        1 +
        Math.sin(time * 4.0) *
        (0.035 + auraPower * 0.008);


    const coreGradient =
        ctx.createRadialGradient(
            0,
            -5,
            4,
            0,
            -5,
            coreSize * corePulse
        );


    coreGradient.addColorStop(
        0,
        `rgba(${auraRGB}, ${0.20 + auraPower * 0.035})`
    );

    coreGradient.addColorStop(
        0.35,
        `rgba(${auraRGB}, ${0.11 + auraPower * 0.018})`
    );

    coreGradient.addColorStop(
        0.7,
        `rgba(${auraRGB}, ${0.045 + auraPower * 0.008})`
    );

    coreGradient.addColorStop(
        1,
        `rgba(${auraRGB}, 0)`
    );


    ctx.fillStyle =
        coreGradient;

    ctx.beginPath();

    ctx.arc(
        0,
        -5,
        coreSize * corePulse,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ==================================================
    // ② 機体の左右から立ち上るオーラ
    // ==================================================

    const auraHeight =
        38 +
        auraPower * 13;


    const auraWidth =
        18 +
        auraPower * 5;


    for (
        let side = -1;
        side <= 1;
        side += 2
    ) {

        for (
            let i = 0;
            i < auraPower;
            i++
        ) {

            const seed =
                side * 17 +
                i * 31;


            const wave =
                Math.sin(
                    time * (2.0 + i * 0.18) +
                    seed
                );


            const wave2 =
                Math.sin(
                    time * 1.35 +
                    seed * 0.73
                );


            const x =
                side *
                (
                    10 +
                    i * 4 +
                    wave * (3 + auraPower)
                );


            const y =
                8 -
                (
                    (time *
                    (18 + auraPower * 3) +
                    i * 23 +
                    seed * 4)
                    %
                    auraHeight
                );


            const width =
                auraWidth -
                i * 2;


            const alpha =
                (
                    0.045 +
                    auraPower * 0.014
                ) *
                (
                    1 -
                    i / (auraPower + 1)
                );


            // ------------------------------------------
            // エネルギーの芯
            // ------------------------------------------

            ctx.beginPath();

            ctx.moveTo(
                x,
                y + 18
            );

            ctx.bezierCurveTo(
                x - width * 0.8,
                y + 8,
                x + wave2 * 7,
                y - 8,
                x + wave * 5,
                y - 24
            );

            ctx.bezierCurveTo(
                x + width * 0.4,
                y - 12,
                x + width * 0.8,
                y + 8,
                x,
                y + 18
            );

            ctx.closePath();


            const auraGradient =
                ctx.createLinearGradient(
                    x,
                    y + 20,
                    x,
                    y - 25
                );


            auraGradient.addColorStop(
                0,
                `rgba(${auraRGB}, ${alpha})`
            );

            auraGradient.addColorStop(
                0.45,
                `rgba(${auraRGB}, ${alpha * 1.5})`
            );

            auraGradient.addColorStop(
                1,
                `rgba(${auraRGB}, 0)`
            );


            ctx.fillStyle =
                auraGradient;

            ctx.shadowColor =
                `rgba(${auraRGB}, ${0.35 + auraPower * 0.04})`;

            ctx.shadowBlur =
                8 +
                auraPower * 3;

            ctx.fill();
        }
    }


    // ==================================================
    // ③ 機体の上から立ち上るエネルギー
    // ==================================================

    for (
        let i = 0;
        i < auraPower + 1;
        i++
    ) {

        const seed =
            i * 19.37;


        const wave =
            Math.sin(
                time * 2.4 +
                seed
            );


        const x =
            wave *
            (4 + auraPower * 1.5) +
            Math.sin(seed) * 4;


        const y =
            -18 -
            (
                (
                    time *
                    (20 + auraPower * 2) +
                    seed * 5
                )
                %
                (auraHeight + 20)
            );


        const size =
            3 +
            auraPower * 0.7;


        const alpha =
            0.10 +
            auraPower * 0.025;


        // エネルギーの粒
        ctx.beginPath();

        ctx.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(${auraRGB}, ${alpha})`;

        ctx.shadowColor =
            `rgba(${auraRGB}, 0.8)`;

        ctx.shadowBlur =
            10 +
            auraPower * 2;

        ctx.fill();
    }


    // ==================================================
    // ④ Lv50以上：機体の輪郭に沿うエネルギー
    // 「輪っか」ではなく輪郭の発光
    // ==================================================

    if (level >= 50) {

        const outlineAlpha =
            level >= 75
                ? 0.25
                : 0.15;


        ctx.strokeStyle =
            `rgba(${auraRGB}, ${outlineAlpha})`;

        ctx.lineWidth =
            level >= 75
                ? 5
                : 3;


        ctx.shadowColor =
            `rgba(${auraRGB}, 0.8)`;

        ctx.shadowBlur =
            14 +
            auraPower * 3;


        // 機体を包むような不定形のエネルギー
        ctx.beginPath();

        ctx.moveTo(
            0,
            -38 - auraPower * 2
        );

        ctx.bezierCurveTo(
            -10 - auraPower * 2,
            -30,
            -24 - auraPower * 2,
            -5,
            -30 - auraPower * 3,
            18
        );

        ctx.bezierCurveTo(
            -18,
            15,
            -12,
            25,
            0,
            31 + auraPower * 2
        );

        ctx.bezierCurveTo(
            12,
            25,
            18,
            15,
            30 + auraPower * 3,
            18
        );

        ctx.bezierCurveTo(
            24 + auraPower * 2,
            -5,
            10 + auraPower * 2,
            -30,
            0,
            -38 - auraPower * 2
        );

        ctx.stroke();
    }


    // ==================================================
    // ⑤ Lv75以上：強いエネルギーの揺らぎ
    // ==================================================

    if (level >= 75) {

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const phase =
                time * (1.7 + i * 0.3) +
                i * 2.1;


            const leftX =
                -22 -
                Math.sin(phase) * 5;


            const rightX =
                22 +
                Math.sin(phase + 1.8) * 5;


            const topY =
                -12 +
                Math.cos(phase) * 7;


            ctx.strokeStyle =
                `rgba(${auraRGB}, ${0.08 + auraPower * 0.015})`;

            ctx.lineWidth =
                2 +
                i * 0.7;

            ctx.shadowColor =
                `rgba(${auraRGB}, 0.6)`;

            ctx.shadowBlur =
                12;


            // 左側の揺らぎ
            ctx.beginPath();

            ctx.moveTo(
                leftX,
                22
            );

            ctx.bezierCurveTo(
                leftX - 10,
                5,
                leftX + 7,
                -8,
                leftX + 2,
                topY
            );

            ctx.stroke();


            // 右側の揺らぎ
            ctx.beginPath();

            ctx.moveTo(
                rightX,
                22
            );

            ctx.bezierCurveTo(
                rightX + 10,
                5,
                rightX - 7,
                -8,
                rightX - 2,
                topY
            );

            ctx.stroke();
        }
    }


    // ==================================================
    // ⑥ Lv99：NEXUS FORM
    // ==================================================

    if (level >= 99) {

        const maxPulse =
            1 +
            Math.sin(time * 5.5) * 0.08;


        // 中心から強く漏れるエネルギー
        const maxGradient =
            ctx.createRadialGradient(
                0,
                -8,
                4,
                0,
                -8,
                58 * maxPulse
            );


        maxGradient.addColorStop(
            0,
            `rgba(${auraRGB}, 0.18)`
        );

        maxGradient.addColorStop(
            0.35,
            `rgba(${auraRGB}, 0.10)`
        );

        maxGradient.addColorStop(
            0.75,
            `rgba(${auraRGB}, 0.035)`
        );

        maxGradient.addColorStop(
            1,
            `rgba(${auraRGB}, 0)`
        );


        ctx.fillStyle =
            maxGradient;


        ctx.beginPath();

        ctx.arc(
            0,
            -8,
            58 * maxPulse,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // 上方向へ流れる強いエネルギー
        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const phase =
                time * 2.8 +
                i * 0.9;


            const x =
                Math.sin(phase) *
                (8 + i * 1.5);


            const y =
                -25 -
                (
                    (
                        time * 35 +
                        i * 18
                    )
                    %
                    55
                );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                1.5 + (i % 3),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(${auraRGB}, ${0.18 + i * 0.02})`;

            ctx.shadowColor =
                `rgba(${auraRGB}, 1)`;

            ctx.shadowBlur =
                15;

            ctx.fill();
        }
    }


    ctx.restore();
}

/* ==================================================
   NEXUS MACHINE EVOLUTION
   機体レベルによる見た目の進化
   ※円形オーラは使用しない
================================================== */

function drawMachineEvolution(currentSkin) {

    const machine =
        getMachineProgress(currentSkin);

    const level =
        Math.max(
            1,
            Math.min(
                99,
                Number(machine.level) || 1
            )
        );

    // Lv1～9は通常機体
    if (level < 10) {
        return;
    }

    const time =
        performance.now() * 0.001;

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";


    /* ==================================================
       スキン別カラー
    ================================================== */

    let mainColor = "#39eaff";
    let glowColor = "#00cfff";

    if (currentSkin === "nexus-02") {
        mainColor = "#39f6ff";
        glowColor = "#00d9ff";
    }

    else if (currentSkin === "nexus-03") {
        mainColor = "#ffb347";
        glowColor = "#ff6800";
    }

    else if (currentSkin === "nexus-04") {
        mainColor = "#d98cff";
        glowColor = "#8a5cff";
    }

    else if (currentSkin === "nexus-05") {
        mainColor = "#b96cff";
        glowColor = "#7025ff";
    }


    /* ==================================================
       Lv10～
       エンジン出力強化
    ================================================== */

    if (level >= 10) {

        const power =
            Math.min(
                1,
                (level - 10) / 20
            );

        const engineLength =
            25 +
            power * 18;

        const pulse =
            Math.sin(time * 8) * 4;

        ctx.beginPath();

        ctx.moveTo(
            -6,
            19
        );

        ctx.lineTo(
            0,
            19 +
            engineLength +
            pulse
        );

        ctx.lineTo(
            6,
            19
        );

        ctx.closePath();

        ctx.fillStyle =
            glowColor;

        ctx.shadowColor =
            mainColor;

        ctx.shadowBlur =
            18 +
            power * 15;

        ctx.globalAlpha =
            0.35 +
            power * 0.3;

        ctx.fill();


        // エンジン中央の高出力ライン

        ctx.beginPath();

        ctx.moveTo(
            0,
            22
        );

        ctx.lineTo(
            0,
            22 +
            engineLength * 1.15
        );

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.globalAlpha =
            0.45 +
            power * 0.4;

        ctx.stroke();
    }


    /* ==================================================
       Lv25～
       翼端エネルギー
    ================================================== */

    if (level >= 25) {

        const power =
            Math.min(
                1,
                (level - 25) / 25
            );

        const wave =
            Math.sin(time * 7) * 3;


        // 左翼

        ctx.beginPath();

        ctx.moveTo(
            -18,
            14
        );

        ctx.lineTo(
            -34 -
            power * 12,
            22 +
            wave
        );

        ctx.lineTo(
            -47 -
            power * 15,
            13 -
            wave
        );

        ctx.strokeStyle =
            mainColor;

        ctx.lineWidth =
            2 +
            power * 2;

        ctx.shadowColor =
            glowColor;

        ctx.shadowBlur =
            12 +
            power * 12;

        ctx.globalAlpha =
            0.45 +
            power * 0.35;

        ctx.stroke();


        // 右翼

        ctx.beginPath();

        ctx.moveTo(
            18,
            14
        );

        ctx.lineTo(
            34 +
            power * 12,
            22 +
            wave
        );

        ctx.lineTo(
            47 +
            power * 15,
            13 -
            wave
        );

        ctx.stroke();
    }


    /* ==================================================
       Lv50～
       コア覚醒
    ================================================== */

    if (level >= 50) {

        const power =
            Math.min(
                1,
                (level - 50) / 25
            );

        const pulse =
            1 +
            Math.sin(time * 10) *
            0.08;


        // コアの縦方向エネルギー

        ctx.beginPath();

        ctx.moveTo(
            0,
            -24
        );

        ctx.lineTo(
            -4 -
            power * 3,
            -8
        );

        ctx.lineTo(
            0,
            5 +
            power * 5
        );

        ctx.lineTo(
            4 +
            power * 3,
            -8
        );

        ctx.closePath();

        ctx.fillStyle =
            "#ffffff";

        ctx.shadowColor =
            mainColor;

        ctx.shadowBlur =
            20 +
            power * 20;

        ctx.globalAlpha =
            0.25 +
            power * 0.45;

        ctx.fill();


        // コアから上へ伸びるエネルギー

        ctx.beginPath();

        ctx.moveTo(
            0,
            -18
        );

        ctx.lineTo(
            Math.sin(time * 5) *
            (2 + power * 3),
            -38 -
            power * 15
        );

        ctx.strokeStyle =
            mainColor;

        ctx.lineWidth =
            1.5 +
            power * 2;

        ctx.globalAlpha =
            0.35 +
            power * 0.4;

        ctx.stroke();
    }


    /* ==================================================
       Lv75～
       OVERDRIVE
       翼とエンジンが物理的に強化されたように見せる
    ================================================== */

    if (level >= 75 && level < 99) {

        const power =
            Math.min(
                1,
                (level - 75) / 24
            );

        const wingLength =
            35 +
            power * 18;

        const pulse =
            Math.sin(time * 6) * 2;


        // 左・大型ウイング

        ctx.beginPath();

        ctx.moveTo(
            -12,
            5
        );

        ctx.lineTo(
            -wingLength,
            24 +
            pulse
        );

        ctx.lineTo(
            -28 -
            power * 15,
            9
        );

        ctx.lineTo(
            -12,
            5
        );

        ctx.closePath();

        ctx.fillStyle =
            mainColor;

        ctx.globalAlpha =
            0.18 +
            power * 0.18;

        ctx.shadowColor =
            glowColor;

        ctx.shadowBlur = 15;

        ctx.fill();


        // 右・大型ウイング

        ctx.beginPath();

        ctx.moveTo(
            12,
            5
        );

        ctx.lineTo(
            wingLength,
            24 +
            pulse
        );

        ctx.lineTo(
            28 +
            power * 15,
            9
        );

        ctx.lineTo(
            12,
            5
        );

        ctx.closePath();

        ctx.fill();


        // エンジン左右ノズル

        ctx.beginPath();

        ctx.moveTo(
            -7,
            22
        );

        ctx.lineTo(
            -13,
            45 +
            power * 15
        );

        ctx.lineTo(
            -3,
            29
        );

        ctx.closePath();

        ctx.fillStyle =
            glowColor;

        ctx.globalAlpha =
            0.25 +
            power * 0.25;

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(
            7,
            22
        );

        ctx.lineTo(
            13,
            45 +
            power * 15
        );

        ctx.lineTo(
            3,
            29
        );

        ctx.closePath();

        ctx.fill();
    }


    /* ==================================================
       Lv99
       NEXUS FORM
       本体そのものを変形させる
    ================================================== */

    if (level >= 99) {

        drawNexusFinalForm(
            currentSkin,
            time
        );
    }

        // ========================================
    // 各機体専用進化システム
    // ※既存の描画は一切削除しない
    // ========================================

    const machineData = getMachineProgress(currentSkin);

    const evolutionLevel =
        Math.max(
            1,
            Math.min(
                99,
                Number(machineData.level) || 1
            )
        );

    const evolutionTime =
        performance.now() * 0.001;


    // ========================================
    // NEXUS-01
    // STANDARD → HIGH OUTPUT
    // ========================================

    if (currentSkin === "nexus-01") {

        drawNexus01Evolution(
            evolutionLevel,
            evolutionTime
        );
    }


    // ========================================
    // NEXUS-02
    // SPEED → HYPER SPEED
    // ========================================

    else if (currentSkin === "nexus-02") {

        drawNexus02Evolution(
            evolutionLevel,
            evolutionTime
        );
    }


    // ========================================
    // NEXUS-03
    // HEAVY → OVER ARMOR
    // ========================================

    else if (currentSkin === "nexus-03") {

        drawNexus03Evolution(
            evolutionLevel,
            evolutionTime
        );
    }


    // ========================================
    // NEXUS-04
    // BEAM → BEAM OVERDRIVE
    // ========================================

    else if (currentSkin === "nexus-04") {

        drawNexus04Evolution(
            evolutionLevel,
            evolutionTime
        );
    }



    ctx.restore();
}

// ============================================================
// NEXUS-01 専用進化
// STANDARD → HIGH OUTPUT
// ============================================================

function drawNexus01Evolution(level, time) {

    if (level < 10) {
        return;
    }


    // --------------------------------------------------------
    // Lv10～
    // エンジン出力強化
    // --------------------------------------------------------

    if (level >= 10) {

        ctx.save();

        const pulse =
            0.65 +
            Math.sin(time * 5) * 0.2;

        ctx.globalAlpha =
            pulse;

        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur =
            18;

        ctx.fillStyle =
            "#54f5ff";

        ctx.beginPath();

        ctx.moveTo(
            -5,
            19
        );

        ctx.lineTo(
            -1,
            34
        );

        ctx.lineTo(
            0,
            27
        );

        ctx.lineTo(
            1,
            34
        );

        ctx.lineTo(
            5,
            19
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    // --------------------------------------------------------
    // Lv25～
    // 翼先端エネルギー
    // --------------------------------------------------------

    if (level >= 25) {

        ctx.save();

        ctx.globalAlpha =
            0.75 +
            Math.sin(time * 4) * 0.2;

        ctx.strokeStyle =
            "#39eaff";

        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur =
            14;

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            -17,
            17
        );

        ctx.lineTo(
            -34,
            25
        );

        ctx.moveTo(
            17,
            17
        );

        ctx.lineTo(
            34,
            25
        );

        ctx.stroke();

        ctx.restore();
    }


    // --------------------------------------------------------
    // Lv50～
    // コア強化
    // --------------------------------------------------------

    if (level >= 50) {

        ctx.save();

        const corePulse =
            7 +
            Math.sin(time * 6) * 2;

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            25;

        ctx.fillStyle =
            "#dfffff";

        ctx.beginPath();

        ctx.arc(
            0,
            -8,
            corePulse,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    // --------------------------------------------------------
    // Lv75～
    // 翼拡張
    // --------------------------------------------------------

    if (level >= 75) {

        ctx.save();

        ctx.globalAlpha =
            0.7;

        ctx.fillStyle =
            "#27dfff";

        ctx.shadowColor =
            "#00cfff";

        ctx.shadowBlur =
            20;

        // 左翼追加

        ctx.beginPath();

        ctx.moveTo(
            -20,
            8
        );

        ctx.lineTo(
            -43,
            23
        );

        ctx.lineTo(
            -27,
            20
        );

        ctx.closePath();

        ctx.fill();


        // 右翼追加

        ctx.beginPath();

        ctx.moveTo(
            20,
            8
        );

        ctx.lineTo(
            43,
            23
        );

        ctx.lineTo(
            27,
            20
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    // --------------------------------------------------------
    // Lv99
    // HIGH OUTPUT FORM
    // --------------------------------------------------------

    if (level >= 99) {

        drawNexus01FinalForm(time);
    }
}


// ============================================================
// NEXUS-01 FINAL FORM
// HIGH OUTPUT
// ============================================================

function drawNexus01FinalForm(time) {

    ctx.save();

    const pulse =
        0.8 +
        Math.sin(time * 4) * 0.2;


    // 大型エネルギー翼

    ctx.globalAlpha =
        0.85 * pulse;

    ctx.fillStyle =
        "#39eaff";

    ctx.shadowColor =
        "#00ffff";

    ctx.shadowBlur =
        35;


    // 左

    ctx.beginPath();

    ctx.moveTo(
        -15,
        2
    );

    ctx.lineTo(
        -52,
        27
    );

    ctx.lineTo(
        -29,
        18
    );

    ctx.lineTo(
        -40,
        36
    );

    ctx.lineTo(
        -12,
        20
    );

    ctx.closePath();

    ctx.fill();


    // 右

    ctx.beginPath();

    ctx.moveTo(
        15,
        2
    );

    ctx.lineTo(
        52,
        27
    );

    ctx.lineTo(
        29,
        18
    );

    ctx.lineTo(
        40,
        36
    );

    ctx.lineTo(
        12,
        20
    );

    ctx.closePath();

    ctx.fill();


    // 中央大型コア

    ctx.globalAlpha =
        1;

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#8fffff";

    ctx.shadowBlur =
        35;

    ctx.beginPath();

    ctx.arc(
        0,
        -9,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // 上部エネルギーライン

    ctx.strokeStyle =
        "#bfffff";

    ctx.lineWidth =
        3;

    ctx.beginPath();

    ctx.moveTo(
        0,
        -35
    );

    ctx.lineTo(
        0,
        -50
    );

    ctx.stroke();


    ctx.restore();
}

// ============================================================
// NEXUS-02 専用進化
// SPEED → HYPER SPEED
// ============================================================

function drawNexus02Evolution(level, time) {

    if (level < 10) {
        return;
    }


    // Lv10～ 推進器強化

    if (level >= 10) {

        ctx.save();

        ctx.globalAlpha =
            0.7 +
            Math.sin(time * 8) * 0.2;

        ctx.fillStyle =
            "#39f6ff";

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            20;

        ctx.beginPath();

        ctx.moveTo(
            -4,
            20
        );

        ctx.lineTo(
            0,
            43
        );

        ctx.lineTo(
            4,
            20
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    // Lv25～ 高速翼

    if (level >= 25) {

        ctx.save();

        ctx.strokeStyle =
            "#5cffff";

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            16;

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            -10,
            8
        );

        ctx.lineTo(
            -45,
            31
        );

        ctx.moveTo(
            10,
            8
        );

        ctx.lineTo(
            45,
            31
        );

        ctx.stroke();

        ctx.restore();
    }


    // Lv50～ 推進器追加

    if (level >= 50) {

        ctx.save();

        ctx.fillStyle =
            "#19dff0";

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            18;

        ctx.fillRect(
            -14,
            14,
            5,
            15
        );

        ctx.fillRect(
            9,
            14,
            5,
            15
        );

        ctx.restore();
    }


    // Lv75～ 超高速翼

    if (level >= 75) {

        ctx.save();

        ctx.globalAlpha =
            0.75;

        ctx.strokeStyle =
            "#8fffff";

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur =
            25;

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            -15,
            2
        );

        ctx.lineTo(
            -58,
            34
        );

        ctx.moveTo(
            15,
            2
        );

        ctx.lineTo(
            58,
            34
        );

        ctx.stroke();

        ctx.restore();
    }


    // Lv99

    if (level >= 99) {

        drawNexus02FinalForm(time);
    }
}


// ============================================================
// NEXUS-02 FINAL FORM
// HYPER SPEED
// ============================================================

function drawNexus02FinalForm(time) {

    ctx.save();

    const pulse =
        0.75 +
        Math.sin(time * 10) * 0.25;


    // 超高速翼

    ctx.globalAlpha =
        pulse;

    ctx.strokeStyle =
        "#5cffff";

    ctx.shadowColor =
        "#00ffff";

    ctx.shadowBlur =
        30;

    ctx.lineWidth =
        4;

    ctx.beginPath();

    ctx.moveTo(
        -8,
        0
    );

    ctx.lineTo(
        -65,
        38
    );

    ctx.lineTo(
        -42,
        22
    );

    ctx.moveTo(
        8,
        0
    );

    ctx.lineTo(
        65,
        38
    );

    ctx.lineTo(
        42,
        22
    );

    ctx.stroke();


    // 高速コア

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#39ffff";

    ctx.shadowBlur =
        35;

    ctx.beginPath();

    ctx.arc(
        0,
        -13,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // 後方推進エネルギー

    ctx.fillStyle =
        "#00ffff";

    ctx.globalAlpha =
        0.8;

    ctx.beginPath();

    ctx.moveTo(
        -8,
        20
    );

    ctx.lineTo(
        0,
        55
    );

    ctx.lineTo(
        8,
        20
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
}

// ============================================================
// NEXUS-03 専用進化
// HEAVY → OVER ARMOR
// ============================================================

function drawNexus03Evolution(level, time) {

    if (level < 10) {
        return;
    }


    // Lv10～ 装甲エネルギー

    if (level >= 10) {

        ctx.save();

        ctx.strokeStyle =
            "#ffb52e";

        ctx.shadowColor =
            "#ff8c00";

        ctx.shadowBlur =
            15;

        ctx.lineWidth =
            2;

        ctx.strokeRect(
            -34,
            -1,
            68,
            27
        );

        ctx.restore();
    }


    // Lv25～ 武装エネルギー

    if (level >= 25) {

        ctx.save();

        ctx.fillStyle =
            "#ffb52e";

        ctx.shadowColor =
            "#ff7a00";

        ctx.shadowBlur =
            18;

        ctx.fillRect(
            -38,
            4,
            7,
            18
        );

        ctx.fillRect(
            31,
            4,
            7,
            18
        );

        ctx.restore();
    }


    // Lv50～ 装甲追加

    if (level >= 50) {

        ctx.save();

        ctx.fillStyle =
            "#a96520";

        ctx.shadowColor =
            "#ff9d32";

        ctx.shadowBlur =
            14;


        ctx.fillRect(
            -40,
            -4,
            10,
            32
        );

        ctx.fillRect(
            30,
            -4,
            10,
            32
        );

        ctx.restore();
    }


    // Lv75～ 大型装甲

    if (level >= 75) {

        ctx.save();

        ctx.fillStyle =
            "#d88925";

        ctx.shadowColor =
            "#ff8c00";

        ctx.shadowBlur =
            22;


        ctx.beginPath();

        ctx.moveTo(
            -30,
            -10
        );

        ctx.lineTo(
            -47,
            5
        );

        ctx.lineTo(
            -45,
            28
        );

        ctx.lineTo(
            -28,
            24
        );

        ctx.closePath();

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(
            30,
            -10
        );

        ctx.lineTo(
            47,
            5
        );

        ctx.lineTo(
            45,
            28
        );

        ctx.lineTo(
            28,
            24
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    // Lv99

    if (level >= 99) {

        drawNexus03FinalForm(time);
    }
}


// ============================================================
// NEXUS-03 FINAL FORM
// OVER ARMOR
// ============================================================

function drawNexus03FinalForm(time) {

    ctx.save();


    // 巨大装甲

    ctx.fillStyle =
        "#9e5a18";

    ctx.shadowColor =
        "#ff8c00";

    ctx.shadowBlur =
        30;


    // 左装甲

    ctx.fillRect(
        -48,
        -5,
        14,
        38
    );


    // 右装甲

    ctx.fillRect(
        34,
        -5,
        14,
        38
    );


    // 中央コア

    const pulse =
        10 +
        Math.sin(time * 5) * 2;

    ctx.fillStyle =
        "#fff3b0";

    ctx.shadowColor =
        "#ffb52e";

    ctx.shadowBlur =
        40;

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        pulse,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // 重装砲口

    ctx.fillStyle =
        "#ff9d32";

    ctx.shadowBlur =
        18;

    ctx.fillRect(
        -40,
        10,
        7,
        16
    );

    ctx.fillRect(
        33,
        10,
        7,
        16
    );


    ctx.restore();
}

// ============================================================
// NEXUS-04 専用進化
// BEAM → BEAM OVERDRIVE
// ============================================================

function drawNexus04Evolution(level, time) {

    if (level < 10) {
        return;
    }


    // Lv10～ コア強化

    if (level >= 10) {

        ctx.save();

        const pulse =
            9 +
            Math.sin(time * 7) * 3;

        ctx.fillStyle =
            "#ffffff";

        ctx.shadowColor =
            "#ff5cff";

        ctx.shadowBlur =
            25;

        ctx.beginPath();

        ctx.arc(
            0,
            -9,
            pulse,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    // Lv25～ ビームライン

    if (level >= 25) {

        ctx.save();

        ctx.strokeStyle =
            "#ffffff";

        ctx.shadowColor =
            "#c85cff";

        ctx.shadowBlur =
            20;

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            -10,
            -5
        );

        ctx.lineTo(
            -40,
            20
        );

        ctx.moveTo(
            10,
            -5
        );

        ctx.lineTo(
            40,
            20
        );

        ctx.stroke();

        ctx.restore();
    }


    // Lv50～ ビームユニット

    if (level >= 50) {

        ctx.save();

        ctx.strokeStyle =
            "#8fffff";

        ctx.shadowColor =
            "#5cffff";

        ctx.shadowBlur =
            25;

        ctx.lineWidth =
            4;

        ctx.beginPath();

        ctx.moveTo(
            0,
            -20
        );

        ctx.lineTo(
            0,
            -42
        );

        ctx.stroke();

        ctx.restore();
    }


    // Lv75～ 大型ビームコア

    if (level >= 75) {

        ctx.save();

        ctx.strokeStyle =
            "#ffffff";

        ctx.shadowColor =
            "#d95cff";

        ctx.shadowBlur =
            30;

        ctx.lineWidth =
            5;

        ctx.beginPath();

        ctx.moveTo(
            -15,
            -10
        );

        ctx.lineTo(
            -48,
            23
        );

        ctx.moveTo(
            15,
            -10
        );

        ctx.lineTo(
            48,
            23
        );

        ctx.stroke();

        ctx.restore();
    }


    // Lv99

    if (level >= 99) {

        drawNexus04FinalForm(time);
    }
}


// ============================================================
// NEXUS-04 FINAL FORM
// BEAM OVERDRIVE
// ============================================================

function drawNexus04FinalForm(time) {

    ctx.save();


    const pulse =
        0.8 +
        Math.sin(time * 8) * 0.2;


    // 巨大ビームコア

    ctx.globalAlpha =
        pulse;

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#d95cff";

    ctx.shadowBlur =
        45;

    ctx.beginPath();

    ctx.arc(
        0,
        -10,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ビーム発射ユニット

    ctx.fillStyle =
        "#8a5cff";

    ctx.shadowColor =
        "#ff5cff";

    ctx.shadowBlur =
        25;


    ctx.beginPath();

    ctx.moveTo(
        -12,
        -18
    );

    ctx.lineTo(
        -20,
        -52
    );

    ctx.lineTo(
        -5,
        -32
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        12,
        -18
    );

    ctx.lineTo(
        20,
        -52
    );

    ctx.lineTo(
        5,
        -32
    );

    ctx.closePath();

    ctx.fill();


    // 中央ビームエミッター

    ctx.strokeStyle =
        "#ffffff";

    ctx.shadowColor =
        "#ffffff";

    ctx.shadowBlur =
        35;

    ctx.lineWidth =
        4;

    ctx.beginPath();

    ctx.moveTo(
        0,
        -25
    );

    ctx.lineTo(
        0,
        -65
    );

    ctx.stroke();


    ctx.restore();
}
/* ==================================================
   NEXUS FORM
   Lv99専用最終形態
================================================== */

function drawNexusFinalForm(
    currentSkin,
    time
) {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";


    /* ==================================================
       NEXUS-01
       STANDARD → HIGH OUTPUT FORM
    ================================================== */

    if (currentSkin === "nexus-01") {

        // 大型ウイング

        ctx.beginPath();

        ctx.moveTo(
            -10,
            2
        );

        ctx.lineTo(
            -58,
            20
        );

        ctx.lineTo(
            -43,
            2
        );

        ctx.lineTo(
            -25,
            -6
        );

        ctx.closePath();

        ctx.fillStyle =
            "#148dcc";

        ctx.strokeStyle =
            "#39eaff";

        ctx.lineWidth = 2;

        ctx.shadowColor =
            "#00cfff";

        ctx.shadowBlur = 20;

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            10,
            2
        );

        ctx.lineTo(
            58,
            20
        );

        ctx.lineTo(
            43,
            2
        );

        ctx.lineTo(
            25,
            -6
        );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        // 高出力コア

        ctx.beginPath();

        ctx.moveTo(
            0,
            -28
        );

        ctx.lineTo(
            -9,
            -8
        );

        ctx.lineTo(
            0,
            5
        );

        ctx.lineTo(
            9,
            -8
        );

        ctx.closePath();

        ctx.fillStyle =
            "#ffffff";

        ctx.shadowColor =
            "#39eaff";

        ctx.shadowBlur = 35;

        ctx.fill();


        // 追加エンジン

        drawFinalEngine(
            -13,
            20,
            "#00dfff"
        );

        drawFinalEngine(
            13,
            20,
            "#00dfff"
        );
    }


    /* ==================================================
       NEXUS-02
       SPEED → ULTRA SPEED FORM
    ================================================== */

    else if (currentSkin === "nexus-02") {

        // 超大型高速翼

        ctx.beginPath();

        ctx.moveTo(
            -8,
            3
        );

        ctx.lineTo(
            -70,
            30
        );

        ctx.lineTo(
            -48,
            4
        );

        ctx.lineTo(
            -18,
            -12
        );

        ctx.closePath();

        ctx.fillStyle =
            "#0da4c0";

        ctx.strokeStyle =
            "#39f6ff";

        ctx.lineWidth = 2;

        ctx.shadowColor =
            "#00ffff";

        ctx.shadowBlur = 25;

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            8,
            3
        );

        ctx.lineTo(
            70,
            30
        );

        ctx.lineTo(
            48,
            4
        );

        ctx.lineTo(
            18,
            -12
        );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        // 前方高速ブレード

        ctx.beginPath();

        ctx.moveTo(
            0,
            -48
        );

        ctx.lineTo(
            -7,
            -18
        );

        ctx.lineTo(
            0,
            -5
        );

        ctx.lineTo(
            7,
            -18
        );

        ctx.closePath();

        ctx.fillStyle =
            "#bfffff";

        ctx.shadowBlur = 35;

        ctx.fill();


        drawFinalEngine(
            -9,
            20,
            "#00ffff"
        );

        drawFinalEngine(
            9,
            20,
            "#00ffff"
        );
    }


    /* ==================================================
       NEXUS-03
       ATTACK → ASSAULT FORM
    ================================================== */

    else if (currentSkin === "nexus-03") {

        // 重装甲ショルダー

        ctx.fillStyle =
            "#8e5418";

        ctx.strokeStyle =
            "#ffb347";

        ctx.lineWidth = 2;

        ctx.shadowColor =
            "#ff6800";

        ctx.shadowBlur = 18;


        ctx.fillRect(
            -44,
            -2,
            18,
            30
        );

        ctx.strokeRect(
            -44,
            -2,
            18,
            30
        );


        ctx.fillRect(
            26,
            -2,
            18,
            30
        );

        ctx.strokeRect(
            26,
            -2,
            18,
            30
        );


        // 武装コア

        ctx.beginPath();

        ctx.moveTo(
            0,
            -38
        );

        ctx.lineTo(
            -13,
            -10
        );

        ctx.lineTo(
            0,
            2
        );

        ctx.lineTo(
            13,
            -10
        );

        ctx.closePath();

        ctx.fillStyle =
            "#fff1b0";

        ctx.shadowColor =
            "#ff9d32";

        ctx.shadowBlur = 35;

        ctx.fill();


        // 左右武装

        drawFinalWeapon(
            -35,
            22
        );

        drawFinalWeapon(
            35,
            22
        );


        // 重装エンジン

        drawFinalEngine(
            -12,
            27,
            "#ff7a00"
        );

        drawFinalEngine(
            12,
            27,
            "#ff7a00"
        );
    }


    /* ==================================================
       NEXUS-04
       BEAM → BEAM CORE FORM
    ================================================== */

    else if (currentSkin === "nexus-04") {

        // 巨大ビームコア

        ctx.beginPath();

        ctx.moveTo(
            0,
            -50
        );

        ctx.lineTo(
            -15,
            -12
        );

        ctx.lineTo(
            0,
            10
        );

        ctx.lineTo(
            15,
            -12
        );

        ctx.closePath();


        const gradient =
            ctx.createLinearGradient(
                -20,
                0,
                20,
                0
            );

        gradient.addColorStop(
            0,
            "#ff4fd8"
        );

        gradient.addColorStop(
            0.5,
            "#ffffff"
        );

        gradient.addColorStop(
            1,
            "#38c8ff"
        );


        ctx.fillStyle =
            gradient;

        ctx.shadowColor =
            "#c96cff";

        ctx.shadowBlur = 40;

        ctx.fill();


        // ビーム制御翼

        ctx.beginPath();

        ctx.moveTo(
            -14,
            2
        );

        ctx.lineTo(
            -60,
            26
        );

        ctx.lineTo(
            -42,
            -5
        );

        ctx.closePath();

        ctx.fillStyle =
            "#8a5cff";

        ctx.strokeStyle =
            "#d98cff";

        ctx.lineWidth = 2;

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            14,
            2
        );

        ctx.lineTo(
            60,
            26
        );

        ctx.lineTo(
            42,
            -5
        );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        // ビーム出力ライン

        ctx.beginPath();

        ctx.moveTo(
            0,
            -48
        );

        ctx.lineTo(
            0,
            -70 -
            Math.sin(time * 8) * 5
        );

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 3;

        ctx.shadowColor =
            "#d95cff";

        ctx.shadowBlur = 30;

        ctx.stroke();
    }


    /* ==================================================
       NEXUS-05
       VOID → VOID NEXUS FORM
    ================================================== */

    else if (currentSkin === "nexus-05") {

        // 異形化した大型VOID翼

        ctx.beginPath();

        ctx.moveTo(
            -12,
            0
        );

        ctx.lineTo(
            -62,
            25
        );

        ctx.lineTo(
            -48,
            -5
        );

        ctx.lineTo(
            -28,
            -20
        );

        ctx.closePath();

        ctx.fillStyle =
            "#24113d";

        ctx.strokeStyle =
            "#b96cff";

        ctx.lineWidth = 2;

        ctx.shadowColor =
            "#7025ff";

        ctx.shadowBlur = 30;

        ctx.fill();
        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            12,
            0
        );

        ctx.lineTo(
            62,
            25
        );

        ctx.lineTo(
            48,
            -5
        );

        ctx.lineTo(
            28,
            -20
        );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();


        // VOIDコア

        ctx.beginPath();

        ctx.moveTo(
            0,
            -42
        );

        ctx.lineTo(
            -11,
            -12
        );

        ctx.lineTo(
            0,
            7
        );

        ctx.lineTo(
            11,
            -12
        );

        ctx.closePath();

        ctx.fillStyle =
            "#d9a3ff";

        ctx.shadowColor =
            "#a94dff";

        ctx.shadowBlur = 45;

        ctx.fill();


        // 紫の異形エネルギー

        ctx.beginPath();

        ctx.moveTo(
            -10,
            15
        );

        ctx.lineTo(
            -20,
            55 +
            Math.sin(time * 5) * 8
        );

        ctx.lineTo(
            -4,
            28
        );

        ctx.closePath();

        ctx.fillStyle =
            "#8b4dff";

        ctx.globalAlpha = 0.6;

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(
            10,
            15
        );

        ctx.lineTo(
            20,
            55 +
            Math.sin(time * 5 + 1) * 8
        );

        ctx.lineTo(
            4,
            28
        );

        ctx.fill();
    }


    ctx.restore();
}


/* ==================================================
   Lv99 共通エンジン
================================================== */

function drawFinalEngine(
    x,
    y,
    color
) {

    ctx.beginPath();

    ctx.moveTo(
        x - 6,
        y
    );

    ctx.lineTo(
        x,
        y + 30
    );

    ctx.lineTo(
        x + 6,
        y
    );

    ctx.closePath();

    ctx.fillStyle =
        color;

    ctx.shadowColor =
        color;

    ctx.shadowBlur = 25;

    ctx.globalAlpha = 0.8;

    ctx.fill();
}


/* ==================================================
   Lv99 共通武装
================================================== */

function drawFinalWeapon(
    x,
    y
) {

    ctx.fillStyle =
        "#5f3a12";

    ctx.strokeStyle =
        "#ffb347";

    ctx.lineWidth = 2;

    ctx.shadowColor =
        "#ff6800";

    ctx.shadowBlur = 15;

    ctx.fillRect(
        x - 5,
        y - 3,
        10,
        26
    );

    ctx.strokeRect(
        x - 5,
        y - 3,
        10,
        26
    );

    ctx.beginPath();

    ctx.arc(
        x,
        y - 5,
        5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#fff1b0";

    ctx.fill();
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

        drawLevelTransitionInvincibility();
        

          ctx.save();

    const currentSkin =
        localStorage.getItem("nexus-equipped-skin")
        || "nexus-01";


  

    ctx.translate(
        player.x,
        player.y
    );


    
    //drawMachineLevelAura(currentSkin);

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

    drawMachineEvolution(currentSkin);

    drawMachineEvolution123(currentSkin);
    ctx.restore();



}
// ==================================================
// NEXUS-01～03 専用機体進化
// 既存機体に追加パーツを重ねる方式
// NEXUS-04 / NEXUS-05 は変更しない
// ==================================================

function drawMachineEvolution123(currentSkin) {

    if (
        currentSkin !== "nexus-01" &&
        currentSkin !== "nexus-02" &&
        currentSkin !== "nexus-03"
    ) {
        return;
    }

    const machine =
        getMachineProgress(currentSkin);

    const level =
        Math.max(
            1,
            Math.min(
                99,
                Number(machine.level) || 1
            )
        );

    const time =
        performance.now() * 0.001;

    ctx.save();

    // ==================================================
    // NEXUS-01
    // メカニック / 軍用戦闘機
    // ==================================================

    if (currentSkin === "nexus-01") {

        // ----------------------------------------------
        // Lv10
        // エンジンノズル強化
        // ----------------------------------------------

        if (level >= 10) {

            ctx.fillStyle =
                "#168fc7";

            ctx.shadowColor =
                "#00d9ff";

            ctx.shadowBlur = 12;

            // 左エンジン
            ctx.fillRect(
                -19,
                17,
                7,
                10
            );

            // 右エンジン
            ctx.fillRect(
                12,
                17,
                7,
                10
            );

            // 排気
            ctx.fillStyle =
                "rgba(80,220,255,0.8)";

            ctx.beginPath();

            ctx.moveTo(-16, 27);
            ctx.lineTo(-13, 38);
            ctx.lineTo(-10, 27);

            ctx.closePath();

            ctx.fill();

            ctx.beginPath();

            ctx.moveTo(10, 27);
            ctx.lineTo(13, 38);
            ctx.lineTo(16, 27);

            ctx.closePath();

            ctx.fill();
        }


        // ----------------------------------------------
        // Lv25
        // 主翼補強フレーム
        // ----------------------------------------------

        if (level >= 25) {

            ctx.strokeStyle =
                "#42e8ff";

            ctx.lineWidth = 3;

            ctx.shadowColor =
                "#00cfff";

            ctx.shadowBlur = 10;

            // 左翼フレーム
            ctx.beginPath();

            ctx.moveTo(-12, 5);
            ctx.lineTo(-38, 22);
            ctx.lineTo(-20, 19);

            ctx.stroke();

            // 右翼フレーム
            ctx.beginPath();

            ctx.moveTo(12, 5);
            ctx.lineTo(38, 22);
            ctx.lineTo(20, 19);

            ctx.stroke();
        }


        // ----------------------------------------------
        // Lv50
        // 胴体装甲追加
        // ----------------------------------------------

        if (level >= 50) {

            ctx.fillStyle =
                "#166a91";

            ctx.shadowColor =
                "#00bde8";

            ctx.shadowBlur = 14;

            // 左装甲
            ctx.beginPath();

            ctx.moveTo(-13, -4);
            ctx.lineTo(-24, 8);
            ctx.lineTo(-18, 16);
            ctx.lineTo(-8, 10);

            ctx.closePath();

            ctx.fill();

            // 右装甲
            ctx.beginPath();

            ctx.moveTo(13, -4);
            ctx.lineTo(24, 8);
            ctx.lineTo(18, 16);
            ctx.lineTo(8, 10);

            ctx.closePath();

            ctx.fill();

            // 中央装甲ライン
            ctx.strokeStyle =
                "#7df4ff";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(0, -28);
            ctx.lineTo(0, 15);

            ctx.stroke();
        }


        // ----------------------------------------------
        // Lv75
        // 補助スラスター＋追加翼
        // ----------------------------------------------

        if (level >= 75) {

            ctx.fillStyle =
                "#0c587d";

            ctx.shadowColor =
                "#00d9ff";

            ctx.shadowBlur = 18;

            // 左補助翼
            ctx.beginPath();

            ctx.moveTo(-18, 3);
            ctx.lineTo(-48, 15);
            ctx.lineTo(-39, 25);
            ctx.lineTo(-19, 18);

            ctx.closePath();

            ctx.fill();

            // 右補助翼
            ctx.beginPath();

            ctx.moveTo(18, 3);
            ctx.lineTo(48, 15);
            ctx.lineTo(39, 25);
            ctx.lineTo(19, 18);

            ctx.closePath();

            ctx.fill();

            // 補助スラスター
            ctx.fillStyle =
                "#38eaff";

            ctx.fillRect(
                -31,
                21,
                7,
                7
            );

            ctx.fillRect(
                24,
                21,
                7,
                7
            );
        }


        // ----------------------------------------------
        // Lv99
        // NEXUS-01 HIGH OUTPUT FORM
        // 完全メカニック型
        // ----------------------------------------------

        if (level >= 99) {

            const pulse =
                0.65 +
                Math.sin(time * 5) * 0.2;

            // 大型中央装甲
            ctx.fillStyle =
                "#0c3f5c";

            ctx.shadowColor =
                "#00eaff";

            ctx.shadowBlur = 22;

            ctx.beginPath();

            ctx.moveTo(0, -39);
            ctx.lineTo(-14, -23);
            ctx.lineTo(-19, 7);
            ctx.lineTo(-10, 23);
            ctx.lineTo(0, 17);
            ctx.lineTo(10, 23);
            ctx.lineTo(19, 7);
            ctx.lineTo(14, -23);

            ctx.closePath();

            ctx.fill();

            // 中央高出力コア
            ctx.beginPath();

            ctx.arc(
                0,
                -10,
                8,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(190,250,255,${pulse})`;

            ctx.shadowColor =
                "#ffffff";

            ctx.shadowBlur = 28;

            ctx.fill();

            // 4基エンジン
            ctx.fillStyle =
                "#087cae";

            ctx.fillRect(
                -25,
                17,
                8,
                13
            );

            ctx.fillRect(
                -14,
                20,
                7,
                13
            );

            ctx.fillRect(
                7,
                20,
                7,
                13
            );

            ctx.fillRect(
                17,
                17,
                8,
                13
            );

            // エンジン光
            ctx.fillStyle =
                "#5cefff";

            ctx.shadowColor =
                "#00dfff";

            ctx.shadowBlur = 20;

            ctx.fillRect(
                -23,
                30,
                4,
                10
            );

            ctx.fillRect(
                -12,
                32,
                4,
                9
            );

            ctx.fillRect(
                8,
                32,
                4,
                9
            );

            ctx.fillRect(
                19,
                30,
                4,
                10
            );
        }
    }


    // ==================================================
    // NEXUS-02
    // SF宇宙船 / 高速戦闘艇
    // ==================================================

    else if (currentSkin === "nexus-02") {

        // ----------------------------------------------
        // Lv10
        // 後部エンジン強化
        // ----------------------------------------------

        if (level >= 10) {

            ctx.fillStyle =
                "#087b9a";

            ctx.shadowColor =
                "#00eaff";

            ctx.shadowBlur = 15;

            ctx.fillRect(
                -12,
                19,
                7,
                13
            );

            ctx.fillRect(
                5,
                19,
                7,
                13
            );

            // エンジン噴射
            ctx.fillStyle =
                "#5cf4ff";

            ctx.beginPath();

            ctx.moveTo(-9, 31);
            ctx.lineTo(-5, 48);
            ctx.lineTo(-2, 31);

            ctx.closePath();

            ctx.fill();

            ctx.beginPath();

            ctx.moveTo(2, 31);
            ctx.lineTo(5, 48);
            ctx.lineTo(9, 31);

            ctx.closePath();

            ctx.fill();
        }


        // ----------------------------------------------
        // Lv25
        // 宇宙船型の左右翼
        // ----------------------------------------------

        if (level >= 25) {

            ctx.fillStyle =
                "#0c7f9d";

            ctx.shadowColor =
                "#00eaff";

            ctx.shadowBlur = 18;

            // 左大型翼
            ctx.beginPath();

            ctx.moveTo(-8, -2);
            ctx.lineTo(-43, 13);
            ctx.lineTo(-55, 27);
            ctx.lineTo(-20, 18);

            ctx.closePath();

            ctx.fill();

            // 右大型翼
            ctx.beginPath();

            ctx.moveTo(8, -2);
            ctx.lineTo(43, 13);
            ctx.lineTo(55, 27);
            ctx.lineTo(20, 18);

            ctx.closePath();

            ctx.fill();

            // 翼のライン
            ctx.strokeStyle =
                "#55efff";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(-12, 5);
            ctx.lineTo(-48, 22);

            ctx.moveTo(12, 5);
            ctx.lineTo(48, 22);

            ctx.stroke();
        }


        // ----------------------------------------------
        // Lv50
        // 船体大型化
        // ----------------------------------------------

        if (level >= 50) {

            ctx.fillStyle =
                "#07546d";

            ctx.shadowColor =
                "#00dfff";

            ctx.shadowBlur = 20;

            ctx.beginPath();

            ctx.moveTo(0, -45);
            ctx.lineTo(-15, -20);
            ctx.lineTo(-20, 20);
            ctx.lineTo(0, 29);
            ctx.lineTo(20, 20);
            ctx.lineTo(15, -20);

            ctx.closePath();

            ctx.fill();

            // 船体中央ライン
            ctx.strokeStyle =
                "#8cf7ff";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(0, -39);
            ctx.lineTo(0, 23);

            ctx.stroke();
        }


        // ----------------------------------------------
        // Lv75
        // 超高速型
        // ----------------------------------------------

        if (level >= 75) {

            ctx.fillStyle =
                "#06455c";

            ctx.shadowColor =
                "#00ffff";

            ctx.shadowBlur = 25;

            // 超大型左右翼
            ctx.beginPath();

            ctx.moveTo(-12, -8);
            ctx.lineTo(-58, 5);
            ctx.lineTo(-70, 21);
            ctx.lineTo(-26, 17);

            ctx.closePath();

            ctx.fill();

            ctx.beginPath();

            ctx.moveTo(12, -8);
            ctx.lineTo(58, 5);
            ctx.lineTo(70, 21);
            ctx.lineTo(26, 17);

            ctx.closePath();

            ctx.fill();

            // 追加エンジン
            ctx.fillStyle =
                "#13bcd8";

            ctx.fillRect(
                -27,
                18,
                8,
                10
            );

            ctx.fillRect(
                19,
                18,
                8,
                10
            );
        }


        // ----------------------------------------------
        // Lv99
        // NEXUS-02 ULTRA SPEED FORM
        // 宇宙船として完全に別シルエット
        // ----------------------------------------------

        if (level >= 99) {

            const pulse =
                0.7 +
                Math.sin(time * 8) * 0.25;

            // 船首
            ctx.fillStyle =
                "#063b52";

            ctx.shadowColor =
                "#00f0ff";

            ctx.shadowBlur = 30;

            ctx.beginPath();

            ctx.moveTo(
                0,
                -58
            );

            ctx.lineTo(
                -16,
                -20
            );

            ctx.lineTo(
                -24,
                23
            );

            ctx.lineTo(
                0,
                34
            );

            ctx.lineTo(
                24,
                23
            );

            ctx.lineTo(
                16,
                -20
            );

            ctx.closePath();

            ctx.fill();

            // 長い左右翼
            ctx.fillStyle =
                "#0b6f8e";

            ctx.beginPath();

            ctx.moveTo(
                -12,
                -4
            );

            ctx.lineTo(
                -72,
                8
            );

            ctx.lineTo(
                -92,
                23
            );

            ctx.lineTo(
                -25,
                17
            );

            ctx.closePath();

            ctx.fill();

            ctx.beginPath();

            ctx.moveTo(
                12,
                -4
            );

            ctx.lineTo(
                72,
                8
            );

            ctx.lineTo(
                92,
                23
            );

            ctx.lineTo(
                25,
                17
            );

            ctx.closePath();

            ctx.fill();

            // 4基高速エンジン
            ctx.fillStyle =
                `rgba(80,245,255,${pulse})`;

            ctx.shadowColor =
                "#00ffff";

            ctx.shadowBlur = 30;

            ctx.fillRect(
                -25,
                24,
                8,
                14
            );

            ctx.fillRect(
                -10,
                27,
                7,
                16
            );

            ctx.fillRect(
                3,
                27,
                7,
                16
            );

            ctx.fillRect(
                17,
                24,
                8,
                14
            );

            // 超高速エンジン噴射
            ctx.fillStyle =
                "#b8fbff";

            ctx.beginPath();

            ctx.moveTo(-21, 37);
            ctx.lineTo(-17, 65);
            ctx.lineTo(-13, 37);

            ctx.closePath();

            ctx.fill();

            ctx.beginPath();

            ctx.moveTo(13, 37);
            ctx.lineTo(17, 65);
            ctx.lineTo(21, 37);

            ctx.closePath();

            ctx.fill();

            // 中央コア
            ctx.beginPath();

            ctx.arc(
                0,
                -20,
                7,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.shadowColor =
                "#8fffff";

            ctx.shadowBlur = 35;

            ctx.fill();
        }
    }


    // ==================================================
    // NEXUS-03
    // 重武装アサルト機
    // ==================================================

    else if (currentSkin === "nexus-03") {

        // ----------------------------------------------
        // Lv10
        // 砲口追加
        // ----------------------------------------------

        if (level >= 10) {

            ctx.fillStyle =
                "#673b12";

            ctx.shadowColor =
                "#ff8c00";

            ctx.shadowBlur = 12;

            ctx.fillRect(
                -31,
                8,
                8,
                18
            );

            ctx.fillRect(
                23,
                8,
                8,
                18
            );

            ctx.fillStyle =
                "#ffad32";

            ctx.fillRect(
                -30,
                7,
                6,
                5
            );

            ctx.fillRect(
                24,
                7,
                6,
                5
            );
        }


        // ----------------------------------------------
        // Lv25
        // 左右武装ユニット
        // ----------------------------------------------

        if (level >= 25) {

            ctx.fillStyle =
                "#754416";

            ctx.shadowColor =
                "#ff8c00";

            ctx.shadowBlur = 15;

            // 左武装
            ctx.beginPath();

            ctx.moveTo(-24, -3);
            ctx.lineTo(-43, 2);
            ctx.lineTo(-47, 16);
            ctx.lineTo(-25, 18);

            ctx.closePath();

            ctx.fill();

            // 右武装
            ctx.beginPath();

            ctx.moveTo(24, -3);
            ctx.lineTo(43, 2);
            ctx.lineTo(47, 16);
            ctx.lineTo(25, 18);

            ctx.closePath();

            ctx.fill();

            // 武装発光部
            ctx.fillStyle =
                "#ffbd4a";

            ctx.fillRect(
                -42,
                4,
                8,
                4
            );

            ctx.fillRect(
                34,
                4,
                8,
                4
            );
        }


        // ----------------------------------------------
        // Lv50
        // 重装甲
        // ----------------------------------------------

        if (level >= 50) {

            ctx.fillStyle =
                "#623812";

            ctx.shadowColor =
                "#ff7900";

            ctx.shadowBlur = 18;

            // 左肩装甲
            ctx.beginPath();

            ctx.moveTo(-25, -13);
            ctx.lineTo(-38, -5);
            ctx.lineTo(-37, 15);
            ctx.lineTo(-24, 20);

            ctx.closePath();

            ctx.fill();

            // 右肩装甲
            ctx.beginPath();

            ctx.moveTo(25, -13);
            ctx.lineTo(38, -5);
            ctx.lineTo(37, 15);
            ctx.lineTo(24, 20);

            ctx.closePath();

            ctx.fill();

            // 中央装甲板
            ctx.fillStyle =
                "#9b5a19";

            ctx.beginPath();

            ctx.moveTo(
                0,
                -31
            );

            ctx.lineTo(
                -9,
                -18
            );

            ctx.lineTo(
                -9,
                12
            );

            ctx.lineTo(
                0,
                20
            );

            ctx.lineTo(
                9,
                12
            );

            ctx.lineTo(
                9,
                -18
            );

            ctx.closePath();

            ctx.fill();
        }


        // ----------------------------------------------
        // Lv75
        // 大型キャノン
        // ----------------------------------------------

        if (level >= 75) {

            ctx.fillStyle =
                "#47270d";

            ctx.shadowColor =
                "#ff7a00";

            ctx.shadowBlur = 20;

            // 左キャノン
            ctx.fillRect(
                -46,
                -10,
                14,
                35
            );

            ctx.fillRect(
                -50,
                -18,
                22,
                10
            );

            // 右キャノン
            ctx.fillRect(
                32,
                -10,
                14,
                35
            );

            ctx.fillRect(
                28,
                -18,
                22,
                10
            );

            // キャノン先端
            ctx.fillStyle =
                "#ffad32";

            ctx.fillRect(
                -48,
                -20,
                18,
                5
            );

            ctx.fillRect(
                30,
                -20,
                18,
                5
            );
        }


        // ----------------------------------------------
        // Lv99
        // NEXUS-03 HEAVY ASSAULT FORM
        // ----------------------------------------------

        if (level >= 99) {

            const pulse =
                0.65 +
                Math.sin(time * 4) * 0.2;

            // 巨大中央装甲
            ctx.fillStyle =
                "#40230b";

            ctx.shadowColor =
                "#ff7900";

            ctx.shadowBlur = 28;

            ctx.beginPath();

            ctx.moveTo(
                0,
                -40
            );

            ctx.lineTo(
                -18,
                -25
            );

            ctx.lineTo(
                -29,
                12
            );

            ctx.lineTo(
                -15,
                29
            );

            ctx.lineTo(
                0,
                35
            );

            ctx.lineTo(
                15,
                29
            );

            ctx.lineTo(
                29,
                12
            );

            ctx.lineTo(
                18,
                -25
            );

            ctx.closePath();

            ctx.fill();

            // 左大型砲塔
            ctx.fillStyle =
                "#5b3210";

            ctx.fillRect(
                -51,
                -20,
                18,
                43
            );

            ctx.fillRect(
                -58,
                -30,
                30,
                11
            );

            // 右大型砲塔
            ctx.fillRect(
                33,
                -20,
                18,
                43
            );

            ctx.fillRect(
                28,
                -30,
                30,
                11
            );

            // キャノンコア
            ctx.fillStyle =
                `rgba(255,190,70,${pulse})`;

            ctx.shadowColor =
                "#ffb52e";

            ctx.shadowBlur = 30;

            ctx.beginPath();

            ctx.arc(
                0,
                -8,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();

            // 中央砲身
            ctx.fillStyle =
                "#7b4613";

            ctx.fillRect(
                -6,
                -48,
                12,
                27
            );

            // 砲口
            ctx.fillStyle =
                "#ffc45c";

            ctx.shadowColor =
                "#ff7a00";

            ctx.shadowBlur = 30;

            ctx.beginPath();

            ctx.arc(
                0,
                -49,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

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
   ZIGZAG
================================= */

if (enemy.type === "zigzag") {

    /* 外側 */

    ctx.beginPath();

    ctx.moveTo(
        0,
        -enemy.height / 2
    );

    ctx.lineTo(
        enemy.width / 2,
        0
    );

    ctx.lineTo(
        0,
        enemy.height / 2
    );

    ctx.lineTo(
        -enemy.width / 2,
        0
    );

    ctx.closePath();

    ctx.fillStyle =
        "#ffe14a";

    ctx.shadowColor =
        "#ffb300";

    ctx.shadowBlur =
        22;

    ctx.fill();


    /* 中央コア */

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        enemy.width * 0.18,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "#ffffff";

    ctx.shadowBlur =
        14;

    ctx.fill();


    /* 横方向のライン */

    ctx.strokeStyle =
        "#fff3a3";

    ctx.lineWidth =
        2;

    ctx.beginPath();

    ctx.moveTo(
        -enemy.width * 0.28,
        0
    );

    ctx.lineTo(
        enemy.width * 0.28,
        0
    );

    ctx.stroke();

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

    addMachineExp(500);


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
        350,
        enemyInterval - 40
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
   ZIGZAG移動
================================= */

if (enemy.type === "zigzag") {

    enemy.zigzagTime +=
        deltaTime *
        enemy.zigzagFrequency;

    enemy.x =
        enemy.baseX +
        Math.sin(enemy.zigzagTime) *
        enemy.zigzagAmplitude;

    // 画面外へ飛び出さないようにする
    const margin =
        enemy.width / 2;

    enemy.x =
        Math.max(
            margin,
            Math.min(
                width - margin,
                enemy.x
            )
        );

}
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

            vy: 230,
radius: 7

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
=============k===================================== */


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
            : defeatedEnemyType === "zigzag"
            ? 20
            : 10
    )
    addMachineExp(
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
: defeatedEnemyType === "zigzag"
? 20
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

                speed: 220,

                rotation:
                    Math.random() * Math.PI * 2,

                rotationSpeed:
                    (Math.random() - 0.5) * 6,

                hp: 2,
                maxHp: 2,

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

updateMachineLevelUp(deltaTime);

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

drawMachineLevelUp();

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

/* ==================================================
   NEXUS SKILL GRID
   第1弾：スキルパネル / 六角形ノード / 選択
================================================== */


/* ==================================================
   スキル定義
================================================== */


/* ==================================================
   NEXUS SKILL GRID
   第2弾：SPシステム / 数字ID / スキル効果
================================================== */


/* ==================================================
   スキル番号
================================================== */



initLIFF();

/* ==================================================
   NEXUS SKILL GRID
   第2弾
   SP + 数字ID + 六角形UI
================================================== */


/* ==================================================
   スキル番号
================================================== */

