import './App.css';
import getVersion from 'api/version';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { login } from 'store/authentication';
import { useDispatch, useSelector } from 'react-redux';
import { StoreType } from 'store';
import Login from 'routes/login';
import Home from 'routes/home';

const App = () => {
  const logged = useSelector((state : StoreType) => state.auth.logged)
  const dispatch = useDispatch();

  const navigate = useNavigate();
  useEffect(() => {
    getVersion()
      .then(() => {
        dispatch(login);
        navigate("/", { replace: true });
  })
      .catch(() => navigate("/login", { replace: true }));
  }, [])

  return <div>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  </div>
}

export default App;
