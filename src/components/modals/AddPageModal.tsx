import { ArrowLeft, Copy, FilePlus, ScanLine, Upload, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { DpiDropdownOptions, ScannerColorDropDown } from '../../constants';
import { useData } from '../../context';
import { DPI, Page, Scanner, ScannerColor } from '../../types';
import { loadFile, loadImage } from '../../utils/api';
import { fileToDataUrl } from '../../utils/helpers';
import { pdfToImages } from '../../utils/pdf/pdfToImage';
import { Button, Select } from '../ui';

interface Props {
  addPosition: number;
  open: boolean;
  onClose: () => void;
}

interface CopyOptions {
  icon: React.ReactNode;
  title: string;
  desc: string;
  key: SourceTypes;
}

type SourceTypes = 'same' | 'document' | 'upload' | 'scan' | null;

const AddPageModal = ({ open, onClose, addPosition }: Props) => {
  const { documents, setDocuments, activeDocumentId, startLoader, stopLoader, scanners, detectedScanners } = useData();
  const [source, setSource] = useState<'same' | 'document' | 'upload' | 'scan' | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [activeDocumentPages, setActiveDocumentPages] = useState<Page[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedScanner, setSelectedScanner] = useState<Scanner>();
  const scannersDropdown = useMemo(() => {
    const detectedScannerIds = new Set(detectedScanners.map((x) => x.scanner_id));
    return scanners.filter((x) => detectedScannerIds.has(x.scanner_id)).map((x) => ({ label: x.scanner_name, value: x.scanner_id }));
  }, [scanners, detectedScanners]);

  const copyOptions: CopyOptions[] = [
    {
      icon: <Copy size={22} />,
      title: 'Copy from this document',
      desc: 'Select any page from the current document',
      key: 'same'
    },
    {
      icon: <FilePlus size={22} />,
      title: 'Copy from uploaded document',
      desc: 'Select a page from another document',
      key: 'document'
    },
    {
      icon: <Upload size={22} />,
      title: 'Upload new page',
      desc: 'Upload image or PDF page',
      key: 'upload'
    },
    {
      icon: <ScanLine size={22} />,
      title: 'Scan page',
      desc: 'Scan a new page from scanner',
      key: 'scan'
    }
  ];

  const onCloseClick = () => {
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setSource(null);
    setSelectedPages([]);
    setActiveDocumentPages([]);
    setSelectedDocumentId(null);
  };

  const onPageSelect = (id: string) => {
    setSelectedPages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    let cancelled = false;

    const loadPages = async () => {
      try {
        startLoader('loadPages', 'Loading file pages');
        const doc = documents.find((x) => x.id === selectedDocumentId);
        if (!doc) {
          setActiveDocumentPages([]);
          return;
        }
        let pages = doc.pages;
        if (doc.file_path && (!pages || pages.length === 0)) {
          const file = await loadFile(doc.file_path);
          if (file instanceof Error) {
            toast.error('No Document found');
            pages = [];
          } else {
            pages = await pdfToImagesHistory(file);
          }
        }
        if (!cancelled) {
          setActiveDocumentPages(pages ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setActiveDocumentPages([]);
        }
        console.error('Failed to load document pages', error);
      } finally {
        setTimeout(() => {
          stopLoader('loadPages');
        }, 10);
      }
    };
    loadPages();
    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId, documents]);

  const pdfToImagesHistory = async (file: File) => {
    return (await pdfToImages(file)).map((x) => ({ id: v4(), history: [x], activeHistory: 0 }));
  };

  const onFileUpload = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    try {
      e.preventDefault();
      startLoader('fileUpload', 'Uploading file(s)...');
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
          pages.push({ id: v4(), history: [URL.createObjectURL(file)], activeHistory: 0 });
        }
      }
      if (unusedFiles.length > 0) {
        toast.error(`These files were not used: ${unusedFiles.join(', ')}`);
      }
      if (pages.length === 0) {
        return;
      }
      setActiveDocumentPages(pages);
      if (pages.length === 1) {
        onPageSelect(pages[0].id);
      }
    } finally {
      stopLoader('fileUpload');
    }
  };

  const onAdd = (pages: Page[]) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDocumentId) {
          return { ...doc, pages: [...doc.pages.slice(0, addPosition), ...pages, ...doc.pages.slice(addPosition)] };
        }
        return doc;
      })
    );
  };

  const onScanClick = async () => {
    if (!selectedScanner) {
      return;
    }
    setScanning(true);
    try {
      startLoader('scan', 'Scanning page...');
      const result = await window.api.scanner.scan(selectedScanner);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      let page: Page;

      const image = await loadImage(result.data);
      if (image instanceof Error) {
        toast.error('Error in scanning');
      } else {
        page = { id: v4(), history: [await fileToDataUrl(image)], activeHistory: 0 };
        onPageSelect(page.id);
        setActiveDocumentPages((prev) => [...prev, page]);
      }
    } finally {
      setScanning(false);
      stopLoader('scan');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-calm-surface shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-calm-text">Add Page</h2>
          <button onClick={onCloseClick} className="cursor-pointer rounded-lg p-1 transition hover:bg-calm-background hover:text-calm-accent">
            <X size={20} />
          </button>
        </div>
        {source === null && (
          <div className="space-y-3 p-5">
            <p className="text-sm text-slate-500">Select page source</p>

            {copyOptions.map((item, i) => (
              <button
                key={i}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-calm-background p-4 text-left transition hover:bg-calm-surface hover:shadow-soft cursor-pointer"
                onClick={() => setSource(item.key)}
              >
                {item.icon}
                <div>
                  <div className="font-medium text-calm-text">{item.title}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {source && activeDocumentPages.length > 0 && (
          <>
            <ArrowLeft className="mx-3 mt-3 cursor-pointer" onClick={() => resetModal()} />
            {activeDocumentPages ? (
              <div className="grid grid-cols-3 gap-3 max-h-80 min-h-40 overflow-y-auto p-2">
                <div className="col-span-3 flex items-center justify-between border-b border-slate-200 px-2 pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-calm-text">
                    <input
                      type="checkbox"
                      checked={activeDocumentPages.length > 0 && selectedPages.length === activeDocumentPages.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPages(activeDocumentPages.map((page) => page.id));
                        } else {
                          setSelectedPages([]);
                        }
                      }}
                    />
                    Select All
                  </label>

                  <span className="text-sm text-slate-500">
                    Pages selected {selectedPages.length}/{activeDocumentPages.length}
                  </span>
                </div>
                {activeDocumentPages.map((page, index) => (
                  <div
                    key={'thumbnail grid ' + page.id}
                    onClick={() => onPageSelect(page.id)}
                    className={`rounded-lg border p-2 cursor-pointer transition ${selectedPages.includes(page.id) ? 'border-calm-accent shadow-glow' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <img src={page.history[page.activeHistory]} className="h-32 w-full rounded object-contain bg-slate-100" />
                    <div className="mt-1 text-center text-xs text-slate-500">Page {index + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-slate-500 text-center w-full">No pages available</div>
            )}
          </>
        )}
        {activeDocumentPages.length === 0 && (
          <>
            {source === 'document' && (
              <>
                <ArrowLeft className="mx-3 mt-3 cursor-pointer" onClick={() => resetModal()} />
                <div className="space-y-3 p-3">
                  <p className="text-sm font-medium text-slate-600">Select a document</p>
                  <div className="max-h-80 min-h-40 overflow-y-auto space-y-2 pr-1">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocumentId(doc.id)}
                        className={`w-full rounded-lg border p-3 text-left cursor-pointer transition ${selectedDocumentId === doc.id ? 'border-calm-accent bg-calm-background shadow-soft' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="font-medium text-calm-text truncate">{doc.title}</div>
                        <div className="text-xs text-slate-500">{doc.total_pages} pages</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {source === 'upload' && (
              <>
                <ArrowLeft className="mx-3 mt-3 cursor-pointer" onClick={() => resetModal()} />
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
              </>
            )}
            {source === 'scan' && (
              <>
                <ArrowLeft className="mx-3 mt-3 cursor-pointer" onClick={() => resetModal()} />
                <div className="grid grid-cols-2 gap-4 p-4">
                  <Select
                    label="Scanner"
                    value={selectedScanner?.scanner_id ?? ''}
                    onChange={(value) => setSelectedScanner(scanners.find((x) => x.scanner_id === (value as string)))}
                    options={scannersDropdown}
                  />
                  <Select
                    label="Resolution"
                    value={selectedScanner?.dpi.toString() ?? ''}
                    onChange={(value) => setSelectedScanner((prev) => (prev ? { ...prev, dpi: Number(value) as DPI } : prev))}
                    options={DpiDropdownOptions.filter((x) => Number(x.value) <= (selectedScanner?.max_dpi ?? 4800))}
                  />
                  <Select
                    label="Color mode"
                    value={selectedScanner?.color_mode ?? ''}
                    onChange={(value) => setSelectedScanner((prev) => (prev ? { ...prev, color_mode: value as ScannerColor } : prev))}
                    options={ScannerColorDropDown}
                  />
                  <Button className="flex gap-3" disabled={scanning} onClick={onScanClick}>
                    <ScanLine /> {scanning ? 'Scanning...' : 'Scan Page'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 p-4">
          <Button variant="secondary" onClick={onCloseClick}>
            Cancel
          </Button>
          <Button
            className={`bg-calm-accent text-white shadow-soft ${selectedPages.length === 0 ? '' : 'hover:bg-calm-accentHover hover:shadow-glow'}`}
            disabled={selectedPages.length === 0}
            onClick={() => {
              onAdd(activeDocumentPages.filter((x) => selectedPages.includes(x.id)));
              onCloseClick();
            }}
          >
            {selectedPages.length <= 1 ? 'Add Page' : 'Add Pages'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPageModal;
