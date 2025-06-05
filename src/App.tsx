import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ParcellePage from './pages/ParcellePage';
import ParcelleDetailPage from './pages/ParcelleDetailPage';
import ActivitesPage from './pages/ActivitesPage';
import CartePage from './pages/CartePage';
import RapportsPage from './pages/RapportsPage';
import ParametresPage from './pages/ParametresPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="parcelles" element={<ParcellePage />} />
        <Route path="parcelles/:id" element={<ParcelleDetailPage />} />
        <Route path="activites" element={<ActivitesPage />} />
        <Route path="carte" element={<CartePage />} />
        <Route path="rapports" element={<RapportsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;