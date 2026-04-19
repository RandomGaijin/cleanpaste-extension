const originalEl = document.getElementById("original");
const cleanedEl = document.getElementById("cleaned");
const cleanBtn = document.getElementById("cleanBtn");
const copyBtn = document.getElementById("copyBtn");
const statusEl = document.getElementById("status");
const readBtn = document.getElementById("readBtn");

//disable buttons when not usable
function updateUI() {
    cleanBtn.disabled = !originalEl.value.trim();
    copyBtn.disabled = !cleanedEl.value.trim();
}

// Code detection
function looksLikeCode(text) {
    return /[{}=<>;()]/.test(text) && /\n\s*\w+/.test(text);
}  

// Read clipboard on button click
readBtn.addEventListener("click", () => {
    console.log("read button clicked");
   
    navigator.clipboard.readText()
    .then(text => {
        if (!text) {
            statusEl.textContent = "Clipboard is empty.";
            return;
        }
        originalEl.value = text;
        statusEl.textContent = "Clipboard loaded ✓";
        updateUI();
    })
    .catch(err => {
        statusEl.textContent = "Clipboard error:" + err.message;
        console.error(err);
    });
});

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter" && !cleanBtn.disabled) {
        cleanBtn.click();
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
      
    const original = originalEl.value;
       
    if (!original) {
        statusEl.textContent = "Please paste text into the original box.";
        return;
    }

    let cleaned;
    
    // Skip cleaning for code
    
    if (looksLikeCode(original)) {
        cleaned = original; 
        cleanedEl.value = cleaned;
        cleanedEl.select();
        updateUI();
        statusEl.textContent = "Code detected – skipped";
        return;
    } else {
        cleaned = cleanText(original);
        
        if (cleaned === original) {
            statusEl.textContent = "Already clean ✓";
        } else {
           statusEl.textContent = "Cleaned ✓";
        }

    }   
    cleanedEl.value = cleaned;
    updateUI();

    try {
        if (cleaned !== original) {
            await navigator.clipboard.writeText(cleaned);
            statusEl.textContent = "Cleaned & Copied ✓";
        }
    } catch (err) {
        statusEl.textContent = "Failed to write to clipboard.";
        console.error(err);
    }
});

//typed input handler
originalEl.addEventListener("input", () => {
    cleanedEl.value = "";
    updateUI();
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
        statusEl.textContent = " Clipboard error: " + err.message;
        console.error(err);
    }
});
