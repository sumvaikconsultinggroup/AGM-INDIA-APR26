// import React from "react";

const ConfirmationModal = ({ isOpen, onClose, registrationData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Registration Successful!
        </h3>

        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-md">
            <p className="font-medium text-green-800">
              Registration ID: {registrationData.registrationId}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Next Steps:</h4>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
              <li>Check your email/SMS for confirmation details</li>
              <li>Complete the payment using the provided payment link</li>
              <li>Save your registration ID for future reference</li>
            </ol>
          </div>

          <div className="bg-orange-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">
              Payment Instructions
            </h4>
            <p className="text-sm text-gray-600">
              Total Amount: ₹
              {registrationData.totalCost.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-600">
              A payment link will be sent to your registered email and mobile
              number.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p>For any queries, please contact:</p>
            <p>Email: support@prabhupremisangh.org</p>
            <p>Phone: +91-XXXXXXXXXX</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
