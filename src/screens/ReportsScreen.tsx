import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Card, Button, SegmentedButtons } from 'react-native-paper';
import { DataService } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const [reportType, setReportType] = useState<'overview' | 'clients' | 'orders' | 'financial'>('overview');
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMeasurements: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    loadReportData();
  }, [reportType]);

  const loadReportData = async () => {
    try {
      const clients = await DataService.getClients();
      const measurements = await DataService.getMeasurements();
      const orders = await DataService.getOrders();
      
      const completedOrders = orders.filter(order => order.status === 'completed' || order.status === 'delivered');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.price || 0), 0);
      
      setStats({
        totalClients: clients.length,
        totalMeasurements: measurements.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        completedOrders: completedOrders.length,
        totalRevenue,
        monthlyGrowth: 12, // Mock data
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const generateReport = async (type: string) => {
    try {
      const report = {
        id: Date.now().toString(),
        type: type as any,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        data: stats,
        createdAt: new Date(),
      };
      
      await DataService.saveReport(report);
      Alert.alert('Success', 'Report generated and saved successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statIconContainer}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderOverviewReport = () => (
    <View>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon="people"
          color="#4CAF50"
        />
        <StatCard
          title="Total Measurements"
          value={stats.totalMeasurements}
          icon="straighten"
          color="#2196F3"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="assignment"
          color="#FF9800"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="schedule"
          color="#F44336"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon="check-circle"
          color="#4CAF50"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon="attach-money"
          color="#9C27B0"
        />
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Business Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Growth</Text>
            <Text style={styles.summaryValuePositive}>
              +{stats.monthlyGrowth}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Order Value</Text>
            <Text style={styles.summaryValue}>
              ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={styles.summaryValue}>
              {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : '0'}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => generateReport('overview')}
        style={styles.generateButton}
        icon="assessment"
      >
        Generate Overview Report
      </Button>
    </View>
  );

  const renderClientReport = () => (
    <View>
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.reportTitle}>Client Analysis</Text>
          <Text style={styles.reportText}>
            Total registered clients in your tailoring business.
          </Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Clients:</Text>
            <Text style={styles.metricValue}>{stats.totalClients}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Avg. Measurements per Client:</Text>
            <Text style={styles.metricValue}>
              {stats.totalClients > 0 ? (stats.totalMeasurements / stats.totalClients).toFixed(1) : '0'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => generateReport('clients')}
        style={styles.generateButton}
        icon="people"
      >
        Generate Client Report
      </Button>
    </View>
  );

  const renderOrderReport = () => (
    <View>
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.reportTitle}>Order Analysis</Text>
          <Text style={styles.reportText}>
            Detailed breakdown of your tailoring orders.
          </Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Orders:</Text>
            <Text style={styles.metricValue}>{stats.totalOrders}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Pending Orders:</Text>
            <Text style={styles.metricValueNegative}>{stats.pendingOrders}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Completed Orders:</Text>
            <Text style={styles.metricValuePositive}>{stats.completedOrders}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => generateReport('orders')}
        style={styles.generateButton}
        icon="assignment"
      >
        Generate Order Report
      </Button>
    </View>
  );

  const renderFinancialReport = () => (
    <View>
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text style={styles.reportTitle}>Financial Summary</Text>
          <Text style={styles.reportText}>
            Revenue and financial metrics for your tailoring business.
          </Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Revenue:</Text>
            <Text style={styles.metricValuePositive}>
              ${stats.totalRevenue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Order Value:</Text>
            <Text style={styles.metricValue}>
              ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Revenue per Client:</Text>
            <Text style={styles.metricValue}>
              ${stats.totalClients > 0 ? (stats.totalRevenue / stats.totalClients).toFixed(2) : '0.00'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => generateReport('financial')}
        style={styles.generateButton}
        icon="attach-money"
      >
        Generate Financial Report
      </Button>
    </View>
  );

  const renderContent = () => {
    switch (reportType) {
      case 'overview':
        return renderOverviewReport();
      case 'clients':
        return renderClientReport();
      case 'orders':
        return renderOrderReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Business analytics and insights</Text>
      </View>

      <SegmentedButtons
        value={reportType}
        onValueChange={setReportType}
        buttons={[
          { value: 'overview', label: 'Overview' },
          { value: 'clients', label: 'Clients' },
          { value: 'orders', label: 'Orders' },
          { value: 'financial', label: 'Financial' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.contentContainer}>
        {renderContent()}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  segmentedButtons: {
    margin: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryValuePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  reportCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  metricValuePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  metricValueNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  generateButton: {
    marginTop: 24,
    borderRadius: 8,
  },
});

export default ReportsScreen;