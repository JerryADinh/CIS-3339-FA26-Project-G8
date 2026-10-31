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
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Service button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
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
        <data-table :rows="services" :columns="tableColumns" @row-click="openService" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getServices, searchServices } from '../api/api'
import { useToast } from 'vue-toastification'
import DataTable from '../components/dataTable.vue'

const toast = useToast()

// Migration: refs replace the state previously declared in data().
const services = ref(null)
const searchBy = ref(null)
const name = ref(null)
const description = ref(null)
const hoverId = ref(null)

// Migration: top-level functions replace methods.
// Refs use .value in JavaScript; the template unwraps them automatically.
async function loadData() {
  searchBy.value = ''
  name.value = ''
  description.value = ''

  try {
    services.value = await getServices()
  } catch (error) {
    toast.error(
      typeof error === 'string'
        ? error
        : error?.message || 'Error loading services'
    )
  }
}

async function handleSubmitForm() {
  let query

  if (searchBy.value === 'Service Name' && name.value) {
    query = {
      searchBy: 'name',
      name: name.value
    }
  } else if (
    searchBy.value === 'Service Description' &&
    description.value
  ) {
    query = {
      searchBy: 'description',
      description: description.value
    }
  } else {
    return
  }

  try {
    services.value = await searchServices(query)
  } catch (error) {
    toast.error(
      typeof error === 'string'
        ? error
        : error?.message || 'Error searching services'
    )
  }
}

// Migration: onMounted() replaces the mounted lifecycle option.
onMounted(loadData)
</script>