import { CirclePublisher } from "../publisher"
import { createLogger } from "reg-suit-util"
import fs from "fs"
import rimraf from "rimraf"
import mkdirp from "mkdirp"

beforeEach(() => {
  const fixtures = fs.realpathSync(`${__dirname}/../../fixtures`)
  const artifact = `${fixtures}/artifacts/09f985d5-31b6-4c61-aa51-cfdfb6f4c459`
  rimraf.sync(artifact)
  mkdirp.sync(artifact)
})
describe("Publisher", () => {
  it("Should detect local files", async () => {
    expect.assertions(2)
    const publisher = new CirclePublisher()
    const fixtures = fs.realpathSync(`${__dirname}/../../fixtures/.reg`)
    publisher.init({
      coreConfig: { actualDir: "", workingDir: "" },
      logger: createLogger(),
      noEmit: false,
      options: {
        artifactPath: "fixtures/artifacts",
        buildUrl: "http://example.com",
      },
      workingDirs: {
        base: fixtures,
        actualDir: `${fixtures}/actual`,
        expectedDir: `${fixtures}/expected`,
        diffDir: "",
      },
    })
    const result = await publisher.fetch("9d71a61a-d2ac-4dd4-a38b-40513348a23f")
    expect(result).toHaveLength(1)
    expect(result[0].absPath).toEqual(`${fixtures}/expected/reg-suit.jpg`)
  })

  it("Should work if the snapshot is missing", async () => {
    expect.assertions(1)
    const publisher = new CirclePublisher()
    const fixtures = fs.realpathSync(`${__dirname}/../../fixtures/.reg`)
    publisher.init({
      coreConfig: { actualDir: "", workingDir: "" },
      logger: createLogger(),
      noEmit: false,
      options: {
        artifactPath: "fixtures/artifacts",
        buildUrl: "http://example.com",
      },
      workingDirs: {
        base: fixtures,
        actualDir: `${fixtures}/actual`,
        expectedDir: `${fixtures}/expected`,
        diffDir: "",
      },
    })
    const result = await publisher.fetch("9c9bef0d-425e-42ec-82d2-20e76c8a6a07")
    expect(result).toHaveLength(0)
  })

  it("Should publish to local disk", async () => {
    expect.assertions(2)
    const publisher = new CirclePublisher()
    const artifacts = fs.realpathSync(`${__dirname}/../../fixtures/artifacts`)
    const fixtures = `${artifacts}/9d71a61a-d2ac-4dd4-a38b-40513348a23f`
    publisher.init({
      coreConfig: { actualDir: "", workingDir: "" },
      logger: createLogger(),
      noEmit: false,
      options: {
        artifactPath: "fixtures/artifacts",
        buildUrl: "http://example.com",
      },
      workingDirs: {
        base: fixtures,
        actualDir: `${fixtures}/actual`,
        expectedDir: `${fixtures}/expected`,
        diffDir: "",
      },
    })
    const { reportUrl } = await publisher.publish(
      "09f985d5-31b6-4c61-aa51-cfdfb6f4c459"
    )
    expect(reportUrl).toEqual("http://example.com")
    expect(
      fs.existsSync(
        `${artifacts}/09f985d5-31b6-4c61-aa51-cfdfb6f4c459/actual/reg-suit.jpg`
      )
    ).toEqual(true)
  })
  //  Getting prefix: build/regsuit/8487e75355ac8e2ba2512bc648363c3ea43f0e3d/actual
  //  Uploading item for [build/regsuit/febe8d9747fe48019b282df2627808758971adf7]: actual/content-page-desktop.png
})
