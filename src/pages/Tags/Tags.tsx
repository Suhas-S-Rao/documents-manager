import { FileXCorner } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import DeleteModal from '../../components/modals/DeleteModal';
import TagModal from '../../components/modals/TagModal';
import { Button, Input } from '../../components/ui/index';
import { useData } from '../../context';
import { Tag } from '../../types';
import { getTextColor } from '../../utils/helpers';

const Tags = () => {
  const { tags, setTags } = useData();
  const [search, setSearch] = useState<string>('');

  const [tagModalOpen, setTagModalOpen] = useState<boolean>(false);
  const [editTag, setEditTag] = useState<Tag | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteTagItem, setDeleteTagItem] = useState<Tag | undefined>();

  const tagsToDisplay: Tag[] = useMemo(() => {
    const searchStr = search.trim().toLowerCase();
    if (!searchStr) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchStr));
  }, [tags, search]);

  const openAddEdit = (tag?: Tag) => {
    setEditTag(tag);
    setTagModalOpen(true);
  };

  const openDelete = (tag: Tag) => {
    setDeleteTagItem(tag);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTagItem(undefined);
  };

  const closeTagModal = () => {
    setEditTag(undefined);
    setTagModalOpen(false);
  };

  const saveTag = async (tag: Tag) => {
    try {
      const isEdit = Boolean(editTag);
      const result = isEdit ? await window.api.tags.update(tag) : await window.api.tags.create({ ...tag, id: v4() });
      if (!result.success) {
        toast.error(`Failed to ${isEdit ? 'update' : 'add'} ${tag.name} tag`);
        return;
      }
      setTags((prev) => (isEdit ? prev.map((x) => (x.id === tag.id ? result.data : x)) : [...prev, result.data]));
      toast.success(`${tag.name} tag ${isEdit ? 'updated' : 'added'} successfully`);
      closeTagModal();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const deleteTag = async () => {
    if (!deleteTagItem) return;
    try {
      const result = await window.api.tags.delete(deleteTagItem.id);
      if (!result.success) {
        toast.error(`Failed to delete ${deleteTagItem.name} tag`);
        return;
      }
      setTags((prev) => prev.filter((x) => x.id !== deleteTagItem.id));
      toast.success(`${deleteTagItem.name} tag deleted successfully`);
      closeDeleteModal();
    } catch {
      toast.error('Something went wrong while deleting tag');
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-calm-surface text-calm-text max-w-5xl">
      {tags.length > 0 && (
        <>
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <Button onClick={() => openAddEdit()}>New Tag</Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Input label="Search" placeholder="Search tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {tagsToDisplay.length > 0 && (
            <div className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-calm-surface shadow-soft">
              <table className="w-full table-fixed">
                <thead className="bg-calm-background">
                  <tr>
                    <th className="w-[40%] p-3 text-left font-semibold text-calm-text">Tag</th>
                    <th className="w-[20%] p-3 text-center font-semibold text-calm-text">Color</th>
                    <th className="w-[20%] p-3 text-center font-semibold text-calm-text">Documents</th>
                    <th className="w-[20%] p-3 text-center font-semibold text-calm-text">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tagsToDisplay.map((tag) => (
                    <tr key={tag.id} className="border-t border-slate-200 hover:bg-calm-background">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-calm-text">{tag.name}</p>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div
                          className="mx-auto w-25 h-10 rounded-full border border-slate-300 font-bold justify-center items-center flex"
                          style={{ backgroundColor: tag.color, color: getTextColor(tag.color) }}
                        >
                          {tag.color}
                        </div>
                      </td>

                      <td className="p-4 text-center font-medium text-calm-text">{tag.documentCount}</td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button variant="secondary" onClick={() => openAddEdit(tag)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => openDelete(tag)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {tagsToDisplay.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-calm-surface p-8 shadow-soft">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <FileXCorner />
          </div>
          <p className="text-lg font-medium text-calm-text">{tags.length === 0 ? 'No Tags found' : 'No matching tags'}</p>
          <p className="text-sm text-slate-500">{tags.length === 0 ? 'Start by adding your first tag to get going.' : 'Try a different search term.'}</p>
          {tags.length === 0 && <Button onClick={() => openAddEdit()}>New Tag</Button>}
        </div>
      )}
      <TagModal open={tagModalOpen} onClose={closeTagModal} tag={editTag} onSave={saveTag} />
      <DeleteModal open={deleteModalOpen} onClose={closeDeleteModal} onConfirm={deleteTag} title="Delete Tag?" message="Are you sure you want to delete this tag?" itemName={deleteTagItem?.name} />
    </div>
  );
};
export default Tags;
