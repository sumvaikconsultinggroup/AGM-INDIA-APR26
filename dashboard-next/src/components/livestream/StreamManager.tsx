"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";

interface StreamFormData {
  title: string;
  description: string;
  youtubeVideoId: string;
  streamType: string;
  scheduledStart: string;
  scheduledEnd: string;
}

type StreamInitialData = Partial<StreamFormData> & { _id?: string };

interface StreamManagerProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: StreamInitialData;
}

export default function StreamManager({
  onSuccess,
  onCancel,
  initialData,
}: StreamManagerProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StreamFormData>({
    defaultValues: initialData || { streamType: "satsang" },
  });

  const onSubmit = async (data: StreamFormData) => {
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put("/api/livestream", { id: initialData._id, ...data });
        toast.success("Stream updated");
      } else {
        await axios.post("/api/livestream", data);
        toast.success("Stream created");
      }
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error((error.response?.data as { message?: string } | undefined)?.message || "Failed to save stream");
      } else {
        toast.error("Failed to save stream");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="Evening Satsang with Swami Ji"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          YouTube Video/Live ID
        </label>
        <input
          {...register("youtubeVideoId", {
            required: "YouTube ID is required",
          })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="e.g., dQw4w9WgXcQ"
        />
        <p className="text-xs text-gray-500 mt-1">
          The ID from the YouTube URL (after v= or youtu.be/)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            {...register("streamType")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="satsang">Satsang</option>
            <option value="pravachan">Pravachan</option>
            <option value="kumbh">Kumbh Mela</option>
            <option value="festival">Festival</option>
            <option value="special">Special Event</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled Start
          </label>
          <input
            type="datetime-local"
            {...register("scheduledStart", {
              required: "Start time is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled End
          </label>
          <input
            type="datetime-local"
            {...register("scheduledEnd")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
