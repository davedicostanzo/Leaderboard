// data.js - Data management and API interactions

// Configuration
export const CONFIG = {
    SHEET_CSV_URL: '', // TODO: Add your published CSV URL here
    POLL_INTERVAL: 60000, // 60 seconds
};

// Challenge mapping for converting numbers back to descriptions
export const challengeMap = {
    1: "Read a book recommended by a librarian",
    2: "Read a book with alliteration in the title", 
    3: "Read a book about time travel",
    4: "Read a memoir",
    5: "Read a science fiction novel",
    6: "Read a book with a one-word title",
    7: "Read a mystery or thriller",
    8: "Read a book published this year",
    9: "Read a graphic novel or comic",
    10: "Read a book with over 400 pages"
};

// Sample data for testing/fallback
export const sampleData = [
    { 
        name: "Caleb R.", 
        booksRead: 7, 
        books: [
            { title: "The Seven Husbands of Evelyn Hugo", olid: "OL58008787M", challenge: "Read a book recommended by a librarian" },
            { title: "Klara and the Sun", olid: "OL59403559M", challenge: "Read a book with alliteration in the title" },
            { title: "The Midnight Library", olid: "OL59403559M", challenge: "Read a book about time travel" },
            { title: "Educated", olid: "OL58008787M", challenge: "Read a memoir" },
            { title: "Dune", olid: "OL57572489M", challenge: "Read a science fiction novel" },
            { title: "Becoming", olid: "OL59403559M", challenge: "Read a biography" },
            { title: "The Alchemist", olid: "OL57572489M", challenge: "Read a philosophical book" }
        ]
    },
    { 
        name: "Sarah M.", 
        booksRead: 6, 
        books: [
            { title: "Where the Crawdads Sing", olid: "OL27958946M", challenge: "Read a book set in nature" },
            { title: "The Guest List", olid: "OL28088032M", challenge: "Read a mystery or thriller" },
            { title: "Atomic Habits", olid: "OL26431704M", challenge: "Read a self-help book" },
            { title: "The Silent Patient", olid: "OL27958952M", challenge: "Read a psychological thriller" },
            { title: "Normal People", olid: "OL26431710M", challenge: "Read a coming of age story" },
            { title: "The Vanishing Half", olid: "OL28088026M", challenge: "Read a book of historical fiction" }
        ]
    },
    { 
        name: "Emma K.", 
        booksRead: 3, 
        books: [
            { title: "The Invisible Life of Addie LaRue", olid: "OL28315479M", challenge: "Read a book that is a fantasy novel" },
            { title: "Circe", olid: "OL26430527M", challenge: "Read a book that is a mythological retelling" },
            { title: "The Song of Achilles", olid: "OL25152344M", challenge: "Read a book that has LGBTQ+ themes" }
        ]
    },
    { 
        name: "David L.", 
        booksRead: 2, 
        books: [
            { title: "Project Hail Mary", olid: "OL32338681M", challenge: "Read a book that is Science fiction" },
            { title: "The Thursday Murder Club", olid: "OL28088070M", challenge: "Read a book that is a cozy mystery" }
        ]
    },
    { 
        name: "Lisa P.", 
        booksRead: 2, 
        books: [
            { title: "Beach Read", olid: "OL27958934M", challenge: "Read a book that is a Romance novel" },
            { title: "The Dutch House", olid: "OL27312320M", challenge: "Read a book about a family saga" }
        ]
    },
    { 
        name: "Alex T.", 
        booksRead: 1, 
        books: [
            { title: "The Silent Patient", olid: "OL27958952M", challenge: "Read a book that is psychologically thrilling" }
        ]
    },
    { 
        name: "Kate J.", 
        booksRead: 1, 
        books: [
            { title: "Normal People", olid: "OL26431710M", challenge: "Read a book that is a coming of age story" }
        ]
    },
    { 
        name: "Robert S.", 
        booksRead: 1, 
        books: [
            { title: "The Vanishing Half", olid: "OL28088026M", challenge: "Read a book that is historical fiction" }
        ]
    }
];

// Sample reviews data
export const sampleReviewsData = [
    {
        title: "Dogtown",
        author: "Katherine Applegate; Gennifer Choldenko",
        isbn: "9781250811622",
        description: "A cute Nutmeg nominee that would be perfect for fans of Charlotte's Web. 4 Stars from Jessica O"
    },
    {
        title: "Hide",
        author: "Kiersten White",
        isbn: "9780593359235",
        description: "Thrilling adult horror that keeps you on edge. Perfect for fans of psychological suspense!"
    },
    {
        title: "Girl Mode",
        author: "Meredith Russo & Jessica Verdi",
        isbn: "9780593359235",
        description: "A powerful story about identity and finding yourself. Great for the \"character you love to hate\" challenge."
    }
];

// Global data storage
export let allData = [];
export let reviewsData = [];

/**
 * Function to expand truncated challenge text for display
 */
export function expandChallenge(challengeText) {
    if (!challengeText) return challengeText;
    
    // Add back the "Read a book" or "Read a" prefix for full context
    let expanded = challengeText.toLowerCase();
    
    // Handle special cases first
    if (expanded === 'memoir' || expanded === 'mystery or thriller' || expanded === 'graphic novel or comic') {
        return `Read a ${expanded}`;
    }
    
    // If it doesn't start with common patterns, add "Read a book"
    if (!expanded.startsWith('recommended by') && 
        !expanded.startsWith('with ') && 
        !expanded.startsWith('about ') && 
        !expanded.startsWith('published ') &&
        !expanded.startsWith('over ')) {
        return `Read a ${challengeText.toLowerCase()}`;
    }
    
    return `Read a book ${challengeText.toLowerCase()}`;
}

