// ===== USER PAGE SCRIPT =====

const DEFAULT_TEMPLATES = [
    "I had a fantastic experience here! The service was incredibly professional and the staff went out of their way to make sure everything was perfect. Highly recommended to anyone looking for top-notch quality.",
    "Really great place and excellent service. They were very attentive to my needs and everything was handled smoothly. I will definitely be coming back again.",
    "Outstanding in every way. From the moment I walked in, I felt welcomed. The quality of work exceeded all my expectations. Five stars all the way!",
    "Very satisfied with my visit. The team was knowledgeable, polite, and very efficient. It's hard to find such good service these days. Keep up the great work!"
];

const STORAGE_KEY = 'review_templates';
const MAP_KEY = 'review_map_link';

// ===== DOM =====
const $ = id => document.getElementById(id);
const userReviewText = $('user-review-text');
const btnCopyPost = $('btn-copy-post');
const toast = $('toast');
const toastMsg = $('toast-message');

let currentIndex = -1;
let currentReviewText = "";

// ===== INIT =====
function init() {
    // Populate defaults only on first-ever load
    if (localStorage.getItem(STORAGE_KEY) === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    }
    loadAndShowReview();
    bindEvents();
}

// ===== LOAD REVIEW =====
function loadAndShowReview() {
    const templates = getTemplates();

    if (templates.length === 0) {
        showEmptyError();
        return;
    }

    // Pick a random index
    currentIndex = Math.floor(Math.random() * templates.length);
    currentReviewText = templates[currentIndex];
    userReviewText.textContent = `"${currentReviewText}"`;
    btnCopyPost.style.display = 'flex';
}

function getTemplates() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function showEmptyError() {
    currentReviewText = "";
    currentIndex = -1;
    btnCopyPost.style.display = 'none';
    userReviewText.innerHTML = `
        <div style="text-align:center; padding:10px;">
            <div style="font-size:48px; margin-bottom:12px;">🚫</div>
            <div style="font-size:18px; font-weight:700; color:var(--red); margin-bottom:8px;">All Reviews Used!</div>
            <div style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
                All available review templates have been used up.<br>
                Please contact the <strong>Admin</strong> to add more templates.
            </div>
        </div>
    `;
}

// ===== COPY & POST =====
function copyAndPost() {
    if (!currentReviewText || currentIndex === -1) return;

    // Re-check templates are still valid (in case of tab switch)
    const templates = getTemplates();
    if (templates.length === 0) { showEmptyError(); return; }

    // Delete this review from storage so it is NEVER shown again
    templates.splice(currentIndex, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));

    // Reset state immediately to prevent double-delete
    const textToPost = currentReviewText;
    currentReviewText = "";
    currentIndex = -1;

    // Copy text to clipboard
    navigator.clipboard.writeText(textToPost).then(() => {
        showToast("Copied! Opening Google Maps... 📋");

        const mapLink = localStorage.getItem(MAP_KEY) || 'https://maps.google.com/';

        // Open Google Maps after 1.5s
        setTimeout(() => {
            window.open(mapLink, '_blank');
            // Update UI to next review after redirect
            loadAndShowReview();
        }, 1500);

    }).catch(() => {
        showToast("Copy failed. Please copy text manually.");
        // Still open maps
        const mapLink = localStorage.getItem(MAP_KEY) || 'https://maps.google.com/';
        setTimeout(() => { window.open(mapLink, '_blank'); }, 1500);
        loadAndShowReview();
    });
}

// ===== TOAST =====
function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== EVENTS =====
function bindEvents() {
    btnCopyPost.addEventListener('click', copyAndPost);
}

document.addEventListener('DOMContentLoaded', init);
