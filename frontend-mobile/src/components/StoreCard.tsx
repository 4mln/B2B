import { Store } from '@/features/stores/types';
import React from 'react';
import { View as Box, Image, Pressable } from 'react-native';
import { XStack as HStack, Text, YStack as VStack } from 'tamagui';

interface StoreCardProps {
  store: Store;
  onPress?: (store: Store) => void;
  onToggleStatus?: (store: Store, isActive: boolean) => void;
  showActions?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onPress,
  onToggleStatus,
  showActions = false,
}) => {
  return (
    <Pressable
      onPress={() => onPress?.(store)}
      backgroundColor="$backgroundLight0"
      borderRadius="$lg"
      padding={16}
      marginVertical={8}
      marginHorizontal={16}
      softShadow="2"
    >
      <HStack space="md" alignItems="center" marginBottom={12}>
        <Box
          width={60}
          height={60}
          borderRadius="$md"
          backgroundColor="$backgroundLight100"
          marginRight={12}
          overflow="hidden"
        >
          {store.banner ? (
            <Image 
              source={{ uri: store.banner }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Box width="100%" height="100%" backgroundColor="$backgroundLight200" />
          )}
        </Box>
        <VStack flex={1} space="xs">
          <Text fontSize="$lg" fontWeight="$bold" color="$textLight900">
            {store.name}
          </Text>
          <Text fontSize="$sm" color="$textLight600" numberOfLines={2}>
            {store.address}
          </Text>
          <Text 
            fontSize="$xs" 
            color="$primary500" 
            fontWeight="$semibold" 
            textTransform="uppercase"
          >
            {store.subscription_type}
          </Text>
        </VStack>
      </HStack>

      <HStack space="sm" alignItems="center" marginTop={8}>
        <Box
          width={8}
          height={8}
          borderRadius="$full"
          backgroundColor={store.is_active ? '$success500' : '$error500'}
        />
        <Text fontSize="$xs" color="$textLight600">
          {store.is_active ? 'Active' : 'Inactive'}
        </Text>
        {store.rating && (
          <HStack space="xs" alignItems="center" marginLeft={8}>
            <Text fontSize="$xs" color="$textLight600">
              ⭐ {store.rating.toFixed(1)}
            </Text>
          </HStack>
        )}
      </HStack>

      {showActions && onToggleStatus && (
        <HStack justifyContent="space-between" marginTop={12}>
          <Pressable
            backgroundColor={store.is_active ? '$backgroundLight100' : '$primary500'}
            paddingHorizontal={16}
            paddingVertical={8}
            borderRadius="$md"
            minWidth={80}
            alignItems="center"
            borderWidth={store.is_active ? 1 : 0}
            borderColor={store.is_active ? '$borderLight200' : 'transparent'}
            onPress={() => onToggleStatus(store, !store.is_active)}
          >
            <Text
              fontSize="$sm"
              fontWeight="$semibold"
              color={store.is_active ? '$textLight900' : '$white'}
            >
              {store.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </Pressable>
        </HStack>
      )}
    </Pressable>
  );
};
