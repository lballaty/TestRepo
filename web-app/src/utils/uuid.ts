// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/utils/uuid.ts
// Description: UUID generation utility (no external dependency)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

/**
 * Generate UUID v4
 * Memory-efficient: No external library dependency
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}