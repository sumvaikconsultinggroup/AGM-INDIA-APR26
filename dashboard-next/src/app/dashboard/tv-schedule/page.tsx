"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TVScheduleFormData {
  channel: string;
  channelName: string;
  programName: string;
  description: string;
  dayOfWeek: number[];
  timeSlot: string;
  duration: number;
  isRecurring: boolean;
}

interface TVScheduleItem extends TVScheduleFormData {
  _id: string;
}

export default function TVSchedulePage() {
  const [schedules, setSchedules] = useState<TVScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const { register, handleSubmit, reset } = useForm<TVScheduleFormData>();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/tv-schedule");
      setSchedules(res.data.data);
    } catch {
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onSubmit = async (data: TVScheduleFormData) => {
    try {
      await axios.post("/api/tv-schedule", {
        ...data,
        dayOfWeek: selectedDays,
      });
      toast.success("TV schedule added");
      reset();
      setSelectedDays([]);
      setShowForm(false);
      fetchSchedules();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error((error.response?.data as { message?: string } | undefined)?.message || "Failed to save");
      } else {
        toast.error("Failed to save");
      }
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">TV Broadcast Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sanskar TV & Aastha TV broadcast timings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg"
        >
          + Add Schedule
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Channel
                </label>
                <select
                  {...register("channel", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                >
                  <option value="sanskar">Sanskar TV</option>
                  <option value="aastha">Aastha TV</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Channel Name
                </label>
                <input
                  {...register("channelName", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="Sanskar TV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Program Name
                </label>
                <input
                  {...register("programName", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="Swami Ji Pravachan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAY_NAMES.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedDays.includes(i)
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Slot
                </label>
                <input
                  {...register("timeSlot", { required: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="7:00 AM - 8:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  {...register("duration", { required: true, valueAsNumber: true })}
                  className="w-full rounded-lg border px-4 py-2.5 dark:bg-gray-800"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        schedule.channel === "sanskar"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {schedule.channelName}
                    </span>
                    <span className="font-medium">{schedule.programName}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {schedule.dayOfWeek.map((d: number) => DAY_NAMES[d].substring(0, 3)).join(", ")}{" "}
                    · {schedule.timeSlot} · {schedule.duration} min
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await axios.delete(`/api/tv-schedule?id=${schedule._id}`);
                    toast.success("Deleted");
                    fetchSchedules();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
