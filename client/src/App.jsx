import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Chits from './pages/Chits';
import ChitDetails from './pages/ChitDetails';
import Reports from './pages/Reports';
import Calculator from './pages/Calculator';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/chits" element={<Chits />} />
          <Route path="/chits/:id" element={<ChitDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
