import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@techstark/opencv-js';
import { DataProvider } from './context';
import { Toaster } from 'react-hot-toast';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <DataProvider>
      <div className="select-none">
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000
          }}
        />
      </div>
    </DataProvider>
  </HashRouter>
);
