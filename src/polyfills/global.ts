// Comprehensive polyfills for simple-peer/randombytes and other Node.js dependencies
const gAny: any = globalThis as any;

// 1. Define global reference
if (typeof gAny.global === 'undefined') {
  gAny.global = gAny;
}

// 2. Define process and process.env
if (typeof gAny.process === 'undefined') {
  gAny.process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: '16.0.0' },
    nextTick: (fn: Function) => setTimeout(fn, 0),
    cwd: () => '/',
    chdir: () => {},
    exit: () => {}
  };
}

// 3. Comprehensive crypto polyfill
if (!gAny.crypto) {
  gAny.crypto = {};
}
if (typeof gAny.crypto.getRandomValues !== 'function') {
  gAny.crypto.getRandomValues = function <T extends ArrayBufferView>(arr: T): T {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}

// 4. Buffer polyfill for simple-peer
if (typeof gAny.Buffer === 'undefined') {
  gAny.Buffer = {
    isBuffer: () => false,
    from: (data: any) => new Uint8Array(data),
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size)
  };
}

// 5. Ensure Function.prototype.call exists and works (defensive)
if (typeof Function.prototype.call === 'undefined') {
  Function.prototype.call = function(thisArg: any, ...args: any[]) {
    return this.apply(thisArg, args);
  };
}
