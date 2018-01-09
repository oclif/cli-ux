// tslint:disable

declare namespace NodeJS {
  interface Global {
    columns: number
    testCount: number
    testRoot: string
    'cli-ux'?: {
      debug?: boolean
      mock?: boolean
      errlog?: string
      stdout?: string
      stderr?: string
      setup?: boolean
      action?: {
        task?: {
          action: string
          status: string | undefined
          active: boolean
        }
        output?: string
      }
    }
  }
}

