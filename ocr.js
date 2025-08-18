async function performOCR(input, lang) {
    const worker = await Tesseract.createWorker(lang, 1, {
        workerPath: 'https://unpkg.com/tesseract.js@v5.1.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://unpkg.com/tesseract.js-core@v5.1.0/tesseract-core.wasm.js',
        logger: m => console.log(m.status, m.progress),
        workerBlobURL: false // For GitHub Pages compatibility
    }, { workers: 4 }); // 4 workers for speed

    try {
        const { data } = await worker.recognize(input, {
            tessedit_pageseg_mode: '6', // Single uniform block
            tessedit_create_hocr: '1' // Enable HOCR output
        });
        return data.hocr || '<p>No text detected.</p>';
    } finally {
        await worker.terminate();
    }
}