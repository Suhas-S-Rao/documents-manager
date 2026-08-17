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

interface ScannerProperties {
    id: string;
    scanner_name: string;
    dpi: number;
    color_mode: string;
    paper_size: string;
    duplex: number;
    auto_crop: number;
    auto_rotate: number;
}

interface Scanner {
    id: string;
    scanner_name: string;
}

interface ScannerSettings {
    scanner: string,
    color: ScannerColor,
    dpi: DPI,
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

export type { CreateDocumentRequest, Document, DocumentRequest, DPI, Page, PageSize, Scanner, ScannerColor, ScannerProperties, ScannerSettings, Tag };

