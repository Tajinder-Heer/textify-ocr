Textify: Image to Text OCR App

Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.

Phase 1: MVP (Complete)





Features: Upload image, extract Punjabi text, display results.



Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing (Complete)





Features: Preprocessing (contrast +20%, Otsu’s, optional 0.3px blur, upscale), Tesseract.js OCR (PSM 6, OEM 1), Levenshtein accuracy, debug image.



Accuracy: ~80% on printed Gurmukhi text.

Phase 2.1: UI and Performance Improvements





Features:





Modern UI with Bootstrap 5.3 (card layout, progress bar, alerts).



Performance: Capped image size (800px), reduced upscale (1.1x), optional blur, single Tesseract worker, PSM 3.



Local worker.min.js to avoid CORS.



Debug image preview fixed.



Tech: HTML, JS (Tesseract.js, Canvas API), Bootstrap, CSS.



Structure: index.html, styles.css, main.js, preprocess.js, ocr.js, metrics.js, worker.min.js.



Usage: Upload Gurmukhi image, toggle preprocessing/blur/debug, enter ground truth, click "Extract Text".



Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).



Target: 80%+ accuracy, <5 sec/image.

Future Steps





Add PDF support (PDF.js).



Handle curved pages (basic deskew).



Add Hindi/English support.



Enhance formatting (HOCR for paragraphs).

Setup Instructions





Clone repo: https://github.com/Tajinder-Heer/textify-ocr.



Add worker.min.js (download from https://unpkg.com/tesseract.js@v5.1.0/dist/worker.min.js).



Open index.html via GitHub Pages.



Test with Gurmukhi images (e.g., AnmolUni, Raavi fonts, <2MB).



Check debug image for text clarity.



Provide ground truth for accuracy.

Testing Notes





Test with 10-15 Gurmukhi images (printed, mix clear/noisy).



Target: 80%+ accuracy, <5 sec/image.



Check console (F12 > Console) for errors.



Verify UI (responsive, modern) and debug image preview.