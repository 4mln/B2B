import { CreateStoreRequest, UpdateStoreRequest } from '@/features/stores/types';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, View as Box, TextInput as Input, Pressable, ScrollView } from 'react-native';
import { XStack as HStack, Text, YStack as VStack } from 'tamagui';

interface StoreFormProps {
  initialData?: Partial<CreateStoreRequest & UpdateStoreRequest>;
  onSubmit: (data: CreateStoreRequest | UpdateStoreRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    subscription_type: initialData?.subscription_type || 'free' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Store address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save store');
    }
  };

  return (
    <Box flex={1} backgroundColor="$backgroundLight0">
      <ScrollView flex={1} padding={16} showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          <VStack space="sm">
            <Text fontSize="$md" fontWeight="$semibold" color="$textLight900">
              Store Name *
            </Text>
            <Input
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              placeholder="Enter store name"
              isDisabled={isLoading}
              isInvalid={!!errors.name}
            />
            {errors.name && (
              <Text fontSize="$sm" color="$error500" marginTop={4}>
                {errors.name}
              </Text>
            )}
          </VStack>

          <VStack space="sm">
            <Text fontSize="$md" fontWeight="$semibold" color="$textLight900">
              Store Address *
            </Text>
            <Input
              value={formData.address}
              onChangeText={(text) => {
                setFormData({ ...formData, address: text });
                if (errors.address) {
                  setErrors({ ...errors, address: '' });
                }
              }}
              placeholder="Enter store address"
              editable={!isLoading}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            {errors.address && (
              <Text fontSize="$sm" color="$error500" marginTop={4}>
                {errors.address}
              </Text>
            )}
          </VStack>

          <VStack space="sm">
            <Text fontSize="$md" fontWeight="$semibold" color="$textLight900">
              Subscription Type
            </Text>
            <Picker
              selectedValue={formData.subscription_type}
              onValueChange={(value) => setFormData({ ...formData, subscription_type: value as any })}
              enabled={!isLoading}
            >
              {(['free', 'silver', 'gold'] as const).map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </VStack>
        </VStack>
      </ScrollView>

      <HStack space="md" padding={16} borderTopWidth={1} borderTopColor="$borderLight200">
        <Pressable
          flex={1}
          backgroundColor="$backgroundLight100"
          borderWidth={1}
          borderColor="$borderLight200"
          paddingVertical={12}
          borderRadius="$md"
          alignItems="center"
          onPress={onCancel}
          isDisabled={isLoading}
        >
          <Text fontSize="$md" fontWeight="$semibold" color="$textLight900">
            Cancel
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          backgroundColor="$primary500"
          paddingVertical={12}
          borderRadius="$md"
          alignItems="center"
          onPress={handleSubmit}
          isDisabled={isLoading}
          opacity={isLoading ? 0.6 : 1}
        >
          <Text fontSize="$md" fontWeight="$semibold" color="$white">
            {isLoading ? 'Saving...' : isEdit ? 'Update Store' : 'Create Store'}
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
};
