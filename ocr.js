async function performOCR(input, lang) {
    try {
        const { data: { text } } = await Tesseract.recognize(input, lang, {
            logger: m => console.log(m.status, m.progress)
        });
        return text;
    } catch (error) {
        throw new Error('OCR processing failed: ' + error.message);
    }
}