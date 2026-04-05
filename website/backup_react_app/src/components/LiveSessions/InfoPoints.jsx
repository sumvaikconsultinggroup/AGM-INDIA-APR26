import React from "react";
import { Users, Languages } from "lucide-react";

const InfoPoints = () => {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-gray-700">
        <Users className="h-5 w-5 text-orange-500" />
        <span>
          Over <strong>40,000</strong> people have already enrolled in the
          transformation.
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <Languages className="h-5 w-5 text-orange-500" />
        <span>
          Live sessions are conducted in both <strong>Hindi</strong> and{" "}
          <strong>English</strong> languages.
        </span>
      </div>
    </div>
  );
};

export default InfoPoints;
