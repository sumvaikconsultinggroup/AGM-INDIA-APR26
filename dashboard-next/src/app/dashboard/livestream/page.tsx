"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import StreamManager from "@/components/livestream/StreamManager";

interface Stream {
  _id: string;
  title: string;
  scheduledStart: string;
  streamType: string;
  youtubeVideoId: string;
  isLive: boolean;
  isUpcoming?: boolean;
}

export default function LiveStreamPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">(
    "upcoming"
  );

  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/livestream?status=${activeTab}`);
      setStreams(res.data.data);
    } catch {
      toast.error("Failed to fetch streams");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const toggleLive = async (stream: Stream) => {
    try {
      await axios.put("/api/livestream", {
        id: stream._id,
        isLive: !stream.isLive,
        isUpcoming: false,
      });
      toast.success(
        stream.isLive ? "Stream marked as ended" : "Stream marked as LIVE"
      );
      fetchStreams();
    } catch {
      toast.error("Failed to update stream status");
    }
  };

  const tabs = [
    { key: "live" as const, label: "Live Now" },
    { key: "upcoming" as const, label: "Upcoming" },
    { key: "past" as const, label: "Past" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Live Streams</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage live satsang and pravachan streams
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStream(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          + Schedule Stream
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border p-6">
          <StreamManager
            initialData={editingStream}
            onSuccess={() => {
              setShowForm(false);
              setEditingStream(null);
              fetchStreams();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingStream(null);
            }}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.key === "live" && streams.some((s) => s.isLive) && (
              <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {activeTab} streams
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {streams.map((stream) => (
              <div
                key={stream._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {stream.isLive && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      LIVE
                    </span>
                  )}
                  <div>
                    <h3 className="font-medium">{stream.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(stream.scheduledStart).toLocaleString("en-IN")}{" "}
                      · {stream.streamType} · YT: {stream.youtubeVideoId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLive(stream)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      stream.isLive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {stream.isLive ? "End Stream" : "Go Live"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingStream(stream);
                      setShowForm(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
