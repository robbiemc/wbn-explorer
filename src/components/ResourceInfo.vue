<script setup lang="ts">
import { computed } from 'vue';
import { filesize } from 'filesize';
import { getReasonPhrase } from 'http-status-codes';

import { WebBundle } from '../BundleReader';

const props = defineProps<{
  bundle: WebBundle,
  url: string
}>();

const response = computed(() => {
  return props.bundle.contents.getResponse(props.url);
});
</script>

<template>
  <h1>{{ url }}</h1>
  <p>{{ `${response.status} ${getReasonPhrase(response.status)}` }}</p>
  <p>{{ filesize(response.body.byteLength) }}</p>
  <dl>
    <template v-for="(value, name) in response.headers">
      <dt>{{ name }}</dt>
      <dd>{{ value }}</dd>
    </template>
  </dl>
</template>
