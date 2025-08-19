Textify: Image to Text OCR App
Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
Phase 1: MVP (Complete)

Features: Upload image, extract Punjabi text, display results.
Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing with Contrast

Features:
Refined preprocessing: Contrast boost (+20%), Otsu’s adaptive threshold, 0.3px blur, capped upscale (1.5x) in preprocess.js.
OCR in ocr.js (PSM 6, OEM 1).
Levenshtein metric in metrics.js.
Main logic in main.js.
Debug to show preprocessed image.


Tech: HTML, JS (Tesseract.js, Canvas API), CSS.
Structure: Modular with separate JS files.
Usage: Upload Gurmukhi image, toggle preprocessing/debug, enter ground truth, click "Extract Text".
Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).
Target: 80%+ accuracy on printed Gurmukhi text.
Testing Notes: Use Gurmukhi samples (e.g., AnmolUni, Raavi fonts, low/high res). Check debug image for clear matras/conjuncts.

Future Phases

Phase 3: Add Hindi/English support; formatting detection (paragraphs/lines) in format.js; Bootstrap UI.
Phase 4: Fine-tune Tesseract for Punjabi; optimize performance.

Setup Instructions

Clone repo: https://github.com/Tajinder-Heer/textify-ocr.
Open index.html via GitHub Pages.
Test with Gurmukhi images; provide ground truth for accuracy.
Check debug image to ensure text clarity.
