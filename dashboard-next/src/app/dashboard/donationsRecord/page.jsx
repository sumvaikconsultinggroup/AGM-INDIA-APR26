'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw, Send } from 'lucide-react';

const RANGE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'custom', label: 'Custom' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function DonationsRecordPage() {
  const [donations, setDonations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [range, setRange] = useState('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [resendingId, setResendingId] = useState(null);

  const analyticsUrl = useMemo(() => {
    if (range === 'custom' && customStartDate && customEndDate) {
      return `/api/donations/analytics?range=custom&startDate=${encodeURIComponent(customStartDate)}&endDate=${encodeURIComponent(customEndDate)}`;
    }
    return `/api/donations/analytics?range=${range}`;
  }, [customEndDate, customStartDate, range]);

  const fetchDonationsDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recordsResponse, analyticsResponse] = await Promise.all([
        fetch('/api/donationsRecord'),
        fetch(analyticsUrl),
      ]);

      const recordsData = await recordsResponse.json();
      const analyticsData = await analyticsResponse.json();

      setDonations(recordsData.allPayments || []);
      setAnalytics(analyticsData.data || null);
    } catch (error) {
      console.error('Error fetching donations dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [analyticsUrl]);

  useEffect(() => {
    fetchDonationsDashboard();
  }, [fetchDonationsDashboard]);

  const exportToCsv = () => {
    try {
      setIsExporting(true);
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
        ...donations.map((donation) =>
          [
            donation.id,
            donation.amount,
            donation.currency,
            donation.status,
            `"${donation.description || ''}"`,
            donation.paymentMethod || donation.method || '',
            `"${donation.customer || donation.email || donation.contact || ''}"`,
            formatDate(new Date(donation.created * 1000)),
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `donations-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting donations CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResendReceipt = async (donation) => {
    try {
      setResendingId(donation.id);
      const response = await fetch('/api/donations/resend-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: donation.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to resend donation receipt');
      }

      window.alert('Donation receipt resend queued successfully.');
      fetchDonationsDashboard();
    } catch (error) {
      console.error('Error resending donation receipt:', error);
      window.alert(error instanceof Error ? error.message : 'Failed to resend donation receipt');
    } finally {
      setResendingId(null);
    }
  };

  const totals = analytics?.totals;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Donations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            View range-based donations, top donor patterns, and the latest Razorpay records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
            onClick={fetchDonationsDashboard}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </button>
          <button
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            onClick={exportToCsv}
            disabled={isExporting || isLoading || donations.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                range === option.key
                  ? 'bg-primary text-primary-foreground'
                  : 'border bg-background text-foreground'
              }`}
              onClick={() => setRange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {range === 'custom' ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => setCustomStartDate(event.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => setCustomEndDate(event.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Raised</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals?.totalAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Donations</p>
          <p className="mt-2 text-2xl font-semibold">{totals?.donationsCount || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Unique Donors</p>
          <p className="mt-2 text-2xl font-semibold">{totals?.uniqueDonors || 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Repeat Donors</p>
          <p className="mt-2 text-2xl font-semibold">{totals?.repeatDonors || 0}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Campaign Breakdown</h2>
              <p className="text-sm text-muted-foreground">Real totals from captured donations</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(analytics?.campaigns || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No donation activity found in this range.</p>
            ) : (
              analytics.campaigns.map((campaign) => (
                <div key={`${campaign.campaignId || 'general'}-${campaign.campaignTitle}`} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{campaign.campaignTitle}</p>
                      <p className="text-sm text-muted-foreground">{campaign.donationsCount} donations</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(campaign.totalAmount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Top Donor</h2>
          {analytics?.topDonor ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xl font-semibold">{analytics.topDonor.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{analytics.topDonor.email || analytics.topDonor.phone || 'Contact not available'}</p>
                <p className="mt-4 text-2xl font-semibold">{formatCurrency(analytics.topDonor.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">{analytics.topDonor.donationCount} donations</p>
                <p className="mt-2 text-xs text-muted-foreground">Last gift: {formatDate(analytics.topDonor.lastDonationAt)}</p>
              </div>

              <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                Average gift: <span className="font-medium text-foreground">{formatCurrency(totals?.averageDonation)}</span>
                <br />
                Highest single gift: <span className="font-medium text-foreground">{formatCurrency(totals?.maxDonation)}</span>
                <br />
                One-time: <span className="font-medium text-foreground">{formatCurrency(totals?.oneTimeAmount)}</span>
                <br />
                Subscription: <span className="font-medium text-foreground">{formatCurrency(totals?.subscriptionAmount)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No donor data available for this range.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Latest Razorpay Payments</h2>
          <p className="text-sm text-muted-foreground">
            Operational payment feed for reconciliation and donor follow-up.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-3">Donation ID</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Method</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id} className="border-b last:border-0">
                    <td className="px-3 py-3 font-mono text-xs">{donation.id}</td>
                    <td className="px-3 py-3">{formatCurrency(donation.amount)}</td>
                    <td className="px-3 py-3 capitalize">{donation.status}</td>
                    <td className="px-3 py-3 capitalize">{donation.paymentMethod || donation.method || 'N/A'}</td>
                    <td className="px-3 py-3">{donation.customer || donation.email || donation.contact || 'N/A'}</td>
                    <td className="px-3 py-3">{formatDate(new Date(donation.created * 1000))}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground">
                          {donation.receiptNumber ? (
                            <>
                              <span className="font-medium text-foreground">{donation.receiptNumber}</span>
                              <br />
                              Email: {donation.receiptEmailSentAt ? formatDate(donation.receiptEmailSentAt) : 'Pending'}
                              <br />
                              WhatsApp: {donation.receiptWhatsappSentAt ? formatDate(donation.receiptWhatsappSentAt) : 'Pending'}
                            </>
                          ) : (
                            'Receipt not generated yet'
                          )}
                        </div>
                        <button
                          type="button"
                          className="inline-flex w-fit items-center rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                          onClick={() => handleResendReceipt(donation)}
                          disabled={resendingId === donation.id}
                        >
                          {resendingId === donation.id ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-3.5 w-3.5" />
                          )}
                          Resend Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
