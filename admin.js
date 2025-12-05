import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAqqENNvQzrUdMFcjEJsG2iygrQWNWS0A",
    authDomain: "pro-tools-web-app.firebaseapp.com",
    projectId: "pro-tools-web-app",
    storageBucket: "pro-tools-web-app.firebasestorage.app",
    messagingSenderId: "146517824837",
    appId: "1:146517824837:web:12d1c042f8493b1bab1a2c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- UI REFS ---
const loginPage = document.getElementById('login-page');
const adminDashboard = document.getElementById('admin-dashboard');
const loginBtn = document.getElementById('admin-login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
const adminName = document.getElementById('admin-name');
const adminAvatar = document.getElementById('admin-avatar');

// Sidebar Refs
const sidebar = document.getElementById('sidebar');
const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarTexts = document.querySelectorAll('.sidebar-text');
const mainContent = document.querySelector('main');

// Nav & Tabs
const navBtns = document.querySelectorAll('.nav-btn');
const views = {
    dashboard: document.getElementById('view-dashboard'),
    users: document.getElementById('view-users'),
    bios: document.getElementById('view-bios')
};

// Modal Refs
const modal = document.getElementById('user-detail-modal');
const modalPanel = document.getElementById('user-detail-panel');
const closeModalBtn = document.getElementById('close-detail-modal');

// State
let allUsersCache = [];
let allBiosCache = [];
let currentInspectUid = null;
let isSidebarCollapsed = false;

// --- THEME LOGIC ---
function updateThemeIcon() {
        const isDark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', !isDark));
        document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', isDark));
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
    updateThemeIcon();
}

document.getElementById('desktop-theme-toggle').onclick = toggleTheme;
document.getElementById('mobile-theme-toggle').onclick = toggleTheme;

// Init icon state
updateThemeIcon();

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const iconPath = type === 'error' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M5 13l4 4L19 7';
    const bgColor = type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900';

    toast.className = `toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl font-medium text-sm ${bgColor} max-w-sm border border-white/10`;
    toast.innerHTML = `
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path></svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- AUTH LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'checkAuth' })
            });
            
            if (res.ok) {
                loginPage.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => loginPage.classList.add('hidden'), 500);
                adminDashboard.classList.remove('hidden');
                requestAnimationFrame(() => adminDashboard.classList.remove('opacity-0'));
                adminName.textContent = user.displayName || 'Admin';
                if(user.photoURL) adminAvatar.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover">`;
                else adminAvatar.innerHTML = '<span class="text-xs font-bold text-gray-500">A</span>';
                loadDashboard();
                showToast(`Session active for ${user.displayName || 'Admin'}`);
            } else {
                throw new Error("Unauthorized Access");
            }
        } catch (e) {
            console.error(e);
            loginError.classList.remove('hidden');
            document.getElementById('login-error-text').textContent = "Access Denied. Admin privileges required.";
            await signOut(auth);
        }
    } else {
        loginPage.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        adminDashboard.classList.add('opacity-0');
        setTimeout(() => adminDashboard.classList.add('hidden'), 500);
        loginError.classList.add('hidden');
    }
});

loginBtn.onclick = async () => {
    const btn = loginBtn;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-indigo-600 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
    btn.disabled = true;
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
        showToast("Login interrupted", 'error');
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};

const performLogout = () => signOut(auth).then(() => window.location.reload());
logoutBtn.onclick = performLogout;
mobileLogoutBtn.onclick = performLogout;

// --- SIDEBAR LOGIC ---
function toggleMobileSidebar() {
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    }
}
mobileMenuBtn.onclick = toggleMobileSidebar;
closeSidebarBtn.onclick = toggleMobileSidebar;
sidebarOverlay.onclick = toggleMobileSidebar;

sidebarCollapseBtn.onclick = () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('main');
    const sidebarTexts = document.querySelectorAll('.sidebar-text');
    
    if (isSidebarCollapsed) {
        sidebar.classList.remove('w-72');
        sidebar.classList.add('w-20', 'sidebar-collapsed');
        sidebarTexts.forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.add('justify-center'));
        sidebarCollapseBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>';
        mainContent.classList.remove('md:ml-72');
        mainContent.classList.add('md:ml-20');
    } else {
        sidebar.classList.remove('w-20', 'sidebar-collapsed');
        sidebar.classList.add('w-72');
        sidebarTexts.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('justify-center'));
        sidebarCollapseBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"></rect><line x1="9" y1="3" x2="9" y2="21" stroke-width="2"></line></svg>';
        mainContent.classList.remove('md:ml-20');
        mainContent.classList.add('md:ml-72');
    }
};

// Navigation Tabs
navBtns.forEach(btn => {
    btn.onclick = () => {
        navBtns.forEach(b => {
                const isJustified = b.classList.contains('justify-center');
                b.className = "nav-btn w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2022] hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-3 group relative";
                if(isJustified) b.classList.add('justify-center');
        });
        const isJustified = btn.classList.contains('justify-center');
        btn.className = "nav-btn w-full text-left px-3 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 group relative bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300";
        if(isJustified) btn.classList.add('justify-center');
        
        const tab = btn.dataset.tab;
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[tab].classList.remove('hidden');
        
        if(window.innerWidth < 768) toggleMobileSidebar();

        if(tab === 'users') loadUsers();
        if(tab === 'bios') loadBios();
        if(tab === 'dashboard') loadDashboard();
    };
});

