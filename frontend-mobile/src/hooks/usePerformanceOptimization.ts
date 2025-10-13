import { useMemo, useCallback, useRef, useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { trackPerformance } from '../services/analytics';

/**
 * Performance Optimization Hooks
 * Provides hooks for optimizing React Native performance
 */

/**
 * Hook for memoizing expensive calculations
 */
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const startTime = useRef<number>(0);
  
  useEffect(() => {
    startTime.current = Date.now();
  }, deps);
  
  const result = useMemo(() => {
    const value = factory();
    const duration = Date.now() - startTime.current;
    
    if (duration > 16) { // Track slow calculations (> 16ms)
      trackPerformance('memoized_calculation', duration);
    }
    
    return value;
  }, deps);
  
  return result;
};

/**
 * Hook for debouncing function calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
  
  return throttledCallback;
};

/**
 * Hook for optimizing FlatList performance
 */
export const useFlatListOptimization = () => {
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 100, // Estimated item height
      offset: 100 * index,
      index,
    }),
    []
  );
  
  const keyExtractor = useCallback(
    (item: any, index: number) => item.id || index.toString(),
    []
  );
  
  const removeClippedSubviews = Platform.OS === 'android';
  
  const maxToRenderPerBatch = 10;
  const windowSize = 10;
  const initialNumToRender = 10;
  
  return {
    getItemLayout,
    keyExtractor,
    removeClippedSubviews,
    maxToRenderPerBatch,
    windowSize,
    initialNumToRender,
  };
};

/**
 * Hook for optimizing image loading
 */
export const useImageOptimization = () => {
  const getImageProps = useCallback(
    (uri: string, width?: number, height?: number) => ({
      source: { uri },
      style: {
        width: width || 100,
        height: height || 100,
      },
      resizeMode: 'cover' as const,
      loadingIndicatorSource: require('../assets/placeholder.png'),
      onLoadStart: () => {
        trackPerformance('image_load_start', 0);
      },
      onLoad: () => {
        trackPerformance('image_load_complete', 0);
      },
      onError: (error: any) => {
        trackPerformance('image_load_error', 0);
        console.error('Image load error:', error);
      },
    }),
    []
  );
  
  return { getImageProps };
};

/**
 * Hook for optimizing navigation performance
 */
export const useNavigationOptimization = () => {
  const navigationRef = useRef<any>();
  
  const navigate = useCallback(
    (routeName: string, params?: any) => {
      if (navigationRef.current) {
        navigationRef.current.navigate(routeName, params);
        trackPerformance('navigation', 0);
      }
    },
    []
  );
  
  const goBack = useCallback(() => {
    if (navigationRef.current) {
      navigationRef.current.goBack();
      trackPerformance('navigation_back', 0);
    }
  }, []);
  
  return {
    navigationRef,
    navigate,
    goBack,
  };
};

/**
 * Hook for optimizing API calls
 */
export const useApiOptimization = () => {
  const requestCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  const getCachedData = useCallback(
    (key: string) => {
      const cached = requestCache.current.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      return null;
    },
    []
  );
  
  const setCachedData = useCallback(
    (key: string, data: any) => {
      requestCache.current.set(key, {
        data,
        timestamp: Date.now(),
      });
    },
    []
  );
  
  const clearCache = useCallback(() => {
    requestCache.current.clear();
  }, []);
  
  return {
    getCachedData,
    setCachedData,
    clearCache,
  };
};

/**
 * Hook for optimizing component rendering
 */
export const useRenderOptimization = () => {
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      if (timeSinceLastRender < 16) { // Track frequent re-renders
        trackPerformance('frequent_render', timeSinceLastRender);
      }
    }
    
    lastRenderTime.current = now;
  });
  
  const shouldRender = useCallback(
    (prevProps: any, nextProps: any) => {
      // Custom comparison logic
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    },
    []
  );
  
  return {
    renderCount: renderCount.current,
    shouldRender,
  };
};

/**
 * Hook for optimizing animations
 */
export const useAnimationOptimization = () => {
  const animationRef = useRef<any>();
  
  const startAnimation = useCallback(
    (animation: any) => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      animationRef.current = animation.start();
      trackPerformance('animation_start', 0);
    },
    []
  );
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);
  
  return {
    startAnimation,
    stopAnimation,
  };
};

/**
 * Hook for optimizing memory usage
 */
export const useMemoryOptimization = () => {
  const memoryRef = useRef<number>(0);
  
  useEffect(() => {
    const checkMemory = () => {
      if (Platform.OS === 'android') {
        // Android memory check
        const memInfo = (global as any).memInfo;
        if (memInfo) {
          memoryRef.current = memInfo.totalPss;
          if (memInfo.totalPss > 100 * 1024 * 1024) { // 100MB
            trackPerformance('high_memory_usage', memInfo.totalPss);
          }
        }
      }
    };
    
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const clearMemory = useCallback(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }, []);
  
  return {
    memoryUsage: memoryRef.current,
    clearMemory,
  };
};

/**
 * Hook for optimizing interaction performance
 */
export const useInteractionOptimization = () => {
  const interactionRef = useRef<boolean>(false);
  
  const runAfterInteractions = useCallback(
    (callback: () => void) => {
      InteractionManager.runAfterInteractions(() => {
        callback();
        interactionRef.current = false;
      });
    },
    []
  );
  
  const startInteraction = useCallback(() => {
    interactionRef.current = true;
  }, []);
  
  const endInteraction = useCallback(() => {
    interactionRef.current = false;
  }, []);
  
  return {
    isInteracting: interactionRef.current,
    runAfterInteractions,
    startInteraction,
    endInteraction,
  };
};

export default {
  useMemoizedValue,
  useDebounce,
  useThrottle,
  useFlatListOptimization,
  useImageOptimization,
  useNavigationOptimization,
  useApiOptimization,
  useRenderOptimization,
  useAnimationOptimization,
  useMemoryOptimization,
  useInteractionOptimization,
};
