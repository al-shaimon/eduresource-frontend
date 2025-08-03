import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStakeholderPolicies } from '../hooks/useStakeholderPolicies';
import { api } from '../utils/api';
import PolicyEditModal from './PolicyEditModal';
import {
  Users,
  GraduationCap,
  AlertCircle,
  Crown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  Star,
  TrendingUp,
  BarChart3,
  Settings,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

const StakeholderManagement = ({ onPageChange }) => {
  const { user } = useAuth();
  const { policies, refreshPolicies } = useStakeholderPolicies();
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    roleStats: {
      faculty: 0,
      student: 0,
      admin: 0,
    },
    priorityStats: {
      urgent: 0,
      research: 0,
      standard: 0,
    },
    conflictingRequests: 0,
    conflictDetails: [],
    complianceRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Function to navigate to requests with specific filter
  const navigateToRequests = (filter = null) => {
    onPageChange('requests', filter);
  };

  const fetchStakeholderData = async () => {
    try {
      setLoading(true);
      const analyticsData = await api.getStakeholderAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching stakeholder data:', error);
      toast.error('Failed to fetch stakeholder data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySave = async (updatedPolicies) => {
    try {
      await api.updateStakeholderPolicies(updatedPolicies);
      toast.success('Stakeholder policies updated successfully!');

      // Refresh policies data using the hook
      refreshPolicies();
    } catch (error) {
      console.error('Error updating policies:', error);
      toast.error('Failed to update policies: ' + error.message);
      throw error; // Re-throw to let modal handle the error
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStakeholderData();
    }
  }, [user?.role]);

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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    const badges = {
      urgent: 'bg-red-100 text-red-800',
      research: 'bg-blue-100 text-blue-800',
      standard: 'bg-gray-100 text-gray-600',
    };

    const labels = {
      urgent: 'Urgent Research',
      research: 'Research Priority',
      standard: 'Standard',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[priority]}`}
      >
        {priority === 'urgent' && <AlertCircle className="w-3 h-3 mr-1" />}
        {priority === 'research' && <Star className="w-3 h-3 mr-1" />}
        {labels[priority]}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can access stakeholder management.</p>
        </div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 text-white">Stakeholder Management</h1>
        <p className="text-indigo-100">
          Manage conflicting requirements and priorities across Faculty, Students, and Admin roles.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faculty Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.roleStats.faculty}</p>
              <p className="text-xs text-gray-500 mt-1">Priority access enabled</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Student Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.roleStats.student}</p>
              <p className="text-xs text-gray-500 mt-1">Fair queue system</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.priorityStats.urgent}</p>
              <p className="text-xs text-gray-500 mt-1">Highest priority</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflicting Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.conflictingRequests}</p>
              <p className="text-xs text-gray-500 mt-1">Require resolution</p>
            </div>
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stakeholder Policies */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Stakeholder Policies
                </h2>
                <p className="text-sm text-gray-600 mt-1">Role-based access controls and limits</p>
              </div>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Policies</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            {policies ? (
              <div className="space-y-6">
                {/* Faculty Policy */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Faculty Policy</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Priority Access:</span>
                      <p className="font-medium text-blue-600">
                        {policies.faculty.priorityAccess ? '✓ Enabled' : '✗ Disabled'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Duration:</span>
                      <p className="font-medium">{policies.faculty.maxDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Quantity:</span>
                      <p className="font-medium">{policies.faculty.maxQuantity} units</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority Types:</span>
                      <p className="font-medium">{policies.faculty.allowedPriorities.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToRequests('pending')}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Review Faculty Requests
                  </button>
                </div>

                {/* Student Policy */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Student Policy</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Access Type:</span>
                      <p className="font-medium text-green-600">
                        {policies.student.priorityAccess ? 'Priority Access' : 'Fair Queue'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Duration:</span>
                      <p className="font-medium">{policies.student.maxDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Quantity:</span>
                      <p className="font-medium">{policies.student.maxQuantity} units</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority Level:</span>
                      <p className="font-medium">{policies.student.allowedPriorities.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToRequests('all')}
                    className="mt-3 w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Monitor Student Requests
                  </button>
                </div>

                {/* Admin Policy */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Admin Policy</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Access Level:</span>
                      <p className="font-medium text-purple-600">
                        {policies.admin.priorityAccess ? 'Full Override' : 'Standard Access'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Duration:</span>
                      <p className="font-medium">{policies.admin.maxDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Quantity:</span>
                      <p className="font-medium">
                        {policies.admin.maxQuantity >= 999999
                          ? 'Unlimited'
                          : `${policies.admin.maxQuantity} units`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Override Power:</span>
                      <p className="font-medium">{policies.admin.allowedPriorities.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToRequests('overdue')}
                    className="mt-3 w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    Manage Overdue Items
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading policies...</p>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Resolution */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Conflict Resolution
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pending requests requiring priority decisions
            </p>
          </div>
          <div className="p-6">
            {analytics.conflictDetails.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">No conflicts detected</p>
                <p className="text-sm text-gray-400 mt-1">
                  All requests are following priority rules
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.conflictDetails.map((conflict) =>
                  conflict.requests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          {getRoleIcon(request.user?.role)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {conflict.resource?.name || 'Unknown Resource'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              by {request.user?.name || 'Unknown User'} ({request.user?.role})
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested: {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {getPriorityBadge(request.priority)}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Conflict
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => navigateToRequests('pending')}
                  className="w-full mt-4 py-2 text-center text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                >
                  Resolve All Conflicts →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Priority Analytics */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Priority Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">Request distribution by priority and role</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-900">Urgent Research</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {analytics.priorityStats.urgent}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">Research Priority</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {analytics.priorityStats.research}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">Standard Requests</span>
                </div>
                <span className="text-lg font-bold text-gray-600">
                  {analytics.priorityStats.standard}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Policy Compliance</span>
                <span className="text-sm font-bold text-green-600">
                  {analytics.complianceRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analytics.complianceRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Requests following role-based policies</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Quick Actions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Common stakeholder management tasks</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => navigateToRequests('pending')}
                className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-gray-900">Review Pending Requests</span>
                </div>
                <span className="text-yellow-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <button
                onClick={() => navigateToRequests('overdue')}
                className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-gray-900">Handle Overdue Returns</span>
                </div>
                <span className="text-red-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <button
                onClick={() => onPageChange('users')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">Manage User Roles</span>
                </div>
                <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <button
                onClick={() => onPageChange('resources')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Resource Allocation</span>
                </div>
                <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <button
                onClick={() => navigateToRequests('due')}
                className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-gray-900">Check Due Returns</span>
                </div>
                <span className="text-orange-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Edit Modal */}
      <PolicyEditModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        policies={policies}
        onSave={handlePolicySave}
      />
    </div>
  );
};

export default StakeholderManagement;
