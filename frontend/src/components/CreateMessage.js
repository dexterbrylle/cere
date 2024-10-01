import React, { useState } from 'react';
import axios from 'axios';

function CreateMessage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [lifetime, setLifetime] = useState(24);
  const [maxViews, setMaxViews] = useState('');
  const [password, setPassword] = useState('');
  const [publicPaste, setPublicPaste] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    formData.append('title', title);
    if (file) {
      formData.append('file', file);
    }
    formData.append('expiration_hours', lifetime);
    if (maxViews) formData.append('max_views', maxViews);
    if (password) formData.append('password', password);
    formData.append('public_paste', publicPaste);

    try {
      const response = await axios.post('/api/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShareableUrl(`${window.location.origin}${response.data.url}`);
      setError('');
    } catch (error) {
      console.error('Error creating message:', error);
      setError('Failed to create message. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Secure Message</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Optional title"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Enter your message"
            rows="4"
            required
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">Attachment</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="lifetime" className="block text-sm font-medium text-gray-700">Lifetime (hours)</label>
          <input
            type="number"
            id="lifetime"
            value={lifetime}
            onChange={(e) => setLifetime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            min="1"
            max="168"
            required
          />
        </div>
        <div>
          <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700">Max Views</label>
          <input
            type="number"
            id="maxViews"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            min="1"
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Optional password"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="publicPaste"
            checked={publicPaste}
            onChange={(e) => setPublicPaste(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label htmlFor="publicPaste" className="ml-2 block text-sm text-gray-900">
            Public Paste
          </label>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Shareable Link
        </button>
      </form>
      {shareableUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Shareable URL:</h3>
          <p className="mt-2 text-sm text-gray-500">{shareableUrl}</p>
        </div>
      )}
    </div>
  );
}

export default CreateMessage;