// server.js - Backend Node.js Server for Bagas Showcase WA Bot Gateway

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static showcase website files
app.use(express.static(__dirname));

// Files paths for local database
const CONFIG_FILE = path.join(__dirname, 'bot_config.json');
const MEMORIES_FILE = path.join(__dirname, 'bot_memories.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');

function loadNotes() {
  if (!fs.existsSync(NOTES_FILE)) {
    const defaultNotes = {
      notes: [],
      folders: ['Bisnis', 'Kuliah', 'Coding'],
      stickies: []
    };
    fs.writeFileSync(NOTES_FILE, JSON.stringify(defaultNotes, null, 2));
    return defaultNotes;
  }
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch (err) {
    return { notes: [], folders: ['Bisnis', 'Kuliah', 'Coding'], stickies: [] };
  }
}

function saveNotes(data) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

// --- DATABASE HELPERS ---
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      aiEngine: 'gemini',
      apiKey: '',
      bosNumber: '6281234567890',
      sheetsId: '',
      dailyBriefingTime: '08:00',
      isConnected: false
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadMemories() {
  if (!fs.existsSync(MEMORIES_FILE)) {
    const defaultMemories = [
      { id: 1, fact: 'Sandi wifi kantor adalah "admin123"', date: '2026-06-19 07:00' }
    ];
    fs.writeFileSync(MEMORIES_FILE, JSON.stringify(defaultMemories, null, 2));
    return defaultMemories;
  }
  return JSON.parse(fs.readFileSync(MEMORIES_FILE, 'utf8'));
}

function saveMemories(memories) {
  fs.writeFileSync(MEMORIES_FILE, JSON.stringify(memories, null, 2));
}

// --- LOGGING ---
let logs = [
  { time: '08:00:00', type: 'SYSTEM', text: 'Server Node.js berjalan. Mempersiapkan client WhatsApp Web...' }
];
let incomingWaMessages = [];

function addLog(type, text) {
  const time = new Date().toTimeString().split(' ')[0];
  logs.push({ time, type, text });
  if (logs.length > 50) logs.shift();
  console.log(`[${time}] [${type}] ${text}`);
}

// --- WHATSAPP CLIENT SETUP ---
let qrCodeBase64 = '';
let waReady = false;
let client;
let qrAttempts = 0;
const MAX_QR_ATTEMPTS = 5; // Batasi generate QR Code sampai 5 kali saja agar hemat resource

