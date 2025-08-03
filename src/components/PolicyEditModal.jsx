import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';

const PolicyEditModal = ({ isOpen, onClose, policies, onSave }) => {
  const [formData, setFormData] = useState({
    faculty: {
      maxDuration: 90,
      maxQuantity: 10,
      priorityAccess: true,
      allowedPriorities: ['urgent', 'research', 'standard'],
    },
    student: {
      maxDuration: 30,
      maxQuantity: 3,
      priorityAccess: false,
      allowedPriorities: ['standard'],
    },
    admin: {
      maxDuration: 365,
      maxQuantity: 999999,
      priorityAccess: true,
      allowedPriorities: ['urgent', 'research', 'standard'],
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (policies && isOpen) {
      setFormData({
        faculty: { ...policies.faculty },
        student: { ...policies.student },
        admin: { ...policies.admin },
      });
    }
  }, [policies, isOpen]);

  const handleInputChange = (role, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }));
  };

  const handlePriorityChange = (role, priority, checked) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        allowedPriorities: checked
          ? [...prev[role].allowedPriorities, priority]
          : prev[role].allowedPriorities.filter((p) => p !== priority),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving policies:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Stakeholder Policies</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure role-based access controls and resource limits
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-8">
            {/* Faculty Policy */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                Faculty Policy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.faculty.maxDuration}
                    onChange={(e) =>
                      handleInputChange('faculty', 'maxDuration', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Quantity (units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.faculty.maxQuantity}
                    onChange={(e) =>
                      handleInputChange('faculty', 'maxQuantity', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.faculty.priorityAccess}
                      onChange={(e) =>
                        handleInputChange('faculty', 'priorityAccess', e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Priority Access
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Faculty requests will be processed before student requests
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Priority Levels
                  </label>
                  <div className="flex space-x-4">
                    {['urgent', 'research', 'standard'].map((priority) => (
                      <label key={priority} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.faculty.allowedPriorities.includes(priority)}
                          onChange={(e) =>
                            handlePriorityChange('faculty', priority, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Policy */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                Student Policy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.student.maxDuration}
                    onChange={(e) =>
                      handleInputChange('student', 'maxDuration', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Quantity (units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.student.maxQuantity}
                    onChange={(e) =>
                      handleInputChange('student', 'maxQuantity', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.student.priorityAccess}
                      onChange={(e) =>
                        handleInputChange('student', 'priorityAccess', e.target.checked)
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Priority Access
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Student requests typically use fair queue system
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Priority Levels
                  </label>
                  <div className="flex space-x-4">
                    {['urgent', 'research', 'standard'].map((priority) => (
                      <label key={priority} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.student.allowedPriorities.includes(priority)}
                          onChange={(e) =>
                            handlePriorityChange('student', priority, e.target.checked)
                          }
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Policy */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                Admin Policy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.admin.maxDuration}
                    onChange={(e) =>
                      handleInputChange('admin', 'maxDuration', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Quantity (units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999999"
                    value={formData.admin.maxQuantity}
                    onChange={(e) =>
                      handleInputChange('admin', 'maxQuantity', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.admin.priorityAccess}
                      onChange={(e) =>
                        handleInputChange('admin', 'priorityAccess', e.target.checked)
                      }
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Priority Access
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Admins have override capabilities regardless of this setting
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Priority Levels
                  </label>
                  <div className="flex space-x-4">
                    {['urgent', 'research', 'standard'].map((priority) => (
                      <label key={priority} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.admin.allowedPriorities.includes(priority)}
                          onChange={(e) =>
                            handlePriorityChange('admin', priority, e.target.checked)
                          }
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Policy Change Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes to stakeholder policies will affect all future requests. Existing approved
                  requests will not be modified. Make sure to communicate policy changes to all
                  stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyEditModal;
