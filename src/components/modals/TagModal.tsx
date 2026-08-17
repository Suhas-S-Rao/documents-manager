import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useData } from '../../context';
import { Tag } from '../../types';
import { getTextColor } from '../../utils/helpers';
import { Button, Input } from '../ui/index';

interface Props {
  open: boolean;
  onClose: () => void;
  tag?: Tag;
  onSave: (tag: Tag) => void;
}

const defaultTag = { id: '', color: '#000000', name: '', documentCount: 0 };

const TagModal = ({ open, onClose, tag, onSave }: Props) => {
  const [tagData, setTagData] = useState<Tag>({ ...defaultTag });
  const { tags } = useData();
  useEffect(() => {
    if (!open) return;
    setTagData(tag ? { ...tag } : { ...defaultTag });
  }, [tag, open]);

  const reset = () => {
    setTagData({ ...defaultTag });
  };

  const doesTagExist = useMemo(() => {
    const newName = tagData.name.trim().toLowerCase();

    if (!newName) return false;

    return tags.some((x) => x.name.trim().toLowerCase() === newName && x.id !== tagData.id);
  }, [tags, tagData.name, tagData.id]);

  const onSaveClick = () => {
    const name = tagData.name.trim();
    if (!name || doesTagExist) return;
    onSave({ ...tagData, name });
    onCloseClick();
  };

  const onCloseClick = () => {
    reset();
    onClose();
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-calm-surface shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-calm-text">{tag ? 'Edit Tag' : 'Add Tag'}</h2>
          <button onClick={onCloseClick} aria-label="Close modal" className="cursor-pointer rounded p-1 text-slate-500 hover:bg-calm-background hover:text-calm-accent transition">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <Input label="Tag Name" value={tagData.name} onChange={(e) => setTagData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter the tag name here..." />
            {doesTagExist && <p className="text-sm text-red-500">This tag already exists.</p>}
          </div>
          <div className="relative">
            <Input label="Color" type="color" value={tagData.color} onChange={(e) => setTagData((prev) => ({ ...prev, color: e.target.value }))} className="h-15 cursor-pointer" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none font-bold" style={{ color: getTextColor(tagData.color) }}>
              {tagData.color}
            </div>
            <p className="mt-1 text-xs text-slate-500">Pick a color to visually distinguish this tag.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 p-4">
          <Button variant="secondary" onClick={onCloseClick}>
            Cancel
          </Button>
          <Button disabled={!tagData.name.trim() || doesTagExist} onClick={onSaveClick}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
