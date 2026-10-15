import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Profile from "./pages/Profile/Profile";
import Posts from "./pages/Posts/Posts";
import SessionManager from "./services/SessionManager";
import ProtectedRoute from "./services/protectedroute";

function App() {
  return (
    <BrowserRouter>
      <SessionManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />}/>
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;