<template>
  <v-card class="mb-6">
    <v-card-title>{{ t('performance-summary') }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-success">
              {{ correctAnswers }}
            </div>
            <div class="text-body-2">{{ t('correct-answers') }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-error">
              {{ totalQuestions - correctAnswers }}
            </div>
            <div class="text-body-2">{{ t('incorrect-answers') }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-primary">
              {{ Math.round((correctAnswers / totalQuestions) * 100) }}%
            </div>
            <div class="text-body-2">{{ t('accuracy') }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  correctAnswers: number
  totalQuestions: number
}>()
</script>
