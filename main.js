const upload = document.getElementById('upload');
const langSelect = document.getElementById('lang');
const preprocessCheckbox = document.getElementById('preprocess');
const debugCheckbox = document.getElementById('debug');
const groundTruthInput = document.getElementById('groundTruth');
const processBtn = document.getElementById('process');
const result = document.getElementById('result');
const accuracy = document.getElementById('accuracy');
const loading = document.getElementById('loading');
const debugImage = document.getElementById('debugImage');

let selectedFile = null;

upload.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
});

processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please upload an image or PDF first.');
        return;
    }
    loading.classList.remove('d-none');
    result.innerHTML = '';
    accuracy.innerText = '';
    debugImage.style.display = 'none';

    try {
        const lang = langSelect.value;
        let inputs = [];
        if (selectedFile.type === 'application/pdf') {
            inputs = await handlePDF(selectedFile); // Get array of page blobs
        } else {
            inputs = [selectedFile];
        }

        let fullText = '';
        for (let i = 0; i < inputs.length; i++) {
            let processedInput = inputs[i];
            if (preprocessCheckbox.checked) {
                processedInput = await new Promise(resolve => preprocessImage(inputs[i], resolve));
                if (debugCheckbox.checked && i === 0) { // Show first page/image only
                    debugImage.src = URL.createObjectURL(processedInput);
                    debugImage.style.display = 'block';
                }
            }
            const rawText = await performOCR(processedInput, lang);
            const formattedText = formatHOCR(rawText); // Parse HOCR to HTML
            fullText += `<h5>Page ${i + 1}</h5>${formattedText}<hr>`;
        }
        result.innerHTML = fullText || '<p>No text detected.</p>';
        if (groundTruthInput.value) {
            const acc = calculateLevenshteinAccuracy(groundTruthInput.value, fullText.replace(/<[^>]+>/g, '')); // Strip HTML
            accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing file. Check console.');
    } finally {
        loading.classList.add('d-none');
    }
});