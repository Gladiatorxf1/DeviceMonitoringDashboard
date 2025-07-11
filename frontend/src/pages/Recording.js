import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Recordings() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterLine, setFilterLine] = useState("");
  const [filterInOut, setFilterInOut] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [recordings, setRecordings] = useState([]);
  const [date, setDate] = useState("2025-07-11");
  const [playingId, setPlayingId] = useState(null);

  const fetchRecordings = async () => {
    try {
      const res = await fetch(
        `https://0c804fd8cb2a.ngrok-free.app/api/recordings/${deviceId}?date=${date}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text.substring(0, 200));
        throw new Error("Server returned HTML instead of JSON");
      }

      const data = await res.json();
      setRecordings(data);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setRecordings([]);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [date, deviceId]);

  const handlePlay = (id) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-4">
      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ⬅ Back
        </button>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="space-x-2">
          <button
            onClick={fetchRecordings}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            🔄 RELOAD
          </button>
          <button
            onClick={async () => {
              setIsSyncing(true);
              await fetchRecordings();
              setTimeout(() => {
                setIsSyncing(false);
                alert("🔄 Sync complete!");
              }, 1000);
            }}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            🔁 SYNC
          </button>

          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
          >
            🔍 FILTER
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="bg-gray-100 p-4 rounded mb-4 space-y-3">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm">Line</label>
              <select
                value={filterLine}
                onChange={(e) => setFilterLine(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="">All</option>
                <option value="1">Line 1</option>
                <option value="2">Line 2</option>
                <option value="3">Line 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm">In/Out</label>
              <select
                value={filterInOut}
                onChange={(e) => setFilterInOut(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="">All</option>
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm">Min Duration (s)</label>
              <input
                type="number"
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="border p-1 rounded w-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recordings Table */}
      {recordings.length === 0 ? (
        <p className="text-red-600 font-semibold">
          No Recordings for current date
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Line</th>
                <th className="p-2 border">Channel</th>
                <th className="p-2 border">In/Out</th>
                <th className="p-2 border">Phone No</th>
                <th className="p-2 border">Duration</th>
                <th className="p-2 border">Date & Time</th>
                <th className="p-2 border">Comment</th>
                <th className="p-2 border">Play</th>
              </tr>
            </thead>
            <tbody>
              {recordings
                .filter((rec) => {
                  return (
                    (filterLine === "" || rec.line === Number(filterLine)) &&
                    (filterInOut === "" || rec.in_out === filterInOut) &&
                    (filterDuration === "" ||
                      rec.duration >= Number(filterDuration))
                  );
                })
                .map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-100">
                    <td className="p-2 border">{rec.name}</td>
                    <td className="p-2 border">{rec.line}</td>
                    <td className="p-2 border">{rec.channel}</td>
                    <td className="p-2 border">{rec.in_out}</td>
                    <td className="p-2 border">{rec.phone_no}</td>
                    <td className="p-2 border">{rec.duration} s</td>
                    <td className="p-2 border">
                      {new Date(rec.datetime).toLocaleString()}
                    </td>
                    <td className="p-2 border">{rec.comment}</td>
                    <td className="p-2 border">
                      {playingId === rec.id ? (
                        <audio
                          src={`https://0c804fd8cb2a.ngrok-free.app/recordings/${rec.filename}`}
                          controls
                          autoPlay
                          onEnded={() => setPlayingId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => handlePlay(rec.id)}
                          className="bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          ▶ Play
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Recordings;
