import { z } from "zod"

// ID parameter validator
export const idParamSchema = z.object({
  id: z.string().uuid({
    message: "Invalid ID format. Must be a valid UUID",
  }),
})

// Common pagination and sorting query parameters
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .pipe(z.number().positive({ message: "Page must be a positive number" }).default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .pipe(
      z
        .number()
        .positive({ message: "Limit must be a positive number" })
        .max(100, { message: "Limit cannot exceed 100" })
        .default(10)
    ),
 
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Generic search query parameters
export const searchQuerySchema = z.object({
  search: z.string().optional(),
})

// Date range query parameters
export const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Price range query parameters
export const priceRangeQuerySchema = z.object({
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
})

// Combined common query parameters
export const commonQuerySchema = paginationQuerySchema.merge(searchQuerySchema)

// Types
export type IdParam = z.infer<typeof idParamSchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>
export type PriceRangeQuery = z.infer<typeof priceRangeQuerySchema>
export type CommonQuery = z.infer<typeof commonQuerySchema>

// Pagination result interface
export interface PaginatedResult<T> {
  data: T[]
  metadata: {
    totalCount: number
    filteredCount: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
