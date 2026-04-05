const Calendar = () => {
  const events = [
    { date: 4, type: "SS", color: "bg-green-500" },
    { date: 5, type: "EX", color: "bg-purple-500" },
    { date: 7, type: "BP", color: "bg-blue-500" },
    { date: 26, type: "EX", color: "bg-purple-500" },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-2xl font-bold text-gray-900">
        Sessions Schedule
      </h3>

      {/* Calendar Grid */}
      <div className="mb-6">
        <div className="mb-4 text-lg font-semibold">December 2024</div>
        <div className="grid grid-cols-7 gap-2">
          {/* Week days */}
          {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {Array.from({ length: 31 }, (_, i) => {
            const date = i + 1;
            const event = events.find((e) => e.date === date);

            return (
              <div
                key={date}
                className={`relative flex h-8 items-center justify-center rounded-full text-sm
                    ${
                      event ? event.color + " text-white" : "hover:bg-gray-100"
                    }`}
              >
                {date}
                {event && (
                  <span className="absolute -bottom-4 text-[10px] font-medium text-gray-600">
                    {event.type}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Details */}
      <div className="border-t pt-4">
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="font-semibold text-purple-900">Exam</div>
          <div className="text-sm text-purple-700">10:00 PM (1 Hour)</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
