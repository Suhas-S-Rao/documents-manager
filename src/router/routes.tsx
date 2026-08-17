import { createBrowserRouter } from 'react-router-dom';

import Layout from '../components/layout/Layout';

import Dashboard from '../pages/Dashboard/Dashboard';
import AddDocuments from '../pages/Documents/AddDocuments';
import Documents from '../pages/Documents/Documents';
import Tags from '../pages/Tags/Tags';
import Settings from '../pages/Settings/Settings';
import Document from '../pages/Documents/Document';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'addDocument',
        element: <AddDocuments />
      },
      {
        path: 'document',
        element: <Document />
      },
      {
        path: 'documents',
        element: <Documents />
      },
      {
        path: 'tags',
        element: <Tags />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);
