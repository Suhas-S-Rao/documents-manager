import Database from 'better-sqlite3';
import { getDb } from '../database/database';
import type { Document } from '../models';
import { deletePdf, replacePdf, savePdf } from '../services/file.service';

export class DocumentRepository {

    static getAll(): Document[] {
        const docs = getDb().prepare(`SELECT d.*, COALESCE((SELECT GROUP_CONCAT(dt.tag_id) FROM document_tags dt WHERE dt.document_id = d.id), '') AS tagIds FROM documents d ORDER BY d.rowid DESC`).all() as (Omit<Document, 'tagIds'> & { tagIds: string })[];
        return docs.map((doc) => ({ ...doc, tagIds: doc.tagIds ? doc.tagIds.split(',') : [], })) as Document[];
    }

    static async create(data: Document) {
        if (data.pdf) {
            const buffer = Buffer.from(data.pdf);
            const { filePath, fileSize } = await savePdf(buffer, data.id);
            let result = getDb().prepare(`INSERT INTO documents (id, title, document_number, document_date, total_pages, file_path, file_size, notes ) VALUES (@id, @title, @document_number, @document_date, @total_pages, @filePath, @fileSize, @notes)`).run({
                id: data.id,
                title: data.title,
                document_number: data.document_number,
                document_date: data.document_date,
                total_pages: data.total_pages,
                filePath,
                fileSize,
                notes: data.notes
            });
            if (result.changes > 0) {
                const insertTag = getDb().prepare(`INSERT INTO document_tags (document_id, tag_id) VALUES (@id, @tagId)`);
                for (const tagId of data.tagIds) {
                    insertTag.run({ id: data.id, tagId });
                }
            }
            return {
                id: data.id,
                title: data.title,
                document_number: data.document_number,
                document_date: data.document_date,
                notes: data.notes,
                tagIds: data.tagIds,
                total_pages: data.total_pages,
                file_path: filePath,
                file_size: fileSize
            };
        }
        return null;
    }

    static async update(data: Document) {
        if (data && data.pdf) {
            const buffer = Buffer.from(data.pdf);
            const { fileSize } = await replacePdf(buffer, data.file_path);
            let result = getDb().prepare(`UPDATE documents SET title = @title, document_date = @document_date, document_number = @document_number, total_pages = @total_pages, file_path = @file_path, file_size = @file_size, notes = @notes WHERE id = @id`).run({
                title: data.title,
                document_date: data.document_date,
                document_number: data.document_number,
                total_pages: data.total_pages,
                file_path: data.file_path,
                file_size: fileSize,
                notes: data.notes,
                id: data.id
            });
            if (data.tagIds && result.changes > 0) {

                const currentTagIds = getDb().prepare(`SELECT tag_id FROM document_tags WHERE document_id = @id`).all({ id: data.id }) as string[];
                const tagsToRemove = currentTagIds.filter((tagId: string) => !data.tagIds?.includes(tagId));
                const tagsToAdd = data.tagIds.filter((tagId) => !currentTagIds.includes(tagId));
                const deleteTag = getDb().prepare(`DELETE FROM document_tags WHERE document_id = @id AND tag_id = @tagId`);
                const insertTag = getDb().prepare(`INSERT INTO document_tags (document_id, tag_id) VALUES (@id, @tagId)`);
                for (const tagId of tagsToRemove) {

                    deleteTag.run({ id: data.id, tagId });
                }
                for (const tagId of tagsToAdd) {
                    insertTag.run({ id: data.id, tagId });
                }
            }
            return {
                id: data.id,
                title: data.title,
                document_number: data.document_number,
                document_date: data.document_date,
                notes: data.notes,
                tagIds: data.tagIds,
                total_pages: data.total_pages,
                file_path: data.file_path,
                file_size: fileSize
            };
        }
        return null;
    }

    static delete(id: string) {
        const db = getDb();
        const document = db.prepare(`SELECT file_path FROM documents WHERE id = ?`).get(id) as { file_path: string } | undefined;

        if (!document) {
            let r: Database.RunResult = {
                changes: 0,
                lastInsertRowid: 0
            }
            return r;
        }

        let result = db.prepare(`DELETE FROM documents WHERE id = ?`).run(id);;
        deletePdf(document.file_path);
        return result;
    }
}