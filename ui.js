// ui.js - UI rendering and DOM manipulation

import { escapeHtml } from './utils.js';
import { generateBookCarousel } from './carousel.js';
// import { sampleReviewsData } from './data.js'; // Sample data import commented out

/**
 * Render the main leaderboard
 */
export function renderLeaderboard(data, onRenderComplete) {
    const content = document.getElementById('content');
    
    if (data.length === 0) {
        content.innerHTML = '<div class="error">No data found.</div>';
        return;
    }

    // Sort by booksRead instead of score
    const sortedData = [...data].sort((a, b) => b.booksRead - a.booksRead);
    
    const leaderboardHTML = `
        <div class="leaderboard" role="list">
            ${sortedData.map((participant, index) => {
                const participantId = `participant-${index}`;
                return `
                    <div class="leaderboard-item" role="listitem" id="${participantId}">
                        <div class="participant-info">
                            <div class="participant-name" id="${participantId}-name">
                                ${escapeHtml(participant.name)} ${participant.status ? '- ' + escapeHtml(participant.status) : ''} - 
                                ${participant.booksRead} ${participant.booksRead === 1 ? 'challenge' : 'challenges'} completed
                            </div>
                            ${participant.books && participant.books.length > 0 ? 
                                generateBookCarousel(participant.books, participantId) : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    content.innerHTML = leaderboardHTML;
    
    // Update stats and show
    updateStats(data);
    showStats();
    
    // Update content loaded state
    content.setAttribute('aria-busy', 'false');
    
    // Notify completion for carousel initialization
    if (onRenderComplete) {
        onRenderComplete(sortedData);
    }
}

/**
 * Get cover URL for review book - use the same logic as the carousel
 */

function getReviewCoverUrl(review) {
    console.log('Getting cover URL for:', review.title, 'coverURL:', review.coverURL);
    
    // Use the same logic as carousels - if coverURL exists and is a valid URL, use it
    if (review.coverURL && review.coverURL.startsWith('http')) {
        console.log('Using direct coverURL:', review.coverURL);
        return review.coverURL;
    }
    
    // Fallback to OLID construction (same as carousel fallback)
    if (review.olid) {
        const fallbackUrl = `https://covers.openlibrary.org/b/olid/${review.olid}-M.jpg`;
        console.log('Using OLID fallback:', fallbackUrl);
        return fallbackUrl;
    }
    
    console.log('No valid cover URL found for:', review.title);
    return '';
}


/**
 * Render the reviews section
 */
// export function renderReviews(reviews = sampleReviewsData) { // Default to sample data commented out
// Replace the entire renderReviews function in ui.js with this:

// Replace your entire renderReviews function with this simple test version:

export function renderReviews(reviews) {
    console.log('=== SIMPLE REVIEW TEST ===');
    console.log('Reviews received:', reviews);
    console.log('Number of reviews:', reviews ? reviews.length : 0);
    
    // Use sample data only if reviews is null/undefined, not if it's an empty array
    const reviewsToRender = reviews || sampleReviewsData;
    console.log('Using reviews:', reviewsToRender);
    
    const sidebarColumn = document.querySelector('.sidebar-column .s-lib-box-content');
    
    if (!sidebarColumn) {
        console.error('Sidebar not found');
        return;
    }

    if (reviewsToRender.length === 0) {
        sidebarColumn.innerHTML = `
            <h3 class="reviews-header">Reviews!</h3>
            <p>No reviews available yet.</p>
        `;
        return;
    }

    // Test with a known working image first
    const testHTML = `
        <h3 class="reviews-header">Reviews!</h3>
        <article class="book-item">
            <img src="https://covers.openlibrary.org/b/id/798170-M.jpg" 
                 alt="Test cover" 
                 class="book-cover"
                 onload="console.log('✅ Test image loaded successfully')"
                 onerror="console.log('❌ Test image failed')">
            <div class="book-info">
                <h4 class="book-title">Test Book</h4>
                <p class="book-author">Test Author</p>
                <p class="book-description">This is a test to see if ANY image loads</p>
            </div>
        </article>
        <article class="book-item">
            <img src="${reviewsToRender[0].coverURL || 'MISSING'}" 
                 alt="Real review cover" 
                 class="book-cover"
                 onload="console.log('✅ Real review image loaded:', this.src)"
                 onerror="console.log('❌ Real review image failed:', this.src)">
            <div class="book-info">
                <h4 class="book-title">${escapeHtml(reviewsToRender[0].title || 'No title')}</h4>
                <p class="book-author">${escapeHtml(reviewsToRender[0].author || 'No author')}</p>
                <p class="book-description">${escapeHtml(reviewsToRender[0].description || 'No description')}</p>
            </div>
        </article>
    `;
    
    console.log('Setting HTML...');
    sidebarColumn.innerHTML = testHTML;
}

// Remove the getReviewCoverUrl function entirely - we don't need it anymore!

/**
 * Update statistics display
 */
export function updateStats(data) {
    const totalParticipants = data.length;
    const totalBooks = data.reduce((sum, p) => sum + p.booksRead, 0);
    const avgBooks = totalParticipants > 0 ? Math.round(totalBooks / totalParticipants) : 0;

    // Update with animation
    animateNumber('totalParticipants', totalParticipants);
    animateNumber('totalBooks', totalBooks);
    animateNumber('avgBooks', avgBooks);
}

/**
 * Animate number changes for statistics
 */
export function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue;
        element.setAttribute('aria-valuenow', currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Show statistics box with animation
 */
export function showStats() {
    const statsBox = document.getElementById('statsBox');
    if (statsBox) {
        statsBox.classList.remove('stats-hidden');
        statsBox.classList.add('stats-visible');
        
        // Trigger reflow for animation
        statsBox.offsetHeight;
        statsBox.style.opacity = '1';
        statsBox.style.transform = 'translateY(0)';
    }
}






