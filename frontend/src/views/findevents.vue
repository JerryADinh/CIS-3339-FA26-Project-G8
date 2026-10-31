<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date" v-model="eventDate" v-on:keyup.enter="handleSubmitForm" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="button">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">

        <!-- Show while an API request is running -->
        <p v-if="loading" class="text-center text-gray-500 py-4">
          Loading events...
        </p>

        <!-- Show when the API request fails -->
        <p v-else-if="error" class="text-center text-red-600 py-4" role="alert">
          {{ error.message }}
        </p>

        <!-- Show when no events match the search -->
        <p v-else-if="events.length === 0" class="text-center text-gray-500 py-4">
          No events found.
        </p>

        <!-- Display P3's reusable DataTable -->
        <DataTable
          v-else
          :rows="events"
          :columns="tableColumns"
          @row-click="openEvent"
        />

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/dataTable.vue'

// router used to navigate to event details
const router = useRouter()

// Manage event loading, searching, and errors through useApi()
const {
  data: events,
  loading,
  error,
  execute
} = useApi(
  async (query = null) => {
    // No query means load all events
    if (query === null) {
      return await getEvents()
    }

    // Otherwise search using the provided query
    return await searchEvents(query)
  },
  []
)

// Columns used by P3's reusable DataTable
const tableColumns = [
  {
    key: 'name',
    label: 'Event Name',
  },
  {
    key: 'date',
    label: 'Event Date',
    value: (event) => formatDate(event.date),
    sortValue: (event) => new Date(event.date).getTime(),
  },
  {
    key: 'address',
    label: 'Event Address',
    value: (event) => event.address?.line1 ?? '',
  },
]

// Parameters for event searches
const searchBy = ref('Event Name')
const name = ref('')
const eventDate = ref('')

// when component is mounted, load the data
onMounted(() => {
  loadData()
})

// method called when component is mounted
async function loadData() {
  searchBy.value = 'Event Name'
  name.value = ''
  eventDate.value = ''

  await execute()
}

// method called when user searches for an event
async function handleSubmitForm() {
  let query = null

  // Search by event name
  if (searchBy.value === 'Event Name') {
    if (!name.value) {
      return
    }

    query = {
      searchBy: 'name',
      name: name.value
    }
  }

  // Search by event date
  else if (searchBy.value === 'Event Date') {
    if (!eventDate.value) {
      return
    }

    query = {
      searchBy: 'date',
      eventDate: eventDate.value
    }
  }

  // Use the same composable for either search type
  if (query !== null) {
    await execute(query)
  }
}

// method called for each event date so it will be formatted correctly on the table
function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

// navigate to the details page for the clicked event
function openEvent(event) {
  router.push({ name: 'eventdetails', params: { id: event._id } })
}
</script>
