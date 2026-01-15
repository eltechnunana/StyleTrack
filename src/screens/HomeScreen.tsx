import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import { DataService } from '../services/DataService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMeasurements: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const clients = await DataService.getClients();
      const measurements = await DataService.getMeasurements();
      const orders = await DataService.getOrders();
      
      setStats({
        totalClients: clients.length,
        totalMeasurements: measurements.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Add Client',
      icon: '👤',
      onPress: () => navigation.navigate('Clients', { screen: 'AddClient' }),
      color: '#4CAF50',
    },
    {
      title: 'New Measurement',
      icon: '📏',
      onPress: () => navigation.navigate('Measurements', { screen: 'AddMeasurement' }),
      color: '#2196F3',
    },
    {
      title: 'Create Order',
      icon: '📝',
      onPress: () => navigation.navigate('Orders', { screen: 'AddOrder' }),
      color: '#FF9800',
    },
    {
      title: 'View Reports',
      icon: '📊',
      onPress: () => navigation.navigate('Reports'),
      color: '#9C27B0',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>StyleTrack</Text>
        <Text style={styles.subtitle}>Tailoring Management</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{stats.totalClients}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{stats.totalMeasurements}</Text>
            <Text style={styles.statLabel}>Measurements</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.activityText}>
              Welcome to StyleTrack Mobile!{'\n'}
              Start by adding your first client or measurement.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  recentActivityContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  activityCard: {
    borderRadius: 12,
    elevation: 2,
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default HomeScreen;