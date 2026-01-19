/**
 * Georgia JobBoard - Main JavaScript
 * Vanilla JS, no frameworks, SEO-friendly
 */

// API Base URL
const API_BASE = '/api/v1';

// Current language (from URL path)
const LANG = window.location.pathname.startsWith('/en') ? 'en' : 'ge';

// Translations
const T = {
    ge: {
        search: 'ძიება',
        searchPlaceholder: 'თანამდებობა, კომპანია...',
        allCategories: 'ყველა კატეგორია',
        allRegions: 'ყველა რეგიონი',
        hasSalary: 'ხელფასით',
        vipOnly: 'VIP',
        jobs: 'ვაკანსია',
        jobsFound: 'ნაპოვნია',
        noJobs: 'ვაკანსიები ვერ მოიძებნა',
        tryAgain: 'სცადეთ სხვა ფილტრები',
        loading: 'იტვირთება...',
        previous: 'წინა',
        next: 'შემდეგი',
        page: 'გვერდი',
        of: '-დან',
        company: 'კომპანია',
        location: 'ადგილმდებარეობა',
        category: 'კატეგორია',
        published: 'გამოქვეყნდა',
        deadline: 'დედლაინი',
        salary: 'ხელფასი',
        source: 'წყარო',
        viewOriginal: 'ორიგინალის ნახვა',
        remote: 'დისტანციური',
        hybrid: 'ჰიბრიდული',
        onsite: 'ოფისში',
        perMonth: '/თვეში',
        gel: 'ლარი',
        applyNow: 'გაგზავნა',
        shareJob: 'გაზიარება',
    },
    en: {
        search: 'Search',
        searchPlaceholder: 'Job title, company...',
        allCategories: 'All Categories',
        allRegions: 'All Regions',
        hasSalary: 'With Salary',
        vipOnly: 'VIP Only',
        jobs: 'jobs',
        jobsFound: 'found',
        noJobs: 'No jobs found',
        tryAgain: 'Try different filters',
        loading: 'Loading...',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        company: 'Company',
        location: 'Location',
        category: 'Category',
        published: 'Published',
        deadline: 'Deadline',
        salary: 'Salary',
        source: 'Source',
        viewOriginal: 'View Original',
        remote: 'Remote',
        hybrid: 'Hybrid',
        onsite: 'On-site',
        perMonth: '/month',
        gel: 'GEL',
        applyNow: 'Apply Now',
        shareJob: 'Share',
    }
};

const t = (key) => T[LANG][key] || T.ge[key] || key;

// State management
const state = {
    jobs: [],
    categories: [],
    regions: [],
    filters: {
        q: '',
        category: '',
        region: '',
        has_salary: null,
        is_vip: null,
        page: 1,
        page_size: 20,
    },
    pagination: {
        total: 0,
        pages: 0,
    },
    loading: false,
};

// DOM Elements
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize app
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Parse URL params
    parseUrlParams();

    // Load categories and regions
    await Promise.all([
        loadCategories(),
        loadRegions(),
    ]);

    // Populate filter dropdowns
    populateFilters();

    // Load jobs
    await loadJobs();

    // Setup event listeners
    setupEventListeners();
}

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.filters.q = params.get('q') || '';
    state.filters.category = params.get('category') || '';
    state.filters.region = params.get('region') || '';
    state.filters.has_salary = params.get('has_salary') === 'true' ? true : null;
    state.filters.is_vip = params.get('is_vip') === 'true' ? true : null;
    state.filters.page = parseInt(params.get('page')) || 1;
}

