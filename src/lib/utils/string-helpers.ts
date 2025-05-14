/**
 * Creates a slugified version of a string by:
 * - Converting to lowercase
 * - Replacing spaces with hyphens
 * - Removing special characters
 * - Adding an optional prefix
 * 
 * @param str - String to slugify
 * @param addPrefix - Whether to add "celebration-of-life-for-" prefix
 * @returns Slugified string
 */
export function createTributeSlug(str: string, addPrefix = false): string {
  if (!str) return '';
  
  // Convert to lowercase, replace spaces with hyphens, remove special characters
  const slug = str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  
  return addPrefix ? `celebration-of-life-for-${slug}` : slug;
}

/**
 * Creates a full URL for a tribute based on the slug
 * 
 * @param slug - The slug to use in the URL
 * @param includeProtocol - Whether to include protocol and domain
 * @returns Complete tribute URL
 */
export function createTributeUrl(slug: string, includeProtocol = false): string {
  const path = slug.startsWith('celebration-of-life-for-') 
    ? slug 
    : `celebration-of-life-for-${slug}`;
    
  return includeProtocol 
    ? `https://www.tributestream.com/${path}` 
    : `/${path}`;
}

/**
 * Formats a name with proper capitalization
 * 
 * @param name - The name to format
 * @returns Formatted name
 */
export function formatName(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}