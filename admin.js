import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyAAqqENNvQzrUdMFcjEJsG2iygrQWNWS0A",
    authDomain: "pro-tools-web-app.firebaseapp.com",
    projectId: "pro-tools-web-app",
    storageBucket: "pro-tools-web-app.firebasestorage.app",
    messagingSenderId: "146517824837",
    appId: "1:146517824837:web:12d1c042f8493b1bab1a2c",
    measurementId: "G-6LYSEGKE8V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const API_URL = '/api/admin';

// --- STATE ---
let currentUser = null;
let currentTab = 'dashboard';

// --- UI ELEMENTS ---
const loginPage = document.getElementById('login-page');
const dashboardContainer = document.getElementById('admin-dashboard');
const adminLoginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
const loginError = document.getElementById('login-error');
const loginErrorText = document.getElementById('login-error-text');

// Views
const views = {
    dashboard: document.getElementById('view-dashboard'),
    users: document.getElementById('view-users'),
    bios: document.getElementById('view-bios'),
    settings: document.getElementById('view-settings'),
    ads: document.getElementById('view-ads')
};

// --- AUTHENTICATION ---

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Validate if user is actually an admin via API
        try {
            const token = await user.getIdToken();
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'checkAuth' })
            });

            if (res.ok) {
                currentUser = user;
                showDashboard();
                updateProfileUI(user);
                loadTab(currentTab);
            } else {
                throw new Error("Unauthorized access.");
            }
        } catch (e) {
            console.error(e);
            await signOut(auth);
            showLogin(e.message);
        }
    } else {
        currentUser = null;
        showLogin();
    }
});

adminLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        loginError.classList.add('hidden');
        await signInWithPopup(auth, provider);
    } catch (e) {
        showLogin("Login failed: " + e.message);
    }
});

const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
};

logoutBtn.addEventListener('click', handleLogout);
mobileLogoutBtn.addEventListener('click', handleLogout);

function showLogin(errorMsg) {
    loginPage.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    dashboardContainer.classList.remove('opacity-100');
    
    if (errorMsg) {
        loginErrorText.textContent = "Access Denied";
        loginError.querySelector('p').textContent = errorMsg;
        loginError.classList.remove('hidden');
    }
}

function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => dashboardContainer.classList.add('opacity-100'), 50);
}

function updateProfileUI(user) {
    const avatar = document.getElementById('admin-avatar');
    const name = document.getElementById('admin-name');
    
    if (user.photoURL) {
        avatar.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover">`;
    } else {
        avatar.textContent = user.email.charAt(0).toUpperCase();
        avatar.className = "w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm";
    }
    name.textContent = user.displayName || user.email;
}

// --- NAVIGATION ---

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        currentTab = tab;
        loadTab(tab);
        
        // Mobile: Close sidebar after selection
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('-translate-x-full');
            document.getElementById('sidebar-overlay').classList.add('hidden');
        }
    });
});

function loadTab(tab) {
    // UI Updates
    document.querySelectorAll('.nav-btn').forEach(b => {
        if(b.dataset.tab === tab) {
            b.classList.add('bg-indigo-50', 'dark:bg-[#1f2022]', 'text-indigo-600', 'dark:text-indigo-400');
            b.classList.remove('text-gray-500', 'dark:text-gray-400');
        } else {
            b.classList.remove('bg-indigo-50', 'dark:bg-[#1f2022]', 'text-indigo-600', 'dark:text-indigo-400');
            b.classList.add('text-gray-500', 'dark:text-gray-400');
        }
    });

    Object.values(views).forEach(el => el.classList.add('hidden'));
    if(views[tab]) views[tab].classList.remove('hidden');

    // Data Fetching
    if (tab === 'dashboard') loadDashboardStats();
    if (tab === 'users') loadUsers();
    if (tab === 'bios') loadBios();
    if (tab === 'settings') loadSettings();
    if (tab === 'ads') loadAds();
}

// --- API HELPER ---
async function callApi(action, data = {}) {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action, ...data })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "API Error");
        return json;
    } catch (e) {
        showToast(e.message, 'error');
        throw e;
    }
}

// --- DASHBOARD LOGIC ---

document.getElementById('refresh-dashboard').addEventListener('click', loadDashboardStats);

