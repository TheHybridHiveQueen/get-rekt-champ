declare module "omggif" {
  export class GifReader {
    constructor(buf: Uint8Array | Buffer);
    width: number;
    height: number;
    numFrames(): number;
    decodeAndBlitFrameRGBA(frame: number, pixels: Uint8Array): void;
  }
}
