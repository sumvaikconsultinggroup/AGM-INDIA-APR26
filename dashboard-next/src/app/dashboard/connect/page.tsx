'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Define the Contact interface
interface Contact {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConnectPage() {
  // State for contacts data and UI state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contact submissions
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/connect');

      if (response.data.success) {
        setContacts(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch contacts');
        toast.error('Error', {
          description: response.data.message || 'Failed to fetch contacts',
        });
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to load contact submissions';

      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle refreshing data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContacts();
  };

  // Handle opening the modal with a contact's details
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Submissions</h1>
          <p className="text-muted-foreground">View and manage all contact form submissions</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing || loading}>
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {loading && !refreshing ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading contact submissions...</span>
        </div>
      ) : error ? (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load contact submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      ) : contacts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Submissions</CardTitle>
            <CardDescription>No contact form submissions found</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There are currently no contact form submissions to display.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[250px]">Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map(contact => (
                <TableRow key={contact._id}>
                  <TableCell className="font-medium">{contact.fullName}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{contact.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(contact.createdAt)}
                  </TableCell>
                  <TableCell>
                    {contact.isRead ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Read
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        New
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewContact(contact)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal for contact details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {selectedContact && (
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Submission Details</DialogTitle>
              <DialogDescription>
                Detailed information about the contact submission
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <div className="font-semibold text-muted-foreground">Name:</div>
                <div>{selectedContact.fullName}</div>

                <div className="font-semibold text-muted-foreground">Email:</div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-primary hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                <div className="font-semibold text-muted-foreground">Date:</div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(selectedContact.createdAt)}
                </div>

                <div className="font-semibold text-muted-foreground">Subject:</div>
                <div className="font-medium">{selectedContact.subject}</div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-muted-foreground">Message:</div>
                <div className="p-4 rounded-md bg-muted whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
