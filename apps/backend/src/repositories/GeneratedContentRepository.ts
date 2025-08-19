import { db } from '../db'
import { generatedContents, type GeneratedContent, type NewGeneratedContent } from '../db/schema'
import { and, desc, asc, eq, inArray, sql, count } from 'drizzle-orm'

export interface GeneratedContentRepository {
  create(data: NewGeneratedContent): Promise<GeneratedContent>
  update(id: string, data: Partial<NewGeneratedContent>): Promise<GeneratedContent | null>
  list(params: ListParams): Promise<ListResult>
  findById(id: string): Promise<GeneratedContent | null>
}

export interface ListParams {
  page: number
  pageSize: number
  status?: 'draft' | 'published'
  category?: string
  categories?: string[]
  tags?: string[]
  sort?: 'asc' | 'desc'
}

export interface ListResult {
  items: GeneratedContent[]
  total: number
  page: number
  pageSize: number
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
    },
    async update(id: string, data: Partial<NewGeneratedContent>): Promise<GeneratedContent | null> {
      if (!id) return null
      const [row] = await db.update(generatedContents).set(data).where(eq(generatedContents.id, id)).returning()
      return row ?? null
    },
    async list(params: ListParams): Promise<ListResult> {
      const { page, pageSize, status, category, categories, tags, sort } = params
      const whereClauses = [] as any[]

      if (status) whereClauses.push(eq(generatedContents.status, status))
      if (category) whereClauses.push(eq(generatedContents.category, category))
      if (categories && categories.length) whereClauses.push(inArray(generatedContents.category, categories))
      if (tags && tags.length) {
        // Match: tags column contains all requested tags
        whereClauses.push(sql`${generatedContents.tags} @> ${JSON.stringify(tags)}::jsonb`)
      }

      const whereExpr = whereClauses.length ? and(...whereClauses) : undefined

      const [{ total }] = await db
        .select({ total: count() })
        .from(generatedContents)
        .where(whereExpr as any)

      const orderBy = sort === 'asc' ? asc(generatedContents.createdAt) : desc(generatedContents.createdAt)

      const items = await db
        .select()
        .from(generatedContents)
        .where(whereExpr as any)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      return { items, total: Number(total), page, pageSize }
    },
    async findById(id: string): Promise<GeneratedContent | null> {
      if (!id) return null
      const rows = await db.select().from(generatedContents).where(eq(generatedContents.id, id)).limit(1)
      return rows[0] ?? null
    }
  }
}


