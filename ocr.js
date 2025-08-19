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

async function processPDF(arrayBuffer, preprocess, blur, debug) {
    try {
        console.time('PDF Processing');
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (pdf.numPages > 1) {
            showNotification('Only single-page PDFs are supported in this version.', 'warning');
        }
        const page = await pdf.getPage(1);
        // Try native text extraction
        const textContent = await page.getTextContent();
        let text = textContent.items.map(item => item.str).join(' ').trim();
        console.log('Native text length:', text.length);
        // If text is empty or minimal, assume scanned PDF and use OCR
        if (!text || text.length < 10) {
            console.log('PDF appears scanned, rendering to image for OCR');
            const viewport = page.getViewport({ scale: 1.0 }); // 100 DPI equivalent
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            let input = canvas;
            if (preprocess) {
                console.time('PDF Preprocessing');
                input = await new Promise((resolve, reject) => {
                    preprocessImage(canvas, (blob) => {
                        if (blob && blob.size > 0) {
                            console.log('PDF preprocessing complete, blob size:', blob.size);
                            resolve(blob);
                        } else {
                            reject(new Error('PDF preprocessing failed: Invalid blob'));
                        }
                    }, blur);
                });
                console.timeEnd('PDF Preprocessing');
                if (debug && input) {
                    const debugBlobUrl = URL.createObjectURL(input);
                    debugImage.src = debugBlobUrl;
                    debugImage.classList.remove('d-none');
                    requestAnimationFrame(() => {
                        debugImage.dispatchEvent(new Event('load'));
                        console.log('Debug PDF image set, URL:', debugBlobUrl);
                    });
                }
            }
            text = await performOCR(input, 'pan');
            canvas.remove();
        } else {
            console.log('PDF contains native text');
        }
        console.timeEnd('PDF Processing');
        return text || 'No text detected.';
    } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error('PDF processing failed: ' + error.message);
    }
}