const getTextColor = (backgroundColor: string): '#000000' | '#FFFFFF' | '' => {
    if (backgroundColor) {
        const hex = backgroundColor.replace('#', '');

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness >= 128 ? '#000000' : '#FFFFFF';
    }
    return '';
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);

    return `${parseFloat(size.toFixed(2))} ${units[index]}`;
};


const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => { resolve(reader.result as string); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export { getTextColor, formatFileSize, fileToDataUrl };
