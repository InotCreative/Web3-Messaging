'use client';

import React, { useState } from 'react';
import { Web3Provider } from '@/contexts/Web3Context';
import Sidebar from '@/components/Sidebar';
import Chat from '@/components/Chat';

export default function Home() {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <Web3Provider>
      <div className="flex h-screen">
        <Sidebar onSelectContact={setSelectedContact} />
        <div className="flex-1">
          <Chat selectedContact={selectedContact} />
        </div>
      </div>
    </Web3Provider>
  );
} 