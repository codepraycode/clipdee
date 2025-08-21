// DOM elements
const loadingDiv = document.getElementById('loading');
const contentDiv = document.getElementById('content');
const errorDiv = document.getElementById('error');
const noWordDiv = document.getElementById('no-word');
const refreshBtn = document.getElementById('refresh');
const wordEl = document.getElementById('word');
const phoneticEl = document.getElementById('phonetic');
const definitionsEl = document.getElementById('definitions');

// Show different states
function showLoading() {
    hideAll();
    loadingDiv.style.display = 'block';
}

function showContent() {
    hideAll();
    contentDiv.style.display = 'block';
    refreshBtn.style.display = 'block';
}

function showError(message) {
    hideAll();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    refreshBtn.style.display = 'block';
}

function showNoWord() {
    hideAll();
    noWordDiv.style.display = 'block';
    refreshBtn.style.display = 'block';
}

function hideAll() {
    loadingDiv.style.display = 'none';
    contentDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    noWordDiv.style.display = 'none';
    refreshBtn.style.display = 'none';
}

// Read clipboard
async function readClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        return text.trim();
    } catch (err) {
        console.error('Failed to read clipboard:', err);
        throw new Error('Cannot access clipboard. Make sure to grant clipboard permissions.');
    }
}

// Extract word from clipboard text
function extractWord(text) {
    if (!text) return null;

    // Remove extra whitespace and get the last word
    const words = text.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return null;

    // Get the last word and clean it
    let word = words[words.length - 1];

    // Remove punctuation but keep hyphens and apostrophes for compound words
    word = word.replace(/[^\w\s'-]/g, '').toLowerCase();

    // Return only if it looks like a valid word
    return word.match(/^[a-z'-]{1,50}$/i) ? word : null;
}

// Fetch definition from API
async function fetchDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

        if (!response.ok) {
            throw new Error('Word not found in dictionary');
        }

        const data = await response.json();
        return data[0]; // Return the first result
    } catch (err) {
        console.error('Dictionary API error:', err);
        throw new Error(`Failed to fetch definition for "${word}"`);
    }
}

// Display the word and its definitions
function displayDefinition(wordData, originalWord) {
    wordEl.textContent = wordData.word || originalWord;

    // Show phonetic if available
    const phonetic = wordData.phonetic || (wordData.phonetics && wordData.phonetics[0]?.text);
    if (phonetic) {
        phoneticEl.textContent = phonetic;
        phoneticEl.style.display = 'block';
    } else {
        phoneticEl.style.display = 'none';
    }

    // Clear previous definitions
    definitionsEl.innerHTML = '';

    // Display meanings
    if (wordData.meanings && wordData.meanings.length > 0) {
        wordData.meanings.forEach((meaning, index) => {
            const partOfSpeech = meaning.partOfSpeech;

            meaning.definitions.slice(0, 3).forEach((def, defIndex) => { // Limit to 3 definitions per part of speech
                const defDiv = document.createElement('div');
                defDiv.className = 'definition';

                const posSpan = document.createElement('span');
                posSpan.className = 'part-of-speech';
                posSpan.textContent = `(${partOfSpeech})`;

                defDiv.appendChild(posSpan);
                defDiv.appendChild(document.createTextNode(def.definition));

                // Add example if available
                if (def.example) {
                    const exampleDiv = document.createElement('div');
                    exampleDiv.style.fontStyle = 'italic';
                    exampleDiv.style.fontSize = '12px';
                    exampleDiv.style.marginTop = '4px';
                    exampleDiv.style.opacity = '0.8';
                    exampleDiv.textContent = `"${def.example}"`;
                    defDiv.appendChild(exampleDiv);
                }

                definitionsEl.appendChild(defDiv);
            });
        });
    } else {
        definitionsEl.textContent = 'No definitions found.';
    }
}

// Main function to get and display definition
async function getDefinition() {
    showLoading();

    try {
        // Read clipboard
        const clipboardText = await readClipboard();

        if (!clipboardText) {
            showNoWord();
            return;
        }

        // Extract word
        const word = extractWord(clipboardText);

        if (!word) {
            showError('No valid word found in clipboard');
            return;
        }

        // Fetch and display definition
        const definition = await fetchDefinition(word);
        displayDefinition(definition, word);
        showContent();

    } catch (err) {
        showError(err.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', getDefinition);
refreshBtn.addEventListener('click', getDefinition);

// Store the last processed word to avoid unnecessary API calls
let lastProcessedWord = '';

// Check if we should refresh (optional enhancement)
async function shouldRefresh() {
    try {
        const clipboardText = await readClipboard();
        const word = extractWord(clipboardText);
        return word !== lastProcessedWord;
    } catch {
        return true;
    }
}