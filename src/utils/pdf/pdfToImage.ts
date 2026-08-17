import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export const pdfToImages = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const images: string[] = [];

    const MAX_WIDTH = 5000;
    const MAX_HEIGHT = 7000;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(MAX_WIDTH / baseViewport.width, MAX_HEIGHT / baseViewport.height);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext('2d', { alpha: false });

        if (!context) {
            continue;
        }

        await page.render({ canvasContext: context, viewport }).promise;

        const image = canvas.toDataURL('image/jpeg', 0.95);

        if (image !== 'data:,') {
            images.push(image);
        }

        canvas.width = 0;
        canvas.height = 0;
    }

    return images;
};