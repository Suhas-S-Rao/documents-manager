import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const getDocumentFolder = () => {
    return path.join(app.getPath('userData'), 'documents');
};

const savePdf = async (buffer: Buffer, fileName: string) => {
    const folder = getDocumentFolder();
    fs.mkdirSync(folder, { recursive: true });
    const filePath = path.join(folder, fileName);
    fs.writeFileSync(filePath, buffer);
    const fileSize = buffer.length;
    return { filePath, fileSize };
};

const deletePdf = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const replacePdf = async (buffer: Buffer, filePath: string) => {
    fs.writeFileSync(filePath, buffer);
    return { fileSize: buffer.length };
};

export { deletePdf, getDocumentFolder, savePdf, replacePdf };
