import './App.css';
import getVersion from 'api/version';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import Login from 'routes/login';
import Home from 'routes/home';

const App = () => {
  const navigate = useNavigate();
  useMemo(() => {
    getVersion()
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate])

  return <div>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  </div>
}

export default App;
