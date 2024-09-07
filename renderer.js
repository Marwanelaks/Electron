const XLSX = require("xlsx");

let jsonData = [];

window.onload = () => {
    document.getElementById("sendDataBtn").addEventListener("click", function() {
        const apiEndpoint = document.getElementById("api-endpoint").value;
        const apiToken = document.getElementById('apiToken').value; 

        if (!apiEndpoint) {
            alert("Please enter a valid API endpoint.");
            return;
        }
        
        jsonData.forEach((rowData, index) => {
            fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify(rowData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(`Row ${index + 1} sent successfully:`, data);
            })
            .catch(error => {
                console.error(`Error sending row ${index + 1}:`, error);
            });
        });
    });

    document.getElementById("file-upload").onchange = evt => {
        var reader = new FileReader();

        reader.addEventListener("loadend", evt => {
            var workbook = XLSX.read(evt.target.result, { type: "binary" });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var range = XLSX.utils.decode_range(worksheet["!ref"]);
            let headers = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
                let headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
                headers.push(headerCell ? headerCell.v : `Column ${col + 1}`);
            }
            jsonData = []; 
            for (let row = range.s.r + 1; row <= range.e.r; row++) {
                let rowData = {};
                for (let col = range.s.c; col <= range.e.c; col++) {
                    let cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
                    let cellValue = cell ? cell.v : "";
                    cellValue = parseJSONString(cellValue);

                    rowData[headers[col]] = cellValue;
                }
                jsonData.push(rowData);
            }

            console.log(jsonData);

            var table = document.getElementById("demoB");
            table.innerHTML = "";

            jsonData.forEach(rowData => {
                let r = table.insertRow();
                headers.forEach(header => {
                    let c = r.insertCell();
                    c.innerHTML = typeof rowData[header] === 'object' ? JSON.stringify(rowData[header]) : rowData[header];
                });
            });
            if (range.e.r > 0) {
                const suivbtn = document.getElementById("suivbtn");
                suivbtn.style.display = "block";
            }
        });

        reader.readAsArrayBuffer(evt.target.files[0]);
    };

    function parseJSONString(value) {
        try {
            // Check if the value is an array-like string (e.g., "[{id:5},{id:4}]")
            if (typeof value === "string" && value.trim().startsWith("[") && value.trim().endsWith("]")) {
                // Convert each object in the array
                return JSON.parse(value.replace(/(\w+)\s*:/g, '"$1":'));
            }

            // Check if the value is a JSON-like object string (e.g., "{id: 5}")
            if (typeof value === "string" && value.trim().startsWith("{") && value.trim().endsWith("}")) {
                return JSON.parse(value.replace(/(\w+)\s*:/g, '"$1":'));
            }
        } catch (e) {
            // If parsing fails, return the original value
            console.warn("Failed to parse value:", value);
        }
        return value;
    }
};

function ekUpload() {
    function Init() {
        console.log("Upload Initialised");

        var fileSelect = document.getElementById('file-upload'),
            fileDrag = document.getElementById('file-drag'),
            submitButton = document.getElementById('submit-button');

        fileSelect.addEventListener('change', fileSelectHandler, false);

        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            fileDrag.addEventListener('dragover', fileDragHover, false);
            fileDrag.addEventListener('dragleave', fileDragHover, false);
            fileDrag.addEventListener('drop', fileSelectHandler, false);
        }
    }

    function fileDragHover(e) {
        var fileDrag = document.getElementById('file-drag');

        e.stopPropagation();
        e.preventDefault();

        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    function fileSelectHandler(e) {
        var files = e.target.files || e.dataTransfer.files;
        fileDragHover(e);
        for (var i = 0, f; f = files[i]; i++) {
            parseFile(f);
            uploadFile(f);
        }
    }

    // Output
    function output(msg) {
        var m = document.getElementById('messages');
        m.innerHTML = msg;
    }

    function parseFile(file) {
        console.log(file.name);
        output('<strong>' + encodeURI(file.name) + '</strong>');

        var imageName = file.name;
        var isGood = (/\.(?=xlsx|xls)/gi).test(imageName);
        if (isGood) {
            document.getElementById('start').classList.add("hidden");
            document.getElementById('response').classList.remove("hidden");
            document.getElementById('notimage').classList.add("hidden");
            document.getElementById('file-image').classList.remove("hidden");

        } else {
            document.getElementById('file-image').classList.add("hidden");
            document.getElementById('notimage').classList.remove("hidden");
            document.getElementById('start').classList.remove("hidden");
            document.getElementById('response').classList.add("hidden");
            document.getElementById("file-upload-form").reset();
        }
    }
    if (window.File && window.FileList && window.FileReader) {
        Init();
    } else {
        document.getElementById('file-drag').style.display = 'none';
    }
}

ekUpload();
