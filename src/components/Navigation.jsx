import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import {
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  FileText,
  Users,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

const Navigation = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    console.log('Attempting to mark notification as read:', notificationId);
    try {
      await api.markNotificationRead(notificationId);
      console.log('Successfully marked notification as read');
      await fetchNotifications(); // Use await to ensure it completes
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read: ' + error.message);
    }
  };

  const markAllAsRead = async () => {
    console.log('Attempting to mark all notifications as read');
    try {
      const result = await api.markAllNotificationsRead();
      console.log('Mark all as read result:', result);
      await fetchNotifications(); // Use await to ensure it completes
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read: ' + error.message);
    }
  };

  const getNavigationItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'resources', label: 'Resources', icon: Package },
      { id: 'requests', label: 'My Requests', icon: FileText },
    ];

    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'resources', label: 'Manage Resources', icon: Package },
        { id: 'requests', label: 'All Requests', icon: FileText },
        { id: 'stakeholders', label: 'Stakeholder', icon: GraduationCap },
        { id: 'users', label: 'Users', icon: Users },
      ];
    }

    return commonItems;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">EduResource</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {getNavigationItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Bell clicked, current state:', showNotifications);
                    setShowNotifications(!showNotifications);
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-lg">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Mark all as read clicked');
                            markAllAsRead();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div
                      className="overflow-y-auto overflow-x-hidden"
                      style={{ maxHeight: '400px' }}
                    >
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            role="button"
                            tabIndex={0}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read
                                ? notification.title === 'Request Approved'
                                  ? 'bg-green-50'
                                  : notification.title === 'Request Denied'
                                  ? 'bg-red-50'
                                  : notification.title === 'Overdue Return' ||
                                    notification.title === 'Overdue Alert'
                                  ? 'bg-red-100'
                                  : notification.title === 'Return Due Soon'
                                  ? 'bg-yellow-50'
                                  : 'bg-blue-50'
                                : ''
                            } `}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                'Notification clicked:',
                                notification._id,
                                'Read:',
                                notification.read
                              );
                              if (!notification.read) {
                                markAsRead(notification._id);
                              }

                              // Determine the appropriate filter based on notification type
                              let filter = null;
                              if (notification.title === 'Request Approved') {
                                filter = 'approved';
                              } else if (notification.title === 'Request Denied') {
                                filter = 'denied';
                              } else if (notification.title === 'Return Request') {
                                filter = 'return_requested';
                              } else if (notification.title === 'Return Confirmed') {
                                filter = 'returned';
                              } else if (
                                notification.title === 'Overdue Return' ||
                                notification.title === 'Overdue Alert'
                              ) {
                                // Navigate to requests page with overdue filter
                                setShowNotifications(false);
                                onPageChange('requests', 'overdue');
                                return;
                              } else if (notification.title === 'Return Due Soon') {
                                // Navigate to requests page with due filter
                                setShowNotifications(false);
                                onPageChange('requests', 'due');
                                return;
                              }

                              // Close notification dropdown and redirect to requests page with filter
                              setShowNotifications(false);
                              onPageChange('requests', filter);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (!notification.read) {
                                  markAsRead(notification._id);
                                }

                                // Determine the appropriate filter based on notification type
                                let filter = null;
                                if (notification.title === 'Request Approved') {
                                  filter = 'approved';
                                } else if (notification.title === 'Request Denied') {
                                  filter = 'denied';
                                } else if (notification.title === 'Return Request') {
                                  filter = 'return_requested';
                                } else if (notification.title === 'Return Confirmed') {
                                  filter = 'returned';
                                } else if (
                                  notification.title === 'Overdue Return' ||
                                  notification.title === 'Overdue Alert'
                                ) {
                                  // Navigate to requests page with overdue filter
                                  setShowNotifications(false);
                                  onPageChange('requests', 'overdue');
                                  return;
                                } else if (notification.title === 'Return Due Soon') {
                                  // Navigate to requests page with due filter
                                  setShowNotifications(false);
                                  onPageChange('requests', 'due');
                                  return;
                                }

                                // Close notification dropdown and redirect to requests page with filter
                                setShowNotifications(false);
                                onPageChange('requests', filter);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <p
                                  className={`text-sm font-medium ${
                                    !notification.read
                                      ? notification.title === 'Request Approved'
                                        ? 'text-green-800'
                                        : notification.title === 'Request Denied'
                                        ? 'text-red-800'
                                        : notification.title === 'Overdue Return' ||
                                          notification.title === 'Overdue Alert'
                                        ? 'text-red-800'
                                        : notification.title === 'Return Due Soon'
                                        ? 'text-yellow-800'
                                        : 'text-gray-900'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    notification.title === 'Request Approved'
                                      ? 'bg-green-500'
                                      : notification.title === 'Request Denied'
                                      ? 'bg-red-500'
                                      : notification.title === 'Overdue Return' ||
                                        notification.title === 'Overdue Alert'
                                      ? 'bg-red-600'
                                      : notification.title === 'Return Due Soon'
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                                  }`}
                                ></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {getNavigationItems().map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={(e) => {
            e.preventDefault();
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
};

export default Navigation;
