const Volunteering = ({ formData, setFormData }) => {
  const handleVolunteerAreaChange = (area) => {
    const currentAreas = formData.volunteerAreas || [];
    const updatedAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area];

    setFormData({ ...formData, volunteerAreas: updatedAreas });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Volunteering and Participation
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Are You Interested in Volunteering During the Event? *
        </label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-orange-600"
              name="isVolunteer"
              value="yes"
              checked={formData.isVolunteer === "yes"}
              onChange={(e) =>
                setFormData({ ...formData, isVolunteer: e.target.value })
              }
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-orange-600"
              name="isVolunteer"
              value="no"
              checked={formData.isVolunteer === "no"}
              onChange={(e) =>
                setFormData({ ...formData, isVolunteer: e.target.value })
              }
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      </div>

      {formData.isVolunteer === "yes" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Areas of Interest *
          </label>
          <div className="space-y-2">
            {[
              "Food Distribution",
              "Crowd Management",
              "Medical Assistance",
              "Kutiya Management",
            ].map((area) => (
              <label key={area} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  checked={(formData.volunteerAreas || []).includes(area)}
                  onChange={() => handleVolunteerAreaChange(area)}
                />
                <span className="ml-2 text-gray-700">{area}</span>
              </label>
            ))}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  checked={(formData.volunteerAreas || []).includes("Other")}
                  onChange={() => handleVolunteerAreaChange("Other")}
                />
                <span className="ml-2 text-gray-700">Other</span>
              </label>
              {(formData.volunteerAreas || []).includes("Other") && (
                <input
                  type="text"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Please specify"
                  value={formData.otherVolunteerArea || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherVolunteerArea: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comments for the Organizers
        </label>
        <textarea
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          placeholder="Any additional notes or comments for the organizers"
          value={formData.organizerComments}
          onChange={(e) =>
            setFormData({ ...formData, organizerComments: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default Volunteering;
