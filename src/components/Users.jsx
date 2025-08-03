import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  Calendar,
  Package,
  FileText,
  Crown,
  GraduationCap,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users directly from the users API endpoint
      const usersData = await api.getUsers();

      // Fetch requests to get user statistics
      const requestsData = await api.getRequests();

      // Calculate individual user stats
      const individualStats = {};
      requestsData.forEach((request) => {
        if (request.user && request.user._id) {
          const userId = request.user._id;
          if (!individualStats[userId]) {
            individualStats[userId] = {
              requestCount: 0,
              approvedCount: 0,
              pendingCount: 0,
              lastRequest: null,
            };
          }
          individualStats[userId].requestCount++;
          if (request.status === 'approved') individualStats[userId].approvedCount++;
          if (request.status === 'pending') individualStats[userId].pendingCount++;

          // Track the most recent request
          if (
            !individualStats[userId].lastRequest ||
            new Date(request.createdAt) > new Date(individualStats[userId].lastRequest)
          ) {
            individualStats[userId].lastRequest = request.createdAt;
          }
        }
      });

      // Calculate overall stats
      const overallStats = {
        total: usersData.length,
        students: usersData.filter((u) => u.role === 'student').length,
        faculty: usersData.filter((u) => u.role === 'faculty').length,
        admins: usersData.filter((u) => u.role === 'admin').length,
        individual: individualStats,
      };

      setUsers(usersData);
      setUserStats(overallStats);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterData = () => {
      let filtered = users;

      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }

      setFilteredUsers(filtered);
    };

    filterData();
  }, [users, searchTerm, roleFilter]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view this page.</p>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">View and manage all users in the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total || 0}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.students || 0}</p>
            </div>
            <User className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.faculty || 0}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.admins || 0}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No users available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((userItem) => (
              <div key={userItem._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {userItem.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{userItem.name}</h3>
                        {getRoleIcon(userItem.role)}
                      </div>
                      <p className="text-gray-600">{userItem.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={getRoleBadge(userItem.role)}>{userItem.role}</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(userItem.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <FileText className="w-4 h-4" />
                        <span>Requests</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {userStats.individual?.[userItem._id]?.requestCount || 0}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <Package className="w-4 h-4" />
                        <span>Pending</span>
                      </div>
                      <p className="text-lg font-semibold text-yellow-600">
                        {userStats.individual?.[userItem._id]?.pendingCount || 0}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-gray-500 mb-1">
                        <UserCheck className="w-4 h-4" />
                        <span>Approved</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        {userStats.individual?.[userItem._id]?.approvedCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
