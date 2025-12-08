// --- MULTI-LANGUAGE SUPPORT ---
const TRANSLATIONS = {
    en: {
        new_gen: "New Generation",
        recent_history: "Recent History",
        hero_title_1: "Instant Niche",
        hero_title_2: "Bios",
        hero_desc: "Craft the perfect professional or social identity in seconds using advanced AI.",
        lbl_niche: "I am a...",
        ph_niche: "e.g. Freelance Web Developer, Travel Vlogger...",
        lbl_tone: "Tone",
        lbl_plat: "Platform",
        lbl_len: "Length",
        lbl_goals: "Keywords / Goals",
        lbl_avatar: "Generate AI Avatar",
        ph_goals: "e.g. Hiring now, link in bio, minimalistic...",
        btn_gen: "Generate Bios & Avatar",
        btn_gen_only: "Generate Bios",
        res_title: "Generated Persona",
        unlock_pro: "Unlock Pro",
        guest_user: "Guest User",
        signin_save: "Sign in to save",
        free_plan: "Free Plan",
        tone_prof: "Professional",
        tone_witty: "Witty & Fun",
        tone_friendly: "Friendly",
        tone_min: "Minimalist",
        plat_general: "General",
        len_short: "Short (Free)",
        len_medium: "Medium (Pro)",
        len_long: "Long (Pro)",
        len_custom: "Custom (Pro)",
        res_opt: "Option",
        res_copy: "Copy",
        res_save: "Save"
    },
    es: {
        new_gen: "Nueva Generación",
        recent_history: "Historial Reciente",
        hero_title_1: "Bios de Nicho",
        hero_title_2: "Instantáneas",
        hero_desc: "Crea la identidad profesional o social perfecta en segundos usando IA avanzada.",
        lbl_niche: "Soy un...",
        ph_niche: "ej. Desarrollador Web, Vloguero...",
        lbl_tone: "Tono",
        lbl_plat: "Plataforma",
        lbl_len: "Longitud",
        lbl_goals: "Palabras Clave",
        lbl_avatar: "Generar Avatar IA",
        ph_goals: "ej. Contratando, enlace en bio...",
        btn_gen: "Generar Bios y Avatar",
        btn_gen_only: "Generar Bios",
        res_title: "Persona Generada",
        unlock_pro: "Desbloquear Pro",
        guest_user: "Usuario Invitado",
        signin_save: "Inicia sesión",
        free_plan: "Plan Gratuito",
        tone_prof: "Profesional",
        tone_witty: "Ingenioso",
        tone_friendly: "Amigable",
        tone_min: "Minimalista",
        plat_general: "General",
        len_short: "Corto (Gratis)",
        len_medium: "Medio (Pro)",
        len_long: "Largo (Pro)",
        len_custom: "Personalizado",
        res_opt: "Opción",
        res_copy: "Copiar",
        res_save: "Guardar"
    },
    fr: {
        new_gen: "Nouvelle Génération",
        recent_history: "Historique Récent",
        hero_title_1: "Bios de Niche",
        hero_title_2: "Instantanées",
        hero_desc: "Créez l'identité professionnelle ou sociale parfaite en quelques secondes grâce à l'IA.",
        lbl_niche: "Je suis un...",
        ph_niche: "ex. Développeur Web, Voyageur...",
        lbl_tone: "Ton",
        lbl_plat: "Plateforme",
        lbl_len: "Longueur",
        lbl_goals: "Mots-clés / Objectifs",
        lbl_avatar: "Générer Avatar IA",
        ph_goals: "ex. Embauche, lien en bio...",
        btn_gen: "Générer Bios & Avatar",
        btn_gen_only: "Générer Bios",
        res_title: "Persona Générée",
        unlock_pro: "Débloquer Pro",
        guest_user: "Invité",
        signin_save: "Se connecter",
        free_plan: "Plan Gratuit",
        tone_prof: "Professionnel",
        tone_witty: "Spirituel",
        tone_friendly: "Amical",
        tone_min: "Minimaliste",
        plat_general: "Général",
        len_short: "Court (Gratuit)",
        len_medium: "Moyen (Pro)",
        len_long: "Long (Pro)",
        len_custom: "Personnalisé",
        res_opt: "Option",
        res_copy: "Copier",
        res_save: "Enregistrer"
    },
    pt: {
        new_gen: "Nova Geração",
        recent_history: "Histórico Recente",
        hero_title_1: "Bios de Nicho",
        hero_title_2: "Instantâneas",
        hero_desc: "Crie a identidade profissional o social perfeita em segundos usando IA avançada.",
        lbl_niche: "Eu sou um...",
        ph_niche: "ex. Desenvolvedor Web, Vlogger...",
        lbl_tone: "Tom",
        lbl_plat: "Plataforma",
        lbl_len: "Comprimento",
        lbl_goals: "Palavras-chave",
        lbl_avatar: "Gerar Avatar IA",
        ph_goals: "ex. Contratando, link na bio...",
        btn_gen: "Gerar Bios e Avatar",
        btn_gen_only: "Gerar Bios",
        res_title: "Persona Gerada",
        unlock_pro: "Desbloquear Pro",
        guest_user: "Usuário Convidado",
        signin_save: "Entrar para salvar",
        free_plan: "Plano Gratuito",
        tone_prof: "Profissional",
        tone_witty: "Engraçado",
        tone_friendly: "Amigável",
        tone_min: "Minimalista",
        plat_general: "Geral",
        len_short: "Curto (Grátis)",
        len_medium: "Médio (Pro)",
        len_long: "Longo (Pro)",
        len_custom: "Personalizado",
        res_opt: "Opção",
        res_copy: "Copiar",
        res_save: "Salvar"
    },
    de: {
        new_gen: "Neue Generierung",
        recent_history: "Verlauf",
        hero_title_1: "Sofortige Nischen",
        hero_title_2: "Bios",
        hero_desc: "Erstellen Sie mit fortschrittlicher KI in Sekunden die perfekte Identität.",
        lbl_niche: "Ich bin ein...",
        ph_niche: "z.B. Webentwickler, Reise-Vlogger...",
        lbl_tone: "Ton",
        lbl_plat: "Plattform",
        lbl_len: "Länge",
        lbl_goals: "Schlüsselwörter",
        lbl_avatar: "KI-Avatar generieren",
        ph_goals: "z.B. Einstellung, Link in Bio...",
        btn_gen: "Bios & Avatar generieren",
        btn_gen_only: "Bios generieren",
        res_title: "Generierte Persona",
        unlock_pro: "Pro Freischalten",
        guest_user: "Gastbenutzer",
        signin_save: "Anmelden",
        free_plan: "Kostenloser Plan",
        tone_prof: "Professionell",
        tone_witty: "Witzig",
        tone_friendly: "Freundlich",
        tone_min: "Minimalistisch",
        plat_general: "Allgemein",
        len_short: "Kurz (Kostenlos)",
        len_medium: "Mittel (Pro)",
        len_long: "Lang (Pro)",
        len_custom: "Benutzerdefiniert",
        res_opt: "Option",
        res_copy: "Kopieren",
        res_save: "Speichern"
    }
};

let currentLang = 'en';

function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS['en'][key] || key;
}

function initLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];
    if (TRANSLATIONS[shortLang]) {
        currentLang = shortLang;
    }
    updateContent();
}

function updateContent() {
    // Update Elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Update Placeholders
    document.getElementById('niche').placeholder = t('ph_niche');
    document.getElementById('goals').placeholder = t('ph_goals');
}