function initializeWhatsapp() {
  addLog('SYSTEM', 'Mempersiapkan client WhatsApp Web...');
  
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    try {
      qrAttempts++;
      if (qrAttempts > MAX_QR_ATTEMPTS) {
        addLog('SYSTEM', `QR Code telah kedaluwarsa setelah ${MAX_QR_ATTEMPTS} kali tanpa di-scan. WhatsApp Gateway dimatikan otomatis untuk menghemat resource. Silakan klik tombol 'Reset Sesi' untuk menghubungkan ulang.`);
        qrCodeBase64 = '';
        try {
          await client.destroy();
        } catch (e) {}
        return;
      }
      qrCodeBase64 = await QRCode.toDataURL(qr);
      waReady = false;
      addLog('SYSTEM', `QR Code baru dihasilkan (${qrAttempts}/${MAX_QR_ATTEMPTS}). Silakan scan di Dashboard.`);
    } catch (err) {
      addLog('SYSTEM', 'Gagal memproses QR Code: ' + err.message);
    }
  });

  client.on('ready', () => {
    waReady = true;
    qrCodeBase64 = '';
    qrAttempts = 0;
    addLog('SYSTEM', 'WhatsApp Client siap & terhubung!');
    
    // Update config connection status
    const config = loadConfig();
    config.isConnected = true;
    saveConfig(config);
  });

  client.on('disconnected', () => {
    waReady = false;
    qrCodeBase64 = '';
    qrAttempts = 0;
    addLog('SYSTEM', 'WhatsApp terputus!');
    
    const config = loadConfig();
    config.isConnected = false;
    saveConfig(config);
  });

  // --- WHATSAPP BOT MESSAGE DISPATCHER ---
  client.on('message', async (msg) => {
    const config = loadConfig();
    const rawSender = msg.from; // e.g. "6281234567890@c.us"
    const senderNumber = rawSender.split('@')[0];
    
    // Format Bos number to match
    const formattedBos = config.bosNumber.replace(/\D/g, '');
    const isBos = (senderNumber === formattedBos);

    // Save to incoming messages catalog
    incomingWaMessages.unshift({
      time: new Date().toTimeString().split(' ')[0],
      from: rawSender,
      senderNumber: senderNumber,
      body: msg.body,
      status: isBos ? 'DIPROSES (BOS)' : 'DIABAIKAN'
    });
    if (incomingWaMessages.length > 20) {
      incomingWaMessages.pop();
    }

    addLog('INCOMING', `Pesan masuk dari ${rawSender}: "${msg.body}"`);
    
    // Check if sender is indeed the Boss
    if (!isBos) {
      addLog('SYSTEM', `Pesan dari ${senderNumber} diabaikan karena tidak cocok dengan Nomor Bos (+${formattedBos}).`);
      return; // Ignore messages from others to protect privacy
    }

    try {
      const result = await handleMessageLogic(msg.body, 'WA');
      msg.reply(result.reply);
      addLog('OUTGOING', `Balasan WA terkirim.`);
    } catch (err) {
      addLog('SYSTEM', 'Gagal memproses pesan WA: ' + err.message);
    }
  });

  client.initialize().catch(err => {
    addLog('SYSTEM', 'Gagal inisialisasi WhatsApp client: ' + err.message);
  });
}

