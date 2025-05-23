'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/solid';
import { useWeb3 } from '@/contexts/Web3Context';
import Message from './Message';
import VoiceMessage from './VoiceMessage';
import TypingIndicator from './TypingIndicator';

interface ChatProps {
  selectedContact: {
    address: string;
    name: string;
    publicKey: string;
  } | null;
}

export default function Chat({ selectedContact }: ChatProps) {
  const { contract, account } = useWeb3();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (selectedContact && contract) {
      loadMessages();
      setupMessageListener();
    }
  }, [selectedContact, contract]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedContact) return;

    try {
      const msgs = await contract!.getMessages(account, selectedContact.address);
      const formattedMessages = await Promise.all(
        msgs.map(async (msg: any, index: number) => {
          const reactions = await contract!.getMessageReactions(
            msg.conversationId,
            index
          );
          return {
            ...msg,
            id: index.toString(),
            reactions,
          };
        })
      );
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupMessageListener = () => {
    if (!contract || !selectedContact) return;

    contract.on('MessageSent', (conversationId, sender, recipient, ipfsHash, timestamp, isFile) => {
      if (
        (sender === account && recipient === selectedContact.address) ||
        (sender === selectedContact.address && recipient === account)
      ) {
        loadMessages();
      }
    });

    return () => {
      contract.removeAllListeners('MessageSent');
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) return;

    try {
      await contract!.sendMessage(selectedContact.address, newMessage, false);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact) return;

    try {
      // Upload to IPFS and get hash
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { ipfsHash } = await response.json();

      await contract!.sendMessage(selectedContact.address, ipfsHash, true);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing event to blockchain
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stopped typing event to blockchain
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {selectedContact ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {selectedContact.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-medium text-gray-900">{selectedContact.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedContact.address.slice(0, 6)}...{selectedContact.address.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isSender={message.sender === account}
                  onDelete={async () => {
                    // Implement message deletion
                  }}
                  onEdit={async (newContent) => {
                    // Implement message editing
                  }}
                  onReact={async (emoji) => {
                    try {
                      await contract!.addReaction(
                        selectedContact.address,
                        parseInt(message.id),
                        emoji
                      );
                    } catch (error) {
                      console.error('Error adding reaction:', error);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-4"
              >
                <TypingIndicator name={selectedContact.name} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            {isRecording ? (
              <VoiceMessage
                onRecordingComplete={async (blob) => {
                  // Upload audio blob to IPFS and send as message
                  setIsRecording(false);
                }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <PaperClipIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </label>
                <button
                  onClick={() => setIsRecording(true)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <MicrophoneIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-xl font-medium">Select a contact to start chatting</p>
        </div>
      )}
    </div>
  );
} 