<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Player, PlayersResponse } from '~/models/player.model';
import type { Competition, CompetitionsResponse } from '~/models/competition.model';

const { find } = useStrapi();
const selectedNationality = ref('');
const selectedCompetition = ref('');
const sortDirection = ref('ascending');
const page = ref(1);
const pageSize = ref(3);

// Réinitialiser la page à 1 chaque fois que l'ordre de tri change
watch(sortDirection, () => {
    page.value = 1;
});

const playersQueryParams = computed(() => ({
    populate: '*',
    pagination: {
        page: page.value,
        pageSize: pageSize.value
    },
    sort: sortDirection.value === 'ascending' ? 'ranking:asc' : 'ranking:desc',
    filters: {
        competitions: {
            name: {
                $in: selectedCompetition.value !== '' ? selectedCompetition.value : []
            }
        },
        nationalite: {
            $in: selectedNationality.value !== '' ? selectedNationality.value : []
        }
    }
    // Vous pouvez inclure l'ordre de tri dans les paramètres si votre API le supporte
}));

const { data: playersData, pending: playersPending, error: playersError} = useAsyncData(
    'players',
    () => find<PlayersResponse>('players', playersQueryParams.value),
    {
        watch: [page, pageSize, selectedCompetition, selectedNationality, sortDirection]
    }
);


// Computed property pour les joueurs filtrés et triés
const sortedFilteredPlayers = computed(() => {
    if (!playersData.value || !playersData.value.data) {
        return [];
    }

    let players = playersData.value.data.filter((player: Player) => {
        const matchesNationality = player.nationalite === selectedNationality.value || selectedNationality.value === '';
        const matchesCompetition = player.competitions.some(competition => competition.name === selectedCompetition.value) || selectedCompetition.value === '';
        return matchesNationality && matchesCompetition;
    });

    if (sortDirection.value === 'ascending') {
        players.sort((a, b) => a.ranking - b.ranking);
    } else if (sortDirection.value === 'descending') {
        players.sort((a, b) => b.ranking - a.ranking);
    }
    // refreshPlayers()
    return players;
});
</script>

<template>
    <div class="container">
        <h1>Liste des Joueurs</h1>
        <!-- Debbuging -->
        <!-- <pre>{{ playersData }}</pre> -->
        <!-- <pre>{{ competitionsData }}</pre> -->
        <div class="filters">
            <!-- Nationality Filter -->
            <div class="filter">
                <label for="country-select">Nationalité :</label>
                <select name="country" id="country-select" v-model="selectedNationality">
                    <option value="">--Please choose an option--</option>
                    <option value="France">France</option>
                    <option value="Chine">Chine</option>
                    <option value="Japon">Japon</option>
                </select>
            </div>

            <!-- Competition Filter -->
            <div class="filter">
                <label for="competitions-select">Compétitions :</label>
                <select name="competition" id="competitions-select" v-model="selectedCompetition">
                    <option value="">--Please choose an option--</option>
                    <option v-for="competition in competitionsData?.data" :key="competition.id"
                        :value="competition.name">{{ competition.name }}</option>
                </select>
            </div>

            <!-- Sort Direction Filter -->
            <div class="filter">
                <label for="sort-select">Trier par classement :</label>
                <select name="sort" id="sort-select" v-model="sortDirection">
                    <option value="ascending">Croissant</option>
                    <option value="descending">Décroissant</option>
                </select>
            </div>
        </div>

        <section v-if="playersPending || competitionsPending">
            <span>Loading...</span>
        </section>

        <section v-else-if="playersError || competitionsError">
            <span>Error: {{ playersError || competitionsError }}</span>
        </section>

        <section v-else>
            <div class="player-list">
                <div v-for="player in sortedFilteredPlayers" :key="player.id" class="player-card">
                    <img :src="player.image.url" :alt="`Image de ${player.first_name} ${player.last_name}`"
                        class="player-image" />
                    <div class="player-info">
                        <h2 class="player-name">
                            <a :href="`/players/${player.slug}`">
                                {{ player.first_name }} {{ player.last_name }}
                            </a>
                        </h2>
                        <p class="player-ranking">Classement: #{{ player.ranking }}</p>
                    </div>
                </div>
                <UPagination  v-if="playersData?.meta" v-model="page" :page-count="playersData?.meta.pagination.pageCount" :total="playersData?.meta.pagination.total" class="mx-auto mt-8" />
            </div>
        </section>
    </div>
</template>

<style scoped>
a {
    color: black;
    text-decoration: none;
    font-weight: bold;
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.filter label {
    display: block;
    margin-bottom: 5px;
}

.filter select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.player-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.player-card {
    width: calc(33.333% - 20px);
    border: 1px solid #ddd;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    height: 300px;
    /* Définit la hauteur de la carte du joueur */
    display: flex;
    /* Utilisé pour aligner l'image et le contenu verticalement */
    flex-direction: column;
    /* Empile l'image et le contenu verticalement */
}

.player-image {
    width: 100%;
    height: 200px;
    /* Définit la hauteur de l'image */
    display: block;
    object-fit: contain;
    /* Assure que l'image couvre bien l'espace défini sans être déformée */
}

.player-info {
    padding: 15px;
    text-align: center;
}

.player-name {
    font-size: 20px;
    margin: 0 0 10px 0;
}

.player-ranking {
    font-size: 16px;
    color: #555;
}
</style>
