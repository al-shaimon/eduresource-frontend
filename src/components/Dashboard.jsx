import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import {
  Package,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ onPageChange }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    myRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    overdueReturns: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to navigate to requests with specific filter
  const navigateToRequests = (filter = null) => {
    onPageChange('requests', filter);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [resourcesData, requestsData, dueData, overdueData] = await Promise.all([
        api.getResources(),
        api.getRequests(),
        api.getDueReturns(),
        user?.role === 'admin' ? api.getOverdueReturns() : Promise.resolve([]),
      ]);

      // Calculate stats based on user role
      let calculatedStats = {
        totalResources: resourcesData.length,
        myRequests: requestsData.length,
        pendingRequests: requestsData.filter((r) => r.status === 'pending').length,
        approvedRequests: requestsData.filter((r) => r.status === 'approved').length,
        overdueReturns:
          user?.role === 'admin'
            ? overdueData.length
            : requestsData.filter((r) => {
                return (
                  r.status === 'approved' && r.returnDate && new Date(r.returnDate) < new Date()
                );
              }).length,
        dueReturns: dueData.length,
      };

      setStats(calculatedStats);
      setRecentRequests(requestsData.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      returned: 'bg-blue-100 text-blue-800',
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${
      badges[status] || 'bg-gray-100 text-gray-800'
    }`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 text-white">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          {user?.role === 'admin'
            ? 'Manage resources and oversee all department activities from your dashboard.'
            : 'Browse available resources and manage your checkout requests.'}
        </p>
      </div>

      {/* Stats Grid - 4 Cards for All Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => onPageChange('resources')}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigateToRequests()}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'admin' ? 'Total Requests' : 'My Requests'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.myRequests}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigateToRequests('pending')}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => {
            if (user?.role === 'admin') {
              onPageChange('requests', 'overdue'); // Admin sees overdue filter in requests
            } else {
              navigateToRequests('approved'); // Students/faculty see their approved requests
            }
          }}
          className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow text-left group ${
            user?.role === 'admin' ? 'border-red-500' : 'border-green-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'admin' ? 'Overdue Returns' : 'Approved Requests'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.role === 'admin' ? stats.overdueReturns : stats.approvedRequests}
              </p>
            </div>
            {user?.role === 'admin' ? (
              <AlertCircle className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            )}
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Recent Requests
            </h2>
          </div>
          <div className="p-6">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <button
                    key={request._id}
                    onClick={() => onPageChange('requests')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {request.resource?.name || 'Unknown Resource'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.role === 'admin' && `by ${request.user?.name || 'Unknown User'}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(request.status)}>{request.status}</span>
                  </button>
                ))}
                {recentRequests.length > 0 && (
                  <button
                    onClick={() => onPageChange('requests')}
                    className="w-full mt-4 py-2 text-center text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    View All Requests →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {user?.role === 'admin' ? (
                <>
                  <button
                    onClick={() => onPageChange('resources')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Add New Resource</span>
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('pending')}
                    className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Review Pending Requests</span>
                    </div>
                    <div className="text-yellow-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('overdue')}
                    className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Handle Overdue Returns</span>
                    </div>
                    <div className="text-red-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('due')}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Check Due Returns</span>
                    </div>
                    <div className="text-orange-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => onPageChange('stakeholders')}
                    className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Stakeholder Management</span>
                    </div>
                    <div className="text-indigo-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => onPageChange('users')}
                    className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Manage Users</span>
                    </div>
                    <div className="text-purple-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('approved')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">View Approved Requests</span>
                    </div>
                    <div className="text-green-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onPageChange('resources')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Browse Resources</span>
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => onPageChange('resources')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Request Resource</span>
                    </div>
                    <div className="text-green-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('pending')}
                    className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">View Pending Requests</span>
                    </div>
                    <div className="text-yellow-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('approved')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">View Approved Resources</span>
                    </div>
                    <div className="text-green-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests('due')}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Check Due Returns</span>
                    </div>
                    <div className="text-orange-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                  <button
                    onClick={() => navigateToRequests()}
                    className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">My Request History</span>
                    </div>
                    <div className="text-purple-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
