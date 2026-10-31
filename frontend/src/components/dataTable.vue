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
          @click="$emit('row-click', row)"
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
        <tr v-if="rows.length === 0">
          <td class="p-4 text-center text-gray-500" :colspan="columns.length">
            No results found.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm">
        Showing {{ firstRow }}–{{ lastRow }} of {{ rows.length }}
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

<script>
export default {
  emits: ['row-click'],
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      required: true,
    },
    rowKey: {
      type: String,
      default: '_id',
    },
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      sortKey: null,
      sortDirection: 1,
      hoverKey: null,
    }
  },
  computed: {
    pageCount() {
      return Math.max(1, Math.ceil(this.rows.length / this.pageSize))
    },
    sortedRows() {
      if (!this.sortKey) {
        return this.rows
      }

      const column = this.columns.find((item) => item.key === this.sortKey)
      if (!column) {
        return this.rows
      }

      return [...this.rows].sort((left, right) => {
        const leftValue = this.getSortValue(left, column)
        const rightValue = this.getSortValue(right, column)

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
            sensitivity: 'base',
          })
        }
        return comparison * this.sortDirection
      })
    },
    paginatedRows() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.sortedRows.slice(start, start + this.pageSize)
    },
    firstRow() {
      return this.rows.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1
    },
    lastRow() {
      return Math.min(this.currentPage * this.pageSize, this.rows.length)
    },
  },
  watch: {
    rows() {
      this.currentPage = 1
    },
    pageSize() {
      this.currentPage = 1
    },
    pageCount(pageCount) {
      if (this.currentPage > pageCount) {
        this.currentPage = pageCount
      }
    },
  },
  methods: {
    getCellValue(row, column) {
      return column.value ? column.value(row) : row[column.key]
    },
    getSortValue(row, column) {
      return column.sortValue ? column.sortValue(row) : this.getCellValue(row, column)
    },
    sortBy(column) {
      if (this.sortKey === column.key) {
        this.sortDirection *= -1
      } else {
        this.sortKey = column.key
        this.sortDirection = 1
      }
      this.currentPage = 1
    },
  },
}
</script>
