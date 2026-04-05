"use client";

import React from "react";

interface Vichar {
  _id: string;
  date: string;
  titleEnglish: string;
  titleHindi: string;
  isPublished: boolean;
  notificationSent: boolean;
  category: string;
}

interface VicharCalendarProps {
  vichars: Vichar[];
  onEdit: (vichar: Vichar) => void;
  onSendNotification: (vichar: Vichar) => void;
}

const categoryColors: Record<string, string> = {
  vedanta: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  yoga: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dharma: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  life: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  prayer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  festival: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function VicharCalendar({
  vichars,
  onEdit,
  onSendNotification,
}: VicharCalendarProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Notification
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {vichars.map((vichar) => (
            <tr key={vichar._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 text-sm">
                {new Date(vichar.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium">{vichar.titleEnglish}</div>
                <div className="text-xs text-gray-500">{vichar.titleHindi}</div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${categoryColors[vichar.category] || ""}`}
                >
                  {vichar.category}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    vichar.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {vichar.isPublished ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                {vichar.notificationSent ? (
                  <span className="text-green-600 text-sm">Sent ✓</span>
                ) : vichar.isPublished ? (
                  <button
                    onClick={() => onSendNotification(vichar)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Send Now
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(vichar)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
