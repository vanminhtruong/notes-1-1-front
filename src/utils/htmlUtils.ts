/**
 * Utility functions for HTML content processing
 */

/**
 * Strip HTML tags and return plain text
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div element
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  
  // Get text content and normalize whitespace
  const text = tmp.textContent || tmp.innerText || '';
  
  // Replace multiple spaces/newlines with single space and trim
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get preview text from HTML content
 * Combines strip HTML and truncate
 * @param html - HTML string
 * @param maxLength - Maximum length for preview
 * @returns Plain text preview
 */
export const getHtmlPreview = (html: string, maxLength: number = 100): string => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};

/**
 * Check if HTML content is empty (only whitespace or empty tags)
 * @param html - HTML string
 * @returns True if content is empty
 */
export const isHtmlEmpty = (html: string): boolean => {
  if (!html) return true;
  const plainText = stripHtmlTags(html);
  return plainText.trim().length === 0;
};

/**
 * Sanitize HTML for inline preview rendering.
 * - Keeps basic inline tags: b, strong, i, em, u, s, code, a, span
 * - Converts <br> to space
 * - Flattens/removes block-level elements (p, div, h1..h6, ul/ol/li, blockquote, pre, table, etc.)
 * - Strips all attributes except href on <a> (adds rel target)
 * This is designed for clamped previews where we still want inline formatting but no layout-breaking blocks.
 */
export const sanitizeInlineHtml = (html: string): string => {
  if (!html) return '';

  const container = document.createElement('div');
  container.innerHTML = html;

  const allowed = new Set(['B','STRONG','I','EM','U','S','CODE','A','SPAN']);

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;
    const tag = el.tagName;

    if (tag === 'BR') return ' ';

    const inner = Array.from(el.childNodes).map(walk).join(' ');

    if (allowed.has(tag)) {
      const content = inner.replace(/\s+/g, ' ').trim();
      if (!content) return '';
      if (tag === 'A') {
        const href = el.getAttribute('href') || '#';
        const safeHref = href.startsWith('javascript:') ? '#' : href;
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${content}</a>`;
      }
      const lower = tag.toLowerCase();
      return `<${lower}>${content}</${lower}>`;
    }

    // For block-level or unknown tags, just return flattened text content with spacing
    const text = inner.replace(/\s+/g, ' ').trim();
    return text ? ` ${text} ` : '';
  };

  const result = Array.from(container.childNodes).map(walk).join(' ').replace(/\s+/g, ' ').trim();
  return result;
};
