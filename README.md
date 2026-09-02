# Green Circuit - E-Waste Management Platform

Green Circuit is an end-to-end platform for scheduling, managing, and tracking E-Waste pickup requests with role-based dashboards, rewards/gamification, automated notifications, and global analytics.

---

## 🏗️ Architecture & Functional Modules

The project is structured using a **Domain/Feature-Based Architecture** across both backend and frontend:

### 1. 👤 User Management & Security (`modules/user`)
- **Backend**: `AuthController`, `UserController`, `AuthService`, `UserService`, `UserRepository`, `User`, `Role`, JWT filters, and Spring Security configuration.
- **Frontend**: `Login.jsx`, `Register.jsx`, `AuthContext.jsx`, `PrivateRoute.jsx`, `userService.js`.

### 2. 🏢 Collection Centers / Offices (`modules/center`)
- **Backend**: `OfficeController`, `OfficeService`, `OfficeRepository`, `Office`, `OfficeDTO`.
- **Frontend**: `OfficeDashboard.jsx`, `OfficeForm.jsx`, `OfficeList.jsx`, `officeService.js`.

### 3. 📦 Collection & Pickup Requests (`modules/pickup`)
- **Backend**: `PickupRequestController`, `PickupRequestService`, `PickupRequestRepository`, `PickupRequest`, `RequestStatus`.
- **Frontend**: `UserDashboard.jsx` (Live GPS & Google Maps integration), `PickupRequestForm.jsx`, `PickupRequestHistory.jsx`, `OfficeRequestList.jsx`, `OfficeRequestDetailsModal.jsx`, `pickupRequestService.js`.

### 4. 🎁 Rewards & Gamification (`modules/reward`)
- **Backend**: `RewardController`, `RewardService`, `RewardItemRepository`, `RewardRedemptionRepository`, `RewardItem`, `RewardRedemption`, `DataSeeder`.
- **Frontend**: `RewardStore.jsx`, `rewardService.js`.

### 5. 🔔 Notifications & Communications (`modules/notification`)
- **Backend**: `NotificationController`, `NotificationRepository`, `Notification`, `EmailService`.
- **Frontend**: `notificationService.js`, notification popover in user dashboard.

### 6. 📊 Admin & Global Analytics (`modules/analytics`)
- **Backend**: `AnalyticsController`, `AnalyticsService`.
- **Frontend**: `SuperAdminDashboard.jsx`, `analyticsService.js`.

### 7. ⚙️ Common & Core Infrastructure (`common`)
- **Backend**: `GlobalExceptionHandler.java`, `WebConfig.java` (static uploads handler).
- **Frontend**: `axiosConfig.js` (JWT interceptor client).

---

## 🚀 Deployment

The entire stack is containerized with Docker:

```bash
docker-compose up --build -d
```

### Services
- **Frontend (React 19 / Vite / Nginx)**: `http://localhost:80`
- **Backend (Spring Boot 4 / Java 21)**: `http://localhost:8080`
- **Database (MySQL 8.0)**: `localhost:3306`

*Make sure to configure your Google Maps API key in `frontend/.env` (`VITE_GOOGLE_MAPS_API_KEY`) for map and geocoding capabilities.*
