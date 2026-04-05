import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  skills: string;
  availability: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const availabilityOptions = [
  'Weekdays',
  'Weekends',
  'Full-time',
  'Part-time',
  'Flexible',
];

export function VolunteerScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    skills: '',
    availability: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await api.post('/volunteer', payload);

      Alert.alert(
        'Registration Successful',
        'Thank you for your generous heart! Your volunteer registration has been received. Together, we shall serve humanity with divine grace.\n\nॐ सर्वे भवन्तु सुखिनः\n(May all beings be happy)',
        [
          {
            text: 'Hari Om',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to submit registration';
      Alert.alert('Submission Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    icon: React.ComponentProps<typeof Icon>['name'],
    options?: {
      multiline?: boolean;
      keyboardType?: 'email-address' | 'phone-pad' | 'default';
      required?: boolean;
    }
  ) => {
    const hasError = errors[field as keyof FormErrors];

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Icon name={icon} size={18} color={colors.gold.dark} />
          <Text style={styles.inputLabel}>
            {label}
            {options?.required && <Text style={styles.requiredStar}>*</Text>}
          </Text>
        </View>
        <View
          style={[
            styles.inputWrapper,
            hasError && styles.inputWrapperError,
            options?.multiline && styles.inputWrapperMultiline,
          ]}
        >
          <TextInput
            style={[styles.input, options?.multiline && styles.inputMultiline]}
            placeholder={placeholder}
            placeholderTextColor={colors.text.secondary}
            value={formData[field]}
            onChangeText={(value) => updateField(field, value)}
            keyboardType={options?.keyboardType || 'default'}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 4 : 1}
            textAlignVertical={options?.multiline ? 'top' : 'center'}
          />
        </View>
        {hasError && <Text style={styles.errorText}>{hasError}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.primary.maroon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Volunteer Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro Section */}
          <View style={styles.introSection}>
            <View style={styles.iconCircle}>
              <Icon name="hand-heart" size={40} color={colors.primary.saffron} />
            </View>
            <Text style={styles.introTitle}>Join Our Seva Family</Text>
            <Text style={styles.introText}>
              Service to others is the highest form of devotion. Join us in spreading
              light and love.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {renderInput('name', 'Full Name', 'Enter your name', 'account', {
              required: true,
            })}

            {renderInput('email', 'Email Address', 'your@email.com', 'email', {
              required: true,
              keyboardType: 'email-address',
            })}

            {renderInput('phone', 'Phone Number', '+91 XXXXX XXXXX', 'phone', {
              required: true,
              keyboardType: 'phone-pad',
            })}

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                {renderInput('city', 'City', 'Your city', 'city')}
              </View>
              <View style={styles.halfInput}>
                {renderInput('state', 'State', 'Your state', 'map-marker')}
              </View>
            </View>

            {renderInput('country', 'Country', 'Your country', 'earth')}

            {renderInput(
              'skills',
              'Skills',
              'e.g., Teaching, Event Management, IT',
              'account-cog'
            )}

            {/* Availability Dropdown */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Icon name="clock-outline" size={18} color={colors.gold.dark} />
                <Text style={styles.inputLabel}>Availability</Text>
              </View>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.availability && styles.dropdownPlaceholder,
                  ]}
                >
                  {formData.availability || 'Select availability'}
                </Text>
                <Icon
                  name={showAvailabilityDropdown ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
              {showAvailabilityDropdown && (
                <View style={styles.dropdownList}>
                  {availabilityOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        formData.availability === option && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => {
                        updateField('availability', option);
                        setShowAvailabilityDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          formData.availability === option &&
                            styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {renderInput(
              'message',
              'Message',
              'Tell us about yourself and why you wish to volunteer...',
              'message-text',
              { multiline: true }
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={[colors.primary.saffron, colors.primary.vermillion]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {submitting ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <>
                  <Icon name="send" size={20} color={colors.text.white} />
                  <Text style={styles.submitButtonText}>Submit Registration</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer Quote */}
          <View style={styles.footerQuote}>
            <Text style={styles.quoteText}>
              "The best way to find yourself is to lose yourself in the service of
              others."
            </Text>
            <Text style={styles.quoteAuthor}>- Mahatma Gandhi</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.sandstone,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold.main,
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  formSection: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  requiredStar: {
    color: colors.primary.vermillion,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.parchment,
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: colors.primary.vermillion,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: colors.primary.vermillion,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  dropdownPlaceholder: {
    color: colors.text.secondary,
  },
  dropdownList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.warmWhite,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.gold as string,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.background.cream,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  dropdownOptionTextSelected: {
    color: colors.primary.saffron,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.warm,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
  },
  footerQuote: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.gold as string,
  },
  quoteText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 12,
    color: colors.gold.dark,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
