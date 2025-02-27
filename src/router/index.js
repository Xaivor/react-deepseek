import { createBrowserRouter } from 'react-router-dom';
import Index from '../pages';
import DefaultElement from '../components/DefaultElement';

const Router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultElement element={Index} meta={{ title: '专属顾问' }} />,
  }
]);

export default Router;