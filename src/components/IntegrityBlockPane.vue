<script setup lang="ts">
import { computed } from 'vue';

import { base32, base64 } from 'rfc4648';

import { WebBundle, SignatureType } from '../BundleReader';
import Header from './Header.vue';

const props = defineProps<{
  bundle: WebBundle;
}>();

function computeOrigin(key: Uint8Array, type: SignatureType) {
  const suffixed = new Uint8Array(key.length + 3);
  suffixed.set(key);
  switch (type) {
    case SignatureType.Ed25519:
      suffixed.set([0, 1, 2], key.length);
      break;
    case SignatureType.EcdsaP256SHA256:
      suffixed.set([0, 2, 2], key.length);
      break;
  }
  const hostname = base32.stringify(suffixed, { pad: false }).toLowerCase();
  return `isolated-app://${hostname}`;
}

function stringifyKey(key: Uint8Array) {
  return base64.stringify(key);
}

function toHex(n: number) {
  return ('0' + n.toString(16)).slice(-2).toUpperCase();
}

function stringifySignature(signature: Uint8Array) {
  return Array.from(signature).map(toHex).join(' ');
}

const data = computed(() => {
  const { attributes, signatures } = props.bundle.integrityBlock!;
  return {
    computedOrigin: attributes
      ? `isolated-app://${attributes.webBundleId}`
      : computeOrigin(signatures[0].publicKey, signatures[0].type),
    signatures: signatures.map((signature) => {
      return {
        Type: SignatureType[signature.type],
        'Public Key': stringifyKey(signature.publicKey),
        Signature: stringifySignature(signature.signature),
      };
    })
  }
});
</script>

<template>
  <Header sticky>Integrity Block</Header>
  <div class="px-1">
    <dl class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <dt class="text-secondary">{{ 'Computed Origin' }}</dt>
      <dd class="font-mono">{{ data.computedOrigin }}</dd>
    </dl>
  </div>

  <template v-for="[idx, entry] in data.signatures.entries()">
    <Header>{{ `Signature #${idx + 1}`}}</Header>
    <div class="px-1">
      <dl class="inline-grid grid-cols-[auto_1fr] gap-x-3">
        <template v-for="(value, key) in entry">
          <dt class="text-secondary">{{ key }}</dt>
          <dd class="font-mono">{{ value }}</dd>
        </template>
      </dl>
    </div>
  </template>
</template>
