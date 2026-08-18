import { Plus, ScanLine, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import DeleteModal from '../../components/modals/DeleteModal';
import PdfPreview from '../../components/page/PdfPreview';
import { Button, DatePicker, Input, Select, Textarea } from '../../components/ui/index';
import { DpiDropdownOptions, ScannerColorDropDown, scanners } from '../../constants';
import { useData } from '../../context';
import type { DocumentRequest, Document as DocumentType, DPI, Page, ScannerColor, ScannerSettings } from '../../types';
import { imagesToPdf } from '../../utils/pdf/imagesToPdf';
import { pdfToImages } from '../../utils/pdf/pdfToImage';

const Document = () => {
  const { documents, setDocuments, activeDocumentId, tags, setActiveDocumentId } = useData();
  const [scannerProperties, setScannerProperties] = useState<ScannerSettings>({ scanner: '', dpi: 300, color: 'color' });
  const [activeDocument, setActiveDocument] = useState<DocumentType>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newDocuments, setNewDocuments] = useState<DocumentType[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setActiveDocument(documents.find((x) => x.id === activeDocumentId));
  }, [documents, activeDocumentId]);

  useEffect(() => {
    let newDocs = documents.filter((x) => x.isNew);
    setNewDocuments(newDocs);
    if (newDocs.length === 0) {
      let newId = addNewDoc();
      setActiveDocumentId(newId);
    }
  }, [documents]);

  useEffect(() => {
    if (location.pathname === '/addDocument') {
      let newDoc = documents.find((x) => x.isNew);
      if (newDoc) {
        setActiveDocumentId(newDoc.id);
        setActiveDocument(newDoc);
      }
    }
  }, [location.pathname]);

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

  const onFileUpload = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = 'dataTransfer' in e ? e.dataTransfer.files : e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const unusedFiles: string[] = [];
    for (const file of fileArray) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        unusedFiles.push(file.name);
      }
    }
    if (validFiles.length === 0) {
      toast.error(`No valid PDF or image files found. Unused files: ${unusedFiles.join(', ')}`);
      return;
    }
    const pages: Page[] = [];
    for (const file of validFiles) {
      if (file.type === 'application/pdf') {
        const images = await pdfToImagesHistory(file);
        pages.push(...images);
      } else if (file.type.startsWith('image/')) {
        pages.push({
          id: v4(),
          history: [URL.createObjectURL(file)],
          activeHistory: 0
        });
      }
    }
    if (unusedFiles.length > 0) {
      toast.error(`These files were not used: ${unusedFiles.join(', ')}`);
    }
    if (pages.length === 0) {
      return;
    }
    setDocuments((prev) =>
      prev.map((x) => {
        if (x.id !== activeDocumentId) {
          return x;
        }
        return { ...x, pages: pages };
      })
    );
  };

  const pdfToImagesHistory = async (file: File) => {
    return (await pdfToImages(file)).map((x) => ({ id: v4(), history: [x], activeHistory: 0 }));
  };

  const updateDocument = (key: string, value: any) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === activeDocumentId ? { ...doc, [key]: value } : doc)));
  };

  const formReset = () => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDocumentId ? { ...doc, title: 'New Document ' + (documents.filter((x) => x.isNew).length + 1), document_number: '', document_date: '', tagIds: [], notes: '' } : doc
      )
    );
  };

  const deleteDocument = async () => {
    if (!activeDocument) {
      return;
    }
    try {
      if (activeDocument.isNew) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== activeDocument.id));
        setActiveDocumentId(documents.find((doc) => doc.id !== activeDocument.id && doc.isNew)?.id ?? '');
        setDeleteModalOpen(false);
        return;
      }
      const result = await window.api.documents.delete(activeDocument.id);
      if (!result.success) {
        toast.error(`Failed to delete ${activeDocument.title} document`);
        return;
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== activeDocument.id));
      setActiveDocumentId('');
      toast.success(`${activeDocument.title} document deleted successfully`);
      setDeleteModalOpen(false);
      if (location.pathname !== '/addDocument') {
        setTimeout(() => {
          setActiveDocumentId('');
          setActiveDocument(undefined);
          navigate('/documents');
        }, 1000);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const onSave = async () => {
    if (!activeDocument || activeDocument.pages.length === 0) {
      return;
    }
    try {
      if (activeDocument.isNew) {
        const newDoc: DocumentRequest = {
          id: activeDocument.id,
          title: activeDocument.title,
          document_number: activeDocument.document_number,
          document_date: activeDocument.document_date,
          notes: activeDocument.notes,
          tagIds: activeDocument.tagIds,
          total_pages: activeDocument.pages.length,
          file_path: '',
          pdf: await imagesToPdf(activeDocument.pages.map((x) => x.history[x.activeHistory]))
        };
        let result = await window.api.documents.create(newDoc);
        if (!result.success) {
          toast.error(`Failed to add ${activeDocument.title} document`);
          return;
        }

        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id !== activeDocument.id) {
              return doc;
            }
            return {
              id: result.id,
              title: result.data.title,
              document_number: result.data.document_number,
              document_date: result.data.document_date,
              notes: result.data.notes,
              tagIds: result.data.tagIds,
              pages: activeDocument.pages.map((x) => ({ ...x, history: [x.history[x.activeHistory]], activeHistory: 0 })),
              total_pages: result.data.total_pages,
              file_path: result.data.file_path,
              file_size: result.data.file_size,
              isNew: false
            };
          })
        );
        setActiveDocumentId(documents.find((doc) => doc.id !== activeDocument.id && doc.isNew)?.id ?? '');
        return;
      } else {
        const updateDoc: DocumentRequest = {
          id: activeDocument.id,
          title: activeDocument.title,
          document_number: activeDocument.document_number,
          document_date: activeDocument.document_date,
          notes: activeDocument.notes,
          tagIds: activeDocument.tagIds,
          total_pages: activeDocument.pages.length,
          file_path: activeDocument.file_path,
          pdf: await imagesToPdf(activeDocument.pages.map((x) => x.history[x.activeHistory]))
        };
        let result = await window.api.documents.update(updateDoc);
        if (!result.success) {
          toast.error(`Failed to update ${activeDocument.title} document`);
          return;
        }

        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id !== activeDocument.id) {
              return doc;
            }
            return {
              id: result.id,
              title: result.data.title,
              document_number: result.data.document_number,
              document_date: result.data.document_date,
              notes: result.data.notes,
              tagIds: result.data.tagIds,
              pages: activeDocument.pages.map((x) => ({ ...x, history: [x.history[x.activeHistory]], activeHistory: 0 })),
              total_pages: result.data.total_pages,
              file_path: result.data.file_path,
              file_size: result.data.file_size,
              isNew: false
            };
          })
        );
        setActiveDocumentId(documents.find((doc) => doc.id !== activeDocument.id && doc.isNew)?.id ?? '');
        return;
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex flex-col  h-full">
      {location.pathname === '/addDocument' && (
        <div key={'add -' + activeDocumentId}>
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
        </div>
      )}
      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 2xl:grid-cols-[2fr_1fr]">
        <div className="flex min-h-0 flex-col gap-4">
          {activeDocument?.pages?.length === 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Select label="Scanner" value={scannerProperties.scanner} onChange={(value) => setScannerProperties((prev) => ({ ...prev, scanner: value as string }))} options={scanners} />
              <Select
                label="Resolution"
                value={scannerProperties.dpi.toString()}
                onChange={(value) => setScannerProperties((prev) => ({ ...prev, dpi: Number(value as string) as DPI }))}
                options={DpiDropdownOptions}
              />
              <Select
                label="Color mode"
                value={scannerProperties.color}
                onChange={(value) => setScannerProperties((prev) => ({ ...prev, color: value as ScannerColor }))}
                options={ScannerColorDropDown}
              />
              <Button className="flex gap-3">
                <ScanLine /> Scan
              </Button>
            </div>
          )}
          {activeDocument?.pages?.length === 0 && (
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-calm-surface p-8 text-center transition hover:border-calm-accent hover:bg-calm-background cursor-pointer m-8"
              onClick={() => document.getElementById('fileInput')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onFileUpload(e)}
            >
              <Upload className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-calm-text">Drag and drop your file here</p>
              <p className="text-xs text-slate-500">or click to select a file from your device</p>
              <p className="mt-2 text-xs font-medium text-calm-accent">Upload a single PDF file or multiple image files (JPG, PNG)</p>
              <input id="fileInput" type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFileUpload(e)} multiple />
            </div>
          )}
          {activeDocument?.pages?.length !== 0 && <PdfPreview />}
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-calm-surface shadow-soft justify-between">
          <div>
            <h2 className="text-2xl font-bold p-5 rounded-xl bg-calm-background">Details</h2>
            <div className="space-y-5 p-5">
              <Input label="Title" placeholder="Enter the title here..." value={activeDocument?.title} onChange={(e) => updateDocument('title', e.target.value)} />
              <Input
                label="Document Number"
                placeholder="Enter the document number..."
                value={activeDocument?.document_number ?? ''}
                onChange={(e) => updateDocument('document_number', e.target.value)}
              />
              <DatePicker label="Document Date" value={activeDocument?.document_date?.split('T')[0] ?? ''} onChange={(value) => updateDocument('document_date', value.split('T')[0])} />
              <Select
                label="Tags"
                multiple
                searchable
                options={tags.map((x) => ({ label: x.name, value: x.id.toString() }))}
                value={activeDocument?.tagIds ?? []}
                onChange={(v) => updateDocument('tagIds', v as string[])}
                clearable
              />
              <Textarea label="Notes" placeholder="Enter notes here..." value={activeDocument?.notes ?? ''} onChange={(e) => updateDocument('notes', e.target.value)} />
              {/* <div className="mt-5 rounded-xl border border-slate-200 bg-calm-surface p-5 shadow-soft">
                <h3 className="mb-3 text-sm font-semibold text-calm-text">AI Suggested Tags</h3>

                <div className="flex flex-wrap gap-2">
                  {['Invoice', 'Tax', 'Bank', 'Personal', 'Important'].map((tag) => (
                    <button
                      key={tag}
                      className="rounded-full border border-slate-300 bg-calm-background px-3 py-1 text-sm text-calm-text shadow-sm transition hover:bg-calm-accent hover:text-white hover:shadow-glow cursor-pointer"
                      onClick={() => {
                        const current = activeDocument?.tagIds ?? [];
                        if (current.includes(tag)) return;
                        updateDocument('tagIds', [...current, tag]);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
          <div className="flex gap-2 pt-3 justify-end p-5 rounded-xl bg-calm-background">
            <Button className="aspect-square" onClick={onSave} disabled={!activeDocument || activeDocument.pages.length === 0}>
              Save
            </Button>
            <Button variant="danger" className="aspect-square" onClick={() => setDeleteModalOpen(true)}>
              Delete
            </Button>
            <Button variant="reset" className="aspect-square" onClick={formReset}>
              Reset
              <br />
              Form
            </Button>
          </div>
        </div>
      </div>
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteDocument}
        title="Delete Document?"
        message="Are you sure you want to delete this document?"
        itemName={activeDocument?.title}
      />
    </div>
  );
};

export default Document;
