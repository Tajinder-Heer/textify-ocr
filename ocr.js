async function performOCR(input, lang) {
    try {
        const { data: { text } } = await Tesseract.recognize(input, lang, {
            logger: m => console.log(m.status, m.progress),
            tessedit_pageseg_mode: '6',
            oem: '1'
        });
        return text;
    } catch (error) {
        throw new Error('OCR processing failed: ' + error.message);
    }
}