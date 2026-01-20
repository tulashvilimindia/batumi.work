/**
 * Batumi Jobs - Table Layout (jobs.ge style)
 */

const API_BASE = '/api/v1';
const LANG = window.location.pathname.startsWith('/en') ? 'en' : 'ge';
const ADJARA_LID = 14;  // jobs.ge region ID for Adjara

const T = {
    ge: {
        jobs: 'ვაკანსია',
        found: 'ნაპოვნია',
        noJobs: 'ვაკანსიები ვერ მოიძებნა',
        previous: 'წინა',
        next: 'შემდეგი',
        location: 'ადგილმდებარეობა',
        category: 'კატეგორია',
        published: 'გამოქვეყნდა',
        deadline: 'ბოლო ვადა',
        salary: 'ხელფასი',
        source: 'წყარო',
        viewOriginal: 'ორიგინალის ნახვა',
        share: 'გაზიარება',
        allCategories: 'ყველა კატეგორია',
    },
    en: {
        jobs: 'jobs',
        found: 'found',
        noJobs: 'No jobs found',
        previous: 'Previous',
        next: 'Next',
        location: 'Location',
        category: 'Category',
        published: 'Published',
        deadline: 'Deadline',
        salary: 'Salary',
        source: 'Source',
        viewOriginal: 'View Original',
        share: 'Share',
        allCategories: 'All Categories',
    }
};

const t = (key) => T[LANG][key] || T.ge[key] || key;

const state = {
    jobs: [],
    categories: [],
    filters: {
        q: '',
        category: '',
        page: 1,
        page_size: 30,
    },
    pagination: { total: 0, pages: 0 },
};

const $ = (sel) => document.querySelector(sel);

document.addEventListener('DOMContentLoaded', init);

async function init() {
    parseUrlParams();
    await loadCategories();
    populateFilters();
    await loadJobs();
    setupEventListeners();
}

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.filters.q = params.get('q') || '';
    state.filters.category = params.get('category') || '';
    state.filters.page = parseInt(params.get('page')) || 1;
}

function updateUrl() {
    const params = new URLSearchParams();
    if (state.filters.q) params.set('q', state.filters.q);
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.page > 1) params.set('page', state.filters.page);
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        state.categories = await res.json();
    } catch (e) {
        console.error('Failed to load categories:', e);
    }
}

function populateFilters() {
    const catSelect = $('#category-filter');
    if (catSelect) {
        catSelect.innerHTML = `<option value="">${t('allCategories')}</option>`;
        state.categories.forEach(cat => {
            const name = LANG === 'en' && cat.name_en ? cat.name_en : cat.name_ge;
            const selected = state.filters.category === cat.slug ? 'selected' : '';
            catSelect.innerHTML += `<option value="${cat.slug}" ${selected}>${name}</option>`;
        });
    }

    const searchInput = $('#search-input');
    if (searchInput) searchInput.value = state.filters.q;
}

async function loadJobs() {
    renderLoading();

    try {
        const params = new URLSearchParams();
        params.set('page', state.filters.page);
        params.set('page_size', state.filters.page_size);
        params.set('status', 'active');
        params.set('lid', ADJARA_LID);

        if (state.filters.q) params.set('q', state.filters.q);
        if (state.filters.category) params.set('category', state.filters.category);

        const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
        const data = await res.json();

        state.jobs = data.items;
        state.pagination = { total: data.total, pages: data.pages, page: data.page };

        renderJobs();
        renderPagination();
    } catch (e) {
        console.error('Failed to load jobs:', e);
        renderError();
    }
}

function renderLoading() {
    const container = $('#jobs-container');
    if (container) {
        container.innerHTML = `<tr><td colspan="4" class="loading-cell"><div class="spinner"></div></td></tr>`;
    }
}

function renderError() {
    const container = $('#jobs-container');
    if (container) {
        container.innerHTML = `<tr><td colspan="4" class="empty-state">${t('noJobs')}</td></tr>`;
    }
}

