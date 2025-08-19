const upload = document.getElementById('upload');
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
        alert('Please upload an image first.');
        return;
    }
    loading.style.display = 'block';
    result.innerText = '';
    accuracy.innerText = '';
    debugImage.style.display = 'none';

    try {
        let input = selectedFile;
        if (preprocessCheckbox.checked) {
            preprocessImage(input, async (blob) => {
                try {
                    if (debugCheckbox.checked) {
                        debugImage.src = URL.createObjectURL(blob);
                        debugImage.style.display = 'block';
                    }
                    const text = await performOCR(blob, 'pan');
                    result.innerText = text || 'No text detected.';
                    if (groundTruthInput.value) {
                        const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
                        accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
                    }
                } catch (error) {
                    console.error('OCR Error:', error);
                    alert('Error processing image. Check console.');
                } finally {
                    loading.style.display = 'none';
                }
            });
        } else {
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
        alert('Error processing image. Check console.');
        loading.style.display = 'none';
    }
});