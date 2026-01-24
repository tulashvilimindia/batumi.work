/**
 * Categories API
 * Functions for fetching job categories
 */

import { get } from './client';
import type { Category } from '@/types';

/**
 * Fetch all job categories
 *
 * @param includeCount - Whether to include job counts per category
 * @returns Promise resolving to array of categories
 *
 * @example
 * const categories = await fetchCategories(true);
 * categories.forEach(cat => {
 *   console.log(cat.name_ge, cat.job_count);
 * });
 */
export async function fetchCategories(includeCount: boolean = true): Promise<Category[]> {
  return get<Category[]>('/categories', {
    include_count: includeCount,
  });
}

/**
 * Find category by slug
 */
export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Find category by jobs.ge CID
 */
export function findCategoryByCid(
  categories: Category[],
  cid: number
): Category | undefined {
  return categories.find((cat) => cat.jobsge_cid === cid);
}

/**
 * Get localized category name
 */
export function getCategoryNameLocalized(
  category: Category,
  language: 'ge' | 'en'
): string {
  return language === 'en' && category.name_en ? category.name_en : category.name_ge;
}

/**
 * Sort categories by job count (descending)
 */
export function sortCategoriesByCount(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => (b.job_count ?? 0) - (a.job_count ?? 0));
}

/**
 * Sort categories alphabetically by name
 */
export function sortCategoriesByName(
  categories: Category[],
  language: 'ge' | 'en'
): Category[] {
  return [...categories].sort((a, b) => {
    const nameA = getCategoryNameLocalized(a, language);
    const nameB = getCategoryNameLocalized(b, language);
    return nameA.localeCompare(nameB, language === 'ge' ? 'ka' : 'en');
  });
}
