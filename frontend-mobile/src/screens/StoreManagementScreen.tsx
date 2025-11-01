import { StoreCard } from '@/components/StoreCard';
import { StoreForm } from '@/components/StoreForm';
import { useStoreCapabilities, useStores } from '@/features/stores/hooks';
import { Store } from '@/features/stores/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View as Box, FlatList, Pressable, RefreshControl } from 'react-native';
import { XStack as HStack, Text, YStack as VStack } from 'tamagui';

export const StoreManagementScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    stores,
    isLoading,
    error,
    canManageStores,
    fetchStores,
    createStore,
    updateStore,
    toggleStoreStatus,
    clearError,
  } = useStores();
  const { user } = useStoreCapabilities();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (canManageStores) {
      fetchStores();
    }
  }, [canManageStores]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  const handleCreateStore = async (data: any) => {
    try {
      await createStore(data);
      setShowCreateForm(false);
      Alert.alert(t('messageBox.success', 'Success'), t('stores.storeCreated', 'Store created successfully'));
    } catch (error) {
      Alert.alert(t('messageBox.error', 'Error'), t('stores.createFailed', 'Failed to create store'));
    }
  };

  const handleUpdateStore = async (data: any) => {
    if (!editingStore) return;

    try {
      await updateStore(editingStore.id, data);
      setEditingStore(null);
      Alert.alert(t('messageBox.success', 'Success'), t('stores.storeUpdated', 'Store updated successfully'));
    } catch (error) {
      Alert.alert(t('messageBox.error', 'Error'), t('stores.updateFailed', 'Failed to update store'));
    }
  };

  const handleToggleStatus = async (store: Store, isActive: boolean) => {
    try {
      await toggleStoreStatus(store.id, isActive);
      Alert.alert(
        t('messageBox.success', 'Success'),
        isActive ? t('stores.storeActivated', 'Store activated successfully') : t('stores.storeDeactivated', 'Store deactivated successfully')
      );
    } catch (error) {
      Alert.alert(t('messageBox.error', 'Error'), t('stores.statusUpdateFailed', 'Failed to update store status'));
    }
  };

  const handleStorePress = (store: Store) => {
    // Navigate to store details
    console.log('Navigate to store:', store.id);
  };

  if (!canManageStores) {
    return (
      <Box flex={1} backgroundColor="$backgroundLight0">
        <VStack flex={1} justifyContent="center" alignItems="center" padding={32}>
          <Text fontSize={24} fontWeight="$bold" color="$textLight900" marginBottom={8}>
            {t('stores.storeManagement', 'Store Management')}
          </Text>
          <Text fontSize={16} color="$textLight600" textAlign="center">
            {t('stores.noPermission', "You don't have permission to manage stores.")}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (showCreateForm) {
    return (
      <StoreForm
        onSubmit={handleCreateStore}
        onCancel={() => setShowCreateForm(false)}
        isLoading={isLoading}
      />
    );
  }

  if (editingStore) {
    return (
      <StoreForm
        initialData={editingStore}
        onSubmit={handleUpdateStore}
        onCancel={() => setEditingStore(null)}
        isLoading={isLoading}
        isEdit
      />
    );
  }

  return (
    <Box flex={1} backgroundColor="$backgroundLight0">
      <HStack justifyContent="space-between" alignItems="center" padding={16} borderBottomWidth={1} borderBottomColor="$borderLight200">
        <Text fontSize={24} fontWeight="$bold" color="$textLight900">
          {t('stores.myStores', 'My Stores')}
        </Text>
        <Pressable
          backgroundColor="$primary500"
          paddingHorizontal={16}
          paddingVertical={8}
          borderRadius="$md"
          onPress={() => setShowCreateForm(true)}
        >
          <Text color="$white" fontWeight="$semibold">
            {t('stores.createStore', 'Create Store')}
          </Text>
        </Pressable>
      </HStack>

      <Box flex={1}>
        {error && (
          <Box padding={16} backgroundColor="$error50" margin={16} borderRadius="$md">
            <Text color="$error500" textAlign="center" marginBottom={8}>
              {error}
            </Text>
            <Pressable
              backgroundColor="$error500"
              paddingHorizontal={16}
              paddingVertical={8}
              borderRadius="$md"
              alignSelf="center"
              onPress={() => {
                clearError();
                fetchStores();
              }}
            >
              <Text color="$white" fontWeight="$semibold">
                {t('common.retry', 'Retry')}
              </Text>
            </Pressable>
          </Box>
        )}

        {stores.length === 0 && !isLoading && !error ? (
          <VStack flex={1} justifyContent="center" alignItems="center" padding={32}>
            <Text fontSize={20} fontWeight="$bold" color="$textLight900" marginBottom={8}>
              {t('stores.noStores', 'No Stores Yet')}
            </Text>
            <Text fontSize={16} color="$textLight600" textAlign="center" marginBottom={24}>
              {t('stores.createFirstStore', 'Create your first store to start selling products')}
            </Text>
            <Pressable
              backgroundColor="$primary500"
              paddingHorizontal={16}
              paddingVertical={12}
              borderRadius="$md"
              onPress={() => setShowCreateForm(true)}
            >
              <Text color="$white" fontWeight="$semibold">
                {t('stores.createStore', 'Create Store')}
              </Text>
            </Pressable>
          </VStack>
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StoreCard
                store={item}
                onPress={handleStorePress}
                onToggleStatus={handleToggleStatus}
                showActions
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#3b82f6']}
                tintColor="#3b82f6"
              />
            }
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </Box>
    </Box>
  );
};
