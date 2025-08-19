import { db } from '../db'
import { generatedContents, type GeneratedContent, type NewGeneratedContent } from '../db/schema'

export interface GeneratedContentRepository {
  create(data: NewGeneratedContent): Promise<GeneratedContent>
}

interface Dependencies {
  db: typeof db
}

export function createGeneratedContentRepository({ db }: Dependencies): GeneratedContentRepository {
  if (!db) throw new Error('db is required for generatedContentRepository')

  return {
    async create(data: NewGeneratedContent): Promise<GeneratedContent> {
      const [row] = await db.insert(generatedContents).values(data).returning()
      if (!row) throw new Error('Failed to insert generated content')
      return row
    }
  }
}


