from flask import Flask, request, jsonify
from flask_cors import CORS
from random import randint
import datetime
import psycopg2
import threading
import time

app = Flask(__name__)
CORS(app)

current_temp = 0
current_time = 0
lower_treshold = 0 
upper_treshold = 0
is_heating = False


with open('config.txt', 'r') as file:
    data = file.read()
    lower_treshold = int(data.split(' ')[0])
    upper_treshold = int(data.split(' ')[1])
    
kitchen_lamp = False
living_room_lamp = False
bedroom_lamp = False

kitchen_illumination = 0
living_room_illumination = 0
bedroom_illumination = 0

@app.route('/lamp', methods=['POST', 'GET'])
def process_lamp():
    data = request.get_json()
    print(data)
    global kitchen_lamp, living_room_lamp, bedroom_lamp
    if "кухня" in data:
        if "Выключен" in data:
            kitchen_lamp = False
        else:
            kitchen_lamp = True
    elif "спальня" in data:
        if "Выключен" in data:
            bedroom_lamp = False
        else:
            bedroom_lamp = True
    elif "гостинная" in data:
        if "Выключен" in data:
            living_room_lamp = False
        else:
            living_room_lamp = True

    with open("outputRMP.txt", "a") as file:
        file.write(str(datetime.datetime.now()) + " ")
        file.write(data + "\n")
    return jsonify(data)

@app.route('/get_lamp_state', methods=['POST', 'GET'])
def get_lamp_state():
    data = request.json
    global kitchen_lamp, living_room_lamp, bedroom_lamp
    if "спальня" in data:
        return jsonify(bedroom_lamp)
    elif "кухня" in data:
        return jsonify(kitchen_lamp)
    elif "гостинная" in data:
        return jsonify(living_room_lamp)

@app.route('/setTresholds', methods=['POST'])
def set_treshholds():
    data = request.get_json()
    global lower_treshold, upper_treshold
    if '-1' not in data:
        lower_treshold = int(data.split(' ')[0])
        upper_treshold = int(data.split(' ')[1])
        with open('config.txt', 'w') as file:
            data = str(lower_treshold) + ' ' + str(upper_treshold) 
            file.write(data)
        add_tresholds_to_databse(lower_treshold, upper_treshold)
    return jsonify(str(lower_treshold) + ' ' + str(upper_treshold))

@app.route('/getTemperature', methods=['GET'])
def get_temperature():
    global current_temp, lower_treshold, upper_treshold, is_heating
    return jsonify(str(current_temp) + ' ' + str(is_heating) + ' ' + str(current_time))

def update_temperature():
    global current_temp, current_time, lower_treshold, upper_treshold, is_heating
    current_time = datetime.datetime.now().strftime("%H:%M:%S")
    current_temp = randint(1, 35)
    if current_temp < lower_treshold:
        is_heating = True
    elif current_temp > upper_treshold:
        is_heating = False
    add_temp_to_databse(str(current_time), current_temp)
    
@app.route('/illumination', methods=['POST', 'GET'])
def room_illumanation():
    data = request.get_json()
    global kitchen_illumination, bedroom_illumination, living_room_illumination
    with open("outputRMP.txt", "a") as file:
        file.write(str(datetime.datetime.now()) + " ")
        file.write('Степень освещенности в комнате ' + data.split(' ')[0] + ' изменилось на:' + data.split(' ')[1] + '%' + "\n")
        
    print('Степень освещенности в комнате ' + data.split(' ')[0] + ' изменилось на:' + data.split(' ')[1] + '%' )
    if "спальня" in data:
        bedroom_illumination = int(data.split(' ')[1])
        return jsonify(bedroom_illumination)
    elif "кухня" in data:
        kitchen_illumination = int(data.split(' ')[1])
        return jsonify(kitchen_illumination)
    elif "гостинная" in data:
        living_room_illumination = int(data.split(' ')[1])
        return jsonify(living_room_illumination)

def add_temp_to_databse(time, temp):
    connection = psycopg2.connect(
    host='127.0.0.1',
    port = 5432,
    user='postgres',
    password='admin',
    dbname='RMP'
)
    cursor = connection.cursor()
    insert_query = "INSERT INTO temperaturevalues (time, temperature) VALUES (%s, %s)"
    data = (time, temp)
    cursor.execute(insert_query, data)

    connection.commit()

    cursor.close()
    connection.close()   
     
def add_tresholds_to_databse(lower, upper):
    connection = psycopg2.connect(
    host='127.0.0.1',
    port = 5432,
    user='postgres',
    password='admin',
    dbname='RMP'
)
    cursor = connection.cursor()
    insert_query = "INSERT INTO heatingranges (lower_bound, upper_bound) VALUES (%s, %s)"
    data = (lower, upper)
    cursor.execute(insert_query, data)

    connection.commit()

    cursor.close()
    connection.close() 

def timer_function():
    while True:
        update_temperature()
        time.sleep(4)     
if __name__ == '__main__':
    thread = threading.Thread(target=timer_function)
    thread.start()
    app.run()