import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useStakeholderPolicies = () => {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStakeholderPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Error fetching stakeholder policies:', err);
      setError(err.message);
      setPolicies(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const refreshPolicies = () => {
    fetchPolicies();
  };

  const getRolePolicies = (role, resource = null) => {
    // If we have dynamic policies from API, use them
    if (policies && policies[role]) {
      const dynamicPolicy = policies[role];
      return {
        maxDuration: dynamicPolicy.maxDuration || 7,
        defaultDuration: role === 'faculty' ? 14 : 7,
        priorityAccess: dynamicPolicy.priorityAccess || false,
        canReserve: role !== 'student',
        maxQuantity: Math.min(dynamicPolicy.maxQuantity || 1, resource?.availableQuantity || 1),
        allowedPriorities: dynamicPolicy.allowedPriorities || ['standard'],
      };
    }

    // Fallback to hardcoded policies if API data not available
    switch (role) {
      case 'faculty':
        return {
          maxDuration: 90,
          defaultDuration: 14,
          priorityAccess: true,
          canReserve: true,
          maxQuantity: Math.min(10, resource?.availableQuantity || 1),
          allowedPriorities: ['urgent', 'research', 'standard'],
        };
      case 'student':
        return {
          maxDuration: 30,
          defaultDuration: 7,
          priorityAccess: false,
          canReserve: false,
          maxQuantity: Math.min(3, resource?.availableQuantity || 1),
          allowedPriorities: ['standard'],
        };
      case 'admin':
        return {
          maxDuration: 365,
          defaultDuration: 7,
          priorityAccess: true,
          canReserve: true,
          maxQuantity: resource?.availableQuantity || 1,
          allowedPriorities: ['urgent', 'research', 'standard'],
        };
      default:
        return {
          maxDuration: 7,
          defaultDuration: 7,
          priorityAccess: false,
          canReserve: false,
          maxQuantity: 1,
          allowedPriorities: ['standard'],
        };
    }
  };

  return {
    policies,
    loading,
    error,
    refreshPolicies,
    getRolePolicies,
  };
};
