'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  Pencil,
  Plus,
  Trash,
  User,
  Mail,
  Tag,
  EyeOff,
  Eye,
  Download,
  Phone,
} from 'lucide-react';
import { format as formatDate, parseISO, isValid as isValidDate } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Switch } from '@/components/ui/switch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = '/api/daily-events';

// -------------------- API Helpers --------------------
async function fetchEventsByDate(date) {
  const res = await fetch(`${API_URL}?date=${date}`);
  if (!res.ok) throw new Error('Failed to load events');
  const data = await res.json();
  return data.events || [];
}

async function createEvent(eventData) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

async function updateEvent(id, eventData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}

async function deleteEvent(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete event');
  return res.json();
}

// -------------------- Utility Functions --------------------
function ensureDateParam(param) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return null;
  const d = parseISO(param);
  return isValidDate(d) ? param : null;
}

function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// -------------------- Main Page --------------------
export default function DailyScheduleDatePage() {
  const router = useRouter();
  const params = useParams();
  const safeDate = ensureDateParam(params?.date);
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !safeDate) return;
    fetchEventsByDate(safeDate)
      .then(setItems)
      .catch(err => console.error('Error fetching events:', err));
  }, [mounted, safeDate, refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Schedule for ${formatDate(parseISO(safeDate), 'PPP')}`, 14, 20);

    const tableData = items.map(item => [
      item.title,
      formatTimeTo12Hour(item.time),
      item.location,
      item.category || '-',
      item.organiserName || '-',
      item.organiserPhone || '-',
      item.isHidden ? 'Hidden' : 'Visible',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Title', 'Time', 'Location', 'Category', 'Organiser', 'Phone', 'Status']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    items.forEach((item, index) => {
      if (item.description) {
        if (finalY > 270) {
          doc.addPage();
          finalY = 20;
        }
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${item.title}:`, 14, finalY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        const splitDesc = doc.splitTextToSize(item.description, 180);
        doc.text(splitDesc, 14, finalY + 5);
        finalY += 5 + splitDesc.length * 4 + 5;
      }
    });

    doc.save(`schedule_${safeDate}.pdf`);
  };

  if (!safeDate) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Daily Schedule</h1>
        <p className="text-sm text-destructive">Invalid date. Please go back to the calendar.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/daily-schedule')}>
          Back to Calendar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Schedule for {formatDate(parseISO(safeDate), 'PPP')}
          </h1>
          <p className="text-muted-foreground">Manage schedule items for this date.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {items.length > 0 && (
            <Button variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/dashboard/daily-schedule')}>
            Back
          </Button>
          <AddOrEditDialog date={safeDate} onSaved={refreshData}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </AddOrEditDialog>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No schedules yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Click "Add Schedule" to create your first entry.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <ScheduleCard key={item._id} item={item} onChanged={refreshData} />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------- Schedule Card --------------------
function ScheduleCard({ item, onChanged }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {item.isHidden && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                    Hidden
                  </Badge>
                )}
                <Badge variant="outline">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {formatTimeTo12Hour(item.time)}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {item.location}
                </Badge>
                {item.category && (
                  <Badge variant="outline">
                    <Tag className="mr-1 h-3.5 w-3.5" />
                    {item.category}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setViewOpen(true)}>
                <Eye className="h-4 w-4 sm:mr-2" />
                View
              </Button>
              <AddOrEditDialog date={item.date} item={item} onSaved={onChanged}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 sm:mr-2" />
                  Edit
                </Button>
              </AddOrEditDialog>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirmOpen(true);
                }}
              >
                <Trash className="h-4 w-4 sm:mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        {item.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{item.title}" from {item.date}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={async () => {
                try {
                  await deleteEvent(item._id);
                  setConfirmOpen(false);
                  onChanged();
                } catch (err) {
                  console.error('Error deleting event:', err);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{item.title}</DialogTitle>
            <DialogDescription>Complete schedule details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <DetailRow icon={Clock} label="Time" value={formatTimeTo12Hour(item.time)} />
            <DetailRow icon={MapPin} label="Location" value={item.location} />
            {item.category && <DetailRow icon={Tag} label="Category" value={item.category} />}
            {item.organiserName && <DetailRow icon={User} label="Organiser" value={item.organiserName} />}
            {item.organiserEmail && <DetailRow icon={Mail} label="Email" value={item.organiserEmail} />}
            {item.organiserPhone && <DetailRow icon={Phone} label="Phone" value={item.organiserPhone} />}
            {item.description && <DetailRow label="Description" value={item.description} />}
            {item.isHidden && (
              <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3">
                <EyeOff className="h-4 w-4 text-yellow-700" />
                <p className="text-sm text-yellow-700">This schedule is hidden from public view</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <AddOrEditDialog date={item.date} item={item} onSaved={onChanged}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </AddOrEditDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------- Detail Row --------------------
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      ) : (
        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
          <div className="h-3 w-3 rounded-sm bg-muted-foreground/20" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

// -------------------- Validation Schema --------------------
const scheduleSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  time: yup.string().optional(),
  date: yup.string().required('Date is required'),
  location: yup.string().required('Location is required'),
  organiserName: yup.string().optional(),
  organiserEmail: yup.string().optional(),
  organiserPhone: yup
    .string()

    .required('Phone is required'),
  category: yup.string().optional(),
  description: yup.string().optional(),
  isHidden: yup.boolean().optional(),
});

// -------------------- Add/Edit Dialog --------------------
function AddOrEditDialog({ date, item, onSaved, children }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      date: item?.date ?? date,
      title: item?.title ?? '',
      time: item?.time ?? '',
      location: item?.location ?? '',
      description: item?.description ?? '',
      organiserName: item?.organiserName ?? '',
      organiserEmail: item?.organiserEmail ?? '',
      organiserPhone: item?.organiserPhone ?? '',
      category: item?.category ?? '',
      isHidden: item?.isHidden ?? false,
    },
  });

  const convertTo12Hour = time24 => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return { hour: hour12.toString(), minute: minutes, ampm };
  };

  const convertTo24Hour = (hour, minute, ampm) => {
    if (!hour || !minute) return '';
    let hour24 = parseInt(hour, 10);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const [time12h, setTime12h] = useState(() => convertTo12Hour(item?.time || ''));

  useEffect(() => {
    if (open) {
      reset({
        date: item?.date ?? date,
        title: item?.title ?? '',
        time: item?.time ?? '',
        location: item?.location ?? '',
        description: item?.description ?? '',
        organiserName: item?.organiserName ?? '',
        organiserEmail: item?.organiserEmail ?? '',
        organiserPhone: item?.organiserPhone ?? '',
        category: item?.category ?? '',
        isHidden: item?.isHidden ?? false,
      });
      setTime12h(convertTo12Hour(item?.time || ''));
    }
  }, [item, date, open, reset]);

  const handle12HourChange = (field, value) => {
    const newTime12h = { ...time12h, [field]: value };
    setTime12h(newTime12h);
    if (newTime12h.hour && newTime12h.minute && newTime12h.ampm) {
      setValue('time', convertTo24Hour(newTime12h.hour, newTime12h.minute, newTime12h.ampm));
    }
  };

  const onSubmit = data => {
    (async () => {
      try {
        if (isEdit) {
          await updateEvent(item._id, data);
        } else {
          await createEvent(data);
        }
        setOpen(false);
        onSaved();
      } catch (err) {
        console.error('Error saving event:', err);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[400px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
          <DialogDescription>Fill in the details below</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title">Title</Label>
            <Input {...register('title')} id="title" placeholder="Schedule Title" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="time">Time</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="HH"
                value={time12h.hour}
                onChange={e => handle12HourChange('hour', e.target.value)}
              />
              <Input
                type="number"
                placeholder="MM"
                value={time12h.minute}
                onChange={e => handle12HourChange('minute', e.target.value)}
              />
              <Select
                value={time12h.ampm}
                onValueChange={v => handle12HourChange('ampm', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="location">Location</Label>
            <Input {...register('location')} id="location" placeholder="Location" />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="category">Category</Label>
            <Input {...register('category')} id="category" placeholder="Category" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register('description')} id="description" placeholder="Description" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="organiserName">Organiser Name</Label>
            <Input {...register('organiserName')} id="organiserName" placeholder="Organiser Name" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="organiserEmail">Organiser Email</Label>
            <Input {...register('organiserEmail')} id="organiserEmail" placeholder="Email" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="organiserPhone">Organiser Phone</Label>
            <Input {...register('organiserPhone')} id="organiserPhone" placeholder="Phone" />
            {errors.organiserPhone && (
              <p className="text-xs text-destructive">{errors.organiserPhone.message}</p>
            )}
          </div>

          {/* <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="isHidden"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label>Hide from public</Label>
          </div> */}

          <DialogFooter>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Add Schedule'}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
