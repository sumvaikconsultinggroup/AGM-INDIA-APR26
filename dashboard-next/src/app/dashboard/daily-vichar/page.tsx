"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import VicharForm from "@/components/dailyvichar/VicharForm";
import VicharCalendar from "@/components/dailyvichar/VicharCalendar";

interface Vichar {
  _id: string;
  date: string;
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source: string;
  category: string;
  isPublished: boolean;
  notificationSent: boolean;
  [key: string]: unknown;
}

export default function DailyVicharPage() {
  const [vichars, setVichars] = useState<Vichar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVichar, setEditingVichar] = useState<Vichar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVichars = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/daily-vichar?limit=60");
      setVichars(res.data.data);
    } catch {
      toast.error("Failed to fetch vichars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVichars();
  }, [fetchVichars]);

  const handleEdit = (vichar: Vichar) => {
    setEditingVichar(vichar);
    setShowForm(true);
  };

  const handleSendNotification = async (vichar: Vichar) => {
    try {
      await axios.post("/api/notifications/send", {
        title: `🙏 ${vichar.titleHindi}`,
        body: vichar.contentHindi.substring(0, 100) + "...",
        topic: "daily-vichar",
        data: { type: "daily-vichar", vicharId: vichar._id },
      });
      await axios.put("/api/daily-vichar", {
        id: vichar._id,
        notificationSent: true,
      });
      toast.success("Notification sent successfully");
      fetchVichars();
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVichar(null);
    fetchVichars();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Daily Vichar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage daily spiritual thoughts and quotes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVichar(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          + Add Vichar
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium mb-4">
            {editingVichar ? "Edit Vichar" : "Create New Vichar"}
          </h2>
          <VicharForm
            initialData={editingVichar}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingVichar(null);
            }}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <VicharCalendar
            vichars={vichars}
            onEdit={handleEdit}
            onSendNotification={handleSendNotification}
          />
        )}
      </div>
    </div>
  );
}
