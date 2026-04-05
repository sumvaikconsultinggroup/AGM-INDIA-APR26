// import React from "react";

const GroupRegistration = ({ formData, setFormData }) => {
  const handleAddMember = () => {
    setFormData({
      ...formData,
      groupMembers: [
        ...formData.groupMembers,
        { name: "", age: "", gender: "", idFile: null },
      ],
    });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = formData.groupMembers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      groupMembers: updatedMembers,
    });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = formData.groupMembers.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    setFormData({
      ...formData,
      groupMembers: updatedMembers,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Group Registration
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Are You Registering as a Group? *
        </label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-orange-600"
              name="isGroup"
              value="yes"
              checked={formData.isGroup === "yes"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isGroup: e.target.value,
                  groupMembers: e.target.value === "yes" ? [] : [],
                })
              }
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-orange-600"
              name="isGroup"
              value="no"
              checked={formData.isGroup === "no"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isGroup: e.target.value,
                  groupMembers: e.target.value === "yes" ? [] : [],
                })
              }
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      </div>

      {formData.isGroup === "yes" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Members
            </label>
            <div className="mt-4 space-y-4">
              {formData.groupMembers.map((member, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        value={member.name}
                        onChange={(e) =>
                          handleMemberChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        value={member.age}
                        onChange={(e) =>
                          handleMemberChange(index, "age", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender *
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        value={member.gender}
                        onChange={(e) =>
                          handleMemberChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      ID Proof *
                    </label>
                    <input
                      type="file"
                      required
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100"
                      onChange={(e) =>
                        handleMemberChange(index, "idFile", e.target.files[0])
                      }
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveMember(index)}
                    >
                      Remove Member
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              onClick={handleAddMember}
            >
              Add Group Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupRegistration;
