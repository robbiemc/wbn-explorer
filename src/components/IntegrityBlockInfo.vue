<script setup lang="ts">
import { computed } from 'vue';

import { base32, base64 } from 'rfc4648';

import { WebBundle } from '../BundleReader';

const props = defineProps<{
  bundle: WebBundle;
}>();

function computeOrigin(key: Uint8Array) {
  const suffixed = new Uint8Array(key.length + 3);
  suffixed.set(key);
  suffixed.set([0, 1, 2], key.length);
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
  const block = props.bundle.signatureBlock!;
  return {
    'Computed Origin': computeOrigin(block.ed25519PublicKey),
    'Public Key': stringifyKey(block.ed25519PublicKey),
    Signature: stringifySignature(block.signature),
  };
});
</script>

<template>
  <div class="px-1">
    <dl class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <template v-for="(value, key) in data">
        <dt class="text-slate-400">{{ key }}</dt>
        <dd class="font-mono">{{ value }}</dd>
      </template>
    </dl>
  </div>
</template>
