const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoogleGenAI } = require('@google/genai');

// =================================================================
// ⚙️ CONFIGURATION (Yahan Apni Details Paste Kar)
// =================================================================
const GEMINI_API_KEY = 'AQ.Ab8RN6JB6W_y5Mqn-W3p6jH79O3QKZA0Azs_QiymDXuLbDRLbA'; 
const SERVER_HOST = 'coollegendmc.aternos.me'; // e.g. 'mysmp.aternos.me'
const SERVER_PORT = 50502;                  // Apne Aternos ka PORT daal (e.g. 12345)
const SERVER_VERSION = '1.20.4';            // Exact Server Version
const BOT_USERNAME = 'AgniPrash';           // Bot Name
// =================================================================

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
let activeIntervals = [];

function clearAllLoops() {
  activeIntervals.forEach(clearInterval);
  activeIntervals = [];
}

function createBot() {
  clearAllLoops();
  console.log('🔄 Connecting to Minecraft Server...');

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: SERVER_VERSION,
    skipValidation: true
  });

  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    console.log("🚀 AgniPrash AI Engine Active | Created by Swarit Netke");
    console.log(`🚀 [PRO AI ONLINE] ${bot.username} joined as a Pro Player!`);

    try {
      const mcData = require('minecraft-data')(bot.version);
      const defaultMove = new Movements(bot, mcData);
      defaultMove.canDig = true;
      bot.pathfinder.setMovements(defaultMove);
    } catch (e) {}

    // 1. HUMAN ANTI-AFK ACTIONS
    activeIntervals.push(setInterval(() => {
      if (!bot.entity) return;
      bot.look((Math.random() * 360 - 180) * (Math.PI / 180), 0, true);
      bot.swingArm('right');
    }, 3000));

    // 2. SMART COMBAT & SELF DEFENSE (Mobs Se Ladaai)
    activeIntervals.push(setInterval(() => {
      if (!bot.entity) return;
      handleMobDefense(bot);
    }, 1500));

    // 3. PRO SURVIVAL ENGINE (Wood Chop & Exploration)
    activeIntervals.push(setInterval(() => {
      if (!bot.entity || bot.pathfinder.isMoving()) return;
      
      if (Math.random() < 0.6) {
        chopNearestTree(bot);
      } else {
        randomExplore(bot);
      }
    }, 10000));
  });

  // ⚔️ MOB DEFENSE LOGIC
  function handleMobDefense(bot) {
    const hostiles = ['zombie', 'skeleton', 'spider', 'creeper', 'drowned', 'husk'];
    const mob = bot.nearestEntity(e => e.type === 'mob' && hostiles.includes(e.name) && e.position.distanceTo(bot.entity.position) < 7);

    if (mob) {
      if (bot.health < 8) {
        // Low HP: Bhaag kar jaan bachao
        console.log(`⚠️ Low HP (${bot.health})! Retreating from ${mob.name}...`);
        const fleeX = bot.entity.position.x + (bot.entity.position.x - mob.position.x);
        const fleeZ = bot.entity.position.z + (bot.entity.position.z - mob.position.z);
        try { bot.pathfinder.setGoal(new goals.GoalXZ(fleeX, fleeZ)); } catch (e) {}
      } else {
        // Attack Engine: Sword/Axe equip karke attack
        console.log(`⚔️ Hostile Mob (${mob.name}) detected! Engaging in combat...`);
        equipBestWeapon(bot);
        bot.lookAt(mob.position.offset(0, mob.height, 0));
        bot.attack(mob);
      }
    }
  }

  // 🗡️ EQUIP BEST WEAPON
  function equipBestWeapon(bot) {
    const weapons = bot.inventory.items().filter(item => item.name.includes('sword') || item.name.includes('axe'));
    if (weapons.length > 0) {
      try { bot.equip(weapons[0], 'hand'); } catch (e) {}
    }
  }

  // 🪓 TREE CHOPPING LOGIC
  async function chopNearestTree(bot) {
    try {
      const logBlocks = bot.findBlocks({
        matching: (b) => b && b.name.includes('_log'),
        maxDistance: 12,
        count: 1
      });

      if (logBlocks.length > 0) {
        const target = bot.blockAt(logBlocks[0]);
        console.log(`🪓 Pro Bot chopping log at ${target.position}`);
        bot.pathfinder.setGoal(new goals.GoalBlock(target.position.x, target.position.y, target.position.z));
        await bot.dig(target);
      }
    } catch (err) {}
  }

  // 🚶 SAFE EXPLORATION
  function randomExplore(bot) {
    try {
      const x = bot.entity.position.x + (Math.floor(Math.random() * 12) - 6);
      const z = bot.entity.position.z + (Math.floor(Math.random() * 12) - 6);
      bot.pathfinder.setGoal(new goals.GoalXZ(x, z));
    } catch (err) {}
  }

  // 💬 CHAT AI RESPONSE
  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    if (message.toLowerCase().includes('bot') || message.toLowerCase().includes(bot.username.toLowerCase())) {
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an expert Minecraft survival player named ${bot.username}. Player "${username}" said: "${message}". Reply in 1 short Hinglish sentence, pro gamer style.`
        });
        bot.chat(res.text.trim());
      } catch (e) {}
    }
  });

  bot.on('error', (err) => console.log('❌ Error:', err.message));
  
  bot.on('end', (reason) => {
    console.log(`⚠️ Disconnected (${reason}). Reconnecting in 8 seconds...`);
    clearAllLoops();
    bot.removeAllListeners();
    setTimeout(createBot, 8000);
  });
}

createBot();

/* ========================================================================
 * PROJECT: AgniPrash Autonomous Minecraft AI Bot
 * AUTHOR: Swarit Netke (AgniPrash)
 * COPYRIGHT: (c) 2026 Swarit Netke. All Rights Reserved.
 * NOTICE: STRICTLY FOR PERSONAL USE. COMMERCIAL SELLING IS PROHIBITED.
 * ======================================================================== */
