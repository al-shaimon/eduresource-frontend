# EduResource Frontend

A modern React-based frontend for the **EduResource Departmental Resource Checkout and Monitoring
System** - a comprehensive full-stack web application that enables authenticated users (students,
faculty, staff) to browse, request, and check out departmental resources with role-based access
control and real-time inventory management.

## 🎯 Project Overview

**Course**: CSE-3532 - Tools and Technologies for Internet Programming  
**Institution**: International Islamic University Chittagong (IIUC)  
**Project**: EduResource - Departmental Resource Checkout and Monitoring System

### Problem Statement

University departments often manage shared physical resources such as lab equipment, projectors,
laptops, and study materials. Current resource checkout is typically manual, paper-based, or handled
through disconnected spreadsheets, causing:

- Inefficient tracking of resource availability
- Conflicts and double bookings
- Unauthorized usage or delayed returns
- Lack of transparency between students, faculty, and admin staff

### Solution

EduResource provides a centralized, digital platform to manage resource reservations, approvals, and
returns efficiently with role-based access control and real-time availability tracking.

## 🏆 Work Package Achievements

### WP1: Full-Stack Integration ✅

- **Fully functional frontend, backend, DB, auth modules**
- **React.js frontend** with Tailwind CSS for responsive UI
- **Node.js/Express backend** with RESTful API architecture
- **MongoDB database** with proper schema design
- **JWT-based authentication** with role-based access control
- **Real-time inventory updates** upon approval or return
- **Seamless API integration** between frontend and backend
- **Production-ready deployment** configuration for Vercel

### WP2: Conflicting Requirements Management ✅

- **Clear role conflict handling** with sophisticated priority logic
- **Stakeholder-specific policies**: Faculty (90 days, 10 units), Students (30 days, 3 units), Admin
  (unlimited)
- **Priority access system**: Faculty urgent/research requests processed first
- **Conflict resolution dashboard** showing competing requests for same resources
- **Dynamic policy management** allowing admin to adjust role-based limits
- **Resource allocation fairness** with priority scoring and queue management
- **Real-time conflict detection** and resolution workflows

### WP7: Dynamic System Interaction ✅

- **Workflow fully automated** with comprehensive notification system
- **Dynamic request submission** → **admin approval** → **resource checkout** → **return
  confirmation**
- **Real-time notifications** for due returns, overdue alerts, and status updates
- **Automated inventory management** reflecting current availability
- **Interactive dashboards** with live analytics and usage statistics
- **Background overdue checking** with automated reminder system
- **Dynamic role-based UI** adapting to user permissions and access levels

## 🚀 Key Features Implemented

### **Authentication & Authorization**

- **Multi-role authentication**: Student, Faculty, Admin roles
- **JWT token-based security** with secure localStorage management
- **Role-based route protection** and component access control
- **Quick login buttons** for development testing
- **Secure password handling** with bcrypt hashing

### **Resource Catalog & Management**

- **Real-time inventory display** with availability status
- **Advanced search and filtering** by category, availability, name
- **Resource details** with descriptions, quantities, and status
- **Dynamic availability calculation** based on active requests
- **Admin resource CRUD operations** for inventory management

### **Request Management System**

- **Intelligent request submission** with role-based validation
- **Priority-based request queue** (Urgent Faculty → Research Faculty → Standard → Student)
- **Request approval workflow** with denial reasons and notes
- **Return request system** with admin verification
- **Request history tracking** with status timelines

### **Stakeholder Management Dashboard**

- **Dynamic policy configuration** for role-based limits
- **Conflict resolution center** showing competing requests
- **Analytics dashboard** with request statistics and compliance rates
- **Priority analytics** showing urgent vs standard request distribution
- **Policy compliance monitoring** with real-time metrics

### **Notification System**

- **Due date reminders** (3-day advance warning)
- **Overdue alerts** with escalating severity indicators
- **Status change notifications** for approvals, denials, returns
- **Admin overdue management** with batch checking functionality
- **Real-time toast notifications** with success/error feedback

