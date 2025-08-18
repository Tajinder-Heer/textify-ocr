async function performOCR(input, lang) {
    try {
        const worker = await Tesseract.createWorker(lang, 1, {
            workerPath: './worker.min.js', // Local worker script
            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
            corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
            logger: m => console.log(m.status, m.progress),
            workerBlobURL: false
        }, { workers: 4 });

        try {
            const { data } = await worker.recognize(input, {
                tessedit_pageseg_mode: '6',
                tessedit_create_hocr: '1'
            });
            return data.hocr || '<p>No text detected.</p>';
        } finally {
            await worker.terminate();
        }
    } catch (error) {
        console.error('OCR error:', error);
        throw new Error('OCR processing failed: ' + error.message);
    }
}