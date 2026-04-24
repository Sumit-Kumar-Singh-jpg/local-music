import fp from 'fastify-plugin';
import fastifyWebsocket from '@fastify/websocket';

export default fp(async (app) => {
  await app.register(fastifyWebsocket);

  const userConnections = new Map<string, Set<any>>();

  app.get('/api/sync/ws', { websocket: true }, (socket) => {
    let userId: string | null = null;
    // In Fastify 5 + @fastify/websocket 11, the first argument IS the socket

    if (!socket) {
      app.log.error('[Socket] Failed to establish primitive socket connection');
      return;
    }

    socket.on('message', async (message: any) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'AUTH' && data.token) {
          try {
            const decoded = app.jwt.verify(data.token) as any;
            userId = decoded.userId;

            if (userId) {
              if (!userConnections.has(userId)) {
                userConnections.set(userId, new Set());
              }
              userConnections.get(userId)?.add(socket);
              app.log.info(`[SOCKET_AUTH_SUCCESS] User ${userId} connected device: ${data.deviceName || 'Unknown'}`);
              
              socket.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
            }
          } catch (err) {
            socket.send(JSON.stringify({ type: 'ERROR', message: 'Invalid Token' }));
            socket.close();
          }
          return;
        }

        if (!userId) return;

        const connections = userConnections.get(userId);
        if (connections) {
          const broadcastData = JSON.stringify({
            ...data,
            timestamp: Date.now()
          });

          for (const client of connections) {
            if (client !== socket && client.readyState === 1) {
              client.send(broadcastData);
              app.log.debug(`[SOCKET_RELAY] ${data.type} relayed for user ${userId}`);
            }
          }
        }
      } catch (err) {
        app.log.error(`[Socket Error] ${err}`);
      }
    });

    socket.on('close', () => {
      if (userId) {
        userConnections.get(userId)?.delete(socket);
        if (userConnections.get(userId)?.size === 0) {
          userConnections.delete(userId);
        }
        app.log.info(`[Socket] User ${userId} device disconnected.`);
      }
    });

    socket.on('error', (err: any) => {
      app.log.error(`[Socket Primitive Error] ${err}`);
    });
  });
});
