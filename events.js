// events.js - Event handling and user interactions

import { findClosest, ResponsiveUtils, openDirectCatalogLink, openCatalogLink } from './utils.js';
import { 
    scrollCarouselContainer, 
    handleCarouselScroll, 
    isFullyVisible, 
    updateAllCarouselVisibility,
    updateCarouselAlignment 
} from './carousel.js';

// Touch navigation variables
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

/**
 * Handle carousel click events
 */
export function handleCarouselClick(e) {
    if (e.target.closest('.carousel-arrow.left')) {
        const arrow = e.target.closest('.carousel-arrow.left');
        const container = arrow.closest('.book-carousel-wrapper').querySelector('.book-carousel-container');
        scrollCarouselContainer(container, 'left');
        setTimeout(() => handleCarouselScroll(container), 300);
        
    } else if (e.target.closest('.carousel-arrow.right')) {
        const arrow = e.target.closest('.carousel-arrow.right');
        const container = arrow.closest('.book-carousel-wrapper').querySelector('.book-carousel-container');
        scrollCarouselContainer(container, 'right');
        setTimeout(() => handleCarouselScroll(container), 300);
        
    } else if (e.target.closest('.carousel-book')) {
        const book = e.target.closest('.carousel-book')
        
        // Check if the book is fully visible
        const container = book.closest('.book-carousel-container');
        const isVisible = isFullyVisible(book, container);
        
        console.log('Book clicked, isVisible:', isVisible, 'classes:', book.className);
        
        if (isVisible) {
            const catalogURL = book.dataset.catalogUrl;
            const olid = book.dataset.olid;
            
            if (catalogURL && catalogURL.startsWith('http')) {
                openDirectCatalogLink(catalogURL);
            } else if (olid) {
                openCatalogLink(olid);
            }
        } else {
            console.log('Book click blocked - not fully visible');
        }
    }
}

/**
 * Handle carousel keyboard navigation
 */
export function handleCarouselKeydown(e) {
    if (e.target.closest('.book-carousel-container')) {
        const container = e.target.closest('.book-carousel-container');
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                scrollCarouselContainer(container, 'left');
                setTimeout(() => handleCarouselScroll(container), 300);
                break;
            case 'ArrowRight':
                e.preventDefault();
                scrollCarouselContainer(container, 'right');
                setTimeout(() => handleCarouselScroll(container), 300);
                break;
            case 'Home':
                e.preventDefault();
                container.scrollTo({ left: 0, behavior: 'smooth' });
                setTimeout(() => handleCarouselScroll(container), 300);
                break;
            case 'End':
                e.preventDefault();
                container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
                setTimeout(() => handleCarouselScroll(container), 300);
                break;
        }
    }
}

/**
 * Handle carousel scroll events
 */
export function handleCarouselScrollEvent(e) {
    if (e.target.closest('.book-carousel-container')) {
        handleCarouselScroll(e.target);
    }
}

/**
 * Setup touch navigation for mobile
 */
export function setupTouchNavigation() {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
}

/**
 * Handle touch start events
 */
function handleTouchStart(e) {
    if (e.target.closest('.book-carousel-container')) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }
}

/**
 * Handle touch move events for swipe navigation
 */
function handleTouchMove(e) {
    if (!e.target) return;
    
    const container = findClosest(e.target, '.book-carousel-container');
    if (!container) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const deltaX = touchStartX - touchCurrentX;
    const deltaY = touchStartY - touchCurrentY;
    const deltaTime = Date.now() - touchStartTime;
    
    // Check if this is a horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30 && deltaTime < 500) {
        e.preventDefault(); // Prevent page scroll
        
        const direction = deltaX > 0 ? 'right' : 'left';
        scrollCarouselContainer(container, direction);
        
        // Reset to prevent multiple triggers
        touchStartTime = 0;
    }
}

/**
 * Handle window resize events
 */
export function setupResizeHandler(onResize) {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const wasMobile = document.body.classList.contains('mobile');
            const isMobile = ResponsiveUtils.isMobile();
            
            if (wasMobile !== isMobile) {
                document.body.classList.toggle('mobile', isMobile);
                if (onResize) {
                    onResize();
                }
            }
            
            updateCarouselAlignment();
            
            // Update visibility after resize
            setTimeout(updateAllCarouselVisibility, 100);
        }, 250);
    });
}

/**
 * Get all event handlers as an object for easy passing
 */
export function getEventHandlers() {
    return {
        click: handleCarouselClick,
        keydown: handleCarouselKeydown,
        scroll: handleCarouselScrollEvent
    };

}

