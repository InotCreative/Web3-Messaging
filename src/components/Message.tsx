'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  FaceSmileIcon,
  DocumentIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useWeb3 } from '@/contexts/Web3Context';

interface MessageProps {
  message: {
    id: string;
    sender: string;
    content: string;
    timestamp: number;
    status: 'SENT' | 'DELIVERED' | 'READ';
    isFile?: boolean;
    reactions?: Array<{
      emoji: string;
      user: string;
    }>;
  };
  isSender: boolean;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
  onReact?: (emoji: string) => void;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function Message({
  message,
  isSender,
  onDelete,
  onEdit,
  onReact,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { account } = useWeb3();

  const handleEdit = () => {
    if (editedContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    onEdit?.(editedContent);
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'READ':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className={`relative max-w-md ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
        } rounded-lg px-4 py-2 shadow-sm`}
      >
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 bg-white text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleEdit}
              className="text-green-500 hover:text-green-600"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(message.content);
              }}
              className="text-red-500 hover:text-red-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            {message.isFile ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <DocumentIcon className="w-5 h-5" />
                <span>View File</span>
              </a>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}

            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                {format(message.timestamp * 1000, 'h:mm a')}
              </span>
              {isSender && <div className="ml-2">{getStatusIcon()}</div>}
            </div>

            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(
                  message.reactions.reduce((acc: { [key: string]: number }, reaction) => {
                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isSender ? 'bg-blue-400' : 'bg-gray-200'
                    }`}
                  >
                    {emoji} {count}
                  </span>
                ))}
              </div>
            )}

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`absolute ${
                    isSender ? 'right-0' : 'left-0'
                  } bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-10`}
                >
                  <div className="flex space-x-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact?.(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="hover:bg-gray-100 p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={`absolute ${
                isSender ? '-left-8' : '-right-8'
              } top-0 hidden group-hover:flex space-x-1`}
            >
              {isSender && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FaceSmileIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
} 