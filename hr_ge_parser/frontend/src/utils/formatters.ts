// ============================================================
// DATE FORMATTERS
// ============================================================

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
}

// ============================================================
// NUMBER FORMATTERS
// ============================================================

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

// ============================================================
// CURRENCY FORMATTERS
// ============================================================

export function formatCurrency(amount: number, currency: string = 'GEL'): string {
  return `${formatNumber(amount)} ${currency}`;
}

// ============================================================
// SALARY FORMATTERS
// ============================================================

export function formatSalary(
  salaryFrom: number | null,
  salaryTo: number | null,
  currency: string = 'GEL'
): string {
  if (!salaryFrom && !salaryTo) return 'Not specified';

  if (salaryFrom && salaryTo) {
    if (salaryFrom === salaryTo) {
      return `${formatNumber(salaryFrom)} ${currency}`;
    }
    return `${formatNumber(salaryFrom)} - ${formatNumber(salaryTo)} ${currency}`;
  }

  if (salaryFrom) {
    return `From ${formatNumber(salaryFrom)} ${currency}`;
  }

  return `Up to ${formatNumber(salaryTo!)} ${currency}`;
}

// ============================================================
// STRING FORMATTERS
// ============================================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