// // --- CORE WHATSAPP BOT MESSAGE LOGIC ---
async function handleMessageLogic(text, logPrefix = 'WA') {
  const config = loadConfig();
  const textLower = text.trim().toLowerCase();
  
  // 1. #akubosmu Knowledge Base Save
  if (textLower.startsWith('#akubosmu')) {
    const fact = text.substring(10).trim();
    if (fact) {
      const memories = loadMemories();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      memories.push({ id: Date.now(), fact, date: now });
      saveMemories(memories);
      
      addLog('AI', 'Menerjemahkan instruksi... Menyimpan memori baru.');
      return {
        reply: `Siap Bos! Saya sudah mencatat dan mengingat: "${fact}"`,
        action: 'MEMORIES'
      };
    } else {
      return {
        reply: 'Format salah Bos. Gunakan: #akubosmu [informasi]',
        action: 'ERROR'
      };
    }
  }

  // 2. Financial parsing via Gemini AI & Google Sheets
  const moneyMatch = textLower.match(/(\d+)\s*(ribu|juta|ratus|rupiah|rb)?/);
  const isExpense = textLower.includes('beli') || textLower.includes('belanja') || textLower.includes('habis') || textLower.includes('bayar');
  const isIncome = textLower.includes('masuk') || textLower.includes('gaji') || textLower.includes('terima') || textLower.includes('untung');

  if (moneyMatch && (isExpense || isIncome)) {
    addLog('AI', 'Mendeteksi transaksi keuangan... Menghubungi Gemini NLP...');
    
    let amount = parseInt(moneyMatch[1]);
    if (textLower.includes('ribu') || textLower.includes('rb')) amount *= 1000;
    else if (textLower.includes('juta')) amount *= 1000000;
    
    const typeLabel = isExpense ? 'PENGELUARAN' : 'PEMASUKAN';
    
    // Save to Google Sheets if Spreadsheet ID is configured
    if (config.sheetsId) {
      try {
        await saveToGoogleSheets(config.sheetsId, typeLabel, amount, text);
        addLog('SHEETS', `Sukses mencatat Rp ${amount.toLocaleString('id-ID')} ke Google Sheets.`);
        return {
          reply: `Sudah saya catat ke Google Sheets Bos!\n\n📋 Tipe: ${typeLabel}\n💰 Jumlah: Rp ${amount.toLocaleString('id-ID')}\n✏️ Keterangan: "${text}"`,
          action: 'SHEETS'
        };
      } catch (err) {
        addLog('SHEETS', 'Gagal menulis ke Sheets: ' + err.message);
        return {
          reply: `Mencatat lokal sukses Bos! Tapi Google Sheets API error: ${err.message}. Hubungi admin.`,
          action: 'SHEETS_ERROR'
        };
      }
    } else {
      addLog('SYSTEM', 'Sheets ID belum dikonfigurasi. Transaksi dilewati.');
      return {
        reply: `Berhasil diproses Bos! Transaksi senilai Rp ${amount.toLocaleString('id-ID')} untuk "${text}". (Catatan: Google Sheets belum dihubungkan di Dashboard)`,
        action: 'SYSTEM'
      };
    }
  }

  // 3. Check memory query
  const memories = loadMemories();
  let matchedFact = null;
  for (const m of memories) {
    const keywords = m.fact.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
    const hasMatch = keywords.some(kw => kw.length > 3 && textLower.includes(kw));
    if (hasMatch) {
      matchedFact = m;
      break;
    }
  }

  if (matchedFact) {
    addLog('AI', 'Mencocokkan basis memori #akubosmu... Ditemukan.');
    return {
      reply: `Menurut memori yang Bos ajarkan:\n\n💡 "${matchedFact.fact}"`,
      action: 'MEMORIES'
    };
  }

  // 4. Default Intelligent Response using Gemini AI
  if (config.apiKey) {
    try {
      addLog('AI', 'Menghubungi Gemini AI Model...');
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Anda adalah asisten pribadi yang ramah, profesional, dan cerdas dari Bos Bagas. Jawab pesan berikut dengan gaya sopan tetapi santai dan informatif: "${text}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const replyText = response.text();
      
      return {
        reply: replyText,
        action: 'AI'
      };
    } catch (err) {
      addLog('AI', 'Gemini AI Error: ' + err.message);
      return {
        reply: `Halo Bos Bagas! Bot Asisten aktif, namun modul AI sedang error: ${err.message}. Ada yang bisa saya bantu secara manual?`,
        action: 'AI_ERROR'
      };
    }
  } else {
    return {
      reply: 'Halo Bos Bagas! Saya siap mencatat keuangan (cth: "beli bensin 50 ribu") atau mengingat info dengan perintah #akubosmu [info]. (AI API Key belum diatur)',
      action: 'FALLBACK'
    };
  }
}

// --- GOOGLE SHEETS CONNECTOR ---
async function saveToGoogleSheets(spreadsheetId, type, amount, description) {
  if (!fs.existsSync(path.join(__dirname, 'credentials.json'))) {
    throw new Error("credentials.json (Google Service Account Key) tidak ditemukan.");
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'), // Requires credentials file in root
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const timeStr = new Date().toTimeString().split(' ')[0];
  
  // Appends row: Tanggal, Waktu, Tipe, Jumlah, Keterangan
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:E',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[dateStr, timeStr, type, amount, description]]
    }
  });
}

// --- API ROUTING FOR DASHBOARD ---

// Get Status
app.get('/api/status', (req, res) => {
  const config = loadConfig();
  res.json({
    isConnected: waReady,
    qr: qrCodeBase64,
    bosNumber: config.bosNumber,
    aiEngine: config.aiEngine,
    sheetsId: config.sheetsId,
    dailyBriefingTime: config.dailyBriefingTime
  });
});

// Save Config
app.post('/api/config', (req, res) => {
  const current = loadConfig();
  const newConfig = { ...current, ...req.body };
  saveConfig(newConfig);
  addLog('SYSTEM', 'Konfigurasi diperbarui via Web Dashboard.');
  res.json({ success: true, config: newConfig });
});

// Get Memories
app.get('/api/memories', (req, res) => {
  res.json(loadMemories());
});

