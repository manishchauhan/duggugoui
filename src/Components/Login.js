import React, { useState, useEffect } from 'react';
import './Login.css'; // Import the external CSS file
import { useFetch,fetchData, useHttpRequest } from '../Util/http';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveLogin, setSaveLogin] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [internalError, setInternalError] = useState('');
 
  const navigate = useNavigate(); // Initialize the navigate function
  const [
    loading, apiData, setapiData, success, setSuccess, error, setError, sendHttpRequest
  ] = useHttpRequest();
  //check if user is already logged in move to home page
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


  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
    setUsernameError(''); // Clear the error when the user starts typing again
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setPasswordError(''); // Clear the error when the user starts typing again
  };

  const handleSaveLoginChange = () => {
    setSaveLogin(!saveLogin);
  };

  const validateInputs = () => {
    let isValid = true;

    if (!username) {
      setUsernameError('Username is required');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const containsDangerousScript = (input) => {
    // Define a regular expression pattern to match any form of HTML or script tags
    const dangerousPattern = /<[^>]*>|<\/[^>]*>/i;

    // Check if the input matches the dangerous pattern
    return dangerousPattern.test(input);
  };

  function clearErrors() {
    setUsernameError('');
    setPasswordError('');
    setError(null);
  }

  function clearForm() {
    setUsername('');
    setPassword('');
    clearErrors();

  }
  // Function to get the value of a specific cookie by its name

  const handleLogin = async () => {
    if (validateInputs()) {
      // Check for dangerous input
      if (containsDangerousScript(username)) {
        // Handle dangerous input (e.g., display an error message)
        setUsernameError('Scripts not allowed');
        return;
      }
      if (containsDangerousScript(password)) {
        setUsernameError('Scripts not allowed');
        return;
      }

      // Proceed with the login logic
      // You can send a request to your server here
      // Implement registration logic here
      try {
        const data = {
          username: username,
          password: password,

        };

        await sendHttpRequest(
          `http://localhost:8080/user/login`,
          'POST',
          data
        );

        if (success) {
          clearForm();
          //move to game page if everything is ok
         navigate('/home');
        }

      } catch (err) {
        console.log("mani to page", err.message)
        setInternalError('Failed to Login: ' + err.message);
      }
    }
  };

  return (
    <div className="login-container">
      {loading && <div>Loading...</div>}
      {internalError && <div>{internalError}</div>}
      {success && <div>Welcome</div>}
      {error && <div>{error}</div>}
      <h2>Login</h2>
      <div className="input-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onBlur={() => {
            if (!username) {
              setUsernameError('Username is required');
            }
          }}
          onChange={handleUsernameChange}
        />
        <div className="error-message">{usernameError}</div>
      </div>
      <div className="input-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onBlur={() => {
            if (!password) {
              setPasswordError('Password is required');
            }
          }}
          onChange={handlePasswordChange}
        />
        <div className="error-message">{passwordError}</div>
      </div>
      <div className="input-group">
        <label htmlFor="saveLogin">Save Login:</label>
        <input
          type="checkbox"
          id="saveLogin"
          checked={saveLogin}
          onChange={handleSaveLoginChange}
        />
      </div>
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
