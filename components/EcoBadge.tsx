import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EcoBadgeInfo, EcoBadge as EcoBadgeType } from '../types';

interface EcoBadgeProps {
  badge?: EcoBadgeType;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

// Badge configurations
export const ECO_BADGES: Record<EcoBadgeType, EcoBadgeInfo> = {
  'green-starter': {
    id: 'green-starter',
    name: 'Green Starter',
    icon: '🌱',
    description: 'Started eco-friendly journey',
    requiredOrders: 25,
    color: '#90EE90',
  },
  'eco-champion': {
    id: 'eco-champion',
    name: 'Eco Champion',
    icon: '🌿',
    description: 'Committed to sustainability',
    requiredOrders: 100,
    color: '#4CAF50',
  },
  'sustainability-hero': {
    id: 'sustainability-hero',
    name: 'Sustainability Hero',
    icon: '🏆',
    description: 'Leading the green revolution',
    requiredOrders: 500,
    color: '#2E7D32',
  },
};

export default function EcoBadge({ badge, size = 'medium', showName = true }: EcoBadgeProps) {
  if (!badge) {
    return null;
  }

  const badgeInfo = ECO_BADGES[badge];
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 32 : 48;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;

  return (
    <View style={[styles.container, { backgroundColor: badgeInfo.color + '20' }]}>
      <Text style={[styles.icon, { fontSize: iconSize }]}>{badgeInfo.icon}</Text>
      {showName && (
        <View style={styles.textContainer}>
          <Text style={[styles.badgeName, { fontSize }]}>{badgeInfo.name}</Text>
          {size !== 'small' && (
            <Text style={[styles.description, { fontSize: fontSize - 2 }]}>
              {badgeInfo.description}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  icon: {
    lineHeight: 32,
  },
  textContainer: {
    flex: 1,
  },
  badgeName: {
    fontWeight: '700',
    color: '#1B5E20',
  },
  description: {
    color: '#2E7D32',
    marginTop: 2,
  },
});
