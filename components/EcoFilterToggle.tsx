import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface EcoFilterToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function EcoFilterToggle({ enabled, onToggle }: EcoFilterToggleProps) {
  return (
    <Pressable
      style={[styles.container, enabled && styles.containerActive]}
      onPress={() => onToggle(!enabled)}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel="Filter eco-friendly merchants"
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🌱</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.label, enabled && styles.labelActive]}>Eco-Friendly Only</Text>
          <Text style={[styles.description, enabled && styles.descriptionActive]}>
            Show merchants using sustainable packaging
          </Text>
        </View>
      </View>
      <View style={[styles.toggle, enabled && styles.toggleActive]}>
        <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  labelActive: {
    color: '#2E7D32',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  descriptionActive: {
    color: '#4CAF50',
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: '#CCC',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
