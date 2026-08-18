export const loadFile = async (path: string): Promise<File | Error> => {
    const response = await window.api.documents.getFile(path);
    if (!response.success) {
        return Error(response.error);
    }
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return new File([blob], path.split('\\').pop() ?? 'document.pdf', { type: 'application/pdf' });
};