# Public/Private Repository Separation Guide

This guide provides step-by-step instructions for separating the TourExpense project into public (open source) and private (proprietary) repositories.

## 🎯 Separation Strategy

### Public Features (Open Source)
✅ **Core functionality that will be open source:**
- Basic tour creation and management
- Participant management with avatars  
- Simple expense tracking and splitting
- Basic summaries and balance calculations
- Manual settlement suggestions
- Local data storage (AsyncStorage)
- Core UI components (Button, Card, Input, Avatar)
- Basic navigation and routing
- Essential utility functions

### Private Features (Proprietary)
🔒 **Advanced features that will remain private:**
- Advanced analytics and insights dashboard
- Cloud synchronization and backup
- Multi-currency support
- PDF/Excel export functionality
- Receipt photo scanning and OCR
- AI-powered expense categorization
- Push notifications
- Team collaboration features
- Advanced reporting and business intelligence
- Budget tracking and alerts
- Premium UI themes

## 📁 Current Project Structure Analysis

Let's identify which files go where:

### Public Repository Files
```
TourExpense-Public/
├── src/
│   ├── components/
│   │   ├── Avatar.tsx                 ✅ Public
│   │   ├── Button.tsx                 ✅ Public  
│   │   ├── Card.tsx                   ✅ Public
│   │   └── Input.tsx                  ✅ Public
│   ├── screens/
│   │   ├── ToursListScreen.tsx        ✅ Public (basic version)
│   │   ├── CreateTourScreen.tsx       ✅ Public
│   │   ├── EditTourScreen.tsx         ✅ Public
│   │   ├── TourDetailsScreen.tsx      ✅ Public (basic version)
│   │   ├── ParticipantsScreen.tsx     ✅ Public
│   │   ├── AddParticipantScreen.tsx   ✅ Public
│   │   ├── AddExpenseScreen.tsx       ✅ Public (basic version)
│   │   ├── EditExpenseScreen.tsx      ✅ Public (basic version)
│   │   └── ExpenseSummaryScreen.tsx   ✅ Public (basic version)
│   ├── navigation/
│   │   └── AppNavigator.tsx           ✅ Public (core navigation)
│   ├── context/
│   │   └── AppContext.tsx             ✅ Public (basic state management)
│   ├── types/
│   │   └── index.ts                   ✅ Public (core types)
│   └── utils/
│       └── calculations.ts            ✅ Public (basic calculations)
├── App.tsx                            ✅ Public
├── package.json                       ✅ Public (basic dependencies)
└── README.md                          ✅ Public
```

### Private Repository Files
```
TourExpense-Private/
├── plugins/
│   ├── advanced-analytics/
│   │   ├── AdvancedAnalyticsScreen.tsx    🔒 Private
│   │   ├── InsightsTab.tsx                🔒 Private
│   │   ├── BusinessReportsTab.tsx         🔒 Private
│   │   └── BudgetTrackingTab.tsx         🔒 Private
│   ├── cloud-sync/
│   │   ├── CloudSyncService.ts           🔒 Private
│   │   ├── BackupScreen.tsx              🔒 Private
│   │   └── SyncStatusIndicator.tsx       🔒 Private
│   ├── export-tools/
│   │   ├── PDFExportService.ts           🔒 Private
│   │   ├── ExcelExportService.ts         🔒 Private
│   │   └── ExportScreen.tsx              🔒 Private
│   ├── multi-currency/
│   │   ├── CurrencyService.ts            🔒 Private
│   │   ├── CurrencyConverter.tsx         🔒 Private
│   │   └── CurrencySettings.tsx          🔒 Private
│   └── ai-features/
│       ├── ReceiptScanner.tsx            🔒 Private
│       ├── SmartCategorization.ts        🔒 Private
│       └── ExpensePredictor.ts           🔒 Private
├── themes/
│   ├── PremiumTheme.tsx                  🔒 Private
│   ├── DarkTheme.tsx                     🔒 Private
│   └── CustomThemes.tsx                  🔒 Private
└── config/
    ├── privateConfig.ts                  🔒 Private
    └── licenseValidation.ts              🔒 Private
```

## 🔧 Implementation Steps

### Step 1: Create Public Repository Structure

```bash
# Create the public repository
mkdir TourExpense-Public
cd TourExpense-Public

# Copy core files from current project
cp -r ../TourExpense/src/components ./src/
cp -r ../TourExpense/src/navigation ./src/
cp -r ../TourExpense/src/context ./src/
cp -r ../TourExpense/src/types ./src/
cp -r ../TourExpense/src/utils ./src/
cp ../TourExpense/App.tsx ./
cp ../TourExpense/package.json ./
cp ../TourExpense/tsconfig.json ./
```

### Step 2: Create Extension Points in Public Code

Create plugin interfaces in the public repository:

