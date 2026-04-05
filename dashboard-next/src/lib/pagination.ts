/**
 * Pagination Utility
 * Enterprise-grade pagination for MongoDB queries.
 * 
 * Usage:
 *   const { page, limit, skip, sort } = parsePaginationParams(req);
 *   const [items, total] = await Promise.all([
 *     Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
 *     Model.countDocuments(filter),
 *   ]);
 *   return ApiResponse.paginated(items, { page, limit, total });
 */

import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
  search?: string;
  filter?: Record<string, unknown>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

export function parsePaginationParams(req: NextRequest): PaginationParams {
  const url = new URL(req.url);

  // Parse page
  let page = parseInt(url.searchParams.get('page') || String(DEFAULT_PAGE), 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

  // Parse limit
  let limit = parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
  if (isNaN(limit) || limit < MIN_LIMIT) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  // Parse sort
  const sortBy = url.searchParams.get('sortBy') || 'createdAt';
  const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder as 1 | -1 };

  // Parse search
  const search = url.searchParams.get('search') || undefined;

  // Calculate skip
  const skip = (page - 1) * limit;

  return { page, limit, skip, sort, search };
}

/**
 * Build a MongoDB text search or regex filter from a search string.
 * Searches across the specified fields.
 */
export function buildSearchFilter(
  search: string | undefined,
  fields: string[]
): Record<string, unknown> {
  if (!search || !search.trim()) return {};

  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearch, 'i');

  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}

/**
 * Build a date range filter for a specific field.
 */
export function buildDateFilter(
  field: string,
  from?: string | null,
  to?: string | null
): Record<string, unknown> {
  if (!from && !to) return {};

  const filter: Record<string, unknown> = {};
  const dateRange: Record<string, Date> = {};

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) dateRange['$gte'] = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) dateRange['$lte'] = toDate;
  }

  if (Object.keys(dateRange).length > 0) {
    filter[field] = dateRange;
  }

  return filter;
}

/**
 * Build a status/category filter
 */
export function buildEnumFilter(
  field: string,
  value?: string | null,
  validValues?: string[]
): Record<string, unknown> {
  if (!value) return {};
  if (validValues && !validValues.includes(value)) return {};
  return { [field]: value };
}
