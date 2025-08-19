async function performOCR(input, lang) {
    try {
        console.time('Tesseract Initialization');
        console.time('Tesseract Language Loading');
        const worker = await Tesseract.createWorker(lang, 1, {
            workerPath: './worker.min.js',
            langPath: './', // Try local first
            corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
            logger: m => console.log(m.status, m.progress),
            cachePath: './',
            cacheMethod: 'write',
            workerId: 'textify-worker' // Force single worker
        });
        console.timeEnd('Tesseract Language Loading');
        console.timeEnd('Tesseract Initialization');

        try {
            console.time('Tesseract Recognition');
            const { data: { text } } = await worker.recognize(input, {
                tessedit_pageseg_mode: '4', // Single text line for small images
                oem: '1',
                user_defined_dpi: '100' // Lower DPI for speed
            });
            console.timeEnd('Tesseract Recognition');
            return text || 'No text detected.';
        } finally {
            await worker.terminate();
        }
    } catch (error) {
        console.error('OCR error:', error);
        // Fallback to remote langPath if local fails
        if (error.message.includes('Failed to load resource') || error.message.includes('traineddata')) {
            console.warn('Local pan.traineddata failed, trying remote');
            const worker = await Tesseract.createWorker(lang, 1, {
                workerPath: './worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
                logger: m => console.log(m.status, m.progress),
                cachePath: './',
                cacheMethod: 'write',
                workerId: 'textify-worker'
            });
            try {
                console.time('Tesseract Recognition Fallback');
                const { data: { text } } = await worker.recognize(input, {
                    tessedit_pageseg_mode: '4',
                    oem: '1',
                    user_defined_dpi: '100'
                });
                console.timeEnd('Tesseract Recognition Fallback');
                return text || 'No text detected.';
            } finally {
                await worker.terminate();
            }
        }
        throw new Error('OCR processing failed: ' + error.message);
    }
}