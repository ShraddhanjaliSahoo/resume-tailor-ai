import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source path using unpkg CDN matching the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * @param file PDF File object
 * @returns Promise resolving to extracted string text
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let extractedText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      extractedText += pageText + '\n\n';
    }

    return extractedText.trim();
  } catch (error) {
    console.error('Failed to parse PDF:', error);
    throw new Error('Could not extract text from the PDF file. Please ensure it is a valid, unencrypted PDF.');
  }
}
