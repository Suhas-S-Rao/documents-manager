interface CreateDocumentRequest {
    id: string
    title: string;
    document_number: string | null;
    document_date: string | null;
    notes: string | null;
    total_pages: number | 0;
    file: File;
    tagIds: string[];
}

interface Document {
    id: string;
    title: string;
    document_number: string | null;
    document_date: string | null;
    notes: string | null;
    tagIds: string[];
    pages: Page[];
    total_pages: number | 0;
    file_path: string;
    file_size: number;
    isNew: boolean;
}

interface DocumentRequest {
    id: string;
    title: string;
    document_number: string | null;
    document_date: string | null;
    notes: string | null;
    tagIds: string[];
    total_pages: number;
    pdf: Uint8Array;
    file_path: string;
}

interface Page {
    id: string;
    history: string[];
    activeHistory: number;
}

interface Scanner {
    id: string;
    scanner_id: string;
    scanner_name: string;
    dpi: number;
    color_mode: string;
    is_default: boolean;
    max_dpi: number;
}

type ScannerColor = "color" | "gray" | "bw";

type DPI = 75 | 100 | 150 | 200 | 300 | 400 | 600 | 800 | 1200 | 2400 | 4800;

interface Tag {
    id: string;
    name: string;
    color: string;
    documentCount: number;
}

type PageSize = "5" | "10" | "20" | "50" | "100" | "All";

interface GoogleDriveSettings {
    enabled: boolean,
    folder_id: string | null,
    last_backup: string | null
}

interface Settings {
    scanner: Scanner[],
    google: GoogleDriveSettings
}

interface Loader {
    id: string,
    message?: string,
    progress?: number
}

interface DetectedScanners {
    scanner_id: string,
    scanner_name: string,
    max_dpi: number
}

export type { CreateDocumentRequest, DetectedScanners, Document, DocumentRequest, DPI, GoogleDriveSettings, Loader, Page, PageSize, Scanner, ScannerColor, Settings, Tag };

