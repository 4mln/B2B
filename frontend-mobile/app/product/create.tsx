import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useCreateProduct } from '@/features/products/hooks';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';

export default function CreateProductScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    location: '',
    specifications: '',
    images: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const createProduct = useCreateProduct();

  const categories = [
    'Construction Materials',
    'Electronics',
    'Textiles',
    'Food & Beverage',
    'Automotive',
    'Chemicals',
    'Machinery',
    'Other',
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    Alert.alert(
      'Add Image',
      'Choose an image source',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a product description');
      return;
    }

    if (!formData.price.trim()) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition as any,
        location: formData.location,
        images: formData.images,
        specifications: formData.specifications
          ? formData.specifications.split('\n').map((line) => {
              const [label, ...rest] = line.split(':');
              return { label: label?.trim() || '', value: rest.join(':').trim() };
            })
          : [],
      };
      await createProduct.mutateAsync(payload as any);
      Alert.alert(
        'Success',
        'Your product has been listed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      backgroundColor: isDark ? colors.background.dark : colors.background.light,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border.light : colors.border.light,
    },
    backButton: {
      padding: semanticSpacing.sm,
      marginRight: semanticSpacing.sm,
    },
    headerTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: semanticSpacing.md,
    },
    form: {
      paddingVertical: semanticSpacing.lg,
    },
    section: {
      marginBottom: semanticSpacing.xl,
    },
    sectionTitle: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.h4.fontWeight,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.md,
    },
    inputContainer: {
      marginBottom: semanticSpacing.lg,
    },
    label: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginBottom: semanticSpacing.sm,
    },
    required: {
      color: colors.error[500],
    },
    textInput: {
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      borderRadius: semanticSpacing.radius.lg,
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.md,
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: semanticSpacing.sm,
    },
    categoryButton: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.sm,
      borderRadius: semanticSpacing.radius.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
    },
    categoryButtonSelected: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    categoryButtonText: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    categoryButtonTextSelected: {
      color: colors.background.light,
    },
    conditionContainer: {
      flexDirection: 'row',
      gap: semanticSpacing.sm,
    },
    conditionButton: {
      flex: 1,
      paddingVertical: semanticSpacing.md,
      borderRadius: semanticSpacing.radius.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
      alignItems: 'center',
    },
    conditionButtonSelected: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    conditionButtonText: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
    },
    conditionButtonTextSelected: {
      color: colors.background.light,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: semanticSpacing.sm,
    },
    imageItem: {
      width: 80,
      height: 80,
      borderRadius: semanticSpacing.radius.md,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
    },
    addImageButton: {
      width: 80,
      height: 80,
      borderRadius: semanticSpacing.radius.md,
      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
      borderWidth: 2,
      borderColor: isDark ? colors.border.light : colors.border.light,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButton: {
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.lg,
      paddingVertical: semanticSpacing.md,
      alignItems: 'center',
      marginTop: semanticSpacing.lg,
    },
    submitButtonDisabled: {
      backgroundColor: colors.gray[300],
    },
    submitButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
    },
    helpText: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginTop: semanticSpacing.xs,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? colors.gray[400] : colors.gray[600]} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('product.listProduct', 'List Product')}</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('product.basicInfo', 'Basic Information')}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {t('product.name', 'Product Name')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('product.enterName', 'Enter product name')}
                  placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {t('product.description')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={t('product.describeProduct', 'Describe your product')}
                  placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  multiline
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {t('product.price')} ({t('product.currency', 'Toman')}) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('product.enterPrice', 'Enter price')}
                  placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {t('product.category', 'Category')} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        formData.category === category && styles.categoryButtonSelected,
                      ]}
                      onPress={() => handleInputChange('category', category)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.categoryButtonTextSelected,
                      ]}>
                        {t(`categories.${category}`, category)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('product.condition', 'Condition')}</Text>
                <View style={styles.conditionContainer}>
                  {conditions.map((condition) => (
                    <TouchableOpacity
                      key={condition.value}
                      style={[
                        styles.conditionButton,
                        formData.condition === condition.value && styles.conditionButtonSelected,
                      ]}
                      onPress={() => handleInputChange('condition', condition.value)}
                    >
                      <Text style={[
                        styles.conditionButtonText,
                        formData.condition === condition.value && styles.conditionButtonTextSelected,
                      ]}>
                        {t(`product.condition_${condition.value}`, condition.label)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Images */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('product.images', 'Product Images')}</Text>
              
              <View style={styles.imagesContainer}>
                {formData.images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.imageItem} />
                ))}
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Ionicons 
                    name="camera" 
                    size={24} 
                    color={isDark ? colors.gray[400] : colors.gray[500]} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>
                {t('product.imagesHelp', 'Add up to 10 images. First image will be used as the main photo.')}
              </Text>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('product.additionalInfo', 'Additional Information')}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('product.location', 'Location')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('product.locationPlaceholder', 'e.g., Tehran, Iran')}
                  placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('product.technicalSpecifications', 'Technical Specifications')}</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={t('product.specificationsPlaceholder', 'Any technical details or specifications')}
                  placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                  value={formData.specifications}
                  onChangeText={(value) => handleInputChange('specifications', value)}
                  multiline
                />
                <Text style={styles.helpText}>
                  {t('product.specificationsHelp', 'Include dimensions, materials, certifications, or other technical details')}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? t('product.creating', 'Creating Product...') : t('product.listProduct', 'List Product')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