// FIREBASE CONFIG
const FIREBASE_CLIENT_CONFIG = {
    apiKey: "AIzaSyAAqqENNvQzrUdMFcjEJsG2iygrQWNWS0A",
    authDomain: "pro-tools-web-app.firebaseapp.com",
    projectId: "pro-tools-web-app",
    storageBucket: "pro-tools-web-app.firebasestorage.app",
    messagingSenderId: "146517824837",
    appId: "1:146517824837:web:12d1c042f8493b1bab1a2c",
    measurementId: "G-6LYSEGKE8V"
};

const canvasFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const isCanvasConfigValid = canvasFirebaseConfig && Object.keys(canvasFirebaseConfig).length > 0 && canvasFirebaseConfig.projectId;
const firebaseConfig = isCanvasConfigValid ? canvasFirebaseConfig : FIREBASE_CLIENT_CONFIG;

const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId || 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, setPersistence, browserSessionPersistence,
    GoogleAuthProvider, signInWithPopup, linkWithPopup, signOut, EmailAuthProvider, linkWithCredential,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, limit, doc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// GLOBAL STATE
let app, db, auth, storage, userId = null;
let isAuthReady = false;
let isPro = false;
let isRegisterMode = false;
let allHistoryBios = [];

// UI REFERENCES
const generateButton = document.getElementById('generate-button');
const clearInputsBtn = document.getElementById('clear-inputs-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const outputArea = document.getElementById('output-area');
const bioResults = document.getElementById('bio-results');
const nicheInput = document.getElementById('niche');
const toneSelect = document.getElementById('tone');
const platformSelect = document.getElementById('platform');
const lengthSelect = document.getElementById('length');
const goalsInput = document.getElementById('goals');
const avatarToggle = document.getElementById('avatar-toggle');
const customLengthGroup = document.getElementById('custom-length-group');
const customLengthInput = document.getElementById('custom-length');
const customLengthFeedback = document.getElementById('custom-length-feedback');
const copyMessage = document.getElementById('copy-message');
const historyList = document.getElementById('history-list');
const historySearchInput = document.getElementById('history-search');

// Sidebar
const sidebar = document.getElementById('app-sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarAuthContainer = document.getElementById('sidebar-auth-container');
const newBioBtn = document.getElementById('new-bio-btn');
const heroSection = document.getElementById('hero-section');

// Header Buttons
const headerAuthButtons = document.getElementById('header-auth-buttons');
const headerLoginBtn = document.getElementById('header-login-btn');
const headerSignupBtn = document.getElementById('header-signup-btn');

// Auth UI
const authModal = document.getElementById('auth-modal');
const authModalPanel = document.getElementById('auth-modal-panel');
const closeAuthModalBtn = document.getElementById('close-auth-modal');
const googleAuthBtn = document.getElementById('google-auth-btn');
const emailAuthForm = document.getElementById('email-auth-form');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');

// Pro UI
const topProStatus = document.getElementById('top-pro-status');
const topUnlockBtn = document.getElementById('top-unlock-btn');
const paymentModal = document.getElementById('payment-modal');
const paymentModalPanel = document.getElementById('payment-modal-panel');
const closePaymentModalBtn = document.getElementById('close-payment-modal');
const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

// Delete UI
const deleteModal = document.getElementById('delete-confirmation-modal');
const deleteModalPanel = document.getElementById('delete-modal-panel');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// Tooltip
const tooltip = document.getElementById('pro-tooltip');
const tooltipText = document.getElementById('pro-tooltip-text');

// Welcome UI
const welcomeOverlay = document.getElementById('welcome-overlay');
const welcomeName = document.getElementById('welcome-name');
const welcomeContent = document.getElementById('welcome-content');

// Theme UI
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIconSun = document.getElementById('theme-icon-sun');
const themeIconMoon = document.getElementById('theme-icon-moon');
const htmlElement = document.documentElement;

// CONSTANTS
const API_PROXY_URL = '/api/generate-bio';
const CREATE_CHECKOUT_URL = '/api/create-checkout';

// --- THEME LOGIC ---
function updateTheme(isDark) {
    if (isDark) {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeIconSun.classList.remove('hidden');
        themeIconMoon.classList.add('hidden');
    } else {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeIconSun.classList.add('hidden');
        themeIconMoon.classList.remove('hidden');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && sysDark);
    updateTheme(isDark);
}

themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlElement.classList.contains('dark');
    updateTheme(!isDark);
});

initTheme();
initLanguage(); // Init Language

// --- ADVERTISING LOGIC ---
function initAds() {
    const ads = window.AD_CONFIG;
    if (!ads) return;

    // Helper to safely inject scripts
    const injectAd = (containerId, code) => {
        const container = document.getElementById(containerId);
        if (!container || !code) return;

        // Reset
        container.innerHTML = '';
        container.classList.remove('hidden');

        // Create a temporary container to parse HTML string
        const temp = document.createElement('div');
        temp.innerHTML = code;

        // Iterate over child nodes and append them safely
        Array.from(temp.childNodes).forEach(node => {
            if (node.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                // Copy attributes
                Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
                
                // CRITICAL: Set nonce if available (from serve-ui injection) to allow execution under CSP
                if (window.APP_NONCE) {
                    script.setAttribute('nonce', window.APP_NONCE);
                }

                // Copy content
                script.appendChild(document.createTextNode(node.innerHTML));
                container.appendChild(script);
            } else {
                container.appendChild(node.cloneNode(true));
            }
        });
    };

    if (ads.sidebar && ads.sidebar.enabled) injectAd('ad-space-sidebar', ads.sidebar.code);
    if (ads.header && ads.header.enabled) injectAd('ad-space-header', ads.header.code);
    if (ads.footer && ads.footer.enabled) injectAd('ad-space-footer', ads.footer.code);
}

// Call initAds immediately
initAds();

// --- DYNAMIC BUTTON TEXT ---
function updateGenerateButtonText() {
    const btnSpan = generateButton.querySelector('span[data-i18n]');
    if (!btnSpan) return;
    
    const isMobile = window.innerWidth < 768;

    // Check translation keys based on state
    // On mobile, keep button text consistent (without & Avatar) regardless of toggle
    const key = (isMobile || !avatarToggle.checked) ? 'btn_gen_only' : 'btn_gen';
    
    btnSpan.setAttribute('data-i18n', key);
    btnSpan.textContent = t(key);
}
avatarToggle.addEventListener('change', updateGenerateButtonText);
window.addEventListener('resize', updateGenerateButtonText);
// Initialize button text on load
updateGenerateButtonText();

// --- SIDEBAR TOGGLE ---
let isSidebarOpen = window.innerWidth >= 768;

function toggleSidebar() {
    const isMobile = window.innerWidth < 768;
    const main = document.querySelector('main');

    if (isMobile) {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
        } else {
            sidebar.classList.add('-translate-x-full');
        }
    } else {
        // Desktop Toggle
        if (isSidebarOpen) {
            sidebar.classList.remove('md:translate-x-0');
            main.classList.remove('md:ml-72');
            isSidebarOpen = false;
        } else {
            sidebar.classList.add('md:translate-x-0');
            main.classList.add('md:ml-72');
            isSidebarOpen = true;
        }
    }
}
toggleSidebarBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth < 768 && 
        !sidebar.classList.contains('-translate-x-full') && 
        !sidebar.contains(e.target) && 
        !toggleSidebarBtn.contains(e.target)) {
        toggleSidebar();
    }
});

