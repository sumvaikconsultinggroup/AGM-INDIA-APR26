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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const contactInfo = {
  address: 'Harihar Ashram, Kankhal\nHaridwar, Uttarakhand, India',
  phone: '+91 94101 60022',
  email: 'office@avdheshanandg.org',
  website: 'www.avdheshanandg.org',
};

export function ContactScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
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

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post('/connect', formData);

      Alert.alert(
        'Message Sent',
        'Thank you for reaching out to us. We will respond to your inquiry soon.\n\nHari Om 🙏',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ name: '', email: '', message: '' });
            },
          },
        ]
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      Alert.alert('Submission Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const openLink = async (type: 'phone' | 'email' | 'website') => {
    let url = '';
    switch (type) {
      case 'phone':
        url = `tel:${contactInfo.phone.replace(/\s/g, '')}`;
        break;
      case 'email':
        url = `mailto:${contactInfo.email}`;
        break;
      case 'website':
        url = `https://${contactInfo.website}`;
        break;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    icon: React.ComponentProps<typeof Icon>['name'],
    options?: {
      multiline?: boolean;
      keyboardType?: 'email-address' | 'default';
    }
  ) => {
    const hasError = errors[field];

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Icon name={icon} size={18} color={colors.gold.dark} />
          <Text style={styles.inputLabel}>
            {label}
            <Text style={styles.requiredStar}>*</Text>
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
            numberOfLines={options?.multiline ? 5 : 1}
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
        <Text style={styles.headerTitle}>Contact Us</Text>
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
          {/* Intro */}
          <View style={styles.introSection}>
            <View style={styles.iconCircle}>
              <Icon name="email-heart-outline" size={40} color={colors.primary.saffron} />
            </View>
            <Text style={styles.introTitle}>Get In Touch</Text>
            <Text style={styles.introText}>
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as
              soon as possible.
            </Text>
          </View>

          {/* Contact Info Cards */}
          <View style={styles.contactCards}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => openLink('phone')}
            >
              <View style={styles.contactCardIcon}>
                <Icon name="phone" size={24} color={colors.primary.saffron} />
              </View>
              <View style={styles.contactCardContent}>
                <Text style={styles.contactCardLabel}>Phone</Text>
                <Text style={styles.contactCardValue}>{contactInfo.phone}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => openLink('email')}
            >
              <View style={styles.contactCardIcon}>
                <Icon name="email" size={24} color={colors.primary.saffron} />
              </View>
              <View style={styles.contactCardContent}>
                <Text style={styles.contactCardLabel}>Email</Text>
                <Text style={styles.contactCardValue}>{contactInfo.email}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.contactCard}>
              <View style={styles.contactCardIcon}>
                <Icon name="map-marker" size={24} color={colors.primary.saffron} />
              </View>
              <View style={styles.contactCardContent}>
                <Text style={styles.contactCardLabel}>Address</Text>
                <Text style={styles.contactCardValue}>{contactInfo.address}</Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <View style={styles.goldAccent} />
              <Text style={styles.formTitle}>Send a Message</Text>
            </View>

            {renderInput('name', 'Your Name', 'Enter your name', 'account')}

            {renderInput('email', 'Email Address', 'your@email.com', 'email', {
              keyboardType: 'email-address',
            })}

            {renderInput(
              'message',
              'Message',
              'Write your message here...',
              'message-text',
              { multiline: true }
            )}

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
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ॐ सर्वे भवन्तु सुखिनः
            </Text>
            <Text style={styles.footerSubtext}>
              May all beings be happy
            </Text>
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
    marginBottom: spacing.lg,
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
    paddingHorizontal: spacing.md,
  },
  contactCards: {
    marginBottom: spacing.lg,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
  },
  contactCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactCardContent: {
    flex: 1,
  },
  contactCardLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  contactCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  formSection: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    ...shadows.warm,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  goldAccent: {
    width: 4,
    height: 24,
    backgroundColor: colors.gold.main,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.maroon,
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
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    color: colors.primary.vermillion,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
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
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: 20,
    color: colors.gold.main,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
