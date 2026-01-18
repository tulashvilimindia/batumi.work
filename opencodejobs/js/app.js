// Batumi.work - Job Board Application
// Static site with client-side filtering and bilingual support

class JobBoard {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.currentLang = this.detectLanguage();
        this.filters = {
            search: '',
            categories: new Set(),
            company: '',
            sort: 'newest',
            hasSalary: false,
            vipOnly: false
        };
        this.init();
    }

    detectLanguage() {
        const saved = localStorage.getItem('batumi-lang');
        if (saved) return saved;
        
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('ka') ? 'ge' : 'en';
    }

    async init() {
        this.showLoading(true);
        await this.loadJobs();
        this.setupEventListeners();
        this.renderCompanies();
        this.applyFilters();
        this.updateLanguageUI();
        this.showLoading(false);
    }

    async loadJobs() {
        try {
            const response = await fetch('data/all_active_adjara_20260118_204057.json');
            const data = await response.json();
            this.jobs = data.jobs || [];
            
            // Enrich jobs with category
            this.jobs = this.jobs.map(job => ({
                ...job,
                category: this.classifyJob(job)
            }));
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.showError();
        }
    }

    classifyJob(job) {
        const titleEn = (job.title_en || '').toLowerCase();
        const titleGe = (job.title_ge || '');
        const bodyEn = (job.body_en || '').toLowerCase();
        
        const categories = {
            'IT/Programming': ['developer', 'programmer', 'software', 'engineer', 'devops', 'frontend', 'backend', 'web', 'mobile', 'data scientist', 'qa', 'tester', 'it', 'tech', 'python', 'java', 'javascript', 'react'],
            'Sales/Procurement': ['sales', 'seller', 'procurement', 'buyer', 'purchasing', 'business development', 'account manager', 'retail', 'cashier', 'consultant', 'preseller'],
            'Administration/Management': ['manager', 'director', 'administrator', 'supervisor', 'coordinator', 'executive', 'head of', 'chief', 'ceo', 'lead', 'team lead'],
            'Finance/Statistics': ['finance', 'accountant', 'accounting', 'auditor', 'financial', 'banker', 'bank', 'credit', 'economist', 'statistics', 'analyst'],
            'PR/Marketing': ['marketing', 'pr', 'public relations', 'brand', 'advertising', 'seo', 'smm', 'content', 'copywriter', 'social media'],
            'Food/Hospitality': ['cook', 'chef', 'waiter', 'bartender', 'restaurant', 'kitchen', 'hotel', 'hospitality', 'barista', 'food', 'cafe'],
            'Construction/Repair': ['construction', 'builder', 'architect', 'electrician', 'plumber', 'carpenter', 'repair'],
            'Education': ['teacher', 'instructor', 'tutor', 'professor', 'trainer', 'education', 'lecturer'],
            'Logistics/Transport': ['logistics', 'driver', 'delivery', 'transport', 'warehouse', 'shipping', 'courier'],
            'Medicine/Pharmacy': ['doctor', 'nurse', 'medical', 'pharmacy', 'pharmacist', 'healthcare', 'clinic'],
            'Security/Safety': ['security', 'guard', 'safety', 'officer', 'protection'],
            'Media/Publishing': ['journalist', 'editor', 'writer', 'media', 'publisher'],
            'Beauty/Fashion': ['stylist', 'hairdresser', 'beauty', 'cosmetic', 'makeup', 'fashion', 'nail'],
            'Law': ['lawyer', 'legal', 'attorney', 'jurist', 'notary'],
            'Cleaning': ['cleaner', 'cleaning', 'housekeeper'],
            'Technical Staff': ['technician', 'mechanic', 'operator', 'maintenance']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (titleEn.includes(keyword) || bodyEn.includes(keyword)) {
                    return category;
                }
            }
        }

        return 'Other';
    }

    setupEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Sort select
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });

        // Category checkboxes
        const categoryCheckboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.categories = new Set(
                    Array.from(categoryCheckboxes)
                        .filter(cb => cb.checked)
                        .map(cb => cb.value)
                );
                this.applyFilters();
            });
        });

        // Company select
        document.getElementById('companySelect').addEventListener('change', (e) => {
            this.filters.company = e.target.value;
            this.applyFilters();
        });

        // Salary filter
        document.getElementById('salaryFilter').addEventListener('change', (e) => {
            this.filters.hasSalary = e.target.checked;
            this.applyFilters();
        });

        // VIP filter
        document.getElementById('vipFilter').addEventListener('change', (e) => {
            this.filters.vipOnly = e.target.checked;
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('resetFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Language toggle
        document.querySelector('.lang-toggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Filter toggle (mobile)
        document.querySelector('.filter-toggle').addEventListener('click', () => {
            document.querySelector('.filters').classList.add('active');
        });

        document.getElementById('closeFilters').addEventListener('click', () => {
            document.querySelector('.filters').classList.remove('active');
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    clearFilters() {
        this.filters = {
            search: '',
            categories: new Set(),
            company: '',
            sort: 'newest',
            hasSalary: false,
            vipOnly: false
        };

        // Reset UI
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value = 'newest';
        document.getElementById('companySelect').value = '';
        document.getElementById('salaryFilter').checked = false;
        document.getElementById('vipFilter').checked = false;

        const categoryCheckboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
        categoryCheckboxes.forEach(cb => cb.checked = false);

        this.applyFilters();
    }

    applyFilters() {
        this.filteredJobs = this.jobs.filter(job => {
            // Search filter
            if (this.filters.search) {
                const searchEn = (job.title_en || '').toLowerCase();
                const searchGe = (job.title_ge || '');
                const company = (job.company || '').toLowerCase();
                
                if (!searchEn.includes(this.filters.search) && 
                    !searchGe.includes(this.filters.search) && 
                    !company.includes(this.filters.search)) {
                    return false;
                }
            }

            // Category filter
            if (this.filters.categories.size > 0) {
                if (!this.filters.categories.has(job.category)) {
                    return false;
                }
            }

            // Company filter
            if (this.filters.company) {
                if (job.company !== this.filters.company) {
                    return false;
                }
            }

            // Salary filter
            if (this.filters.hasSalary) {
                if (!job.has_salary) {
                    return false;
                }
            }

            // VIP filter
            if (this.filters.vipOnly) {
                if (!job.is_vip) {
                    return false;
                }
            }

            return true;
        });

        // Sort
        this.sortJobs();
        this.renderJobs();
    }

    sortJobs() {
        switch (this.filters.sort) {
            case 'newest':
                this.filteredJobs.sort((a, b) => 
                    new Date(b.first_seen_at) - new Date(a.first_seen_at)
                );
                break;
            case 'oldest':
                this.filteredJobs.sort((a, b) => 
                    new Date(a.first_seen_at) - new Date(b.first_seen_at)
                );
                break;
            case 'company':
                this.filteredJobs.sort((a, b) => 
                    (a.company || '').localeCompare(b.company || '')
                );
                break;
        }
    }

    renderCompanies() {
        const companies = [...new Set(this.jobs.map(job => job.company).filter(c => c))].sort();
        const select = document.getElementById('companySelect');
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            select.appendChild(option);
        });
    }

    renderJobs() {
        const grid = document.getElementById('jobsGrid');
        const noResults = document.getElementById('noResults');
        const countEl = document.getElementById('jobCount');
        
        countEl.textContent = this.filteredJobs.length;

        if (this.filteredJobs.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = this.filteredJobs.map(job => this.createJobCard(job)).join('');
    }

    createJobCard(job) {
        const title = this.currentLang === 'en' ? job.title_en : job.title_ge;
        const company = job.company || 'Not specified';
        const isNew = this.isNewJob(job.first_seen_at);
        const hasSalary = job.has_salary;
        const isVip = job.is_vip;
        
        return `
            <article class="job-card" data-job-id="${job.id}">
                <div class="job-card-header">
                    <div class="job-card-badges">
                        ${isVip ? '<span class="badge vip">VIP</span>' : ''}
                        ${isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${hasSalary ? '<span class="badge salary">$</span>' : ''}
                    </div>
                </div>
                <h3 class="job-title">${this.escapeHtml(title)}</h3>
                <div class="job-company">
                    ${this.escapeHtml(company)}
                </div>
                <button class="view-details" data-job-id="${job.id}">
                    ${this.getText('viewDetails')}
                </button>
            </article>
        `;
    }

    isNewJob(firstSeenAt) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(firstSeenAt) > sevenDaysAgo;
    }

    showJobDetail(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = document.getElementById('jobModal');
        const modalBody = document.getElementById('modalBody');
        const applyBtn = document.getElementById('applyBtn');

        const title = this.currentLang === 'en' ? job.title_en : job.title_ge;
        const company = job.company || 'Not specified';
        const body = this.currentLang === 'en' ? (job.body_en || '') : (job.body_ge || '');
        const url = this.currentLang === 'en' ? job.url_en : job.url_ge;
        const deadline = this.currentLang === 'en' ? job.deadline_en : job.deadline_ge;

        modalBody.innerHTML = `
            <h2 class="job-detail-title">${this.escapeHtml(title)}</h2>
            <div class="job-detail-company">${this.escapeHtml(company)}</div>
            
            <div class="job-detail-meta">
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${this.getText('category')}</span>
                    <span class="job-detail-meta-value">${job.category}</span>
                </div>
                <div class="job-detail-meta-item">
                    <span class="job-detail-meta-label">${this.getText('deadline')}</span>
                    <span class="job-detail-meta-value">${this.escapeHtml(deadline)}</span>
                </div>
            </div>

            <div class="job-detail-section">
                <h3>${this.getText('description')}</h3>
                <p>${this.escapeHtml(body)}</p>
            </div>
        `;

        applyBtn.href = url;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('jobModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'ge' : 'en';
        localStorage.setItem('batumi-lang', this.currentLang);
        this.updateLanguageUI();
        this.renderJobs();
    }

    updateLanguageUI() {
        const langBtn = document.querySelector('.lang-toggle');
        langBtn.textContent = this.currentLang.toUpperCase();

        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(el => {
            const key = this.currentLang === 'en' ? 'en' : 'ge';
            el.textContent = el.dataset[key];
        });

        // Update placeholders
        document.querySelectorAll('[data-placeholder-en]').forEach(el => {
            const key = this.currentLang === 'en' ? 'placeholderEn' : 'placeholderGe';
            el.placeholder = el.dataset[key];
        });
    }

    getText(key) {
        const translations = {
            viewDetails: { en: 'View Details', ge: 'დეტალების ნახვა' },
            category: { en: 'Category', ge: 'კატეგორია' },
            deadline: { en: 'Deadline', ge: 'ბოლო ვადა' },
            description: { en: 'Description', ge: 'აღწერა' },
            loadError: { en: 'Failed to load job data', ge: 'ვაკანსიების ჩატვირთვა ვერ მოხდა' },
            retry: { en: 'Try Again', ge: 'სცადეთ კიდევ' }
        };
        return translations[key][this.currentLang];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('active', show);
    }

    showError() {
        const grid = document.getElementById('jobsGrid');
        grid.innerHTML = `
            <div class="no-results" style="display: block;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>${this.getText('loadError')}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    ${this.getText('retry')}
                </button>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.jobBoard = new JobBoard();

    // Add click delegation for job cards
    document.getElementById('jobsGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.job-card');
        const button = e.target.closest('.view-details');
        
        if (button) {
            const jobId = button.dataset.jobId;
            window.jobBoard.showJobDetail(jobId);
        } else if (card) {
            const jobId = card.dataset.jobId;
            window.jobBoard.showJobDetail(jobId);
        }
    });
});
