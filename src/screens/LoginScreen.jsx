import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME, TAGLINE } from '../data/brand';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react-native';

export default function LoginScreen({ onNavigate }) {
  const { loginWithServer, registerWithServer } = useAuth();
  const { colors, isDark } = useTheme();

  // Mode state variable: 'login' or 'signup' (A1 Q3 Requirement 1)
  const [mode, setMode] = useState('login');

  // Controlled form inputs (A1 Q3 Requirement 2)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'manager'

  // Separate states (A1 Q3 Requirement 3)
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Clear errors for a field as soon as user edits it (A1 Q3 Requirement 3)
  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validation function (A1 Q3 Requirement 4)
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordDigitRegex = /\d/;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (at least 8 chars with at least one digit)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordDigitRegex.test(password)) {
      newErrors.password = 'Password must contain at least one digit (0-9)';
    }

    // Signup-only validations
    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm password is required';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler (A2 Q6 Requirement 3: POST /api/auth/login and POST /api/auth/register)
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      if (mode === 'login') {
        const result = await loginWithServer(email.trim(), password);
        if (result?.success) {
          const targetScreen = result.user?.role === 'manager' ? 'Dashboard' : 'Menu';
          if (onNavigate) onNavigate(targetScreen);
        }
      } else {
        const result = await registerWithServer(name.trim(), email.trim(), password, role);
        if (result?.success) {
          const targetScreen = result.user?.role === 'manager' ? 'Dashboard' : 'Menu';
          if (onNavigate) onNavigate(targetScreen);
        }
      }
    } catch (err) {
      setAlertMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (type) => {
    if (type === 'customer') {
      setEmail('customer@dastaan.pk');
      setPassword('Customer123');
      setErrors({});
    } else {
      setEmail('manager@dastaan.pk');
      setPassword('Manager123');
      setErrors({});
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>
              {APP_NAME}
            </Text>
            <View style={[styles.goldDivider, { backgroundColor: colors.gold || '#D4AF37' }]} />
            <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
              {TAGLINE}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: isDark ? '#1F1418' : '#F3E5E8',
                borderColor: colors.border
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => { setMode('login'); setErrors({}); setAlertMessage(null); }}
              style={[
                styles.tabButton,
                { backgroundColor: mode === 'login' ? colors.primary : 'transparent' }
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: mode === 'login' ? (colors.onPrimary || '#FFFFFF') : colors.text }
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setMode('signup'); setErrors({}); setAlertMessage(null); }}
              style={[
                styles.tabButton,
                { backgroundColor: mode === 'signup' ? colors.primary : 'transparent' }
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: mode === 'signup' ? (colors.onPrimary || '#FFFFFF') : colors.text }
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alert Notification */}
          {alertMessage && (
            <View
              style={[
                styles.alertBox,
                {
                  backgroundColor: isDark ? '#3E181A' : '#FDE8E8',
                  borderColor: colors.danger || '#EF4444'
                }
              ]}
            >
              <AlertCircle size={16} color={colors.danger || '#DC2626'} />
              <Text style={[styles.alertText, { color: colors.danger || '#DC2626' }]}>
                {alertMessage}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Full Name input (Signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg || '#F5F5F4',
                      borderColor: errors.name ? (colors.danger || '#EF4444') : colors.border
                    }
                  ]}
                >
                  <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={(val) => handleInputChange('name', val, setName)}
                    placeholder="e.g. Ahmed Khan"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.inputField, { color: colors.text }]}
                  />
                </View>
                {errors.name && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={13} color={colors.danger || '#EF4444'} />
                    <Text style={[styles.errorText, { color: colors.danger || '#EF4444' }]}>{errors.name}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Email input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg || '#F5F5F4',
                    borderColor: errors.email ? (colors.danger || '#EF4444') : colors.border
                  }
                ]}
              >
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={(val) => handleInputChange('email', val, setEmail)}
                  placeholder="you@domain.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.inputField, { color: colors.text }]}
                />
              </View>
              {errors.email && (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.danger || '#EF4444'} />
                  <Text style={[styles.errorText, { color: colors.danger || '#EF4444' }]}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Password input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg || '#F5F5F4',
                    borderColor: errors.password ? (colors.danger || '#EF4444') : colors.border
                  }
                ]}
              >
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => handleInputChange('password', val, setPassword)}
                  placeholder="At least 8 chars with 1 digit"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  style={[styles.inputField, { color: colors.text }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  accessibilityLabel="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View style={styles.errorRow}>
                  <AlertCircle size={13} color={colors.danger || '#EF4444'} />
                  <Text style={[styles.errorText, { color: colors.danger || '#EF4444' }]}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Confirm Password input (Signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg || '#F5F5F4',
                      borderColor: errors.confirmPassword ? (colors.danger || '#EF4444') : colors.border
                    }
                  ]}
                >
                  <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(val) => handleInputChange('confirmPassword', val, setConfirmPassword)}
                    placeholder="Repeat your password"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    style={[styles.inputField, { color: colors.text }]}
                  />
                </View>
                {errors.confirmPassword && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={13} color={colors.danger || '#EF4444'} />
                    <Text style={[styles.errorText, { color: colors.danger || '#EF4444' }]}>{errors.confirmPassword}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Role selector (Signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Select Role</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    onPress={() => setRole('customer')}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === 'customer' ? colors.primary : (colors.inputBg || '#F5F5F4'),
                        borderColor: role === 'customer' ? colors.primary : colors.border
                      }
                    ]}
                  >
                    <User size={15} color={role === 'customer' ? (colors.onPrimary || '#FFFFFF') : colors.text} />
                    <Text
                      style={[
                        styles.roleButtonText,
                        { color: role === 'customer' ? (colors.onPrimary || '#FFFFFF') : colors.text }
                      ]}
                    >
                      Customer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRole('manager')}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === 'manager' ? colors.primary : (colors.inputBg || '#F5F5F4'),
                        borderColor: role === 'manager' ? colors.primary : colors.border
                      }
                    ]}
                  >
                    <ShieldCheck size={15} color={role === 'manager' ? (colors.onPrimary || '#FFFFFF') : colors.text} />
                    <Text
                      style={[
                        styles.roleButtonText,
                        { color: role === 'manager' ? (colors.onPrimary || '#FFFFFF') : colors.text }
                      ]}
                    >
                      Manager
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isSubmitting ? 0.6 : 1
                }
              ]}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.onPrimary || '#FFFFFF'} />
                  <Text style={[styles.submitBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                    Authenticating...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.submitBtnText, { color: colors.onPrimary || '#FFFFFF' }]}>
                  {mode === 'login' ? 'Sign In to DASTAAN' : 'Create My Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Demo Credentials Autofill */}
          {mode === 'login' && (
            <View style={[styles.demoSection, { borderColor: colors.border }]}>
              <Text style={[styles.demoHeader, { color: colors.textMuted }]}>
                Demo Login Credentials (Click to fill):
              </Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  onPress={() => fillCredentials('customer')}
                  style={[styles.demoBtn, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.gold || '#D4AF37' }]}
                >
                  <Text style={[styles.demoBtnText, { color: colors.text }]}>Customer Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => fillCredentials('manager')}
                  style={[styles.demoBtn, { backgroundColor: colors.inputBg || '#F5F5F4', borderColor: colors.gold || '#D4AF37' }]}
                >
                  <Text style={[styles.demoBtnText, { color: colors.text }]}>Manager Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center'
  },
  goldDivider: {
    width: 50,
    height: 2,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 1
  },
  brandTagline: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
    textAlign: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700'
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14
  },
  alertText: {
    fontSize: 12,
    flex: 1
  },
  formContainer: {
    gap: 12
  },
  inputGroup: {
    marginBottom: 2
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  inputIcon: {
    marginRight: 8
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    height: '100%'
  },
  eyeBtn: {
    padding: 6
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  errorText: {
    fontSize: 11
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1
  },
  demoHeader: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500'
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '600'
  }
});