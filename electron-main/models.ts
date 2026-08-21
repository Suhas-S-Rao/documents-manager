interface Document {
    id: string;
    title: string;
    document_number: string | null;
    document_date: string | null;
    total_pages: number;
    notes: string | null;
    tagIds: string[];
    pdf: Uint8Array;
    file_path: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
    documentCount: number;
}

interface GoogleDriveSettings {
    enabled: boolean,
    folder_id: string | null,
    last_backup: string | null
}

interface ScannerSettings {
    id: string;
    scanner_id: string;
    scanner_name: string;
    dpi: number;
    color_mode: string;
    is_default: boolean;
    max_dpi: number;
}

export type { Document, GoogleDriveSettings, ScannerSettings, Tag };
