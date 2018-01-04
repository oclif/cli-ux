import * as fs from 'fs-extra'

declare module 'fs-extra' {
  function write(fd: number, data: any): void;
}
