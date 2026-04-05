const AddressDetails = ({ formData, setFormData }) => {
  const handleSameAddress = (e) => {
    if (e.target.checked) {
      setFormData({
        ...formData,
        communicationAddress: formData.permanentAddress,
        sameAsPermament: true,
      });
    } else {
      setFormData({
        ...formData,
        communicationAddress: "",
        sameAsPermament: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Address Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Permanent Address *
        </label>
        <textarea
          required
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          placeholder="Street, City, State, Pin Code, Country"
          value={formData.permanentAddress}
          onChange={(e) =>
            setFormData({ ...formData, permanentAddress: e.target.value })
          }
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="sameAddress"
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          checked={formData.sameAsPermament}
          onChange={handleSameAddress}
        />
        <label
          htmlFor="sameAddress"
          className="ml-2 block text-sm text-gray-700"
        >
          Communication Address same as Permanent Address
        </label>
      </div>

      {!formData.sameAsPermament && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Communication Address *
          </label>
          <textarea
            required
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            placeholder="Street, City, State, Pin Code, Country"
            value={formData.communicationAddress}
            onChange={(e) =>
              setFormData({ ...formData, communicationAddress: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
};

export default AddressDetails;
