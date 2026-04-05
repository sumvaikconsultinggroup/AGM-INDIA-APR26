// import React from "react";

const AccommodationPreferences = ({ formData, setFormData }) => {
  const calculateCost = () => {
    if (
      !formData.kutijaType ||
      !formData.arrivalDate ||
      !formData.departureDate ||
      !formData.numberOfPersons
    ) {
      return 0;
    }

    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);
    const days = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));

    let costPerDay = 0;
    switch (formData.kutijaType) {
      case "ganga":
        costPerDay = 7500;
        break;
      case "yamuna":
        costPerDay =
          formData.numberOfPersons <= 6
            ? 9000
            : formData.numberOfPersons * 2000;
        break;
      case "saraswati":
        costPerDay =
          formData.numberOfPersons <= 12
            ? 12000
            : formData.numberOfPersons * 1500;
        break;
      default:
        costPerDay = 0;
    }

    return costPerDay * days;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Accommodation Preferences
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type of Kutiya Required *
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.kutijaType}
            onChange={(e) =>
              setFormData({ ...formData, kutijaType: e.target.value })
            }
          >
            <option value="">Select Kutiya Type</option>
            <option value="ganga">
              Ganga Kutiya (₹7500/day for 3 persons)
            </option>
            <option value="yamuna">
              Yamuna Kutiya (₹9000/day for 6 persons or ₹2000/person/day)
            </option>
            <option value="saraswati">
              Saraswati Kutiya (₹12000/day for 12 persons or ₹1500/person/day)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Persons *
          </label>
          <input
            type="number"
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.numberOfPersons}
            onChange={(e) =>
              setFormData({ ...formData, numberOfPersons: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Arrival Date *
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.arrivalDate}
            onChange={(e) =>
              setFormData({ ...formData, arrivalDate: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Departure Date *
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.departureDate}
            onChange={(e) =>
              setFormData({ ...formData, departureDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Proximity to Swami Ji's Kutiya *
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-orange-600"
                name="proximity"
                value="yes"
                checked={formData.proximityPreference === "yes"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proximityPreference: e.target.value,
                  })
                }
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-orange-600"
                name="proximity"
                value="no"
                checked={formData.proximityPreference === "no"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proximityPreference: e.target.value,
                  })
                }
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Special Requirements
        </label>
        <textarea
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          placeholder="Any special needs like wheelchair access, dietary restrictions, etc."
          value={formData.specialRequirements}
          onChange={(e) =>
            setFormData({ ...formData, specialRequirements: e.target.value })
          }
        />
      </div>

      <div className="bg-orange-50 p-4 rounded-md">
        <p className="text-lg font-semibold">
          Estimated Cost: ₹{calculateCost().toLocaleString("en-IN")}
        </p>
        <p className="text-sm text-gray-600">
          Based on selected accommodation and duration
        </p>
      </div>
    </div>
  );
};

export default AccommodationPreferences;
