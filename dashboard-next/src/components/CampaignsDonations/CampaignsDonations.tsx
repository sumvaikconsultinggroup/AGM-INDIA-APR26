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
  amount: number;
  createdAt: string;
  user: { _id: string; fullName: string; email: string, mobileNo: number | string, dob: string, country: string, panNumber: string };
}



const CampaignsDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get("/api/donations");
        setDonations(response.data.data);
        
      } catch (error:unknown) {
        setError("Failed to load donations.");
        if (axios.isAxiosError(error) && error.response) {
          console.log(error.response.data);
        } else {
          console.log("An unexpected error occurred:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) return <p>Loading donations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;



  return (
    <div className="overflow-hidden w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
           All Donations
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
        </button>
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
              Mobile No.
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Donated Amount
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Email
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Date
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Date of Birth
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Country
            </TableCell>
            <TableCell
              
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Pan Card
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
                      {donation.user.fullName}
                    </p>
                  
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 text-blue-800 text-theme-sm dark:text-gray-400">
                {donation.user.mobileNo}
              </TableCell>
              <TableCell className="py-3 text-green-600 text-theme-sm dark:text-gray-400">
               Rs. {donation.amount}
              </TableCell>
             
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {donation.user.email}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(donation.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {donation.user.dob}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {donation.user.country}
              </TableCell>
              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {donation.user.panNumber === '' ? "Not Available" : "Available"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
  );
};

export default CampaignsDonations;
