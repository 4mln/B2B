import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateRFQ } from '@/features/rfq/hooks';
import { Attachment } from '@/features/rfq/types';
import { colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';
import { fontWeights, typography } from '@/theme/typography';

export default function CreateRFQScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    deliveryDate: '',
    location: '',
    specifications: '',
  });
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [permissionStatus, setPermissionStatus] = useState<ImagePicker.PermissionStatus>();

  const [isLoading, setIsLoading] = useState(false);
  const createRFQ = useCreateRFQ();

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your RFQ');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const pickImage = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        type: 'image',
        url: asset.uri,
        name: asset.fileName || `image-${Date.now()}.jpg`,
        size: asset.fileSize || 0,
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createRFQ.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        quantity: formData.quantity,
        budget: formData.budget,
        deliveryDate: formData.deliveryDate,
        location: formData.location,
        specifications: formData.specifications,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      Alert.alert(
        'Success',
        'Your RFQ has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create RFQ. Please try again.');
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
    // Step indicator styles
    stepIndicator: {
      paddingHorizontal: semanticSpacing.md,
      paddingVertical: semanticSpacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.gray[800] : colors.gray[200],
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: semanticSpacing.md,
    },
    stepItem: {
      alignItems: 'center',
      flex: 1,
    },
    stepCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: semanticSpacing.xs,
    },
    stepCircleActive: {
      backgroundColor: colors.primary[500],
    },
    stepCircleCompleted: {
      backgroundColor: colors.success[500],
    },
    stepCircleInactive: {
      backgroundColor: isDark ? colors.gray[700] : colors.gray[300],
    },
    stepNumber: {
      color: colors.white,
      fontSize: typography.label.fontSize,
      fontWeight: fontWeights.semibold,
    },
    stepLabel: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.gray[400] : colors.gray[600],
      textAlign: 'center',
    },
    stepLabelActive: {
      color: isDark ? colors.primary[400] : colors.primary[600],
      fontWeight: fontWeights.semibold,
    },
    stepConnector: {
      height: 2,
      flex: 1,
      backgroundColor: isDark ? colors.gray[700] : colors.gray[300],
      marginHorizontal: semanticSpacing.xs,
    },
    stepConnectorCompleted: {
      backgroundColor: colors.success[500],
    },
    stepLine: {
      height: 4,
      backgroundColor: isDark ? colors.gray[700] : colors.gray[300],
      borderRadius: 2,
      marginBottom: semanticSpacing.sm,
      overflow: 'hidden',
    },
    stepLineInner: {
      height: '100%',
      backgroundColor: colors.primary[500],
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
    // Attachment styles
    attachmentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      borderStyle: 'dashed',
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.md,
      gap: semanticSpacing.sm,
    },
    attachmentButtonText: {
      color: isDark ? colors.text.primary : colors.text.primary,
      fontSize: typography.body.fontSize,
    },
    attachmentsList: {
      marginTop: semanticSpacing.md,
      gap: semanticSpacing.sm,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
      borderRadius: semanticSpacing.radius.lg,
      padding: semanticSpacing.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
    },
    attachmentImage: {
      width: 50,
      height: 50,
      borderRadius: 4,
      marginRight: semanticSpacing.sm,
    },
    attachmentInfo: {
      flex: 1,
    },
    attachmentName: {
      fontSize: typography.body.fontSize,
      color: isDark ? colors.text.primary : colors.text.primary,
      fontWeight: fontWeights.medium,
    },
    attachmentSize: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
    },
    removeAttachmentButton: {
      padding: semanticSpacing.xs,
    },
    emptyAttachments: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: semanticSpacing.lg,
      backgroundColor: isDark ? colors.gray[800] : colors.background.light,
      borderRadius: semanticSpacing.radius.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border.light : colors.border.light,
      marginTop: semanticSpacing.sm,
    },
    emptyAttachmentsText: {
      fontSize: typography.body.fontSize,
      fontWeight: fontWeights.medium,
      color: isDark ? colors.text.primary : colors.text.primary,
      marginTop: semanticSpacing.sm,
    },
    emptyAttachmentsSubtext: {
      fontSize: typography.bodySmall.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      textAlign: 'center',
      marginTop: semanticSpacing.xs,
    },
    // Navigation buttons
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: semanticSpacing.lg,
    },
    navigationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: semanticSpacing.sm,
      paddingHorizontal: semanticSpacing.md,
      borderRadius: semanticSpacing.radius.lg,
      minWidth: 100,
    },
    nextButton: {
      backgroundColor: colors.primary[500],
      marginLeft: 'auto',
    },
    nextButtonText: {
      color: colors.background.light,
      marginRight: semanticSpacing.xs,
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
    },
    submitButton: {
      backgroundColor: colors.primary[500],
      borderRadius: semanticSpacing.radius.lg,
      paddingVertical: semanticSpacing.md,
      alignItems: 'center',
      marginTop: semanticSpacing.lg,
      marginLeft: 'auto',
    },
    submitButtonDisabled: {
      backgroundColor: colors.gray[300],
    },
    submitButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      color: colors.background.light,
      marginRight: semanticSpacing.xs,
    },
    helpText: {
      fontSize: typography.caption.fontSize,
      color: isDark ? colors.text.secondary : colors.text.secondary,
      marginTop: semanticSpacing.xs,
    },
  });

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        <View style={styles.stepLine}>
          <View style={[styles.stepLineInner, { width: `${(currentStep - 1) * 50}%` }]} />
        </View>
        <View style={styles.stepsContainer}>
          <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
            <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>1</Text>
          </View>
          <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
            <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>2</Text>
          </View>
          <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
            <Text style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}>3</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>{t('rfq.basicInfo', 'Basic Info')}</Text>
          <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>{t('rfq.requirements', 'Requirements')}</Text>
          <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>{t('rfq.attachments', 'Attachments')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? colors.gray[400] : colors.gray[600]} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rfq.createRfq', 'Create RFQ')}</Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep === 1 ? styles.stepCircleActive : 
            currentStep > 1 ? styles.stepCircleCompleted : 
            styles.stepCircleInactive
          ]}>
            {currentStep > 1 ? (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : (
              <Text style={styles.stepNumber}>1</Text>
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep === 1 && styles.stepLabelActive
          ]}>{t('rfq.stepBasic', 'Basic Info')}</Text>
        </View>
        
        {/* Connector 1-2 */}
        <View style={[
          styles.stepConnector,
          currentStep > 1 && styles.stepConnectorCompleted
        ]} />
        
        {/* Step 2 */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep === 2 ? styles.stepCircleActive : 
            currentStep > 2 ? styles.stepCircleCompleted : 
            styles.stepCircleInactive
          ]}>
            {currentStep > 2 ? (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : (
              <Text style={styles.stepNumber}>2</Text>
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep === 2 && styles.stepLabelActive
          ]}>{t('rfq.stepDetails', 'Details')}</Text>
        </View>
        
        {/* Connector 2-3 */}
        <View style={[
          styles.stepConnector,
          currentStep > 2 && styles.stepConnectorCompleted
        ]} />
        
        {/* Step 3 */}
        <View style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep === 3 ? styles.stepCircleActive : 
            styles.stepCircleInactive
          ]}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep === 3 && styles.stepLabelActive
          ]}>{t('rfq.stepAttachments', 'Attachments')}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('rfq.basicInformation', 'Basic Information')}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('rfq.title', 'Title')} <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('rfq.enterRfqTitle', 'Enter RFQ title')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.title}
                    onChangeText={(value) => handleInputChange('title', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('rfq.description', 'Description')} <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder={t('rfq.describeWhatYoureLookingFor', "Describe what you're looking for")}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                    multiline
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('rfq.category', 'Category')} <Text style={styles.required}>*</Text>
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
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('rfq.requirements', 'Requirements')}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('rfq.quantity', 'Quantity')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('rfq.quantityPlaceholder', 'e.g., 100 units, 50 kg')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.quantity}
                    onChangeText={(value) => handleInputChange('quantity', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('rfq.budgetRange', 'Budget Range')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('rfq.budgetPlaceholder', 'e.g., 1,000,000 - 2,000,000 Toman')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.budget}
                    onChangeText={(value) => handleInputChange('budget', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('rfq.deliveryDate', 'Delivery Date')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('rfq.deliveryDatePlaceholder', 'e.g., Within 2 weeks')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.deliveryDate}
                    onChangeText={(value) => handleInputChange('deliveryDate', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('rfq.location', 'Location')}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('rfq.locationPlaceholder', 'e.g., Tehran, Iran')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('rfq.technicalSpecifications', 'Technical Specifications')}</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder={t('rfq.specificationsPlaceholder', 'Any specific technical requirements or specifications')}
                    placeholderTextColor={isDark ? colors.gray[400] : colors.gray[500]}
                    value={formData.specifications}
                    onChangeText={(value) => handleInputChange('specifications', value)}
                    multiline
                  />
                  <Text style={styles.helpText}>
                    {t('rfq.specificationsHelp', 'Include any technical details, certifications, or quality standards required')}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Step 3: Attachments */}
            {currentStep === 3 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('rfq.attachments', 'Attachments')}</Text>
                
                <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color={isDark ? colors.gray[400] : colors.gray[600]} />
                  <Text style={styles.attachmentButtonText}>{t('rfq.addImages', 'Add Images')}</Text>
                </TouchableOpacity>
                
                {attachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {attachments.map((attachment) => (
                      <View key={attachment.id} style={styles.attachmentItem}>
                        {attachment.type === 'image' && (
                          <Image source={{ uri: attachment.url }} style={styles.attachmentImage} />
                        )}
                        <View style={styles.attachmentInfo}>
                          <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
                          <Text style={styles.attachmentSize}>
                            {(attachment.size / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.removeAttachmentButton} 
                          onPress={() => removeAttachment(attachment.id)}
                        >
                          <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                {attachments.length === 0 && (
                  <View style={styles.emptyAttachments}>
                    <Ionicons name="images-outline" size={48} color={isDark ? colors.gray[400] : colors.gray[500]} />
                    <Text style={styles.emptyAttachmentsText}>
                      {t('rfq.noAttachments', 'No attachments added yet')}
                    </Text>
                    <Text style={styles.emptyAttachmentsSubtext}>
                      {t('rfq.addAttachmentsHelp', 'Add images to help suppliers understand your requirements better')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={[styles.navigationButton, styles.backButton]}
                  onPress={handlePreviousStep}
                >
                  <Ionicons name="arrow-back" size={20} color={isDark ? colors.gray[400] : colors.gray[600]} />
                  <Text style={styles.backButtonText}>{t('common.back', 'Back')}</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 3 && (
                <TouchableOpacity
                  style={[styles.navigationButton, styles.nextButton]}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextButtonText}>{t('common.next', 'Next')}</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.background.light} />
                </TouchableOpacity>
              )}
              
              {currentStep === 3 && (
                <TouchableOpacity
                  style={[
                    styles.navigationButton,
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.background.light} />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>{t('rfq.createRfq', 'Create RFQ')}</Text>
                      <Ionicons name="checkmark" size={20} color={colors.background.light} />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