function renderJobs() {
    const container = $('#jobs-container');
    const countEl = $('#jobs-count');

    if (countEl) {
        countEl.textContent = `${state.pagination.total} ${t('jobs')} ${t('found')}`;
    }

    if (!container) return;

    if (state.jobs.length === 0) {
        container.innerHTML = `<tr><td colspan="4" class="empty-state">${t('noJobs')}</td></tr>`;
        return;
    }

    container.innerHTML = state.jobs.map(job => renderJobRow(job)).join('');
}

function renderJobRow(job) {
    const title = LANG === 'en' && job.title_en ? job.title_en : job.title_ge;
    const detailUrl = `/${LANG}/job.html?id=${job.id}`;
    const company = job.company_name || '';
    const published = job.published_at ? formatDateShort(job.published_at) : '';
    const deadline = job.deadline_at ? formatDateShort(job.deadline_at) : '';

    // Check if job is recent (within last 2 days)
    const isNew = job.published_at && isRecent(job.published_at, 2);

    let icons = '';
    if (isNew) icons += `<span class="job-icon new">NEW</span>`;
    if (job.has_salary) icons += `<span class="job-icon salary">₾</span>`;

    const vipClass = job.is_vip ? 'vip' : '';

    return `
        <tr>
            <td>
                <a href="${detailUrl}" class="job-title-link ${vipClass}">${escapeHtml(title)}</a>
                ${icons ? `<span class="job-icons">${icons}</span>` : ''}
            </td>
            <td class="job-company">${escapeHtml(company)}</td>
            <td class="job-date">${published}</td>
            <td class="job-date">${deadline}</td>
        </tr>
    `;
}

function renderPagination() {
    const container = $('#pagination');
    if (!container || state.pagination.pages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    const { page, pages } = state.pagination;
    let html = '';

    html += `<a href="#" class="pagination-link ${page === 1 ? 'disabled' : ''}" data-page="${page - 1}">${t('previous')}</a>`;

    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) {
        html += `<a href="#" class="pagination-link" data-page="1">1</a>`;
        if (start > 2) html += `<span>...</span>`;
    }

    for (let i = start; i <= end; i++) {
        html += `<a href="#" class="pagination-link ${i === page ? 'active' : ''}" data-page="${i}">${i}</a>`;
    }

    if (end < pages) {
        if (end < pages - 1) html += `<span>...</span>`;
        html += `<a href="#" class="pagination-link" data-page="${pages}">${pages}</a>`;
    }

    html += `<a href="#" class="pagination-link ${page === pages ? 'disabled' : ''}" data-page="${page + 1}">${t('next')}</a>`;

    container.innerHTML = html;
}

function setupEventListeners() {
    const searchForm = $('#search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            state.filters.q = $('#search-input').value;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    const catSelect = $('#category-filter');
    if (catSelect) {
        catSelect.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    const pagination = $('#pagination');
    if (pagination) {
        pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-link') && !e.target.classList.contains('disabled')) {
                e.preventDefault();
                state.filters.page = parseInt(e.target.dataset.page);
                updateUrl();
                loadJobs();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// Utility functions
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = LANG === 'ge'
        ? ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day < 10 ? '0' + day : day} ${months[date.getMonth()]}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(LANG === 'ge' ? 'ka-GE' : 'en-US', options);
}

function isRecent(dateString, days) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    return diff <= days;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Job Detail Page
async function loadJobDetail(jobId) {
    try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!res.ok) throw new Error('Not found');
        const job = await res.json();
        renderJobDetail(job);
    } catch (e) {
        console.error('Failed to load job:', e);
        renderJobDetailError();
    }
}

