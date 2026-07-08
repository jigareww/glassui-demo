export enum AppIcon {
    Default = "default",
    Premium = "premium",
    Gold = "gold",
    Dark = "dark",
    Christmas = "christmas",
    Holiday = "holiday",
    Diwali = "diwali"
}

import NativeAppIconModule from './NativeAppIconModule';

export default {
  /**
   * Change the app icon to a specific variant.
   * @param iconName The name of the icon to switch to.
   * @returns A promise that resolves to a boolean indicating success.
   */
  changeIcon: (iconName: AppIcon | string): Promise<boolean> => {
    return NativeAppIconModule.changeIcon(iconName);
  },

  /**
   * Get the currently active app icon name.
   * @returns A promise resolving to the string name of the active icon.
   */
  getCurrentIcon: (): Promise<string> => {
    return NativeAppIconModule.getCurrentIcon();
  },

  /**
   * Get all the available app icons that can be switched to.
   * @returns A promise resolving to an array of string icon names.
   */
  getAvailableIcons: (): Promise<string[]> => {
    return NativeAppIconModule.getAvailableIcons();
  },

  /**
   * Reset the app icon to the default variant.
   * @returns A promise that resolves to a boolean indicating success.
   */
  resetIcon: (): Promise<boolean> => {
    return NativeAppIconModule.resetIcon();
  }
};
