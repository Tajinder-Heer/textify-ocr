const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const dropZone = document.getElementById('dropZone');
const processBtn = document.getElementById('processBtn');
const previewImage = document.getElementById('previewImage');
const debugImage = document.getElementById('debugImage');
const previewText = document.getElementById('previewText');
const outputText = document.getElementById('outputText');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const timeEstimate = document.getElementById('timeEstimate');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const notification = document.getElementById('notification');
const preprocessCheckbox = document.getElementById('preprocess');
const blurCheckbox = document.getElementById('blur');
const debugCheckbox = document.getElementById('debug');
const groundTruthInput = document.getElementById('groundTruth');
const accuracy = document.getElementById('accuracy');

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

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeWorker();
});

// Browse button event
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change event
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
processBtn.addEventListener('click', processFile);

// Copy button event
copyBtn.addEventListener('click', copyText);

// Download button event
downloadBtn.addEventListener('click', downloadText);

// Clear button event
clearBtn.addEventListener('click', clearAll);

async function handleFileSelect(e) {
    selectedFile = fileInput.files[0];
    if (selectedFile) {
        if (!selectedFile.type.match('image/*|application/pdf')) {
            showNotification('Please select an image or PDF file.', 'error');
            return;
        }
        console.log('Input file:', selectedFile.name, 'Size:', selectedFile.size, 'bytes', 'Type:', selectedFile.type);
        // Preview file
        const reader = new FileReader();
        reader.onload = async function(e) {
            if (selectedFile.type === 'application/pdf') {
                try {
                    const arrayBuffer = e.target.result;
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    previewImage.src = canvas.toDataURL('image/png');
                    canvas.remove();
                } catch (err) {
                    showNotification('Failed to preview PDF: ' + err.message, 'error');
                }
            } else {
                previewImage.src = e.target.result;
            }
            if (debugBlobUrl) {
                URL.revokeObjectURL(debugBlobUrl);
                debugBlobUrl = null;
                debugImage.src = '';
                debugImage.classList.add('d-none');
            }
        };
        reader.readAsArrayBuffer(selectedFile); // Use ArrayBuffer for PDF compatibility
        // Enable process button
        processBtn.disabled = false;
        progressText.textContent = 'Ready to process';
        timeEstimate.textContent = 'Estimated time: 2-5 seconds';
        showNotification('File loaded successfully. Click Process to extract text.', 'success');
    }
}

async function processFile() {
    if (!selectedFile || !worker) return;
    console.log('Preprocessing enabled:', preprocessCheckbox.checked);
    console.log('Debug enabled:', debugCheckbox.checked);
    console.log('Blur enabled:', blurCheckbox.checked);
    // Reset UI
    progressBar.style.width = '0%';
    progressText.textContent = 'Processing file...';
    previewText.textContent = 'Processing...';
    outputText.textContent = '';
    accuracy.textContent = '';
    processBtn.disabled = true;
    copyBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    try {
        console.time('Total Processing');
        let text = '';
        if (selectedFile.type === 'application/pdf') {
            console.log('Processing PDF:', selectedFile.name);
            const arrayBuffer = await selectedFile.arrayBuffer();
            text = await processPDF(arrayBuffer, preprocessCheckbox.checked, blurCheckbox.checked, debugCheckbox.checked);
        } else {
            let input = selectedFile;
            if (preprocessCheckbox.checked) {
                console.time('Preprocessing');
                console.log('Starting preprocessing for image:', selectedFile.name);
                input = await new Promise((resolve, reject) => {
                    preprocessImage(selectedFile, (blob) => {
                        if (blob && blob.size > 0) {
                            console.log('Preprocessing complete, blob size:', blob.size);
                            resolve(blob);
                        } else {
                            reject(new Error('Preprocessing failed: Invalid blob'));
                        }
                    }, blurCheckbox.checked);
                });
                console.timeEnd('Preprocessing');
                if (debugCheckbox.checked && input) {
                    debugBlobUrl = URL.createObjectURL(input);
                    debugImage.src = debugBlobUrl;
                    debugImage.classList.remove('d-none');
                    requestAnimationFrame(() => {
                        debugImage.dispatchEvent(new Event('load'));
                        console.log('Debug image set, URL:', debugBlobUrl);
                    });
                }
            }
            console.time('OCR');
            text = await performOCR(input, 'pan');
            console.timeEnd('OCR');
        }
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
        console.timeEnd('Total Processing');
        showNotification('Text extraction completed successfully!', 'success');
    } catch (err) {
        console.error('Error:', err);
        progressText.textContent = 'Error processing file';
        showNotification('Error: ' + err.message, 'error');
    } finally {
        processBtn.disabled = false;
    }
}

function updateProgress(progress) {
    if (progress.status === 'recognizing text') {
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
    a.download = selectedFile.name.replace(/\.[^/.]+$/, '') + '-text.txt';
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
    progressText.textContent = 'Waiting for file...';
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