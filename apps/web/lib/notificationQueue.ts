import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Database';
import { sendEmail, emailTemplates } from '@/lib/emailService';

interface NotificationJob {
  userId: string;
  email: string;
  title: string;
  message: string;
  type: 'WELCOME' | 'TOURNAMENT_REGISTRATION' | 'MATCH_REMINDER' | 'ANNOUNCEMENT' | 'SYSTEM';
  templatePayload?: any;
}

// In-Memory Asynchronous Queue
const queue: NotificationJob[] = [];
import { EventEmitter } from 'events';
export const queueEmitter = new EventEmitter();

queueEmitter.on('process', async () => {
  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) break;

    try {
      await connectToDatabase();

      // 1. Create In-App Notification Record in MongoDB
      await Notification.create({
        userId: job.userId,
        title: job.title,
        message: job.message,
        type: job.type,
        channel: 'BOTH'
      });

      // 2. Select HTML Template and Process Email
      let htmlContent = `<p>${job.message}</p>`;
      if (job.type === 'WELCOME') {
        htmlContent = emailTemplates.welcome(job.templatePayload?.name || 'Player');
      } else if (job.type === 'TOURNAMENT_REGISTRATION') {
        htmlContent = emailTemplates.registrationConfirmation(
          job.templatePayload?.userName || 'Player',
          job.templatePayload?.tournamentTitle || 'Tournament',
          job.templatePayload?.teamName || 'Team'
        );
      }

      await sendEmail({
        to: job.email,
        subject: job.title,
        html: htmlContent
      });

    } catch (err) {
      console.error('Failed to process queued notification job:', err);
    }
  }
});

export function dispatchNotification(job: NotificationJob) {
  queue.push(job);
  queueEmitter.emit('process');
}
