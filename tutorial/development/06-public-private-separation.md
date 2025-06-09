# Public/Private Feature Separation

This guide explains how to structure the TourExpense app to support both public (open source) and private (proprietary) features in separate repositories.

## Overview

You can split the codebase into:
- **Public Repository**: Core features, basic functionality, community features
- **Private Repository**: Premium features, advanced analytics, cloud sync, etc.

## Architecture Strategy

### Approach 1: Plugin Architecture

Create a plugin system where private features are loaded as separate modules.

#### Project Structure
```
TourExpense-Public/                 # Public repository
├── src/
│   ├── components/                 # Basic UI components
│   ├── screens/                    # Core screens
│   ├── plugins/                    # Plugin system
│   │   ├── PluginManager.tsx      # Plugin loader
│   │   ├── types.ts               # Plugin interfaces
│   │   └── registry.ts            # Plugin registry
│   └── features/
│       ├── core/                  # Basic tour management
│       └── public/                # Open source features

TourExpense-Private/                # Private repository
├── plugins/
│   ├── premium-analytics/         # Advanced analytics
│   ├── cloud-sync/               # Cloud synchronization
│   ├── ai-insights/              # AI-powered insights
│   └── export-tools/             # PDF/Excel export
└── build-scripts/                # Private build tools
```

#### Plugin Interface
```typescript
// src/plugins/types.ts (Public)
export interface Plugin {
  id: string;
  name: string;
  version: string;
  screens?: PluginScreen[];
  components?: PluginComponent[];
  hooks?: PluginHook[];
}

export interface PluginScreen {
  name: string;
  component: React.ComponentType<any>;
  navigation?: NavigationConfig;
}

export interface PluginHook {
  event: string;
  handler: (data: any) => void;
}
```

#### Plugin Manager
```typescript
// src/plugins/PluginManager.tsx (Public)
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  registerPlugin(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    this.initializePlugin(plugin);
  }
  
  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }
  
  getScreens(): PluginScreen[] {
    return Array.from(this.plugins.values())
      .flatMap(plugin => plugin.screens || []);
  }
  
  private initializePlugin(plugin: Plugin) {
    // Register screens with navigation
    // Register components
    // Set up hooks
  }
}

export const pluginManager = new PluginManager();
```

### Approach 2: Feature Flags

Use feature flags to enable/disable functionality based on build configuration.

#### Feature Flag System
```typescript
// src/config/features.ts (Public)
export interface FeatureConfig {
  analytics: boolean;
  cloudSync: boolean;
  aiInsights: boolean;
  pdfExport: boolean;
  multiCurrency: boolean;
}

export const getFeatures = (): FeatureConfig => {
  // In public build
  if (__DEV__ || !process.env.PRIVATE_FEATURES) {
    return {
      analytics: false,
      cloudSync: false,
      aiInsights: false,
      pdfExport: false,
      multiCurrency: false,
    };
  }
  
  // In private build
  return {
    analytics: true,
    cloudSync: true,
    aiInsights: true,
    pdfExport: true,
    multiCurrency: true,
  };
};
```

#### Feature-Based Components
```typescript
// src/components/ConditionalFeature.tsx (Public)
interface ConditionalFeatureProps {
  feature: keyof FeatureConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalFeature: React.FC<ConditionalFeatureProps> = ({
  feature,
  children,
  fallback = null,
}) => {
  const features = getFeatures();
  
  return features[feature] ? <>{children}</> : <>{fallback}</>;
};

// Usage in screens
<ConditionalFeature feature="analytics">
  <AdvancedAnalyticsTab />
</ConditionalFeature>
```

### Approach 3: Modular Architecture

Separate the app into core modules and optional extensions.

#### Module Structure
```
TourExpense-Core/                   # Public repository
├── src/
│   ├── core/                      # Essential functionality
│   │   ├── tours/                 # Basic tour management
│   │   ├── participants/          # Participant management
│   │   └── expenses/              # Basic expense tracking
│   ├── extensions/                # Extension points
│   │   ├── ExtensionManager.tsx   # Load extensions
│   │   └── types.ts               # Extension interfaces
│   └── ui/                        # Basic UI components

TourExpense-Extensions/             # Private repository
├── analytics/                     # Advanced analytics
├── sync/                         # Cloud synchronization
├── export/                       # Export functionality
└── ai/                           # AI features
```

## Implementation Guide

### Step 1: Identify Feature Boundaries

**Public Features (Open Source):**
- ✅ Basic tour creation and management
- ✅ Participant management with avatars
- ✅ Basic expense tracking and splitting
- ✅ Simple summaries and balances
- ✅ Manual settlement suggestions
- ✅ Local data storage (AsyncStorage)
- ✅ Basic UI components
- ✅ Core navigation

**Private Features (Proprietary):**
- 🔒 Advanced analytics and insights
- 🔒 Cloud synchronization and backup
- 🔒 Multi-currency support
- 🔒 PDF/Excel export
- 🔒 Receipt photo scanning
- 🔒 AI-powered categorization
- 🔒 Push notifications
- 🔒 Team collaboration features
- 🔒 Advanced reporting
- 🔒 Budget tracking and alerts

