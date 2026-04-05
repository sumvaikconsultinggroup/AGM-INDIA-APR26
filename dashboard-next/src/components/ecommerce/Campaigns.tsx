'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "axios";




interface Campaign {
  _id: string;
  campaignName: string;
  goalAmount: string | number;
  raisedAmount: string | number;
  isActive: boolean;
  createdAt: string; // Add createdAt property
}

// Function to sort campaigns by createdAt in descending order
const sortCampaignsByDate = (campaigns: Campaign[]): Campaign[] => {
  return campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const limitTo12Words = (text: string): string => {
  const words = text.split(" ");
  if (words.length > 2) {
    return words.slice(0, 2).join(" ") + "..."; // Add "..." if trimmed
  }
  return text;
};


export default function Campaigns() {

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("/api/fundraiser");
        const sortedCampaigns = sortCampaignsByDate(response.data.data); // Sort campaigns
        setCampaigns(sortedCampaigns);
      } catch (err) {
        setError("Failed to load campaigns.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  

  if (loading) return <p>Loading campaigns...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
           Recent Campaigns
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
                Goal Amount
              </TableCell>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Raised Amount
              </TableCell>
              <TableCell
                
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {campaigns.map((campaign) => (
              <TableRow key={campaign._id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {limitTo12Words(campaign.campaignName)}
                      </p>
                    
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-blue-800 text-theme-sm dark:text-gray-400">
                  {campaign.goalAmount}
                </TableCell>
                <TableCell className="py-3 text-green-600 text-theme-sm dark:text-gray-400">
                 Rs. {campaign.raisedAmount}
                </TableCell>
               
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      campaign.isActive === true
                        ? "success"
                        : "error"
                        
                    }
                  >
                    {campaign.isActive === true ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



