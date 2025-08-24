import { getMilvus } from '../config/milvus'

const COLLECTION = 'generated_content_embeddings'
const DIM = 1536

async function main() {
  const milvus = getMilvus()

  const exists = await milvus.hasCollection({ collection_name: COLLECTION })
  if (!exists.value) {
    await milvus.createCollection({
      collection_name: COLLECTION,
      fields: [
        { name: 'id', data_type: 'Int64', is_primary_key: true, autoID: true },
        { name: 'blogId', data_type: 'VarChar', type_params: { max_length: '64' } },
        { name: 'title', data_type: 'VarChar', type_params: { max_length: '256' } },
        { name: 'tags', data_type: 'VarChar', type_params: { max_length: '256' } },
        { name: 'status', data_type: 'VarChar', type_params: { max_length: '32' } },
        { name: 'embedding', data_type: 'FloatVector', type_params: { dim: String(DIM) } },
      ],
    })
    console.log(`Created collection ${COLLECTION}`)
  }

  // Create index if missing
  try {
    await milvus.createIndex({
      collection_name: COLLECTION,
      field_name: 'embedding',
      index_name: 'idx_embedding',
      index_type: 'IVF_FLAT',
      metric_type: 'IP',
      params: { nlist: 1024 },
    })
    console.log('Created index idx_embedding')
  } catch {}

  await milvus.loadCollectionSync({ collection_name: COLLECTION })
  console.log(`Loaded collection ${COLLECTION}`)
}

main().catch((e) => {
  console.error('Milvus init failed:', e)
  process.exit(1)
})


