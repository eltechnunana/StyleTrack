# StyleTrack Mobile

A comprehensive mobile application for tailoring businesses to manage clients, measurements, orders, and reports.

## Features

- **Client Management**: Add, edit, and organize client information
- **Measurement Tracking**: Record and manage body measurements with photos
- **Order Management**: Create and track tailoring orders with status updates
- **Reports & Analytics**: Generate business reports and insights
- **Photo Integration**: Take photos of garments and measurements using device camera
- **Offline Storage**: All data stored locally on device using AsyncStorage
- **Cross-Platform**: Available for both iOS and Android

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StyleTrackMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure app permissions**
   
   The app requires camera and photo library access for taking measurement photos.
   
   **iOS**: Permissions are already configured in `ios/StyleTrackMobile/Info.plist`
   
   **Android**: Permissions are already configured in `android/app/src/main/AndroidManifest.xml`

## Running the App

### Android
```bash
npx react-native run-android
```

### iOS (macOS only)
```bash
npx react-native run-ios
```

## Project Structure

```
StyleTrackMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CameraComponent.tsx
│   │   └── MeasurementForm.tsx
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ClientsScreen.tsx
│   │   ├── MeasurementsScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── Add*.tsx       # Add screens
│   ├── services/          # Business logic and data services
│   │   └── DataService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
└── App.tsx               # Main app component
```

## Key Dependencies

- **@react-navigation/native**: Navigation library
- **@react-navigation/bottom-tabs**: Bottom tab navigation
- **@react-navigation/stack**: Stack navigation
- **react-native-paper**: Material Design components
- **react-native-vector-icons**: Icon library
- **react-native-image-picker**: Camera and photo library access
- **@react-native-async-storage/async-storage**: Local data storage

## Features Breakdown

### Client Management
- Add new clients with name, email, phone, and notes
- Gender selection (Male, Female, Custom)
- Client search and filtering
- Client deletion with confirmation

### Measurement Tracking
- Comprehensive body measurement fields
- Custom measurement fields
- Unit conversion (CM/Inches)
- Photo attachments for reference
- Client-specific measurement history

### Order Management
- Order creation with unique order numbers
- Status tracking (Pending, In Progress, Completed, Delivered)
- Price tracking
- Due date management
- Link measurements to orders

### Reports & Analytics
- Business overview dashboard
- Client analytics
- Order statistics
- Financial summaries
- Data export functionality

### Settings
- Business information configuration
- Default measurement units
- Currency selection
- Data backup and restore
- App preferences

## Data Storage

All data is stored locally on the device using AsyncStorage:
- Clients: `@styletrack:clients`
- Measurements: `@styletrack:measurements`
- Orders: `@styletrack:orders`
- Reports: `@styletrack:reports`
- Settings: `@styletrack:settings`

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```
The APK will be generated in `android/app/build/outputs/apk/release/`

### iOS
```bash
cd ios
xcodebuild -workspace StyleTrackMobile.xcworkspace -scheme StyleTrackMobile -configuration Release
```

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build fails**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **iOS pod install fails**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

### Camera Permissions
If camera functionality doesn't work:
- iOS: Ensure camera permissions are granted in Settings > StyleTrack > Camera
- Android: Ensure camera permissions are granted in Settings > Apps > StyleTrack > Permissions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@styletrack.com or join our Slack channel.