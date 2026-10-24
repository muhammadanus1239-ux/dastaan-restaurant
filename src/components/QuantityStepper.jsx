import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

/**
 * QuantityStepper Component (A1 Q7 Requirement 4)
 * Converted to React Native primitives (View, Text, TouchableOpacity).
 */
export default function QuantityStepper({ quantity, onIncrement, onDecrement, min = 0 }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.stepperContainer,
        {
          backgroundColor: colors.inputBg || '#F5F5F4',
          borderColor: colors.border
        }
      ]}
    >
      {/* Minus / Trash Button */}
      <TouchableOpacity
        onPress={onDecrement}
        style={[
          styles.stepButton,
          {
            backgroundColor: quantity === 1 ? (colors.tint || 'rgba(180, 83, 9, 0.1)') : (colors.surface || '#FFFFFF'),
            borderWidth: 0.5,
            borderColor: colors.border
          }
        ]}
        activeOpacity={0.7}
        accessibilityLabel={quantity === 1 ? 'Remove item' : 'Decrease quantity'}
      >
        {quantity === 1 ? (
          <Trash2 size={13} color={colors.danger || '#EF4444'} />
        ) : (
          <Minus size={13} color={colors.text} />
        )}
      </TouchableOpacity>

      {/* Quantity Display */}
      <Text
        style={[
          styles.quantityText,
          { color: colors.text }
        ]}
      >
        {quantity}
      </Text>

      {/* Plus Button */}
      <TouchableOpacity
        onPress={onIncrement}
        style={[
          styles.stepButton,
          {
            backgroundColor: colors.primary
          }
        ]}
        activeOpacity={0.7}
        accessibilityLabel="Increase quantity"
      >
        <Plus size={13} color={colors.onPrimary || '#FFFFFF'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace'
  }
});