import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../theme/tokens';

/**
 * AppInput — labelled text field with optional icon, error and right action.
 * Presentational only; value handling is controlled by the parent.
 */
export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  icon,
  rightAction,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null, multiline ? styles.fieldMultiline : null]}>
        {icon ? (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={17} color={COLORS.primary} />
          </View>
        ) : null}
        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : null, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightAction ? <View style={styles.right}>{rightAction}</View> : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Small pressable text/eye action for use as AppInput `rightAction`.
 * Example: <AppInputRightAction label={show ? 'Hide' : 'Show'} onPress={...} />
 */
export function AppInputRightAction({ label, onPress, icon }) {
  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={label || icon}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.action}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      ) : (
        <Text style={styles.actionText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingRight: SPACING.sm,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    minHeight: 96,
    paddingVertical: SPACING.sm,
  },
  fieldError: {
    borderColor: COLORS.danger,
  },
  iconBox: {
    width: 38,
    height: 38,
    marginLeft: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.sm,
  },
  inputMultiline: {
    minHeight: 80,
    paddingVertical: SPACING.sm,
  },
  right: {
    marginLeft: SPACING.sm,
    justifyContent: 'center',
  },
  action: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  actionText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
