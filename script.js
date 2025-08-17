const upload = document.getElementById('upload');
const processBtn = document.getElementById('process');
const result = document.getElementById('result');
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
    try {
        const { data: { text } } = await Tesseract.recognize(selectedFile, 'pan', {
            logger: m => console.log(m.status, m.progress)
        });
        result.innerText = text || 'No text detected.';
    } catch (error) {
        console.error('OCR Error:', error);
        alert('Error processing image. Check console for details.');
    } finally {
        loading.style.display = 'none';
    }
});
