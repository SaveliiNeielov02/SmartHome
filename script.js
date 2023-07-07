
function toggleLight(roomNumber)
 {
  var roomName;
  switch (roomNumber) {
    case 1:
      roomName = 'кухня';
      break;
    case 2:
      roomName = 'гостинная';
      break;
    case 3:
      roomName = 'спальня';
      break;
  }
  var roomLamp = document.getElementById('light-status-' + roomNumber);
      if (roomLamp.innerHTML == 'Выключен')
      {
        sendDataToServer("Освещение в комнате " + roomName + " " + 'Включен', '/lamp')
      } 
      else 
      {
        sendDataToServer("Освещение в комнате " + roomName + " " + 'Выключен', '/lamp')
      }
}
  
  function updateSliderValue(slider, roomNumber) {
    var url = 'http://127.0.0.1:5000/illumination';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var sliderValue = document.getElementById('brightness-' + roomNumber);
                var response = JSON.parse(xhr.responseText);
                sliderValue.value = response;
                var sliderSpan = document.getElementById('slider-span-' + roomNumber);
                sliderSpan.textContent = response;
                console.log('Slider value updated!');
            } else {
                console.error('Ошибка при отправке запроса: ' + xhr.status);
            }
        }
    };
    var roomName;
    switch (roomNumber) {
      case 1:
        roomName = 'кухня';
        break;
      case 2:
        roomName = 'гостинная';
        break;
      case 3:
        roomName = 'спальня';
        break;
    }
    xhr.send(JSON.stringify(roomName + ' ' + slider.value));
  }

  var rooms = ['kitchen','livingroom', 'bedroom',];

function updateTemperatures() {
  rooms.forEach(function(room) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:5000/getTemperature', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var roomTemp = document.getElementById('temperature-' + room);
        var response = xhr.responseText;
        roomTemp.innerHTML = response;
      } else {
        console.error('Произошла ошибка. Статус:', xhr.status);
      }
    };
    xhr.onerror = function() {
      console.error('Произошла ошибка при отправке запроса для комнаты ' + room);
    };
    xhr.send();
  });
}

setInterval(updateTemperatures, 2000);

  function sendDataToServer(data, api) {
    var url = 'http://127.0.0.1:5000' + api;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log('OK!');
            } else {
                console.error('Ошибка при отправке запроса: ' + xhr.status);
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

var rusRooms = ['кухня','гостинная', 'спальня',];
function updateLampStates()
{
  rusRooms.forEach(function(room) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/get_lamp_state', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var roomNumber;
        var response = JSON.parse(xhr.responseText);
        switch (room) {
          case 'кухня':
            roomNumber = 1;
            break;
          case 'гостинная':
            roomNumber = 2;
            break;
          case 'спальня':
            roomNumber = 3;
            break;
        }
      var roomLamp = document.getElementById('light-status-' + roomNumber);
      if (response == true)
      {
        roomLamp.innerHTML = 'Включен';
        roomLamp.style.color = 'green';
      } 
      else 
      {
        roomLamp.innerHTML = 'Выключен';
        roomLamp.style.color = 'red';
      }
      } else {
        console.error('Произошла ошибка про обновления состояние лампочек. Статус:', xhr.status);
      }
    };
    xhr.onerror = function() {
      console.error('Произошла ошибка при отправке запроса для комнаты ' + room);
    };
    xhr.send(JSON.stringify(room));
  });
}
setInterval(updateLampStates, 1000);

