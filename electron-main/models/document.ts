export interface Document {
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