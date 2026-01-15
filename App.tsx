import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import MeasurementsScreen from './src/screens/MeasurementsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddClientScreen from './src/screens/AddClientScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import AddOrderScreen from './src/screens/AddOrderScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';

export type RootStackParamList = {
  Main: undefined;
  AddClient: undefined;
  AddMeasurement: { clientId?: string };
  AddOrder: undefined;
  ClientDetails: { clientId: string };
  MeasurementDetails: { measurementId: string };
  OrderDetails: { orderId: string };
  Invoice: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  Clients: undefined;
  Measurements: undefined;
  Orders: undefined;
  Invoices: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Clients':
              iconName = 'people';
              break;
            case 'Measurements':
              iconName = 'straighten';
              break;
            case 'Orders':
              iconName = 'assignment';
              break;
            case 'Invoices':
              iconName = 'receipt';
              break;
            case 'Reports':
              iconName = 'assessment';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Measurements" component={MeasurementsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="AddClient" component={AddClientScreen} />
          <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
          <Stack.Screen name="AddOrder" component={AddOrderScreen} />
          <Stack.Screen name="Invoice" component={InvoiceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}



export default App;