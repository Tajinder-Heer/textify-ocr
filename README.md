Textify: Image to Text OCR App
Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
Phase 1: MVP

Features: Upload image, extract Punjabi text, display results.
Tech: HTML, JS (Tesseract.js via CDN), CSS.
Structure: Modular with separate index.html, styles.css, script.js.
Usage: Open via GitHub Pages, upload a Punjabi image, click "Extract Text".
Hosting: GitHub Pages (username.github.io/textify-ocr).

Future Phases

Phase 2: Add image preprocessing (e.g., Canvas API) for better accuracy.
Phase 3: Support Hindi and English; enhance UI (e.g., Bootstrap).
Phase 4: Fine-tune Tesseract models for Punjabi; optimize performance.

Setup Instructions

Clone or access repo: https://github.com/<your-username>/textify-ocr.
Open index.html via GitHub Pages or locally.
Upload a clear Punjabi image (printed text recommended).

Testing

Test with 5-10 Punjabi images.
Check console for logs (F12 > Console).
Target: 70%+ accuracy on clear printed text.
