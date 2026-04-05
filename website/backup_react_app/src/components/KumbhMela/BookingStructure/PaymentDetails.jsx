// import React from "react";

const PaymentDetails = ({ formData, setFormData, totalCost }) => {
  const formattedTotalCost = (totalCost || 0).toLocaleString("en-IN");
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Payment Details</h3>

      <div className="bg-orange-50 p-6 rounded-lg">
        <div className="text-xl font-bold text-gray-900 mb-2">
          Total Estimated Cost: ₹{formattedTotalCost}
        </div>
        <p className="text-sm text-gray-600">
          Final cost may vary based on actual stay duration and any additional
          services
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Payment Method *
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          value={formData.paymentMethod || ""}
          onChange={(e) =>
            setFormData({ ...formData, paymentMethod: e.target.value })
          }
        >
          <option value="">Select Payment Method</option>
          <option value="upi">UPI</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
          <option value="netbanking">Net Banking</option>
        </select>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            required
            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
            checked={formData.paymentAcknowledgment || false}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentAcknowledgment: e.target.checked,
              })
            }
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700">
            Payment Acknowledgment *
          </label>
          <p className="text-gray-500">
            I understand that a payment link will be sent via SMS/Email upon
            confirmation of my registration, and the booking will only be
            confirmed post-payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