newBioBtn.addEventListener('click', () => {
    nicheInput.value = '';
    goalsInput.value = '';
    outputArea.classList.add('hidden');
    heroSection.classList.remove('hidden');
    if(window.innerWidth < 768) toggleSidebar();
    nicheInput.focus();
});

// --- CLEAR INPUTS BTN ---
clearInputsBtn.addEventListener('click', () => {
    nicheInput.value = '';
    goalsInput.value = '';
    nicheInput.focus();
});

// --- XSS HELPERS ---
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m];
    });
}

// --- FEATURE 2: SMART KEYWORD HIGHLIGHTING ---
function highlightKeywords(text, keywords) {
    if (!keywords || !text) return text;
    
    // Filter empty or very short terms to avoid noise
    const terms = keywords.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 2);
    
    if (terms.length === 0) return text;
    
    // Escape regex special characters in terms
    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Create regex pattern (case-insensitive, global)
    // We use a capture group to retain the original casing
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    
    // Replace matches with styled span
    return text.replace(pattern, '<span class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-bold px-1 rounded mx-0.5 border border-yellow-200 dark:border-yellow-800/50">$1</span>');
}

function showMessage(text, isError = false) {
    const box = document.getElementById('message-box');
    box.textContent = text;
    box.className = `fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl text-white font-medium transition-all duration-300 z-[70] flex items-center gap-3 ${isError ? 'bg-red-500' : 'bg-gray-900 dark:bg-gray-700'}`;
    box.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    
    setTimeout(() => {
        box.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3000);
}

function triggerWelcomeAnimation(name) {
    welcomeName.textContent = name || 'Creator';
    welcomeOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
        welcomeOverlay.classList.remove('opacity-0');
        welcomeContent.classList.remove('scale-100');
        welcomeContent.classList.add('scale-100');
    });
    
    setTimeout(() => {
            welcomeOverlay.classList.add('opacity-0');
            welcomeContent.classList.remove('scale-100');
            welcomeContent.classList.add('scale-95');
            setTimeout(() => welcomeOverlay.classList.add('hidden'), 500);
    }, 2000);
}

// --- TOOLTIP ---
function showTooltip(e, text) {
    if (!text) return;
    tooltipText.textContent = text;
    tooltip.classList.remove('hidden');
    void tooltip.offsetWidth; 
    tooltip.classList.remove('opacity-0');
    
    const targetRect = e.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const top = targetRect.top - tooltipRect.height - 8;
    const left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}
function hideTooltip() {
    tooltip.classList.add('opacity-0');
    setTimeout(() => { if(tooltip.classList.contains('opacity-0')) tooltip.classList.add('hidden'); }, 200);
}

// --- CUSTOM DROPDOWNS ---
const PLATFORM_ICONS = {
    'General': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
    'LinkedIn': '<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>',
    'X/Twitter': '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
    'Instagram': '<path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>'
};
const LOCK_ICON = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>';

const platformTrigger = document.getElementById('platform-trigger');
const platformMenu = document.getElementById('platform-menu');
const lengthTrigger = document.getElementById('length-trigger');
const lengthMenu = document.getElementById('length-menu');
const toneTrigger = document.getElementById('tone-trigger');
const toneMenu = document.getElementById('tone-menu');

const TONE_ICONS = {
    'Professional & Authoritative': '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
    'Witty & Humorous': '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
    'Friendly & Approachable': '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
    'Minimalist & Concise': '<path d="M4 6h16v2H4zm0 5h10v2H4zm0 5h16v2H4z"/>'
};

// Init function called once on load
function initCustomDropdowns() {
    setupDropdownListener(platformTrigger, platformMenu, platformSelect, renderPlatformOptions);
    setupDropdownListener(lengthTrigger, lengthMenu, lengthSelect, renderLengthOptions);
    setupDropdownListener(toneTrigger, toneMenu, toneSelect, renderToneOptions);
    
    // Setup global closer once
    document.addEventListener('click', (e) => {
        if(!platformTrigger.contains(e.target) && !platformMenu.contains(e.target)) platformMenu.classList.add('hidden');
        if(!lengthTrigger.contains(e.target) && !lengthMenu.contains(e.target)) lengthMenu.classList.add('hidden');
        if(!toneTrigger.contains(e.target) && !toneMenu.contains(e.target)) toneMenu.classList.add('hidden');
    });

    // Initial Render
    refreshDropdownsUI();
}

// Helper to refresh UI without adding listeners (called by Pro update)
function refreshDropdownsUI() {
    renderPlatformOptions(platformMenu, platformSelect, platformTrigger);
    renderLengthOptions(lengthMenu, lengthSelect, lengthTrigger);
    renderToneOptions(toneMenu, toneSelect, toneTrigger);
}

function setupDropdownListener(trigger, menu, select, renderFn) {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllDropdowns();
        if(isHidden) {
            renderFn(menu, select, trigger);
            menu.classList.remove('hidden');
        }
    });
}

function closeAllDropdowns() {
    platformMenu.classList.add('hidden');
    lengthMenu.classList.add('hidden');
    toneMenu.classList.add('hidden');
}

function renderSignInCTA(menu) {
        const cta = document.createElement('div');
        cta.className = 'm-2 p-4 bg-gray-50 dark:bg-[#151616] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
        cta.innerHTML = `
        <div class="text-sm font-bold text-gray-900 dark:text-white mb-1">Sign in to explore</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">Unlock advanced platforms, tones, and custom lengths.</div>
        <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1f20]">Sign In</button>
        `;
        cta.querySelector('button').onclick = (e) => {
            e.stopPropagation();
            openAuthModal(false);
            closeAllDropdowns();
        };
        menu.appendChild(cta);
}

