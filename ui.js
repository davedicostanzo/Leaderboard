// UPDATED ui.js - Fixed cover URL logic for reviews

import { escapeHtml } from './utils.js';
import { generateBookCarousel } from './carousel.js';

/**
 * Get cover URL for review book - FIXED VERSION
 */
function getReviewCoverUrl(review) {
    console.log('Processing review cover for:', review.title);
    console.log('- coverURL:', review.coverURL);
    console.log('- olid:', review.olid);
    console.log('- isbn:', review.isbn);
    
    // Check if coverURL exists and looks like a valid URL
    if (review.coverURL && 
        review.coverURL.trim() !== '' && 
        review.coverURL.startsWith('http') &&
        // More lenient error checking - only exclude obvious errors
        !review.coverURL.toLowerCase().includes('error') &&
        !review.coverURL.toLowerCase().includes('failed') &&
        review.coverURL !== 'No Cover Available' &&
        review.coverURL !== 'Not Found' &&
        review.coverURL !== 'Fetch Error') {
        
        console.log('✓ Using provided coverURL:', review.coverURL);
        return review.coverURL;
    }
    
    // Fallback: construct from OLID if present
    if (review.olid && review.olid.trim() !== '') {
        const olidUrl = `https://covers.openlibrary.org/b/olid/${review.olid}-M.jpg`;
        console.log('✓ Using OLID fallback:', olidUrl);
        return olidUrl;
    }
    
    // Fallback: construct from ISBN if present
    if (review.isbn && review.isbn.trim() !== '') {
        const isbnUrl = `https://covers.openlibrary.org/b/isbn/${review.isbn}-M.jpg`;
        console.log('✓ Using ISBN fallback:', isbnUrl);
        return isbnUrl;
    }
    
    console.log('✗ No valid cover source found');
    return '';
}

/**
 * Render the reviews section - UPDATED
 */
export function renderReviews(reviews) {
    const sidebarColumn = document.querySelector('.sidebar-column .s-lib-box-content');
    
    if (!sidebarColumn) {
        console.error('Reviews container not found');
        return;
    }

    console.log('=== RENDERING REVIEWS ===');
    console.log('Number of reviews:', reviews ? reviews.length : 0);

    if (!reviews || reviews.length === 0) {
        sidebarColumn.innerHTML = '<h3 class="reviews-header">Reviews!</h3><p>No reviews available yet.</p>';
        return;
    }

    const reviewsHTML = `
      <h3 class="reviews-header">Reviews!</h3>
      ${reviews.map((review, index) => {
        console.log(`\n--- Review ${index + 1} ---`);
        console.log(`Title: "${review.title}"`);
        console.log(`Author: "${review.author}"`);
        console.log(`Raw coverURL: "${review.coverURL}"`);
        console.log(`OLID: "${review.olid}"`);
        console.log(`ISBN: "${review.isbn}"`);

        // Get cover URL with detailed logging
        const coverUrl = getReviewCoverUrl(review);
        console.log(`Final cover URL: "${coverUrl}"`);

        return `
          <article class="book-item">
            ${coverUrl ? `
              <img src="${coverUrl}" 
                   alt="Book cover for ${escapeHtml(review.title)}" 
                   class="book-cover"
                   loading="lazy"
                   onload="console.log('✓ Cover loaded successfully:', '${escapeHtml(review.title)}')"
                   onerror="console.log('✗ Cover failed to load:', '${escapeHtml(review.title)}', this.src); this.style.display='none';">
            ` : `
              <div class="book-cover-placeholder" 
                   style="width: 50px; height: 70px; background: #f5f5f5; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; margin-right: 8px; flex-shrink: 0;">
                No Cover
              </div>
            `}
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
    console.log('=== REVIEWS RENDERED ===');
}

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
