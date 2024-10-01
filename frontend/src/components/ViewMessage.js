import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ViewMessage() {
  const { urlHash } = useParams();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get(`/api/messages/${urlHash}`, {
          headers: password ? { 'X-Password': password } : {}
        });
        setMessage(response.data);
        setIsPasswordProtected(false);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setIsPasswordProtected(true);
        } else {
          setError(error.response?.data?.error || 'An error occurred');
        }
      }
    };

    fetchMessage();
  }, [urlHash, password]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // This will trigger the useEffect to fetch the message again with the new password
    setPassword(password);
  };

  if (error) {
    return <div className="text-red-500 font-bold text-center mt-8">{error}</div>;
  }

  if (isPasswordProtected) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Password Protected Message</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
            Submit
          </button>
        </form>
      </div>
    );
  }

  if (!message) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{message.title || 'Secure Message'}</h2>
      <p className="mb-4 whitespace-pre-wrap">{message.content}</p>
      {message.file_url && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Attached File:</h3>
          <a href={message.file_url} download className="text-blue-500 hover:underline">
            Download File
          </a>
        </div>
      )}
      <p className="text-sm text-gray-600">Expires at: {new Date(message.expiration_time).toLocaleString()}</p>
      {message.max_views && (
        <p className="text-sm text-gray-600">
          Views: {message.view_count} / {message.max_views}
        </p>
      )}
      {message.public_paste && (
        <p className="text-sm text-gray-600 mt-2">This is a public paste</p>
      )}
    </div>
  );
}

export default ViewMessage;