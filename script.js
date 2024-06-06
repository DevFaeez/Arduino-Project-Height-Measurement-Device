var inputData1;
var inputData2;
var inputData3;
var height;

var message = document.getElementById("message");
const date = new Date();

document.getElementById('connectButton').addEventListener('click', async function() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'HC-06' }],
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        });

        document.getElementById('statusOutput').textContent = 'Selected device, connecting...';

        const server = await device.gatt.connect();
        document.getElementById('statusOutput').textContent = 'Connected to Bluetooth';

        document.getElementById("connect-bluetooth").style.display = "none";
        document.getElementById("sheet-url").style.display = "block";
        testConnectionBluetooth();

        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        // document.getElementById('statusOutput').textContent = 'Notifications started, waiting for data...';

    } catch (error) {
        console.log('Error: ' + error);
        document.getElementById('statusOutput').textContent = 'Connection failed: ' + error;
    }
});

function handleCharacteristicValueChanged(event) {
    try {
        const value = new TextDecoder().decode(event.target.value);
        height = value.trim();
        // document.getElementById('dataOutput').textContent = value.trim() + ' cm';
        document.getElementById('data-received').textContent = "Height: " + value.trim();
    } catch (error) {
        console.log('Error: ' + error);
        document.getElementById('statusOutput').textContent = 'Error processing data: ' + error;
    }
}

function renameInputForm() {
    try {
        inputData1 = window.prompt("Please enter first data:", "name");
        inputData2 = window.prompt("Please enter second data:", "class");
        inputData3 = window.prompt("Please enter third data:", "data3");

        var data1 = document.getElementById("details-0");
        data1.placeholder = inputData1;
        data1.name = inputData1;

        var data2 = document.getElementById("details-1");
        data2.placeholder = inputData2;
        data2.name = inputData2;

        var data3 = document.getElementById("details-2");
        data3.placeholder = inputData3;
        data3.name = inputData3;
    } catch (error) {
        console.log('Error: ' + error);
        document.getElementById('statusOutput').textContent = 'Error renaming form inputs: ' + error;
    }
}

function formSubmit() {
    // Ensure the form does not perform default submission
    document.getElementById("data-received").textContent = height;
    document.getElementById("form").addEventListener("submit", function(event) {
        event.preventDefault();
    });

    document.getElementById("submit-button").addEventListener("click", function () {
        try {
            var message = document.getElementById("message");
            message.style.display = "block";
            message.style.backgroundColor = "#979797";
            message.textContent = "Submitting...";

            // Create customer data manually
            var customerData = {
                sheetLink: document.getElementById("sheet-link").value,
                date: new Date().toString(),
                [inputData1]: document.getElementById("details-0").value,
                [inputData2]: document.getElementById("details-1").value,
                [inputData3]: document.getElementById("details-2").value,
                height: height
            };

            // Construct formDataString
            var keyValuePairs = [];
            for (var key in customerData) {
                if (customerData.hasOwnProperty(key)) {
                    keyValuePairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(customerData[key]));
                }
            }
            var formDataString = keyValuePairs.join("&");

            // Send a POST request
            fetch("https://script.google.com/macros/s/AKfycbxMngpdevi3Ey8wXvy-n_yPIiqEdUycRov02n41pyWyJixSEG9Vg3Lcl3cB_gBCRSew/exec", {  // Replace with your deployed Apps Script URL
                method: "POST",
                body: formDataString,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    message.textContent = "Data submitted successfully!";
                    message.style.backgroundColor = "green";
                    message.style.color = "beige";
                } else {
                    throw new Error(data.message || "Unknown error occurred.");
                }
                document.getElementById("form").reset();
                setTimeout(() => {
                    message.textContent = "";
                    message.style.display = "none";
                }, 2600);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                message.textContent = "An error occurred while submitting the form: " + error.message;
                message.style.backgroundColor = "red";
                message.style.color = "white";
            });
        } catch (error) {
            console.log('Error: ' + error);
            message.textContent = "An error occurred: " + error.message;
            message.style.backgroundColor = "red";
            message.style.color = "white";
        }
    });

    document.getElementById("new-sheet-button").addEventListener("click", function () {
        document.getElementById("form").reset();
    });
}

function testConnectionBluetooth() {
    document.getElementById('sheet-connection').addEventListener('click', function() {
        try {
            const sheetLink = document.getElementById('sheet-link').value;
            if (isValidGoogleSheetLink(sheetLink)) {
                document.getElementById("sheet-url").style.display = "none";
                renameInputForm();
                document.getElementById("data-insertion").style.display = "block";
                formSubmit();
            } else {
                alert('Invalid Google Sheet link');
            }
        } catch (error) {
            console.log('Error: ' + error);
            document.getElementById('statusOutput').textContent = 'Error connecting to sheet: ' + error;
        }
    });

    function isValidGoogleSheetLink(url) {
        const regex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+(\/.*)?$/;
        return regex.test(url);
    }
}

// Call testConnectionBluetooth after the DOM content is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     testConnectionBluetooth();
// });

