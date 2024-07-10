import { decodeFirst } from 'cborg';
import { Bundle } from 'wbn';
import whatwgUrl from 'whatwg-url';

export type IntegrityBlockError =
  | 'SIG_INVALID'
  | 'SIG_UNKNOWN_VERSION'
  | 'SIG_UNSUPPORTED_KEY_TYPE'
  | 'ATTRIBUTES_INVALID';

export type WebBundleError = IntegrityBlockError | 'BAD_MAGIC';

export enum SignatureType {
  'Ed25519',
  'EcdsaP256SHA256',
}

export type Signature = {
  publicKey: Uint8Array;
  signature: Uint8Array;
  type: SignatureType;
  valid: boolean;
};

export type Attributes = {
  webBundleId: string;
};

export type IntegrityBlock = {
  attributes?: Attributes;
  signatures: Array<Signature>;
};

interface Headers {
  [key: string]: string;
}

export type Resource = {
  id: string;
  url: {
    path: string;
    pathParts: string[];
    origin?: string;
    query?: string;
  };

  status: number;
  headers: Headers;
  contentType?: string;
  body: Uint8Array;
};

export type ResourceMap = { [key: string]: Resource };

export type WebBundle = {
  filename: string;
  integrityBlock?: IntegrityBlock;
  resources: ResourceMap;
};

export const bundleFileTypes = ['.wbn', '.swbn'];

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

    let contentsBuffer = u8BundleBuffer;
    let integrityBlock: IntegrityBlock | undefined = undefined;

    const textDecoder = new TextDecoder();
    const magicBytes = new Uint8Array(bundleBuffer, 2, 8);
    switch (textDecoder.decode(magicBytes)) {
      case '🖋📦':
        const [ibCbor, remaining] = decodeFirst(u8BundleBuffer);
        const ib = this.parseIntegrityBlock(ibCbor);
        if (typeof ib === 'string') {
          return ib;
        }
        integrityBlock = ib;
        contentsBuffer = remaining;
        break;

      case '🌐📦':
        break;

      default:
        return 'BAD_MAGIC';
    }

    const contents = new Bundle(contentsBuffer);
    return {
      filename: this.bundle.name,
      integrityBlock,
      resources: this.createResourcesMap(contents),
    };
  }

  private parseAttributes(attributesCbor: any): Attributes | WebBundleError {
    if ('webBundleId' in attributesCbor) {
      const webBundleId = attributesCbor['webBundleId'];
      if (typeof webBundleId !== 'string') {
        return 'ATTRIBUTES_INVALID';
      }
      return { webBundleId };
    }
    return 'ATTRIBUTES_INVALID';
  }

  private parseSignatures(
    signaturesCbor: any[],
  ): Array<Signature> | WebBundleError {
    const signatures = new Array<Signature>();
    for (const signatureCbor of signaturesCbor) {
      if (signatureCbor.length != 2) {
        return 'SIG_INVALID';
      }
      const [attributes, signature] = signatureCbor;
      if (!(signature instanceof Uint8Array)) {
        return 'SIG_INVALID';
      }
      if ('ed25519PublicKey' in attributes) {
        const publicKey = attributes['ed25519PublicKey'];
        if (!(publicKey instanceof Uint8Array)) {
          return 'SIG_INVALID';
        }
        signatures.push({
          publicKey,
          signature,
          type: SignatureType.Ed25519,
          valid: true,
        });
      } else if ('ecdsaP256SHA256PublicKey' in attributes) {
        const publicKey = attributes['ecdsaP256SHA256PublicKey'];
        if (!(publicKey instanceof Uint8Array)) {
          return 'SIG_INVALID';
        }
        signatures.push({
          publicKey,
          signature,
          type: SignatureType.EcdsaP256SHA256,
          valid: true,
        });
      } else {
        return 'SIG_UNSUPPORTED_KEY_TYPE';
      }
    }

    return signatures;
  }

  // See https://github.com/WICG/webpackage/blob/main/explainers/integrity-signature.md
  private parseIntegrityBlock(cbor: any[]): IntegrityBlock | WebBundleError {
    if (cbor.length < 2 || cbor[0].length != 8) {
      return 'SIG_INVALID';
    }
    const version = new TextDecoder().decode(cbor[1]);
    if (version === '1b\0\0') {
      if (cbor.length != 3 || cbor[2].length != 1) {
        return 'SIG_INVALID';
      }
      const signatures = this.parseSignatures(cbor[2]);
      if (typeof signatures === 'string') {
        return signatures;
      }
      return { signatures };
    } else if (version === '2b\0\0') {
      if (cbor.length != 4) {
        return 'SIG_INVALID';
      }
      const attributes = this.parseAttributes(cbor[2]);
      if (typeof attributes === 'string') {
        return attributes;
      }
      const signatures = this.parseSignatures(cbor[3]);
      if (typeof signatures === 'string') {
        return signatures;
      }
      return { attributes, signatures };
    } else {
      return 'SIG_UNKNOWN_VERSION';
    }
  }

  private createResourcesMap(bundle: Bundle): ResourceMap {
    const resources: ResourceMap = {};
    const baseHost = `invalid-${String(Math.random()).slice(-6)}`;
    const baseUrl = `http://${baseHost}`;
    for (const url of bundle.urls) {
      const parsed = new whatwgUrl.URL(url, baseUrl);
      const pathParts = parsed.pathname
        .replaceAll(/^\/+/g, '')
        .replaceAll(/\/+$/g, '')
        .replaceAll(/\/\/+/g, '/')
        .split('/');
      if (pathParts.length === 1 && pathParts[0] === '') {
        pathParts.pop();
      }
      const resource = bundle.getResponse(url);
      resources[url] = {
        id: url,
        url: {
          path: parsed.pathname,
          pathParts,
          query: parsed.search || undefined,
        },
        status: resource.status,
        headers: resource.headers,
        body: resource.body,
      };

      if (parsed.hostname !== baseHost) {
        const port = parsed.port ? `:${parsed.port}` : '';
        const origin = `${parsed.protocol}//${parsed.hostname}${port}`;
        resources[url].url.origin = origin;
      }

      for (const [header, value] of Object.entries(resource.headers)) {
        if (header.toLowerCase() === 'content-type') {
          resources[url].contentType = value;
        }
      }
    }
    return resources;
  }
}
