import React, { useState } from 'react';
import { Package, Calendar, Hash, X, Star, Crown, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStakeholderPolicies } from '../hooks/useStakeholderPolicies';

const ResourceRequestModal = ({ isOpen, onClose, onConfirm, resource = null }) => {
  const { user } = useAuth();
  const { policies: stakeholderPolicies, getRolePolicies } = useStakeholderPolicies();

  // Get policies for the current user's role
  const policies = getRolePolicies(user?.role, resource);

  const [formData, setFormData] = useState({
    quantity: 1,
    duration: policies.defaultDuration,
    notes: '',
    priority: policies.allowedPriorities?.[0] || 'standard',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen || !resource) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.quantity > resource.availableQuantity) {
      newErrors.quantity = `Only ${resource.availableQuantity} units available`;
    }

    if (formData.quantity > policies.maxQuantity) {
      newErrors.quantity = `${user?.role || 'User'} can request maximum ${
        policies.maxQuantity
      } units`;
    }

    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 day';
    }

    if (formData.duration > policies.maxDuration) {
      newErrors.duration = `${user?.role || 'User'} can checkout for maximum ${
        policies.maxDuration
      } days`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate return date
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + parseInt(formData.duration));

    const requestData = {
      resourceId: resource._id,
      quantity: parseInt(formData.quantity),
      duration: parseInt(formData.duration),
      returnDate: returnDate.toISOString().split('T')[0],
      notes: formData.notes.trim(),
      priority: formData.priority, // Include priority for faculty
      userRole: user?.role, // Include user role for backend processing
    };

    onConfirm(requestData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      quantity: 1,
      duration: policies.defaultDuration,
      notes: '',
      priority: policies.allowedPriorities?.[0] || 'standard',
    });
    setErrors({});
    onClose();
  };

  const getReturnDate = () => {
    if (!formData.duration) return '';
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + parseInt(formData.duration));
    return returnDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-all duration-300 ease-out"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all duration-300 ease-out w-full max-w-md z-[60]">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Request Resource</h3>
                  <p className="text-sm text-gray-600">{resource.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Resource Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available Quantity:</span>
                <span className="font-medium text-gray-900">
                  {resource.availableQuantity} units
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{resource.category}</span>
              </div>
            </div>

            {/* Role-based Policies Information */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                {user?.role === 'faculty' && <GraduationCap className="w-4 h-4 text-blue-600" />}
                {user?.role === 'admin' && <Crown className="w-4 h-4 text-purple-600" />}
                {user?.role === 'student' && <Package className="w-4 h-4 text-green-600" />}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {user?.role} Policies
                </span>
                {stakeholderPolicies && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Updated
                  </span>
                )}
                {policies.priorityAccess && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Priority Access
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Max Duration:</span> {policies.maxDuration} days
                </div>
                <div>
                  <span className="font-medium">Max Quantity:</span> {policies.maxQuantity} units
                </div>
              </div>
              {policies.allowedPriorities && policies.allowedPriorities.length > 1 && (
                <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 mt-2">
                  ✓ Multiple priority levels available: {policies.allowedPriorities.join(', ')}
                </div>
              )}
              {user?.role === 'faculty' && policies.maxDuration >= 90 && (
                <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 mt-2">
                  ✓ Extended checkout periods for research purposes
                </div>
              )}
            </div>

            {/* Priority Selection - Dynamic based on role policies */}
            {policies.allowedPriorities && policies.allowedPriorities.length > 1 && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Star className="w-4 h-4" />
                  <span>Request Priority</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                >
                  {policies.allowedPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'urgent' && 'Urgent Research'}
                      {priority === 'research' && 'Research Priority'}
                      {priority === 'standard' && 'Standard Priority'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  {policies.priorityAccess
                    ? 'Priority requests are processed first within your role queue'
                    : 'Standard priority only for your role'}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                <span>Quantity Needed</span>
              </label>
              <input
                type="number"
                min="1"
                max={Math.min(resource.availableQuantity, policies.maxQuantity)}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              <p className="mt-1 text-xs text-gray-600">
                Maximum allowed: {Math.min(resource.availableQuantity, policies.maxQuantity)} units
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Duration (Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max={policies.maxDuration}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter number of days"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              <p className="mt-1 text-xs text-gray-600">
                Maximum allowed: {policies.maxDuration} days
              </p>
              {formData.duration && !errors.duration && (
                <p className="mt-1 text-sm text-gray-600">
                  Expected return date: {getReturnDate()}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Any special requirements or notes..."
              />
              <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/500 characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceRequestModal;
