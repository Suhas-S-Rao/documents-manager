import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Document, Scanner, ScannerProperties, Tag } from './types';

interface DataType {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  activeDocumentId: string | null;
  setActiveDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
  scanners: Scanner[];
  scannersProperties: ScannerProperties[];
  setScannersProperties: React.Dispatch<React.SetStateAction<ScannerProperties[]>>;
  newDocuments: Document[];
  setNewDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const DataContext = createContext<DataType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocuments, setNewDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [scannersProperties, setScannersProperties] = useState<ScannerProperties[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getScanners();
    getDocumentsList();
    getTags();
  }, []);

  const getScanners = async () => {
    setScanners(await window.api.scanner.getScannersList());
    setScannersProperties(await window.api.scanner.getProperties());
  };

  const getDocumentsList = async () => {
    setDocuments(await window.api.documents.getAll());
  };

  const getTags = async () => {
    setTags(await window.api.tags.getAll());
  };
  return (
    <DataContext.Provider
      value={{
        documents,
        setDocuments,
        activeDocumentId,
        setActiveDocumentId,
        scanners,
        scannersProperties,
        setScannersProperties,
        newDocuments,
        setNewDocuments,
        tags,
        setTags
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
