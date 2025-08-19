const upload = document.getElementById('upload');
const preprocessCheckbox = document.getElementById('preprocess');
const blurCheckbox = document.getElementById('blur');
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
        console.time('Total Processing');
        let input = selectedFile;
        if (preprocessCheckbox.checked) {
            console.time('Preprocessing');
            input = await new Promise((resolve, reject) => {
                preprocessImage(selectedFile, (blob) => {
                    if (blob) {
                        console.log('Preprocessing complete, blob size:', blob.size);
                        resolve(blob);
                    } else {
                        reject(new Error('Preprocessing failed: No blob generated'));
                    }
                }, blurCheckbox.checked);
            });
            console.timeEnd('Preprocessing');
            if (debugCheckbox.checked && input) {
                setTimeout(() => {
                    debugImage.src = URL.createObjectURL(input);
                    debugImage.style.display = 'block';
                    console.log('Debug image set');
                }, 0);
            }
        }
        console.time('OCR');
        const text = await performOCR(input, 'pan');
        console.timeEnd('OCR');
        result.innerText = text || 'No text detected.';
        if (groundTruthInput.value) {
            const acc = calculateLevenshteinAccuracy(groundTruthInput.value, text);
            accuracy.innerText = `Accuracy: ${acc.toFixed(2)}%`;
        }
        console.timeEnd('Total Processing');
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error processing image: ' + error.message;
        errorDiv.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }
});