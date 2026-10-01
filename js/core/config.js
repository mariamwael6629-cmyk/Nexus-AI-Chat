// ── API config ──
const API_BASE = (location.port === '8000') ? '' : 'http://localhost:8000';
const TOKEN_KEY = 'nexus_token';
const PROTECTED_PAGES = ['chat','memory','dashboard','settings'];

let authToken = localStorage.getItem(TOKEN_KEY);
let currentUser = null;
let currentSettings = null;
let chatsCache = [];
let currentChatId = null;
let allMemories = [];
let activeMemCategory = 'all';
let editingMemoryId = null;
let activeSettingsTab = 'profile';
let selectedPersonality = 'technical';
let authMode = 'login';
let pendingTarget = 'chat';
let isTyping = false;

const PERSONALITY_OPTS = [
  {id:'technical', icon:'🎓', name:'Technical', desc:'Deep, precise, code-first'},
  {id:'collaborative', icon:'🤝', name:'Collaborative', desc:'Warm, exploratory'},
  {id:'direct', icon:'⚡', name:'Direct', desc:'Concise, no fluff'},
  {id:'creative', icon:'🎨', name:'Creative', desc:'Lateral, playful'},
];
