import CampaignsDonations from "@/components/CampaignsDonations/CampaignsDonations";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";


export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Donations" />
      <CampaignsDonations />
    </div>
  );
}
