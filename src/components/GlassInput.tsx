import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme';
import GlassCard from './GlassCard';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  variant?: 'light' | 'dark' | 'primary' | 'secondary';
  icon?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  variant = 'light',
  icon,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <GlassCard 
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          error && styles.errorContainer,
        ]}
        variant={variant}
      >
        <View style={styles.inputRow}>
          {icon && (
            <Text style={styles.icon}>{icon}</Text>
          )}
          
          <TextInput
            style={[styles.input, style]}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </View>
      </GlassCard>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: theme.typography.body.medium.fontSize,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  focusedContainer: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
  errorContainer: {
    borderColor: theme.colors.error[400],
    borderWidth: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: theme.spacing[3],
    color: theme.colors.white,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.body.medium.fontSize,
    color: theme.colors.white,
    padding: 0,
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error[400],
    marginTop: theme.spacing[1],
  },
});

export default GlassInput;