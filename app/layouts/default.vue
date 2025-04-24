<template>
  <div class="min-h-screen flex transition-colors" :class="dynamicThemeClass">
    <!-- Sidebar (vertical navbar) -->
    <MenusGlobalNavbar class='sticky top-0 h-screen ' />

    <!-- Main content -->
    <main class="flex-1 scroll-smooth">
      <slot />
    </main>
  </div>
</template>
<script setup>
const dynamicThemeClass = computed(
  () => "bg-[var(--color-bg)] text-[var(--color-text)]"
);
</script>
