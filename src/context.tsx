import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Document, Scanner, ScannerProperties, Settings, Tag } from './types';
import { GoogleDriveSettingsDefault } from './constants';

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
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const DataContext = createContext<DataType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocuments, setNewDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [scannersProperties, setScannersProperties] = useState<ScannerProperties[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<Settings>({ scanner: [], google: GoogleDriveSettingsDefault });

  useEffect(() => {
    getScanners();
    getDocumentsList();
    getTags();
    getGoogleDriveSettings();
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

  const getGoogleDriveSettings = async () => {
    let googleSetting = await window.api.googleDrive.getSettings();
    setSettings((prev) => ({ ...prev, google: googleSetting.data }));
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
        setTags,
        settings,
        setSettings
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
