import { PluginCreateOptions, PluginPreparer } from "reg-suit-interface"
import { PluginConfig } from "./publisher"
import mkdirp from "mkdirp"

export interface SetupInquireResult {
  artifactPath: string
}

export class CirclePreparer
  implements PluginPreparer<SetupInquireResult, PluginConfig>
{
  inquire() {
    return [
      {
        name: "artifactPath",
        type: "input",
        message: "Enter the artifact path relative to the working directory",
      },
    ]
  }

  prepare(
    option: PluginCreateOptions<SetupInquireResult>
  ): Promise<PluginConfig> {
    return new Promise((resolve, reject) => {
      mkdirp(option.options.artifactPath).then(
        () => resolve({ artifactPath: option.options.artifactPath, buildUrl: "$CIRCLE_BUILD_URL" }),
        (e) => reject(e)
      )
    })
  }
}
