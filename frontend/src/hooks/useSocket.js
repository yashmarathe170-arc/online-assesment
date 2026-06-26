import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from '../store/notificationSlice.js';

export const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server with auth token
    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    socketRef.current = io(socketUrl, {
      auth: {
        token,
      },
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.io connected to server');
    });

    // Listen for incoming notifications
    socketRef.current.on('notification', (notification) => {
      console.log('New socket notification received:', notification);
      dispatch(addNotification(notification));

      // Trigger standard web notification or sound if tab is in background
      if (Notification.permission === 'granted') {
        new Notification('EduVerse LMS Alert', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Request permissions for native alerts
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, user, dispatch]);

  return socketRef.current;
};

export default useSocket;
