import { builder } from '@builder.io/sdk';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { View as Box, I18nManager, Image, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { H1 as Heading, XStack as HStack, Spinner, Text, YStack as VStack } from 'tamagui';

type BuilderSectionProps = {
  model: string;
  entry?: string;
  options?: Record<string, unknown>;
  onAction?: (action: { type: string; data?: any }) => void;
};

// Basic mapping to NativeBase for a subset of common content blocks
function renderBlock(block: any, onAction?: BuilderSectionProps['onAction']) {
  const key = block.id || Math.random().toString();
  switch (block.component?.name) {
    case 'Text':
      return (
        <Text key={key} fontSize="$md">
          {block.options?.text || ''}
        </Text>
      );
    case 'Heading':
      return (
        <Heading key={key} size="lg">
          {block.options?.text || ''}
        </Heading>
      );
    case 'Button':
      return (
        <Pressable key={key} onPress={() => onAction?.({ type: 'button', data: block.options })}>
          {({ isPressed }) => (
            <HStack
              paddingHorizontal={16}
              paddingVertical={12}
              backgroundColor="$primary500"
              borderRadius="$md"
              alignItems="center"
              space={8}
              opacity={isPressed ? 0.8 : 1}
            >
              <Icon as={Ionicons} name="pricetag" color="$white" size="sm" />
              <Text color="$white" fontWeight="$medium">
                {block.options?.text || 'Action'}
              </Text>
            </HStack>
          )}
        </Pressable>
      );
    case 'Image':
      return (
        <Image
          key={key}
          alt={block.options?.altText || 'image'}
          source={{ uri: block.options?.image || block.options?.src }}
          width="100%"
          height={block.options?.height || 160}
          borderRadius="$lg"
        />
      );
    case 'IconRow':
      return (
        <HStack key={key} space={16} alignItems="center">
          {(block.options?.items || []).map((it: any, idx: number) => (
            <HStack key={`${key}-${idx}`} space={8} alignItems="center">
              <Icon as={Ionicons} name={it.icon || 'star'} size="sm" color="$primary500" />
              <Text>{it.label}</Text>
            </HStack>
          ))}
        </HStack>
      );
    default:
      return null;
  }
}

export const BuilderSection: React.FC<BuilderSectionProps> = ({ model, entry, options, onAction }) => {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchContent = async () => {
      try {
        const data = await builder.get(model, { entry, options }).toPromise();
        if (mounted) setContent(data);
      } catch (e) {
        if (mounted) setContent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchContent();
    return () => {
      mounted = false;
    };
  }, [model, entry]);

  const blocks = useMemo(() => content?.data?.blocks || [], [content]);

  if (loading) {
    return (
      <HStack alignItems="center" space={8} paddingVertical={12} justifyContent="center">
        <Spinner accessibilityLabel="Loading content" />
        <Text>Loading...</Text>
      </HStack>
    );
  }

  if (!content || blocks.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Box width="100%" paddingHorizontal={16} paddingVertical={12}>
        <VStack space={12}>
          {blocks.map((b: any) => renderBlock(b, onAction))}
        </VStack>
      </Box>
    </Animated.View>
  );
};

export default BuilderSection;



