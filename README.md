Textify: Image to Text OCR App

Textify is a client-side web app for extracting text from images and PDFs using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.

Phase 1: MVP (Complete)





Features: Upload image, extract Punjabi text, display results.



Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing (Complete)





Features: Preprocessing with contrast, Otsu’s, blur, upscale in preprocess.js; Levenshtein metrics in metrics.js.



Accuracy: ~80% on printed Gurmukhi text.

Phase 3: Advanced Features (Curved Pages, PDF, UI)





Features:





Deskew/dewarp for curved pages using OpenCV.js in preprocess.js.



PDF support via PDF.js in pdf_handler.js.



Formatting detection (paragraphs) in format.js using HOCR.



Multi-language support (Punjabi, Hindi, English) in ocr.js.



Performance optimization with Tesseract workers.



Modern UI with Bootstrap.



Tech: HTML, JS (Tesseract.js, OpenCV.js, PDF.js), Bootstrap, CSS.



Structure: Modular with main.js, preprocess.js, ocr.js, format.js, pdf_handler.js, metrics.js.



Usage: Upload image/PDF, select language (Punjabi/Hindi/English/Multi), toggle preprocessing/debug, enter ground truth (optional), click "Extract Text".



Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).



Target: 80%+ accuracy on curved book pages and PDFs; <5 sec/page processing time.

Future Phases





Phase 4: Fine-tune Tesseract for Punjabi; optimize performance (e.g., custom .traineddata).

Setup Instructions





Clone repo: https://github.com/Tajinder-Heer/textify-ocr.



Open index.html via GitHub Pages.



Test with Gurmukhi/Hindi/English images or PDFs, especially curved book pages.



Use debug image to check preprocessing (deskew/dewarp quality).



Provide ground truth text for accuracy measurement.

Testing Notes





Test with 10-15 samples (curved book pages, PDFs, mixed languages).



Target: 80%+ accuracy on printed text; <5 sec/page.



Check console (F12 > Console) for errors.



Verify formatted output (paragraphs in <p> tags).