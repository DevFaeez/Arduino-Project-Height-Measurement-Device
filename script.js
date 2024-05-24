var inputData1;
var inputData1;
var inputData1;
var height;

var message = document.getElementById("message");
const date = new Date();

document.getElementById('connectButton').addEventListener('click', async function() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'HC-06' }],
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        });

        document.getElementById('statusOutput').textContent = 'Device selected, connecting...';

        const server = await device.gatt.connect();
        document.getElementById('statusOutput').textContent = 'Connected to GATT server';

        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        document.getElementById('statusOutput').textContent = 'Notifications started, waiting for data...';

    } catch (error) {
        console.log('Error: ' + error);
        document.getElementById('statusOutput').textContent = 'Connection failed: ' + error;
    }
});

function handleCharacteristicValueChanged(event) {
    const value = new TextDecoder().decode(event.target.value);
    height = value.height();
    document.getElementById('dataOutput').textContent = value.trim() + ' cm';
}


function renameInputForm() {
    inputData1 = window.prompt("Please enter first data:", "name");
    inputData2 = window.prompt("Please enter second data:", "class");
    inputData3 = window.prompt("Please enter third data:", "data3");

    var data1 = document.getElementById("details-0");
    data1.placeholder = inputData1;
    data1.name = inputData1;

    var data2 = document.getElementById("details-1");
    data2.placeholder  = inputData2;
    data2.name  = inputData2;

    var data3 = document.getElementById("details-2");
    data3.placeholder = inputData3;
    data3.name = inputData3;
}



function formSubmit() {
    document.getElementById("submit-button").addEventListener("click", function () {
        // Create customer data manually
        var customerData = {
            sheetLink: document.getElementById("sheet-link").value,
            date: new Date().toString(),
            inputData1: document.getElementById("details-0").value,
            inputData2: document.getElementById("details-1").value,
            inputData3: document.getElementById("details-2").value,
            height: "172cm"
        };
    
        // Construct formDataString
        var keyValuePairs = [];
        for (var key in customerData) {
            if (customerData.hasOwnProperty(key)) {
                keyValuePairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(customerData[key]));
            }
        }
        var formDataString = keyValuePairs.join("&");
        console.log(formDataString);
    
        // Send a POST request
        fetch("https://script.google.com/macros/s/AKfycbxMngpdevi3Ey8wXvy-n_yPIiqEdUycRov02n41pyWyJixSEG9Vg3Lcl3cB_gBCRSew/exec", {  // Replace with your deployed Apps Script URL
            method: "POST",
            body: formDataString,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                message.textContent = "Data submitted successfully!";
                message.style.display = "block";
                message.style.backgroundColor = "green";
                message.style.color = "beige";
            } else {
                throw new Error(data.message);
            }
            document.getElementById("submit-button").disabled = false;
            document.getElementById("form").reset();
            setTimeout(() => {
                message.textContent = "";
                message.style.display = "none";
            }, 2600);
        })
        .catch(error => {
            console.error(error);
            message.textContent = "An error occurred while submitting the form.";
            message.style.display = "block";
            message.style.backgroundColor = "red";
            message.style.color = "white";
            document.getElementById("submit-button").disabled = false;
        });
    });
    
    document.getElementById("new-sheet-button").addEventListener("click", function () {
        document.getElementById("form").reset();
    });
    
    
}





document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sheet-connection').addEventListener('click', function() {
        const sheetLink = document.getElementById('sheet-link').value;
        if (isValidGoogleSheetLink(sheetLink)) {
            document.getElementById("sheet-url").style.display = "none";
            renameInputForm();
            

            while (true) {
                document.getElementById("data-insertion").style.display = "block";
                formSubmit();
            }


        } else {
            alert('Invalid Google Sheet link');
        }
    });

    function isValidGoogleSheetLink(url) {
        const regex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+(\/.*)?$/;
        return regex.test(url);
    }
});

