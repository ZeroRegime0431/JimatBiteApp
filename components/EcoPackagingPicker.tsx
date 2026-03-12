import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PackagingType } from '../types';

interface EcoPackagingPickerProps {
  value: boolean;
  packagingType?: PackagingType;
  onChangeValue: (usesEco: boolean, packagingType?: PackagingType) => void;
  label?: string;
}

const PACKAGING_OPTIONS: Array<{ value: PackagingType; label: string; icon: string }> = [
  { value: 'biodegradable', label: 'Biodegradable', icon: '🌿' },
  { value: 'compostable', label: 'Compostable', icon: '♻️' },
  { value: 'recyclable', label: 'Recyclable', icon: '🔄' },
  { value: 'reusable', label: 'Reusable', icon: '🔁' },
];

export default function EcoPackagingPicker({
  value,
  packagingType,
  onChangeValue,
  label = 'Uses Eco-Friendly Packaging',
}: EcoPackagingPickerProps) {
  const [showModal, setShowModal] = useState(false);

  const handleToggle = () => {
    if (!value) {
      // When enabling, show modal to select packaging type
      setShowModal(true);
    } else {
      // When disabling, just turn it off
      onChangeValue(false, undefined);
    }
  };

  const handleSelectPackaging = (type: PackagingType) => {
    onChangeValue(true, type);
    setShowModal(false);
  };

  const selectedOption = PACKAGING_OPTIONS.find((opt) => opt.value === packagingType);

  return (
    <View style={styles.container}>
      <Pressable style={styles.checkboxRow} onPress={handleToggle}>
        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
          {value && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {value && selectedOption && (
            <Text style={styles.sublabel}>
              {selectedOption.icon} {selectedOption.label}
            </Text>
          )}
        </View>
      </Pressable>

      {value && (
        <Pressable
          style={styles.changeButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.changeButtonText}>Change Type</Text>
        </Pressable>
      )}

      {/* Packaging Type Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Packaging Type</Text>
            <Text style={styles.modalSubtitle}>Choose your eco-friendly packaging</Text>

            <View style={styles.optionsContainer}>
              {PACKAGING_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    packagingType === option.value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectPackaging(option.value)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      packagingType === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  changeButton: {
    marginTop: 8,
    marginLeft: 36,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  optionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionLabelSelected: {
    color: '#2E7D32',
  },
  cancelButton: {
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
