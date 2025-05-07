// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginRedirect from './pages/LoginRedirect';
import Dashboard from './pages/Dashboard';
import Login from "./pages/Login"

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-redirect" element={<LoginRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    
  );
}

export default App;
