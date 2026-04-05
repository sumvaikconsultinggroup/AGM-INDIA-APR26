import React from "react";
import { Mail, Phone } from "lucide-react";

const ContactUs = () => {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">CONTACT US</h3>
      <div className="space-y-3">
        <a
          href="mailto:support@advait.org.in"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <Mail className="w-5 h-5" />
          <span>info@sumvaik.com</span>
        </a>
        <a
          href="tel:+919650585100"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <Phone className="w-5 h-5" />
          <span>+91 9999187566</span>
        </a>
      </div>
    </div>
  );
};

export default ContactUs;
