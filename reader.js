
const { SerialPort, ReadlineParser } = require('serialport') 
 
var serialport = null
var parser = new ReadlineParser() 
var selectList = document.getElementById("selListPort") 
var appendedSelect = []

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if(err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }  
    if (ports.length === 0) { 
        //select options port
        appendedSelect.forEach(element => {
          selectList.remove(1)
        })
        appendedSelect = [];
    }else{  
      for(var i = 0; i < ports.length; i++) {
        var value = ports[i].path;
        var text = ports[i].friendlyName;
        var el = document.createElement("option")
        el.textContent = text
        el.value = value   
        // add new serial to select opction
        if (!appendedSelect.includes(value)) {
          selectList.appendChild(el) 
          appendedSelect.push(value)
        } 
      }
    }   
  })  
} 

// register on change port selected listener
document.getElementById("selListPort").addEventListener("change", onPortChange)

// start a coonnection on especific serial port
function initConnetion(port) {
    console.log("Coonnection init on port: "+port); 
    // Defining the serial port
    serialport = new SerialPort({ path: port, baudRate: 9600})
    parser = serialport.pipe(new ReadlineParser()) 
    serialport.on('open', () => { 
      console.log('Opened')  
      read()  
    })
    serialport.on('close', () => {   
      console.log('Closed')  
      document.getElementById('currentweight').textContent = "0 kg"
    })
} 

function onPortChange() { 
  if(this.value){  
    //when some port are selected on dropdownlist 
    initConnetion(this.value)
  }else{
    serialport.close() 
  }
}

// for reading from serial port data
function read(){
  parser.on('data', function(line){
    var peso = 0; 
    //extrait the weight comming from scale exemple of camming weight: +  0.220kg 91
    if(line.includes("+")){
      peso = line.split('+').pop().split('kg')[0];
      console.log('Peso: ' + peso) 
      document.getElementById('currentweight').textContent = peso+" kg"
    }  
  })
}

// for writing on serial port data
function write(){
  parser.on('data', function (data){
      parser.write('98000001\x0D\x0A');
    });
}
 

function listPorts() { 
  listSerialPorts()
  setTimeout(listPorts, 5000)
}

// Set a timeout that will check for new serialPorts every 5 seconds. 
setTimeout(listPorts, 2000)

listSerialPorts()
