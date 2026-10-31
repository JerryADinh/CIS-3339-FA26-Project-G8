<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <!-- Displays Service Name and Description selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>
        <!--Display service name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service name" />
          </label>
        </div>
        <!--Display service description search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Description'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="description" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service description" />
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <!--Clear Search button-->
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="button">
            Clear Search
          </button>
          <!--Search Service button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>
      <div class="flex flex-col col-span-2">

        <!-- Show while the API request is running -->
        <p v-if="loading" class="text-center text-gray-500 py-4">
          Loading services...
        </p>

        <!-- Show when the API request fails -->
        <p v-else-if="error" class="text-center text-red-600 py-4" role="alert">
          {{ error.message }}
        </p>

        <!-- Show when no services are found -->
        <p v-else-if="services.length === 0" class="text-center text-gray-500 py-4">
          No services found.
        </p>

        <!-- Display P3's reusable DataTable -->
        <DataTable
          v-else
          :rows="services"
          :columns="tableColumns"
          @row-click="openService"
        />

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/dataTable.vue'

const router = useRouter()

// Manage service data, loading, and errors through useApi()
const {
  data: services,
  loading,
  error,
  execute
} = useApi(
  async (query = null) => {
    // No query means load all services
    if (query === null) {
      return await getServices()
    }

    // Otherwise, search using the provided query
    return await searchServices(query)
  },
  []
)

// Columns used by P3's reusable DataTable
const tableColumns = [
  {
    key: 'name',
    label: 'Service Name',
    headerStyle: 'width: 25%',
    cellClass: 'p-4 text-left',
  },
  {
    key: 'description',
    label: 'Service Description',
    headerStyle: 'width: 75%',
    cellClass: 'p-4 text-left text-sm',
  },
]

// Search parameters
const searchBy = ref('Service Name')
const name = ref('')
const description = ref('')

// Migration: top-level functions replace methods.
// Load all services and reset search fields
async function loadData() {
  searchBy.value = 'Service Name'
  name.value = ''
  description.value = ''

  await execute()
}

// Search services by name or description
async function handleSubmitForm() {
  let query = null

  // Search by service name
  if (searchBy.value === 'Service Name') {
    if (!name.value) {
      return
    }

    query = {
      searchBy: 'name',
      name: name.value
    }
  }

  // Search by service description
  else if (searchBy.value === 'Service Description') {
    if (!description.value) {
      return
    }

    query = {
      searchBy: 'description',
      description: description.value
    }
  }

  // Execute the search through useApi()
  if (query !== null) {
    await execute(query)
  }
}

// Migration: onMounted() replaces the mounted lifecycle option.
onMounted(loadData)

function openService(service) {
  router.push({ name: 'servicedetails', params: { id: service._id } })
}
</script>