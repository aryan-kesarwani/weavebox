declare module 'stream-browserify' {
  export class Readable {
    constructor(opts?: any);
    push(chunk: any, encoding?: string): boolean;
    pipe(destination: any, options?: any): any;
  }
  export class Writable {
    constructor(opts?: any);
    write(chunk: any, encoding?: string, callback?: Function): boolean;
    end(chunk?: any, encoding?: string, callback?: Function): void;
  }
  export class Transform {
    constructor(opts?: any);
  }
} 