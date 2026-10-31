<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables, Colors } from 'chart.js'

Chart.register(...registerables)
Chart.register(Colors)

const props = defineProps({
  label: {
    type: Array
  },
  chartData: {
    type: Array
  }
})

// template ref for the <canvas> element
const attendanceChart = ref(null)
// Chart.js instance. Kept as a plain variable on purpose: wrapping it in ref()/reactive()
// makes Vue proxy the chart's internals, which breaks Chart.js.
let chart = null

onMounted(() => {
  chart = new Chart(attendanceChart.value, {
    type: 'bar',
    data: {
      labels: props.label,
      datasets: [
        {
          borderWidth: 1,
          data: props.chartData
        }
      ]
    },
    options: {
      scales: {
        y: {
          ticks: {
            stepSize: 1
          }
        },
        x: {
          gridLines: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Attendance Chart'
        }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// redraw the chart if the parent passes new data
watch([() => props.label, () => props.chartData], () => {
  if (!chart) return
  chart.data.labels = props.label
  chart.data.datasets[0].data = props.chartData
  chart.update()
}, { deep: true })

// release the canvas and Chart.js listeners when the component is removed
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>
