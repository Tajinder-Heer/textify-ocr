const upload = document.getElementById('upload');
const preprocessCheckbox = document.getElementById('preprocess');
const groundTruthInput = document.getElementById('groundTruth');
const processBtn = document.getElementById('process');
const result = document.getElementById('result');
const accuracy = document.getElementById('accuracy');
const loading = document.getElementById('loading');

let selectedFile = null;

upload.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
});

processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please upload an image first.');
        return;
    }
    loading.style.display = 'block';
    result.innerText = '';
    accuracy.innerText = '';

    try {
        let input = selectedFile;
        if (preprocessCheckbox.checked) {
            // Preprocess image
            preprocessImage(input, async (blob) => {
                try {
                    const text = await performOCR(blob, 'pan');
                    result.innerText = text || 'No text detected.';
                    if (groundTruthInput.value) {
                        const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
                        accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
                    }
                } catch (error) {
                    console.error('OCR Error:', error);
                    alert('Error processing image.');
                } finally {
                    loading.style.display = 'none';
                }
            });
        } else {
            // No preprocessing
            const text = await performOCR(input, 'pan');
            result.innerText = text || 'No text detected.';
            if (groundTruthInput.value) {
                const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
                accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
            }
            loading.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image.');
        loading.style.display = 'none';
    }
});