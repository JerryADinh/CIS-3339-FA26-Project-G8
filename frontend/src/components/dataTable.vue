<template>
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="column.headerClass || 'p-4 text-left'"
            :style="column.headerStyle"
            :aria-sort="sortKey === column.key ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'"
          >
            <button
              class="font-inherit text-inherit"
              type="button"
              @click="sortBy(column)"
            >
              {{ column.label }}
              <span aria-hidden="true">
                {{ sortKey === column.key ? (sortDirection === 1 ? '↑' : '↓') : '↕' }}
              </span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr
          v-for="row in paginatedRows"
          :key="row[rowKey]"
          class="cursor-pointer"
          :class="{ hoverRow: hoverKey === row[rowKey] }"
          @click="emit('row-click', row)"
          @mouseenter="hoverKey = row[rowKey]"
          @mouseleave="hoverKey = null"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.cellClass || 'p-2 text-left'"
            :style="column.cellStyle"
          >
            {{ getCellValue(row, column) }}
          </td>
        </tr>
        <tr v-if="tableRows.length === 0">
          <td class="p-4 text-center text-gray-500" :colspan="columns.length">
            No results found.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm">
        Showing {{ firstRow }}–{{ lastRow }} of {{ tableRows.length }}
      </p>
      <div class="flex items-center gap-2">
        <label class="text-sm">
          Rows per page
          <select v-model.number="pageSize" class="rounded-md border-gray-300">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
        </label>
        <button
          type="button"
          class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          Previous
        </button>
        <span class="text-sm">Page {{ currentPage }} of {{ pageCount }}</span>
        <button
          type="button"
          class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === pageCount"
          @click="currentPage += 1"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  rows: {
    type: [Array, null],
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  rowKey: {
    type: String,
    default: '_id'
  }
})

const emit = defineEmits(['row-click'])

const currentPage = ref(1)
const pageSize = ref(10)
const sortKey = ref(null)
const sortDirection = ref(1)
const hoverKey = ref(null)

const tableRows = computed(() => {
  return Array.isArray(props.rows) ? props.rows : []
})

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(tableRows.value.length / pageSize.value))
})

function getCellValue(row, column) {
  const renderFn = column.render || column.value
  return renderFn ? renderFn(row) : row[column.key]
}

function getSortValue(row, column) {
  return column.sortValue ? column.sortValue(row) : getCellValue(row, column)
}

// 3-state sort cycle: ascending (1) -> descending (-1) -> unsorted (null)
function sortBy(column) {
  if (sortKey.value !== column.key) {
    sortKey.value = column.key
    sortDirection.value = 1
  } else if (sortDirection.value === 1) {
    sortDirection.value = -1
  } else {
    sortKey.value = null
    sortDirection.value = 1
  }
  currentPage.value = 1
}

const sortedRows = computed(() => {
  if (!sortKey.value) {
    return tableRows.value
  }

  const column = props.columns.find((item) => item.key === sortKey.value)
  if (!column) {
    return tableRows.value
  }

  return [...tableRows.value].sort((left, right) => {
    const leftValue = getSortValue(left, column)
    const rightValue = getSortValue(right, column)

    if (leftValue == null || rightValue == null) {
      if (leftValue == null && rightValue == null) return 0
      return leftValue == null ? 1 : -1
    }

    let comparison
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      comparison = leftValue - rightValue
    } else {
      comparison = String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    }
    return comparison * sortDirection.value
  })
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

const firstRow = computed(() => {
  return tableRows.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
})

const lastRow = computed(() => {
  return Math.min(currentPage.value * pageSize.value, tableRows.value.length)
})

watch(tableRows, () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

watch(pageCount, (newPageCount) => {
  if (currentPage.value > newPageCount) {
    currentPage.value = newPageCount
  }
})
</script>