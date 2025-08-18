async function performOCR(input, lang) {
    try {
        const { data: { text } } = await Tesseract.recognize(input, lang, {
            logger: m => console.log(m.status, m.progress),
            tessedit_pageseg_mode: '6', // Single uniform text block
            oem: '1' // LSTM engine
        });
        return text;
    } catch (error) {
        throw new Error('OCR processing failed: ' + error.message);
    }
}