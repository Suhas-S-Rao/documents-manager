import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { useData } from '../context';
import type { Document as DocumentType, Page } from '../types';
import { loadFile } from '../utils/api';
import { pdfToImages } from '../utils/pdf/pdfToImage';
import PageEditor from './PageEditor';
import PageThumbnails from './PageThumbnail';

const PdfPreview = () => {
  const [activePageId, setActivePageId] = useState('');
  const { documents, setDocuments, activeDocumentId, startLoader, stopLoader } = useData();
  const [activeDocument, setActiveDocument] = useState<DocumentType>();
  const [activePageData, setActivePageData] = useState<Page>();

  useEffect(() => {
    const doc = documents.find((x) => x.id === activeDocumentId);
    if (!doc) {
      setActiveDocument(undefined);
      setActivePageId('');
      return;
    }
    const loadPdf = async () => {
      try {
        startLoader('loadPages', 'loading file pages');
        if (doc.file_path && (!doc.pages || doc.pages.length === 0)) {
          const file = await loadFile(doc.file_path);
          let updatedDoc: DocumentType;
          let pages: Page[] = [];
          if (file instanceof Error) {
            toast.error('No document found');
            return;
          }
          pages = (await pdfToImages(file)).map((x) => ({ id: v4(), history: [x], activeHistory: 0 }));
          updatedDoc = { ...doc, pages: pages };
          setDocuments((prev) => prev.map((item) => (item.id === updatedDoc.id ? updatedDoc : item)));
          setActiveDocument(updatedDoc);
          if (activePageId === '') {
            setActivePageId(pages[0]?.id ?? '');
          }
          return;
        }
        setActiveDocument(doc);
        setActivePageId((currentPageId) => {
          const pageExists = doc.pages?.some((page) => page.id === currentPageId);
          return pageExists ? currentPageId : (doc.pages?.[0]?.id ?? '');
        });
      } finally {
        setTimeout(() => {
          stopLoader('loadPages');
        }, 10);
      }
    };
    loadPdf();
  }, [documents, activeDocumentId]);

  useEffect(() => {
    if (activeDocument) {
      setActivePageData(activeDocument.pages.find((x) => x.id === activePageId));
    } else {
      setActivePageData(undefined);
    }
  }, [activeDocument, activePageId]);

  if (!activeDocument?.pages || activeDocument.pages.length === 0) {
    return null;
  }

  const handleImageChange = (imageHistory: string[]) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDocument.id) {
          return doc;
        }
        return {
          ...doc,
          pages: doc.pages.map((page) => {
            if (page.id !== activePageId) {
              return page;
            }
            return { ...page, history: imageHistory, activeHistory: imageHistory.length - 1 };
          })
        };
      })
    );
  };

  const updateHistory = (activeHistory: number) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDocument.id) {
          return doc;
        }
        return {
          ...doc,
          pages: doc.pages.map((page) => {
            if (page.id !== activePageId) {
              return page;
            }
            return { ...page, activeHistory };
          })
        };
      })
    );
  };

  return (
    <div className="flex min-h-0 w-full flex-1 bg-calm-background shadow-sm border border-slate-200">
      <div className="flex h-full w-full flex-col overflow-y-auto">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Thumbnails */}
          <PageThumbnails activePageId={activePageId} setActivePageId={(v) => setActivePageId(v)} />

          {/* Editor */}
          <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-calm-background">
            {activePageId !== '' && activePageData && (
              <PageEditor key={`image-${activePageId}-${activePageData.activeHistory}`} page={activePageData} onChange={handleImageChange} updateHistory={updateHistory} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;
