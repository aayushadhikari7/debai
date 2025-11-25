
# ⚠️ **IMPORTANT DISCLAIMER**

> This project, **Debate-AI-Talkbot**, represents an **earlier product iteration**. The code and technology dependencies are current only up to **January 1, 2024**. Dependencies, APIs, and SDKs may have since been updated, which could require modifications to the implementation, particularly for the **OpenAI** and **ElevenLabs** integrations.

-----

# 🤖 Debate-AI-Talkbot: Real-time Conversational AI

This project is a React-based conversational AI application designed for real-time, bi-directional interaction (Speech-to-Text and Text-to-Speech). It utilizes cutting-edge AI models for highly accurate transcription and low-latency audio synthesis, perfect for a debate or dialogue scenario.

## 🌟 Key Features

The primary focus of recent development has been upgrading the core voice I/O systems to enhance speed and accuracy:

  * **🎙️ High-Accuracy Transcription (OpenAI Whisper):** The legacy Web Speech API has been replaced with the powerful **OpenAI Whisper** model, drastically improving the accuracy of transcribing user speech into text.
  * **🗣️ Low-Latency Audio Streaming (ElevenLabs TTS):** The Text-to-Speech (TTS) response from ElevenLabs is now streamed using the **Media Source Extensions (MSE) API**. This allows audio playback to begin instantly, without waiting for the entire response to download, ensuring a more natural, real-time conversation flow.

-----

## 🛠️ Technology Stack

This project integrates several external APIs and libraries:

| Component | Technology / API | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React / Next.js | Provides the UI structure and application framework. |
| **Speech-to-Text (STT)** | **OpenAI Whisper** (`whisper-1` model) | Transcribes the user's recorded audio (MP3 file object) into text. |
| **Text-to-Speech (TTS)** | **ElevenLabs API** | Generates high-quality, synthetic speech for the AI's response. |
| **Audio Capture** | `MediaRecorder` API | Captures raw microphone input from the browser. |
| **Streaming Playback** | **Media Source Extensions (MSE)** | Handles the real-time, chunk-based streaming of audio from ElevenLabs to the browser's audio player. |
| **Chat Logic** | `/api/debate` endpoint | The backend endpoint responsible for generating the AI's debate response (not fully detailed in the logs, but implied). |

-----

## ⚙️ Development Highlights

The recent development cycle focused on two critical areas within `src\components\Chat\index.tsx`:

### 1\. Whisper Integration

  * The `handleSpeechInput` function was refactored to use **`MediaRecorder`** to capture audio into a `Blob`.
  * A key correction was made to ensure the `Blob` is converted into a **`File` object** (`new File(...)`) before being sent to the OpenAI transcription endpoint, satisfying the API's requirements.

### 2\. ElevenLabs Streaming Fix

  * The `speakText` function was converted to a streaming implementation using the **`MediaSource` object** and a **`SourceBuffer`** (using the MIME type `audio/mpeg`).
  * A **queue system** was introduced to reliably feed audio chunks from the ElevenLabs stream into the `SourceBuffer` while managing the `sourceBuffer.updating` state, achieving true low-latency playback.

-----

## 🚀 Setup and Installation

### 1\. Prerequisites

  * Node.js (LTS recommended)
  * Access to **OpenAI** and **ElevenLabs APIs**.

### 2\. Environment Variables

Create a `.env.local` file in your project root and populate it with the required API keys:

```bash
# Used for the Whisper Speech-to-Text service
NEXT_PUBLIC_OPENAI_API_KEY="..." 

# Used for the ElevenLabs Text-to-Speech service
NEXT_PUBLIC_ELEVENLABS_API_KEY="..." 
```

### 3\. Running the Project

1.  **Install dependencies:**
    ```bash
    npm install
    # Ensure the 'openai' package is installed if it was missing:
    npm install openai
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be available at `http://localhost:3000`.