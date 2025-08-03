import React, { useState } from 'react';
import { XCircle, X } from 'lucide-react';

const DenialModal = ({ isOpen, onClose, onConfirm, requestData = null }) => {
  const [denialReason, setDenialReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !requestData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!denialReason.trim()) {
      setError('Please provide a reason for denial');
      return;
    }

    if (denialReason.trim().length < 10) {
      setError('Denial reason must be at least 10 characters');
      return;
    }

    onConfirm(denialReason.trim());
    handleClose();
  };

  const handleClose = () => {
    setDenialReason('');
    setError('');
    onClose();
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
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Deny Request</h3>
                  <p className="text-sm text-gray-600">
                    {requestData.resource?.name || 'Resource Request'}
                  </p>
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
            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requested by:</span>
                <span className="font-medium text-gray-900">
                  {requestData.user?.name || 'Unknown User'}
                </span>
              </div>
              {requestData.quantity && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-gray-900">{requestData.quantity} units</span>
                </div>
              )}
              {requestData.duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{requestData.duration} days</span>
                </div>
              )}
            </div>

            {/* Denial Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Denial <span className="text-red-500">*</span>
              </label>
              <textarea
                value={denialReason}
                onChange={(e) => {
                  setDenialReason(e.target.value);
                  if (error) setError('');
                }}
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide a clear reason for denying this request..."
                required
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {denialReason.length}/500 characters (minimum 10 required)
              </p>
            </div>

            {/* Common Denial Reasons (Quick Select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select Reasons
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Resource currently unavailable for maintenance',
                  'Insufficient quantity available',
                  'Request duration exceeds maximum allowed period',
                  'Resource reserved for specific department use',
                  'Additional approval required for this resource type',
                ].map((reason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setDenialReason(reason)}
                    className="text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
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
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Deny Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DenialModal;
