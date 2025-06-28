import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { redisPubSubClient } from '@/config/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

// Socket authentication middleware
const authenticateSocket = async (socket: AuthenticatedSocket, next: Function) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // TODO: Verify user exists in database
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    
    logger.info('Socket authenticated', {
      socketId: socket.id,
      userId: socket.userId,
      userRole: socket.userRole
    });
    
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

// Socket event handlers
export const socketHandler = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('User connected', {
      socketId: socket.id,
      userId: socket.userId,
      userRole: socket.userRole
    });
    
    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }
    
    // Join role-specific rooms
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }
    
    // Handle joining project rooms
    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.debug('User joined project room', {
        socketId: socket.id,
        userId: socket.userId,
        projectId
      });
    });
    
    // Handle leaving project rooms
    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.debug('User left project room', {
        socketId: socket.id,
        userId: socket.userId,
        projectId
      });
    });
    
    // Handle voting session rooms
    socket.on('join_voting_session', (sessionId: string) => {
      socket.join(`voting:${sessionId}`);
      logger.debug('User joined voting session', {
        socketId: socket.id,
        userId: socket.userId,
        sessionId
      });
    });
    
    socket.on('leave_voting_session', (sessionId: string) => {
      socket.leave(`voting:${sessionId}`);
    });
    
    // Handle AI chat/support bot
    socket.on('support_message', async (data: { message: string; language?: string }) => {
      try {
        // TODO: Process message through AI support bot
        const response = await processSupportMessage(data.message, data.language, socket.userId);
        
        socket.emit('support_response', {
          message: response.message,
          confidence: response.confidence,
          language: response.language,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Support message processing failed:', error);
        socket.emit('support_error', {
          error: 'Failed to process message',
          timestamp: new Date()
        });
      }
    });
    
    // Handle real-time donation updates
    socket.on('track_donation', (donationId: string) => {
      socket.join(`donation:${donationId}`);
    });
    
    // Handle milestone updates
    socket.on('track_milestone', (milestoneId: string) => {
      socket.join(`milestone:${milestoneId}`);
    });
    
    // Handle typing indicators for chat
    socket.on('typing_start', (data: { room: string }) => {
      socket.to(data.room).emit('user_typing', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
    
    socket.on('typing_stop', (data: { room: string }) => {
      socket.to(data.room).emit('user_stopped_typing', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', {
        socketId: socket.id,
        userId: socket.userId,
        reason
      });
    });
    
    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', {
        socketId: socket.id,
        userId: socket.userId,
        error
      });
    });
  });
  
  // Redis pub/sub for cross-server communication
  redisPubSubClient.on('message', (channel: string, message: string) => {
    try {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'project_updates':
          io.to(`project:${data.projectId}`).emit('project_update', data);
          break;
          
        case 'donation_updates':
          io.to(`donation:${data.donationId}`).emit('donation_update', data);
          break;
          
        case 'milestone_updates':
          io.to(`milestone:${data.milestoneId}`).emit('milestone_update', data);
          break;
          
        case 'voting_updates':
          io.to(`voting:${data.sessionId}`).emit('voting_update', data);
          break;
          
        case 'notifications':
          if (data.userId) {
            io.to(`user:${data.userId}`).emit('notification', data);
          }
          if (data.role) {
            io.to(`role:${data.role}`).emit('notification', data);
          }
          break;
          
        default:
          logger.warn('Unknown Redis channel:', channel);
      }
    } catch (error) {
      logger.error('Failed to process Redis message:', error);
    }
  });
  
  // Subscribe to Redis channels
  redisPubSubClient.subscribe([
    'project_updates',
    'donation_updates',
    'milestone_updates',
    'voting_updates',
    'notifications'
  ]);
};

// Helper functions for emitting events
export class SocketService {
  static io: SocketIOServer;
  
  static initialize(io: SocketIOServer) {
    this.io = io;
  }
  
  // Emit to specific user
  static emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
  
  // Emit to users with specific role
  static emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }
  
  // Emit to project participants
  static emitToProject(projectId: string, event: string, data: any) {
    this.io.to(`project:${projectId}`).emit(event, data);
  }
  
  // Emit to voting session participants
  static emitToVotingSession(sessionId: string, event: string, data: any) {
    this.io.to(`voting:${sessionId}`).emit(event, data);
  }
  
  // Broadcast to all connected users
  static broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
  
  // Emit donation update
  static emitDonationUpdate(donationId: string, data: any) {
    this.io.to(`donation:${donationId}`).emit('donation_update', data);
    
    // Also publish to Redis for cross-server communication
    redisPubSubClient.publish('donation_updates', JSON.stringify({
      donationId,
      ...data
    }));
  }
  
  // Emit milestone update
  static emitMilestoneUpdate(milestoneId: string, data: any) {
    this.io.to(`milestone:${milestoneId}`).emit('milestone_update', data);
    
    redisPubSubClient.publish('milestone_updates', JSON.stringify({
      milestoneId,
      ...data
    }));
  }
  
  // Emit project update
  static emitProjectUpdate(projectId: string, data: any) {
    this.io.to(`project:${projectId}`).emit('project_update', data);
    
    redisPubSubClient.publish('project_updates', JSON.stringify({
      projectId,
      ...data
    }));
  }
  
  // Emit voting update
  static emitVotingUpdate(sessionId: string, data: any) {
    this.io.to(`voting:${sessionId}`).emit('voting_update', data);
    
    redisPubSubClient.publish('voting_updates', JSON.stringify({
      sessionId,
      ...data
    }));
  }
  
  // Send notification
  static sendNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification', notification);
    
    redisPubSubClient.publish('notifications', JSON.stringify({
      userId,
      ...notification
    }));
  }
  
  // Send role-based notification
  static sendRoleNotification(role: string, notification: any) {
    this.emitToRole(role, 'notification', notification);
    
    redisPubSubClient.publish('notifications', JSON.stringify({
      role,
      ...notification
    }));
  }
}

// Placeholder for AI support message processing
async function processSupportMessage(message: string, language?: string, userId?: string) {
  // TODO: Implement AI support bot logic
  return {
    message: 'Thank you for your message. This is a placeholder response.',
    confidence: 0.8,
    language: language || 'en'
  };
} 