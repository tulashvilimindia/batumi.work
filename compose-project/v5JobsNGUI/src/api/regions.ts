/**
 * Regions API
 * Functions for fetching regions/locations
 */

import { get } from './client';
import type { Region } from '@/types';

/**
 * Fetch all regions/locations
 *
 * @param includeCount - Whether to include job counts per region
 * @returns Promise resolving to array of regions
 *
 * @example
 * const regions = await fetchRegions(true);
 * regions.forEach(region => {
 *   console.log(region.name_ge, region.job_count);
 * });
 */
export async function fetchRegions(includeCount: boolean = true): Promise<Region[]> {
  return get<Region[]>('/regions', {
    include_count: includeCount,
  });
}

/**
 * Find region by slug
 */
export function findRegionBySlug(regions: Region[], slug: string): Region | undefined {
  return regions.find((region) => region.slug === slug);
}

/**
 * Find region by jobs.ge LID
 */
export function findRegionByLid(regions: Region[], lid: number): Region | undefined {
  return regions.find((region) => region.jobsge_lid === lid);
}

/**
 * Get localized region name
 */
export function getRegionNameLocalized(region: Region, language: 'ge' | 'en'): string {
  return language === 'en' && region.name_en ? region.name_en : region.name_ge;
}

/**
 * Sort regions by job count (descending)
 */
export function sortRegionsByCount(regions: Region[]): Region[] {
  return [...regions].sort((a, b) => (b.job_count ?? 0) - (a.job_count ?? 0));
}

/**
 * Sort regions alphabetically by name
 */
export function sortRegionsByName(regions: Region[], language: 'ge' | 'en'): Region[] {
  return [...regions].sort((a, b) => {
    const nameA = getRegionNameLocalized(a, language);
    const nameB = getRegionNameLocalized(b, language);
    return nameA.localeCompare(nameB, language === 'ge' ? 'ka' : 'en');
  });
}

/**
 * Well-known region slugs
 */
export const REGION_SLUGS = {
  TBILISI: 'tbilisi',
  ADJARA: 'adjara',
  BATUMI: 'batumi',
  REMOTE: 'remote',
} as const;

/**
 * Check if region is remote work
 */
export function isRemoteRegion(region: Region): boolean {
  return region.slug === REGION_SLUGS.REMOTE || region.jobsge_lid === 17;
}
