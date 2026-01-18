/**
 * Analytics tracking for JobBoard
 * Lightweight tracking of user interactions
 */
const Analytics = {
    // Get or create session ID
    sessionId: localStorage.getItem('session_id') || (() => {
        const id = crypto.randomUUID ? crypto.randomUUID() : 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () =>
            Math.floor(Math.random() * 16).toString(16)
        );
        localStorage.setItem('session_id', id);
        return id;
    })(),

    // API endpoint
    endpoint: '/api/v1/analytics/track',

    /**
     * Track an event
     * @param {string} event - Event type
     * @param {object} data - Event data
     */
    track(event, data = {}) {
        const payload = {
            event,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            language: document.documentElement.lang || 'ge',
            ...data
        };

        // Use sendBeacon for reliability (doesn't block page unload)
        if (navigator.sendBeacon) {
            navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
        } else {
            // Fallback for older browsers
            fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => {}); // Silently fail
        }
    },

    /**
     * Track a job view
     * @param {string} jobId - The job ID
     */
    trackJobView(jobId) {
        this.track('job_view', { job_id: jobId });
    },

    /**
     * Track a search
     * @param {string} query - Search query
     * @param {object} filters - Active filters
     * @param {number} resultsCount - Number of results
     */
    trackSearch(query, filters, resultsCount) {
        this.track('search', {
            query,
            filters,
            results_count: resultsCount
        });
    },

    /**
     * Track a job click from search results
     * @param {string} jobId - The job ID
     * @param {number} position - Position in search results
     */
    trackJobClick(jobId, position) {
        this.track('job_click', {
            job_id: jobId,
            position
        });
    },

    /**
     * Track page view
     */
    trackPageView() {
        this.track('page_view', {
            url: window.location.href,
            title: document.title
        });
    }
};

// Auto-track page view when script loads
document.addEventListener('DOMContentLoaded', () => {
    Analytics.trackPageView();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}