// --- DATA API ---
async function apiCall(action, payload = {}) {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, ...payload })
    });
    if(!res.ok) throw new Error("API Error");
    return await res.json();
}

async function loadDashboard() {
    try {
        const data = await apiCall('getStats');
        document.getElementById('stat-users').textContent = data.userCount || '0';
        document.getElementById('stat-pro').textContent = data.proCount || '0';
        document.getElementById('stat-bios').textContent = data.bioCount || '0';
        renderChart(data.chartData);
        renderLogs(data.logs);
    } catch(e) { showToast("Dashboard sync failed", 'error'); }
}

function renderLogs(logs) {
    const list = document.getElementById('logs-list');
    list.innerHTML = '';
    if(!logs || !logs.length) {
        list.innerHTML = '<div class="p-6 text-center text-xs text-gray-400">System Nominal. No new alerts.</div>';
        return;
    }
    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1f2022] transition-colors';
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <div>
                    <div class="text-xs font-bold text-gray-800 dark:text-gray-200">${log.reason || 'Unknown Error'}</div>
                    <div class="text-[10px] text-gray-400 font-mono tracking-tighter">${log.id}</div>
                </div>
            </div>
            <div class="text-[10px] text-gray-400">${new Date(log.time).toLocaleTimeString()}</div>
        `;
        list.appendChild(div);
    });
}

function renderChart(data) {
    const container = document.getElementById('growth-chart');
    if(!data || !data.length) {
        container.innerHTML = '<div class="flex-1 flex items-center justify-center text-gray-400 text-xs">No data available</div>';
        return;
    }
    const max = Math.max(...data.map(d => d.count)) || 1;
    container.innerHTML = '';
    data.forEach((item, i) => {
        const h = (item.count / max) * 100;
        const bar = document.createElement('div');
        bar.className = 'flex-1 flex flex-col justify-end group relative h-full';
        bar.innerHTML = `
            <div class="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t opacity-80 hover:opacity-100 chart-bar relative" style="height: 0%">
                <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded font-bold transition-opacity">
                    ${item.count}
                </div>
            </div>
            <div class="text-[9px] text-center text-gray-400 mt-2 font-mono">${item.date}</div>
        `;
        container.appendChild(bar);
        setTimeout(() => {
            const el = bar.querySelector('.chart-bar');
            if(el) el.style.height = `${h < 5 ? 5 : h}%`;
        }, i * 50);
    });
}

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400 text-xs animate-pulse">Fetching user records...</td></tr>';
    try {
        const data = await apiCall('getUsers');
        allUsersCache = data.users || [];
        renderUsersTable(allUsersCache);
    } catch(e) { tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-red-400 text-xs">Failed to load data.</td></tr>'; }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    if(!users.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-400 text-xs">No users found.</td></tr>';
        return;
    }
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-hover transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-none group cursor-pointer';
        const initial = (u.email||'?')[0].toUpperCase();
        const avatar = u.photoURL 
            ? `<img src="${u.photoURL}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">${initial}</div>`;

        tr.innerHTML = `
            <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0">${avatar}</div>
                    <div class="min-w-0">
                        <div class="font-semibold text-gray-900 dark:text-white truncate text-xs">${u.displayName || 'Unknown'}</div>
                        <div class="text-[10px] text-gray-500 truncate">${u.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-3">
                ${u.isPro 
                    ? '<span class="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full border border-amber-200">PRO</span>' 
                    : '<span class="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full border border-gray-200 dark:bg-gray-800 dark:border-gray-700">FREE</span>'}
            </td>
            <td class="px-6 py-3 text-[10px] text-gray-500 font-mono">
                ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
            </td>
            <td class="px-6 py-3 text-right">
                <button class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity" onclick="openUserModal('${u.uid}')">Manage</button>
            </td>
        `;
        tr.onclick = (e) => {
                if(e.target.tagName !== 'BUTTON') window.openUserModal(u.uid);
        };
        tbody.appendChild(tr);
    });
}

document.getElementById('user-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allUsersCache.filter(u => 
        (u.email && u.email.toLowerCase().includes(val)) || 
        (u.displayName && u.displayName.toLowerCase().includes(val)) ||
        u.uid.includes(val)
    );
    renderUsersTable(filtered);
});

// --- GLOBAL FUNCTIONS ---
window.openUserModal = async (uid) => {
    currentInspectUid = uid;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modalPanel.classList.remove('scale-95');
        modalPanel.classList.add('scale-100');
    });

    document.getElementById('detail-name').textContent = 'Loading...';
    document.getElementById('detail-json').textContent = '...';
    document.getElementById('detail-pro-badge').classList.add('hidden');
    
    try {
        const data = await apiCall('getUserDetails', { uid });
        const u = data.user;
        
        document.getElementById('detail-name').textContent = u.displayName || 'No Name';
        document.getElementById('detail-email').innerHTML = `<span class="w-2 h-2 rounded-full bg-${u.disabled ? 'red' : 'emerald'}-500"></span> ${u.email}`;
        document.getElementById('detail-bio-count').textContent = data.bioCount;
        document.getElementById('detail-joined').textContent = new Date(u.metadata.creationTime).toLocaleDateString();
        
        const initial = (u.email||'?')[0].toUpperCase();
        document.getElementById('detail-avatar').innerHTML = u.photoURL 
            ? `<img src="${u.photoURL}" class="w-full h-full object-cover">`
            : initial;

        if(data.status?.isPro) document.getElementById('detail-pro-badge').classList.remove('hidden');
        else document.getElementById('detail-pro-badge').classList.add('hidden');
        
        if(u.disabled) document.getElementById('detail-disabled-badge').classList.remove('hidden');
        else document.getElementById('detail-disabled-badge').classList.add('hidden');

        document.getElementById('detail-json').textContent = JSON.stringify(data.status, null, 2);
        
        const proBtn = document.getElementById('btn-toggle-pro');
        proBtn.textContent = data.status?.isPro ? "Revoke Pro Status" : "Grant Pro Status";
        proBtn.onclick = async () => {
            proBtn.textContent = "...";
            await apiCall('togglePro', { uid });
            window.openUserModal(uid);
            showToast("Subscription status updated");
        };

        const disableBtn = document.getElementById('btn-toggle-disable');
        disableBtn.textContent = u.disabled ? "Reactivate Account" : "Suspend Account";
        disableBtn.className = u.disabled 
            ? "flex-1 py-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border-emerald-200"
            : "flex-1 py-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-2 bg-white dark:bg-[#252627] border-gray-200 dark:border-gray-700 hover:bg-red-50 text-red-600";
        
        disableBtn.onclick = async () => {
                disableBtn.textContent = "...";
                await apiCall('toggleDisableUser', { uid });
                window.openUserModal(uid);
                showToast("Account status updated");
        };

    } catch(e) { console.error(e); showToast("Failed to fetch details", 'error'); }
};

window.closeUserModal = () => {
    modal.classList.add('opacity-0');
    modalPanel.classList.remove('scale-100');
    modalPanel.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
};
closeModalBtn.onclick = window.closeUserModal;
modal.onclick = (e) => { if(e.target === modal) window.closeUserModal(); };

// --- BIOS FEED ---
async function loadBios() {
    const feed = document.getElementById('bios-feed');
    feed.innerHTML = '<div class="col-span-full py-12 text-center text-gray-400 text-sm animate-pulse">Syncing feed...</div>';
    try {
        const data = await apiCall('getRecentBios');
        allBiosCache = data.bios || [];
        renderBios(allBiosCache);
    } catch(e) { feed.innerHTML = '<div class="col-span-full py-12 text-center text-red-400 text-sm">Sync failed.</div>'; }
}

function renderBios(list) {
    const feed = document.getElementById('bios-feed');
    feed.innerHTML = '';
    if(!list.length) {
        feed.innerHTML = '<div class="col-span-full py-12 text-center text-gray-400 text-sm">No bios generated yet.</div>';
        return;
    }
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-full bg-white dark:bg-[#151616] border border-gray-100 dark:border-gray-800 relative group';
        
        let tagColor = 'bg-gray-100 text-gray-600';
        if(item.platform === 'LinkedIn') tagColor = 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
        if(item.platform === 'Instagram') tagColor = 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tagColor}">${item.platform}</span>
                <div class="flex gap-2">
                        <button class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onclick="deleteBio('${item.id}', '${item.userId}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                </div>
            </div>
            <div class="text-sm text-gray-800 dark:text-gray-200 mb-4 flex-grow italic leading-relaxed">"${item.bio}"</div>
            <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
                <span class="cursor-pointer hover:text-indigo-500" onclick="window.filterByUser('${item.userId}')">${item.userId.substring(0,6)}...</span>
                <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
        `;
        feed.appendChild(card);
    });
}

window.deleteBio = async (bid, uid) => {
    if(!confirm("Delete this content?")) return;
    try {
        await apiCall('deleteBio', { bioId: bid, userId: uid });
        loadBios();
        showToast("Content removed");
    } catch(e) { showToast("Delete failed", 'error'); }
};

window.filterByUser = (uid) => {
    document.querySelector('[data-tab="users"]').click();
    const inp = document.getElementById('user-search');
    inp.value = uid;
    inp.dispatchEvent(new Event('input'));
    showToast("Filtered by user ID");
};

// Event Listeners
document.getElementById('refresh-dashboard').onclick = () => { loadDashboard(); showToast("Refreshed"); };
document.getElementById('refresh-users').onclick = () => { loadUsers(); showToast("Refreshed"); };
document.getElementById('refresh-bios').onclick = () => { loadBios(); showToast("Refreshed"); };

document.getElementById('bio-platform-filter').addEventListener('change', (e) => {
        const v = e.target.value;
        if(v === 'All') renderBios(allBiosCache);
        else renderBios(allBiosCache.filter(b => b.platform === v));
});
