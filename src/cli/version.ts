import { platformVersion, releaseName, releaseDate, buildNumber, architectureVersion } from "@/version"

export interface VersionInfo {
  platformVersion: string
  releaseName: string
  releaseDate: string
  buildNumber: string
  architectureVersion: string
}

export function getVersionInfo(): VersionInfo {
  return {
    platformVersion,
    releaseName,
    releaseDate,
    buildNumber,
    architectureVersion,
  }
}

export async function handleVersion(): Promise<number> {
  const info = getVersionInfo()
  const lines = [
    `Perionyx Enterprise Platform`,
    `Version       : ${info.platformVersion}`,
    `Release       : ${info.releaseName}`,
    `Released      : ${info.releaseDate}`,
    `Build         : ${info.buildNumber}`,
    `Architecture  : ${info.architectureVersion}`,
  ]
  for (const line of lines) {
    console.log(line)
  }
  return 0
}
