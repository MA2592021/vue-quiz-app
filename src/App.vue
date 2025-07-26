<template>
  <v-app>
    <v-locale-provider :rtl="isRtl">
      <AppBar />
      <v-main class="bg-bgPrimary">
        <router-view />
      </v-main>
    </v-locale-provider>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppBar from './modules/AppBar.vue'

const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
</script>

<style>
@import '@/assets/css/main.css';
</style>
