import { Routes, Route} from "react-router-dom";
import './App.css';
import Home from "./pages/Home/Home.js";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Navigation from "./components/shared/Navigation/Navigation";

function App() {
  return (
   <>
  <Navigation />
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
   </Routes>
   </>
  );
}

export default App;
