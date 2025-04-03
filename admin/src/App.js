import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" exact={true} element={<Dashboard />} />
        <Route path="/dashboard" exact={true} element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
