import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DashboardOverview from '../../components/dashboard/DashboardOverview';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/overview" element={<DashboardOverview />} />
        {/* Add more dashboard routes here */}
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;