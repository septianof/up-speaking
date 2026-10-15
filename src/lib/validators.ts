import { z } from 'zod'

/**
 * Regex for any standard PostgreSQL UUID (128-bit hex representation: 8-4-4-4-12).
 * PostgreSQL permits custom dummy/seed UUIDs
 * (e.g., e1111111-0000-0000-0000-000000000001 or a0000000-0000-0000-0000-000000000001)
 * that don't adhere strictly to RFC 4122 version/variant bits required by default Zod .uuid().
 */
export const POSTGRES_UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const uuidSchema = (message = 'Format ID tidak valid') =>
  z.string().regex(POSTGRES_UUID_REGEX, message)

export const optionalUuidSchema = (message = 'Format ID tidak valid') =>
  z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === '' || val === undefined ? null : val))
    .refine((val) => val === null || POSTGRES_UUID_REGEX.test(val), message)
