'use client';

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ContactList from './ContactList';

interface SidebarProps {
  onSelectContact: (contact: any) => void;
}

export default function Sidebar({ onSelectContact }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { name: 'Contacts', icon: UserIcon },
    { name: 'Groups', icon: UserGroupIcon },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex p-1 space-x-1 bg-gray-100/50">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                ${
                  selected
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                }
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                {React.createElement(tab.icon, {
                  className: 'w-5 h-5',
                  'aria-hidden': 'true',
                })}
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Tab.Panel
              key="contacts"
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ContactList
                onSelectContact={onSelectContact}
                searchQuery={searchQuery}
              />
            </Tab.Panel>

            <Tab.Panel
              key="groups"
              as={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full p-4"
            >
              <div className="text-center text-gray-500 mt-10">
                <UserGroupIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No groups yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new group.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserGroupIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    New Group
                  </button>
                </div>
              </div>
            </Tab.Panel>
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 