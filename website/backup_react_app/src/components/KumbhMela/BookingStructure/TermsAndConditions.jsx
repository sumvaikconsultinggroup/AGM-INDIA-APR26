// import React from "react";

const TermsAndConditions = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Terms and Conditions
      </h3>

      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 space-y-2">
        <h4 className="font-medium">Key Terms:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>50% advance payment is required for booking confirmation</li>
          <li>Free cancellation up to 7 days before check-in</li>
          <li>50% refund for cancellations between 3-7 days before check-in</li>
          <li>No refund for cancellations within 3 days of check-in</li>
          <li>Check-in: 2:00 PM, Check-out: 11:00 AM</li>
        </ul>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            required
            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
            checked={formData.termsAccepted}
            onChange={(e) =>
              setFormData({ ...formData, termsAccepted: e.target.checked })
            }
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700">
            Accept Terms and Conditions *
          </label>
          <p className="text-gray-500">
            I confirm that the information provided is accurate, and I agree to
            the terms and conditions of Prabhu Premi Sangh's Kumbh Mahaparv
            program.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
