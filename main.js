let selectedFile = null;
let debugBlobUrl = null;

// Initialize Tesseract worker
let worker = null;
async function initializeWorker() {
    try {
        console.time('Tesseract Initialization');
        worker = await Tesseract.createWorker({
            langPath: './', // Local traineddata
            logger: m => {
                console.log(m.status, m.progress);
                updateProgress(m);
            }
        });
        await worker.load();
        await worker.loadLanguage('pan');
        await worker.initialize('pan');
        console.timeEnd('Tesseract Initialization');
        console.log('Worker initialized');
    } catch (err) {
        console.error('Failed to initialize worker:', err);
        showNotification('Failed to initialize OCR engine: ' + err.message, 'error');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeWorker();
});

// Browse button event
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

- File input change event
fileInput.addEventListener('change', handleFileSelect);

// Drop zone events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(93, 156, 236, 0.1)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect(e);
    }
});

// Process button event
processBtn.addEventListener('click', processImage);

// Copy button event
copyBtn.addEventListener('click', copyText);

// Download button event
downloadBtn.addEventListener('click', downloadText);

// Clear button event
clearBtn.addEventListener('click', clearAll);

function handleFileSelect(e) {
    selectedFile = fileInput.files[0];
    if (selectedFile) {
        if (!selectedFile.type.match('image.*')) {
            showNotification('Please select an image file.', 'error');
            return;
        }
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
        
        // Enable process button
        processBtn.disabled = false;
        progressText.textContent = 'Ready to process';
        timeEstimate.textContent = 'Estimated time: 5-15 seconds';
        
        showNotification('Image loaded successfully. Click Process to extract text.', 'success');
    }
}

async function processImage() {
    if (!selectedFile || !worker) return;
    
    // Reset UI
    progressBar.style.width = '0%';
    progressText.textContent = 'Processing image...';
    previewText.textContent = 'Processing...';
    outputText.textContent = '';
    processBtn.disabled = true;
    
    try {
        let input = selectedFile;
        if (preprocessCheckbox.checked) {
            input = await new Promise((resolve, reject) => {
                preprocessImage(selectedFile, (blob) => {
                    if (blob && blob.size > 0) {
                        resolve(blob);
                    } else {
                        reject(new Error('Preprocessing failed: Invalid blob'));
                    }
                }, blurCheckbox.checked);
            });
            if (debugCheckbox.checked && input) {
                debugBlobUrl = URL.createObjectURL(input);
                debugImage.src = debugBlobUrl;
                debugImage.classList.remove('d-none');
            }
        }
        const text = await performOCR(input, 'pan');
        // Display results
        previewText.textContent = text || 'No text detected.';
        outputText.textContent = text || 'No text detected.';
        
        // Show action buttons
        copyBtn.style.display = 'inline-flex';
        downloadBtn.style.display = 'inline-flex';
        
        if (groundTruthInput.value) {
            const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
            accuracy.textContent = `Accuracy: ${acc.toFixed(2)}%`;
        }
        
        showNotification('Text extraction completed successfully!', 'success');
    } catch (err) {
        progressText.textContent = 'Error processing image';
        showNotification('Error: ' + err.message, 'error');
    } finally {
        processBtn.disabled = false;
    }
}

function updateProgress(progress) {
    if (progress.status == 'recognizing text') {
        const percent = Math.floor(progress.progress * 100);
        progressBar.style.width = percent + '%';
        progressText.textContent = `Processing: ${percent}%`;
        
        if (percent < 95) {
            const remaining = Math.round((100 - percent) / 5);
            timeEstimate.textContent = `Estimated time remaining: ${remaining}s`;
        } else {
            timeEstimate.textContent = 'Finishing up...';
        }
    }
}

function copyText() {
    const text = outputText.textContent;
    if (!text || text.trim() === '') {
        showNotification('No text to copy', 'error');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Text copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy text: ' + err.message, 'error');
    });
}

function downloadText() {
    const text = outputText.textContent;
    if (!text || text.trim() === '') {
        showNotification('No text to download', 'error');
        return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'punjabi-text.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    showNotification('Text downloaded successfully!', 'success');
}

function clearAll() {
    fileInput.value = '';
    previewImage.src = '';
    debugImage.src = '';
    debugImage.classList.add('d-none');
    if (debugBlobUrl) {
        URL.revokeObjectURL(debugBlobUrl);
        debugBlobUrl = null;
    }
    previewText.textContent = 'Extracted text will appear here...';
    outputText.textContent = '';
    groundTruthInput.value = '';
    accuracy.textContent = '';
    progressBar.style.width = '0%';
    progressText.textContent = 'Waiting for image...';
    timeEstimate.textContent = '';
    processBtn.disabled = true;
    copyBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    showNotification('All fields cleared', 'success');
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}