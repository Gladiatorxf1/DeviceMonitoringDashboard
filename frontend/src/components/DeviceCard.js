import { useNavigate } from "react-router-dom";

function DeviceCard({ device, visible }) {
  const navigate = useNavigate();

  return (
    <div className={`p-4 border rounded shadow ${visible ? "" : "hidden"}`}>
      <h2 className="font-bold text-lg">Device {device.id}</h2>
      <p>Line: {device.line}</p>
      <p>Radio: {device.radio}</p>
      <p>Status: <span className={device.status === 'Online' ? 'text-green-600' : 'text-red-600'}>{device.status}</span></p>
      <button
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        onClick={() => navigate(`/recordings/${device.id}`)}
      >
        Recordings
      </button>
    </div>
  );
}

export default DeviceCard;
