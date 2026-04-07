import AdminNotificationDevice from '@/models/AdminNotificationDevice';

const ExpoPushDeviceModel = AdminNotificationDevice as any;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function isExpoPushToken(token: string) {
  return /^ExponentPushToken\[[^\]]+\]$/.test(token) || /^ExpoPushToken\[[^\]]+\]$/.test(token);
}

async function sendExpoPushMessages(messages: Array<Record<string, unknown>>) {
  const results: Array<Record<string, unknown>> = [];

  for (const messageChunk of chunk(messages, 100)) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageChunk),
    });

    const payload = await response.json().catch(() => null);
    results.push({
      ok: response.ok,
      status: response.status,
      payload,
    });
  }

  return results;
}

interface AdminPushInput {
  adminIds?: string[];
  usernames?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  channelId?: string;
}

export async function sendAdminPushNotification(input: AdminPushInput) {
  const adminIds = (input.adminIds || []).filter(Boolean);
  const usernames = (input.usernames || []).filter(Boolean);

  if (!adminIds.length && !usernames.length) {
    return { success: false, matchedDevices: 0, sent: 0, results: [], message: 'No admin recipients provided' };
  }

  const filter: Record<string, unknown> = { isActive: true };
  if (adminIds.length && usernames.length) {
    filter.$or = [{ adminId: { $in: adminIds } }, { username: { $in: usernames } }];
  } else if (adminIds.length) {
    filter.adminId = { $in: adminIds };
  } else {
    filter.username = { $in: usernames };
  }

  const devices = await ExpoPushDeviceModel.find(filter).lean();
  const tokens = devices
    .map((device: any) => String(device.pushToken || '').trim())
    .filter((token: string) => token && isExpoPushToken(token));

  if (!tokens.length) {
    return { success: true, matchedDevices: 0, sent: 0, results: [], message: 'No active admin devices found' };
  }

  const messages = tokens.map((token: string) => ({
    to: token,
    title: input.title,
    body: input.body,
    sound: input.sound || 'default',
    channelId: input.channelId || 'admin_tasks',
    priority: 'high',
    data: input.data || {},
  }));

  const results = await sendExpoPushMessages(messages);
  const sent = results.reduce((count, item) => {
    const payload = item.payload as { data?: Array<{ status?: string }> } | null;
    const payloadItems = Array.isArray(payload?.data) ? payload.data : [];
    return count + payloadItems.filter((entry: any) => entry?.status === 'ok').length;
  }, 0);

  return {
    success: sent > 0,
    matchedDevices: tokens.length,
    sent,
    results,
  };
}

export async function notifyAdminSmartNoteAssigned(params: {
  assignedToId?: string;
  assignedToName?: string;
  noteId: string;
  noteTitle: string;
  createdByName?: string;
}) {
  if (!params.assignedToId && !params.assignedToName) {
    return { success: false, matchedDevices: 0, sent: 0, results: [] };
  }

  return sendAdminPushNotification({
    adminIds: params.assignedToId ? [params.assignedToId] : undefined,
    usernames: params.assignedToName ? [params.assignedToName] : undefined,
    title: 'New Smart Note Assigned',
    body: `${params.noteTitle}${params.createdByName ? ` from ${params.createdByName}` : ''} now needs your attention.`,
    channelId: 'admin_tasks',
    data: {
      type: 'smart_note_assigned',
      noteId: params.noteId,
    },
  });
}

export async function notifyAdminSevaTaskAssigned(params: {
  assignedToId?: string;
  assignedToName?: string;
  taskId: string;
  taskTitle: string;
  dueDate?: Date | string | null;
  priority?: string;
  city?: string;
}) {
  if (!params.assignedToId && !params.assignedToName) {
    return { success: false, matchedDevices: 0, sent: 0, results: [] };
  }

  const dueText = params.dueDate ? ` Due ${new Date(params.dueDate).toLocaleString('en-IN')}.` : '';
  const cityText = params.city ? ` ${params.city}.` : '';

  return sendAdminPushNotification({
    adminIds: params.assignedToId ? [params.assignedToId] : undefined,
    usernames: params.assignedToName ? [params.assignedToName] : undefined,
    title: 'Task Assigned To You',
    body: `${params.taskTitle}${cityText}${dueText}`.trim(),
    channelId: 'admin_tasks',
    data: {
      type: 'seva_task_assigned',
      taskId: params.taskId,
      priority: params.priority || 'medium',
    },
  });
}

export async function notifyAdminSevaTaskDue(params: {
  assignedToId?: string;
  assignedToName?: string;
  taskId: string;
  taskTitle: string;
  dueDate?: Date | string | null;
  overdue?: boolean;
}) {
  if (!params.assignedToId && !params.assignedToName) {
    return { success: false, matchedDevices: 0, sent: 0, results: [] };
  }

  return sendAdminPushNotification({
    adminIds: params.assignedToId ? [params.assignedToId] : undefined,
    usernames: params.assignedToName ? [params.assignedToName] : undefined,
    title: params.overdue ? 'Task Overdue' : 'Task Due Soon',
    body: `${params.taskTitle}${params.dueDate ? ` • ${new Date(params.dueDate).toLocaleString('en-IN')}` : ''}`,
    channelId: 'admin_tasks',
    data: {
      type: params.overdue ? 'seva_task_overdue' : 'seva_task_due',
      taskId: params.taskId,
    },
  });
}
