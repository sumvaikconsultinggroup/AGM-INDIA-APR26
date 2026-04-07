import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppButton, ScreenHeader, SectionHeader, SurfaceCard } from '../../components/common';
import { colors, spacing, typography } from '../../theme';

export function MantraDikshaScreen({ navigation }: any) {
  const { t } = useTranslation();

  const readiness = [
    t('mantraDikshaScreen.readiness.one'),
    t('mantraDikshaScreen.readiness.two'),
    t('mantraDikshaScreen.readiness.three'),
    t('mantraDikshaScreen.readiness.four'),
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        eyebrow={t('mantraDikshaScreen.eyebrow')}
        title={t('mantraDikshaScreen.title')}
        subtitle={t('mantraDikshaScreen.subtitle')}
        icon="om"
      />

      <View style={styles.section}>
        <SurfaceCard style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>{t('mantraDikshaScreen.introTitle')}</Text>
          <Text style={styles.highlightText}>{t('mantraDikshaScreen.introText')}</Text>
        </SurfaceCard>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t('mantraDikshaScreen.readinessTitle')}
          subtitle={t('mantraDikshaScreen.readinessSubtitle')}
          icon="hand-pointing-right"
        />
        <SurfaceCard>
          {readiness.map((item) => (
            <View key={item} style={styles.listRow}>
              <Icon name="check-circle-outline" size={18} color={colors.gold.dark} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </SurfaceCard>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t('mantraDikshaScreen.registrationTitle')}
          subtitle={t('mantraDikshaScreen.registrationSubtitle')}
          icon="file-document-edit-outline"
        />
        <SurfaceCard>
          <Text style={styles.registrationText}>{t('mantraDikshaScreen.registrationText')}</Text>
        </SurfaceCard>
      </View>

      <View style={styles.section}>
        <AppButton
          label={t('mantraDikshaScreen.cta')}
          onPress={() =>
            navigation.navigate('ContactForm', {
              prefillSubject: 'Mantra Diksha Registration',
              titleOverride: t('mantraDikshaScreen.contactTitle'),
              introTitleOverride: t('mantraDikshaScreen.contactTitle'),
              introTextOverride: t('mantraDikshaScreen.contactSubtitle'),
              messagePlaceholder: t('mantraDikshaScreen.contactPlaceholder'),
            })
          }
          icon="email-fast-outline"
        />
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.parchment,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  highlightCard: {
    backgroundColor: '#FFF2DB',
  },
  highlightTitle: {
    ...typography.h3,
    color: colors.primary.maroon,
    marginBottom: spacing.sm,
  },
  highlightText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  listText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  registrationText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