### **Advanced UI/UX Features**

- **Responsive design** for mobile and desktop compatibility
- **Modern component library** with Lucide React icons
- **Interactive data visualization** with progress bars and charts
- **Loading states** and error handling throughout the application
- **Intuitive navigation** with role-based menu systems

## 🛠️ Technology Stack

| Component              | Technology        | Implementation                         |
| ---------------------- | ----------------- | -------------------------------------- |
| **Frontend Framework** | React.js 18+      | Modern hooks-based components          |
| **Styling**            | Tailwind CSS      | Responsive utility-first design        |
| **State Management**   | React Context API | Custom hooks for auth and policies     |
| **Routing**            | React Router v6   | Protected routes with role guards      |
| **HTTP Client**        | Fetch API         | Custom API utility with error handling |
| **Icons**              | Lucide React      | Consistent iconography                 |
| **Notifications**      | Sonner            | Toast notification system              |
| **Build Tool**         | Vite              | Fast development and optimized builds  |
| **Deployment**         | Vercel            | Serverless deployment with SPA routing |

## 📁 Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Dashboard.jsx     # Role-based dashboard
│   │   ├── LoginSignup.jsx   # Authentication forms
│   │   ├── Navigation.jsx    # App navigation with role guards
│   │   ├── Resources.jsx     # Resource catalog and management
│   │   ├── Requests.jsx      # Request management interface
│   │   ├── Users.jsx         # User management (admin)
│   │   ├── StakeholderManagement.jsx  # Policy & conflict management
│   │   ├── PolicyEditModal.jsx        # Dynamic policy editor
│   │   ├── ResourceRequestModal.jsx   # Request submission form
│   │   ├── ConfirmationModal.jsx      # Action confirmations
│   │   └── DenialModal.jsx            # Request denial interface
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.jsx   # Authentication state management
│   │   └── AuthContextProvider.js     # Auth provider wrapper
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js        # Authentication hook
│   │   └── useStakeholderPolicies.js  # Policy management hook
│   ├── utils/                # Utility functions
│   │   └── api.js            # API communication layer
│   ├── assets/               # Static assets
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles and Tailwind
├── .env.example              # Environment variables template
├── vercel.json               # Vercel deployment configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js            # Vite build configuration
└── README.md                 # This file
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/al-shaimon/eduresource.git
cd eduresource/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
VITE_API_URL=http://localhost:5000/api  # Backend API URL
```

### Development

```bash
# Start development server
npm run dev

