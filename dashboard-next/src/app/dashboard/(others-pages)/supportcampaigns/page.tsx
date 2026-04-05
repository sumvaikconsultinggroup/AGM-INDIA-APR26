import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import React from "react";


export default function SupportCampaigns() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support Campaigns" />
      <div className="space-y-6">
        <ComponentCard title="Support Campaigns">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
