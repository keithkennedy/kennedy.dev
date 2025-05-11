function addResults() {
    let lifInput = document.getElementById("lifInput");
    let lifText = lifInput.value;
    let eventData = Papa.parse(lifText);
    let options = {
        displayMedals: document.getElementById('displayMedals').checked,
    }
    let event = convertToEvent(eventData);
    let table = generateTable(event, options);
    let output = document.getElementById("output");
    output.innerHTML = "";
    output.appendChild(table);
}

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

    let event = getEventDetails(eventData);
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
    let results = [];
    eventData.data.forEach((element, index) => {
        if (index === 0) return;

        let result = {
            position: element[0],
            participantNumber: element[1],
            surname: element[3],
            forename: element[4],
            club: element[5],
            time: element[6],
            ageGroup: element[14]
        };

        results.push(result);
    });

    // 1. Group by ageGroup
    const grouped = results.reduce((acc, obj) => {
        (acc[obj.ageGroup] = acc[obj.ageGroup] || []).push(obj);
        return acc;
    }, {});

    // 2. Sort each group and take 3
    const topThreePerGroup = Object.fromEntries(
        Object.entries(grouped).map(([group, entries]) => [
            group,
            function() {
                const topThree = entries.filter(a => a.time !== "").sort((a, b) => a.time - b.time).slice(0, 3)
                topThree.forEach((element, index) => {
                    if (index === 0) {
                        element.medal = "🥇";
                    }
                    if (index === 1) {
                        element.medal = "🥈";
                    }
                    if (index === 2) {
                        element.medal = "🥉";
                    }
                });
                return topThree;
            }()
        ])
    );
    console.log(topThreePerGroup);

    return results;
}

function headerCell(text, colspan) {
    let cell = document.createElement("th");
    cell.textContent = text;
    cell.colSpan = colspan || 1;
    cell.style.textAlign = "left";
    return cell;
}

function tableCell(text, align) {
    let cell = document.createElement("td");
    cell.textContent = text;
    if (align) cell.style.textAlign = align;
    return cell;
}

function generateTable(event, options) {
    let table = document.createElement("table");
    table.classList.add("table");

    let thead = document.createElement("thead");
    let eventRow = document.createElement("tr");
    
    if (event.windStrength && event.windDirection) {
        eventRow.appendChild(headerCell(event.name, 3));
        eventRow.appendChild(headerCell("Wind: " + event.windStrength + " " + event.windDirection, 4));
    } else {
        eventRow.appendChild(headerCell(event.name, 7));
    }

    thead.appendChild(eventRow);

    let headerRow = document.createElement("tr");
    let headers = ["Pos", "Num", "Forename(s)", "Surname", "Club", "Time", "Age Group"];
    headers.forEach(headerText => {
        headerRow.appendChild(headerCell(headerText));
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    let tbody = document.createElement("tbody");

    event.results.forEach(result => {
        if (!result.position) return;
        let row = document.createElement("tr");

        let pos;
        if (options.displayMedals && result.medal) {
            pos = result.medal + " " + result.position;
        } else {
            pos = result.position;
        }
        row.appendChild(tableCell(pos, "right"));
        row.appendChild(tableCell(result.participantNumber));
        row.appendChild(tableCell(result.forename));
        row.appendChild(tableCell(result.surname));
        row.appendChild(tableCell(result.club));
        row.appendChild(tableCell(result.time, "right"));
        row.appendChild(tableCell(result.ageGroup));
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    return table;
}

function copyTable() {
    let table = document.getElementsByTagName("table")[0];
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

function getColumnData(colIndex) {
    const table = document.getElementsByTagName("table")[0];
    let columnData = [];
    for (let row of table.rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length > colIndex) {
            columnData.push(cells[colIndex].innerText.trim());
        }
    }
    return columnData
}

function copyNums() {
    copyColumnToClipboard(1, "copyNums")
}

function copyTimes() {
    copyColumnToClipboard(5, "copyTimes")
}

function copyYdlFormattedLongTimes() {
    // a time can be formatted as 2:23.45
    // YDL file requires this as 2.2345
    let data = getColumnData(5);
    let ydlFormattedTimes = data.map(data => {
        return data.replace(".", "").replace(":", ".");
    });
    const textToCopy = ydlFormattedTimes.join("\n");
    navigator.clipboard.writeText(textToCopy)
        .then(() => showCopied(document.getElementById("copyTimesYdl")))
        .catch(err => console.error("Copy failed: ", err));
}

function copyColumnToClipboard(colIndex, buttonId) {
    const table = document.getElementsByTagName("table")[0];
    if (!table) return;

    let columnData = getColumnData(colIndex);
    const textToCopy = columnData.join("\n");

    navigator.clipboard.writeText(textToCopy)
        .then(() => showCopied(document.getElementById(buttonId)))
        .catch(err => console.error("Copy failed: ", err));

    return columnData;
}

function showCopied(copyButton) {
    if (!copyButton) {
        return;
    }

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