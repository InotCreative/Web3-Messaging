'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface VoiceMessageProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function VoiceMessage({ onRecordingComplete }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {audioUrl ? (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
          <button
            onClick={togglePlayback}
            className="focus:outline-none"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6 text-blue-500" />
            ) : (
              <PlayIcon className="w-6 h-6 text-blue-500" />
            )}
          </button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="w-32 h-1 bg-blue-200 rounded-full">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={isPlaying ? { width: '100%' } : { width: 0 }}
              transition={isPlaying ? { duration: audioRef.current?.duration || 0 } : { duration: 0 }}
            />
          </div>
        </div>
      ) : (
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full focus:outline-none ${
            isRecording ? 'bg-red-500' : 'bg-blue-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? (
            <StopIcon className="w-6 h-6 text-white" />
          ) : (
            <MicrophoneIcon className="w-6 h-6 text-white" />
          )}
        </motion.button>
      )}
      {isRecording && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 font-medium"
        >
          {formatTime(recordingTime)}
        </motion.span>
      )}
    </div>
  );
} 