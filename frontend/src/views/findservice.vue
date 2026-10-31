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
      <!--List of Services table-->
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

        <!-- Show the table when services are available -->
        <table
          v-else
          class="min-w-full shadow-md rounded"
        >
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left" style="width: 25%;">Service Name</th>
              <th class="p-4 text-left" style="width: 75%;">Service Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr @click="$router.push({name: 'servicedetails', params: { id: service._id } })" 
            v-for="service in services" :key="service._id" class="cursor-pointer"
              :class="{ 'hoverRow': hoverId === service._id }" @mouseenter="hoverId = service._id"
              @mouseleave="hoverId = null">
              <td class="p-4 text-left">{{ service.name }}</td>
              <td class="p-4 text-left text-sm">{{ service.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'

// Manage service data, loading, and errors with useApi()
const {
  data: services,
  loading,
  error,
  execute
} = useApi(
  async (query = null) => {
    // No search query means load all services
    if (query === null) {
      return await getServices()
    }

    // Otherwise, search services
    return await searchServices(query)
  },
  []
)

const searchBy = ref('Service Name')
const name = ref('')
const description = ref('')
const hoverId = ref(null)

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
</script>