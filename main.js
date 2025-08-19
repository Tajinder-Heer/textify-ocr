const upload = document.getElementById('upload');
const preprocessCheckbox = document.getElementById('preprocess');
const debugCheckbox = document.getElementById('debug');
const groundTruthInput = document.getElementById('groundTruth');
const processBtn = document.getElementById('process');
const result = document.getElementById('result');
const accuracy = document.getElementById('accuracy');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const debugImage = document.getElementById('debugImage');

let selectedFile = null;

upload.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
});

processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        errorDiv.textContent = 'Please upload an image first.';
        errorDiv.classList.remove('d-none');
        return;
    }
    loading.classList.remove('d-none');
    errorDiv.classList.add('d-none');
    result.innerText = '';
    accuracy.innerText = '';
    debugImage.style.display = 'none';

    try {
        let input = selectedFile;
        if (preprocessCheckbox.checked) {
            input = await new Promise((resolve) => preprocessImage(selectedFile, resolve));
            if (debugCheckbox.checked) {
                debugImage.src = URL.createObjectURL(input);
                debugImage.style.display = 'block';
            }
        }
        const text = await performOCR(input, 'pan');
        result.innerText = text || 'No text detected.';
        if (groundTruthInput.value) {
            const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
            accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error processing image. Check console for details.';
        errorDiv.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
});