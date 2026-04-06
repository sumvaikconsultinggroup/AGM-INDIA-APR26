import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import api from '../../services/api';
import { borderRadius, colors, spacing } from '../../theme';

type PushAudience = 'all_followers' | 'city_followers';

export function NotificationBroadcasterScreen() {
  const [pushAudience, setPushAudience] = useState<PushAudience>('all_followers');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cityName, setCityName] = useState('');
  const [pushSending, setPushSending] = useState(false);

  const [volunteerCity, setVolunteerCity] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [whatsAppSending, setWhatsAppSending] = useState(false);

  const previewMessage = useMemo(() => {
    if (whatsAppMessage.trim()) return whatsAppMessage;
    return `Hari Om. With blessings, volunteers from ${volunteerCity || 'the selected city'} are requested to be present for ${eventName || 'the upcoming event'}${eventDate ? ` on ${eventDate}` : ''}${eventLocation ? ` at ${eventLocation}` : ''}. Kindly confirm your availability with the Ashram team. Pranams, AvdheshanandG Mission Team`;
  }, [eventDate, eventLocation, eventName, volunteerCity, whatsAppMessage]);

  const sendPushBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing Details', 'Please add both title and body for the push notification.');
      return;
    }

    if (pushAudience === 'city_followers' && !cityName.trim()) {
      Alert.alert('City Required', 'Please specify the city you want to target.');
      return;
    }

    try {
      setPushSending(true);
      const response = await api.post('/notifications/broadcast', {
        mode: 'push',
        title: title.trim(),
        body: body.trim(),
        audience: pushAudience,
        cityName: cityName.trim() || undefined,
      });

      const result = response.data;
      Alert.alert('Broadcast Sent', `Push sent to ${result?.pushSent ?? 0} follower devices.`);
      setTitle('');
      setBody('');
      if (pushAudience === 'city_followers') setCityName('');
    } catch (error: any) {
      console.error('Push broadcast error:', error);
      Alert.alert('Send failed', error?.response?.data?.message || 'Unable to send push notification.');
    } finally {
      setPushSending(false);
    }
  };

  const sendVolunteerWhatsApp = async () => {
    if (!volunteerCity.trim()) {
      Alert.alert('City Required', 'Please choose the volunteer city for outreach.');
      return;
    }

    if (!eventName.trim() && !whatsAppMessage.trim()) {
      Alert.alert('Message Required', 'Add either an event name or a custom WhatsApp message.');
      return;
    }

    try {
      setWhatsAppSending(true);
      const response = await api.post('/notifications/broadcast', {
        mode: 'volunteer_whatsapp',
        cityName: volunteerCity.trim(),
        eventName: eventName.trim() || undefined,
        eventDate: eventDate.trim() || undefined,
        eventLocation: eventLocation.trim() || undefined,
        message: whatsAppMessage.trim() || undefined,
      });

      const result = response.data;
      Alert.alert(
        'Volunteer Outreach Queued',
        `Matched ${result?.matchedVolunteers ?? 0} volunteers and sent ${result?.whatsappSent ?? 0} WhatsApp messages.`
      );
    } catch (error: any) {
      console.error('Volunteer WhatsApp error:', error);
      Alert.alert('Send failed', error?.response?.data?.message || 'Unable to send volunteer WhatsApp broadcast.');
    } finally {
      setWhatsAppSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Broadcast Center</Text>
      <Text style={styles.subtitle}>Send a public push notification or rally volunteers city-wise from the same mobile screen.</Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Icon name="bell-ring-outline" size={24} color={colors.primary.saffron} />
            <Text style={styles.cardTitle}>Push To Followers</Text>
          </View>
          <SegmentedButtons
            value={pushAudience}
            onValueChange={(value) => setPushAudience(value as PushAudience)}
            buttons={[
              { value: 'all_followers', label: 'All Followers' },
              { value: 'city_followers', label: 'City Followers' },
            ]}
            style={{ marginBottom: spacing.md }}
          />
          {pushAudience === 'city_followers' ? (
            <TextInput
              value={cityName}
              onChangeText={setCityName}
              placeholder="City name, e.g. Delhi"
              style={styles.input}
              placeholderTextColor={colors.text.secondary}
            />
          ) : null}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Notification title"
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Darshan at 5 PM today / Special satsang tonight / Ashram closed due to weather"
            style={[styles.input, styles.multilineInput]}
            multiline
            placeholderTextColor={colors.text.secondary}
          />
          <Button mode="contained" onPress={sendPushBroadcast} loading={pushSending}>
            Send Push Notification
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Icon name="whatsapp" size={24} color={colors.status.success} />
            <Text style={styles.cardTitle}>Volunteer WhatsApp By City</Text>
          </View>
          <TextInput
            value={volunteerCity}
            onChangeText={setVolunteerCity}
            placeholder="Volunteer city, e.g. Haridwar"
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            value={eventName}
            onChangeText={setEventName}
            placeholder="Event / seva name"
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="Event date & time, e.g. 7 Apr 2026, 5:00 PM"
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            value={eventLocation}
            onChangeText={setEventLocation}
            placeholder="Venue / location"
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            value={whatsAppMessage}
            onChangeText={setWhatsAppMessage}
            placeholder="Optional custom WhatsApp copy"
            style={[styles.input, styles.multilineInput]}
            multiline
            placeholderTextColor={colors.text.secondary}
          />
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Text style={styles.previewText}>{previewMessage}</Text>
          </View>
          <Button mode="contained" buttonColor={colors.status.success} onPress={sendVolunteerWhatsApp} loading={whatsAppSending}>
            Send WhatsApp
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.parchment },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary.maroon },
  subtitle: { color: colors.text.secondary, lineHeight: 22 },
  card: { backgroundColor: colors.background.warmWhite, borderRadius: borderRadius.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  input: {
    backgroundColor: colors.background.parchment,
    borderWidth: 1,
    borderColor: colors.border.gold as string,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  multilineInput: { minHeight: 96, textAlignVertical: 'top' },
  previewBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3FAF4',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
    marginBottom: spacing.md,
  },
  previewLabel: { fontSize: 12, textTransform: 'uppercase', color: colors.text.secondary, marginBottom: spacing.xs },
  previewText: { color: colors.text.primary, lineHeight: 22 },
});
