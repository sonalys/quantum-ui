import logo from './logo.svg';
import './App.css';
import get_version from 'api/version';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from 'routes/login/login';
import { useEffect } from 'react';

export default () => {
  const navigate = useNavigate();
  useEffect(() => {
    get_version()
      .then(() => navigate("/home", { replace: true }))
      .catch(() => navigate("/", { replace: true }));
  }, [])

  return <div>
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  </div>
};
