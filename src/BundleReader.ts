import { decodeFirst } from 'cborg';
import { Bundle } from 'wbn';
import whatwgUrl from 'whatwg-url';

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
  signatureBlock?: SignatureBlock;
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
    let signatureBlock: SignatureBlock | undefined = undefined;

    const textDecoder = new TextDecoder();
    const magicBytes = new Uint8Array(bundleBuffer, 2, 8);
    switch (textDecoder.decode(magicBytes)) {
      case '🖋📦':
        const [sigCbor, remaining] = decodeFirst(u8BundleBuffer);
        const sig = this.parseSignatureBlock(sigCbor);
        if (typeof sig === 'string') {
          return sig;
        }
        signatureBlock = sig;
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
      signatureBlock,
      resources: this.createResourcesMap(contents),
    };
  }

  // See https://github.com/WICG/webpackage/blob/main/explainers/integrity-signature.md
  private parseSignatureBlock(cbor: any[]): SignatureBlock | WebBundleError {
    if (
      cbor.length != 3 ||
      cbor[0].length != 8 || // Magic bytes (already verified)
      cbor[1].length != 4 || // Version
      cbor[2].length != 1 || // Signature stack
      cbor[2][0].length != 2 || // Attributes + signature
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
