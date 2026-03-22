import { useLocalStorage } from './useLocalStorage';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('gb_settings', DEFAULT_SETTINGS);
  return { settings, setSettings };
}
