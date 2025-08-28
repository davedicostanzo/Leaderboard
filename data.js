// data.js - Data management and API interactions
import { renderReviews } from './ui.js';

// Configuration
export const CONFIG = {
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/19lrKP2qffpZWjYkXfp4BVDs1wjkJc91OUD5Tw7acjI4/export?format=csv&gid=1299984813',
    POLL_INTERVAL: 60000
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
/*
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
    }
];

/* export const sampleReviewsData = [
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
*/

// Global data storage
export let allData = [];
export let reviewsData = [];
let lastSuccessfulFetch = null;

/**
 * Function to expand truncated challenge text for display
 */
export function expandChallenge(challengeText) {
    if (!challengeText) return challengeText;

    let expanded = challengeText;

    if (expanded === 'Memoir' || expanded === 'Mystery or Thriller' || expanded === 'Graphic Novel or Comic') {
        return expanded;
    }

    if (!expanded.startsWith('Recommended by') && 
        !expanded.startsWith('With ') && 
        !expanded.startsWith('About ') && 
        !expanded.startsWith('Published ') &&
        !expanded.startsWith('Over ')) {
        return expanded;
    }

    return expanded;
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
    if (!coverURL || coverURL === 'No Cover Available' || coverURL === 'Not Found' || coverURL === 'Fetch Error') {
        return null;
    }

    console.log('Extracting ID/OLID from:', coverURL);

    const patterns = [
        /\/id\/(\d+)-[A-Z]\.jpg/i,
        /\/olid\/([A-Z0-9]+)-[A-Z]\.jpg/i,
        /\/isbn\/(\d+)-[A-Z]\.jpg/i
    ];

    for (const pattern of patterns) {
        const match = coverURL.match(pattern);
        if (match) {
            console.log('Found ID/OLID:', match[1]);
            return match[1];
        }
    }

    console.log('No ID/OLID found, using default');
    return 'OL12345678M';
}

export function extractISBNFromCoverURL(coverURL) {
    if (!coverURL) return '';

    const isbnMatch = coverURL.match(/\/isbn\/(\d+)-[A-Z]\.jpg/i);
    return isbnMatch ? isbnMatch[1] : '';
}

export function parseCSVToLeaderboard(csvText) {
    console.log('=== PARSING CSV DATA ===');
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    console.log('Total lines:', lines.length);
    console.log('Headers:', headers);

    const participants = {};
    const reviews = [];

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        console.log(`Row ${i}:`, row);

        if (!row[12] || row[12].toUpperCase() !== 'TRUE') continue;

        const email = row[1];
        const name = row[2];
        const challengeText = row[3];
        const bookTitle = row[4];
        const author = row[5];
        const stars = parseInt(row[6]) || 0;
        const reviewText = row[7];
        const rawCoverURL = row[8];
        const catalogURL = row[9];
        const status = row[10];

        if (!email || !name || !bookTitle) continue;

        if (!participants[email]) {
            participants[email] = {
                name: name,
                booksRead: 0,
                books: [],
                status: status
            };
        }

        participants[email].booksRead++;

        let bookOLID = extractOLIDFromCoverURL(rawCoverURL);
        if (!bookOLID) bookOLID = 'OL12345678M';
        const finalCoverURL = rawCoverURL && rawCoverURL.startsWith('http')
            ? rawCoverURL
            : `https://covers.openlibrary.org/b/olid/${bookOLID}-M.jpg`;

        participants[email].books.push({
            title: bookTitle,
            olid: bookOLID,
            challenge: expandChallenge(challengeText),
            coverURL: finalCoverURL,
            catalogURL: catalogURL && catalogURL.startsWith('http') ? catalogURL : null
        });

 if (stars >= 4 && reviewText && reviewText.trim()) {
    console.log('=== CREATING REVIEW ===');
    console.log('Book title:', bookTitle);
    console.log('Raw cover URL from sheet:', rawCoverURL);
    console.log('Final cover URL being used:', finalCoverURL);
    console.log('OLID extracted:', bookOLID);
    console.log('Review text:', reviewText.trim());
    
    const reviewData = {
        title: bookTitle,
        author: author,
        olid: bookOLID,
        isbn: extractISBNFromCoverURL(rawCoverURL),
        description: `${reviewText.trim()} - ${stars} Stars from ${name}`,
        coverURL: finalCoverURL
    };
    
    console.log('Final review object:', reviewData);
    reviews.push(reviewData);
}
    }

console.log('=== FINAL PARSING RESULTS ===');
console.log('Total participants:', Object.values(participants).length);
console.log('Total reviews:', reviews.length);
console.log('Reviews data:', reviews);

// DIRECT FIX: Call renderReviews directly here
console.log('=== CALLING renderReviews DIRECTLY ===');
renderReviews(reviews);

return {
    participants: Object.values(participants),
    reviews: reviews
};
}