function updateUrl() {
    const params = new URLSearchParams();
    if (state.filters.q) params.set('q', state.filters.q);
    if (state.filters.category) params.set('category', state.filters.category);
    if (state.filters.region) params.set('region', state.filters.region);
    if (state.filters.has_salary) params.set('has_salary', 'true');
    if (state.filters.is_vip) params.set('is_vip', 'true');
    if (state.filters.page > 1) params.set('page', state.filters.page);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        state.categories = await response.json();
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadRegions() {
    try {
        const response = await fetch(`${API_BASE}/regions`);
        state.regions = await response.json();
    } catch (error) {
        console.error('Failed to load regions:', error);
    }
}

function populateFilters() {
    // Populate category dropdown
    const categorySelect = $('#category-filter');
    if (categorySelect) {
        categorySelect.innerHTML = `<option value="">${t('allCategories')}</option>`;
        state.categories.forEach(cat => {
            const name = LANG === 'en' && cat.name_en ? cat.name_en : cat.name_ge;
            const selected = state.filters.category === cat.slug ? 'selected' : '';
            categorySelect.innerHTML += `<option value="${cat.slug}" ${selected}>${name}</option>`;
        });
    }

    // Populate region dropdown (only cities - level 3)
    const regionSelect = $('#region-filter');
    if (regionSelect) {
        regionSelect.innerHTML = `<option value="">${t('allRegions')}</option>`;
        state.regions.filter(r => r.level >= 2).forEach(reg => {
            const name = LANG === 'en' && reg.name_en ? reg.name_en : reg.name_ge;
            const selected = state.filters.region === reg.slug ? 'selected' : '';
            const prefix = reg.level === 3 ? '  ' : '';
            regionSelect.innerHTML += `<option value="${reg.slug}" ${selected}>${prefix}${name}</option>`;
        });
    }

    // Set search input
    const searchInput = $('#search-input');
    if (searchInput) {
        searchInput.value = state.filters.q;
    }

    // Set toggle states
    const salaryToggle = $('#salary-toggle');
    if (salaryToggle && state.filters.has_salary) {
        salaryToggle.classList.add('active');
    }

    const vipToggle = $('#vip-toggle');
    if (vipToggle && state.filters.is_vip) {
        vipToggle.classList.add('active');
    }
}

async function loadJobs() {
    state.loading = true;
    renderLoading();

    try {
        const params = new URLSearchParams();
        params.set('page', state.filters.page);
        params.set('page_size', state.filters.page_size);
        params.set('status', 'active');

        if (state.filters.q) params.set('q', state.filters.q);
        if (state.filters.category) params.set('category', state.filters.category);
        if (state.filters.region) params.set('region', state.filters.region);
        if (state.filters.has_salary) params.set('has_salary', 'true');
        if (state.filters.is_vip) params.set('is_vip', 'true');

        const response = await fetch(`${API_BASE}/jobs?${params.toString()}`);
        const data = await response.json();

        state.jobs = data.items;
        state.pagination = {
            total: data.total,
            pages: data.pages,
            page: data.page,
        };

        renderJobs();
        renderPagination();
    } catch (error) {
        console.error('Failed to load jobs:', error);
        renderError();
    } finally {
        state.loading = false;
    }
}

function renderLoading() {
    const container = $('#jobs-container');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    }
}

