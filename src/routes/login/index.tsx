import "./style.css";
import doLogin from "api/auth";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from 'store/authentication';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const submitHandler = (e : FormEvent) => {
    e.preventDefault();
    doLogin(username, password).then(() => {
      dispatch(login);
      navigate("/", { replace: true });
    });
  };
  return <div className="login">
    <form className="login-form shadow" onSubmit={submitHandler}>
      <h1 className="self-center">QBittorrent</h1>
      <label>Login</label>
      <input onChange={e => setUser(e.target.value)}/>
      <label>Password</label>
      <input type={"password"} onChange={e => setPass(e.target.value)}/>
      <input className="submit" type="submit" value="Login" />
    </form>
  </div>
}

export default LoginPage;