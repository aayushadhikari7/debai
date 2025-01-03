"use client"; // Mark as a client component

import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaSun, FaMoon, FaTrash, FaRobot, FaUser, FaPaperPlane } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { ElevenLabsClient } from "elevenlabs";
import OpenAI from 'openai';
// import 'env/config'

const client = new ElevenLabsClient({ apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY});
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true  });

// MediaRecorder for capturing audio
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];


const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ isUser: boolean; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Start in dark mode
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playaudioRef = useRef<HTMLAudioElement>(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to the body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth', // Smooth scrolling
      });
    }
  }, [messages]);

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextInput();
    }
  };

  // Stop speech synthesis and recognition when interrupted
  const stopSpeechAndRecognition = () => {
    if (isSpeaking) {
      playaudioRef.current?.pause()
      speechSynthesis.cancel(); // Stop AI speech
      setIsSpeaking(false);
    }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop(); // Stop speech recognition
      setIsRecording(false);
    }
  };

  // Handle speech input using OpenAI Whisper
  const handleSpeechInput = async () => {
    // Stop AI speech immediately
    stopSpeechAndRecognition();

    // Stop recording if already active
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      // Initialize audio context and analyser for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create and configure MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        
        try {
          // Create form data for OpenAI API
          const formData = new FormData();
          formData.append('file', audioBlob, 'speech.mp3');
          formData.append('model', 'whisper-1');
               // Convert Blob to File object
          const audioFile = new File([audioBlob], 'speech.mp3', { type: 'audio/mp3' });
          
          // Get transcription from OpenAI
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            response_format: "text",
          });

          // Add transcription to messages
          setMessages((prevMessages) => [
            ...prevMessages,
            { isUser: true, text: transcription },
          ]);

          if (transcription.toLowerCase().includes('exit')) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { isUser: false, text: 'Exiting conversation. Goodbye!' },
            ]);
            return;
          }

          // Get AI response
          const response = await fetch('/api/debate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: transcription }),
          });
          const data = await response.json();
          
          setMessages((prevMessages) => [
            ...prevMessages,
            { isUser: false, text: data.response },
          ]);
          
          await speakText(data.response);
        } catch (error) {
          console.error('Error processing audio:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { isUser: false, text: 'Error processing audio.' },
          ]);
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
      setIsRecording(false);
    }
  };

  // Draw waveform on canvas
  const drawWaveform = () => {
    if (!isRecording || !canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the time-domain data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Normalize the data
    const height = canvas.height;
    const width = canvas.width;
    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0 - 1.0;
      const y = (v * (height / 2)) + (height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    requestAnimationFrame(drawWaveform);
  };

  // Manage canvas size
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
    }
  }, [isRecording]);

  // Start waveform drawing when recording
  useEffect(() => {
    if (isRecording && canvasRef.current && analyserRef.current) {
      drawWaveform();
    }
    return () => {
      // Cleanup if needed
    };
  }, [isRecording]);

  // Handle text input
  const handleTextInput = async () => {
    if (!inputText.trim()) return;

    stopSpeechAndRecognition(); // Stop speech and recognition when typing

    setMessages((prevMessages) => [
      ...prevMessages,
      { isUser: true, text: inputText },
    ]);

    if (inputText.toLowerCase().includes('exit')) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { isUser: false, text: 'Exiting conversation. Goodbye!' },
      ]);
      setInputText('');
      return;
    }

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputText }),
      });
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { isUser: false, text: data.response },
      ]);
      await speakText(data.response);
    } catch (error) {
      console.error('Error sending to API:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { isUser: false, text: 'Error generating response.' },
      ]);
    }

    setInputText('');
  };

  const speakText = async(text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }
    
    try {
      // Call the ElevenLabs API to convert text to speech
      const responseStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_multilingual_v2"
      });
      const chunks = [];
        for await (const chunk of responseStream) {
            chunks.push(chunk);
        }
        
        const audioBuffer = Buffer.concat(chunks);
      // Create a Blob from the audio data
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  
      // Create a URL for the Blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(audioUrl)
      console.log(audioBuffer)
      // Create an Audio element and play the audio
      // const audioElement = new Audio(audioUrl);
      // audioElement.play();
        
      if (playaudioRef.current){
        playaudioRef.current.src = audioUrl
        playaudioRef.current.play();
        
        // Set isSpeaking to true while the audio is playing
        setIsSpeaking(true);
        
        // Handle the end of the audio playback
        playaudioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl); // Clean up the URL object
        };
        
        // Handle any errors during playback
        playaudioRef.current.onerror = () => {
          setIsSpeaking(false);
          console.error('Error playing audio');
        };
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
    setIsSpeaking(true);
  };

  // Start a new chat
  const startNewChat = () => {
    stopSpeechAndRecognition(); // Stop speech and recognition when starting a new chat
    setMessages([]);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} font-poppins relative transition-colors duration-500 ease-in-out`}>
      {/* Blurred background */}
      <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center blur-sm transition-opacity duration-500 ease-in-out"></div>
      <div className="relative z-10 flex flex-col h-screen max-w-7xl mx-auto p-6 md:p-8 rounded-2xl glass-morphism transition-all duration-500 ease-in-out">
        <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-gray-700/30">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Debate AI Talkbot
            </h1>
            <p className="text-gray-400 mt-2">Your intelligent debate companion</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md transition-all duration-300 ease-in-out"
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <button
              onClick={startNewChat}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md transition-all duration-300 ease-in-out"
            >
              <FaTrash size={20} />
            </button>
          </div>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 md:mb-6 p-4 md:p-6 rounded-xl glass-morphism transition-all duration-500 ease-in-out custom-scrollbar"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-start gap-3 animate-bounceIn hover-scale`}
            >
              <div className={`p-3 rounded-full ${msg.isUser ? 'bg-blue-500' : 'bg-gray-500'} text-white shadow-lg transition-all duration-500 ease-in-out`}>
                {msg.isUser ? <FaUser size={18} /> : <FaRobot size={18} />}
              </div>
              <div
                className={`max-w-[75%] p-4 rounded-2xl glass-morphism message-transition ${
                  msg.isUser 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20' 
                    : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-500/20'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <button
            data-tooltip-id="microphone-tooltip"
            data-tooltip-content="Click to speak"
            onClick={handleSpeechInput}
            className={`relative w-24 h-12 rounded-lg bg-blue-200 flex items-center justify-center transition-all duration-300 ease-in-out ${isRecording ? 'bg-red-500' : ''}`}
          >
            {!isRecording && (
              <FaMicrophone size={20} color={isRecording ? 'white' : 'black'} />
            )}
            {isRecording && (
              <canvas
                ref={canvasRef}
                className="abso lute inset-0"
              ></canvas>
            )}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleTextInput}
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
            aria-label="Send message"
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
        <Tooltip id="microphone-tooltip" className="opacity-0 transition-opacity duration-300 ease-in-out" />
        <audio className = "hidden" ref ={playaudioRef}/>
      </div>
    </div>
  );
};

export default Chat;
