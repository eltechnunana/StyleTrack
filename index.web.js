import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('StyleTrackMobile', () => App);

if (typeof document !== 'undefined') {
  AppRegistry.runApplication('StyleTrackMobile', {
    rootTag: document.getElementById('root'),
  });
}