<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Events Attendance
          </h1>
          
<!-- Loading state -->
<div v-if="loading" class="flex justify-center mt-10 text-gray-500">
  Loading attendance data...
</div>

<!-- Error state -->
<div v-else-if="error" class="mt-10 text-center text-red-700" role="alert">
  {{ error.message }}
</div>

<!-- Empty state -->
<div v-else-if="recentEvents.length === 0" class="flex justify-center mt-10">
  No events found.
</div>

<!-- Success state: show table and chart -->
<template v-else>
  <table class="min-w-full shadow-md rounded">
    <thead class="bg-gray-50 text-xl">
      <tr>
        <th class="p-4 text-left">Event Name</th>
        <th class="p-4 text-left">Event Date</th>
        <th class="p-4 text-left">Number of Attendees</th>
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-300">
      <tr
        v-for="event in recentEvents"
        :key="event._id"
        @click="editEvent(event._id)"
        class="cursor-pointer"
      >
        <td class="p-2 text-left">{{ event.name }}</td>
        <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
        <td class="p-2 text-left">{{ event.attendees.length }}</td>
      </tr>
    </tbody>
  </table>

  <AttendanceChart
    :label="labels"
    :chart-data="chartData"
  />
</template>

        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Clients by Zip Code
          </h1>
               
<!-- Loading state -->
<div v-if="zipLoading" class="flex justify-center mt-10 text-gray-500">
  Loading ZIP code data...
</div>

<!-- Error state -->
<div v-else-if="zipError" class="mt-10 text-center text-red-700" role="alert">
  {{ zipError.message }}
</div>

<!-- Empty state -->
<div v-else-if="zips.length === 0" class="flex justify-center mt-10">
  No clients found.
</div>

<!-- Success state: show table and chart -->
<template v-else>
  <table class="min-w-full shadow-md rounded">
    <thead class="bg-gray-50 text-xl">
      <tr>
        <th class="p-4 text-left">Zip Number</th>
        <th class="p-4 text-left">Client Count</th>
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-300">
      <tr v-for="zip in zips" :key="zip._id">
        <td class="p-2 text-left">{{ zip._id }}</td>
        <td class="p-2 text-left">{{ zip.count }}</td>
      </tr>
    </tbody>
  </table>

  <ZipChart
    :label="zipLabels"
    :chart-data="zipChartData"
  />
</template>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'

const router = useRouter()

 // Event attendance API request
const {
  data: recentEvents,
  loading,
  error,
  execute: loadAttendance
} = useApi(getAttendance, [])

// Client ZIP code API request
const {
  data: zips,
  loading: zipLoading,
  error: zipError,
  execute: loadZips
} = useApi(getClientsByZipCode, [])

// Chart data derived from the API results
const labels = computed(() =>
  recentEvents.value.map(
    (item) => `${item.name} (${formatDate(item.date)})`
  )
)

const chartData = computed(() =>
  recentEvents.value.map((item) => item.attendees.length)
)

const zipLabels = computed(() =>
  zips.value.map((item) => item._id)
)

const zipChartData = computed(() =>
  zips.value.map((item) => item.count)
)

onMounted(() => {
  loadAttendance()
  loadZips()
})

// method called to format the event date
function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

// The template's row @click calls editEvent(), which was never defined in the
// original component. Defined here so the click opens the event's details page.
function editEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}
</script>
