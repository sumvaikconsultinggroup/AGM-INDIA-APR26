"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";

interface VicharFormData {
  date: string;
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source: string;
  category: string;
  isPublished: boolean;
}

interface VicharFormProps {
  initialData?: VicharFormData & { _id: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VicharForm({
  initialData,
  onSuccess,
  onCancel,
}: VicharFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VicharFormData>({
    defaultValues: initialData || {
      category: "vedanta",
      isPublished: false,
    },
  });

  const onSubmit = async (data: VicharFormData) => {
    setLoading(true);
    try {
      if (initialData?._id) {
        await axios.put("/api/daily-vichar", {
          id: initialData._id,
          ...data,
        });
        toast.success("Vichar updated successfully");
      } else {
        await axios.post("/api/daily-vichar", data);
        toast.success("Vichar created successfully");
      }
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error((error.response?.data as { message?: string } | undefined)?.message || "Failed to save vichar");
      } else {
        toast.error("Failed to save vichar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            {...register("date", { required: "Date is required" })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            {...register("category")}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="vedanta">Vedanta</option>
            <option value="yoga">Yoga</option>
            <option value="dharma">Dharma</option>
            <option value="life">Life</option>
            <option value="prayer">Prayer</option>
            <option value="festival">Festival</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title (Hindi)
          </label>
          <input
            {...register("titleHindi", {
              required: "Hindi title is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="आज का विचार"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Title (English)
          </label>
          <input
            {...register("titleEnglish", {
              required: "English title is required",
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Thought of the Day"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Content (Hindi)
          </label>
          <textarea
            {...register("contentHindi", {
              required: "Hindi content is required",
            })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="हिंदी में विचार लिखें..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Content (English)
          </label>
          <textarea
            {...register("contentEnglish", {
              required: "English content is required",
            })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
            placeholder="Write thought in English..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <input
          {...register("source")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
          placeholder="e.g., Bhagavad Gita 2.47, Swami Ji Pravachan"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isPublished")}
          className="rounded"
        />
        <label className="text-sm">Publish immediately</label>
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
          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