/**
 * Helper function to parse CSV row (handles commas in quotes)
 */
export function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Helper function to extract OLID from Open Library cover URL
 */
export function extractOLIDFromCoverURL(coverURL) {
    if (!coverURL) return 'OL12345678M'; // Default placeholder
    
    // Try to extract OLID from Open Library cover URL pattern
    // Pattern: https://covers.openlibrary.org/b/olid/OL12345678M-M.jpg
    const olidMatch = coverURL.match(/\/olid\/([A-Z0-9]+)-[A-Z]\.jpg/i);
    if (olidMatch) {
        return olidMatch[1];
    }
    
    // If no OLID found, return placeholder
    return 'OL12345678M';
}

/**
 * Helper function to extract ISBN from cover URL (if available)
 */
export function extractISBNFromCoverURL(coverURL) {
    if (!coverURL) return '';
    
    // Extract ISBN from Open Library cover URL pattern
    // Pattern: https://covers.openlibrary.org/b/isbn/1234567890-M.jpg
    const isbnMatch = coverURL.match(/\/isbn\/(\d+)-[A-Z]\.jpg/i);
    return isbnMatch ? isbnMatch[1] : '';
}

/**
 * Function to parse CSV data from Google Sheets
 */
export function parseCSVToLeaderboard(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Expected columns: Timestamp, Email, Name, Challenge, Title, Author, Stars, Review, CoverURL, CatalogURL, Status, Publish Flag
    // Column indices: 0=Timestamp, 1=Email, 2=Name, 3=Challenge, 4=Title, 5=Author, 6=Stars, 7=Review, 8=CoverURL, 9=CatalogURL, 10=Status, 11=Publish Flag
    const participants = {};
    const reviews = [];
    
    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        
        // Only process entries marked for publication (Column L - index 11)
        const isPublished = row[11] && row[11].toString().toUpperCase() === 'TRUE';
        if (!isPublished) continue; // Skip unpublished entries
        
        const email = row[1];
        const name = row[2];
        const challengeText = row[3]; // Truncated challenge text from sheet
        const bookTitle = row[4];
        const author = row[5];
        const stars = parseInt(row[6]) || 0;
        const review = row[7];
        const coverURL = row[8];
        const catalogURL = row[9]; // Column J
        const status = row[10]; // Column K
        
        // Group by email (unique identifier)
        if (!participants[email]) {
            participants[email] = {
                name: name,
                booksRead: 0,
                books: [],
                status: status // Add status to participant
            };
        }
        
        // Add book to participant with updated structure
        participants[email].booksRead++;
        participants[email].books.push({
            title: bookTitle,
            olid: extractOLIDFromCoverURL(coverURL), // Extract OLID from cover URL if available
            challenge: expandChallenge(challengeText), // Expand for display
            coverURL: coverURL,
            catalogURL: catalogURL && catalogURL.startsWith('http') ? catalogURL : null // Only use valid URLs
        });
        
        // Add to reviews if 4+ stars and has review text
        if (stars >= 4 && review && review.trim()) {
            reviews.push({
                title: bookTitle,
                author: author,
                isbn: extractISBNFromCoverURL(coverURL), // Extract ISBN if available
                description: `${review.trim()} - ${stars} Stars from ${name}`
            });
        }
    }
    
    // Convert participants object to array
    const participantArray = Object.values(participants);
    
    return { participants: participantArray, reviews: reviews };
}

/**
 * Function to fetch latest data from Google Sheets
 */
export async function fetchLatestData() {
    if (!CONFIG.SHEET_CSV_URL) {
        console.log('Sheet CSV URL not configured, using sample data');
        return { participants: sampleData, reviews: sampleReviewsData };
    }
    
    try {
        const response = await fetch(CONFIG.SHEET_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const newData = parseCSVToLeaderboard(csvText);
        
        // Update global data
        allData = newData.participants;
        reviewsData = newData.reviews;
        
        console.log(`Updated: ${allData.length} participants, ${reviewsData.length} reviews`);
        
        return newData;
        
    } catch (error) {
        console.error('Failed to fetch updates:', error);
        // Fall back to sample data if fetch fails
        if (allData.length === 0) {
            console.log('Using sample data as fallback');
            allData = sampleData;
            reviewsData = sampleReviewsData;
            return { participants: allData, reviews: reviewsData };
        }
        
        // Return existing data if we have it
        return { participants: allData, reviews: reviewsData };
    }
}

/**
 * Start polling for updates
 */
export function startPolling(onUpdate) {
    // Initial fetch
    fetchLatestData().then(onUpdate);
    
    if (CONFIG.SHEET_CSV_URL) {
        // Set up interval (only when page is visible)
        setInterval(async () => {
            if (!document.hidden) {
                const data = await fetchLatestData();
                onUpdate(data);
            }
        }, CONFIG.POLL_INTERVAL);
    }
}

/**
 * Update global data arrays
 */
export function setData(participants, reviews) {
    allData = participants;
    reviewsData = reviews;
}

/**
 * Get current data
 */
export function getData() {
    return { participants: allData, reviews: reviewsData };
}