// Add Memory
app.post('/api/memories', (req, res) => {
  const memories = loadMemories();
  const fact = req.body.fact;
  if (fact) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMemory = { id: Date.now(), fact, date: now };
    memories.push(newMemory);
    saveMemories(memories);
    addLog('SYSTEM', `Memori ditambahkan via Dashboard: "${fact}"`);
    res.json({ success: true, memory: newMemory });
  } else {
    res.status(400).json({ error: 'Keterangan memori kosong.' });
  }
});

// Delete Memory
app.delete('/api/memories/:id', (req, res) => {
  let memories = loadMemories();
  const id = parseInt(req.params.id);
  memories = memories.filter(m => m.id !== id);
  saveMemories(memories);
  addLog('SYSTEM', `Memori [ID: ${id}] dihapus via Dashboard.`);
  res.json({ success: true });
});

// Get Logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Get WA Messages
app.get('/api/wa/messages', (req, res) => {
  res.json(incomingWaMessages);
});

// Simulate Log Trigger
app.post('/api/simulate', (req, res) => {
  const { type, text } = req.body;
  addLog(type || 'SYSTEM', text || 'Simulasi aktivitas log.');
  res.json({ success: true });
});

// --- NOTES REST API ---
app.get('/api/notes', (req, res) => {
  res.json(loadNotes());
});

app.post('/api/notes', (req, res) => {
  try {
    saveNotes(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes/ai', async (req, res) => {
  const { action, text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Teks kosong.' });
  }
  
  const config = loadConfig();
  if (!config.apiKey) {
    return res.status(400).json({ error: 'Gemini AI API Key belum diatur di Dashboard.' });
  }
  
  try {
    addLog('AI', `Memproses AI untuk Catatan: ${action}...`);
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let prompt = '';
    if (action === 'summarize') {
      prompt = `Buatkan ringkasan poin-poin terstruktur dari teks catatan berikut dalam bahasa Indonesia (gunakan format markdown bullet points):\n\n${text}`;
    } else if (action === 'expand') {
      prompt = `Kembangkan draf/ide singkat catatan berikut menjadi tulisan paragraf utuh yang rapi, profesional, dan informatif dalam bahasa Indonesia (gunakan format markdown):\n\n${text}`;
    } else {
      return res.status(400).json({ error: 'Aksi AI tidak dikenal.' });
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replyText = response.text();
    
    addLog('AI', `Sukses memproses AI untuk Catatan (${action}).`);
    res.json({ success: true, result: replyText });
  } catch (err) {
    addLog('AI', `Gagal memproses AI Catatan: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Reset WhatsApp Session (Logout & Reinitialize)
app.post('/api/session/reset', async (req, res) => {
  try {
    addLog('SYSTEM', 'Menerima permintaan reset sesi WhatsApp...');
    waReady = false;
    qrCodeBase64 = '';
    qrAttempts = 0; // Reset counter
    
    // Attempt to destroy old client to release resource/browser
    try {
      if (client) {
        await client.destroy();
      }
    } catch (e) {
      // Ignore if already destroyed
    }
    
    // Re-initialize client from scratch
    initializeWhatsapp();
    
    res.json({ success: true, message: 'WhatsApp client reset' });
  } catch (err) {
    addLog('SYSTEM', 'Error saat reset WhatsApp client: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// Simulate incoming WhatsApp message from Dashboard Terminal
app.post('/api/chat/simulate', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Pesan kosong.' });
  }
  
  addLog('INCOMING', `Simulasi Chat Bos: "${text}"`);
  try {
    const result = await handleMessageLogic(text, 'SIMULATOR');
    addLog('OUTGOING', `Balasan Simulasi: "${result.reply.split('\n')[0]}..."`);
    res.json({ success: true, reply: result.reply });
  } catch (err) {
    addLog('SYSTEM', 'Error memproses simulasi pesan: ' + err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start WhatsApp Client
addLog('SYSTEM', 'Menyalakan WhatsApp Gateway...');
initializeWhatsapp();

// Listen Server
app.listen(PORT, () => {
  addLog('SYSTEM', `Web Dashboard & API aktif di http://localhost:${PORT}`);
});
