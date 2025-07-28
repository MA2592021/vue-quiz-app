<template>
  <v-container
    class="fill-height d-flex flex-column align-center justify-center text-center"
  >
    <v-icon color="error" size="96">mdi-alert-circle-outline</v-icon>
    <h1 class="mt-4 mb-2">{{ $t('page-not-found') }}</h1>
    <p class="mb-6">
      {{ $t('page-not-found-message') }}<br />
      {{ $t('page-not-found-instruction') }}
    </p>
    <v-btn color="primary" to="/">{{ $t('go-to-home') }}</v-btn>
  </v-container>
</template>
