# IoPropertyManager

A comprehensive property management system built with Ionic and Angular, designed for property managers to efficiently handle maintenance, scheduling, work orders, and tenant management.

## 🚀 Features

### ✅ **Complete Dashboard**
- **Interactive Statistics**: Clickable overview cards with smart navigation
- **Real-time Data**: Property metrics, service scheduling, and work order status
- **Quick Actions**: Fast access to frequently used features
- **Responsive Design**: Optimized for mobile and desktop

### 🏠 **Property Management**
- **Property Portfolio**: Complete property listing and management
- **Detailed Property Profiles**: Comprehensive information storage
- **Service History**: Track all maintenance and service activities
- **Interactive Property Cards**: Visual property overview with key metrics

### 📅 **Service Scheduling System**
- **Advanced Calendar**: Full-featured scheduling with drag-and-drop
- **Service Templates**: Reusable service configurations
- **Automated Scheduling**: Recurring service automation
- **Employee Assignment**: Smart workforce allocation
- **Calendar Integration**: Multiple view modes (month, week, day)

### 🔧 **Work Order Management**
- **Complete Lifecycle**: From creation to completion tracking
- **Status Management**: 10-stage work order workflow
- **Material Tracking**: Inventory and cost management
- **Quality Control**: Inspection checklists and quality assurance
- **Customer Feedback**: Built-in rating and feedback system
- **Photo Documentation**: Before/after photo management

### 🔐 **Authentication & Security**
- **Multi-role System**: Owner, Manager, Employee access levels
- **Business Setup**: Multi-tenant business configuration
- **Secure Configuration**: Protected API keys and database credentials
- **Development Mode**: Safe development environment with mock data

### 📱 **Mobile-First Design**
- **Ionic Framework**: Native mobile app experience
- **Responsive Layout**: Seamless desktop and mobile usage
- **Touch Optimized**: Intuitive mobile interactions
- **Progressive Web App**: Installable web application

## 🛠️ Technology Stack

- **Frontend**: Angular 17+ with Ionic 7+
- **UI Components**: Ionic Components with custom styling
- **State Management**: RxJS Observables
- **Routing**: Angular Router with lazy loading
- **Development**: TypeScript with strict typing
- **Build System**: Angular CLI with Webpack

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Ionic CLI (`npm install -g @ionic/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/IoPropertyManager.git
   cd IoPropertyManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ionic serve
   ```

4. **Build for production**
   ```bash
   ionic build --prod
   ```

## 📖 Development Mode

The application includes a comprehensive development mode with:
- **Mock Data Service**: Realistic sample data for all features
- **User Role Switching**: Test different permission levels
- **No Authentication**: Skip login for development
- **Sample Properties**: Pre-loaded property portfolio
- **Demo Scheduling**: Example service schedules and work orders

Toggle development mode in the dashboard settings.

## 📁 Project Structure

```
src/app/
├── core/                    # Core services and models
│   ├── guards/             # Route guards (auth, role, business)
│   ├── models/             # Shared data models
│   └── services/           # Core services (auth, business, mock data)
├── features/               # Feature modules
│   ├── auth/              # Authentication system
│   ├── dashboard/         # Main dashboard
│   ├── properties/        # Property management
│   ├── scheduling/        # Service scheduling
│   ├── services/          # Service request management
│   └── work-orders/       # Work order system
├── layout/                # Layout components
├── shared/                # Shared components and utilities
└── tabs/                  # Main tab navigation
```

## 🔒 Security Features

- **Environment Variables**: Sensitive data excluded from repository
- **API Key Protection**: Secure configuration management
- **Database Security**: Connection credentials safely managed
- **Git Security**: Comprehensive .gitignore for sensitive files

## 🌟 Key Highlights

### Interactive Dashboard Navigation
Every dashboard element is clickable and navigates to relevant detailed views:
- Statistics cards → Filtered data views
- Service items → Specific service details
- Property cards → Property management
- Work order stats → Work order system

### Advanced Work Order System
- **10-Stage Workflow**: Draft → Assigned → Scheduled → In Progress → Completed
- **Material Management**: Track usage, costs, and ordering
- **Quality Assurance**: Customizable inspection checklists
- **Time Tracking**: Estimated vs. actual duration monitoring
- **Cost Analytics**: Labor and material cost tracking

### Smart Scheduling
- **Template System**: Reusable service configurations
- **Recurring Services**: Automated scheduling with customizable intervals
- **Conflict Detection**: Prevent scheduling conflicts
- **Employee Workload**: Balanced task distribution

## 🚧 Development Status

- ✅ **Phase 1**: Core authentication and business setup
- ✅ **Phase 2**: Property management system
- ✅ **Phase 2C**: Service scheduling system
- ✅ **Phase 2D**: Advanced scheduling features
- ✅ **Current**: Work order management system
- 🔄 **Next**: Mobile field worker interface
- 🔄 **Future**: Reporting and analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using Ionic and Angular**