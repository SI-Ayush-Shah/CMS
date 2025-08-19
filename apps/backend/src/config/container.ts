import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import * as glob from 'glob'
import path from 'path'
import { db } from '../db/connection'
import { createRedisClient } from '../config/redis'

export async function setupContainerWithAutoDiscovery() {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  })

  // Manual registration for database (handle null case)
  const redis = await createRedisClient()
  container.register({
    db: asValue(db || null),
    redis: asValue(redis || null),
  })

  // Do not execute queries during container setup; repositories/services will run queries per-request

  // TRUE FILESYSTEM AUTODISCOVERY
  autodiscoverAndRegister(container)

  return container
}

function autodiscoverAndRegister(container: any) {
  const srcPath = path.resolve(__dirname, '..')

  // Scan for all factory files (exclude db directory - manually registered)
  const patterns = [
    'repositories/**/*.ts',
    'services/**/*.ts', 
    'controllers/**/*.ts'
  ]

  for (const pattern of patterns) {
    const files = glob.sync(pattern, { cwd: srcPath })

    for (const file of files) {
      // Skip ExampleService and database connection (manually registered)
      if (file.includes('ExampleService') || file.includes('connection.ts')) continue

      try {
        const modulePath = path.resolve(srcPath, file)
        const module = require(modulePath)
        
        // Find factory functions (createXxx)
        for (const [exportName, exportValue] of Object.entries(module)) {
          if (typeof exportValue === 'function' && exportName.startsWith('create')) {
            const dependencyName = exportName.charAt(6).toLowerCase() + exportName.slice(7)
            
            container.register({
              [dependencyName]: asFunction(exportValue as any).singleton()
            })
          }
        }
      } catch (error) {
        // Silently skip files that can't be loaded
        continue
      }
    }
  }
}

// Manual registration fallback (if needed)
export const manualDependencies = {
  db: asValue(db),
  // Add manual overrides here if autodiscovery fails for specific dependencies
}
