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
 */
export function renderReviews(reviews = sampleReviewsData) {
    const sidebarColumn = document.querySelector('.sidebar-column .s-lib-box-content');
    
    if (!sidebarColumn) {
        console.error('Reviews container not found');
        return;
    }

    const reviewsHTML = `
        <h3 class="reviews-header">Reviews!</h3>
        ${reviews.map(review => `
            <article class="book-item">
                <img src="//syndetics.com/index.aspx?isbn=${escapeHtml(review.isbn)}/LC.GIF&client=springshare" 
                     alt="Book cover for ${escapeHtml(review.title)}" 
                     class="book-cover"
                     loading="lazy"
                     onerror="this.style.display='none'">
                <div class="book-info">
                    <h4 class="book-title">${escapeHtml(review.title)}</h4>
                    <p class="book-author">by ${escapeHtml(review.author)}</p>
                    <p class="book-description">${escapeHtml(review.description)}</p>
                </div>
            </article>
        `).join('')}
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
    const statsPanel = document.getElementById('stats-panel');
    if (statsPanel) {
        statsPanel.style.display = 'block';
    }
}

/**
 * Animate numbers in stats panel
 */
export function animateNumber(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;
    // Simple animation (could be improved)
    el.textContent = `${value}`;
}
