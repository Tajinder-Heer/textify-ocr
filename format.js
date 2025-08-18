function formatHOCR(hocr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(hocr, 'text/html');
    const paragraphs = doc.querySelectorAll('.ocr_par');
    let formatted = '';
    paragraphs.forEach(par => {
        const text = par.innerText.trim();
        if (text) formatted += `<p>${text}</p>`;
    });
    return formatted || '<p>No text detected.</p>';
}