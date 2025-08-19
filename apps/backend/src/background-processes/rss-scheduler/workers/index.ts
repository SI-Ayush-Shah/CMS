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

function normalizeFeedItem(item: any) {
  // --- GUID / ID ---
  let guid =
    item.guid?._text ||
    item.guid?._cdata ||
    item.guid ||
    item.id?._text ||
    item.id?._cdata ||
    item.id;

  // Atom feeds: fall back to link if no guid
  if (!guid && item.link) {
    if (typeof item.link === "string") {
      guid = item.link;
    } else if (item.link._href) {
      guid = item.link._href;
    } else if (Array.isArray(item.link)) {
      const altLink = item.link.find((l: any) => l._rel === "alternate");
      guid = altLink?._href || item.link[0]?._href;
    }
  }

  // --- Title ---
  const title =
    item.title?._text ||
    item.title?._cdata ||
    item.title ||
    "";

  // --- Link ---
  let link = "";
  if (typeof item.link === "string") {
    link = item.link;
  } else if (item.link?._href) {
    link = item.link._href;
  } else if (Array.isArray(item.link)) {
    const altLink = item.link.find((l: any) => l._rel === "alternate");
    link = altLink?._href || item.link[0]?._href || "";
  }

  // --- Summary / Description ---
  const summary =
    item.description?._text ||
    item.description?._cdata ||
    item.description ||
    item.summary?._text ||
    item.summary?._cdata ||
    item.summary ||
    "";

  // --- Content ---
  const content =
    item.content?._text ||
    item.content?._cdata ||
    item.content ||
    item["content:encoded"]?._text ||
    item["content:encoded"] ||
    "";

  // --- Author ---
  let author =
    item.author?._text ||
    item.author?._cdata ||
    item.author ||
    item["dc:creator"]?._text ||
    item["dc:creator"] ||
    "";

  // Some Atom feeds: <author><name>...</name></author>
  if (typeof item.author === "object" && item.author.name) {
    author = item.author.name._text || item.author.name;
  }

  // --- Categories ---
  let categories: string[] = [];
  if (item.category) {
    if (Array.isArray(item.category)) {
      categories = item.category.map((cat: any) =>
        cat._text || cat._cdata || cat
      );
    } else {
      categories = [item.category._text || item.category._cdata || item.category];
    }
  }

  // --- Published Date ---
  const publishedDate =
    item.pubDate ||
    item.published ||
    item.updated ||
    item["dc:date"] ||
    null;

  const publishedAt = publishedDate ? new Date(publishedDate) : null;

  return {
    guid: guid || null,
    title,
    link,
    summary,
    content,
    author,
    categories,
    publishedAt,
  };
}

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
              summary: z.string(),
              link: z.string().url().optional(),
              content: z.string(),
              author: z.string().optional(),
              categories: z.array(z.string()).optional(),
            })
          )
        );
        

        const prompt = `
        You are given a raw RSS feed response. 
        Extract all the feed items and return them strictly as a JSON array of objects. 
        
        Each object must follow this schema:
        {
          "title": string,
          "link": string,
          "pubDate": string,
          "description": string
        }
        
        Return ONLY the JSON array, no explanations.
        Feed:
        ${xmlContent}
        `

        const result = await structuredModel.invoke([
          {
            role: "user",
            content : prompt
          }
        ])
        
        console.log('Result', result)


        
        // // Parse XML content
        // const parser = new XMLParser({
        //   ignoreAttributes: false,
        //   attributeNamePrefix: "_",
        // })

        // const result = parser.parse(xmlContent)
        
        // // Handle different RSS formats
        // const channel = result.rss?.channel || result.feed
        
        // if (!channel) {
        //   throw new Error('Invalid RSS feed format')
        // }
        
        // // Get items (handle different formats)
        // const items = channel.item || channel.entry || []
        // const feedItems = Array.isArray(items) ? items : [items]
        
        // if (feedItems.length === 0) {
        //   console.log('No items found in feed', { id, feedName })
        //   return 'no-items'
        // }
        
        // console.log(`Found ${feedItems.length} items in feed`, { id, feedName })
        
        // // Process each item
        // const newItems: NewRssFeedItem[] = []
        
        // for (const item of feedItems) {
        //   const normalizedItem = normalizeFeedItem(item)
          
        //   // Skip items without a title
        //   if (!normalizedItem.title) continue
          
        //   // Check if item already exists by guid
        //   let existingItem = null
        //   if (normalizedItem.guid) {
        //     existingItem = await rssFeedItemRepository.getByGuid(id, normalizedItem.guid)
        //   }
          
        //   // If no guid or not found by guid, check by title
        //   if (!existingItem && normalizedItem.title) {
        //     existingItem = await rssFeedItemRepository.getByTitle(id, normalizedItem.title)
        //   }
          
        //   // Skip if item already exists
        //   if (existingItem) continue
          
        //   // Add new item
        //   newItems.push({
        //     feedId: id,
        //     guid: normalizedItem.guid,
        //     title: normalizedItem.title,
        //     link: normalizedItem.link,
        //     summary: normalizedItem.summary,
        //     content: normalizedItem.content,
        //     author: normalizedItem.author,
        //     categories: normalizedItem.categories,
        //     publishedAt: normalizedItem.publishedAt || undefined
        //   })
        // }
        
        // // Save new items to database
        // if (newItems.length > 0) {
        //   const savedItems = await rssFeedItemRepository.createMany(newItems)
        //   console.log(`Added ${savedItems.length} new items to feed`, { id, feedName })
        //   return { added: savedItems.length }
        // } else {
        //   console.log('No new items to add', { id, feedName })
        //   return { added: 0 }
        // }
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
