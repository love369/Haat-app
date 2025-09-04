import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ApiError } from '../services/apiService';

interface ApiResponseHandlerProps<T> {
  loading: boolean;
  error: ApiError | null;
  data: T | null;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: ApiError, onRetry?: () => void) => ReactNode;
  emptyComponent?: ReactNode;
}

export const ApiResponseHandler = <T,>({
  loading,
  error,
  data,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: ApiResponseHandlerProps<T>) => {
  // Show loading state
  if (loading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return errorComponent ? (
      <>{errorComponent(error, onRetry)}</>
    ) : (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Show empty state if data is empty array or null/undefined
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent ? (
      <>{emptyComponent}</>
    ) : (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Render the children with data
  return <>{children(data)}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});