<script setup lang="js">
import { ref, computed, watch } from 'vue';

const { find } = useStrapi();
const selectedNationality = ref('');
const selectedCompetition = ref('');
const sortDirection = ref('ascending');
const page = ref(1);
const pageSize = ref(3);
const playerSearchQuery = ref('');

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
        nationalites: {
            name: {
                $in: selectedNationality.value !== '' ? selectedNationality.value : []
            }
        },
        full_name: {
            $containsi: playerSearchQuery.value
        }
    }
    // Vous pouvez inclure l'ordre de tri dans les paramètres si votre API le supporte
}));

const { data: playersData, pending: playersPending, error: playersError} = useAsyncData(
    'players',
    () => find('players', playersQueryParams.value),
    {
        watch: [page, pageSize, selectedCompetition, selectedNationality, sortDirection, playerSearchQuery]
    }
);
const { data: competitionsData, pending: competitionsPending, error: competitionsError} = useAsyncData(
    'competitions',
    () => find('competitions'),
    {
      watch: [selectedCompetition]
    }
);
const { data: nationalitesData, pending: nationalitesPending, error: nationalitesError} = useAsyncData(
    'nationalites',
    () => find('nationalites'),
    {
      watch: [selectedNationality]
    }
);

// Computed property pour les joueurs filtrés et triés
const sortedFilteredPlayers = computed(() => {
    if (!playersData.value || !playersData.value.data) {
        return [];
    }

    let players = playersData.value.data.filter((player) => {
        const matchesNationality = player.nationalites.some(nationalite => nationalite.name === selectedNationality.value) || selectedNationality.value === '';
        const matchesCompetition = player.competitions.some(competition => competition.name === selectedCompetition.value) || selectedCompetition.value === '';
        const matchesFullName = player.full_name.toLowerCase().includes(playerSearchQuery.value.toLowerCase()) || playerSearchQuery.value === '';
        console.log(matchesFullName);
        return matchesNationality && matchesCompetition && matchesFullName;
    });

    if (sortDirection.value === 'ascending') {
        players.sort((a, b) => a.ranking - b.ranking);
    } else if (sortDirection.value === 'descending') {
        players.sort((a, b) => b.ranking - a.ranking);

    }
    return players;
});
</script>

<template>
    <div class="container">
        <!-- Debbuging -->
        <!-- <pre>{{ playersData }}</pre> -->
        <!-- <pre>{{ competitionsData }}</pre> -->
        <div class="filters  justify-center">
          <!-- Player Name Search -->
            <div class="filter">
                <label for="player-search">Recherche par nom :</label>
                <input type="text" id="player-search" v-model="playerSearchQuery" placeholder="Entrez le nom complet du joueur">
            </div>
            <!-- Nationality Filter -->
            <div class="filter">
                <label for="country-select">Nationalité :</label>
                <select name="country" id="country-select" v-model="selectedNationality">
                    <option value="">Toutes nationalités</option>
                    <option v-for="nationalite in nationalitesData?.data" :key="nationalite.id"
                          :value="nationalite.name">{{ nationalite.name }}</option>
                </select>
            </div>

            <!-- Competition Filter -->
            <div class="filter">
                <label for="competitions-select">Compétitions :</label>
                <select name="competition" id="competitions-select" v-model="selectedCompetition">
                    <option value="">Toutes compétitions</option>
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

        <section v-if="playersPending || competitionsPending || nationalitesPending">
            <span>Loading...</span>
        </section>

        <section v-else-if="playersError || competitionsError || nationalitesError">
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
                        <p class="player-ranking">Nationalité: {{ player.nationalites.map(nationalite => nationalite.name).join(', ') }}</p>
                    </div>
                </div>
            </div>
          <UPagination  v-if="playersData?.meta" v-model="page" :page-count="playersData?.meta.pagination.pageCount" :total="playersData?.meta.pagination.total" class="mx-auto mt-8" />
        </section>
    </div>
</template>

<style scoped>
a,p {
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
    height: 320px;
    display: flex;
    flex-direction: column;
}

.player-image {
    width: 100%;
    height: 200px;
    display: block;
    object-fit: contain;
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