function renderError() {
    const container = $('#jobs-container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>${t('noJobs')}</h3>
                <p>${t('tryAgain')}</p>
            </div>
        `;
    }
}

function renderJobs() {
    const container = $('#jobs-container');
    const countEl = $('#jobs-count');

    if (countEl) {
        countEl.textContent = `${state.pagination.total} ${t('jobs')} ${t('jobsFound')}`;
    }

    if (!container) return;

    if (state.jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>${t('noJobs')}</h3>
                <p>${t('tryAgain')}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.jobs.map(job => renderJobCard(job)).join('');
}

function renderJobCard(job) {
    const title = LANG === 'en' && job.title_en ? job.title_en : job.title_ge;
    const categoryName = job.category ? (LANG === 'en' && job.category.name_en ? job.category.name_en : job.category.name_ge) : '';
    const regionName = job.region ? (LANG === 'en' && job.region.name_en ? job.region.name_en : job.region.name_ge) : job.location;
    const detailUrl = `/${LANG}/job.html?id=${job.id}`;

    let badges = '';
    if (job.is_vip) badges += `<span class="badge badge-vip">VIP</span>`;
    if (job.has_salary) badges += `<span class="badge badge-salary">${t('salary')}</span>`;
    if (job.remote_type === 'remote') badges += `<span class="badge badge-remote">${t('remote')}</span>`;
    if (job.remote_type === 'hybrid') badges += `<span class="badge badge-remote">${t('hybrid')}</span>`;

    let salary = '';
    if (job.has_salary && job.salary_min) {
        const currency = job.salary_currency || 'GEL';
        if (job.salary_max && job.salary_max !== job.salary_min) {
            salary = `${job.salary_min} - ${job.salary_max} ${currency}`;
        } else {
            salary = `${job.salary_min} ${currency}`;
        }
    }

    const publishedDate = job.published_at ? formatDate(job.published_at) : '';
    const deadlineDate = job.deadline_at ? formatDate(job.deadline_at) : '';

    return `
        <article class="job-card ${job.is_vip ? 'vip' : ''}">
            <div class="job-card-header">
                <h3 class="job-title">
                    <a href="${detailUrl}">${escapeHtml(title)}</a>
                </h3>
                <div class="job-badges">${badges}</div>
            </div>
            <div class="job-meta">
                ${job.company_name ? `<span class="job-meta-item"><strong>${escapeHtml(job.company_name)}</strong></span>` : ''}
                ${regionName ? `<span class="job-meta-item">📍 ${escapeHtml(regionName)}</span>` : ''}
                ${categoryName ? `<span class="job-meta-item">📁 ${escapeHtml(categoryName)}</span>` : ''}
            </div>
            <div class="job-footer">
                <div>
                    ${salary ? `<span class="job-salary">${salary}</span>` : ''}
                </div>
                <div class="job-date">
                    ${publishedDate ? `${t('published')}: ${publishedDate}` : ''}
                    ${deadlineDate ? ` | ${t('deadline')}: ${deadlineDate}` : ''}
                </div>
            </div>
        </article>
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

    // Previous button
    html += `<a href="#" class="pagination-link ${page === 1 ? 'disabled' : ''}" data-page="${page - 1}">${t('previous')}</a>`;

    // Page numbers
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

    // Next button
    html += `<a href="#" class="pagination-link ${page === pages ? 'disabled' : ''}" data-page="${page + 1}">${t('next')}</a>`;

    container.innerHTML = html;
}

function setupEventListeners() {
    // Search form
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

    // Category filter
    const categorySelect = $('#category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    // Region filter
    const regionSelect = $('#region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            state.filters.region = e.target.value;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    // Salary toggle
    const salaryToggle = $('#salary-toggle');
    if (salaryToggle) {
        salaryToggle.addEventListener('click', () => {
            salaryToggle.classList.toggle('active');
            state.filters.has_salary = salaryToggle.classList.contains('active') ? true : null;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    // VIP toggle
    const vipToggle = $('#vip-toggle');
    if (vipToggle) {
        vipToggle.addEventListener('click', () => {
            vipToggle.classList.toggle('active');
            state.filters.is_vip = vipToggle.classList.contains('active') ? true : null;
            state.filters.page = 1;
            updateUrl();
            loadJobs();
        });
    }

    // Pagination
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
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(LANG === 'ge' ? 'ka-GE' : 'en-US', options);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Job Detail Page functions
async function loadJobDetail(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!response.ok) throw new Error('Job not found');
        const job = await response.json();
        renderJobDetail(job);
    } catch (error) {
        console.error('Failed to load job:', error);
        renderJobDetailError();
    }
}

function renderJobDetail(job) {
    const container = $('#job-detail');
    if (!container) return;

    const title = LANG === 'en' && job.title_en ? job.title_en : job.title_ge;
    const body = LANG === 'en' && job.body_en ? job.body_en : job.body_ge;
    const categoryName = job.category ? (LANG === 'en' && job.category.name_en ? job.category.name_en : job.category.name_ge) : '';

    // Update page title
    document.title = `${title} | Georgia JobBoard`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = body.substring(0, 160) + '...';
    }

    let badges = '';
    if (job.is_vip) badges += `<span class="badge badge-vip">VIP</span>`;
    if (job.has_salary) badges += `<span class="badge badge-salary">${t('salary')}</span>`;
    if (job.remote_type !== 'onsite') badges += `<span class="badge badge-remote">${t(job.remote_type)}</span>`;

    let salary = '';
    if (job.has_salary && job.salary_min) {
        const currency = job.salary_currency || 'GEL';
        if (job.salary_max && job.salary_max !== job.salary_min) {
            salary = `${job.salary_min} - ${job.salary_max} ${currency}${t('perMonth')}`;
        } else {
            salary = `${job.salary_min} ${currency}${t('perMonth')}`;
        }
    }

    container.innerHTML = `
        <div class="job-detail-header">
            <div class="job-badges mb-2">${badges}</div>
            <h1 class="job-detail-title">${escapeHtml(title)}</h1>
            ${job.company_name ? `<div class="job-detail-company">${escapeHtml(job.company_name)}</div>` : ''}
            <div class="job-detail-meta">
                ${job.location ? `
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${t('location')}</span>
                    <span class="job-detail-meta-value">${escapeHtml(job.location)}</span>
                </div>
                ` : ''}
                ${categoryName ? `
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${t('category')}</span>
                    <span class="job-detail-meta-value">${escapeHtml(categoryName)}</span>
                </div>
                ` : ''}
                ${job.published_at ? `
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${t('published')}</span>
                    <span class="job-detail-meta-value">${formatDate(job.published_at)}</span>
                </div>
                ` : ''}
                ${job.deadline_at ? `
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${t('deadline')}</span>
                    <span class="job-detail-meta-value">${formatDate(job.deadline_at)}</span>
                </div>
                ` : ''}
                ${salary ? `
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${t('salary')}</span>
                    <span class="job-detail-meta-value job-salary">${salary}</span>
                </div>
                ` : ''}
            </div>
        </div>
        <div class="job-body">
            ${formatJobBody(body)}
        </div>
        <div class="job-source">
            <strong>${t('source')}:</strong> ${job.parsed_from || 'manual'}
            ${job.source_url ? `<br><a href="${escapeHtml(job.source_url)}" target="_blank" rel="noopener">${t('viewOriginal')} ↗</a>` : ''}
        </div>
    `;
}

function formatJobBody(text) {
    if (!text) return '';
    // Convert newlines to <br> and preserve paragraphs
    return text
        .split(/\n\n+/)
        .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function renderJobDetailError() {
    const container = $('#job-detail');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>${t('noJobs')}</h3>
                <a href="/${LANG}/" class="btn btn-primary">← Back to Jobs</a>
            </div>
        `;
    }
}

// Initialize job detail page if on job.html
if (window.location.pathname.includes('job.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('id');
        if (jobId) {
            loadJobDetail(jobId);
        } else {
            renderJobDetailError();
        }
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[App] Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            console.log('[App] New version available');
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[App] Service Worker registration failed:', error);
            });
    });
}
