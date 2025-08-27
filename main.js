// main.js - Application initialization and coordination

import { ResponsiveUtils, setupLazyLoading, handleImageError } from './utils.js';
import { startPolling, setData } from './data.js';
import { renderLeaderboard, renderReviews } from './ui.js';
import { 
    initializeCarousels, 
    updateCarouselAlignment, 
    updateAllCarouselVisibility,
    testVisibilityDetection 
} from './carousel.js';
import { 
    setupTouchNavigation, 
    setupResizeHandler, 
    getEventHandlers,
    handleCarouselClick,
    handleCarouselKeydown
} from './events.js';

// Global state
let currentData = { participants: [], reviews: [] };

/**
 * Handle data updates from polling
 */
function onDataUpdate(data) {
    currentData = data;
    setData(data.participants, data.reviews);
    
    // Re-render UI
    renderLeaderboard(data.participants, onLeaderboardRender);
    renderReviews(data.reviews.length > 0 ? data.reviews : undefined);
}

/**
 * Handle leaderboard render completion
 */
function onLeaderboardRender(sortedData) {
    // Initialize carousels after DOM update
    const eventHandlers = getEventHandlers();
    initializeCarousels(sortedData, eventHandlers);
    
    // Update carousel alignment
    updateCarouselAlignment();
}

/**
 * Handle window resize
 */
function onResize() {
    renderLeaderboard(currentData.participants, onLeaderboardRender);
}

/**
 * Make certain functions globally available for inline event handlers
 * (This is needed because the HTML still has some inline handlers)
 */
function exposeGlobalFunctions() {
    window.handleImageError = handleImageError;
    window.handleBookKeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            // Delegate to the carousel click handler
            handleCarouselClick(event);
        }
    };
    
    // Expose for debugging
    window.testVisibilityDetection = testVisibilityDetection;
    window.updateAllCarouselVisibility = updateAllCarouselVisibility;
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Set initial body class for mobile detection
    document.body.classList.toggle('mobile', ResponsiveUtils.isMobile());
    
    // Expose global functions
    exposeGlobalFunctions();
    
    // Don't start with sample data - let fetchLatestData handle the fallback
    // This prevents the "flash" of sample data
    console.log('🚀 Initializing app...');
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Setup event listeners
    setupTouchNavigation();
    setupResizeHandler(onResize);
    
    // Start polling for real data (will handle sample data fallback internally)
    console.log('=== ABOUT TO START POLLING ===');
    startPolling(onDataUpdate);
    
    // Add debugging for visibility with longer delay
    setTimeout(() => {
        console.log('Running initial visibility check...');
        updateAllCarouselVisibility();
        
        // Test after a bit more time
        setTimeout(() => {
            console.log('=== DEBUGGING VISIBILITY ===');
            testVisibilityDetection();
        }, 1000);
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for potential external access

export { initializeApp, onDataUpdate, currentData };

