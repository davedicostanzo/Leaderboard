// carousel.js - Carousel-specific functionality

import { ResponsiveUtils, escapeHtml, openDirectCatalogLink, openCatalogLink } from './utils.js';

/**
 * Generate HTML for book carousel
 */
export function generateBookCarousel(books, participantId) {
    const visibleBooks = ResponsiveUtils.getVisibleBooks();
    const showArrows = books.length > visibleBooks;
    
    return `
        <div class="book-carousel">
            <div class="book-carousel-wrapper">
                ${showArrows ? `<button class="carousel-arrow left" 
                    aria-label="Previous books" 
                    data-participant="${participantId}">
                    <span aria-hidden="true">‹</span>
                </button>` : ''}
                <div class="book-carousel-container" 
                     role="region" 
                     aria-labelledby="${participantId}-name"
                     data-participant="${participantId}">
                    ${books.map((book, bookIndex) => 
                        `<div class="carousel-book" 
                              role="button"
                              tabindex="0"
                              data-olid="${escapeHtml(book.olid)}"
                              data-catalog-url="${escapeHtml(book.catalogURL || '')}"
                              aria-label="View ${escapeHtml(book.title)} in catalog"
                              onkeydown="handleBookKeydown(event)">
                            <img src="${book.coverURL || `https://covers.openlibrary.org/b/olid/${escapeHtml(book.olid)}-M.jpg`}" 
                                 alt="Cover of ${escapeHtml(book.title)}" 
                                 class="carousel-book-cover" 
                                 loading="lazy"
                                 onerror="handleImageError(this, '${escapeHtml(book.title)}')">
                            <div class="carousel-challenge">${escapeHtml(book.challenge)}</div>
                        </div>`
                    ).join('')}
                </div>
                ${showArrows ? `<button class="carousel-arrow right" 
                    aria-label="Next books" 
                    data-participant="${participantId}">
                    <span aria-hidden="true">›</span>
                </button>` : ''}
            </div>
        </div>
    `;
}

/**
 * Check if a carousel item is fully visible within its container
 */
export function isFullyVisible(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return (
        elementRect.left >= containerRect.left &&
        elementRect.right <= containerRect.right &&
        elementRect.top >= containerRect.top &&
        elementRect.bottom <= containerRect.bottom
    );
}

/**
 * Update visibility classes for all carousel items in a container
 */
export function updateCarouselItemVisibility(container) {
    const items = container.querySelectorAll('.carousel-book');
    console.log('Updating visibility for', items.length, 'items');
    
    items.forEach((item, index) => {
        const wasVisible = item.classList.contains('fully-visible');
        const isVisible = isFullyVisible(item, container);
        
        if (isVisible) {
            item.classList.add('fully-visible');
        } else {
            item.classList.remove('fully-visible');
        }
        
        // Debug logging
        if (wasVisible !== isVisible) {
            console.log(`Item ${index} changed from ${wasVisible ? 'visible' : 'hidden'} to ${isVisible ? 'visible' : 'hidden'}`);
            console.log('Item classes:', item.className);
        }
    });
}

/**
 * Update visibility for all carousels on the page
 */
export function updateAllCarouselVisibility() {
    document.querySelectorAll('.book-carousel-container').forEach(container => {
        updateCarouselItemVisibility(container);
    });
}

/**
 * Enhanced scroll handler that updates visibility
 */
export function handleCarouselScroll(container) {
    updateCarouselItemVisibility(container);
    updateArrowStates(container);
}

/**
 * Update arrow states based on scroll position
 */
export function updateArrowStates(container) {
    const wrapper = container.closest('.book-carousel-wrapper');
    const leftArrow = wrapper.querySelector('.carousel-arrow.left');
    const rightArrow = wrapper.querySelector('.carousel-arrow.right');
    
    if (!leftArrow || !rightArrow) return;
    
    // Check if we're at the beginning
    const atStart = container.scrollLeft <= 5; // Small tolerance for rounding
    leftArrow.disabled = atStart;
    leftArrow.style.opacity = atStart ? '0.5' : '1';
    leftArrow.style.cursor = atStart ? 'default' : 'pointer';
    leftArrow.setAttribute('tabindex', atStart ? '-1' : '0');
    leftArrow.style.outline = atStart ? 'none' : '';
    leftArrow.style.boxShadow = atStart ? 'none' : '';
    
    // Check if we're at the end
    const atEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 5);
    rightArrow.disabled = atEnd;
    rightArrow.style.opacity = atEnd ? '0.5' : '1';
    rightArrow.style.cursor = atEnd ? 'default' : 'pointer';
    rightArrow.setAttribute('tabindex', atEnd ? '-1' : '0');
    rightArrow.style.outline = atEnd ? 'none' : '';
    rightArrow.style.boxShadow = atEnd ? 'none' : '';
}

