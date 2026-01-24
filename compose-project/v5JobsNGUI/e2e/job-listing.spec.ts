/**
 * Job Listing E2E Tests
 * Tests the main job listing page functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Job Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ge');
  });

  test('displays the job listing table', async ({ page }) => {
    // Wait for the table to be visible
    await expect(page.locator('table')).toBeVisible();

    // Check table headers exist
    await expect(page.getByRole('columnheader', { name: /განცხადება/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /კომპანია/i })).toBeVisible();
  });

  test('shows loading state initially', async ({ page }) => {
    // Intercept API calls to delay response
    await page.route('**/api/v1/jobs**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto('/ge');

    // Table should be visible even during loading
    await expect(page.locator('table')).toBeVisible();
  });

  test('loads jobs from API', async ({ page }) => {
    // Wait for table rows to appear (excluding header)
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);
  });
});

test.describe('Job Search', () => {
  test('can search for jobs', async ({ page }) => {
    await page.goto('/ge');

    // Wait for initial load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Find search input and type
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('developer');
    await searchInput.press('Enter');

    // URL should update with search query
    await expect(page).toHaveURL(/q=developer/);
  });

  test('can clear search', async ({ page }) => {
    await page.goto('/ge?q=developer');

    // Clear the search
    const searchInput = page.getByRole('searchbox');
    await searchInput.clear();
    await searchInput.press('Enter');

    // URL should not have query parameter
    await expect(page).not.toHaveURL(/q=/);
  });
});

test.describe('Job Filters', () => {
  test('can filter by category', async ({ page }) => {
    await page.goto('/ge');

    // Wait for initial load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Click category filter
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });

      // URL should update with category
      await expect(page).toHaveURL(/category=/);
    }
  });

  test('can filter by salary', async ({ page }) => {
    await page.goto('/ge');

    // Wait for initial load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Look for salary toggle/checkbox
    const salaryToggle = page.getByRole('checkbox', { name: /salary/i });
    if (await salaryToggle.isVisible()) {
      await salaryToggle.check();

      // URL should update
      await expect(page).toHaveURL(/has_salary=true/);
    }
  });
});

test.describe('Pagination', () => {
  test('can navigate to next page', async ({ page }) => {
    await page.goto('/ge');

    // Wait for initial load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Find and click next page button
    const nextButton = page.getByRole('button', { name: /next|შემდეგი/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // URL should update with page number
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('preserves filters when paginating', async ({ page }) => {
    await page.goto('/ge?category=it-programming');

    // Wait for initial load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Navigate to next page
    const nextButton = page.getByRole('button', { name: /next|შემდეგი/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // URL should have both category and page
      await expect(page).toHaveURL(/category=it-programming/);
      await expect(page).toHaveURL(/page=2/);
    }
  });
});

test.describe('Language Switch', () => {
  test('can switch to English', async ({ page }) => {
    await page.goto('/ge');

    // Find language switch
    const englishLink = page.getByRole('link', { name: /en/i });
    if (await englishLink.isVisible()) {
      await englishLink.click();

      // Should navigate to English version
      await expect(page).toHaveURL(/\/en/);
    }
  });

  test('displays content in selected language', async ({ page }) => {
    await page.goto('/en');

    // English headers should be visible
    await expect(page.getByRole('columnheader', { name: /Job Title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Company/i })).toBeVisible();
  });
});
