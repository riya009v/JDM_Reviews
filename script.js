// ===== USER PAGE SCRIPT =====
// Reviews are loaded from reviews.js (REVIEWS array)

const MAP_LINK = 'https://www.google.com/maps/place/JDM+Travels/@22.9725594,52.9807226,5z/data=!4m12!1m2!2m1!1sjdm+travels!3m8!1s0x395e9b5104e72c95:0xece6b78576b38a8!8m2!3d22.9725594!4d72.4924413!9m1!1b1!15sCgtqZG0gdHJhdmVsc5IBE2Nhcl9sZWFzaW5nX3NlcnZpY2XgAQA!16s%2Fg%2F11njmddj0d?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D';
const USED_KEY = 'jdm_used_reviews'; // Tracks which reviews this device has already used

// ===== DOM =====
const $ = id => document.getElementById(id);
const userReviewText = $('user-review-text');
const btnCopyPost = $('btn-copy-post');
const toast = $('toast');
const toastMsg = $('toast-message');

let currentReviewIndex = -1;
let currentReviewText = "";

// ===== HELPERS =====
function getUsedIndices() {
    try {
        return JSON.parse(localStorage.getItem(USED_KEY)) || [];
    } catch (e) { return []; }
}

function markAsUsed(index) {
    const used = getUsedIndices();
    if (!used.includes(index)) {
        used.push(index);
        localStorage.setItem(USED_KEY, JSON.stringify(used));
    }
}

function getAvailableReviews() {
    const used = getUsedIndices();
    return REVIEWS
        .map((text, idx) => ({ text, idx }))
        .filter(r => !used.includes(r.idx));
}

// ===== INIT =====
function init() {
    loadAndShowReview();
    bindEvents();
}

// ===== LOAD REVIEW =====
function loadAndShowReview() {
    const available = getAvailableReviews();

    if (available.length === 0) {
        showEmptyError();
        return;
    }

    // Pick a random one from available
    const picked = available[Math.floor(Math.random() * available.length)];
    currentReviewIndex = picked.idx;
    currentReviewText = picked.text;
    userReviewText.textContent = `"${currentReviewText}"`;
    btnCopyPost.style.display = 'flex';
}

function showEmptyError() {
    currentReviewText = "";
    currentReviewIndex = -1;
    btnCopyPost.style.display = 'none';
    userReviewText.innerHTML = `
        <div style="text-align:center; padding:10px;">
            <div style="font-size:48px; margin-bottom:12px;">🚫</div>
            <div style="font-size:18px; font-weight:700; color:var(--red); margin-bottom:8px;">All Reviews Used!</div>
            <div style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
                You have used all available review templates on this device.<br>
                Thank you for your support of <strong>JDM Travels</strong>!
            </div>
        </div>
    `;
}

// ===== COPY & POST =====
function copyAndPost() {
    if (!currentReviewText || currentReviewIndex === -1) return;

    // Mark this review as used BEFORE copy so double-click doesn't reuse
    const indexToMark = currentReviewIndex;
    const textToPost = currentReviewText;
    currentReviewText = "";
    currentReviewIndex = -1;

    markAsUsed(indexToMark);

    // Copy to clipboard
    navigator.clipboard.writeText(textToPost).then(() => {
        showToast("Copied! Opening Google Maps... 📋");
        setTimeout(() => {
            window.open(MAP_LINK, '_blank');
            loadAndShowReview();
        }, 1500);
    }).catch(() => {
        // Fallback: show text to copy manually
        showToast("Please copy the review text manually.");
        setTimeout(() => {
            window.open(MAP_LINK, '_blank');
            loadAndShowReview();
        }, 2000);
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
