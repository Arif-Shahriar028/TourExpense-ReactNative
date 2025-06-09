# TourExpense - Group Tour Expense Tracker

A comprehensive React Native app for tracking and splitting expenses during group tours and trips. Perfect for managing shared costs with friends, family, or colleagues during travel.

## Features

### 🌟 Core Features
- **Multi-Tour Support**: Create separate expense groups for different trips
- **Participant Management**: Add/remove participants with custom avatars and colors
- **Smart Expense Splitting**: Track who paid what and who participated in each expense
- **Category Organization**: 7 expense categories with icons (Food, Transportation, Accommodation, etc.)
- **Advanced Analytics**: Detailed expense summaries and participant balances
- **Settlement Suggestions**: Smart algorithms to minimize the number of transactions needed

### 📱 User Experience
- **Premium UI Design**: Modern Material Design with cards, shadows, and smooth animations
- **Intuitive Navigation**: Bottom tab navigation with stack navigation for detailed views
- **Offline Storage**: All data persisted locally using AsyncStorage
- **Real-time Updates**: Changes sync immediately across all screens
- **Empty States**: Helpful guidance when no data is available

### 📊 Analytics & Insights
- **Overview Dashboard**: Quick stats and category breakdowns
- **Individual Balances**: See who owes what and who is owed money
- **Settlement Calculator**: Optimal payment suggestions to settle all debts
- **Expense History**: Detailed view of all transactions with filters

## Tech Stack

- **React Native 0.81.1** - Cross-platform mobile development
- **TypeScript** - Type safety and better development experience
- **React Navigation 7** - Navigation with stack and tab navigators
- **React Context + useReducer** - State management
- **AsyncStorage** - Local data persistence
- **React Native Vector Icons** - Material Design icons
- **React Native Safe Area Context** - Safe area handling

## Getting Started

### Prerequisites
- Node.js >= 18
- React Native development environment set up ([Guide](https://reactnative.dev/docs/environment-setup))
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

3. Start the Metro server:
```bash
npm start
```

4. Run the app:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Avatar.tsx       # User avatar component
│   ├── Button.tsx       # Custom button component
│   ├── Card.tsx         # Card container component
│   └── Input.tsx        # Text input component
├── context/            # React Context for state management
│   └── AppContext.tsx  # Main app state and actions
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx # Stack and tab navigators
├── screens/            # Screen components
│   ├── ToursListScreen.tsx      # Main tours list
│   ├── CreateTourScreen.tsx     # Create new tour
│   ├── TourDetailsScreen.tsx    # Tour overview
│   ├── ParticipantsScreen.tsx   # Manage participants
│   ├── AddExpenseScreen.tsx     # Add new expense
│   ├── EditExpenseScreen.tsx    # Edit existing expense
│   └── ExpenseSummaryScreen.tsx # Analytics and summaries
├── types/              # TypeScript type definitions
│   └── index.ts        # Main types and interfaces
└── utils/              # Utility functions
    └── calculations.ts # Expense calculations and helpers
```

## Key Features Explained

### Expense Splitting Algorithm
The app uses a fair splitting algorithm that:
1. Calculates each participant's share based on their participation in individual expenses
2. Tracks who paid what amount
3. Computes net balances (who owes vs who is owed)
4. Suggests optimal settlements to minimize transaction count

### Settlement Optimization
The settlement algorithm minimizes the number of required transactions by:
1. Identifying creditors (people owed money) and debtors (people who owe money)
2. Pairing them optimally to reduce the total number of transactions
3. Providing step-by-step payment instructions

### Data Persistence
- All data is stored locally using AsyncStorage
- Automatic save on every change
- Data loads automatically on app startup
- No internet connection required

## Usage Guide

1. **Create a Tour**: Start by creating a new tour with title, dates, and description
2. **Add Participants**: Add all people who will be sharing expenses
3. **Track Expenses**: Add expenses specifying:
   - Who paid the amount
   - Who participated in the expense
   - Category and description
4. **View Summary**: Check the analytics tab for:
   - Total expenses and per-person averages
   - Individual balances
   - Settlement recommendations

## App Screenshots & Flow

### Main Flow:
1. **Tours List** → **Create Tour** → **Add Participants** → **Add Expenses** → **View Summary**

### Key Screens:
- **Tours List**: Overview of all your tours with quick stats
- **Tour Details**: Comprehensive tour overview with recent expenses and participant list
- **Participants Management**: Add/remove/edit participants with color customization
- **Add/Edit Expense**: Detailed form with category selection and participant management
- **Summary Analytics**: 4 tabs - Overview, Expenses, Balances, and Settlement suggestions

## Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (configured)

### Available Scripts
```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run lint       # Run ESLint
npm test          # Run tests
```

### Building for Production
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
# Use Xcode to archive and export
```

## Architecture Highlights

### State Management
- Uses React Context + useReducer for predictable state management
- All data flows through a single AppContext
- Actions clearly defined for all operations (CRUD for tours, participants, expenses)

### Navigation Structure
- Stack navigator for main flow
- Tab navigator for main sections (Tours, Summary)
- Type-safe navigation with TypeScript parameter lists

### Data Models
- **Tour**: Contains participants and expenses
- **Participant**: Has unique ID, name, and color
- **Expense**: Tracks amount, payer, participants, category, and date
- **Calculations**: Advanced algorithms for balance and settlement calculations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint && npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Future Enhancements

- [ ] Cloud sync and backup
- [ ] Export to PDF/CSV
- [ ] Receipt photo attachments
- [ ] Multi-currency support
- [ ] Push notifications for expense reminders
- [ ] Integration with payment apps
- [ ] Expense splitting by percentage or custom amounts
- [ ] Budget tracking and alerts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, suggestions, or issues:
- Open a GitHub issue
- Check the troubleshooting section above
- Review React Native documentation for environment setup issues

---

**Built with ❤️ using React Native and TypeScript**