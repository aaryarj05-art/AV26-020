import { useEffect, useRef, useCallback, useState } from 'react';

type MessageHandler = (payload: any) => void;

interface RealtimeSocketState {
  connected: boolean;
  lastUpdate: string | null;
  subscribe: (type: string, handler: MessageHandler) => void;
}

/**
 * Connects to ws://localhost:8080/ws/realtime
 * Auto-reconnects with exponential backoff on disconnect.
 * If WS disconnects, existing React Query polling resumes as fallback.
 */
export function useRealtimeSocket(): RealtimeSocketState {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = new WebSocket('ws://localhost:8080/ws/realtime');

      ws.onopen = () => {
        setConnected(true);
        reconnectAttemptRef.current = 0;
        console.log('[Helix WS] Connected to realtime service');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload, timestamp } = message;
          setLastUpdate(timestamp);

          const handlers = handlersRef.current.get(type);
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(payload);
              } catch (e) {
                console.error('[Helix WS] Handler error:', e);
              }
            });
          }
        } catch (e) {
          console.error('[Helix WS] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('[Helix WS] Disconnected. Scheduling reconnect...');
        scheduleReconnect();
      };

      ws.onerror = (err) => {
        console.error('[Helix WS] Error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[Helix WS] Failed to create WebSocket:', e);
      scheduleReconnect();
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
    reconnectAttemptRef.current += 1;
    console.log(`[Helix WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`);
    reconnectTimeoutRef.current = setTimeout(connect, delay);
  }, [connect]);

  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
  }, []);

  useEffect(() => {
    connect();

    // Send periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected, lastUpdate, subscribe };
}
