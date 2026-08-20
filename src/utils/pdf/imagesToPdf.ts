import { PDFDocument } from 'pdf-lib';

export const imagesToPdf = async (images: string[]): Promise<Uint8Array> => {

    const pdfDoc = await PDFDocument.create();
    for (const imageData of images) {
        const base64 = imageData.substring(imageData.indexOf(',') + 1);
        const binary = atob(base64);
        const imageBytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            imageBytes[i] = binary.charCodeAt(i);
        }
        let image: any;
        if (imageData.startsWith('data:image/png')) {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            image = await pdfDoc.embedJpg(imageBytes);
        }
        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
    }

    return await pdfDoc.save();
};