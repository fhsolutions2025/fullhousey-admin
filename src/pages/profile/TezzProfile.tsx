// File: src/pages/profile/TezzProfile.tsx

import React from 'react';
import { PlayerProfileCard } from '@/components/profile/PlayerProfileCard';
import { profileContent } from '@/data/profiles';

export default function TezzProfile() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">Gamesey Profile - Tezz</h1>
      <PlayerProfileCard
        profileName="Tezz"
        tagline="Win with wits, not just luck."
        description={profileContent.Tezz.description}
        colorTheme="purple"
      />
    </div>
  );
}
