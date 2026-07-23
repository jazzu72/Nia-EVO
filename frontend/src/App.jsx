import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import RealEstate from './pages/RealEstate';
import Grants from './pages/Grants';
import Treasury from './pages/Treasury';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/realestate" element={<RealEstate />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/treasury" element={<Treasury />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
