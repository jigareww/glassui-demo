import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  changeIcon(iconName: string): Promise<boolean>;
  getCurrentIcon(): Promise<string>;
  getAvailableIcons(): Promise<string[]>;
  resetIcon(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AppIconModule');