async function loadDashboardStats() {
    const data = await callApi('getStats');
    if (!data) return;

    // Animate Numbers
    animateValue(document.getElementById('stat-users'), data.userCount);
    animateValue(document.getElementById('stat-pro'), data.proCount);
    animateValue(document.getElementById('stat-bios'), data.bioCount);

    // Logs
    const logsList = document.getElementById('logs-list');
    logsList.innerHTML = data.logs.length ? '' : '<div class="p-6 text-center text-xs text-gray-400">No recent alerts. System healthy.</div>';
    
    data.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = "px-6 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-[#1f2022] transition-colors";
        div.innerHTML = `
            <div class="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">${log.reason}</p>
                <p class="text-[10px] text-gray-400 font-mono mt-0.5">${new Date(log.time).toLocaleString()}</p>
            </div>
        `;
        logsList.appendChild(div);
    });

    // Growth Chart (Simple CSS implementation)
    const chartContainer = document.getElementById('growth-chart');
    if (data.chartData && data.chartData.length > 0) {
        chartContainer.innerHTML = '';
        const max = Math.max(...data.chartData.map(d => d.count)) || 1;
        
        data.chartData.forEach(item => {
            const height = Math.max((item.count / max) * 100, 5); // Min 5% height
            const barWrapper = document.createElement('div');
            barWrapper.className = "flex-1 flex flex-col justify-end items-center gap-2 group cursor-pointer";
            barWrapper.innerHTML = `
                <div class="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-sm relative chart-bar group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50" style="height: ${height}%">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ${item.count} Users
                    </div>
                </div>
                <div class="text-[10px] text-gray-400 font-mono">${item.date}</div>
            `;
            chartContainer.appendChild(barWrapper);
        });
    }
}

function animateValue(obj, endValue) {
    if (typeof endValue === 'string') {
        obj.textContent = endValue; // Handle "100+" strings
        return;
    }
    let startTimestamp = null;
    const duration = 1000;
    const startValue = parseInt(obj.textContent) || 0;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (endValue - startValue) + startValue);
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.textContent = endValue;
    };
    window.requestAnimationFrame(step);
}

// --- USERS LOGIC ---

document.getElementById('refresh-users').addEventListener('click', loadUsers);
let allUsers = [];

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-400 animate-pulse">Loading users...</td></tr>';
    
    const data = await callApi('getUsers');
    allUsers = data.users || [];
    renderUsersTable(allUsers);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No users found.</td></tr>';
        return;
    }

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 dark:hover:bg-[#1f2022] transition-colors group";
        
        const initial = (u.displayName || u.email || '?').charAt(0).toUpperCase();
        const createdDate = new Date(u.createdAt).toLocaleDateString();
        const isPro = u.isPro;
        
        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-3 border border-indigo-200 dark:border-indigo-800">
                        ${u.photoURL ? `<img src="${u.photoURL}" class="w-full h-full rounded-full object-cover">` : initial}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white text-sm">${u.displayName || 'Anonymous'}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">${u.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                ${isPro 
                    ? `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800">PRO PLAN</span>` 
                    : `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">FREE</span>`
                }
            </td>
            <td class="px-6 py-4">
                <div class="text-xs text-gray-500 dark:text-gray-400">${createdDate}</div>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="manage-user-btn text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" data-uid="${u.uid}">Manage</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach listeners programmatically (CSP Compliant)
    document.querySelectorAll('.manage-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openUserModal(btn.dataset.uid);
        });
    });
}

document.getElementById('user-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.email && u.email.toLowerCase().includes(term)) || 
        (u.displayName && u.displayName.toLowerCase().includes(term)) ||
        (u.uid && u.uid.toLowerCase().includes(term))
    );
    renderUsersTable(filtered);
});

// --- BIOS LOGIC ---

document.getElementById('refresh-bios').addEventListener('click', loadBios);
let allBios = [];

async function loadBios() {
    const container = document.getElementById('bios-feed');
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400 animate-pulse">Fetching global feed...</div>';
    
    const data = await callApi('getRecentBios');
    allBios = data.bios || [];
    renderBiosFeed(allBios);
}

function renderBiosFeed(bios) {
    const container = document.getElementById('bios-feed');
    container.innerHTML = '';

    if (bios.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No bios generated yet.</div>';
        return;
    }

    bios.forEach(b => {
        const div = document.createElement('div');
        div.className = "bg-white dark:bg-[#151616] rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow relative group";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    ${b.platform || 'General'}
                </span>
                <span class="text-[10px] text-gray-400 font-mono">${new Date(b.timestamp).toLocaleTimeString()}</span>
            </div>
            <p class="text-sm text-gray-800 dark:text-gray-200 font-medium mb-3 line-clamp-3 leading-relaxed">"${b.bio}"</p>
            <div class="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                <div class="text-[10px] text-gray-400 truncate max-w-[120px]" title="${b.niche}">${b.niche}</div>
                <button class="delete-bio-btn text-gray-400 hover:text-red-500 transition-colors p-1" data-id="${b.id}" data-userid="${b.userId}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.delete-bio-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if(!confirm("Delete this bio permanently?")) return;
            
            const id = btn.dataset.id;
            const uid = btn.dataset.userid;
            
            // Optimistic UI removal
            btn.closest('div.bg-white').remove();
            
            try {
                await callApi('deleteBio', { bioId: id, userId: uid });
                showToast('Bio deleted');
            } catch(err) {
                showToast('Failed to delete bio', 'error');
            }
        });
    });
}

