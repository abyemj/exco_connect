
// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF', // Blue (iOS style primary)
  secondary: '#E5E5EA', // Light Gray
  background: '#FFFFFF', // White
  card: '#FFFFFF',
  text: '#000000', // Black
  muted: '#8E8E93', // Gray
  destructive: '#FF3B30', // Red
  border: '#C7C7CC', // Light Gray Border
  success: '#34C759', // Green
  warning: '#FF9500', // Orange
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
});

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    // Add shadows for iOS and Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  input: {
    height: 44,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
   buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  buttonDestructive: {
     backgroundColor: colors.destructive,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start', // Make badge wrap content
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDefault: {
    backgroundColor: colors.primary,
  },
  badgeDefaultText: {
      color: colors.white,
  },
   badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  badgeOutlineText: {
      color: colors.muted,
  },
  badgeDestructive: {
      backgroundColor: colors.destructive,
  },
   badgeDestructiveText: {
      color: colors.white,
  },
    badgeSecondary: {
    backgroundColor: colors.secondary,
  },
   badgeSecondaryText: {
      color: colors.text, // Use default text color for secondary badge
  },
   alert: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  alertDestructive: {
    backgroundColor: '#FFEBEB',
    borderColor: colors.destructive,
  },
  alertTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  alertDescription: {},
  alertDestructiveText: {
    color: colors.destructive,
  },
});
