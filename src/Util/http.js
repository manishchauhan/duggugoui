// useFetch.js
import { useState, useEffect, useCallback  } from 'react';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error };
};

  // ****************
//method post / get etc
//data = data
//url = url
/****************/
export const fetchData = async(url,method=`GET`, data=undefined) =>
{
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", 
  });
  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }
  return await response.json();
}


//use for post put delete 


export const useHttpRequest = () => {
  const [apiData, setApiData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendHttpRequest = useCallback(async (url, method, data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include", 
      });

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const jsonData = await response.json();
      setApiData(jsonData);
      setSuccess(true);
      // Handle success if needed
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return [loading, apiData, setApiData, success, setSuccess, error, setError, sendHttpRequest];
};

export function getCookie(cookieName) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    // Check if the cookie's name matches the provided cookieName
    if (name === cookieName) {
      // Decode and return the cookie value
      return decodeURIComponent(value);
    }
  }

  // If the cookie is not found, return null or handle the absence accordingly
  return null;
}

export  function ConvertToHyperlink(text) {
  // Regular expression to find URLs within text
  var urlRegex = /(?:https?:\/\/)?([^\s]+\.[^\s]+)/g;

  // Split text into parts
  const parts = text.split(urlRegex);

  // Map each part to JSX
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // If part is a URL, return an anchor tag
      const url = /^https?:\/\//i.test(part) ? part : 'https://' + part;
      return (
        <a href={url} key={index} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    } else {
      // If part is not a URL, return plain text
      return <span key={index}>{part}</span>;
    }
  });
}