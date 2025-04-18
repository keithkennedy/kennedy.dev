document.addEventListener("DOMContentLoaded", function () {
    var lifInput = document.getElementById("lifInput");
    var convertButton = document.getElementById("convertButton");
    var output = document.getElementById("output");
    convertButton.onclick = function () {
        var lifText = lifInput.value;
        var eventData = Papa.parse(lifText);

        var table = generateTable(convertToEvent(eventData));
        output.innerHTML = "";
        output.appendChild(table);
    };
});

function reset() {
    let lifInput = document.getElementById("lifInput");
    let output = document.getElementById("output");
    lifInput.value = "";
    output.innerHTML = "";
}
  
function convertToEvent(eventData) {
    if (eventData.errors.length > 0) {
        console.error("Error parsing LIF data:", eventData.errors);
        return;
    }

    var event = getEventDetails(eventData);
    event.results = getResults(eventData);
    return event;
}

function getEventDetails(eventData) {
    let event = {
        name: eventData.data[0][3]
    };

    if (eventData.data[0][4]) {
        event.windStrength = eventData.data[0][4];
    }
    if (eventData.data[0][5]) {
        event.windDirection = eventData.data[0][5];
    }

    return event;
}

function getResults(eventData) {
    var results = [];
    eventData.data.forEach((element, index) => {
        if (index === 0) return;

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
}

function headerCell(text, colspan) {
    const cell = document.createElement("th");
    cell.textContent = text;
    cell.colSpan = colspan || 1;
    cell.style.textAlign = "left";
    return cell;
}

function tableCell(text, align) {
    var cell = document.createElement("td");
    cell.textContent = text;
    if (align) cell.style.textAlign = align;
    return cell;
}

function generateTable(event) {
    var table = document.createElement("table");
    table.classList.add("table");

    var thead = document.createElement("thead");
    var eventRow = document.createElement("tr");
    
    if (event.windStrength && event.windDirection) {
        eventRow.appendChild(headerCell(event.name, 3));
        eventRow.appendChild(headerCell(event.windStrength + " " + event.windDirection, 3));
    } else {
        eventRow.appendChild(headerCell(event.name, 6));
    }

    thead.appendChild(eventRow);

    var headerRow = document.createElement("tr");
    var headers = ["Pos", "Num", "Forename(s)", "Surname", "Club", "Time"];
    headers.forEach(headerText => {
        headerRow.appendChild(headerCell(headerText));
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    var tbody = document.createElement("tbody");

    event.results.forEach(result => {
        if (!result.position) return;
        var row = document.createElement("tr");
        row.appendChild(tableCell(result.position, "right"));
        row.appendChild(tableCell(result.participantNumber));
        row.appendChild(tableCell(result.forename));
        row.appendChild(tableCell(result.surname));
        row.appendChild(tableCell(result.club));
        row.appendChild(tableCell(result.time, "right"));
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    return table;
}

function copyTable() {
    const table = document.getElementsByTagName("table")[0];
    if (!table) return;

    const html = table.outerHTML;

    if (html.trim() === "") {
        return;
    }

    // Use Clipboard API to write HTML
    navigator.clipboard.write([
        new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([table.innerText], { type: "text/plain" })
        })
    ]).then(() => {
        showCopied(document.getElementById("copy"));
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
}

function copyNums() {
    copyColumnToClipboard(1, "copyNums")
}

function copyTimes() {
    copyColumnToClipboard(5, "copyTimes")
}

function copyColumnToClipboard(colIndex, buttonId) {
    const table = document.getElementsByTagName("table")[0];
    if (!table) return;

    let columnData = [];

    for (let row of table.rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length > colIndex) {
            columnData.push(cells[colIndex].innerText.trim());
        }
    }

    const textToCopy = columnData.join("\n");

    navigator.clipboard.writeText(textToCopy)
        .then(() => showCopied(document.getElementById(buttonId)))
        .catch(err => console.error("Copy failed: ", err));
}

function showCopied(copyButton) {
    let ori = copyButton.innerHTML;
    let i = copyButton.querySelectorAll("i")[0];
    i.classList.remove("fa-copy");
    i.classList.add("fa-circle-check");
    let textSpan = copyButton.querySelectorAll("span")[1];
    textSpan.innerHTML = "Copied";
    copyButton.setAttribute("disabled", "disabled");
    setTimeout(() => {
        copyButton.innerHTML = ori;
        copyButton.removeAttribute("disabled");
    }, 2000);
}