document.getElementById('bio-platform-filter').addEventListener('change', (e) => {
    const val = e.target.value;
    const filtered = val === 'All' ? allBios : allBios.filter(b => b.platform === val);
    renderBiosFeed(filtered);
});

// --- SETTINGS LOGIC ---

async function loadSettings() {
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="opacity-50">Loading...</span>`;

    const data = await callApi('getSettings');
    
    // Populate Fields
    document.getElementById('setting-title').value = data.title || '';
    document.getElementById('setting-description').value = data.metaDescription || '';
    
    if (data.faviconUrl) {
        document.getElementById('favicon-preview').src = data.faviconUrl;
    }

    btn.disabled = false;
    btn.innerHTML = `<span>Save Changes</span>`;
}

// Favicon Preview
document.getElementById('favicon-upload').addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        document.getElementById('favicon-preview').src = src;
    }
});

// Save Settings
document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-settings-btn');
    btn.disabled = true;
    btn.innerHTML = `<span>Saving...</span>`;

    try {
        // 1. Upload Favicon if changed
        const fileInput = document.getElementById('favicon-upload');
        let faviconUrl = undefined;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const ext = file.name.split('.').pop();
            const storageRef = ref(storage, `uploads/favicons/${Date.now()}.${ext}`);
            await uploadBytes(storageRef, file);
            faviconUrl = await getDownloadURL(storageRef);
        }

        // 2. Prepare Data
        const settings = {
            title: document.getElementById('setting-title').value,
            metaDescription: document.getElementById('setting-description').value,
        };
        
        if (faviconUrl) settings.faviconUrl = faviconUrl;

        // 3. Call API
        await callApi('updateSettings', { settings });
        
        showToast("Settings updated successfully!");
        
    } catch (e) {
        console.error(e);
        showToast("Failed to save settings: " + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Save Changes</span>`;
    }
});

// --- ADS LOGIC ---