```typescript
// src/plugins/types.ts (Public)
export interface AnalyticsPlugin {
  generateAdvancedReports?: (tour: Tour) => Report[];
  trackUserBehavior?: (event: string, data: any) => void;
  getInsights?: (tours: Tour[]) => Insight[];
}

export interface ExportPlugin {
  exportToPDF?: (tour: Tour) => Promise<string>;
  exportToExcel?: (tour: Tour) => Promise<string>;
  exportToCSV?: (tour: Tour) => Promise<string>;
}

export interface CloudSyncPlugin {
  syncTours?: (tours: Tour[]) => Promise<void>;
  backup?: (data: any) => Promise<void>;
  restore?: () => Promise<Tour[]>;
}

export interface ThemePlugin {
  getPremiumThemes?: () => Theme[];
  applyTheme?: (theme: Theme) => void;
}

// Plugin registry
export interface PluginRegistry {
  analytics?: AnalyticsPlugin;
  export?: ExportPlugin;
  cloudSync?: CloudSyncPlugin;
  themes?: ThemePlugin;
}
```

### Step 3: Create Plugin Manager (Public)

```typescript
// src/plugins/PluginManager.tsx (Public)
import { PluginRegistry } from './types';

class PluginManager {
  private plugins: PluginRegistry = {};
  
  registerPlugin<K extends keyof PluginRegistry>(
    type: K, 
    plugin: PluginRegistry[K]
  ) {
    this.plugins[type] = plugin;
  }
  
  getPlugin<K extends keyof PluginRegistry>(type: K): PluginRegistry[K] | null {
    return this.plugins[type] || null;
  }
  
  async loadPrivatePlugins() {
    try {
      // Dynamically import private plugins if available
      const privatePlugins = await import('@private/plugins');
      
      if (privatePlugins.analyticsPlugin) {
        this.registerPlugin('analytics', privatePlugins.analyticsPlugin);
      }
      
      if (privatePlugins.exportPlugin) {
        this.registerPlugin('export', privatePlugins.exportPlugin);
      }
      
      if (privatePlugins.cloudSyncPlugin) {
        this.registerPlugin('cloudSync', privatePlugins.cloudSyncPlugin);
      }
      
      if (privatePlugins.themesPlugin) {
        this.registerPlugin('themes', privatePlugins.themesPlugin);
      }
      
      console.log('Private plugins loaded successfully');
    } catch (error) {
      console.log('Running in open source mode - private plugins not available');
    }
  }
}

export const pluginManager = new PluginManager();
```

### Step 4: Update Public Screens to Use Plugin System

```typescript
// src/screens/ExpenseSummaryScreen.tsx (Public - Modified)
import { pluginManager } from '../plugins/PluginManager';

const ExpenseSummaryScreen: React.FC = () => {
  const analyticsPlugin = pluginManager.getPlugin('analytics');
  const exportPlugin = pluginManager.getPlugin('export');
  
  // Basic tabs (always available)
  const baseTabs = ['overview', 'expenses', 'balances', 'settlements'];
  
  // Add advanced tabs if plugin is available
  const allTabs = analyticsPlugin 
    ? [...baseTabs, 'insights', 'reports'] 
    : baseTabs;
  
  const renderInsightsTab = () => {
    if (!analyticsPlugin) return <Text>Upgrade to premium for advanced insights</Text>;
    
    const insights = analyticsPlugin.getInsights?.(tours) || [];
    return <AdvancedInsightsView insights={insights} />;
  };
  
  const handleExport = async () => {
    if (!exportPlugin) {
      Alert.alert('Premium Feature', 'Export functionality requires premium upgrade');
      return;
    }
    
    try {
      const pdfPath = await exportPlugin.exportToPDF?.(tour);
      Alert.alert('Success', `Report exported to ${pdfPath}`);
    } catch (error) {
      Alert.alert('Error', 'Export failed');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Summary</Text>
        {exportPlugin && (
          <TouchableOpacity onPress={handleExport}>
            <Icon name="share" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Render tabs based on available plugins */}
      <TabView tabs={allTabs} />
    </SafeAreaView>
  );
};
```

### Step 5: Create Private Repository

```bash
# Create private repository
mkdir TourExpense-Private
cd TourExpense-Private

# Initialize with private plugins
mkdir -p plugins/{advanced-analytics,cloud-sync,export-tools,multi-currency,ai-features}
mkdir -p themes config
```

### Step 6: Implement Private Plugins

