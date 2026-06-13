import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import AssetDetail from '@/pages/AssetDetail';
import Lineage from '@/pages/Lineage';
import Permissions from '@/pages/Permissions';
import Inventory from '@/pages/Inventory';
import Favorites from '@/pages/Favorites';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="asset/:id" element={<AssetDetail />} />
          <Route path="lineage/:id" element={<Lineage />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </Router>
  );
}
