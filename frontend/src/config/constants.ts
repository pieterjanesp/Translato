/**
 * Application Configuration
 *
 * Centralized configuration for the frontend application.
 * Similar to backend's core/config.py - single source of truth for constants.
 */

// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================

export const FILE_CONFIG = {
  // Maximum file size in bytes (10 MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Accepted file extensions
  ACCEPTED_FILE_TYPES: ['.docx', '.pptx'] as const,

  // MIME types for file validation
  ACCEPTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ] as const,

  // User-friendly file type string for UI
  ACCEPTED_FILE_TYPES_DISPLAY: '.docx and .pptx files',
} as const

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // Polling interval for job status (in milliseconds)
  POLLING_INTERVAL: 2000,

  // Maximum polling attempts before giving up
  MAX_POLLING_ATTEMPTS: 150, // 5 minutes at 2s intervals
} as const

// =============================================================================
// LANGUAGE CONFIGURATION
// =============================================================================

export const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'nl', name: 'Dutch' },
  { code: 'it', name: 'Italian' },
] as const

// Type helper for language codes
export type LanguageCode = typeof LANGUAGES[number]['code']

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
  // Navbar height for scroll offset calculations
  NAVBAR_HEIGHT: 80,

  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Check if file type is accepted
 * @param filename - Name of the file
 * @returns True if file type is accepted
 */
export function isFileTypeAccepted(filename: string): boolean {
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  return FILE_CONFIG.ACCEPTED_FILE_TYPES.includes(extension as any)
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @returns True if file size is valid
 */
export function isFileSizeValid(size: number): boolean {
  return size > 0 && size <= FILE_CONFIG.MAX_FILE_SIZE
}

/**
 * Get validation error message for file
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function getFileValidationError(file: File): string | null {
  if (!isFileTypeAccepted(file.name)) {
    return `Only ${FILE_CONFIG.ACCEPTED_FILE_TYPES_DISPLAY} are supported`
  }

  if (!isFileSizeValid(file.size)) {
    return `File size must be less than ${formatFileSize(FILE_CONFIG.MAX_FILE_SIZE)}`
  }

  return null
}
