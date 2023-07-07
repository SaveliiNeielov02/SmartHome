function updateTresholds(lowerBoundValue, upperBoundValue )
{
    var lowerBound = document.getElementById('lower-bound');
    var upperBound = document.getElementById('upper-bound');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/setTresholds', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        lowerBound.value = response.split(' ')[0]; 
        upperBound.value = response.split(' ')[1];
      } 
      else {
        console.error('Произошла ошибка про обновления состояние порогов. Статус:', xhr.status);
      }
    };
    xhr.onerror = function() {
      console.error('Произошла ошибка при обновлении порогов ' + room);
    };
    
    xhr.send(JSON.stringify(lowerBoundValue + ' ' + upperBoundValue));
}

setInterval(function() { updateTresholds('-1', '-1'); }, 4000);

var dataToPlot = [
  ];
var chart = null;
function updateTemperature()
{
    var heating = document.getElementById('heating')
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:5000/getTemperature', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        var temperature = parseInt(response.split(' ')[0]);
        var temperatureView = document.getElementById('temperature');
        temperatureView.innerHTML = temperature
        heating.innerHTML = response.split(' ')[1];
        var currentDate = response.split(' ')[2];
        dataToPlot.push({ time: currentDate, temperature: temperature });
        updateChart()
      } 
      else {
        console.error('Произошла ошибка про обновления состояние порогов. Статус:', xhr.status);
      }
    };
    xhr.onerror = function() {
      console.error('Произошла ошибка при обновлении порогов ' + room);
    };
    
    xhr.send();
}

setInterval(updateTemperature, 4000);

function updateChart() {
    var timeLabels = dataToPlot.map(function(item) {
        return item.time;
      });
    var temperatureData = dataToPlot.map(function(item) {
        return item.temperature;
      });
    if (chart !== null) {
        // Очищаем данные графика
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        
        // Добавляем новые данные графика
        chart.data.labels = timeLabels;
        chart.data.datasets[0].data = temperatureData;
        var lowerBound = parseInt(document.getElementById('lower-bound').value);
        var upperBound = parseInt(document.getElementById('upper-bound').value);
        // Настройка шкалы y-оси графика
    chart.options.scales = {
        y: {
          beginAtZero: true,
          suggestedMin: lowerBound,
          suggestedMax: upperBound
        }
      };
      
      // Удаление существующих аннотаций
      if (chart.options.plugins.annotation) {
        chart.options.plugins.annotation.annotations = [];
      }
      
      // Добавление аннотаций для горизонтальных линий
      chart.options.plugins.annotation.annotations.push(
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y',
          value: lowerBound,
          borderColor: 'red',
          borderWidth: 1,
          borderDash: [5],
          label: {
            enabled: true,
            content: 'e = ' + lowerBound
          }
        },
        {
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y',
          value: upperBound,
          borderColor: 'green',
          borderWidth: 1,
          borderDash: [5],
          label: {
            enabled: true,
            content: 'e = ' + upperBound
          }
        }
      );
      

    chart.update();
      } else {
    // Получение элемента canvas для отображения графика
    var canvas = document.getElementById('temperature-chart');
  
    // Создание графика с использованием Chart.js
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          label: 'Температура',
          data: temperatureData,
          borderColor: 'blue',
          fill: false
        }]
      },
      options: {
        // responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
      plugins: {
        annotation: {
          annotations: [
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y',
              value: document.getElementById('lower-bound').value,
              borderColor: 'red',
              borderWidth: 1,
              label: {
                enabled: true,
                content: 'Lower Bound'
              }
            },
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y',
              value: document.getElementById('upper-bound').value,
              borderColor: 'green',
              borderWidth: 1,
              label: {
                enabled: true,
                content: 'Upper Bound'
              }
            }
          ]
        }
      }
    });
}

  }