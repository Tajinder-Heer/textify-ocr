async function performOCR(input, lang) {
    try {
        console.time('Tesseract Recognition');
        const { data: { text } } = await worker.recognize(input);
        console.timeEnd('Tesseract Recognition');
        return text || 'No text detected.';
    } catch (error) {
        console.error('OCR error:', error);
        // Fallback to remote langPath if local fails
        if (error.message.includes('Failed to load resource') || error.message.includes('traineddata')) {
            console.warn('Local pan.traineddata failed, trying remote');
            console.time('Tesseract Fallback Initialization');
            const fallbackWorker = await Tesseract.createWorker({
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                logger: m => console.log(m.status, m.progress)
            });
            await fallbackWorker.load();
            await fallbackWorker.loadLanguage('pan');
            await fallbackWorker.initialize('pan');
            console.timeEnd('Tesseract Fallback Initialization');
            try {
                console.time('Tesseract Recognition Fallback');
                const { data: { text } } = await fallbackWorker.recognize(input);
                console.timeEnd('Tesseract Recognition Fallback');
                return text || 'No text detected.';
            } finally {
                await fallbackWorker.terminate();
            }
        }
        throw new Error('OCR processing failed: ' + error.message);
    }
}