import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { EcoBadge as EcoBadgeType, EcoPackagingStats, PackagingType } from '../types';
import EcoBadge, { ECO_BADGES } from './EcoBadge';

interface EcoDashboardProps {
  ecoStats?: EcoPackagingStats;
}

const { width } = Dimensions.get('window');

// Packaging type labels
const PACKAGING_TYPE_LABELS: Record<PackagingType, string> = {
  biodegradable: 'Biodegradable',
  compostable: 'Compostable',
  recyclable: 'Recyclable',
  reusable: 'Reusable Containers',
};

// Packaging type colors
const PACKAGING_TYPE_COLORS: Record<PackagingType, string> = {
  biodegradable: '#8BC34A',
  compostable: '#CDDC39',
  recyclable: '#03A9F4',
  reusable: '#9C27B0',
};

// Calculate next badge progress
function getNextBadge(ecoOrders: number): { badge: EcoBadgeType; progress: number } | null {
  const badges: EcoBadgeType[] = ['green-starter', 'eco-champion', 'sustainability-hero'];
  
  for (const badge of badges) {
    const required = ECO_BADGES[badge].requiredOrders;
    if (ecoOrders < required) {
      return {
        badge,
        progress: (ecoOrders / required) * 100,
      };
    }
  }
  return null;
}

// Calculate environmental impact
function calculateImpact(ecoOrders: number) {
  const plasticSavedKg = Math.round(ecoOrders * 0.05); // Assume 50g plastic per order
  const treesEquivalent = Math.round(plasticSavedKg / 20); // Rough estimate
  return { plasticSavedKg, treesEquivalent };
}

export default function EcoDashboard({ ecoStats }: EcoDashboardProps) {
  if (!ecoStats) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Start Your Eco Journey</Text>
          <Text style={styles.emptyDescription}>
            Mark your orders as eco-packaged to earn points and badges!
          </Text>
        </View>
      </View>
    );
  }

  const { ecoOrders, ecoPercentage, points, badges, packagingTypes } = ecoStats;
  const nextBadge = getNextBadge(ecoOrders);
  const impact = calculateImpact(ecoOrders);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{ecoOrders}</Text>
          <Text style={styles.statLabel}>Eco Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{ecoPercentage}%</Text>
          <Text style={styles.statLabel}>Eco Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Earned Badges */}
      {badges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Your Badges</Text>
          <View style={styles.badgesContainer}>
            {badges.map((badge) => (
              <EcoBadge key={badge} badge={badge} size="medium" showName={true} />
            ))}
          </View>
        </View>
      )}

      {/* Next Badge Progress */}
      {nextBadge && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Next Badge</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressBadgeName}>
                {ECO_BADGES[nextBadge.badge].icon} {ECO_BADGES[nextBadge.badge].name}
              </Text>
              <Text style={styles.progressOrders}>
                {ecoOrders} / {ECO_BADGES[nextBadge.badge].requiredOrders} orders
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${nextBadge.progress}%`,
                    backgroundColor: ECO_BADGES[nextBadge.badge].color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressRemaining}>
              {ECO_BADGES[nextBadge.badge].requiredOrders - ecoOrders} more orders to unlock!
            </Text>
          </View>
        </View>
      )}

      {/* Environmental Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Your Impact</Text>
        <View style={styles.impactCard}>
          <View style={styles.impactRow}>
            <Text style={styles.impactIcon}>♻️</Text>
            <View>
              <Text style={styles.impactValue}>{impact.plasticSavedKg} kg</Text>
              <Text style={styles.impactLabel}>Plastic waste saved</Text>
            </View>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactIcon}>🌳</Text>
            <View>
              <Text style={styles.impactValue}>{impact.treesEquivalent} trees</Text>
              <Text style={styles.impactLabel}>Environmental equivalent</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Packaging Types Used */}
      {packagingTypes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Packaging Types</Text>
          <View style={styles.packagingGrid}>
            {packagingTypes.map((type) => (
              <View
                key={type}
                style={[
                  styles.packagingChip,
                  { backgroundColor: PACKAGING_TYPE_COLORS[type] + '20' },
                ]}
              >
                <View
                  style={[
                    styles.packagingDot,
                    { backgroundColor: PACKAGING_TYPE_COLORS[type] },
                  ]}
                />
                <Text style={styles.packagingLabel}>{PACKAGING_TYPE_LABELS[type]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Leaderboard Teaser */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <Text style={styles.sectionTitle}>🥇 Leaderboard</Text>
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardText}>
            Keep going! Top eco-friendly merchants get featured placement in the app.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  badgesContainer: {
    gap: 12,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBadgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressOrders: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressRemaining: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  impactIcon: {
    fontSize: 40,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
  },
  packagingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  packagingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  packagingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  packagingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  leaderboardText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