async function loadAds() {
    const btn = document.getElementById('save-ads-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="opacity-50">Loading...</span>`;

    const data = await callApi('getAdSettings');
    const ads = data || {};

    // Populate Fields
    document.getElementById('ad-enable-sidebar').checked = ads.sidebar?.enabled || false;
    document.getElementById('ad-code-sidebar').value = ads.sidebar?.code || '';

    document.getElementById('ad-enable-header').checked = ads.header?.enabled || false;
    document.getElementById('ad-code-header').value = ads.header?.code || '';

    document.getElementById('ad-enable-footer').checked = ads.footer?.enabled || false;
    document.getElementById('ad-code-footer').value = ads.footer?.code || '';

    btn.disabled = false;
    btn.innerHTML = `<span>Save Ads Configuration</span>`;
}

document.getElementById('save-ads-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-ads-btn');
    btn.disabled = true;
    btn.innerHTML = `<span>Saving...</span>`;

    try {
        const ads = {
            sidebar: {
                enabled: document.getElementById('ad-enable-sidebar').checked,
                code: document.getElementById('ad-code-sidebar').value
            },
            header: {
                enabled: document.getElementById('ad-enable-header').checked,
                code: document.getElementById('ad-code-header').value
            },
            footer: {
                enabled: document.getElementById('ad-enable-footer').checked,
                code: document.getElementById('ad-code-footer').value
            }
        };

        await callApi('updateAdSettings', { ads });
        showToast("Ad settings saved!");

    } catch(e) {
        console.error(e);
        showToast("Failed to save ads: " + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Save Ads Configuration</span>`;
    }
});

// --- USER MODAL LOGIC ---

const modal = document.getElementById('user-detail-modal');
const closeBtn = document.getElementById('close-detail-modal');
let currentModalUser = null;

async function openUserModal(uid) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    
    // Reset UI
    document.getElementById('detail-name').textContent = 'Loading...';
    document.getElementById('detail-email').innerHTML = '';
    document.getElementById('detail-pro-badge').classList.add('hidden');
    document.getElementById('detail-disabled-badge').classList.add('hidden');
    document.getElementById('detail-json').textContent = 'Fetching data...';

    const data = await callApi('getUserDetails', { uid });
    if (!data) return;

    currentModalUser = data;
    renderUserModal(data);
}

function renderUserModal(data) {
    const u = data.user;
    const status = data.status || {};
    
    document.getElementById('detail-name').textContent = u.displayName || 'Anonymous';
    document.getElementById('detail-email').innerHTML = `<span class="w-2 h-2 rounded-full ${u.disabled ? 'bg-red-500' : 'bg-emerald-500'}"></span> ${u.email}`;
    document.getElementById('detail-avatar').innerHTML = u.photoURL 
        ? `<img src="${u.photoURL}" class="w-full h-full object-cover">`
        : (u.email || '?').charAt(0).toUpperCase();
        
    document.getElementById('detail-joined').textContent = new Date(u.metadata.creationTime).toLocaleDateString();
    document.getElementById('detail-bio-count').textContent = data.bioCount;
    
    // Status Badges
    if (status.isPro) document.getElementById('detail-pro-badge').classList.remove('hidden');
    else document.getElementById('detail-pro-badge').classList.add('hidden');
    
    if (u.disabled) document.getElementById('detail-disabled-badge').classList.remove('hidden');
    else document.getElementById('detail-disabled-badge').classList.add('hidden');

    // Raw JSON
    document.getElementById('detail-json').textContent = JSON.stringify(data, null, 2);
    
    // Buttons state
    const proBtn = document.getElementById('btn-toggle-pro');
    proBtn.textContent = status.isPro ? "Revoke Pro" : "Grant Pro";
    
    const disableBtn = document.getElementById('btn-toggle-disable');
    disableBtn.textContent = u.disabled ? "Enable Account" : "Suspend Account";
}

// Modal Actions
document.getElementById('btn-toggle-pro').addEventListener('click', async () => {
    if(!currentModalUser) return;
    const btn = document.getElementById('btn-toggle-pro');
    btn.disabled = true;
    try {
        const res = await callApi('togglePro', { uid: currentModalUser.user.uid });
        showToast(`User is now ${res.newStatus ? 'Pro' : 'Free'}`);
        currentModalUser.status = { ...currentModalUser.status, isPro: res.newStatus };
        renderUserModal(currentModalUser);
        loadUsers(); // Refresh table background
    } finally {
        btn.disabled = false;
    }
});

document.getElementById('btn-toggle-disable').addEventListener('click', async () => {
    if(!currentModalUser) return;
    const btn = document.getElementById('btn-toggle-disable');
    btn.disabled = true;
    try {
        const res = await callApi('toggleDisableUser', { uid: currentModalUser.user.uid });
        showToast(`User account ${res.newStatus ? 'Disabled' : 'Enabled'}`);
        currentModalUser.user.disabled = res.newStatus;
        renderUserModal(currentModalUser);
    } finally {
        btn.disabled = false;
    }
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
});

modal.addEventListener('click', (e) => {
    if(e.target === modal) closeBtn.click();
});

// --- UTILS ---

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    const colorClass = type === 'error' ? 'bg-red-500' : 'bg-gray-900 dark:bg-white';
    const textClass = type === 'error' ? 'text-white' : 'text-white dark:text-black';
    
    div.className = `${colorClass} ${textClass} px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 transform transition-all duration-300 toast-enter`;
    div.innerHTML = `
        <span>${type === 'error' ? '⚠️' : '✅'}</span>
        ${msg}
    `;
    
    container.appendChild(div);
    
    setTimeout(() => {
        div.classList.remove('toast-enter');
        div.classList.add('toast-exit');
        setTimeout(() => div.remove(), 400);
    }, 3000);
}

// --- UI HELPERS ---
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const overlay = document.getElementById('sidebar-overlay');
const desktopCollapseBtn = document.getElementById('sidebar-collapse-btn');

function toggleMobileSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
closeSidebarBtn.addEventListener('click', toggleMobileSidebar);
overlay.addEventListener('click', toggleMobileSidebar);

desktopCollapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('w-72');
    sidebar.classList.toggle('w-20');
    sidebar.classList.toggle('sidebar-collapsed');
    
    const main = document.querySelector('main');
    main.classList.toggle('md:ml-72');
    main.classList.toggle('md:ml-20');
    
    // Toggle text visibility
    document.querySelectorAll('.sidebar-text').forEach(el => {
        el.classList.toggle('opacity-0');
        el.classList.toggle('w-0');
        el.classList.toggle('hidden'); // Helper to completely hide for layout
    });
});

// Theme Logic
const themeToggles = [document.getElementById('mobile-theme-toggle'), document.getElementById('desktop-theme-toggle')];
themeToggles.forEach(btn => {
    if(btn) btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});
