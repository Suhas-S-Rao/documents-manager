import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AppLoader from './components/ui/AppLoader';
import { useData } from './context';
import Dashboard from './pages/Dashboard';
import Document from './pages/Document';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Tags from './pages/Tags';

const App = () => {
  const { loader } = useData();

  return (
    <>
      <div className="flex h-screen bg-calm-background text-calm-text">
        <div className="flex flex-1 flex-col">
          <Header />
          <main className=" flex-1 overflow-auto p-6 bg-calm-surface rounded-xl shadow-soft ">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/addDocument" element={<Document />} />
              <Route path="/document" element={<Document />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
      {loader.length > 0 && <AppLoader show={true} message={loader[0].message} progress={loader[0].progress} />}
    </>
  );
};

export default App;
