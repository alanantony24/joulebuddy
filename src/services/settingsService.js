// ─────────────────────────────────────────────────────────────────────────────
// Settings Service — persists user preferences via AsyncStorage
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  pushNotifications: "@settings_pushNotifications",
  biometricLogin: "@settings_biometricLogin",
  paperlessBilling: "@settings_paperlessBilling",
};

const DEFAULTS = {
  pushNotifications: true,
  biometricLogin: false,
  paperlessBilling: true,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // Load persisted values on mount
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(KEYS));
        const loaded = { ...DEFAULTS };
        entries.forEach(([key, value]) => {
          const name = Object.keys(KEYS).find((k) => KEYS[k] === key);
          if (name && value !== null) {
            loaded[name] = value === "true";
          }
        });
        setSettings(loaded);
      } catch {
        // If storage fails, keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSetting = useCallback(
    async (name) => {
      const newVal = !settings[name];
      setSettings((prev) => ({ ...prev, [name]: newVal }));
      try {
        await AsyncStorage.setItem(KEYS[name], String(newVal));
      } catch {
        // Silently fail — demo app
      }
    },
    [settings],
  );

  return {
    pushNotifications: settings.pushNotifications,
    biometricLogin: settings.biometricLogin,
    paperlessBilling: settings.paperlessBilling,
    toggleSetting,
    loading,
  };
}
