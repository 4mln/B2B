import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const hasWindow = typeof window !== "undefined";
const memoryStore: Record<string, string> = {};

export async function saveItem(key: string, value: string) {
  try {
    if (isWeb) {
      if (hasWindow && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error("[SecureStore] Failed to save key", key, error);
  }
}

export async function getItem(key: string) {
  try {
    if (isWeb) {
      if (hasWindow && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem(key);
      }
      return memoryStore[key] ?? null;
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error("[SecureStore] Failed to get key", key, error);
    return null;
  }
}

export async function deleteItem(key: string) {
  try {
    if (isWeb) {
      if (hasWindow && typeof window.localStorage !== "undefined") {
        window.localStorage.removeItem(key);
      } else {
        delete memoryStore[key];
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error("[SecureStore] Failed to delete key", key, error);
  }
}
