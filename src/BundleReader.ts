import { decodeFirst } from 'cborg';
import { Bundle } from 'wbn';

export type SignatureBlockError =
  | 'SIG_INVALID'
  | 'SIG_UNKNOWN_VERSION'
  | 'SIG_UNSUPPORTED_KEY_TYPE';

export type WebBundleError = SignatureBlockError | 'BAD_MAGIC';

export type SignatureBlock = {
  ed25519PublicKey: Uint8Array;
  signature: Uint8Array;
  valid: boolean;
};

export type WebBundle = {
  signatureBlock?: SignatureBlock;
  contents: Bundle;
};

export class BundleReader {
  constructor(private bundle: File) {}

  async read(): Promise<WebBundle | WebBundleError> {
    const reader = new FileReader();
    const loadEvent: ProgressEvent<FileReader> = await new Promise(
      (resolve) => {
        reader.addEventListener('load', resolve);
        reader.readAsArrayBuffer(this.bundle);
      },
    );
    const bundleBuffer = loadEvent.target?.result as ArrayBuffer;
    const u8BundleBuffer = new Uint8Array(bundleBuffer);

    const textDecoder = new TextDecoder();
    const magicBytes = new Uint8Array(bundleBuffer, 2, 8);
    switch (textDecoder.decode(magicBytes)) {
      case '🖋📦':
        const [sigCbor, contentsBuffer] = decodeFirst(u8BundleBuffer);
        const sig = this.parseSignatureBlock(sigCbor);
        if (typeof sig === 'string') {
          return sig;
        }
        return {
          signatureBlock: sig,
          contents: new Bundle(contentsBuffer),
        };

      case '🌐📦':
        return { contents: new Bundle(u8BundleBuffer) };

      default:
        return 'BAD_MAGIC';
    }
  }

  private parseSignatureBlock(cbor: any[]): SignatureBlock | WebBundleError {
    if (
      cbor.length != 3 ||
      cbor[0].length != 8 ||
      cbor[1].length != 4 ||
      cbor[2].length != 1 ||
      cbor[2][0].length != 2 ||
      !(cbor[2][0][1] instanceof Uint8Array)
    ) {
      return 'SIG_INVALID';
    }
    const version = new TextDecoder().decode(cbor[1]);
    if (version != '1\0\0\0' && version != '1b\0\0') {
      return 'SIG_UNKNOWN_VERSION';
    }
    if (!('ed25519PublicKey' in cbor[2][0][0])) {
      return 'SIG_UNSUPPORTED_KEY_TYPE';
    }
    return {
      ed25519PublicKey: cbor[2][0][0]['ed25519PublicKey'],
      signature: cbor[2][0][1],
      valid: true, // TODO: validate signature
    };
  }
}
