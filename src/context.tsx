import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GoogleDriveSettingsDefault } from './constants';
import type { DetectedScanners, Document, Loader, Scanner, Settings, Tag } from './types';

interface DataType {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  activeDocumentId: string | null;
  setActiveDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
  scanners: Scanner[];
  setScanners: React.Dispatch<React.SetStateAction<Scanner[]>>;
  newDocuments: Document[];
  setNewDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  loader: Loader[];
  startLoader: (id: string, message?: string, progress?: number) => void;
  stopLoader: (id: string) => void;
  loadData: () => void;
  detectedScanners: DetectedScanners[];
  setDetectedScanners: React.Dispatch<React.SetStateAction<DetectedScanners[]>>;
}

const DataContext = createContext<DataType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocuments, setNewDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [detectedScanners, setDetectedScanners] = useState<DetectedScanners[]>([]);
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<Settings>({ scanner: [], google: GoogleDriveSettingsDefault });
  const [loader, setLoader] = useState<Loader[]>([]);

  useEffect(() => {
    loadData();
    const listener = (data: Loader) => {
      updateLoader(data.id, data.message, data.progress);
    };

    window.api.progress.onUpdate(listener);
  }, []);

  const loadData = () => {
    getScanners();
    getDocumentsList();
    getTags();
    getGoogleDriveSettings();
  };

  const getScanners = async () => {
    try {
      startLoader('scanner');
      const scannersDeteceted = await window.api.scanner.getScannersList();
      startLoader('scannerProperties');
      const scannersList = await window.api.scanner.getSettings();
      setDetectedScanners(scannersDeteceted ?? []);
      setScanners(scannersList ?? []);
    } finally {
      stopLoader('scanner');
      stopLoader('scannerProperties');
    }
  };

  const getDocumentsList = async () => {
    try {
      startLoader('getDocuments');
      const docs = await window.api.documents.getAll();
      setDocuments(docs);
    } finally {
      stopLoader('getDocuments');
    }
  };

  const getTags = async () => {
    try {
      startLoader('getTags');
      const tagsList = await window.api.tags.getAll();
      setTags(tagsList);
    } finally {
      stopLoader('getTags');
    }
  };

  const getGoogleDriveSettings = async () => {
    try {
      startLoader('getGoogleSettings');
      let googleSetting = await window.api.googleDrive.getSettings();
      if (googleSetting.success) {
        setSettings((prev) => ({ ...prev, google: googleSetting.data }));
      } else {
        toast.error(googleSetting.error);
      }
    } finally {
      stopLoader('getGoogleSettings');
    }
  };

  const startLoader = (id: string, message?: string, progress?: number) => {
    queueMicrotask(() => {
      setLoader((prev) => [...prev.filter((x) => x.id !== id), { id, message, progress }]);
    });
  };

  const stopLoader = (id: string) => {
    setLoader((prev) => prev.filter((x) => x.id !== id));
  };
  const updateLoader = (id: string, message?: string, progress?: number) => {
    queueMicrotask(() => {
      setLoader((prev) =>
        prev.map((x) => {
          if (x.id !== id) {
            return x;
          }
          return { id, message, progress };
        })
      );
    });
  };

  return (
    <DataContext.Provider
      value={{
        documents,
        setDocuments,
        activeDocumentId,
        setActiveDocumentId,
        detectedScanners,
        setDetectedScanners,
        scanners,
        setScanners,
        newDocuments,
        setNewDocuments,
        tags,
        setTags,
        settings,
        setSettings,
        loader,
        startLoader,
        stopLoader,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('Missing DocumentProvider');
  return context;
};
