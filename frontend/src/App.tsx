// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginRedirect from './pages/LoginRedirect';
import Dashboard from './pages/Dashboard';
import Login from "./pages/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-redirect" element={<LoginRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
