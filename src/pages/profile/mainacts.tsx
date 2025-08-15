import React from 'react';

export default function MainActsProfile() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Main Acts Profile</h1>

      <div className="bg-pink-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-2">Tagline:</p>
        <p className="mb-4 italic">“Every round’s a performance!”</p>

        <p className="text-lg font-semibold mb-2">Experience Style:</p>
        <ul className="list-disc list-inside">
          <li>Avatar-led shows with spotlight transitions</li>
          <li>High-energy voice callouts and crowd SFX</li>
          <li>Enhanced visual and animation effects</li>
          <li>Feels like you're in a live studio experience</li>
        </ul>
      </div>
    </div>
  );
}
