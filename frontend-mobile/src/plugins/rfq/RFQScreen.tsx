import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRFQHooks } from './rfqHooks';
import { rfqStyles } from './rfqStyles';
import { RFQ, Quote } from './types';

/**
 * RFQ Screen Component
 * Main RFQ interface for creating and managing Request for Quotes
 * Aligns with backend /rfq endpoints
 */
interface RFQScreenProps {
  onBack?: () => void;
}

export const RFQScreen: React.FC<RFQScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    rfqs,
    quotes,
    loading,
    error,
    createRFQ,
    createQuote,
    refreshRFQs,
    refreshQuotes,
    searchRFQs,
  } = useRFQHooks();

  // Handle RFQ creation
  const handleCreateRFQ = async (rfqData: any) => {
    try {
      await createRFQ(rfqData);
      Alert.alert(t('common.done'), t('rfq.created', 'RFQ created successfully'));
      setShowCreateForm(false);
      refreshRFQs();
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('rfq.createFailed', 'Failed to create RFQ'));
    }
  };

  // Handle quote submission
  const handleSubmitQuote = async (quoteData: any) => {
    try {
      await createQuote(quoteData);
      Alert.alert(t('common.done'), t('rfq.quoteSubmitted', 'Quote submitted successfully'));
      refreshQuotes(selectedRFQ?.id || '');
    } catch (error) {
      Alert.alert(t('errors.error', 'Error'), t('rfq.quoteSubmitFailed', 'Failed to submit quote'));
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchRFQs(query);
  };

  // Render RFQ item
  const renderRFQ = ({ item }: { item: RFQ }) => (
    <TouchableOpacity
      style={[
        rfqStyles.rfqItem,
        selectedRFQ?.id === item.id && rfqStyles.rfqItemSelected
      ]}
      onPress={() => setSelectedRFQ(item)}
    >
      <View style={rfqStyles.rfqHeader}>
        <Text style={rfqStyles.rfqTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={rfqStyles.rfqStatus}>
          {item.status}
        </Text>
      </View>
      <Text style={rfqStyles.rfqDescription} numberOfLines={3}>
        {item.description}
      </Text>
      <View style={rfqStyles.rfqMeta}>
        <Text style={rfqStyles.rfqCategory}>{item.category}</Text>
        <Text style={rfqStyles.rfqBudget}>
          {t('rfq.budget', 'Budget')}: {item.budget ? item.budget.toLocaleString?.() : t('rfq.notSpecified', 'Not specified')}
        </Text>
      </View>
      <View style={rfqStyles.rfqFooter}>
        <Text style={rfqStyles.rfqDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={rfqStyles.rfqQuotes}>
          {t('rfq.quotesCount', '{{count}} quotes', { count: item.quoteCount || 0 })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render quote item
  const renderQuote = ({ item }: { item: Quote }) => (
    <View style={rfqStyles.quoteItem}>
      <View style={rfqStyles.quoteHeader}>
        <Text style={rfqStyles.quoteSeller}>{item.sellerName}</Text>
        <Text style={rfqStyles.quotePrice}>
          ${item.price?.toFixed(2) || 'Price on request'}
        </Text>
      </View>
      <Text style={rfqStyles.quoteDescription} numberOfLines={3}>
        {item.description}
      </Text>
      <View style={rfqStyles.quoteMeta}>
        <Text style={rfqStyles.quoteDelivery}>
          Delivery: {item.deliveryTime || 'Not specified'}
        </Text>
        <Text style={rfqStyles.quoteDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={rfqStyles.quoteActions}>
        <TouchableOpacity style={rfqStyles.quoteActionButton}>
          <Text style={rfqStyles.quoteActionText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rfqStyles.quoteActionButton, rfqStyles.acceptButton]}>
          <Text style={[rfqStyles.quoteActionText, rfqStyles.acceptButtonText]}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !rfqs.length) {
    return (
      <View style={rfqStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={rfqStyles.loadingText}>{t('rfq.loading', 'Loading RFQs...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={rfqStyles.errorContainer}>
        <Text style={rfqStyles.errorText}>{error || t('errors.unknownError')}</Text>
        <TouchableOpacity style={rfqStyles.retryButton} onPress={refreshRFQs}>
          <Text style={rfqStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={rfqStyles.container}>
      {/* Header */}
      <View style={rfqStyles.header}>
        <TouchableOpacity onPress={onBack} style={rfqStyles.backButton}>
          <Text style={rfqStyles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={rfqStyles.headerTitle}>{t('rfq.title', 'RFQ')}</Text>
        <TouchableOpacity 
          style={rfqStyles.createButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Text style={rfqStyles.createButtonText}>+ {t('rfq.create', 'Create')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={rfqStyles.searchContainer}>
        <TextInput
          style={rfqStyles.searchInput}
          placeholder={t('rfq.searchPlaceholder', 'Search RFQs...')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* RFQs List */}
      <View style={rfqStyles.rfqsSection}>
        <Text style={rfqStyles.sectionTitle}>{t('rfq.listTitle', 'Request for Quotes')}</Text>
        <FlatList
          data={rfqs}
          renderItem={renderRFQ}
          keyExtractor={(item) => item.id}
          style={rfqStyles.rfqsList}
          refreshing={loading}
          onRefresh={refreshRFQs}
          ListEmptyComponent={
            <View style={rfqStyles.emptyState}>
              <Text style={rfqStyles.emptyStateText}>
                {t('rfq.none', 'No RFQs found')}
              </Text>
              <TouchableOpacity 
                style={rfqStyles.emptyStateButton}
                onPress={() => setShowCreateForm(true)}
              >
                <Text style={rfqStyles.emptyStateButtonText}>{t('rfq.createRfq', 'Create RFQ')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Quotes Section */}
      {selectedRFQ && (
        <View style={rfqStyles.quotesSection}>
          <Text style={rfqStyles.sectionTitle}>
            {t('rfq.quotesFor', 'Quotes for "{{title}}"', { title: selectedRFQ.title })}
          </Text>
          <FlatList
            data={quotes}
            renderItem={renderQuote}
            keyExtractor={(item) => item.id}
            style={rfqStyles.quotesList}
            refreshing={loading}
            onRefresh={() => refreshQuotes(selectedRFQ.id)}
            ListEmptyComponent={
              <View style={rfqStyles.emptyState}>
                <Text style={rfqStyles.emptyStateText}>
                  {t('rfq.noQuotes', 'No quotes yet')}
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Create RFQ Modal */}
      {showCreateForm && (
        <View style={rfqStyles.modalOverlay}>
          <View style={rfqStyles.modalContent}>
            <Text style={rfqStyles.modalTitle}>{t('rfq.createNew', 'Create New RFQ')}</Text>
            <ScrollView style={rfqStyles.modalForm}>
              <TextInput
                style={rfqStyles.modalInput}
                placeholder={t('rfq.titlePlaceholder', 'RFQ Title')}
                multiline
              />
              <TextInput
                style={[rfqStyles.modalInput, rfqStyles.textArea]}
                placeholder={t('rfq.description', 'Description')}
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={rfqStyles.modalInput}
                placeholder={t('rfq.category', 'Category')}
              />
              <TextInput
                style={rfqStyles.modalInput}
                placeholder={t('rfq.budgetOptional', 'Budget (optional)')}
                keyboardType="numeric"
              />
              <TextInput
                style={rfqStyles.modalInput}
                placeholder={t('rfq.deliveryRequirements', 'Delivery Requirements')}
                multiline
              />
            </ScrollView>
            <View style={rfqStyles.modalButtons}>
              <TouchableOpacity
                style={[rfqStyles.modalButton, rfqStyles.modalButtonSecondary]}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={rfqStyles.modalButtonTextSecondary}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[rfqStyles.modalButton, rfqStyles.modalButtonPrimary]}
                onPress={() => {/* Handle create */}}
              >
                <Text style={rfqStyles.modalButtonTextPrimary}>{t('common.create', 'Create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RFQScreen;
