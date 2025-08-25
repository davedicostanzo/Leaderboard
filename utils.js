// utils.js - Shared utilities and helper functions

/**
 * Responsive utility functions
 */
export class ResponsiveUtils {
    static isMobile() {
        return window.innerWidth <= 768;
    }
    
    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }
    
    static getVisibleBooks() {
        if (this.isMobile()) return 2;
        if (this.isTablet()) return 3;
        return 5;
    }
    
    static getScrollAmount() {
        if (this.isMobile()) return 120; // Mobile book width + gap
        if (this.isTablet()) return 140; // Tablet book width + gap  
        return 165; // Desktop book width + gap
    }
}

/**
 * Utility function to escape HTML
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Helper function for better browser compatibility with closest()
 */
export function findClosest(element, selector) {
    // Use native closest() if available
    if (element.closest) {
        return element.closest(selector);
    }
    
    // Fallback for older browsers
    let current = element;
    while (current && current.nodeType === 1) {
        if (current.matches && current.matches(selector)) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

/**
 * Handle image loading errors
 */
export function handleImageError(img, title) {
    img.classList.add('error');
    img.alt = `No cover available for ${title}`;
    img.innerHTML = '<span aria-hidden="true">No Cover</span>';
}

/**
 * Open catalog link with mobile-friendly handling
 */
export function openDirectCatalogLink(catalogURL) {
    if (ResponsiveUtils.isMobile()) {
        // On mobile, might want to open in same tab to avoid popup issues
        window.location.href = catalogURL;
    } else {
        window.open(catalogURL, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Open catalog link with OLID search
 */
export function openCatalogLink(olid) {
    const catalogUrl = `https://westportlibrary.bibliocommons.com/v2/search?query=${encodeURIComponent(olid)}&searchType=keyword`;
    
    if (ResponsiveUtils.isMobile()) {
        window.location.href = catalogUrl;
    } else {
        window.open(catalogUrl, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Setup performance optimization with Intersection Observer for lazy loading
 */
export function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all carousel images
        document.querySelectorAll('.carousel-book-cover[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}