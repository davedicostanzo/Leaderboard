// ui.js - UI rendering and DOM manipulation

import { escapeHtml } from './utils.js';
import { generateBookCarousel } from './carousel.js';
import { sampleReviewsData } from './data.js';

/**
 * Render the main leaderboard
 */
export function renderLeaderboard(data, onRenderComplete) {
    const content = document.getElementById('content');
    
if (data.length === 0) {
    content.innerHTML = '<div class="error">No data found.</div>';
    // Add these lines:
    updateStats([]);
    showStats();
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
                                ${escapeHtml(participant.name)} - 
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
 * Render the reviews section
 export function renderReviews(reviews = sampleReviewsData) {
    console.log('=== REVIEWS COVER DEBUG ===');
    console.log('Total reviews:', reviews.length);
    
    const sidebarColumn = document.querySelector('.sidebar-column .s-lib-box-content');
    
    if (!sidebarColumn) {
        console.error('Reviews container not found');
        return;
    }

    const reviewsHTML = `
        <h3 class="reviews-header">Reviews!</h3>
        ${reviews.map((review, index) => {
            console.log(`\n--- Review ${index}: ${review.title} ---`);
            console.log('review.coverURL:', review.coverURL);
            console.log('review.olid:', review.olid);
            console.log('review.isbn:', review.isbn);
            
            let coverUrl;
            let debugSource = '';
            
            // Method 1: Use stored coverURL directly
            if (review.coverURL && review.coverURL.startsWith('http')) {
                coverUrl = review.coverURL;
                debugSource = 'stored coverURL';
            }
            // Method 2: Construct from olid/id
            else if (review.olid) {
                if (/^\d+$/.test(review.olid)) {
                    coverUrl = `https://covers.openlibrary.org/b/id/${review.olid}-M.jpg`;
                    debugSource = 'constructed from ID';
                } else {
                    coverUrl = `https://covers.openlibrary.org/b/olid/${review.olid}-M.jpg`;
                    debugSource = 'constructed from OLID';
                }
            }
            // Method 3: Try ISBN fallback
            else if (review.isbn) {
                coverUrl = `https://covers.openlibrary.org/b/isbn/${review.isbn}-M.jpg`;
                debugSource = 'constructed from ISBN';
            }
            // Method 4: Placeholder
            else {
                coverUrl = 'https://via.placeholder.com/150x200/6366f1/white?text=No+Cover';
                debugSource = 'placeholder';
            }
            
            console.log('Final coverUrl:', coverUrl);
            console.log('Source:', debugSource);
            
            return `
                <article class="book-item">
                    <img src="${coverUrl}" 
                         alt="Book cover for ${escapeHtml(review.title)}" 
                         class="book-cover"
                         loading="lazy"
                         onerror="console.error('Image load failed for ${review.title}:', this.src); this.src='https://via.placeholder.com/150x200/6366f1/white?text=No+Cover'">
                    <div class="book-info">
                        <h4 class="book-title">${escapeHtml(review.title)}</h4>
                        <p class="book-author">by ${escapeHtml(review.author)}</p>
                        <p class="book-description">${escapeHtml(review.description)}</p>
                    </div>
                </article>
            `;
        }).join('')}
    `;
    
    sidebarColumn.innerHTML = reviewsHTML;
}


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
 * Show stats panel if available
 */
export function showStats() {
    const statsBox = document.getElementById('statsBox'); // Changed from 'stats-panel' to 'statsBox'
    if (statsBox) {
        statsBox.classList.remove('stats-hidden');
        statsBox.classList.add('stats-visible', 'stats-loaded');
        statsBox.style.display = 'grid';
        console.log('Stats box shown');
    } else {
        console.error('Stats box not found');
    }
}

/**
 * Animate numbers in stats panel
 */
export function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with ID '${elementId}' not found for stats animation`);
        return;
    }
    
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


