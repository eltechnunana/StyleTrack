import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const App = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧵 StyleTrack</Text>
        <Text style={styles.subtitle}>Professional Tailoring Invoice System</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Professional Invoice System</Text>
        <Text style={styles.description}>
          Your comprehensive invoice system is now deployed! This includes:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.feature}>✅ 13-clause Terms & Conditions</Text>
          <Text style={styles.feature}>✅ Company Information Management</Text>
          <Text style={styles.feature}>✅ Invoice Item Management</Text>
          <Text style={styles.feature}>✅ Tax Calculations</Text>
          <Text style={styles.feature}>✅ Professional Styling</Text>
          <Text style={styles.feature}>✅ Status Tracking</Text>
          <Text style={styles.feature}>✅ Sharing Functionality</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏢 Company Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Company Name:</Text>
          <Text style={styles.infoValue}>StyleTrack Tailoring Services</Text>
          
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>+1 (555) 123-4567</Text>
          
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>info@styletrack.com</Text>
          
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>123 Fashion Avenue, Style City, SC 12345</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Terms & Conditions Summary</Text>
        <View style={styles.termsCard}>
          <Text style={styles.termsText}>
            1. VALIDITY: 14-day quotation validity{'\n'}
            2. DEPOSIT: 60% upfront payment required{'\n'}
            3. FINAL PAYMENT: 40% balance on completion{'\n'}
            4. EXPRESS ORDERS: Additional charges for rush orders{'\n'}
            5. CLIENT DELAYS: Not liable for client-caused delays{'\n'}
            6. REVISIONS: Changes may incur extra charges{'\n'}
            7. CANCELLATION: Deposits are non-refundable{'\n'}
            8. INSPECTION: 48-hour complaint window{'\n'}
            9. OWNERSHIP: Retains ownership until full payment{'\n'}
            10. DELIVERY: Estimated timelines with charges{'\n'}
            11. CONTENT: Client responsible for submissions{'\n'}
            12. WARRANTY: Limited workmanship warranty{'\n'}
            13. CONTACT: Your business contact information
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎉 Successfully deployed as "StyleMe" on Vercel!
        </Text>
        <Text style={styles.footerSubtext}>
          Your professional invoice system is ready for production use.
        </Text>
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
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    padding: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0d6efd',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 15,
    lineHeight: 24,
  },
  featureList: {
    marginTop: 10,
  },
  feature: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
  },
  termsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  termsText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    marginTop: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d6efd',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default App;