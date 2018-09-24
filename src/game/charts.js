import config from '../config'

Chart.defaults.global.defaultFontColor = 'white'

const perfChart = () => {
  return new Chart(document.getElementById('perfChart'), {
    type: 'line',
    data: {
      datasets: [
        {
          borderColor: config.ChartMainColor,
          borderWidth: 1.5,
          pointRadius: 0,
          backgroundColor: config.ChartFillColor,
          label: 'Best Fitness per Generation',
          data: []
        }
      ]
    },
    options: {
      backgroundColor: config.ChartSecondaryColor,
      scales: {
        xAxes: [
          {
            type: 'linear',
            position: 'bottom'
          }
        ]
      },
      legend: {
        labels: {
          fontColor: 'white'
        }
      }
    }
  })
}

const ageChart = () => {
  const baseArrayPop = Array.from(
    Array(~~(config.Population * config.KeepAlivePercent))
  )
  return new Chart(document.getElementById('ageChart'), {
    type: 'bar',
    data: {
      labels: baseArrayPop.map((x, i) => i + 1),
      datasets: [
        {
          label: 'Age of the top ' + baseArrayPop.length + ' genomes',
          backgroundColor: baseArrayPop.map(() => config.ChartMainColor),
          data: baseArrayPop.map(() => 0)
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      },
      legend: {
        labels: {
          fontColor: 'white'
        }
      }
    }
  })
}

export default {
  perfChart,
  ageChart
}
