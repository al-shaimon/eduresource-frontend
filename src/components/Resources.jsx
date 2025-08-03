import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import ConfirmationModal from './ConfirmationModal';
import ResourceRequestModal from './ResourceRequestModal';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedResourceForRequest, setSelectedResourceForRequest] = useState(null);

  // Category dropdown states
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 1,
    status: 'available',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.getResources();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterData = () => {
      let filtered = resources;

      if (searchTerm) {
        filtered = filtered.filter(
          (resource) =>
            resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((resource) => resource.status === statusFilter);
      }

      if (categoryFilter !== 'all') {
        filtered = filtered.filter((resource) => resource.category === categoryFilter);
      }

      setFilteredResources(filtered);
    };

    filterData();
  }, [resources, searchTerm, statusFilter, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedResource) {
        await api.updateResource(selectedResource._id, formData);
        toast.success('Resource updated successfully!');
      } else {
        await api.createResource(formData);
        toast.success('Resource created successfully!');
      }
      fetchResources();
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    setSelectedResource({ id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.deleteResource(selectedResource.id);
      fetchResources();
      toast.success('Resource deleted successfully!');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource. Please try again.');
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description,
      category: resource.category,
      quantity: resource.quantity,
      status: resource.status,
    });

    // Check if the category exists in available categories
    const categories = [...new Set(resources.map((r) => r.category))];
    if (categories.includes(resource.category)) {
      setSelectedCategoryOption(resource.category);
      setIsCustomCategory(false);
    } else {
      setSelectedCategoryOption('custom');
      setIsCustomCategory(true);
    }

    setShowEditModal(true);
  };

  const handleCategorySelection = (value) => {
    setSelectedCategoryOption(value);
    if (value === 'custom') {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 1,
      status: 'available',
    });
    setSelectedResource(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setIsCustomCategory(true); // Default to custom for new resources
    setSelectedCategoryOption('custom');
  };

  const handleRequest = async (resource) => {
    setSelectedResourceForRequest(resource);
    setShowRequestModal(true);
  };

  const confirmRequest = async (requestData) => {
    try {
      await api.createRequest(requestData);
      toast.success('Request submitted successfully!');
      fetchResources();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Error submitting request: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'booked':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      booked: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${
      badges[status] || 'bg-gray-100 text-gray-800'
    }`;
  };

  const categories = [...new Set(resources.map((r) => r.category))];

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
            {user?.role === 'admin' ? 'Manage Resources' : 'Available Resources'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin'
              ? 'Add, edit, and manage all departmental resources'
              : 'Browse and request available departmental resources'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(resource.status)}
                  <span className={getStatusBadge(resource.status)}>{resource.status}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{resource.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Quantity:</span>
                  <span className="font-medium">{resource.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available:</span>
                  <span className="font-medium">
                    {resource.availableQuantity !== undefined
                      ? resource.availableQuantity
                      : resource.quantity - (resource.currentlyBooked || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                {user?.role === 'admin' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(resource._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRequest(resource)}
                    disabled={
                      resource.status !== 'available' ||
                      (resource.availableQuantity !== undefined
                        ? resource.availableQuantity <= 0
                        : resource.quantity - (resource.currentlyBooked || 0) <= 0)
                    }
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {resource.status === 'available' &&
                    (resource.availableQuantity !== undefined
                      ? resource.availableQuantity > 0
                      : resource.quantity - (resource.currentlyBooked || 0) > 0)
                      ? 'Request Resource'
                      : 'Not Available'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No resources available'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[55]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-[55]">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                  <select
                    value={selectedCategoryOption || 'custom'}
                    onChange={(e) => handleCategorySelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a category...</option>
                    {[...new Set(resources.map((r) => r.category))].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="custom">+ Add new category</option>
                  </select>

                  {(isCustomCategory ||
                    selectedCategoryOption === 'custom' ||
                    selectedCategoryOption === '') && (
                    <input
                      type="text"
                      placeholder="Enter category name"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedResource ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Resource Request Modal */}
      <ResourceRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedResourceForRequest(null);
        }}
        onConfirm={confirmRequest}
        resource={selectedResourceForRequest}
      />
    </div>
  );
};

export default Resources;
