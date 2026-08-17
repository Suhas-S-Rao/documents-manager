import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@techstark/opencv-js';
import { DataProvider } from './context';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div className="select-none">
    <DataProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000
        }}
      />
    </DataProvider>
  </div>
);
