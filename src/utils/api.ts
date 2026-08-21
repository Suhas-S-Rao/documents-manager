export const loadFile = async (path: string): Promise<File | Error> => {
    const response = await window.api.documents.getFile(path);
    if (!response.success) {
        return Error(response.error);
    }
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return new File([blob], path.split('\\').pop() ?? 'document.pdf', { type: 'application/pdf' });
};

export const loadImage = async (path: string): Promise<File | Error> => {
    const response = await window.api.documents.getFile(path);
    if (!response.success) {
        return Error(response.error);
    }
    const extension = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
    };
    const blob = new Blob([response.data], { type: mimeTypes[extension ?? ''] ?? 'image/jpeg' });
    return new File([blob], path.split('\\').pop() ?? 'image.jpg', { type: blob.type });
};