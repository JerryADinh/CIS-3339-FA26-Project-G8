<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <!-- Displays Client Name search field -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="firstName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="lastName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text" v-model="phoneNumber" v-on:keyup.enter="handleSubmitForm"
            placeholder="Enter Client Phone Number" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>
      <div class="flex flex-col col-span-2">

        <!-- Display while waiting for the API response -->
        <p v-if="loading" class="text-center text-gray-500 py-4">
          Loading clients...
        </p>

        <!-- Display when the API request fails -->
        <p v-else-if="error" class="text-center text-red-600 py-4" role="alert">
          {{ error.message }}
        </p>

        <!-- Display when no matching clients exist -->
        <p v-else-if="clients.length === 0" class="text-center text-gray-500 py-4">
          No clients found.
        </p>

        <!-- Display P3's reusable DataTable when clients are available -->
        <DataTable
          v-else
          :rows="clients"
          :columns="tableColumns"
          @row-click="openClient"
        />

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/dataTable.vue'

//Notifications
const router = useRouter()

//variable to store all clients and their information for the organization
// manage client data, loading, and errors through useApi()
const {
  data: clients,
  loading,
  error,
  execute
} = useApi(
  async (query = null) => {
    if (query === null) {
      return await getClients()
    }

    return await searchClients(query)
  },
  []
)

// Columns used by P3's reusable DataTable
const tableColumns = [
  {
    key: 'name',
    label: 'Name',
    value: (client) => `${client.firstName} ${client.lastName}`,
  },
  {
    key: 'phoneNumber',
    label: 'Phone number',
    value: (client) => client.phoneNumber?.primary ?? '',
  },
  {
    key: 'city',
    label: 'City',
    value: (client) => client.address?.city ?? '',
  },
]

// Parameters for search to occur
const searchBy = ref('Client Name')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
// when component is mounted, load the data -
onMounted(() => {
  loadData()
})

// method called when component is mounted
async function loadData() {
  // reset all search fields.
  searchBy.value = 'Client Name'
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''

  // load all clients through the shared composable.
  await execute()
}

// method called when user searches for clients
async function handleSubmitForm() {
  let query = null

  // search clients by name
  if (searchBy.value === 'Client Name') {
    if (!firstName.value && !lastName.value) {
      return
    }

    query = {
      searchBy: 'name',
      firstName: firstName.value,
      lastName: lastName.value
    }
  }

  // search clients by phone number
  else if (searchBy.value === 'Client Number') {
    if (!phoneNumber.value) {
      return
    }

    query = {
      searchBy: 'number',
      phoneNumber: phoneNumber.value
    }
  }

  // execute the search using useApi()
  if (query !== null) {
    await execute(query)
  }
}

// navigate to the details page for the clicked client
function openClient(client) {
  router.push({ name: 'clientdetails', params: { id: client._id } })
}
</script>
