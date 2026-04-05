'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useState } from "react";
import axios from "axios";





interface Donation {
    _id: string;
    amountDonated: number;
    createdAt: string;
    user: { _id: string; name: string; email: string };
    campaign: { _id: string; campaignName: string };
  }



const limitTo4Words = (text: string): string => {
  const words = text.split(" ");
  if (words.length > 4) {
    return words.slice(0, 4).join(" ") + "..."; // Add "..." if trimmed
  }
  return text;
};


export default function FundRaiserDonations() {

    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDonations = async () => {
        try {
            const response = await axios.get("/api/fundraiser/donations");
            setDonations(response.data.data);
            
        } catch (err) {
            setError("Failed to load donations.");
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchDonations();
    }, []);

  if (loading) return <p>Loading Donations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  
  return (
    <div className="overflow-hidden w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
           Campaigns Donations
          </h3>
        </div>

        
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Campaign Name
              </TableCell>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Donated Amount
              </TableCell>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {donations.map((donation) => (
              <TableRow key={donation._id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {donation.user.name}
                      </p>
                    
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-blue-800 text-theme-sm dark:text-gray-400">
                  {limitTo4Words(donation.campaign.campaignName)}
                </TableCell>
                <TableCell className="py-3 text-green-600 text-theme-sm dark:text-gray-400">
                 Rs. {donation.amountDonated}
                </TableCell>
               
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(donation.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



