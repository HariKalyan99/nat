// utils/storage.ts
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const getItem = (key: string) => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
};

export const setItem = (key: string, value: any) => {
  storage.set(key, JSON.stringify(value));
};

export const removeItem = (key: string) => {
  storage.delete(key);
};
