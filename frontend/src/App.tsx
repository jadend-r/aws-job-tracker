// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login_Redirect from './pages/Login_Redirect';
import Dashboard from './pages/Dashboard';
import Login from "./pages/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-redirect" element={<Login_Redirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
