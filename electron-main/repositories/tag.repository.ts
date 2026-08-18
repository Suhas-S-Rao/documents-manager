import { getDb } from '../database/database';
import type { Tag } from '../models';

export class TagRepository {

    static getAll(): Tag[] {
        return getDb().prepare(`SELECT t.id, t.name, t.color, COUNT(dt.document_id) AS documentCount FROM tags t LEFT JOIN document_tags dt ON t.id = dt.tag_id GROUP BY t.id, t.name, t.color ORDER BY t.name;`).all() as Tag[];
    }

    static create(data: Tag) {
        return getDb().prepare(`INSERT INTO tags (id, name, color) VALUES (@id, @name, @color)`).run(data);
    }

    static update(id: string, data: Partial<Tag>) {
        const fields = Object.keys(data).map(key => `${key}=@${key}`).join(',');
        return getDb().prepare(`UPDATE tags SET ${fields} WHERE id=@id`).run({ id, ...data });
    }


    static delete(id: string) {
        return getDb().prepare(`DELETE FROM tags WHERE id=?`).run(id);
    }
}