import "./App.css";
import { Routes,Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Recordings from "./pages/Recording";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>}></Route>
      <Route path="/recordings/:deviceId" element={<Recordings/>}></Route>
    </Routes>
  );
}

export default App;
