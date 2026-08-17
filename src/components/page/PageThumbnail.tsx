import { Move, Plus, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useData } from '../../context';
import { Page } from '../../types';
import AddPageModal from '../modals/AddPageModal';
import DeleteModal from '../modals/DeleteModal';

interface Props {
  activePageId: string;
  setActivePageId: (id: string) => void;
}

const PageThumbnails = ({ activePageId, setActivePageId }: Props) => {
  const { documents, activeDocumentId, setDocuments } = useData();
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [addPosition, setAddPosition] = useState<number>(0);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [draggedPages, setDraggedPages] = useState<Page[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePage, setDeletePage] = useState<Page | undefined>();

  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const dragYRef = useRef<number | null>(null);
  const activeDocument = documents.find((doc) => doc.id === activeDocumentId);
  const pages = activeDocument?.pages ?? [];
  const displayPages = draggedPageId !== null ? draggedPages : pages;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, pageId: string) => {
    setDraggedPageId(pageId);
    setDraggedPages([...pages]);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pageId);
    const thumbnail = document.getElementById(`thumbnail-${pageId}`);
    if (thumbnail) {
      e.dataTransfer.setDragImage(thumbnail, thumbnail.clientWidth / 2, thumbnail.clientHeight / 2);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetPageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragYRef.current = e.clientY;
    startAutoScroll();
    if (!draggedPageId || draggedPageId === targetPageId) {
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    const currentPages = draggedPages.length > 0 ? draggedPages : pages;
    const draggedIndex = currentPages.findIndex((page) => page.id === draggedPageId);
    const targetIndex = currentPages.findIndex((page) => page.id === targetPageId);
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const insertAfter = e.clientY > rect.top + rect.height / 2;
    let newIndex = targetIndex;
    if (insertAfter) {
      newIndex++;
    }
    if (draggedIndex < newIndex) {
      newIndex--;
    }
    if (draggedIndex === newIndex) {
      return;
    }
    const newPages = [...currentPages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(newIndex, 0, draggedPage);
    setDraggedPages(newPages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    stopAutoScroll();

    if (!activeDocument || !draggedPageId) {
      handleDragEnd();
      return;
    }
    const container = thumbnailsRef.current;
    if (!container) {
      handleDragEnd();
      return;
    }
    const rect = container.getBoundingClientRect();
    const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!isInside) {
      handleDragEnd();
      return;
    }
    if (draggedPages.length > 0) {
      setDocuments((prev) => prev.map((doc) => (doc.id === activeDocument.id ? { ...doc, pages: draggedPages } : doc)));
    }
    handleDragEnd();
  };

  const handleDragEnd = () => {
    stopAutoScroll();

    setDraggedPageId(null);
    setDraggedPages([]);
  };

  const handleDropAtEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeDocument || !draggedPageId) {
      handleDragEnd();
      return;
    }
    const container = thumbnailsRef.current;
    if (!container) {
      handleDragEnd();
      return;
    }
    const rect = container.getBoundingClientRect();
    const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!isInside) {
      handleDragEnd();
      return;
    }
    const currentPages = draggedPages.length > 0 ? draggedPages : pages;
    const draggedIndex = currentPages.findIndex((page) => page.id === draggedPageId);
    if (draggedIndex === -1) {
      handleDragEnd();
      return;
    }
    const newPages = [...currentPages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.push(draggedPage);
    setDocuments((prev) => prev.map((doc) => (doc.id === activeDocument.id ? { ...doc, pages: newPages } : doc)));
    handleDragEnd();
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current !== null) {
      return;
    }
    const scroll = () => {
      const container = thumbnailsRef.current;
      const clientY = dragYRef.current;
      if (!container || clientY === null || !draggedPageId) {
        autoScrollRef.current = null;
        return;
      }
      const rect = container.getBoundingClientRect();
      const edgeSize = 80;
      const maxSpeed = 12;
      let speed = 0;
      if (clientY < rect.top + edgeSize) {
        const distance = rect.top + edgeSize - clientY;
        speed = -Math.min(maxSpeed, Math.max(1, distance / 5));
      } else if (clientY > rect.bottom - edgeSize) {
        const distance = clientY - (rect.bottom - edgeSize);
        speed = Math.min(maxSpeed, Math.max(1, distance / 5));
      }
      if (speed !== 0) {
        container.scrollTop += speed;
      }
      autoScrollRef.current = requestAnimationFrame(scroll);
    };
    autoScrollRef.current = requestAnimationFrame(scroll);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current !== null) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    dragYRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (autoScrollRef.current !== null) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, []);
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletePage(undefined);
  };

  const confirmDeletePage = () => {
    if (!activeDocument || !deletePage) {
      return;
    }
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDocument.id) {
          return doc;
        }
        return { ...doc, pages: doc.pages.filter((page) => page.id !== deletePage.id) };
      })
    );
    if (activePageId === deletePage.id) {
      const remainingPages = pages.filter((page) => page.id !== deletePage.id);
      setActivePageId(remainingPages[0]?.id ?? '');
    }
    closeDeleteModal();
  };

  return (
    <>
      <div
        ref={thumbnailsRef}
        className="shrink-0 w-50 flex flex-col overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-calm-background p-3 justify-items-center items-center"
        onDragOver={(e) => {
          e.preventDefault();
          dragYRef.current = e.clientY;
          startAutoScroll();
        }}
        onDrop={handleDrop}
      >
        <div className="mb-2 w-full text-center text-sm font-semibold text-calm-text">Total Pages: {pages.length}</div>
        {displayPages.map((page, i) => (
          <div key={'thumbnail-' + page.id}>
            {i === 0 && (
              <div
                className="group flex items-center w-full my-2 cursor-pointer"
                onClick={() => {
                  setAddPosition(i);
                  setAddModalOpen(true);
                }}
              >
                <div className="flex-1 border-t border-gray-400" />
                <span className="px-2">
                  <Plus size={12} className="transition-all duration-150 group-hover:scale-200" />
                </span>
                <div className="flex-1 border-t border-gray-400" />
              </div>
            )}
            <div
              id={`thumbnail-${page.id}`}
              onDragOver={(e) => handleDragOver(e, page.id)}
              onDrop={handleDrop}
              onClick={() => setActivePageId(page.id)}
              className={`relative flex h-60 w-40 cursor-grab flex-col items-center justify-center rounded-lg border bg-calm-background shadow-sm transition cursor-pointer
                        ${activePageId === page.id ? 'border-calm-accent shadow-soft border-2' : 'border-slate-300 hover:border-calm-accent'} ${draggedPageId === page.id ? 'opacity-40' : ''}`}
            >
              <img src={page.history[page.activeHistory]} className="h-full w-full rounded-lg object-contain" draggable={false} />
              <div className="absolute bg-[#000000aa] p-2 text-center aspect-square rounded-full text-white font-bold">{i + 1}</div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragEnd={handleDragEnd}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-1 top-1 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white transition hover:bg-black/80 active:cursor-grabbing"
              >
                <Move className="h-4 w-4" />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletePage(page);
                  setDeleteModalOpen(true);
                }}
                className="absolute bottom-1 right-1 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white transition hover:bg-red-600"
              >
                <Trash className="h-4 w-4" />
              </div>
            </div>
            <div
              className="group flex items-center w-full my-2 cursor-pointer"
              onClick={() => {
                setAddPosition(i + 1);
                setAddModalOpen(true);
              }}
            >
              <div className="flex-1 border-t border-gray-400" />
              <span className="px-2">
                <Plus size={12} className="transition-all duration-150 group-hover:scale-200" />
              </span>
              <div className="flex-1 border-t border-gray-400" />
            </div>
          </div>
        ))}
        {draggedPageId && displayPages.length > 0 && (
          <div
            className="my-2 h-60 w-40 rounded-lg border-2 border-dashed border-calm-accent"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={handleDropAtEnd}
          />
        )}
      </div>
      <AddPageModal open={addModalOpen} onClose={() => setAddModalOpen(false)} addPosition={addPosition} />
      <DeleteModal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePage}
        title="Delete Page?"
        message="Are you sure you want to delete this page?"
        itemName={deletePage ? `Page ${pages.findIndex((p) => p.id === deletePage.id) + 1}` : undefined}
      />
    </>
  );
};

export default PageThumbnails;
