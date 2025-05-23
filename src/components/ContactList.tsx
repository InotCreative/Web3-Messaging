'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/contexts/Web3Context';
import { format } from 'date-fns';

interface Contact {
  address: string;
  name: string;
  publicKey: string;
  blocked: boolean;
  lastSeen: number;
  online?: boolean;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
}

export default function ContactList({ onSelectContact, searchQuery }: ContactListProps) {
  const { contract, account } = useWeb3();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({
    address: '',
    name: '',
  });
  const [isAddingContact, setIsAddingContact] = useState(false);

  useEffect(() => {
    if (contract && account) {
      loadContacts();
      setupOnlineStatusListener();
    }
  }, [contract, account]);

  const loadContacts = async () => {
    try {
      const contactAddresses = JSON.parse(localStorage.getItem(`contacts_${account}`) || '[]');
      const contactPromises = contactAddresses.map(async (address: string) => {
        const contact = await contract!.getContact(account, address);
        // Get last message for preview
        const messages = await contract!.getMessages(account, address);
        const lastMessage = messages.length > 0 ? {
          content: messages[messages.length - 1].ipfsHash,
          timestamp: Number(messages[messages.length - 1].timestamp),
        } : undefined;

        return {
          address,
          name: contact.name,
          publicKey: contact.publicKey,
          blocked: contact.blocked,
          lastSeen: Number(contact.lastSeen),
          online: Date.now() / 1000 - Number(contact.lastSeen) < 300, // Online if seen in last 5 minutes
          lastMessage,
        };
      });

      const loadedContacts = await Promise.all(contactPromises);
      setContacts(loadedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const setupOnlineStatusListener = () => {
    if (!contract) return;

    contract.on('ContactUpdated', (owner, contactAddress, name, blocked) => {
      if (owner === account || contactAddress === account) {
        loadContacts();
      }
    });

    return () => {
      contract.removeAllListeners('ContactUpdated');
    };
  };

  const addContact = async () => {
    if (!newContact.address || !newContact.name) return;

    try {
      const publicKey = await contract!.getPublicKey(newContact.address);
      await contract!.updateContact(
        newContact.address,
        newContact.name,
        publicKey,
        false
      );

      const storedContacts = JSON.parse(localStorage.getItem(`contacts_${account}`) || '[]');
      storedContacts.push(newContact.address);
      localStorage.setItem(`contacts_${account}`, JSON.stringify(storedContacts));

      setNewContact({ address: '', name: '' });
      setIsAddingContact(false);
      loadContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const toggleBlock = async (contact: Contact) => {
    try {
      await contract!.updateContact(
        contact.address,
        contact.name,
        contact.publicKey,
        !contact.blocked
      );
      loadContacts();
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-full">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Contacts</h2>
        <button
          onClick={() => setIsAddingContact(true)}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          Add Contact
        </button>
      </div>

      <AnimatePresence>
        {isAddingContact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-200 bg-gray-50"
          >
            <input
              type="text"
              placeholder="Address (0x...)"
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-y-auto">
        <AnimatePresence>
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectContact(contact)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{contact.name}</h3>
                    <span
                      className={`ml-2 w-2 h-2 rounded-full ${
                        contact.online ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                  </p>
                  {contact.lastMessage && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage.content}</p>
                      <p className="text-xs text-gray-400">
                        {format(contact.lastMessage.timestamp * 1000, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBlock(contact);
                  }}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    contact.blocked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {contact.blocked ? 'Blocked' : 'Block'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 