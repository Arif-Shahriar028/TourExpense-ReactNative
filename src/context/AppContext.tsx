import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tour, Participant, Expense, Settlement } from '../types';
import { calculateTourSummary, calculateSettlements } from '../utils/calculations';

interface AppState {
  tours: Tour[];
  currentTour: Tour | null;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOURS'; payload: Tour[] }
  | { type: 'SET_CURRENT_TOUR'; payload: Tour | null }
  | { type: 'ADD_TOUR'; payload: Tour }
  | { type: 'UPDATE_TOUR'; payload: Tour }
  | { type: 'DELETE_TOUR'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: { tourId: string; expense: Expense } }
  | { type: 'UPDATE_EXPENSE'; payload: { tourId: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: { tourId: string; expenseId: string } }
  | { type: 'ADD_PARTICIPANT'; payload: { tourId: string; participant: Participant } }
  | { type: 'UPDATE_PARTICIPANT'; payload: { tourId: string; participant: Participant } }
  | { type: 'DELETE_PARTICIPANT'; payload: { tourId: string; participantId: string } };

const initialState: AppState = {
  tours: [],
  currentTour: null,
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_TOURS':
      return { ...state, tours: action.payload };
      
    case 'SET_CURRENT_TOUR':
      return { ...state, currentTour: action.payload };
      
    case 'ADD_TOUR':
      return { 
        ...state, 
        tours: [...state.tours, action.payload],
        currentTour: action.payload 
      };
      
    case 'UPDATE_TOUR':
      const updatedTours = state.tours.map(tour =>
        tour.id === action.payload.id ? action.payload : tour
      );
      return {
        ...state,
        tours: updatedTours,
        currentTour: state.currentTour?.id === action.payload.id ? action.payload : state.currentTour,
      };
      
    case 'DELETE_TOUR':
      return {
        ...state,
        tours: state.tours.filter(tour => tour.id !== action.payload),
        currentTour: state.currentTour?.id === action.payload ? null : state.currentTour,
      };
      
    case 'ADD_EXPENSE':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? { 
                ...tour, 
                expenses: [...tour.expenses, action.payload.expense],
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? { 
              ...state.currentTour, 
              expenses: [...state.currentTour.expenses, action.payload.expense],
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? {
                ...tour,
                expenses: tour.expenses.map(expense =>
                  expense.id === action.payload.expense.id ? action.payload.expense : expense
                ),
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? {
              ...state.currentTour,
              expenses: state.currentTour.expenses.map(expense =>
                expense.id === action.payload.expense.id ? action.payload.expense : expense
              ),
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    case 'DELETE_EXPENSE':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? {
                ...tour,
                expenses: tour.expenses.filter(expense => expense.id !== action.payload.expenseId),
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? {
              ...state.currentTour,
              expenses: state.currentTour.expenses.filter(expense => expense.id !== action.payload.expenseId),
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? { 
                ...tour, 
                participants: [...tour.participants, action.payload.participant],
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? { 
              ...state.currentTour, 
              participants: [...state.currentTour.participants, action.payload.participant],
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? {
                ...tour,
                participants: tour.participants.map(participant =>
                  participant.id === action.payload.participant.id ? action.payload.participant : participant
                ),
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? {
              ...state.currentTour,
              participants: state.currentTour.participants.map(participant =>
                participant.id === action.payload.participant.id ? action.payload.participant : participant
              ),
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        tours: state.tours.map(tour =>
          tour.id === action.payload.tourId
            ? {
                ...tour,
                participants: tour.participants.filter(participant => participant.id !== action.payload.participantId),
                expenses: tour.expenses.filter(expense => 
                  expense.paidBy !== action.payload.participantId &&
                  !expense.participants.includes(action.payload.participantId)
                ),
                updatedAt: new Date().toISOString()
              }
            : tour
        ),
        currentTour: state.currentTour?.id === action.payload.tourId
          ? {
              ...state.currentTour,
              participants: state.currentTour.participants.filter(participant => participant.id !== action.payload.participantId),
              expenses: state.currentTour.expenses.filter(expense => 
                expense.paidBy !== action.payload.participantId &&
                !expense.participants.includes(action.payload.participantId)
              ),
              updatedAt: new Date().toISOString()
            }
          : state.currentTour,
      };
      
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  saveTours: () => Promise<void>;
  loadTours: () => Promise<void>;
  getTourSummary: (tourId: string) => any;
  getSettlements: (tourId: string) => Settlement[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@TourExpense:tours';

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const saveTours = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.tours));
    } catch (error) {
      console.error('Error saving tours:', error);
    }
  }, [state.tours]);

  const loadTours = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const toursData = await AsyncStorage.getItem(STORAGE_KEY);
      if (toursData) {
        const tours = JSON.parse(toursData);
        dispatch({ type: 'SET_TOURS', payload: tours });
      }
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getTourSummary = (tourId: string) => {
    const tour = state.tours.find(t => t.id === tourId);
    if (!tour) return null;
    return calculateTourSummary(tour);
  };

  const getSettlements = (tourId: string): Settlement[] => {
    const tour = state.tours.find(t => t.id === tourId);
    if (!tour) return [];
    const summary = calculateTourSummary(tour);
    return calculateSettlements(summary.participantSummaries);
  };

  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    if (state.tours.length > 0) {
      saveTours();
    }
  }, [state.tours, saveTours]);

  const value: AppContextValue = {
    ...state,
    dispatch,
    saveTours,
    loadTours,
    getTourSummary,
    getSettlements,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};