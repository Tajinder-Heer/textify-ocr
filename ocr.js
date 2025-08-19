async function performOCR(input, lang) {
    try {
        const worker = await Tesseract.createWorker(lang, 1, {
            workerPath: './worker.min.js',
            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
            corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
            logger: m => console.log(m.status, m.progress)
        });

        try {
            const { data: { text } } = await worker.recognize(input, {
                tessedit_pageseg_mode: '3',
                oem: '1'
            });
            return text || 'No text detected.';
        } finally {
            await worker.terminate();
        }
    } catch (error) {
        console.error('OCR error:', error);
        throw new Error('OCR processing failed: ' + error.message);
    }
}