function renderPlatformOptions(menu, select, trigger) {
    menu.innerHTML = '';
    
    // Add Header
    const header = document.createElement('div');
    header.className = 'px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-[#252627]/50 border-b border-gray-100 dark:border-gray-800 mb-1';
    header.textContent = "Choose Platform";
    menu.appendChild(header);

    const isAnon = auth && auth.currentUser && auth.currentUser.isAnonymous;
    let proOptionShown = false;

    Array.from(select.options).forEach(opt => {
        const val = opt.value;
        const isProOpt = opt.dataset.pro === 'true';
        
        // If anonymous, limit displayed Pro options
        if (isAnon && isProOpt) {
            if (proOptionShown) return; // Skip subsequent pro options
            proOptionShown = true;
        }

        const isDisabled = opt.disabled;
        const isSelected = opt.selected;
        const iconPath = PLATFORM_ICONS[val] || PLATFORM_ICONS['General'];
        
        const labelKey = val === 'General' ? 'plat_general' : null;
        const label = labelKey ? t(labelKey) : val;

        const div = document.createElement('div');
        div.className = `flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-[#2c2d2e] text-gray-700 dark:text-gray-200'} ${isDisabled ? 'opacity-50 grayscale' : ''}`;
        
        let suffix = '';
        if(isProOpt) {
            suffix = isDisabled ? `<div class="ml-auto flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">${LOCK_ICON} PRO</div>` 
                                : `<div class="ml-auto flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800">FREE</div>`;
        }

        div.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 text-gray-600 dark:text-gray-300">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">${iconPath}</svg>
            </div>
            <span class="font-medium">${label}</span>
            ${suffix}
        `;

        div.onclick = (e) => {
            if(isDisabled) { 
                if (isAnon) openAuthModal(false);
                else openPaymentModal(); 
                return; 
            }
            select.value = val;
            updateTrigger(trigger, label, iconPath);
            renderPlatformOptions(menu, select, trigger);
            closeAllDropdowns();
        };
        menu.appendChild(div);
    });

    if (isAnon) renderSignInCTA(menu);
    
    // Init trigger text
    const currentOpt = select.options[select.selectedIndex];
    const triggerLabel = currentOpt.value === 'General' ? t('plat_general') : currentOpt.value;
    updateTrigger(trigger, triggerLabel, PLATFORM_ICONS[currentOpt.value] || PLATFORM_ICONS['General']);
}

function renderLengthOptions(menu, select, trigger) {
    menu.innerHTML = '';
    
    // Add Header
    const header = document.createElement('div');
    header.className = 'px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-[#252627]/50 border-b border-gray-100 dark:border-gray-800 mb-1';
    header.textContent = "Choose Length";
    menu.appendChild(header);

    const isAnon = auth && auth.currentUser && auth.currentUser.isAnonymous;
    let proOptionShown = false;

    Array.from(select.options).forEach(opt => {
        const val = opt.value;
        const isProOpt = opt.dataset.pro === 'true';
        
        if (isAnon && isProOpt) {
            if (proOptionShown) return;
            proOptionShown = true;
        }

        const isDisabled = opt.disabled;
        const isSelected = opt.selected;
        
        const labelMap = {
            'short': 'len_short', 'medium': 'len_medium', 'fixed-long': 'len_long', 'custom': 'len_custom'
        };
        const label = t(labelMap[val] || val);

        const div = document.createElement('div');
        div.className = `flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-[#2c2d2e] text-gray-700 dark:text-gray-200'} ${isDisabled ? 'opacity-50' : ''}`;
        
        let suffix = isProOpt 
            ? (isDisabled ? `<div class="ml-auto flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">${LOCK_ICON} PRO</div>` : `<div class="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800">FREE</div>`)
            : '';

        div.innerHTML = `<span class="font-medium">${label}</span>${suffix}`;
        
        div.onclick = (e) => {
            if(isDisabled) { 
                if (isAnon) openAuthModal(false);
                else openPaymentModal(); 
                return; 
            }
            select.value = val;
            select.dispatchEvent(new Event('change')); // Trigger change for listeners
            updateTrigger(trigger, label, null);
            renderLengthOptions(menu, select, trigger);
            closeAllDropdowns();
        };
        menu.appendChild(div);
    });

    if (isAnon) renderSignInCTA(menu);

    const currentOpt = select.options[select.selectedIndex];
    const labelMap = {
            'short': 'len_short', 'medium': 'len_medium', 'fixed-long': 'len_long', 'custom': 'len_custom'
    };
    updateTrigger(trigger, t(labelMap[currentOpt.value]), null);
}

function renderToneOptions(menu, select, trigger) {
        menu.innerHTML = '';
        // Header
        const header = document.createElement('div');
        header.className = 'px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-[#252627]/50 border-b border-gray-100 dark:border-gray-800 mb-1';
        header.textContent = "Choose Tone";
        menu.appendChild(header);

        Array.from(select.options).forEach(opt => {
        const val = opt.value;
        const isSelected = opt.selected;
        const iconPath = TONE_ICONS[val];
        // Translation keys
        const labelMap = {
            'Professional & Authoritative': 'tone_prof', 
            'Witty & Humorous': 'tone_witty',
            'Friendly & Approachable': 'tone_friendly',
            'Minimalist & Concise': 'tone_min'
        };
        const label = t(labelMap[val] || val);

        const div = document.createElement('div');
        div.className = `flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-[#2c2d2e] text-gray-700 dark:text-gray-200'}`;
        
        div.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 text-gray-600 dark:text-gray-300">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">${iconPath}</svg>
            </div>
            <span class="font-medium">${label}</span>
        `;

        div.onclick = (e) => {
            select.value = val;
            updateTrigger(trigger, label, iconPath);
            renderToneOptions(menu, select, trigger);
            closeAllDropdowns();
        };
        menu.appendChild(div);
        });
        
        // Init Trigger
        const currentOpt = select.options[select.selectedIndex];
        const labelMap = {
        'Professional & Authoritative': 'tone_prof', 
        'Witty & Humorous': 'tone_witty',
        'Friendly & Approachable': 'tone_friendly',
        'Minimalist & Concise': 'tone_min'
        };
        const triggerLabel = t(labelMap[currentOpt.value] || currentOpt.value);
        updateTrigger(trigger, triggerLabel, TONE_ICONS[currentOpt.value]);
}

function updateTrigger(trigger, text, iconPath) {
    const content = trigger.querySelector('div[id$="content"]');
    if(iconPath) {
        content.innerHTML = `<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">${iconPath}</svg> <span>${text}</span>`;
    } else {
        content.textContent = text;
    }
}

// --- AUTH & MODALS LOGIC ---
function openAuthModal(register = false) {
    isRegisterMode = register;
    updateAuthModalUI();
    
    // Programmatic readonly toggle for CSP compliance
    ['auth-email', 'auth-password'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.setAttribute('readonly', 'true'); 
            el.onfocus = function() { this.removeAttribute('readonly'); }; 
            // Note: el.onfocus is a property, technically allowed by some CSPs if set via JS, 
            // but addEventListener is safer and cleaner.
            el.addEventListener('focus', function() { this.removeAttribute('readonly'); });
        }
    });
    
    // Reset readonly hack for fresh open
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    if(emailInput) emailInput.setAttribute('readonly', 'true');
    if(passwordInput) passwordInput.setAttribute('readonly', 'true');
    
    authModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        authModal.classList.remove('opacity-0');
        authModalPanel.classList.remove('scale-95');
        authModalPanel.classList.add('scale-100');
    });
}
function closeAuthModal() {
    authModal.classList.add('opacity-0');
    authModalPanel.classList.remove('scale-100');
    authModalPanel.classList.add('scale-95');
    setTimeout(() => authModal.classList.add('hidden'), 200);
}
function updateAuthModalUI() {
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('email-submit-btn');
    const modeMsg = document.getElementById('auth-mode-message');
    const googleBtnText = document.getElementById('google-btn-text');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const user = auth.currentUser;
    const isAnon = user && user.isAnonymous;

    if (isRegisterMode) {
        title.textContent = isAnon ? "Save Account" : "Create Account";
        submitBtn.textContent = isAnon ? "Link Email" : "Sign Up";
        modeMsg.textContent = "Already have an account?";
        toggleAuthModeBtn.textContent = "Sign In";
        googleAuthBtn.querySelector('span').textContent = isAnon ? "Link with Google" : "Sign up with Google";
        
        // Set attributes for registration
        if(passwordInput) passwordInput.setAttribute('autocomplete', 'new-password');
    } else {
        title.textContent = "Sign In";
        submitBtn.textContent = "Sign In";
        modeMsg.textContent = "Don't have an account?";
        toggleAuthModeBtn.textContent = "Create one";
        googleAuthBtn.querySelector('span').textContent = "Sign in with Google";
        
        // Set attributes for login
        if(passwordInput) passwordInput.setAttribute('autocomplete', 'current-password');
    }
}
closeAuthModalBtn.onclick = closeAuthModal;
toggleAuthModeBtn.onclick = () => { isRegisterMode = !isRegisterMode; updateAuthModalUI(); };
authModal.onclick = (e) => { if(e.target === authModal) closeAuthModal(); };

