import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import DenialModal from './DenialModal';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Package,
  User,
  AlertCircle,
  Check,
  X,
  Crown,
  GraduationCap,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

const Requests = ({ initialFilter = null }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'all');
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [lastInitialFilter, setLastInitialFilter] = useState(initialFilter);
  const [, setOverdueReturns] = useState([]);
  const [dueReturns, setDueReturns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Denial modal state
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [selectedRequestForDenial, setSelectedRequestForDenial] = useState(null);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update status filter when initialFilter prop changes
  useEffect(() => {
    if (initialFilter && initialFilter !== lastInitialFilter) {
      setStatusFilter(initialFilter);
      setLastInitialFilter(initialFilter);
    }
  }, [initialFilter, lastInitialFilter]);

  const fetchRequests = async () => {
    try {
      const [requestsData, overdueData, dueData] = await Promise.all([
        api.getRequests(),
        user?.role === 'admin' ? api.getOverdueReturns() : Promise.resolve([]),
        api.getDueReturns(),
      ]);
      console.log('Fetched requests:', requestsData); // Debug log
      setRequests(requestsData);
      setOverdueReturns(overdueData);
      setDueReturns(dueData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterData = () => {
      let filtered = requests;

      if (statusFilter === 'overdue') {
        // Filter for overdue approved requests
        filtered = requests.filter(
          (request) =>
            request.status === 'approved' &&
            request.returnDate &&
            new Date(request.returnDate) < new Date()
        );
      } else if (statusFilter === 'due') {
        // Filter for due soon (within 7 days)
        const currentDate = new Date();
        const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        filtered = requests.filter(
          (request) =>
            request.status === 'approved' &&
            request.returnDate &&
            new Date(request.returnDate) >= currentDate &&
            new Date(request.returnDate) <= sevenDaysFromNow
        );
      } else if (statusFilter !== 'all') {
        filtered = filtered.filter((request) => request.status === statusFilter);
      }

      // Sort requests - for admin, prioritize pending requests at the top
      if (user?.role === 'admin') {
        filtered.sort((a, b) => {
          // Priority 1: Pending requests first
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (b.status === 'pending' && a.status !== 'pending') return 1;

          // Priority 2: Within pending requests, sort by priority score (lower = higher priority)
          if (a.status === 'pending' && b.status === 'pending') {
            const aPriorityScore = a.priorityScore || 5;
            const bPriorityScore = b.priorityScore || 5;
            if (aPriorityScore !== bPriorityScore) {
              return aPriorityScore - bPriorityScore;
            }
          }

          // Priority 3: Then by creation date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      } else {
        // For non-admin users, just sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      console.log(`Filtering by status: ${statusFilter}, found ${filtered.length} requests`); // Debug log
      setFilteredRequests(filtered);
    };

    filterData();
  }, [requests, statusFilter, user?.role]);

  const handleCheckOverdue = async () => {
    if (user?.role !== 'admin') return;

    try {
      setRefreshing(true);
      const result = await api.checkOverdue();
      toast.success(
        `Overdue check completed: ${result.overdueCount} overdue, ${result.dueCount} due soon`
      );
      await fetchRequests(); // Refresh data after check
    } catch (error) {
      console.error('Error checking overdue items:', error);
      toast.error('Failed to check overdue items');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.updateRequest(requestId, { status: 'approved' });
      fetchRequests();
      toast.success('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error approving request: ' + error.message);
    }
  };

  const handleDeny = async (request) => {
    setSelectedRequestForDenial(request);
    setShowDenialModal(true);
  };

  const confirmDenial = async (denialReason) => {
    try {
      await api.updateRequest(selectedRequestForDenial._id, {
        status: 'denied',
        denialReason: denialReason,
      });
      fetchRequests();
      toast.success('Request denied successfully!');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Error denying request: ' + error.message);
    }
  };

  const handleReturn = async (requestId) => {
    try {
      await api.updateRequest(requestId, { status: 'return_requested' });
      toast.success('Return request submitted successfully! Admin will verify the return.');
      fetchRequests();
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error('Error requesting return: ' + error.message);
    }
  };

  const handleConfirmReturn = async (requestId) => {
    try {
      await api.updateRequest(requestId, { status: 'returned' });
      toast.success('Return confirmed successfully!');
      fetchRequests();
    } catch (error) {
      console.error('Error confirming return:', error);
      toast.error('Error confirming return: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'return_requested':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'returned':
        return <Package className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      return_requested: 'bg-orange-100 text-orange-800',
      returned: 'bg-blue-100 text-blue-800',
    };

    return `px-3 py-1 rounded-full text-xs font-medium ${
      badges[status] || 'bg-gray-100 text-gray-800'
    }`;
  };

  const isOverdue = (request) => {
    if (request.status !== 'approved' || !request.returnDate) return false;
    return new Date(request.returnDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysOverdue = (returnDate) => {
    const currentDate = new Date();
    const due = new Date(returnDate);
    if (due >= currentDate) return 0;
    return Math.floor((currentDate - due) / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilDue = (returnDate) => {
    const currentDate = new Date();
    const due = new Date(returnDate);
    if (due <= currentDate) return 0;
    return Math.ceil((due - currentDate) / (1000 * 60 * 60 * 24));
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      faculty: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
    };

    return `px-2 py-1 rounded-full text-xs font-medium capitalize ${
      badges[role] || 'bg-gray-100 text-gray-800'
    }`;
  };

  const getRolePriority = (role) => {
    switch (role) {
      case 'faculty':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
            <Star className="w-3 h-3 mr-1" />
            Priority
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority, requestUserRole) => {
    // Only show priority badges for faculty requests when viewed by admin
    if (!priority || requestUserRole !== 'faculty' || user?.role !== 'admin') return null;

    const badges = {
      urgent: 'bg-red-100 text-red-800',
      research: 'bg-blue-100 text-blue-800',
      standard: 'bg-gray-100 text-gray-600',
    };

    const labels = {
      urgent: 'Urgent Research',
      research: 'Research Priority',
      standard: 'Standard Priority',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[priority]} ml-2`}
      >
        {priority === 'urgent' && <AlertCircle className="w-3 h-3 mr-1" />}
        {priority === 'research' && <Star className="w-3 h-3 mr-1" />}
        {labels[priority]}
      </span>
    );
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'All Requests' : 'My Requests'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin'
              ? 'Review and manage all resource requests. Faculty requests are prioritized.'
              : 'Track your resource checkout requests and history'}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({requests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({requests.filter((r) => r.status === 'approved').length})
          </button>

          {/* Overdue Filter - Only show for admin or if user has overdue items */}
          {(user?.role === 'admin' ||
            dueReturns.some((r) => new Date(r.returnDate) < new Date())) && (
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Overdue (
              {
                requests.filter(
                  (r) =>
                    r.status === 'approved' && r.returnDate && new Date(r.returnDate) < new Date()
                ).length
              }
              )
            </button>
          )}

          {/* Due Soon Filter */}
          <button
            onClick={() => setStatusFilter('due')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'due'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Due Soon (
            {(() => {
              const currentDate = new Date();
              const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              return requests.filter(
                (r) =>
                  r.status === 'approved' &&
                  r.returnDate &&
                  new Date(r.returnDate) >= currentDate &&
                  new Date(r.returnDate) <= sevenDaysFromNow
              ).length;
            })()}
            )
          </button>

          <button
            onClick={() => setStatusFilter('denied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'denied'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Denied ({requests.filter((r) => r.status === 'denied').length})
          </button>
          <button
            onClick={() => setStatusFilter('return_requested')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'return_requested'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Return Requested ({requests.filter((r) => r.status === 'return_requested').length})
          </button>
          <button
            onClick={() => setStatusFilter('returned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'returned'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Returned ({requests.filter((r) => r.status === 'returned').length})
          </button>
        </div>

        {/* Admin Manual Overdue Check Button */}
        {user?.role === 'admin' && (statusFilter === 'overdue' || statusFilter === 'due') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleCheckOverdue}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              <AlertCircle className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking...' : 'Check for Updates'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all'
                ? `No ${statusFilter} requests found`
                : 'No requests have been made yet'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                isOverdue(request)
                  ? 'border-red-500'
                  : request.status === 'pending'
                  ? 'border-yellow-500'
                  : request.status === 'approved'
                  ? 'border-green-500'
                  : request.status === 'denied'
                  ? 'border-red-500'
                  : request.status === 'return_requested'
                  ? 'border-orange-500'
                  : 'border-blue-500'
              }`}
            >
              {/* Main Content Area */}
              <div className="space-y-4">
                {/* Header with Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.resource?.name || 'Unknown Resource'}
                      </h3>
                      {user?.role === 'admin' && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(request.user?.role)}
                            <span className="text-sm text-gray-600">
                              by {request.user?.name || 'Unknown User'}
                            </span>
                            <span className={getRoleBadge(request.user?.role)}>
                              {request.user?.role || 'unknown'}
                            </span>
                            {getRolePriority(request.user?.role)}
                            {getPriorityBadge(request.priority, request.user?.role)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status Badge - Always in top right */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={getStatusBadge(request.status)}>
                      {request.status === 'return_requested' ? 'return requested' : request.status}
                    </span>
                    {isOverdue(request) && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          getDaysOverdue(request.returnDate),
                          true
                        )}`}
                      >
                        {getDaysOverdue(request.returnDate)} days overdue
                      </span>
                    )}
                    {!isOverdue(request) &&
                      request.status === 'approved' &&
                      request.returnDate &&
                      (() => {
                        const daysUntil = getDaysUntilDue(request.returnDate);
                        if (daysUntil <= 7 && daysUntil > 0) {
                          return (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                daysUntil,
                                false
                              )}`}
                            >
                              Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                            </span>
                          );
                        }
                        return null;
                      })()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Requested:</span>
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  {request.quantity && (
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{request.quantity} units</p>
                      </div>
                    </div>
                  )}

                  {request.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{request.duration} days</p>
                      </div>
                    </div>
                  )}

                  {request.returnDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Return Date:</span>
                        <p className="font-medium">{formatDate(request.returnDate)}</p>
                      </div>
                    </div>
                  )}

                  {request.approvedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Approved:</span>
                        <p className="font-medium">{formatDate(request.approvedAt)}</p>
                      </div>
                    </div>
                  )}

                  {request.returnRequestedAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Return Requested:</span>
                        <p className="font-medium">{formatDate(request.returnRequestedAt)}</p>
                      </div>
                    </div>
                  )}

                  {request.returnedAt && (
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-gray-500">Returned:</span>
                        <p className="font-medium">{formatDate(request.returnedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Denial Reason */}
                {request.denialReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Denial Reason:</span> {request.denialReason}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {request.notes && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {request.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons Section - Always at the bottom */}
                {((user?.role === 'admin' && request.status === 'pending') ||
                  (user?.role === 'admin' && request.status === 'return_requested') ||
                  (user?.role !== 'admin' && request.status === 'approved') ||
                  (request.status === 'return_requested' && user?.role !== 'admin')) && (
                  <div className="pt-4 border-t border-gray-200">
                    {/* Admin Actions for Pending Requests */}
                    {user?.role === 'admin' && request.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDeny(request)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Deny</span>
                        </button>
                      </div>
                    )}

                    {/* Admin Actions for Return Requests */}
                    {user?.role === 'admin' && request.status === 'return_requested' && (
                      <button
                        onClick={() => handleConfirmReturn(request._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Confirm Return</span>
                      </button>
                    )}

                    {/* User Action - Request Return */}
                    {user?.role !== 'admin' && request.status === 'approved' && (
                      <button
                        onClick={() => handleReturn(request._id)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Request Return</span>
                      </button>
                    )}

                    {/* Status message for return requested */}
                    {request.status === 'return_requested' && user?.role !== 'admin' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                        <p className="text-sm text-orange-700 font-medium">Return requested</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Denial Modal */}
      <DenialModal
        isOpen={showDenialModal}
        onClose={() => {
          setShowDenialModal(false);
          setSelectedRequestForDenial(null);
        }}
        onConfirm={confirmDenial}
        requestData={selectedRequestForDenial}
      />
    </div>
  );
};

export default Requests;
