<template>
  <div class="mb-6">
    <div class="d-flex justify-space-between align-center mb-2">
      <span class="text-body-1">
        {{ questionProgressText }}
      </span>
      <span class="text-body-1 font-weight-medium">
        {{ progressPercentage }}%
      </span>
    </div>
    <v-progress-linear
      :model-value="progressPercentage"
      color="primary"
      height="8"
      rounded
    ></v-progress-linear>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  questionProgressText: string
  progressPercentage: number
}>()
</script>
