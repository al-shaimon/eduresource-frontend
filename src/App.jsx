import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginSignup from './components/LoginSignup';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import Requests from './components/Requests';
import Users from './components/Users';
import StakeholderManagement from './components/StakeholderManagement';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [requestsFilter, setRequestsFilter] = useState(null);

  // Enhanced page change function that can handle filters
  const handlePageChange = (page, filter = null) => {
    setCurrentPage(page);
    if (page === 'requests' && filter) {
      setRequestsFilter(filter);
    } else if (page !== 'requests') {
      setRequestsFilter(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginSignup />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={handlePageChange} />;
      case 'resources':
        return <Resources />;
      case 'requests':
        return <Requests initialFilter={requestsFilter} />;
      case 'users':
        return user?.role === 'admin' ? <Users /> : <Dashboard onPageChange={handlePageChange} />;
      case 'stakeholders':
        return user?.role === 'admin' ? (
          <StakeholderManagement onPageChange={handlePageChange} />
        ) : (
          <Dashboard onPageChange={handlePageChange} />
        );
      default:
        return <Dashboard onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentPage()}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