# Access application
open http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Set environment variables**:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   ```
3. **Deploy**: Automatic deployment on push to main branch
4. **SPA Routing**: Configured with `vercel.json` for client-side routing

### Environment Configuration

- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses `VITE_API_URL` environment variable
- **Fallback**: Automatic environment detection

## 🧪 Testing Credentials

The application includes quick login buttons for easy testing:

| Role        | Email                              | Password    | Access Level                                   |
| ----------- | ---------------------------------- | ----------- | ---------------------------------------------- |
| **Admin**   | admin@eduresource.com              | password123 | Full system access, user management, analytics |
| **Faculty** | sarah.johnson@eduresource.com      | password123 | Priority requests, extended checkout periods   |
| **Student** | john.smith@student.eduresource.com | password123 | Standard requests, limited resources           |

## 🎯 User Workflows

### Student Workflow

1. **Login** with student credentials
2. **Browse resources** in the catalog
3. **Submit request** with duration and notes
4. **Track status** in requests page
5. **Request return** when finished

### Faculty Workflow

1. **Login** with faculty credentials
2. **Browse resources** with priority access
3. **Submit priority requests** (urgent/research/standard)
4. **Extended checkout periods** (up to 90 days)
5. **Track and return** resources

### Admin Workflow

1. **Login** with admin credentials
2. **Review pending requests** in priority order
3. **Approve/deny requests** with reasons
4. **Manage stakeholder policies** and conflicts
5. **Monitor overdue returns** and analytics
6. **Manage users and resources**

## 📊 Key Performance Metrics

- **Request Processing**: Priority-based queue system
- **Resource Utilization**: Real-time availability tracking
- **Policy Compliance**: Automated role-based validation
- **Conflict Resolution**: Stakeholder management dashboard
- **User Experience**: Responsive design with <2s load times

## 🔗 Related Documentation

- [Backend README](../backend/README.md) - Backend API documentation
- [Deployment Guide](../DEPLOYMENT.md) - Complete deployment instructions
- [Project Requirements](../PROJECT_REQUIREMENTS.md) - Original specifications

## 👥 Development Team

**Submitted by:**

- Hamdanul Haque Katebi (C231124)
- Md Arif Bin Hashem Mahim (C231137)
- Abdullah Al Shaimon (C231139)

**Course Instructor:** Mr. Muhammad Nazim Uddin  
**Institution:** Department of CSE, IIUC

---

🎓 **EduResource Frontend** - Transforming departmental resource management through modern web
technologies and intelligent workflow automation.

- Browse available resources with search and filtering
- Admin: Full CRUD operations for resources
- Student/Faculty: Request resources with expected return dates

- **Request Management**

  - Track request status (pending, approved, denied, returned)
  - Admin: Approve/deny requests with reasons
  - Real-time updates and notifications

- **User Management** (Admin only)

  - View all users in the system
  - Track user activity and request statistics
  - Role-based access control

- **Notifications**
  - Real-time notification system
  - Mark notifications as read
  - Badge indicators for unread notifications

## Technology Stack

- **React 19** - Modern React with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Vite** - Fast build tool and development server

## Design Features

- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Dark Mode Ready** - Prepared for dark mode implementation
- **Accessibility** - Keyboard navigation and screen reader friendly
- **Performance Optimized** - Fast loading and smooth interactions

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginSignup.jsx  # Authentication component
│   ├── Navigation.jsx   # Navigation bar with notifications
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Resources.jsx    # Resource management
│   ├── Requests.jsx     # Request management
│   └── Users.jsx        # User management (admin)
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── hooks/              # Custom React hooks
│   └── useAuth.jsx     # Authentication hook
├── utils/              # Utility functions
│   └── api.js          # API communication
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## API Integration

The frontend is designed to work seamlessly with the EduResource backend API. All API calls include
proper authentication headers and error handling.

### Endpoints Used:

- `POST /api/signup` - User registration
- `POST /api/login` - User authentication
- `GET /api/resources` - Fetch resources
- `POST /api/resources` - Create resource (admin)
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)
- `GET /api/requests` - Fetch requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request status
- `GET /api/notifications` - Fetch notifications
- `PUT /api/notifications/:id` - Mark notification as read

## User Roles

### Student/Faculty

- Browse and search resources
- Submit checkout requests
- Track request status
- Receive notifications
- View personal request history

### Admin

- All student/faculty capabilities
- Manage all resources (CRUD operations)
- Review and approve/deny requests
- View all users and their activity
- System-wide oversight and management

## Responsive Design

The application is fully responsive and provides an optimal experience across all device sizes:

- **Mobile (320px+)**: Stack layout with touch-friendly interfaces
- **Tablet (768px+)**: Optimized grid layouts and navigation
- **Desktop (1024px+)**: Full-featured interface with multi-column layouts

## Performance Features

- **Code Splitting**: Automatic code splitting for optimal loading
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image optimization and loading
- **Caching**: Effective caching strategies for API calls
- **Bundle Optimization**: Minimized and optimized production builds

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Proper access control for different user roles
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Protection against cross-site scripting
- **CSRF Protection**: Cross-site request forgery protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers on iOS and Android

## Development Notes

- Uses modern React patterns and hooks
- Implements proper error boundaries
- Follows React best practices for performance
- Includes comprehensive prop validation
- Maintains clean code structure and organization+ Vite
