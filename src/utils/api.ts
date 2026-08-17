const loadFile = async (path: string) => {

    const buffer = await window.api.documents.getFile(path);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const file = new File([blob], path.split('\\').pop() + '.pdf', { type: 'application/pdf' });
    return file;
};

export { loadFile };