import { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  useEffect(() => {
    const errs = {};
    if (!credential || credential.length < 4) {
      errs.credential = "Credential field is required";
    }
    if (!password || password.length < 6) {
      errs.password = "Password field is required";
    }
    setErrors(errs);
  }, [credential, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
    setCredential("");
    setPassword("");
  };

  const demoLogin = () => {
    dispatch(
      sessionActions.login({ credential: "Demo-lition", password: "password" })
    )
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Log In</h1>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p>{errors.password}</p>}
        <button type="submit" disabled={Object.keys(errors).length}>
          Log In
        </button>
        <button type="button" onClick={demoLogin}>
          Log In as Demo User
        </button>
      </form>
    </>
  );
}

export default LoginFormModal;
