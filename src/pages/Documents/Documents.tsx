import { FileXCorner } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import DeleteModal from '../../components/modals/DeleteModal';
import { Button, DatePicker, Input, Pagination, Select } from '../../components/ui/index';
import { SortDropDownOptions } from '../../constants';
import { useData } from '../../context';
import { Document as DocumentType, PageSize, Tag } from '../../types';
import { formatFileSize, getTextColor } from '../../utils/helpers';

interface Filters {
  search: string;
  tags: string[];
  fromDate: string;
  toDate: string;
  sort: Sort;
}

type Sort = 'A-Z' | 'Z-A' | 'Newest First' | 'Oldest First';

const defaultFilters: Filters = { search: '', tags: [], fromDate: '', toDate: '', sort: 'A-Z' };

const Documents = () => {
  const { documents, setDocuments, setActiveDocumentId, tags } = useData();
  const [pagination, setPagination] = useState<{ currentPage: number; totalItems: number; pageSize: PageSize }>({ currentPage: 1, totalItems: 0, pageSize: '10' });
  const [filter, setFilters] = useState<Filters>({ ...defaultFilters });
  const [documentsToDisplay, setDocumentsToDisplay] = useState<DocumentType[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocumentType>();
  const navigate = useNavigate();

  useEffect(() => {
    setPagination((prev) => ({ ...prev, totalItems: documents.length }));
    setDocumentsToDisplay(documents.filter((x) => !x.isNew));
  }, [documents]);

  useEffect(() => {
    const search = filter.search?.trim().toLowerCase();
    const fromDate = filter.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter.toDate ? new Date(filter.toDate) : null;

    const filteredDocuments = documents.filter((doc) => {
      if (doc.isNew) {
        return false;
      }
      const matchesSearch = doc.title.toLowerCase().includes(search) || doc.document_number?.toLowerCase().includes(search);
      const matchesTags = filter.tags.length === 0 || filter.tags.every((tagId) => doc.tagIds.includes(tagId));
      if (!doc.document_date) {
        return matchesSearch && matchesTags && !fromDate && !toDate;
      }
      const documentDate = new Date(doc.document_date);
      return matchesSearch && matchesTags && (!fromDate || documentDate >= fromDate) && (!toDate || documentDate <= toDate);
    });

    filteredDocuments.sort((a, b) => {
      switch (filter.sort) {
        case 'A-Z':
          return a.title.localeCompare(b.title);
        case 'Z-A':
          return b.title.localeCompare(a.title);
        case 'Newest First':
          return new Date(b.document_date ?? 0).getTime() - new Date(a.document_date ?? 0).getTime();
        case 'Oldest First':
          return new Date(a.document_date ?? 0).getTime() - new Date(b.document_date ?? 0).getTime();
        default:
          return 0;
      }
    });

    setDocumentsToDisplay(filteredDocuments);
    setPagination((prev) => ({ ...prev, currentPage: 1, totalItems: filteredDocuments.length }));
  }, [filter, documents]);

  const deleteDocument = async () => {
    if (!deleteDoc) {
      return;
    }
    try {
      const result = await window.api.documents.delete(deleteDoc.id);
      if (!result.success) {
        toast.error(`Failed to delete ${deleteDoc.title} document`);
        return;
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDoc.id));
      toast.success(`${deleteDoc.title} document deleted successfully`);
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-calm-surface text-calm-text">
      {pagination.totalItems > 0 && (
        <>
          <div className="flex items-center justify-end">
            <Button>
              <NavLink to={'/addDocument'}>Add New Document</NavLink>
            </Button>
          </div>

          <div className="grid gap-4 border border-slate-300 rounded-lg p-4 bg-calm-surface text-calm-text shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Search" placeholder="Search title, document number..." value={filter.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
              <Select
                label="Tag"
                multiple
                searchable
                value={filter.tags}
                options={tags.map((x) => ({ label: x.name, value: x.id.toString() }))}
                onChange={(v) => setFilters((prev) => ({ ...prev, tags: v as string[] }))}
                clearable
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <DatePicker label="From" value={filter.fromDate} onChange={(v) => setFilters((prev) => ({ ...prev, fromDate: v }))} />
              <DatePicker label="To" value={filter.toDate} onChange={(v) => setFilters((prev) => ({ ...prev, toDate: v }))} />
              <Select label="Sort" value={filter.sort} onChange={(v) => setFilters((prev) => ({ ...prev, sort: v as Sort }))} options={SortDropDownOptions} />
              <Button variant="warning" onClick={() => setFilters({ ...defaultFilters })}>
                Reset
              </Button>
            </div>
          </div>
          <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-calm-surface shadow-soft">
            <div className="flex-1 overflow-auto max-h-[50rem]">
              <table className="w-full border-collapse  border-0 rounded-xl">
                <thead className="border-b border-slate-200 bg-calm-surface sticky top-0 rounded-xl">
                  <tr>
                    <th className="p-3 text-center text-sm font-semibold text-calm-text border-0 rounded-xl">Sl No.</th>
                    <th className="w-[20%] p-3 text-center text-sm font-semibold text-calm-text">Title</th>
                    <th className="w-[15%] p-3 text-center text-sm font-semibold text-calm-text">Document No</th>
                    <th className="w-[30%] p-3 text-center text-sm font-semibold text-calm-text">Tags</th>
                    <th className="w-[5%] p-3 text-center text-sm font-semibold text-calm-text">Pages</th>
                    <th className="w-[5%] p-3 text-center text-sm font-semibold text-calm-text">Size</th>
                    <th className="w-[10%] p-3 text-center text-sm font-semibold text-calm-text">Date</th>
                    <th className="w-[15%] p-3 text-center text-sm font-semibold text-calm-text border-0 rounded-xl">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.length === 0 && <tr aria-colspan={6}>No data</tr>}
                  {documentsToDisplay.length > 0 &&
                    documentsToDisplay
                      .slice(
                        pagination.pageSize === 'All' ? 0 : Number(pagination.pageSize) * (pagination.currentPage - 1),
                        pagination.pageSize === 'All' ? documentsToDisplay.length : Number(pagination.pageSize) * pagination.currentPage
                      )
                      .map((doc, index) => {
                        const serialNumber = pagination.pageSize === 'All' ? index + 1 : Number(pagination.pageSize) * (pagination.currentPage - 1) + index + 1;
                        return (
                          <tr key={doc.id} className="border-b border-slate-200 transition hover:bg-calm-background">
                            <td className="p-3 texyt-center text-calm-text select-text">{serialNumber}</td>
                            <td className="p-3 text-calm-text select-text">{doc.title}</td>
                            <td className="p-3 text-center text-slate-600 select-text">{doc.document_number}</td>
                            <td className="p-3 text-center">
                              {doc.tagIds?.length ? (
                                <div className="flex flex-wrap gap-2 ">
                                  {doc.tagIds.map((tagId) => {
                                    const tag: Tag | null | undefined = tags.find((x) => x.id === tagId);
                                    if (!tag) return null;
                                    return (
                                      <div
                                        key={doc.id + '-' + tag.id}
                                        className="flex h-8 items-center justify-center rounded-full border border-slate-300 px-3 font-semibold"
                                        style={{ backgroundColor: tag.color, color: getTextColor(tag.color) }}
                                      >
                                        {tag.name}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="p-3 text-center text-slate-600">{doc.total_pages}</td>
                            <td className="p-3 text-center text-slate-600">{formatFileSize(doc.file_size)}</td>
                            <td className="p-3 text-center text-slate-600 ">{doc.document_date ? new Date(doc.document_date).toLocaleDateString() : '-'}</td>
                            <td className="space-x-2 p-3 text-center">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDocumentId(doc.id);
                                  navigate('/document');
                                }}
                              >
                                View/Edit
                              </Button>
                              <Button
                                variant="danger"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setDeleteDoc(doc);
                                  setDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="success"
                                onClick={async () => {
                                  const buffer = await window.api.documents.getFile(doc.file_path);

                                  const blob = new Blob([buffer], {
                                    type: 'application/pdf'
                                  });

                                  const url = URL.createObjectURL(blob);

                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${doc.title}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();

                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Download
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            <Pagination
              {...pagination}
              onPageChange={(currentPage) => setPagination((prev) => ({ ...prev, currentPage }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, pageSize }))}
            />
          </div>
        </>
      )}
      {pagination.totalItems === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-calm-surface p-8 shadow-soft">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <FileXCorner />
          </div>
          <p className="text-lg font-medium text-calm-text">No documents found</p>
          <p className="text-sm text-slate-500">Start by adding your first document to get going.</p>
          <Button>
            <NavLink to={'/addDocument'}>Add New Document</NavLink>
          </Button>
        </div>
      )}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteDocument}
        title="Delete Document?"
        message="Are you sure you want to delete this document?"
        itemName={deleteDoc?.title}
      />
    </div>
  );
};
export default Documents;
