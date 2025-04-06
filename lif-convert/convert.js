document.addEventListener("DOMContentLoaded", function () {
    var lifInput = document.getElementById("lifInput");
    var convertButton = document.getElementById("convertButton");
    var output = document.getElementById("output");
    convertButton.onclick = function () {
        var lifText = lifInput.value;
        var eventData = Papa.parse(lifText);
        console.log(eventData);
        console.log(convertToEvent(eventData));

        var table = generateTable(convertToEvent(eventData));
        output.innerHTML = "";
        output.appendChild(table);
    };

    clear.onclick = function () {
        lifInput.value = "";
        output.innerHTML = "";
    };
});
  
function convertToEvent(eventData) {
    if (eventData.errors.length > 0) {
        console.error("Error parsing LIF data:", eventData.errors);
        return;
    }

    var event = getEventDetails(eventData);
    event.results = getResults(eventData);
    return event;
};

function getEventDetails(eventData) {
    var event = {
        name: eventData.data[0][3]
    };

    if (eventData.data[0][4]) {
        event.windStrength = eventData.data[0][4];
    }
    if (eventData.data[0][5]) {
        event.windDirection = eventData.data[0][5];
    }

    return event;
};

function getResults(eventData) {
    var results = [];
    eventData.data.forEach((element, index) => {
        if (index == 0) return;

        var result = {
            position: element[0],
            participantNumber: element[1],
            surname: element[3],
            forename: element[4],
            club: element[5],
            time: element[6]
        };

        results.push(result);
    });
    return results;
};

function headerCell(text, colspan) {
    var cell = document.createElement("th");
    cell.textContent = text;
    cell.colSpan = colspan || 1;
    return cell;
}

function generateTable(event) {
    var table = document.createElement("table");
    var headerRow = document.createElement("tr");

    var eventRow = document.createElement("tr");
    eventRow.appendChild(headerCell(event.name, 3));
    if (event.windDirection) eventRow.appendChild(headerCell(event.windDirection));
    if (event.windStrength) eventRow.appendChild(headerCell(event.windStrength));
    table.appendChild(eventRow);

    var headers = ["Position", "Participant Number", "Surname", "Forename", "Club", "Time"];
    headers.forEach(headerText => {
        headerRow.appendChild(headerCell(headerText));
    });
    table.appendChild(headerRow);

    event.results.forEach(result => {
        var row = document.createElement("tr");
        Object.values(result).forEach(text => {
            var cell = document.createElement("td");
            cell.textContent = text;
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    return table;
};

function copyTableAsHTML() {
    const table = document.getElementsByTagName("table")[0];
    const html = table.outerHTML;

    // Use Clipboard API to write HTML
    navigator.clipboard.write([
        new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([table.innerText], { type: "text/plain" })
        })
    ]).then(() => {
        alert("Table copied with formatting!");
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
};
