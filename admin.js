// ===== ADMIN PANEL SCRIPT =====

const STORAGE_KEY = 'review_templates';
const MAP_KEY = 'review_map_link';
const ADMIN_PASSWORD = 'admin123'; // Change this to your password

// ===== DOM =====
const $ = id => document.getElementById(id);
const loginScreen = $('login-screen');
const dashboard = $('dashboard');
const adminPassInput = $('admin-pass');
const btnLogin = $('btn-login');
const loginError = $('login-error');
const adminBody = $('admin-body');
const adminAddBtn = $('admin-add-btn');
const templatesList = $('templates-list');
const templateCount = $('template-count');
const adminMapLink = $('admin-map-link');
const adminSaveLinkBtn = $('admin-save-link-btn');
const toast = $('toast');
const toastMsg = $('toast-message');

// ===== HELPERS =====
function getTemplates() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) { return []; }
}

function saveTemplates(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function getMapLink() {
    return localStorage.getItem(MAP_KEY) || '';
}

function saveMapLink(link) {
    localStorage.setItem(MAP_KEY, link);
}

function showToast(msg, isError = false) {
    toastMsg.textContent = msg;
    toast.style.background = isError ? 'var(--red)' : 'var(--green)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== LOGIN =====
function handleLogin() {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        loginScreen.classList.add('hidden');
        dashboard.classList.add('active');
        renderAll();
    } else {
        loginError.style.display = 'block';
        adminPassInput.value = '';
        adminPassInput.style.borderColor = 'var(--red)';
        setTimeout(() => {
            loginError.style.display = 'none';
            adminPassInput.style.borderColor = 'var(--glass-border)';
        }, 3000);
    }
}

// ===== RENDER =====
function renderAll() {
    renderTemplates();
    renderMapLink();
}

function renderTemplates() {
    const templates = getTemplates();
    // Sync both count spans
    templateCount.textContent = templates.length;
    const tc2 = $('template-count-2');
    if (tc2) tc2.textContent = templates.length;

    if (templates.length === 0) {
        templatesList.innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--text-muted); font-size:14px;">
                🚫 No templates yet. Add some above.
            </div>`;
        return;
    }

    templatesList.innerHTML = templates.map((t, i) => `
        <div class="template-item" id="tpl-${i}">
            <div class="template-text">"${escapeHTML(t)}"</div>
            <button class="template-delete" onclick="deleteTemplate(${i})">🗑️ Delete</button>
        </div>
    `).join('');
}

function renderMapLink() {
    const link = getMapLink();
    adminMapLink.value = link;
    const statusEl = $('map-link-status');
    if (statusEl) statusEl.textContent = link ? '✅ Set' : 'Not Set';
}

function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ===== ADD TEMPLATE =====
function addTemplate() {
    const text = adminBody.value.trim();
    if (!text) {
        showToast('⚠ Please write a review template first!', true);
        return;
    }
    const templates = getTemplates();
    templates.push(text);
    saveTemplates(templates);
    adminBody.value = '';
    renderTemplates();
    showToast('✅ Template added successfully!');
}

// ===== DELETE TEMPLATE =====
window.deleteTemplate = function(index) {
    const templates = getTemplates();
    if (index < 0 || index >= templates.length) return;

    if (!confirm(`Delete this review template?\n\n"${templates[index]}"`)) return;

    templates.splice(index, 1);
    saveTemplates(templates);
    renderTemplates();
    showToast('🗑️ Template deleted permanently.');
};

// ===== SAVE MAP LINK =====
function saveLink() {
    const link = adminMapLink.value.trim();
    if (!link) {
        showToast('⚠ Please enter a Google Maps link!', true);
        return;
    }
    // Validate it looks like a URL
    if (!link.startsWith('http')) {
        showToast('⚠ Link must start with http:// or https://', true);
        return;
    }
    saveMapLink(link);
    showToast('📍 Map link saved successfully!');
}

// ===== TEST MAP LINK =====
function testLink() {
    const link = getMapLink();
    if (!link) {
        showToast('⚠ No map link saved yet!', true);
        return;
    }
    window.open(link, '_blank');
}

// ===== EVENTS =====
function bindEvents() {
    btnLogin.addEventListener('click', handleLogin);
    adminPassInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });
    adminAddBtn.addEventListener('click', addTemplate);
    adminSaveLinkBtn.addEventListener('click', saveLink);
    $('admin-test-link-btn').addEventListener('click', testLink);
}

// ===== INIT =====
function init() {
    if (sessionStorage.getItem('admin_auth') === 'true') {
        loginScreen.classList.add('hidden');
        dashboard.classList.add('active');
        renderAll();
    }
    bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
