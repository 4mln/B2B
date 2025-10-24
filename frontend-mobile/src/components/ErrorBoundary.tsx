import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Production-grade Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    if (!__DEV__) {
      // In production, send to error tracking
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: semanticSpacing.lg,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    color: colors.error[600],
    marginBottom: semanticSpacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: semanticSpacing.lg,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: colors.gray[100],
    padding: semanticSpacing.md,
    borderRadius: semanticSpacing.radius.md,
    marginBottom: semanticSpacing.lg,
    maxHeight: 300,
    width: '100%',
  },
  errorTitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.error[700],
    marginBottom: semanticSpacing.xs,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.error[600],
    fontFamily: 'monospace',
    marginBottom: semanticSpacing.sm,
  },
  errorStack: {
    fontSize: 10,
    color: colors.gray[600],
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary[600],
    paddingVertical: semanticSpacing.sm,
    paddingHorizontal: semanticSpacing.lg,
    borderRadius: semanticSpacing.radius.md,
    minWidth: 120,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
});

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
