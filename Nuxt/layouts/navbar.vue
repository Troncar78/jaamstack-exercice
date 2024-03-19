<template>
  <main role="main">
      <UDashboardPage>
        <UDashboardPanel>
          <UDashboardNavbar title="Users" badge="5">
            <template #right>
              <UButton label="New user" trailing-icon="i-heroicons-plus" color="gray" />
            </template>
          </UDashboardNavbar>
        </UDashboardPanel>
      </UDashboardPage>
    </main>
</template>
<script setup lang="ts">
</script>