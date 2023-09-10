import React,{useState} from 'react'
import { Login } from './Login';
import { RegistrationForm } from './RegistrationForm';
export default function MainPage() {
    const [userData, setUserData] = useState({});
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(true);
  
    const toggleLogin = () => {
      setShowLogin(true);
      setShowRegister(false);
    };
  
    const toggleRegister = () => {
      setShowLogin(false);
      setShowRegister(true);
    };
  return (
    <>
    <div className="header">
    <button className={showLogin ? 'active' : ''} onClick={toggleLogin}>
      Login
    </button>
    <button className={showRegister ? 'active' : ''} onClick={toggleRegister}>
      Register
    </button>
  </div>
  {showLogin && <Login />}
  {showRegister && <RegistrationForm />}
  </>
  )
}
