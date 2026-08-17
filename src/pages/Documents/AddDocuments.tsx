import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { useData } from '../../context';
import { Document as DocumentType } from '../../types';
import Document from './Document';

const AddDocuments = () => {
  const { setDocuments, documents, activeDocumentId, setActiveDocumentId } = useData();
  const [newDocuments, setNewDocuments] = useState<DocumentType[]>([]);
  useEffect(() => {
    let newDocs = documents.filter((x) => x.isNew);
    setNewDocuments(newDocs);
    if (newDocs.length === 0) {
      let newId = addNewDoc();
      setActiveDocumentId(newId);
    }
  }, [documents]);

  const addNewDoc = () => {
    let id = v4();
    setDocuments((prev) => [
      ...prev,
      {
        id,
        title: 'New Document ' + (newDocuments.length + 1),
        document_number: '',
        document_date: '',
        notes: '',
        pages: [],
        tagIds: [],
        total_pages: 0,
        isNew: true,
        file_path: '',
        file_size: 0
      }
    ]);
    return id;
  };

  return (
    <React.Fragment key={'add -' + activeDocumentId}>
      <div className="mb-3 flex items-center border-b border-slate-200 w-full gap-1">
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden w-0">
          <div className="flex flex-nowrap gap-1">
            {newDocuments.map((doc) => {
              return (
                <button
                  key={doc.id}
                  className={`shrink-0 rounded-t-lg border border-b-0 border-slate-200 px-4 py-2 font-medium cursor-pointer max-w-[15rem] truncate ${doc.id === activeDocumentId ? 'bg-calm-surface text-calm-text shadow-soft' : 'bg-calm-background text-slate-500 transition hover:bg-calm-surface hover:text-calm-text'}`}
                  onClick={() => setActiveDocumentId(doc.id)}
                  title={doc.title}
                >
                  {doc.title}
                </button>
              );
            })}
          </div>
        </div>
        <button className="rounded-lg border border-slate-200 bg-calm-surface px-4 py-2 font-medium text-calm-text shadow-soft cursor-pointer h-full" onClick={addNewDoc}>
          <Plus />
        </button>
      </div>
      {activeDocumentId && <Document key={activeDocumentId} />}
    </React.Fragment>
  );
};

export default AddDocuments;