// Header Auth Button Logic
headerLoginBtn.onclick = () => openAuthModal(false);
headerSignupBtn.onclick = () => openAuthModal(true);

// PAYMENT MODAL
function openPaymentModal() {
        // Check if user is logged in (not anonymous) before allowing unlock
        if (!auth.currentUser || auth.currentUser.isAnonymous) {
            showMessage("Please sign up to unlock Pro.", true);
            openAuthModal(true); // Open registration/link modal
            return;
        }

        paymentModal.classList.remove('hidden');
        requestAnimationFrame(() => {
        paymentModal.classList.remove('opacity-0');
        paymentModalPanel.classList.remove('scale-95');
        paymentModalPanel.classList.add('scale-100');
    });
}
function closePaymentModal() {
    paymentModal.classList.add('opacity-0');
    paymentModalPanel.classList.remove('scale-100');
    paymentModalPanel.classList.add('scale-95');
    setTimeout(() => paymentModal.classList.add('hidden'), 200);
}
[closePaymentModalBtn, cancelPaymentBtn, topUnlockBtn].forEach(el => el?.addEventListener('click', el === topUnlockBtn ? openPaymentModal : closePaymentModal));
paymentModal.onclick = (e) => { if(e.target === paymentModal) closePaymentModal(); };

// DELETE MODAL
let bioIdToDelete = null;
function openDeleteModal(id) {
    bioIdToDelete = id;
    deleteModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        deleteModal.classList.remove('opacity-0');
        deleteModalPanel.classList.remove('scale-95');
        deleteModalPanel.classList.add('scale-100');
    });
}
function closeDeleteModal() {
    deleteModal.classList.add('opacity-0');
    deleteModalPanel.classList.remove('scale-100');
    deleteModalPanel.classList.add('scale-95');
    setTimeout(() => deleteModal.classList.add('hidden'), 200);
}
cancelDeleteBtn.onclick = closeDeleteModal;
deleteModal.onclick = (e) => { if(e.target === deleteModal) closeDeleteModal(); };
confirmDeleteBtn.onclick = async () => {
    if (!bioIdToDelete || !userId) return;
    const originalText = confirmDeleteBtn.textContent;
    confirmDeleteBtn.textContent = "Deleting...";
    try {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/bios`, bioIdToDelete));
        showMessage("Bio deleted.");
    } catch (e) {
        console.error(e);
        showMessage("Delete failed.", true);
    } finally {
        confirmDeleteBtn.textContent = originalText;
        closeDeleteModal();
    }
};

// --- FIREBASE INIT & AUTH ---
if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    (async () => {
        await setPersistence(auth, browserSessionPersistence);
        if (!auth.currentUser && !initialAuthToken) signInAnonymously(auth);
    })();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            isAuthReady = true;
            updateAuthUI(user);

            if (user.isAnonymous) {
                // Clear data on refresh/load for guest
                nicheInput.value = '';
                goalsInput.value = '';
                outputArea.classList.add('hidden');
                heroSection.classList.remove('hidden');
                
                // Show Guest History Card
                renderGuestHistory();
            } else {
                loadHistory();
            }
            
            listenToProStatus();
        }
    });
}

function updateAuthUI(user) {
    sidebarAuthContainer.innerHTML = '';
    
    if (user.isAnonymous) {
        // ... (Anonymous user logic) ...
        // Show Header Buttons
        headerAuthButtons.classList.remove('hidden');
        headerAuthButtons.classList.add('flex');

        sidebarAuthContainer.innerHTML = `
            <button id="auth-btn-sidebar" class="w-full text-left flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white dark:group-hover:bg-gray-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-200">${t('guest_user')}</div>
                    <div class="text-[10px] text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${t('signin_save')}</div>
                </div>
            </button>
        `;
        document.getElementById('auth-btn-sidebar').onclick = () => openAuthModal(false);

    } else {
        // Hide Header Buttons
        headerAuthButtons.classList.add('hidden');
        headerAuthButtons.classList.remove('flex');

        const name = user.displayName || user.email.split('@')[0];
        const avatar = user.photoURL 
            ? `<img src="${user.photoURL}" class="w-full h-full object-cover">` 
            : `${name.charAt(0).toUpperCase()}`;

        sidebarAuthContainer.innerHTML = `
            <div class="relative group">
                    <button id="user-profile-btn" class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-200 font-bold text-sm flex-shrink-0 overflow-hidden">
                        ${avatar}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">${name}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">${t('free_plan')}</div>
                    </div>
                    <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" id="profile-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div id="user-dropdown-menu" class="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#1e1f20] rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden hidden transform origin-bottom transition-all duration-200 z-50">
                    <div class="p-1.5 space-y-0.5">
                        <button id="menu-user-profile" class="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            User profile
                        </button>
                        <button class="menu-item-upgrade w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Upgrade Plan
                        </button>
                        <button class="menu-item-placeholder w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Personalization
                        </button>
                        <button class="menu-item-placeholder w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            Settings
                        </button>
                        <button class="menu-item-placeholder w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Help
                        </button>
                        <div class="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button id="menu-sign-out" class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Log out
                        </button>
                    </div>
                    </div>
            </div>
        `;
        
        // Sidebar Menu Logic
        const profileBtn = document.getElementById('user-profile-btn');
        const dropdownMenu = document.getElementById('user-dropdown-menu');
        const chevron = document.getElementById('profile-chevron');
        
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            chevron.classList.toggle('rotate-180');
        };
        
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        });

        // Attach Listener for Edit Profile
        document.getElementById('menu-user-profile').onclick = () => {
            dropdownMenu.classList.add('hidden');
            chevron.classList.remove('rotate-180');
            openEditProfileModal();
        };

        // Menu Items
        document.querySelectorAll('.menu-item-placeholder').forEach(btn => {
            btn.onclick = () => showMessage("Feature coming soon");
        });
        document.querySelector('.menu-item-upgrade').onclick = () => {
                dropdownMenu.classList.add('hidden');
                openPaymentModal();
        };
        document.getElementById('menu-sign-out').onclick = () => signOut(auth).then(()=>window.location.reload());
        
        closeAuthModal();
    }
}

// --- EDIT PROFILE LOGIC ---
function updateAvatarPreview(url, name) {
    const div = document.getElementById('edit-avatar-preview');
    div.innerHTML = '';
    if(url) {
        div.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
    } else {
        const initials = (name || 'U').substring(0, 2).toUpperCase();
        div.textContent = initials;
    }
}

async function openEditProfileModal() {
    if (!auth.currentUser) return;
    const user = auth.currentUser;
    
    // Fill Display Name
    document.getElementById('edit-display-name').value = user.displayName || '';
    
    // Fill Username
    let username = '';
    try {
        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()) {
            username = docSnap.data().username || '';
        }
    } catch(e) { console.log("Fetch username error:", e); }
    
    if(!username) username = (user.email || '').split('@')[0];
    document.getElementById('edit-username').value = username;

    // Avatar Preview
    updateAvatarPreview(user.photoURL, user.displayName || user.email);
    
    // Show Modal
    const modal = document.getElementById('edit-profile-modal');
    const panel = document.getElementById('edit-profile-panel');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('scale-95');
        panel.classList.add('scale-100');
    });
}

function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    const panel = document.getElementById('edit-profile-panel');
    modal.classList.add('opacity-0');
    panel.classList.remove('scale-100');
    panel.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
    
    // Reset input
    document.getElementById('avatar-upload').value = ''; 
}

document.getElementById('cancel-edit-profile').onclick = closeEditProfileModal;
document.getElementById('edit-avatar-trigger').onclick = () => document.getElementById('avatar-upload').click();

document.getElementById('avatar-upload').onchange = (e) => {
    if(e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        updateAvatarPreview(src, '');
    }
};

document.getElementById('save-edit-profile').onclick = async () => {
    const btn = document.getElementById('save-edit-profile');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    try {
        const user = auth.currentUser;
        const newName = document.getElementById('edit-display-name').value;
        const newUsername = document.getElementById('edit-username').value;
        
        // Handle Image Upload if file selected
        const fileInput = document.getElementById('avatar-upload');
        let newPhotoURL = user.photoURL;
        
        if(fileInput.files.length > 0) {
            const file = fileInput.files[0];
            // Basic file size check (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error("Image too large. Max 5MB.");
            }
            const storageRef = ref(storage, `users/${user.uid}/avatar_${Date.now()}`);
            await uploadBytes(storageRef, file);
            newPhotoURL = await getDownloadURL(storageRef);
        }
        
        // Update Auth Profile
        if (newName !== user.displayName || newPhotoURL !== user.photoURL) {
            await updateProfile(user, {
                displayName: newName,
                photoURL: newPhotoURL
            });
        }
        
        // Save Username to Firestore
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile/data`), {
            username: newUsername,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Update UI sidebar immediately
        updateAuthUI(auth.currentUser);
        
        closeEditProfileModal();
        showMessage("Profile updated successfully!");
        
    } catch(e) {
        console.error(e);
        showMessage(e.message || "Failed to update profile", true);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

// --- AUTH ACTIONS ---
const googleProvider = new GoogleAuthProvider();
async function handleGoogleAuth() {
    try {
        const user = auth.currentUser;
        let cred;
        if (user && user.isAnonymous) cred = await linkWithPopup(user, googleProvider);
        else cred = await signInWithPopup(auth, googleProvider);
        
        closeAuthModal();
        triggerWelcomeAnimation(cred.user.displayName || cred.user.email);

    } catch (e) {
        if (e.code === 'auth/credential-already-in-use') {
                if(confirm("Account exists. Switch? (Guest data lost)")) {
                const cred = await signInWithPopup(auth, googleProvider);
                triggerWelcomeAnimation(cred.user.displayName || cred.user.email);
                }
        } else showMessage(e.message, true);
    }
}
googleAuthBtn.onclick = handleGoogleAuth;

emailAuthForm.onsubmit = async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const btn = document.getElementById('email-submit-btn');
    
    const email = emailInput.value;
    const password = passwordInput.value;

    btn.textContent = 'Processing...';
    try {
        const user = auth.currentUser;
        let cred;
        if (isRegisterMode) {
            if (user && user.isAnonymous) cred = await linkWithCredential(user, EmailAuthProvider.credential(email, password));
            else cred = await createUserWithEmailAndPassword(auth, email, password);
        } else {
            cred = await signInWithEmailAndPassword(auth, email, password);
        }
        
        // Clear inputs after success
        emailInput.value = '';
        passwordInput.value = '';
        
        closeAuthModal();
        triggerWelcomeAnimation(cred.user.displayName || cred.user.email);
        showMessage("Success!");
    } catch (e) {
        showMessage(e.message, true);
    } finally {
        btn.textContent = 'Sign In';
    }
};

// --- HISTORY LOGIC ---
function loadHistory() {
    if(auth.currentUser && auth.currentUser.isAnonymous) return; // Safety check

    const historyRef = collection(db, `artifacts/${appId}/users/${userId}/bios`);
    const q = query(historyRef, limit(50));
    
    onSnapshot(q, (snapshot) => {
        allHistoryBios = [];
        snapshot.forEach(doc => allHistoryBios.push({id: doc.id, ...doc.data()}));
        allHistoryBios.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        renderHistory(allHistoryBios);
    });
}

function renderGuestHistory() {
    historyList.innerHTML = `
        <div class="mx-2 mt-10 p-5 bg-white dark:bg-[#252627] rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm flex flex-col items-center">
            <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            </div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">Sign in to start saving your bios</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">Once you're signed in, you can access your saved bios here.</p>
            <button id="guest-history-login-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-md">Sign In / Sign Up</button>
        </div>
    `;
    const btn = document.getElementById('guest-history-login-btn');
    if(btn) btn.onclick = () => openAuthModal(false);
}

function renderHistory(bios) {
    historyList.innerHTML = '';
    if (bios.length === 0) {
        historyList.innerHTML = '<div class="px-4 py-6 text-xs text-gray-500 dark:text-gray-500 italic text-center">No saved bios yet.</div>';
        return;
    }

    bios.forEach(item => {
        const div = document.createElement('div');
        div.className = 'group relative p-3 rounded-xl hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#2c2d2e] cursor-pointer transition-colors border border-transparent';
        div.innerHTML = `
            <div class="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2 pr-6">${escapeHtml(item.bio)}</div>
            <div class="flex items-center gap-2 mt-1.5">
                <span class="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-[#1a1b1c] px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-800">${escapeHtml(item.platform || 'General')}</span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500">${escapeHtml(item.niche || '').substring(0, 15)}...</span>
            </div>
            <button class="delete-btn absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        
        div.onclick = (e) => {
            if(e.target.closest('.delete-btn')) {
                e.stopPropagation();
                openDeleteModal(item.id);
            } else {
                // Populate form or show result? For now copy.
                copyToClipboard(item.bio, true);
            }
        };
        historyList.appendChild(div);
    });
}

// Search History
historySearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allHistoryBios.filter(b => 
        (b.bio && b.bio.toLowerCase().includes(term)) ||
        (b.goals && b.goals.toLowerCase().includes(term)) || 
        (b.niche && b.niche.toLowerCase().includes(term))
    );
    renderHistory(filtered);
});

// --- PRO LOGIC / PRO STATUS LISTENER ---
function listenToProStatus() {
    onSnapshot(doc(db, `artifacts/${appId}/users/${userId}/profile/status`), (doc) => {
        const data = doc.data();
        isPro = data && data.isPro === true;
        updateProUI();
    });
}

function updateProUI() {
    if(isPro) {
        topProStatus.classList.remove('hidden');
        topProStatus.classList.add('flex');
        topUnlockBtn.classList.add('hidden');
    } else {
        topProStatus.classList.add('hidden');
        topProStatus.classList.remove('flex');
        
        // Show Unlock button only if user is NOT anonymous
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
                topUnlockBtn.classList.remove('hidden');
        } else {
                topUnlockBtn.classList.add('hidden');
        }
    }

    // Update select options availability
    document.querySelectorAll('option[data-pro="true"]').forEach(opt => {
        opt.disabled = !isPro;
        if(isPro) opt.text = opt.text.replace(' (Pro)', ''); 
    });
    
    // Reset if selected locked option
    if(!isPro) {
        if(lengthSelect.options[lengthSelect.selectedIndex].disabled) lengthSelect.value = 'short';
        if(platformSelect.options[platformSelect.selectedIndex].disabled) platformSelect.value = 'General';
    }
    
    // Update custom slider visibility
    const isCustom = lengthSelect.value === 'custom' && isPro;
    customLengthGroup.classList.toggle('hidden', !isCustom);

    refreshDropdownsUI(); // Refresh dropdowns UI using the helper
}

lengthSelect.addEventListener('change', () => {
        const isCustom = lengthSelect.value === 'custom' && isPro;
        customLengthGroup.classList.toggle('hidden', !isCustom);
});
customLengthInput.addEventListener('input', (e) => customLengthFeedback.textContent = e.target.value);

// --- PAYMENT ---
confirmPaymentBtn.onclick = async () => {
    if (!userId) return;
    const btnHtml = confirmPaymentBtn.innerHTML;
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.innerHTML = 'Connecting...';
    
    try {
        const res = await fetch(CREATE_CHECKOUT_URL, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ userId, originUrl: window.location.href })
        });
        const data = await res.json();
        if(data.url) window.location.href = data.url;
        else throw new Error(data.error);
    } catch (e) {
        showMessage("Payment init failed: " + e.message, true);
        confirmPaymentBtn.disabled = false;
        confirmPaymentBtn.innerHTML = btnHtml;
    }
};

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        showMessage("Payment Successful! Welcome to Pro.", false);
        window.history.replaceState(null, '', window.location.pathname);
    }
    initCustomDropdowns();
};

// --- GENERATE LOGIC ---
generateButton.onclick = async () => {
    if (!isAuthReady) { showMessage("Wait for initialization...", true); return; }
    
    const niche = nicheInput.value.trim();
    const tone = toneSelect.value;
    const platform = platformSelect.value;
    const length = lengthSelect.value;
    const goals = goalsInput.value.trim();
    const generateAvatar = avatarToggle.checked;
    let customLength = null;

    if (!niche) { showMessage("Please enter a niche.", true); return; }

    const isProFeature = (platform !== 'General' || length !== 'short');
    if (isProFeature && !isPro) { openPaymentModal(); return; }
    
    if (length === 'custom') customLength = parseInt(customLengthInput.value);

    generateButton.disabled = true;
    loadingSpinner.classList.remove('hidden');
    outputArea.classList.add('hidden'); // Hide previous results while loading
    heroSection.classList.add('hidden'); // Hide hero

    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(API_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            // Send userLanguage and generateAvatar to backend
            body: JSON.stringify({ niche, tone, platform, length, customLength, goals, userId, appId, userLanguage: currentLang, generateAvatar })
        });
        
        if(!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if(res.status === 403) openPaymentModal();
                throw new Error(errData.error || "Generation failed.");
        }

        const data = await res.json();
        // Use bios array directly instead of raw text
        renderResults(data.bios, niche, tone, length, platform, customLength, goals, data.avatarImage);

    } catch (e) {
        showMessage(e.message, true);
        heroSection.classList.remove('hidden');
    } finally {
        generateButton.disabled = false;
        loadingSpinner.classList.add('hidden');
    }
};

function renderResults(bios, niche, tone, length, platform, customLength, goals, avatarImage) {
    outputArea.classList.remove('hidden');
    bioResults.innerHTML = '';
    
    // FEATURE 1: Prepare Avatar Source
    const avatarSrc = avatarImage ? `data:image/png;base64,${avatarImage}` : null;
    
    // Ensure bios is an array (fallback to empty array if undefined)
    const bioList = Array.isArray(bios) ? bios : [];

    bioList.forEach((bio, index) => {
        const rawBio = bio.trim().replace(/^["']|["']$/g, '');

        const div = document.createElement('div');
        // Added data-current-bio to handle state for Remix/Save buttons
        div.setAttribute('data-current-bio', rawBio); 
        div.className = 'group relative bg-white dark:bg-[#1e1f20] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden bio-card-container';
        
        const previewHTML = getPlatformPreviewHTML(rawBio, platform, niche, goals, avatarSrc);

        // Feature 3: Remix Buttons added to the body
        div.innerHTML = `
            <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#252627]/50">
                    <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">${t('res_opt') || 'Option'} ${index + 1}</span>
                    ${platform !== 'General' ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">${platform} Preview</span>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="copy-btn text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 flex items-center gap-1.5" title="Copy to Clipboard">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                        ${t('res_copy') || 'Copy'}
                    </button>
                    <button class="save-btn text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 flex items-center gap-1.5" title="Save to History">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        ${t('res_save') || 'Save'}
                    </button>
                    </div>
            </div>
            <div class="p-5 relative">
                <!-- Loading Overlay for Remix -->
                <div class="remix-overlay hidden absolute inset-0 bg-white/80 dark:bg-[#1e1f20]/80 z-10 flex flex-col items-center justify-center rounded-b-2xl">
                        <svg class="w-8 h-8 text-indigo-600 remix-spin mb-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Refining Bio...</span>
                </div>

                <div class="preview-container">
                    ${previewHTML}
                </div>
                
                <!-- Feature 3: Remix Toolbar -->
                <div class="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Remix this bio</div>
                    <div class="flex flex-wrap gap-2">
                        <button class="remix-btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5" data-instruction="Make it shorter and more punchy">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Shorten
                        </button>
                        <button class="remix-btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5" data-instruction="Add relevant emojis to emphasize key points">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Emojify
                        </button>
                        <button class="remix-btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5" data-instruction="Fix grammar, improve flow, and make it sound professional">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Fix Grammar
                        </button>
                        <button class="remix-btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5" data-instruction="Make it sound more professional and authoritative">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            Professional
                        </button>
                    </div>
                </div>
            </div>
            <div class="px-4 pb-2 flex justify-end">
                <span class="char-count text-[10px] font-mono text-gray-300 dark:text-gray-600 select-none">${rawBio.length} chars</span>
            </div>
        `;
        
        // Attach listeners dynamically
        div.querySelector('.copy-btn').onclick = (e) => {
                // Read from data attribute to get latest remixed bio
                const currentBio = e.target.closest('.bio-card-container').getAttribute('data-current-bio');
                copyToClipboard(currentBio, false);
        };

        div.querySelector('.save-btn').onclick = async (e) => {
            // Check if guest
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                showMessage("Sign in to save your bio", true);
                openAuthModal(true);
                return;
            }

            const btn = e.currentTarget;
            const currentBio = btn.closest('.bio-card-container').getAttribute('data-current-bio');
            if(btn.textContent.includes(t('res_save') + 'd')) return;
            try {
                await addDoc(collection(db, `artifacts/${appId}/users/${userId}/bios`), {
                    bio: currentBio, niche, tone, platform, length, customLength, timestamp: serverTimestamp()
                });
                btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${t('res_save')}d`;
                btn.classList.add('text-emerald-600', 'dark:text-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/20');
            } catch(err) { showMessage("Save failed", true); }
        };

        // Attach Remix Listeners
        div.querySelectorAll('.remix-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const button = e.currentTarget;
                const instruction = button.getAttribute('data-instruction');
                const card = button.closest('.bio-card-container');
                const currentBio = card.getAttribute('data-current-bio');
                const overlay = card.querySelector('.remix-overlay');
                const previewContainer = card.querySelector('.preview-container');
                const charCountSpan = card.querySelector('.char-count');
                const saveBtn = card.querySelector('.save-btn'); // reset save state

                // UI Loading
                overlay.classList.remove('hidden');
                
                try {
                        const token = await auth.currentUser.getIdToken();
                        const res = await fetch(API_PROXY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ 
                            mode: 'remix',
                            currentBio, 
                            remixInstruction: instruction,
                            niche, tone, platform, length, customLength, goals, // Context
                            userId, appId,
                            userLanguage: currentLang
                        })
                    });
                    
                    if(!res.ok) throw new Error("Remix failed");
                    const data = await res.json();
                    
                    if (data.text) {
                        const newBio = data.text.trim().replace(/^["']|["']$/g, ''); // clean
                        
                        // Update Data Attribute (Source of Truth)
                        card.setAttribute('data-current-bio', newBio);
                        
                        // Re-render Preview
                        previewContainer.innerHTML = getPlatformPreviewHTML(newBio, platform, niche, goals, avatarSrc);
                        
                        // Update Char Count
                        charCountSpan.textContent = `${newBio.length} chars`;
                        
                        // Reset Save Button (since content changed)
                        saveBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${t('res_save')}`;
                        saveBtn.className = 'save-btn text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 flex items-center gap-1.5';
                        
                        showMessage("Bio remixed successfully!");
                    }

                } catch (err) {
                    console.error(err);
                    showMessage("Remix failed. Try again.", true);
                } finally {
                    overlay.classList.add('hidden');
                }
            };
        });

        bioResults.appendChild(div);
    });
    
    // Scroll results into view smoothly on mobile
    if(window.innerWidth < 768) outputArea.scrollIntoView({behavior: 'smooth'});
}

function getPlatformPreviewHTML(bio, platform, niche, goals, avatarSrc) {
        const safeBio = escapeHtml(bio);
        
        // Apply Feature 2: Keyword Highlighting (before hashtags logic)
        let styledBio = highlightKeywords(safeBio, goals);
        
        // Existing Hashtag styling
        styledBio = styledBio.replace(/([#@][\w]+)/g, '<span class="text-blue-500 dark:text-blue-400 hover:underline cursor-pointer">$1</span>');
        
        const mockHandle = "@" + (niche || "user").replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 12) + "_official";
        
        // Avatar Logic
        const defaultAvatar = `<div class="w-full h-full flex items-center justify-center text-2xl">👤</div>`;
        
        if (platform === 'X/Twitter') {
            const avatarHTML = avatarSrc 
            ? `<img src="${avatarSrc}" class="w-full h-full object-cover" alt="AI Avatar">` 
            : `<div class="w-full h-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>`;

            return `
            <div class="bg-black text-white rounded-xl overflow-hidden font-sans border border-gray-800 max-w-md mx-auto shadow-lg">
                <div class="h-24 bg-gray-800 relative bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3')] bg-cover bg-center">
                    <div class="absolute -bottom-9 left-4 w-18 h-18 rounded-full bg-black p-1">
                        <div class="w-16 h-16 rounded-full overflow-hidden border border-gray-600 bg-gray-700">
                            ${avatarHTML}
                        </div>
                    </div>
                </div>
                <div class="pt-10 px-4 pb-4">
                        <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold text-lg leading-tight">Your Name</div>
                            <div class="text-gray-500 text-sm">${mockHandle}</div>
                        </div>
                        <button class="bg-white text-black text-sm font-bold px-5 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Follow</button>
                        </div>
                        <div class="mt-3 text-[15px] leading-normal whitespace-pre-wrap text-gray-100">${styledBio}</div>
                        <div class="mt-3 flex gap-4 text-sm text-gray-500">
                        <div class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Location</div>
                        <div class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> bio.link</div>
                    </div>
                        <div class="mt-3 flex gap-4 text-sm text-gray-500">
                        <span><span class="font-bold text-white">242</span> Following</span>
                        <span><span class="font-bold text-white">8,420</span> Followers</span>
                    </div>
                </div>
            </div>
            `;
        }
        
        if (platform === 'Instagram') {
            const avatarHTML = avatarSrc 
            ? `<img src="${avatarSrc}" class="w-full h-full object-cover" alt="AI Avatar">` 
            : `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>`;

            return `
            <div class="bg-white text-black rounded-xl border border-gray-200 font-sans overflow-hidden max-w-md mx-auto shadow-sm">
                <div class="px-4 py-2 border-b border-gray-100 flex justify-center items-center relative bg-white">
                    <span class="font-bold text-sm">${mockHandle}</span>
                    <svg class="w-5 h-5 absolute right-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </div>
                <div class="p-4 bg-white">
                    <div class="flex items-center gap-6 mb-4">
                        <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px] flex-shrink-0">
                            <div class="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                    ${avatarHTML}
                            </div>
                        </div>
                        <div class="flex-1 flex justify-around text-center">
                            <div><div class="font-bold text-base">42</div><div class="text-xs text-gray-800">Posts</div></div>
                            <div><div class="font-bold text-base">12.5k</div><div class="text-xs text-gray-800">Followers</div></div>
                            <div><div class="font-bold text-base">340</div><div class="text-xs text-gray-800">Following</div></div>
                        </div>
                    </div>
                    <div class="text-sm">
                        <div class="font-bold text-black">Your Name</div>
                        <div class="text-gray-500 text-xs mb-1">${niche}</div>
                        <div class="whitespace-pre-wrap mb-1 leading-snug text-gray-900">${styledBio}</div>
                        <div class="text-[#00376b] font-bold text-xs cursor-pointer">link.bio/mysite</div>
                    </div>
                        <div class="mt-4 flex gap-2">
                        <button class="flex-1 bg-gray-100 text-sm font-semibold py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Edit Profile</button>
                        <button class="bg-gray-100 p-1.5 rounded-lg hover:bg-gray-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
                    </div>
                </div>
            </div>
            `;
        }
        
        if (platform === 'LinkedIn') {
            const avatarHTML = avatarSrc 
            ? `<img src="${avatarSrc}" class="w-full h-full object-cover" alt="AI Avatar">` 
            : `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-3xl text-gray-500">👤</div>`;

            return `
            <div class="bg-white text-gray-900 rounded-xl border border-gray-200 font-sans overflow-hidden max-w-md mx-auto shadow-sm">
                    <div class="h-16 bg-[#a0b4b7] relative">
                        <div class="absolute -bottom-10 left-4 w-20 h-20 rounded-full bg-white p-1">
                        <div class="w-full h-full rounded-full overflow-hidden">
                            ${avatarHTML}
                        </div>
                        </div>
                        <div class="absolute top-2 right-2">
                        <div class="bg-white/80 p-1.5 rounded-full"><svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg></div>
                        </div>
                    </div>
                    <div class="mt-12 px-4 pb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold text-xl text-gray-900">Your Name</div>
                            <div class="text-sm text-gray-600">${niche} • Open to work</div>
                        </div>
                        <svg class="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
                    </div>
                    
                    <div class="text-xs text-gray-500 mt-1">Talks about #marketing, #growth, and #${niche.split(' ')[0].toLowerCase()}</div>
                    <div class="text-xs text-blue-600 font-bold mt-1 cursor-pointer">Contact info</div>
                    
                    <div class="bg-gray-50 rounded-xl p-4 mt-4 border border-gray-100">
                        <h4 class="font-bold text-base text-gray-900 mb-2">About</h4>
                        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${styledBio}</div>
                    </div>
                    </div>
            </div>
            `;
        }

        // Default (General) - Add avatar next to bio
        return `
        <div class="flex gap-4 items-start">
            ${ avatarSrc ? `<img src="${avatarSrc}" class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0">` : '' }
            <div class="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap font-sans">${styledBio}</div>
        </div>
        `;
}

async function copyToClipboard(text, isHistory) {
        try {
            await navigator.clipboard.writeText(text);
            if(!isHistory) {
            copyMessage.classList.remove('hidden');
            setTimeout(() => copyMessage.classList.add('hidden'), 2000);
            } else {
                showMessage("Bio copied to clipboard!");
            }
        } catch (e) {
            showMessage("Copy failed. Please copy manually.", true);
        }
}
