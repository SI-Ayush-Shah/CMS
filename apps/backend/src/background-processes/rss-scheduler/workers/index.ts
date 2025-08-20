import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../../config/redis'
import { XMLParser } from 'fast-xml-parser'
import { asFunction, createContainer } from 'awilix'
import { db } from '../../../db/connection'
import { createRssFeedItemRepository } from '../../../repositories/RssFeedItemRepository'
import axios from 'axios'
import type { NewRssFeedItem } from '../../../db/schema'
import { createGoogleGenaiModel } from '../../../llms/google-genai/model';
import z from 'zod';


let rssSchedulerWorkerInstance: Worker | null = null

export function startRssSchedulerWorker(): Worker {
  if (rssSchedulerWorkerInstance) return rssSchedulerWorkerInstance

  const worker = new Worker('rss-scheduler-queue', async (job: Job) => {
    if (job.name === 'scrape-feed') {
      const { id, feedName, feedSourceUrl, isActive, updateInterval } = job.data
      console.log('Scraping feed', { id, feedName, feedSourceUrl, isActive, updateInterval })
      
      // Skip inactive feeds
      if (!isActive) {
        console.log('Feed inactive, skipping', { id, feedName })
        return 'skip-inactive'
      }
      
      try {
        // Setup local container for repositories
        const container = createContainer()
        container.register({
          db: asFunction(() => db).singleton(),
          rssFeedItemRepository: asFunction(createRssFeedItemRepository).singleton()
        })
        
        const rssFeedItemRepository = container.resolve('rssFeedItemRepository')
        
        // Fetch and parse the feed
        const response = await axios.get(feedSourceUrl, { responseType: 'text' })
        const xmlContent = response.data


        const model = createGoogleGenaiModel({
          modelName: "gemini-2.5-flash",
          temperature: 0.0,
        })

        const structuredModel = model.withStructuredOutput(
          z.array(
            z.object({
              title: z.string(),
              guid: z.string().optional(),
              summary: z.string(),
              imageUrl: z.url().optional(),
              link: z.url().optional(),
              content: z.string(),
              author: z.string().optional(),
              categories: z.array(z.string()).optional(),
            })
          )
        );

        const prompt = `
        You are given a raw RSS or Atom feed in XML format.  
        Your task is to parse and normalize the feed into a JSON array of objects.  
        
        Use your smartness in parsing the feed. to identify the title, link, description, published_date, author, and image_url.
        the keys can be different in the feed. so you need to identify the keys and parse the feed accordingly.

        📌 Rules:
        1. Always return ONLY a JSON array, nothing else.  
        2. Each object must have the following structure (use null if not available):
           {
             "title": string,
             "link": string,
             "description": string,
             "published_date": string (ISO 8601 if possible),
             "author": string,
             "image_url": string
           }
        
        3. For "title":
           - Prefer <title>, else <media:title>, else <dc:title>.  
        
        4. For "link":
           - Prefer <link>, else <guid>, else <id>.  
        
        5. For "description":
           - Prefer <description>, else <summary>, else <content>, else null.  
        
        6. For "published_date":
           - Prefer <pubDate>, else <published>, else <updated>, else null.  
        
        7. For "author":
           - Prefer <author><name>, else <dc:creator>, else <creator>, else null.  
        
        8. For "image_url":
           - Prefer <media:content url="...">, 
           - else <enclosure url="..." type="image/...">,
           - else <media:thumbnail url="...">,
           - else parse first <img src="..."> inside description/content,
           - else null.  
        
        Feed:
        ${xmlContent}
        `
        

        const result = await structuredModel.invoke([
          {
            role: "human",
            content : prompt
          }
        ])
        

        const newItems = result.map((item) => ({
          ...item,
          feedId: id,
        }))

        console.log('New items===========>', newItems)

        // Save new items to database
        if (result.length > 0) {
          const savedItems = await rssFeedItemRepository.createMany(newItems)
          console.log(`Added ${savedItems.length} new items to feed`, { id, feedName })
          return { added: savedItems.length }
        } else {
          console.log('No new items to add', { id, feedName })
          return { added: 0 }
        }
      } catch (error) {
        console.error('Error scraping feed', {
          id, feedName, feedSourceUrl, 
          error: error instanceof Error ? error.message : String(error)
        })
        throw error
      }
    }
    return 'ok'
  }, { connection: redisConnection })

  worker.on('error', (err) => {
    console.error('Worker error:', err)
  })

  worker.on('ready', () => {
    console.log('RSS scheduler worker is ready')
  })

  worker.on('closed', () => {
    console.log('Worker closed')
  })

  worker.on('completed', (_job: Job) => {
    // Intentionally quiet to avoid noisy logs
  })

  rssSchedulerWorkerInstance = worker
  return worker
}

// Generic entry used by the worker auto-loader plugin
export const startWorker = startRssSchedulerWorker