```typescript
// plugins/advanced-analytics/index.ts (Private)
import { AnalyticsPlugin, Tour, Report, Insight } from '@public/plugins/types';

export const analyticsPlugin: AnalyticsPlugin = {
  generateAdvancedReports: (tour: Tour): Report[] => {
    return [
      {
        title: 'Spending Patterns',
        type: 'chart',
        data: analyzeSpendingPatterns(tour),
      },
      {
        title: 'Cost Optimization',
        type: 'recommendations',
        data: generateOptimizations(tour),
      },
    ];
  },
  
  trackUserBehavior: (event: string, data: any) => {
    // Send to analytics service
    analyticsService.track(event, data);
  },
  
  getInsights: (tours: Tour[]): Insight[] => {
    return [
      {
        type: 'trend',
        title: 'Your group spends 23% more on food during weekend trips',
        recommendation: 'Consider planning meals in advance for weekend trips',
      },
      {
        type: 'savings',
        title: 'You could save $500 per trip by booking accommodation earlier',
        recommendation: 'Set up booking reminders 30 days before trips',
      },
    ];
  },
};

// Export functionality
export const exportPlugin: ExportPlugin = {
  exportToPDF: async (tour: Tour): Promise<string> => {
    const pdfGenerator = new PDFGenerator();
    return await pdfGenerator.generateTourReport(tour);
  },
  
  exportToExcel: async (tour: Tour): Promise<string> => {
    const excelGenerator = new ExcelGenerator();
    return await excelGenerator.generateTourReport(tour);
  },
};

// Cloud sync functionality  
export const cloudSyncPlugin: CloudSyncPlugin = {
  syncTours: async (tours: Tour[]): Promise<void> => {
    const cloudService = new CloudSyncService();
    await cloudService.uploadTours(tours);
  },
  
  backup: async (data: any): Promise<void> => {
    const backupService = new BackupService();
    await backupService.createBackup(data);
  },
  
  restore: async (): Promise<Tour[]> => {
    const backupService = new BackupService();
    return await backupService.restoreLatestBackup();
  },
};
```

### Step 7: Configure Build System

#### Public Build Configuration

```javascript
// metro.config.js (Public)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    alias: {
      '@': './src',
      '@private': './src/stubs', // Point to empty stubs
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

#### Private Build Configuration

```javascript
// metro.config.js (Private)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    alias: {
      '@': '../TourExpense-Public/src',
      '@private': './plugins',
      '@public': '../TourExpense-Public/src',
    },
  },
  watchFolders: [
    '../TourExpense-Public/src',
    './plugins',
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### Step 8: Create Stub Implementations for Public Build

```typescript
// src/stubs/plugins.ts (Public)
// Empty implementations when private plugins are not available

export const analyticsPlugin = {
  generateAdvancedReports: () => [],
  trackUserBehavior: () => {},
  getInsights: () => [],
};

export const exportPlugin = {
  exportToPDF: () => Promise.reject('Premium feature not available'),
  exportToExcel: () => Promise.reject('Premium feature not available'),
};

export const cloudSyncPlugin = {
  syncTours: () => Promise.resolve(),
  backup: () => Promise.resolve(),  
  restore: () => Promise.resolve([]),
};

export const themesPlugin = {
  getPremiumThemes: () => [],
  applyTheme: () => {},
};
```

### Step 9: Update Package.json Files

#### Public package.json
```json
{
  "name": "tourexpense",
  "version": "1.0.0",
  "description": "Open source group tour expense tracker",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/tourexpense.git"
  },
  "license": "MIT",
  "dependencies": {
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/stack": "^7.4.8",
    "@react-navigation/bottom-tabs": "^7.4.7",
    "react": "19.1.0",
    "react-native": "0.81.1",
    "react-native-vector-icons": "^10.3.0",
    "@react-native-async-storage/async-storage": "^2.2.0"
  }
}
```

#### Private package.json  
```json
{
  "name": "tourexpense-premium",
  "version": "1.0.0",
  "description": "Premium tour expense tracker with advanced features",
  "private": true,
  "dependencies": {
    "tourexpense": "file:../TourExpense-Public",
    "react-native-pdf": "^6.7.1",
    "xlsx": "^0.18.5",
    "react-native-document-picker": "^8.2.0",
    "@react-native-firebase/app": "^17.3.2"
  },
  "scripts": {
    "build:premium": "cd ../TourExpense-Public && npm run build -- --config premium"
  }
}
```

## 🚀 Development Workflow

### Working on Public Features

```bash
cd TourExpense-Public
git checkout feature/public-feature
# Develop feature
npm run lint
npm run test  
git commit -m "Add public feature"
git push origin feature/public-feature
```

### Working on Private Features

```bash
cd TourExpense-Private  
git checkout feature/private-feature
# Develop private plugin
npm run test:private
git commit -m "Add private feature"
git push origin feature/private-feature
```

### Testing Combined Build

```bash
cd TourExpense-Private
npm run build:premium
npm run test:integration
```

## 📦 Deployment Strategy

### Public Deployment
- Deploy to public app stores as free version
- Submit to open source communities  
- Enable community contributions

### Private Deployment
- Deploy as premium paid app
- Private distribution for enterprise
- Subscription-based model

## ✅ Benefits of This Approach

1. **Clean Separation**: Public and private code are clearly separated
2. **Maintainable**: Both versions can be developed independently
3. **Extensible**: New private features can be added as plugins
4. **Open Source Friendly**: Community can contribute to public features
5. **Commercial Viable**: Premium features can be monetized

---

This separation strategy allows you to maintain both open source and commercial versions while keeping the architecture clean and maintainable!