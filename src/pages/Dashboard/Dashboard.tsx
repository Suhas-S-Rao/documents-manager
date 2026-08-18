import { useNavigate } from 'react-router-dom';
import { useData } from '../../context';
import { formatFileSize } from '../../utils/helpers';

const Dashboard = () => {
  const { documents, tags, setActiveDocumentId } = useData();
  const navigate = useNavigate();
  const stats = [
    { title: 'Documents', value: documents.length },
    { title: 'Pages', value: documents.reduce((sum, doc) => sum + doc.total_pages, 0) },
    { title: 'Tags', value: tags.length },
    { title: 'Storage', value: formatFileSize(documents.reduce((sum, doc) => sum + doc.file_size, 0)) }
  ];
  return (
    <div className="flex flex-col gap-4 bg-calm-surface text-calm-">
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="rounded-xl border border-slate-200 bg-calm-surface p-5 shadow-soft transition hover:shadow-glow">
              <div className="text-sm font-medium text-slate-500">{stat.title}</div>
              <div className="mt-2 text-2xl font-bold text-calm-text">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[2fr_2fr] gap-4">
        <div className="rounded-xl border border-slate-200 bg-calm-surface p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-calm-text">Recent Documents</h2>
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-calm-text hover:bg-calm-background hover:text-calm-accent transition cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/documents');
              }}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {documents
              .filter((doc) => !doc.isNew)
              .slice(0, 10)
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:bg-calm-background hover:shadow-soft">
                  <div>
                    <div className="font-medium text-calm-text">{doc.title}</div>
                    <div className="text-sm text-slate-500">{doc.document_date ? new Date(doc.document_date).toLocaleDateString() : '-'}</div>
                  </div>

                  <button
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1 text-sm text-calm-text transition hover:bg-calm-background hover:text-calm-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocumentId(doc.id);
                      navigate('/document');
                    }}
                  >
                    Open
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