function renderJobDetail(job) {
    const container = $('#job-detail');
    if (!container) return;

    const title = LANG === 'en' && job.title_en ? job.title_en : job.title_ge;
    const body = LANG === 'en' && job.body_en ? job.body_en : job.body_ge;
    const categoryName = job.category ? (LANG === 'en' && job.category.name_en ? job.category.name_en : job.category.name_ge) : '';

    document.title = `${title} | Batumi Jobs`;

    let badges = '';
    if (job.is_vip) badges += `<span class="badge badge-vip">VIP</span>`;
    if (job.has_salary) badges += `<span class="badge badge-salary">${t('salary')}</span>`;

    let salary = '';
    if (job.has_salary && job.salary_min) {
        const currency = job.salary_currency || 'GEL';
        salary = job.salary_max && job.salary_max !== job.salary_min
            ? `${job.salary_min} - ${job.salary_max} ${currency}`
            : `${job.salary_min} ${currency}`;
    }

    container.innerHTML = `
        <div class="job-detail-header">
            ${badges ? `<div class="job-badges mb-2">${badges}</div>` : ''}
            <h1 class="job-detail-title">${escapeHtml(title)}</h1>
            ${job.company_name ? `<div class="job-detail-company">${escapeHtml(job.company_name)}</div>` : ''}
            <div class="job-detail-meta">
                ${job.location ? `<div class="job-detail-meta-item"><span class="job-detail-meta-label">${t('location')}</span><span class="job-detail-meta-value">${escapeHtml(job.location)}</span></div>` : ''}
                ${categoryName ? `<div class="job-detail-meta-item"><span class="job-detail-meta-label">${t('category')}</span><span class="job-detail-meta-value">${escapeHtml(categoryName)}</span></div>` : ''}
                ${job.published_at ? `<div class="job-detail-meta-item"><span class="job-detail-meta-label">${t('published')}</span><span class="job-detail-meta-value">${formatDate(job.published_at)}</span></div>` : ''}
                ${job.deadline_at ? `<div class="job-detail-meta-item"><span class="job-detail-meta-label">${t('deadline')}</span><span class="job-detail-meta-value">${formatDate(job.deadline_at)}</span></div>` : ''}
                ${salary ? `<div class="job-detail-meta-item"><span class="job-detail-meta-label">${t('salary')}</span><span class="job-detail-meta-value job-salary">${salary}</span></div>` : ''}
            </div>
        </div>
        <div class="job-body">${formatJobBody(body)}</div>
        <div class="job-source">
            <strong>${t('source')}:</strong> ${job.parsed_from || 'manual'}
            ${job.source_url ? `<br><a href="${escapeHtml(job.source_url)}" target="_blank" rel="noopener">${t('viewOriginal')} ↗</a>` : ''}
        </div>
        <div class="share-buttons">
            <span class="share-label">${t('share')}:</span>
            <button class="share-btn share-fb" onclick="shareOn('facebook')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></button>
            <button class="share-btn share-tg" onclick="shareOn('telegram')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.2 4.4L2.9 11.3c-1.2.5-1.1 1.7.1 2l4.6 1.4 1.8 5.5c.2.6.9.7 1.3.3l2.6-2.1 5.1 3.8c.9.7 2.1.1 2.3-1l3.2-15.5c.3-1.2-.9-2.2-2.1-1.8z"/></svg></button>
            <button class="share-btn share-wa" onclick="shareOn('whatsapp')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2-1c-.3-.1-.6 0-.8.2l-.5.6c-.2.2-.5.3-.8.1-1-.4-2.3-1.4-3.2-2.5-.2-.3-.2-.6 0-.8l.4-.6c.2-.2.2-.5.1-.8l-1-2c-.2-.4-.6-.5-1-.4-1 .4-1.8 1.4-1.7 2.5.1 2.1 1.4 5 4.4 7.2 2.7 2 5.4 2.4 7.1 2 1.1-.3 1.9-1.3 2-2.4.1-.4-.2-.8-.6-.9l-.4-.2zM12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2z"/></svg></button>
            <button class="share-btn share-copy" onclick="copyLink()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        </div>
    `;
}

function formatJobBody(text) {
    if (!text) return '';
    return text.split(/\n\n+/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function renderJobDetailError() {
    const container = $('#job-detail');
    if (container) {
        container.innerHTML = `<div class="empty-state"><h3>${t('noJobs')}</h3><a href="/${LANG}/">← Back</a></div>`;
    }
}

// Share functions
function shareOn(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch(platform) {
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        case 'telegram': shareUrl = `https://t.me/share/url?url=${url}&text=${title}`; break;
        case 'whatsapp': shareUrl = `https://wa.me/?text=${title}%20${url}`; break;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.share-copy');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
    });
}

// Initialize job detail page
if (window.location.pathname.includes('job.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('id');
        if (jobId) loadJobDetail(jobId);
        else renderJobDetailError();
    });
}

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(e => console.error('SW error:', e));
    });
}
