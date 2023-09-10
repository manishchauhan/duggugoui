import React, { useState, useEffect } from 'react';
import './RegistrationForm.css';
import { useFetch, fetchData,useHttpRequest } from '../Util/http';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
export function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
   const [loading, apiData, setApiData, success, setSuccess, error, setError, sendHttpRequest] = useHttpRequest();
  const [internalError, setInternalError] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function
  useEffect(()=>{
    async function validateLogin()
    {
        try
        {
          const responseData=await fetchData(`http://localhost:8080/user/home`);
            //move to game page if everything is ok
            if(responseData.status)
            {
              navigate('/home');
            }
        }catch(error)
        {
          setInternalError('Something happen wrong ' + error.message);
        }
    }
    validateLogin();
  },[])
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);
 
  async function handleRegister() {
    clearErrors();

    if (!username) {
      setUsernameError('Username is required');
    } else if (!/^[A-Za-z0-9_-]+$/.test(username) || username.length < 6) {
      setUsernameError(
        'Username should contain only letters, numbers, hyphens, and underscores and be at least 6 characters long.'
      );
    }

    if (!password) {
      setPasswordError('Password is required');
    } else if (
      !/^([A-Za-z0-9_-]|[@!#$&])+$/i.test(password) ||
      password.length < 6
    ) {
      setPasswordError(
        'Password should contain only letters, numbers, hyphens, underscores, and the characters @, !, #, $, and &. It should be at least 6 characters long.'
      );
    }

    if (!email) {
      setEmailError('Email is required');
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
    }

    if (
      username &&
      password &&
      email &&
      isValidEmail(email) &&
      /^[A-Za-z0-9_-]+$/.test(username) &&
      username.length >= 6 &&
      /^([A-Za-z0-9_-]|[@!#$&])+$/i.test(password) &&
      password.length >= 6
    ) {
      // Implement registration logic here
      try {
        const data = {
          username: username,
          password: password,
          email: email,
        };
        await sendHttpRequest(
          `http://localhost:8080/user/register`,
          'POST',
          data
        );
        if (success) {
          clearForm();
        }
      } catch (err) {
        setInternalError('Failed to register: ' + err.message);
      }
    }
  }

  function clearErrors() {
    setUsernameError('');
    setPasswordError('');
    setEmailError('');
    setSuccess(false);
    setError(null);
  }

  function clearForm() {
    setUsername('');
    setPassword('');
    setEmail('');
    clearErrors();
  }

  function isValidEmail(email) {
    // Basic email validation logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function checkPasswordStrength(password) {
    if (
      /^([A-Za-z0-9_-]|[@!#$&])+$/i.test(password) &&
      password.length >= 6
    ) {
      setPasswordStrength('Strong');
    } else if (
      /^[A-Za-z0-9_-]+$/.test(password) &&
      password.length >= 6
    ) {
      setPasswordStrength('OK');
    } else {
      setPasswordStrength('Weak');
    }
  }

  return (
    <div className='registration-container'>
      {loading && <div>Loading...</div>}
      {internalError && <div>{internalError}</div>}
      {success && <div>Registration Done. Please login.</div>}
      {error && <div>{error}</div>}
      <h2>Register Yourself</h2>
      <div className='input-group'>
        <label>Username:</label>
        <input
          type='text'
          value={username}
          onBlur={() => {
            if (!username) {
              setUsernameError('Username is required');
            } else if (!/^[A-Za-z0-9_-]+$/.test(username) || username.length < 6) {
              setUsernameError(
                'Username should contain only letters, numbers, hyphens, and underscores and be at least 6 characters long.'
              );
            }
          }}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className='error-message'>{usernameError}</div>
      </div>
      <div className='input-group'>
        <label>Password:</label>
        <input
          type='password'
          value={password}
          onBlur={() => {
            if (!password) {
              setPasswordError('Password is required');
            } else if (
              !/^([A-Za-z0-9_-]|[@!#$&])+$/i.test(password) ||
              password.length < 6
            ) {
              setPasswordError(
                'Password should contain only letters, numbers, hyphens, underscores, and the characters @, !, #, $, and &. It should be at least 6 characters long.'
              );
            }
          }}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
            checkPasswordStrength(e.target.value);
          }}
        />
        <div className='error-message'>{passwordError}</div>
        <div className={`password-strength ${passwordStrength}`}>
          Password Strength: {passwordStrength}
        </div>
      </div>
      <div className='input-group'>
        <label>Email:</label>
        <input
          type='email'
          value={email}
          onBlur={() => {
            if (!email) {
              setEmailError('Email is required');
            } else if (!isValidEmail(email)) {
              setEmailError('Invalid email format');
            }
          }}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
        />
        <div className='error-message'>{emailError}</div>
      </div>
      <button className='register-button' onClick={handleRegister}>
        Register
      </button>
      <div className='social-auth-buttons'>
        {/* Add social network buttons here */}
        <button className='social-button google-button'>
          Register with Google
        </button>
        <button className='social-button facebook-button'>
          Register with Facebook
        </button>
      </div>
    </div>
  );
}
