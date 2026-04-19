const originalEl = document.getElementById("original");
const cleanedEl = document.getElementById("cleaned");
const cleanBtn = document.getElementById("cleanBtn");
const copyBtn = document.getElementById("copyBtn");
const statusEl = document.getElementById("status");
const readBtn = document.getElementById("readBtn");

// Code detection
function looksLikeCode(text) {
    return /[{}=<>;()]/.test(text) && text.includes('\n');
}  

// Read clipboard on button click
readBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        
        if (!text) {
            statusEl.textContent = "Clipboard is empty.";
            return;
        }

        originalEl.value = text;
        statusEl.textContent = "Clipboard loaded. You can clean it now.";

    } catch (err) {
        statusEl.textContent = "Failed to read clipboard.";
        console.error(err);
    }
});

// Clean the text
function cleanText(text) {
    return text
    // Normalize quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

    //Fix hyphenated line breaks
    .replace(/-\s*\n\s*/g, '')

    //merge broken lines (but keep paragraphs)
    .replace(/([a-z0-9])\n([a-z0-9])/gi, '$1 $2')

    //preserve paragraphs
    .replace(/\n{2,}/g, '\n\n')

    // Remove extra whitespace
    .replace(/[ \t]+/g, ' ')

    //trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')

    // Trim leading/trailing whitespace
    .trim();
}

// Clean button click handler
cleanBtn.addEventListener("click", async () => {
    console.log("Clean button clicked");
      
    const original = originalEl.value;
       
    if (!original) {
        statusEl.textContent = "Please paste text into the original box.";
        return;
    }

    let cleaned;
    
    if (looksLikeCode(original)) {
        cleaned = original; // Skip cleaning for code
        statusEl.textContent = "Code detected. Skipping cleaning.";
    } else {
        cleaned = cleanText(original);
        
        if (cleaned === original) {
            statusEl.textContent = "Text is already clean.";
        } else {
           statusEl.textContent = "Text cleaned. You can copy it now.";
        }

    }   
    cleanedEl.value = cleaned;

    try {
        await navigator.clipboard.writeText(cleaned);
        statusEl.textContent += " Clipboard cleaned ✓";
    } catch (err) {
        statusEl.textContent = "Failed to write to clipboard.";
        console.error(err);
    }
});

// Copy cleaned manually
copyBtn.addEventListener("click", async () => {
    const cleaned = cleanedEl.value;
    if (!cleaned) {
        statusEl.textContent = "No cleaned text to copy.";
        return;
    }
    try {
        await navigator.clipboard.writeText(cleaned);
        statusEl.textContent = "Copied ✓";
    } catch (err) {
        statusEl.textContent = "Failed to copy to clipboard.";
        console.error(err);
    }
});

//Init
//loadClipboard();