'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import {
  Search,
  Eye,
  Download,
  Calendar,
  Phone,
  User,
  Heart,
  ImageIcon,
  RefreshCw,
  FileDown,
  CreditCard,
  MessageCircle,
  Mail,
} from 'lucide-react';

interface DikshaRegistration {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  mobileNumber: string;
  email?: string; // Added email field
  whatsappNumber?: string; // Optional for all nationalities
  aadhaarNumber?: string; // Only for Indian nationality
  passportNumber?: string; // Only for non-Indian nationality
  aadhaarDocument?: string; // Only for Indian nationality
  passportDocument?: string; // Only for non-Indian nationality
  recentPhoto?: string;
  spiritualIntent?: string; // Made optional
  spiritualPath?: string; // Made optional
  previousDiksha?: string; // Made optional
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface ApiResponse {
  success: boolean;
  data: DikshaRegistration[];
  message?: string;
  error?: string;
}

export default function DikshaMantraPage() {
  const [registrations, setRegistrations] = useState<DikshaRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<DikshaRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<DikshaRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch registrations from API
  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);

      const response = await fetch('/api/mantra-diksha');
      const data: ApiResponse = await response.json();

      if (data.success) {
        setRegistrations(data.data);
        setFilteredRegistrations(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch registrations');
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      setIsExporting(true);

      // Prepare data for CSV export
      const csvData = registrations.map(registration => {
        const baseData = {
          'Full Name': registration.fullName,
          'Date of Birth': formatDateOfBirth(registration.dateOfBirth),
          'Gender': registration.gender,
          'Nationality': registration.nationality,
          'Mobile Number': registration.mobileNumber,
          'Email': registration.email || 'Not Provided', // Added email field
          'WhatsApp Number': registration.whatsappNumber || 'Not Provided', // WhatsApp for all users
          'Spiritual Intent': registration.spiritualIntent || 'Not Provided', // Made optional
          'Spiritual Path': registration.spiritualPath || 'Not Provided', // Made optional
          'Previous Diksha': registration.previousDiksha || 'Not Provided', // Made optional
          'Registration Date': formatDate(registration.registrationDate),
          'Recent Photo URL': registration.recentPhoto || 'Not Provided',
          'Created At': formatDate(registration.createdAt),
        };

        // Add nationality-specific fields
        if (registration.nationality === 'Indian') {
          return {
            ...baseData,
            'Aadhaar Number': registration.aadhaarNumber || 'Not Provided',
            'Aadhaar Document URL': registration.aadhaarDocument || 'Not Provided',
            'Passport Number': 'N/A (Indian Citizen)',
            'Passport Document URL': 'N/A (Indian Citizen)',
          };
        } else {
          return {
            ...baseData,
            'Aadhaar Number': 'N/A (Non-Indian Citizen)',
            'Aadhaar Document URL': 'N/A (Non-Indian Citizen)',
            'Passport Number': registration.passportNumber || 'Not Provided',
            'Passport Document URL': registration.passportDocument || 'Not Provided',
          };
        }
      });

      // Convert to CSV
      const csv = Papa.unparse(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Mantra-Diksha-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setIsExporting(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter registrations based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter(registration =>
        registration.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.mobileNumber.includes(searchTerm) ||
        (registration.email && registration.email.toLowerCase().includes(searchTerm.toLowerCase())) || // Added email search
        (registration.whatsappNumber && registration.whatsappNumber.includes(searchTerm)) ||
        (registration.nationality === 'Indian' && registration.aadhaarNumber?.includes(searchTerm)) ||
        (registration.nationality !== 'Indian' && registration.passportNumber?.includes(searchTerm))
      );
      setFilteredRegistrations(filtered);
    }
  }, [searchTerm, registrations]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format date of birth helper
  const formatDateOfBirth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const viewRegistration = (registration: DikshaRegistration) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  // Download file helper
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Indian Citizens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.nationality === 'Indian').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">International</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.nationality !== 'Indian').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Registration Management</CardTitle>
              <CardDescription>Manage diksha mantra registrations and applications</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={isExporting || registrations.length === 0}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRegistrations}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, mobile, email, WhatsApp, Aadhaar, or passport..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading registrations...</span>
            </div>
          ) : (
            <>
              {/* Registrations Table */}
              <div className="space-y-4">
                {filteredRegistrations.map(registration => (
                  <Card key={registration._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {registration.fullName}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  registration.nationality === 'Indian' 
                                    ? 'bg-orange-100 text-orange-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {registration.nationality}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{registration.mobileNumber}</span>
                                </div>
                                {/* Show Email for all users */}
                                {registration.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{registration.email}</span>
                                  </div>
                                )}
                                {/* Show WhatsApp for all users if provided */}
                                {registration.whatsappNumber && (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{registration.whatsappNumber}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>DOB: {formatDateOfBirth(registration.dateOfBirth)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{registration.gender}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                Registered: {formatDate(registration.registrationDate)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewRegistration(registration)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredRegistrations.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? 'No registrations match your search criteria.'
                      : 'No registrations available.'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Registration Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-600" />
              Diksha Registration Details
            </DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDateOfBirth(selectedRegistration.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Gender</Label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nationality</Label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedRegistration.registrationDate)}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRegistration.mobileNumber}
                    </p>
                  </div>
                  
                  {/* Email for all users */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRegistration.email || 'Not provided'}
                    </p>
                  </div>
                  
                  {/* WhatsApp Number for all users */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">WhatsApp Number</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRegistration.whatsappNumber || 'Not provided'}
                    </p>
                  </div>

                  {/* Nationality-specific fields */}
                  {selectedRegistration.nationality === 'Indian' ? (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Aadhaar Number</Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRegistration.aadhaarNumber || 'Not provided'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Passport Number</Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRegistration.passportNumber || 'Not provided'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="spiritual" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Why do you wish to receive Mantra Diksha?
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedRegistration.spiritualIntent || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Do you follow a spiritual path or Guru?
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedRegistration.spiritualPath || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Have you received diksha before?
                    </Label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedRegistration.previousDiksha || 'Not provided'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recent Photo - Always present */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Recent Photo</Label>
                    {selectedRegistration.recentPhoto ? (
                      <div className="mt-2">
                        <div className="relative w-full h-48 rounded-md border overflow-hidden">
                          <Image
                            src={selectedRegistration.recentPhoto}
                            alt="Recent Photo"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full bg-transparent"
                          onClick={() =>
                            handleDownload(
                              selectedRegistration.recentPhoto!,
                              `${selectedRegistration.fullName}_photo.jpg`
                            )
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2 w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Conditional document based on nationality */}
                  {selectedRegistration.nationality === 'Indian' ? (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Aadhaar Document</Label>
                      {selectedRegistration.aadhaarDocument ? (
                        <div className="mt-2">
                          <div className="relative w-full h-48 rounded-md border overflow-hidden">
                            <Image
                              src={selectedRegistration.aadhaarDocument}
                              alt="Aadhaar Document"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full bg-transparent"
                            onClick={() =>
                              handleDownload(
                                selectedRegistration.aadhaarDocument!,
                                `${selectedRegistration.fullName}_aadhaar.jpg`
                              )
                            }
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Passport Document</Label>
                      {selectedRegistration.passportDocument ? (
                        <div className="mt-2">
                          <div className="relative w-full h-48 rounded-md border overflow-hidden">
                            <Image
                              src={selectedRegistration.passportDocument}
                              alt="Passport Document"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full bg-transparent"
                            onClick={() =>
                              handleDownload(
                                selectedRegistration.passportDocument!,
                                `${selectedRegistration.fullName}_passport.jpg`
                              )
                            }
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
