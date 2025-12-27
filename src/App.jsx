import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import KanbanBoard from './components/KanbanBoard';
import Clients from './components/Clients';
import FinanceDashboard from './components/FinanceDashboard';
import PocketExpense from './components/PocketExpense';
import Settings from './components/Settings';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/pocket" element={<PocketExpense />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