/**
 * Scroll carousel container in specified direction
 */
export function scrollCarouselContainer(container, direction) {
    const scrollAmount = ResponsiveUtils.getScrollAmount();
    const targetScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
}

/**
 * Handle keyboard navigation for book items
 */
export function handleBookKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const catalogURL = event.target.dataset.catalogUrl;
        const olid = event.target.dataset.olid;
        
        // Use catalog URL if available, otherwise fall back to OLID search
        if (catalogURL && catalogURL.startsWith('http')) {
            openDirectCatalogLink(catalogURL);
        } else if (olid) {
            openCatalogLink(olid);
        }
    }
}

/**
 * Update carousel alignment for centering
 */
export function updateCarouselAlignment() {
    document.querySelectorAll('.book-carousel-container').forEach(container => {
        const totalScrollWidth = container.scrollWidth;
        const visibleWidth = container.clientWidth;

        if (totalScrollWidth <= visibleWidth + 1) {
            // Not enough items to scroll – center them
            container.style.justifyContent = 'center';
        } else {
            // Enough items to scroll – align left
            container.style.justifyContent = 'flex-start';
        }
    });
}

/**
 * Initialize all carousels with event listeners and visibility
 */
export function initializeCarousels(data, eventHandlers) {
    // Remove any existing event listeners to prevent duplicates
    document.removeEventListener('click', eventHandlers.click);
    document.removeEventListener('keydown', eventHandlers.keydown);
    document.removeEventListener('scroll', eventHandlers.scroll, true);
    
    // Add event listeners
    document.addEventListener('click', eventHandlers.click);
    document.addEventListener('keydown', eventHandlers.keydown);
    document.addEventListener('scroll', eventHandlers.scroll, true);
    
    // Initial setup with longer delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Running initial visibility update...');
        updateAllCarouselVisibility();
        document.querySelectorAll('.book-carousel-container').forEach(container => {
            updateArrowStates(container);
        });
        
        // Test if visibility classes are being added
        setTimeout(() => {
            const visibleBooks = document.querySelectorAll('.carousel-book.fully-visible');
            console.log('Found', visibleBooks.length, 'fully visible books after initialization');
        }, 100);
    }, 300); // Increased delay
}

/**
 * Manual test function for debugging visibility detection
 */
export function testVisibilityDetection() {
    console.log('=== Testing visibility detection ===');
    const containers = document.querySelectorAll('.book-carousel-container');
    console.log('Found containers:', containers.length);
    
    containers.forEach((container, index) => {
        console.log(`\nContainer ${index}:`);
        const books = container.querySelectorAll('.carousel-book');
        console.log(`- Books: ${books.length}`);
        console.log(`- Container bounds:`, container.getBoundingClientRect());
        
        books.forEach((book, bookIndex) => {
            const isVisible = isFullyVisible(book, container);
            const hasClass = book.classList.contains('fully-visible');
            console.log(`  Book ${bookIndex}: visible=${isVisible}, hasClass=${hasClass}`);
            if (isVisible !== hasClass) {
                console.log(`    ⚠ MISMATCH! Should be ${isVisible ? 'visible' : 'hidden'}`);
            }
        });
    });
    
    // Manual update
    console.log('\nRunning manual visibility update...');
    updateAllCarouselVisibility();
    
    setTimeout(() => {
        console.log('After update:');
        const visibleBooks = document.querySelectorAll('.carousel-book.fully-visible');
        const totalBooks = document.querySelectorAll('.carousel-book');
        console.log(`${visibleBooks.length} of ${totalBooks.length} books marked as fully-visible`);
    }, 100);
}

// Make testVisibilityDetection available globally for console access
if (typeof window !== 'undefined') {
    window.testVisibilityDetection = testVisibilityDetection;
}