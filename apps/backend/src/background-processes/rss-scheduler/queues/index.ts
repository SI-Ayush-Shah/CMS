import { Queue } from 'bullmq';
import { redisConnection } from '../../../config/redis';

const rssSchedulerQueue = new Queue('rss-scheduler-queue', {
  connection: redisConnection
});

export { rssSchedulerQueue };