### Step 2: Create Extension Points

```typescript
// src/extensions/types.ts (Public)
export interface ExpenseExtension {
  onExpenseAdded?: (expense: Expense) => void;
  onExpenseUpdated?: (expense: Expense) => void;
  validateExpense?: (expense: Expense) => ValidationResult;
  enhanceExpenseForm?: () => React.ComponentType;
}

export interface AnalyticsExtension {
  trackEvent?: (event: string, data: any) => void;
  generateInsights?: (tour: Tour) => Insight[];
  customReports?: () => React.ComponentType[];
}
```

### Step 3: Implement Plugin Loading

```typescript
// src/extensions/ExtensionManager.tsx (Public)
export class ExtensionManager {
  private expenseExtensions: ExpenseExtension[] = [];
  private analyticsExtensions: AnalyticsExtension[] = [];
  
  loadExtensions() {
    // Try to load private extensions if available
    try {
      const privateExtensions = require('@private/extensions');
      this.registerExtensions(privateExtensions);
    } catch (e) {
      // Private extensions not available, continue with public features
      console.log('Running with public features only');
    }
  }
  
  registerExpenseExtension(extension: ExpenseExtension) {
    this.expenseExtensions.push(extension);
  }
  
  async addExpense(expense: Expense) {
    // Core functionality
    const result = await this.coreAddExpense(expense);
    
    // Notify extensions
    this.expenseExtensions.forEach(ext => {
      ext.onExpenseAdded?.(expense);
    });
    
    return result;
  }
}
```

### Step 4: Build Configuration

#### Public Build
```javascript
// metro.config.js (Public)
module.exports = {
  resolver: {
    alias: {
      '@private': './src/stubs', // Empty stubs for private features
    },
  },
};
```

#### Private Build
```javascript
// metro.config.js (Private)
module.exports = {
  resolver: {
    alias: {
      '@private': '../TourExpense-Private/src',
    },
  },
};
```

### Step 5: Stub Implementation

```typescript
// src/stubs/extensions.ts (Public)
// Empty implementations for private features
export const premiumAnalytics = {
  generateInsights: () => [],
  customReports: () => [],
};

export const cloudSync = {
  sync: () => Promise.resolve(),
  backup: () => Promise.resolve(),
};
```

## Repository Management

### Public Repository Setup

```bash
# Initialize public repository
git init TourExpense
cd TourExpense

# Add public code
git add src/core src/ui src/extensions package.json
git commit -m "Initial public release"

# Push to public repository
git remote add origin https://github.com/yourname/tourexpense.git
git push -u origin main
```

### Private Repository Setup

```bash
# Initialize private repository
git init TourExpense-Private
cd TourExpense-Private

# Add private extensions
git add plugins/ extensions/ private-configs/
git commit -m "Private extensions"

# Push to private repository
git remote add origin https://github.com/yourname/tourexpense-private.git
git push -u origin main
```

### Development Workflow

#### For Public Features
```bash
cd TourExpense-Public
git checkout feature/public-feature
# Develop public feature
git commit -m "Add public feature"
git push origin feature/public-feature
# Create public PR
```

#### For Private Features
```bash
cd TourExpense-Private
git checkout feature/private-feature
# Develop private extension
git commit -m "Add private extension"
git push origin feature/private-feature
# Create private PR
```

#### Combined Testing
```bash
# Link private features during development
cd TourExpense-Public
npm link ../TourExpense-Private

# Build with private features
PRIVATE_FEATURES=true npm run build
```

## Build Scripts

### Public Build
```javascript
// scripts/build-public.js
const { build } = require('./build-common');

build({
  features: {
    analytics: false,
    cloudSync: false,
    premium: false,
  },
  output: 'dist/public',
});
```

### Private Build
```javascript
// scripts/build-private.js
const { build } = require('./build-common');

build({
  features: {
    analytics: true,
    cloudSync: true,
    premium: true,
  },
  privateModules: '../TourExpense-Private',
  output: 'dist/private',
});
```

## Deployment Strategy

### Public Deployment
- Deploy to public app stores with basic features
- Open source community can contribute
- Free version with essential functionality

### Private Deployment
- Deploy premium version with all features
- Paid app or subscription model
- Private distribution or enterprise deployment

## Benefits

### ✅ **Open Source Benefits**
- Community contributions
- Faster bug fixes
- Increased adoption
- Transparency

### ✅ **Commercial Benefits**  
- Monetize premium features
- Protect intellectual property
- Control advanced functionality
- Enterprise customization

### ✅ **Development Benefits**
- Modular architecture
- Clean separation of concerns
- Easier testing
- Independent deployment

## Considerations

### Challenges
- **Complexity**: Managing two repositories
- **Synchronization**: Keeping versions aligned
- **Testing**: Ensuring both versions work
- **Documentation**: Maintaining separate docs

### Best Practices
- **Clear interfaces** between public and private code
- **Comprehensive testing** for both versions
- **Version synchronization** strategies
- **Documentation** for extension development

---

This architecture allows you to maintain both open source and proprietary versions while keeping the codebase manageable and the features clearly separated.