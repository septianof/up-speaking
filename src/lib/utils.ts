import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes relation data from PostgREST / Supabase.
 * In 1-to-1 relations (like placement_evaluations with a UNIQUE session_id),
 * PostgREST returns a single object { ... } instead of an array.
 * This helper safely extracts the single item whether PostgREST returns an object or an array.
 */
export function normalizeSingleRelation<T>(
  relation: T | T[] | null | undefined
): T | null {
  if (!relation) return null;
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : null;
  }
  return relation;
}

