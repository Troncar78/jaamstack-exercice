<script setup lang="ts">
import type { PlayerResponse } from "~/models/player.model"

const { findOne } = useStrapi4()
const route = useRoute()

const { data, pending, error} = await useAsyncData('player', async() => {
    return await findOne<PlayerResponse>(`players/${route.params.slug}`)
})

</script>

<template>
    <h1>Player single page</h1>
    <pre>{{ data }}</pre>
</template>