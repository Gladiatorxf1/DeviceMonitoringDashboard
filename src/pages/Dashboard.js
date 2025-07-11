import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  console.log("🏁 Dashboard rendered");

  // ✅ Hardcoded 20 dummy devices
  const allDevices = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const perPage = 8;

  const [liveStatuses, setLiveStatuses] = useState({});

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const statuses = JSON.parse(event.data);
      const statusMap = {};
      statuses.forEach((device) => {
        statusMap[device.id] = device;
      });
      setLiveStatuses(statusMap);
    };

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    socket.onclose = () => {
      console.log("❌ Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, []);

  const totalPages = Math.ceil(allDevices.length / perPage);
  const start = (page - 1) * perPage;
  const currentDevices = allDevices.slice(start, start + perPage);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Live Device Monitoring Dashboard
      </h1>

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {currentDevices.map((device) => {
          const status = liveStatuses[device.id];

          return (
            <div
              key={device.id}
              className="p-4 border rounded shadow w-full bg-white"
            >
              <h3 className="text-lg font-bold mb-2">Device {device.id}</h3>
              {status ? (
                <div className="text-sm space-y-1">
                  <p>📶 Line: {status.line}</p>
                  <p>📻 Radio: {status.radio ? "On" : "Off"}</p>
                  <p>🔋 Voltage: {status.voltage} V</p>
                  <p className="text-xs text-gray-500">
                    🕒 {new Date(status.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Waiting for status...</p>
              )}
              {device.id <= 5 && (
                <Link to={`/recordings/${device.id}`}>
                  <button className="bg-blue-500 text-white px-2 py-1 mt-3 rounded hover:bg-blue-600">
                    🎧 Recordings
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Buttons */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
