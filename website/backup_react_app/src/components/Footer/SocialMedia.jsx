import React from "react";
import {
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Hash,
} from "lucide-react";

const SocialMedia = () => {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">SOCIAL MEDIA</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-300">
          <Youtube className="w-5 h-5" />
          <span>YouTube: 61 Million+ subscribers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Facebook className="w-5 h-5" />
          <span>Facebook: 12 Million+ followers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Instagram className="w-5 h-5" />
          <span>Instagram: 5 Million+ followers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Twitter className="w-5 h-5" />
          <span>X (Twitter): 1.4 Million+ followers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp Channel: 500K+ followers</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Hash className="w-5 h-5" />
          <span>Threads: 700K+ followers</span>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
