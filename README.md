Textify: Image to Text OCR App
Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
Phase 1: MVP (Complete)

Features: Upload image, extract Punjabi text, display results.
Accuracy: ~60% on printed Punjabi text.

Phase 2: Optimized Preprocessing and Accuracy Metrics

Features:
Modular preprocessing (adaptive thresholding, resizing) in preprocess.js.
OCR with Tesseract config (PSM 6, OEM 1) in ocr.js.
Levenshtein distance accuracy metric in metrics.js.
Main logic in main.js.
Debug option to show preprocessed image.


Tech: HTML, JS (Tesseract.js, Canvas API), CSS.
Structure: Modular with separate JS files for each feature.
Usage: Open via GitHub Pages, upload a Punjabi image, toggle preprocessing/debug, enter ground truth (optional), click "Extract Text".
Hosting: GitHub Pages (username.github.io/textify-ocr).
Target: 80%+ accuracy on clear printed text.

Future Phases

Phase 3: Add Hindi/English support; implement formatting detection (paragraphs/lines) using HOCR in format.js; add Bootstrap UI.
Phase 4: Fine-tune Tesseract models for Punjabi; optimize performance.

Setup Instructions

Clone or access repo: https://github.com/<your-username>/textify-ocr.
Open index.html via GitHub Pages or locally.
Upload a clear Punjabi image; toggle preprocessing/debug; enter ground truth for accuracy.

Testing

Test with 10-15 Punjabi images (printed, varied quality).
Check console for logs (F12 > Console).
Use ground truth text to see Levenshtein accuracy.
Target: 80%+ accuracy with preprocessing (vs. 60% in Phase 1).
