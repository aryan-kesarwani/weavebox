declare module 'crypto-browserify' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): any;
  export function createHmac(algorithm: string, key: string | Buffer): any;
  export function createCipher(algorithm: string, password: string | Buffer): any;
  export function createDecipher(algorithm: string, password: string | Buffer): any;
  export function createSign(algorithm: string): any;
  export function createVerify(algorithm: string): any;
  export function createDiffieHellman(prime_length: number): any;
  export function pbkdf2(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: Buffer) => void
  ): void;
  export function pbkdf2Sync(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string
  ): Buffer;
} 