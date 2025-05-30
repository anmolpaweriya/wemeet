# Wemeet - Real-time attendance tracking for meetings.

## Overview

**Wemeet** is an online class attendance system that leverages real-time face detection and WebRTC technology to track student attendance and participation during live classes. The frontend of the system is built with **React**, **Tailwind CSS**, and integrates with a real-time server via **Socket.io** to provide live updates on student presence and activity.

Instructors can monitor attendance in real-time, receiving automatic updates if a student becomes inactive or leaves the video frame. Detailed attendance reports are generated after each class, offering instructors insights into student engagement.

## Features

- **Real-Time Attendance Tracking**: Detects and tracks student presence using face detection and WebRTC technology.
- **Live Presence Monitoring**: Instructors can see a live list of students who are actively participating.
- **Automatic Updates**: Real-time updates on attendance and student activity (if a student leaves or becomes inactive).
- **Responsive UI**: The frontend is fully responsive, ensuring smooth functionality across devices.
- **WebRTC Integration**: For real-time video and audio communication, integrated with WebRTC.

## Tech Stack

- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for building custom designs quickly.
- **Socket.io**: For real-time, bi-directional communication between the frontend and backend.
- **WebRTC**: For real-time video and audio communication.
- **MongoDB**: Used by the backend for storing attendance data (although MongoDB is not part of this frontend repo, it interacts with the backend).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wemeet-frontend.git
   cd wemeet-frontend
   ```


2. Install Dependencies:
   ```bash
   npm install
   ```

3. Set Env variables:
   ```env
   VITE_API_URL=
   ```
4. Start the Application:
   ```bash
   npm run dev
   ```

This will launch the app in development mode. Open http://localhost:3000 to view it in the browser.
