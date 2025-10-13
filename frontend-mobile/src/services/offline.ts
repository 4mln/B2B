import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import * as SQLite from 'expo-sqlite';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Create a persister
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'react-query-cache',
});

// SQLite database for more complex offline data
export const getDatabase = () => {
  return SQLite.openDatabase('app.db');
};

// Initialize SQLite tables
export const initDatabase = () => {
  const db = getDatabase();
  
  // Create tables if they don't exist
  db.transaction(tx => {
    // Products table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price REAL,
        image_url TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );`
    );
    
    // Offline actions queue
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS offline_queue (
        id TEXT PRIMARY KEY,
        action TEXT,
        endpoint TEXT,
        payload TEXT,
        created_at TEXT,
        attempts INTEGER DEFAULT 0
      );`
    );
  });
};

// Save data to SQLite
export const saveToDatabase = (table: string, data: any) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      // Handle different table types
      if (table === 'products') {
        tx.executeSql(
          `INSERT OR REPLACE INTO products (id, name, description, price, image_url, created_at, updated_at, synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.name,
            data.description,
            data.price,
            data.image_url,
            data.created_at || new Date().toISOString(),
            data.updated_at || new Date().toISOString(),
            0 // Not synced
          ],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      } else if (table === 'offline_queue') {
        tx.executeSql(
          `INSERT INTO offline_queue (id, action, endpoint, payload, created_at, attempts)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.id,
            data.action,
            data.endpoint,
            JSON.stringify(data.payload),
            new Date().toISOString(),
            0
          ],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    });
  });
};

// Query data from SQLite
export const queryDatabase = (table: string, query: string = '', params: any[] = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${table} ${query}`,
        params,
        (_, result) => {
          const items: any[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            items.push(result.rows.item(i));
          }
          resolve(items);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Process offline queue when back online
export const processOfflineQueue = async () => {
  try {
    const queue = await queryDatabase('offline_queue') as any[];
    
    for (const item of queue) {
      try {
        // Process each queued action
        console.log(`Processing offline action: ${item.action} ${item.endpoint}`);
        
        // TODO: Implement actual API calls here
        
        // Remove from queue after successful processing
        const db = getDatabase();
        db.transaction(tx => {
          tx.executeSql('DELETE FROM offline_queue WHERE id = ?', [item.id]);
        });
      } catch (error) {
        console.error('Error processing offline item:', error);
        
        // Increment attempt count
        const db = getDatabase();
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE offline_queue SET attempts = attempts + 1 WHERE id = ?',
            [item.id]
          );
        });
      }
    }
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
};

// Wrapper component for React Query with persistence
export const PersistedQueryClientProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
      onSuccess={() => {
        console.log('React Query cache restored from AsyncStorage');
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};