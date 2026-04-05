'use client';
import { useState, useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';

const DonationsRecordPage = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/donationsRecord');
      const data = await response.json();
      console.log('Fetched donations data:', data);
      setDonations(data.allPayments || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching donations:', error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Format date
  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCsv = () => {
    try {
      setIsExporting(true);

      // Create CSV content
      const headers = [
        'Donation ID',
        'Amount',
        'Currency',
        'Status',
        'Description',
        'Payment Method',
        'Customer',
        'Created',
      ];

      const csvContent = [
        headers.join(','),
        ...donations.map(donation =>
          [
            donation.id,
            donation.amount,
            donation.currency,
            donation.status,
            `"${donation.description || ''}"`,
            donation.paymentMethod,
            `"${donation.customer || ''}"`,
            formatDate(donation.created),
          ].join(',')
        ),
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.setAttribute('href', url);
      link.setAttribute('download', `donations-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Donation Records</h1>
      <div className="flex gap-2 justify-end mb-4">
        <button
          className="flex items-center bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded border-2 border-green-500"
          onClick={exportToCsv}
          disabled={isExporting || isLoading || donations.length === 0}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          <span>Export CSV</span>
        </button>
        <button
          className=" bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={fetchDonations}
          disabled={isLoading}
        >
          {isLoading ? 'Fetching...' : 'Fetch Donations'}
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Donation ID
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {donations.map(donation => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.status}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.description}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {donation.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                    {new Date(donation.created * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonationsRecordPage;
