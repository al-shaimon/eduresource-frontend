import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import {
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Package,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

const OverdueManagement = () => {
  const { user } = useAuth();
  const [overdueReturns, setOverdueReturns] = useState([]);
  const [dueReturns, setDueReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overdue');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [overdueData, dueData] = await Promise.all([
        user?.role === 'admin' ? api.getOverdueReturns() : Promise.resolve([]),
        api.getDueReturns(),
      ]);
      setOverdueReturns(overdueData);
      setDueReturns(dueData);
    } catch (error) {
      console.error('Error fetching overdue/due data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckOverdue = async () => {
    if (user?.role !== 'admin') return;

    try {
      setRefreshing(true);
      const result = await api.checkOverdue();
      toast.success(
        `Overdue check completed: ${result.overdueCount} overdue, ${result.dueCount} due soon`
      );
      await fetchData(); // Refresh data after check
    } catch (error) {
      console.error('Error checking overdue items:', error);
      toast.error('Failed to check overdue items');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysText = (days, isOverdue = false) => {
    if (days === 1) {
      return isOverdue ? '1 day overdue' : 'due in 1 day';
    }
    return isOverdue ? `${days} days overdue` : `due in ${days} days`;
  };

  const getSeverityColor = (days, isOverdue = false) => {
    if (isOverdue) {
      if (days >= 7) return 'text-red-700 bg-red-100';
      if (days >= 3) return 'text-red-600 bg-red-50';
      return 'text-orange-600 bg-orange-50';
    } else {
      if (days <= 1) return 'text-red-600 bg-red-50';
      if (days <= 3) return 'text-orange-600 bg-orange-50';
      return 'text-yellow-600 bg-yellow-50';
    }
  };

  const OverdueTab = () => (
    <div className="space-y-4">
      {user?.role === 'admin' && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Overdue Returns ({overdueReturns.length})
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Items that are past their return date and require immediate attention
            </p>
          </div>
          <button
            onClick={handleCheckOverdue}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking...' : 'Check Overdue'}</span>
          </button>
        </div>
      )}

      {overdueReturns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Returns</h3>
          <p className="text-gray-600">All approved requests are within their return dates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overdueReturns.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Package className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.resource?.name || 'Unknown Resource'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        request.daysOverdue,
                        true
                      )}`}
                    >
                      {getDaysText(request.daysOverdue, true)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Borrowed by:</span>
                        <p className="font-medium">{request.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{request.user?.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium text-red-600">{formatDate(request.returnDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{request.quantity || 1} units</p>
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {request.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-red-700">OVERDUE</p>
                    <p className="text-xs text-red-600">{request.daysOverdue} days</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const DueTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-600" />
          Due Returns ({dueReturns.length})
        </h2>
        <p className="text-gray-600 text-sm mt-1">Items due for return within the next 7 days</p>
      </div>

      {dueReturns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Due Returns</h3>
          <p className="text-gray-600">
            {user?.role === 'admin'
              ? 'No items are due for return in the next 7 days.'
              : 'You have no items due for return in the next 7 days.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dueReturns.map((request) => (
            <div
              key={request._id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                request.daysUntilDue <= 1
                  ? 'border-red-500'
                  : request.daysUntilDue <= 3
                  ? 'border-orange-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Package className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.resource?.name || 'Unknown Resource'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        request.daysUntilDue
                      )}`}
                    >
                      {getDaysText(request.daysUntilDue)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {user?.role === 'admin' && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Borrowed by:</span>
                          <p className="font-medium">{request.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 capitalize">{request.user?.role}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">{formatDate(request.returnDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{request.quantity || 1} units</p>
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {request.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  <div
                    className={`p-3 rounded-lg ${
                      request.daysUntilDue <= 1
                        ? 'bg-red-100'
                        : request.daysUntilDue <= 3
                        ? 'bg-orange-100'
                        : 'bg-yellow-100'
                    }`}
                  >
                    <Clock
                      className={`w-6 h-6 mx-auto mb-1 ${
                        request.daysUntilDue <= 1
                          ? 'text-red-600'
                          : request.daysUntilDue <= 3
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        request.daysUntilDue <= 1
                          ? 'text-red-700'
                          : request.daysUntilDue <= 3
                          ? 'text-orange-700'
                          : 'text-yellow-700'
                      }`}
                    >
                      DUE SOON
                    </p>
                    <p
                      className={`text-xs ${
                        request.daysUntilDue <= 1
                          ? 'text-red-600'
                          : request.daysUntilDue <= 3
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {request.daysUntilDue} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Return Management' : 'My Due Returns'}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin'
            ? 'Monitor and manage overdue and upcoming return dates'
            : 'Keep track of your upcoming return dates'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('overdue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overdue'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue ({overdueReturns.length})</span>
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab('due')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'due'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Due Soon ({dueReturns.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overdue' && user?.role === 'admin' && <OverdueTab />}
      {activeTab === 'due' && <DueTab />}
    </div>
  );
};

export default OverdueManagement;
