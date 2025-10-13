import React, { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { t } = this.props;
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color={colors.error[500]} />
            </View>
            
            <Text style={styles.title}>{t('errors.somethingWrong', 'Something went wrong')}</Text>
            <Text style={styles.message}>
              {t('errors.somethingUnexpected', "We're sorry, but something unexpected happened. Please try again.")}
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>{t('errors.detailsDev', 'Error Details (Development):')}</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
            
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: semanticSpacing.lg,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: semanticSpacing.md,
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.body.fontSize * (typography.lineHeights?.normal || 1.5),
    marginBottom: semanticSpacing.xl,
  },
  errorDetails: {
    backgroundColor: colors.gray[100],
    padding: semanticSpacing.md,
    borderRadius: semanticSpacing.radius.md,
    marginBottom: semanticSpacing.lg,
    width: '100%',
  },
  errorTitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.fontWeights?.semibold || '600',
    color: colors.text.primary,
    marginBottom: semanticSpacing.sm,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: semanticSpacing.xs,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: semanticSpacing.xl,
    paddingVertical: semanticSpacing.md,
    borderRadius: semanticSpacing.radius.lg,
  },
  retryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.background.light,
  },
});
