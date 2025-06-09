import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp as NavigationRouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { formatCurrency, formatDate } from '../utils/calculations';
import { CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCategorySummary, ParticipantSummary } from '../types';

type RouteProps = NavigationRouteProp<RootStackParamList, 'ExpenseSummary'>;

type TabType = 'overview' | 'expenses' | 'balances' | 'settlements';

const ExpenseSummaryScreen: React.FC = () => {
  const { tours, getTourSummary, getSettlements } = useApp();
  const route = useRoute<RouteProps>();

  const { tourId } = route.params;
  const tour = tours.find(t => t.id === tourId);
  const summary = getTourSummary(tourId);
  const settlements = getSettlements(tourId);

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!tour || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tour not found</Text>
      </SafeAreaView>
    );
  }

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={activeTab === tab ? '#007AFF' : '#666'} 
      />
      <Text
        style={[
          styles.tabText,
          activeTab === tab && styles.activeTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Tour Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(summary.totalExpenses)}</Text>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tour.expenses.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(summary.totalExpenses / tour.participants.length)}
            </Text>
            <Text style={styles.statLabel}>Per Person</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {summary.expensesByCategory.map((categoryData: ExpenseCategorySummary) => (
          <View key={categoryData.category} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: CATEGORY_COLORS[categoryData.category] },
                ]}
              >
                <Text style={styles.categoryIconText}>
                  {CATEGORY_ICONS[categoryData.category]}
                </Text>
              </View>
              <View>
                <Text style={styles.categoryName}>{categoryData.category}</Text>
                <Text style={styles.categoryCount}>
                  {categoryData.expenseCount} expenses
                </Text>
              </View>
            </View>
            <Text style={styles.categoryAmount}>
              {formatCurrency(categoryData.totalAmount)}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Quick Balances</Text>
        {summary.participantSummaries.slice(0, 3).map((participantSummary: ParticipantSummary) => (
          <View key={participantSummary.participant.id} style={styles.participantBalance}>
            <View style={styles.participantInfo}>
              <Avatar
                name={participantSummary.participant.name}
                color={participantSummary.participant.color}
                size={32}
              />
              <Text style={styles.participantName}>
                {participantSummary.participant.name}
              </Text>
            </View>
            <Text
              style={[
                styles.balanceAmount,
                participantSummary.netBalance >= 0 ? styles.positiveBalance : styles.negativeBalance,
              ]}
            >
              {participantSummary.netBalance >= 0 ? '+' : ''}
              {formatCurrency(participantSummary.netBalance)}
            </Text>
          </View>
        ))}
        {summary.participantSummaries.length > 3 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setActiveTab('balances')}
          >
            <Text style={styles.viewAllText}>View All Balances</Text>
          </TouchableOpacity>
        )}
      </Card>
    </ScrollView>
  );

  const renderExpensesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {tour.expenses.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No expenses yet</Text>
        </Card>
      ) : (
        tour.expenses.map((expense) => {
          const payer = tour.participants.find(p => p.id === expense.paidBy);
          return (
            <Card key={expense.id}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: CATEGORY_COLORS[expense.category] },
                    ]}
                  >
                    <Text style={styles.categoryIconText}>
                      {CATEGORY_ICONS[expense.category]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.expenseDate}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
              
              <Text style={styles.expensePayer}>
                Paid by: {payer?.name || 'Unknown'}
              </Text>
              
              <View style={styles.expenseParticipants}>
                <Text style={styles.participantsLabel}>Participants:</Text>
                <View style={styles.participantAvatars}>
                  {expense.participants.map((participantId) => {
                    const participant = tour.participants.find(p => p.id === participantId);
                    return participant ? (
                      <Avatar
                        key={participantId}
                        name={participant.name}
                        color={participant.color}
                        size={24}
                      />
                    ) : null;
                  })}
                </View>
              </View>
              
              <Text style={styles.shareAmount}>
                Share per person: {formatCurrency(expense.amount / expense.participants.length)}
              </Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );

  const renderBalancesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Individual Balances</Text>
        {summary.participantSummaries.map((participantSummary: ParticipantSummary) => (
          <View key={participantSummary.participant.id} style={styles.detailedBalance}>
            <View style={styles.participantInfo}>
              <Avatar
                name={participantSummary.participant.name}
                color={participantSummary.participant.color}
                size={40}
              />
              <Text style={styles.participantName}>
                {participantSummary.participant.name}
              </Text>
            </View>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Paid:</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(participantSummary.totalPaid)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Owes:</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(participantSummary.totalOwed)}
                </Text>
              </View>
              <View style={[styles.balanceRow, styles.netBalanceRow]}>
                <Text style={styles.netBalanceLabel}>Net:</Text>
                <Text
                  style={[
                    styles.netBalanceValue,
                    participantSummary.netBalance >= 0 ? styles.positiveBalance : styles.negativeBalance,
                  ]}
                >
                  {participantSummary.netBalance >= 0 ? '+' : ''}
                  {formatCurrency(participantSummary.netBalance)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );

  const renderSettlementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Suggested Settlements</Text>
        {settlements.length === 0 ? (
          <Text style={styles.emptyText}>All balances are settled!</Text>
        ) : (
          <>
            <Text style={styles.settlementsSubtitle}>
              To settle all debts, the following transfers are recommended:
            </Text>
            {settlements.map((settlement, index) => {
              const fromParticipant = tour.participants.find(p => p.id === settlement.from);
              const toParticipant = tour.participants.find(p => p.id === settlement.to);
              
              return (
                <View key={index} style={styles.settlementItem}>
                  <View style={styles.settlementParticipants}>
                    <View style={styles.settlementParticipant}>
                      <Avatar
                        name={fromParticipant?.name || 'Unknown'}
                        color={fromParticipant?.color || '#666'}
                        size={32}
                      />
                      <Text style={styles.settlementName}>
                        {fromParticipant?.name || 'Unknown'}
                      </Text>
                    </View>
                    
                    <View style={styles.settlementArrow}>
                      <Icon name="arrow-forward" size={20} color="#007AFF" />
                      <Text style={styles.settlementAmount}>
                        {formatCurrency(settlement.amount)}
                      </Text>
                    </View>
                    
                    <View style={styles.settlementParticipant}>
                      <Avatar
                        name={toParticipant?.name || 'Unknown'}
                        color={toParticipant?.color || '#666'}
                        size={32}
                      />
                      <Text style={styles.settlementName}>
                        {toParticipant?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </Card>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'expenses':
        return renderExpensesTab();
      case 'balances':
        return renderBalancesTab();
      case 'settlements':
        return renderSettlementsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Summary</Text>
        <Text style={styles.headerSubtitle}>{tour.title}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('overview', 'Overview', 'dashboard')}
        {renderTabButton('expenses', 'Expenses', 'receipt')}
        {renderTabButton('balances', 'Balances', 'account-balance')}
        {renderTabButton('settlements', 'Settlements', 'swap-horiz')}
      </View>

      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  participantBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#34C759',
  },
  negativeBalance: {
    color: '#FF3B30',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 32,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  expensePayer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  expenseParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantsLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  participantAvatars: {
    flexDirection: 'row',
    gap: 4,
  },
  shareAmount: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  detailedBalance: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  balanceDetails: {
    marginTop: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    color: '#333',
  },
  netBalanceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  netBalanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  netBalanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settlementsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  settlementItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  settlementParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementParticipant: {
    alignItems: 'center',
    flex: 1,
  },
  settlementName: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  settlementArrow: {
    alignItems: 'center',
    flex: 1,
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
});

export default ExpenseSummaryScreen;