export async function fetchLatestData() {
    if (!CONFIG.SHEET_CSV_URL) {
        console.log('Sheet CSV URL not configured, skipping fetch');
        return { participants: allData, reviews: reviewsData };
    }

    try {
        console.log('Fetching data from:', CONFIG.SHEET_CSV_URL);
        const cacheBustUrl = `${CONFIG.SHEET_CSV_URL}&cb=${Date.now()}`;
        const response = await fetch(cacheBustUrl, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log('CSV data length:', csvText.length);

        if (csvText.length < 100) {
            throw new Error('CSV data appears to be too short/invalid');
        }

        const newData = parseCSVToLeaderboard(csvText);

        if (!newData || !Array.isArray(newData.participants)) {
            throw new Error('Invalid data structure from CSV parsing');
        }

        if (newData.participants.length >= 0) {
            allData = newData.participants;
            reviewsData = newData.reviews || [];
            lastSuccessfulFetch = Date.now();
            console.log('✓ Successfully updated:', allData.length, 'participants,', reviewsData.length, 'reviews');
        }

        return { participants: allData, reviews: reviewsData };

    } catch (error) {
        console.error('❌ Failed to fetch updates:', error);

        // Commented out fallback to sample data
        /*
        if (allData.length === 0 && lastSuccessfulFetch === null) {
            console.log('📋 Using sample data as initial fallback');
            allData = sampleData;
            reviewsData = sampleReviewsData;
        } else {
            console.log('📋 Keeping existing data due to fetch error');
        }
        */
        console.log('=== ABOUT TO RETURN FROM fetchLatestData ===');
        console.log('allData length:', allData.length);
        console.log('reviewsData length:', reviewsData.length);
        console.log('Returning object:', { participants: allData, reviews: reviewsData });
        
        return { participants: allData, reviews: reviewsData };
    }
}

export function startPolling(onUpdate) {
    console.log('=== STARTPOLLING CALLED ===');
    let hasInitialData = false;

    const initialFetch = async (retryCount = 0) => {
        try {
            console.log('=== CALLING fetchLatestData ===');
            const data = await fetchLatestData();
            console.log('=== RECEIVED DATA FROM fetchLatestData ===');
            console.log('Data received:', data);
            console.log('About to call onUpdate with:', data);
            onUpdate(data);
            hasInitialData = true;
            console.log('✅ Initial data loaded successfully');
        } catch (error) {
            console.error('❌ Initial fetch failed:', error);
            // ... rest of error handling
        }
    };

    initialFetch();

    if (CONFIG.SHEET_CSV_URL) {
        setInterval(async () => {
            if (!document.hidden && hasInitialData) {
                try {
                    const data = await fetchLatestData();
                    onUpdate(data);
                } catch (error) {
                    console.warn('⚠️ Polling update failed, keeping existing data:', error.message);
                }
            }
        }, CONFIG.POLL_INTERVAL);
    }
}

export function setData(participants, reviews) {
    allData = participants;
    reviewsData = reviews;
}

export function getData() {
    return { participants: allData, reviews: reviewsData };
}





