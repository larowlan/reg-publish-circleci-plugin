import {
  PublisherPlugin,
  PluginCreateOptions,
  WorkingDirectoryInfo,
  PublishResult,
} from "reg-suit-interface"
import {
  FileItem,
  RemoteFileItem,
  ObjectListResult,
  AbstractPublisher,
  ObjectMetadata,
} from "reg-suit-util"
import { copyFile, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import mkdirp from "mkdirp"

export interface PluginConfig {
  artifactPath: string
  pattern?: string
  buildUrl: string
}

export class CirclePublisher
  extends AbstractPublisher
  implements PublisherPlugin<PluginConfig>
{
  name = "reg-publish-circleci"

  protected pluginConfig!: PluginConfig
  protected config!: PluginCreateOptions<PluginConfig>

  init(config: PluginCreateOptions<PluginConfig>): void {
    this.logger = config.logger
    this.config = config
    this.pluginConfig = config.options
    this.noEmit = config.noEmit
  }

  protected downloadItem(
    _remoteItem: RemoteFileItem,
    item: FileItem
  ): Promise<FileItem> {
    return new Promise((resolve) => {
      resolve(item)
    })
  }

  fetch(key: string): Promise<any> {
    return this.fetchInternal(key)
  }

  protected getBucketName(): string {
    return ""
  }

  protected getBucketRootDir(): string | undefined {
    return this.pluginConfig.artifactPath
  }

  protected getLocalGlobPattern(): string | undefined {
    return this.pluginConfig.pattern
  }

  protected getWorkingDirs(): WorkingDirectoryInfo {
    return this.config.workingDirs
  }

  protected listItems(
    _lastKey: string,
    prefix: string
  ): Promise<ObjectListResult> {
    this.logger.info(`Getting prefix: ${prefix}`)
    return new Promise((resolve, reject) => {
      if (!existsSync(prefix)) {
        resolve({
          isTruncated: false,
          contents: [],
        })
      }
      readdir(prefix).then(
        (files) => {
          const entries = []
          for (const file of files) {
            entries.push({
              key: file,
            } as ObjectMetadata)
          }
          resolve({
            isTruncated: false,
            contents: entries,
          } as ObjectListResult)
        },
        (e) => reject(e)
      )
    })
  }

  publish(key: string): Promise<PublishResult> {
    return this.publishInternal(key).then(() => {
      return { reportUrl: this.pluginConfig.buildUrl }
    })
  }

  protected uploadItem(key: string, item: FileItem): Promise<FileItem> {
    this.logger.info(`Copying item for [${key}]: ${item.path}`)
    return new Promise((resolve, reject) => {
      mkdirp(`${key}/${path.dirname(item.path)}`).then(
        () => {
          const destination = `${key}/${item.path}`
          copyFile(item.absPath, destination).then(
            () => resolve(item),
            (err) => reject(err)
          )
        },
        (err) => reject(err)
      )
    })
  }
}
