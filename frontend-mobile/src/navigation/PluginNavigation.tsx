import { useEnabledPlugins, usePluginsByCategory } from '@/hooks/useConfig';
import { getAllPlugins, getEnabledPlugins } from '@/plugins';
import { PluginLoader } from '@/plugins/loader';
import { PluginMetadata } from '@/plugins/types';
import { initializeConfig, setUserContext } from '@/services/configService';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLoginWallStore } from '../components/LoginWall';

/**
 * Plugin-based Navigation System
 * Dynamically generates navigation routes from plugin metadata
 */

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface PluginNavigationProps {
  userPermissions?: string[];
}

/**
 * Main Plugin Navigation Component
 * Handles dynamic route generation from plugins
 */
export const PluginNavigation: React.FC<PluginNavigationProps> = ({
  userPermissions = []
}) => {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isVisible: isLoginWallVisible } = useLoginWallStore();

  // Use configuration hooks
  const { plugins: enabledPlugins, loading: configLoading, error: configError } = useEnabledPlugins();
  const { plugins: corePlugins } = usePluginsByCategory('core');

  useEffect(() => {
    initializeNavigation();
  }, []);

  useEffect(() => {
    // Set user context for configuration
    setUserContext({
      role: userPermissions[0], // Use first permission as role
      platform: 'mobile',
    });
  }, [userPermissions]);

  const initializeNavigation = async () => {
    try {
      setLoading(true);
      
      // Initialize configuration service
      await initializeConfig();
      
      // Get all enabled plugins from configuration
      const allPlugins = getAllPlugins();
      const enabledPluginNames = enabledPlugins || [];
      
      // Filter plugins by enabled status and user permissions
      const accessiblePlugins = allPlugins.filter(plugin => {
        // Check if plugin is enabled in configuration
        if (!enabledPluginNames.includes(plugin.name)) {
          return false;
        }
        
        // Check user permissions if provided
        if (userPermissions.length > 0) {
          return !plugin.permissions || 
            plugin.permissions.every(permission => userPermissions.includes(permission));
        }
        
        return true;
      });
      
      setPlugins(accessiblePlugins);
      setError(null);
    } catch (err) {
      console.error('[PluginNavigation] Failed to initialize navigation:', err);
      setError('Failed to load navigation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading navigation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF3B30', textAlign: 'center', marginBottom: 16 }}>
          Navigation Error
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <Text 
          style={{ color: '#007AFF', textAlign: 'center' }}
          onPress={initializeNavigation}
        >
          Retry
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        screenListeners={{
          beforeRemove: (e) => {
            // Prevent navigation if login wall is visible
            if (isLoginWallVisible) {
              e.preventDefault();
              return;
            }
          },
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Plugin Routes */}
        {plugins.map((plugin) => (
          <Stack.Screen
            key={plugin.name}
            name={plugin.route}
            options={{
              headerShown: true,
              title: plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1),
              headerBackTitle: 'Back',
            }}
          >
            {() => <PluginLoader pluginName={plugin.name} />}
          </Stack.Screen>
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Main Tab Navigator
 * Creates bottom tabs for core plugins
 */
const MainTabNavigator: React.FC = () => {
  const { isVisible: isLoginWallVisible } = useLoginWallStore();

  // Use configuration hooks for core plugins
  const { plugins: corePlugins, loading: configLoading, error: configError } = usePluginsByCategory('core');
  
  // Fallback to static list if configuration is not available
  const fallbackPlugins = getEnabledPlugins().filter(plugin => 
    plugin.category === 'core' || 
    ['chat', 'products', 'wallet', 'rfq'].includes(plugin.name)
  );
  
  const plugins = corePlugins.length > 0 ? corePlugins : fallbackPlugins;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E5E9',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
      screenListeners={{
        tabPress: (e) => {
          // Prevent tab navigation if login wall is visible
          if (isLoginWallVisible) {
            e.preventDefault();
            return;
          }
        },
      }}
    >
      {corePlugins.map((plugin) => (
        <Tab.Screen
          key={plugin.name}
          name={plugin.route}
          options={{
            title: plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1),
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>
                {plugin.icon || '📱'}
              </Text>
            ),
          }}
        >
          {() => <PluginLoader pluginName={plugin.name} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
};

/**
 * Plugin Route Component
 * Renders a specific plugin with error handling
 */
interface PluginRouteProps {
  pluginName: string;
}

export const PluginRoute: React.FC<PluginRouteProps> = ({ pluginName }) => {
  return <PluginLoader pluginName={pluginName} />;
};

/**
 * Navigation Helper Functions
 */
export const navigationHelpers = {
  /**
   * Get all available routes from plugins
   */
  getAvailableRoutes: (): string[] => {
    // Use configuration service if available, fallback to static
    try {
      const { getEnabledPlugins } = require('@/services/configService');
      const enabledPlugins = getEnabledPlugins();
      const allPlugins = getAllPlugins();
      return allPlugins
        .filter(plugin => enabledPlugins.includes(plugin.name))
        .map(plugin => plugin.route);
    } catch {
      return getEnabledPlugins().map(plugin => plugin.route);
    }
  },

  /**
   * Check if a route exists
   */
  hasRoute: (route: string): boolean => {
    try {
      const { getEnabledPlugins } = require('@/services/configService');
      const enabledPlugins = getEnabledPlugins();
      const allPlugins = getAllPlugins();
      return allPlugins
        .filter(plugin => enabledPlugins.includes(plugin.name))
        .some(plugin => plugin.route === route);
    } catch {
      return getEnabledPlugins().some(plugin => plugin.route === route);
    }
  },

  /**
   * Get plugin by route
   */
  getPluginByRoute: (route: string): PluginMetadata | undefined => {
    try {
      const { getEnabledPlugins } = require('@/services/configService');
      const enabledPlugins = getEnabledPlugins();
      const allPlugins = getAllPlugins();
      return allPlugins
        .filter(plugin => enabledPlugins.includes(plugin.name))
        .find(plugin => plugin.route === route);
    } catch {
      return getEnabledPlugins().find(plugin => plugin.route === route);
    }
  },

  /**
   * Get navigation structure
   */
  getNavigationStructure: () => {
    try {
      const { getEnabledPlugins } = require('@/services/configService');
      const enabledPlugins = getEnabledPlugins();
      const allPlugins = getAllPlugins();
      const filteredPlugins = allPlugins.filter(plugin => enabledPlugins.includes(plugin.name));
      
      return {
        tabs: filteredPlugins.filter(p => p.category === 'core'),
        modals: filteredPlugins.filter(p => p.category === 'feature'),
        integrations: filteredPlugins.filter(p => p.category === 'integration'),
      };
    } catch {
      const plugins = getEnabledPlugins();
      return {
        tabs: plugins.filter(p => p.category === 'core'),
        modals: plugins.filter(p => p.category === 'feature'),
        integrations: plugins.filter(p => p.category === 'integration'),
      };
    }
  },
};

export default PluginNavigation;
