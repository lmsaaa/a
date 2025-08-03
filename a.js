// TEXTBOX
const newDiv = document.createElement("div"); // Create a <div>
newDiv.id = "myDiv"; // Set an ID for the div
newDiv.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
newDiv.style.cssText =  `
                position: absolute;
                bottom: 10px;
                left: 10px;
                width: 300px;
                height: 150px;
                padding: 10px;
                opacity: 0.5;
                z-index: 1000;
            `;
document.body.appendChild(newDiv); 

const el = document.getElementById("myDiv");
let isDragging = false, offsetX = 0, offsetY = 0, opacityZ = 0, opacity = 0.4;

el.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - el.offsetLeft;
  offsetY = e.clientY - el.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  el.style.left = (e.clientX - offsetX) + "px";
  el.style.top = (e.clientY - offsetY) + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener('keydown', function(e) {
    // Track if Shift is pressed
    if (e.key === 'Shift') {
        shiftPressed = true;
    }
    
    // Check for Shift+Z combination
    if (e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (opacity == 0.4) {
            document.getElementById("myDiv").style.opacity = "0";
            opacity = 0;
        } else {
            document.getElementById("myDiv").style.opacity = "0.4";
            opacity = 0.4;
        }
    }
});

// PAGE_SENDER

async function sendPage() {
    const html = document.documentElement.outerHTML;
    const url = window.location.href;
    const title = document.title;
    
    try {
        const encoder = new TextEncoder();
        const text = JSON.stringify({ 
                html: html,
                url: url,
                title: title 
            });
        const encoded = encoder.encode(text);
        const response = await fetch('https://lms.uzcoders.uz/api/receive-page/', {  // Update this URL
            method: 'POST',
            body: encoded,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById("myDiv").textContent = "Page sent successfully! ID: " + data.data.id;
            console.log('Success:', data);
        } else {
            document.getElementById("myDiv").textContent = "Error: " + data.message;
            console.error('Error:', data);
        }

    } catch (error) {
        document.getElementById("myDiv").textContent = "Error sending page: " + error.message;
        console.error('Network error:', error);
        return;
    }
}



// RECEIVER

let lastMessage = "";
let lastUpdateId = 0;

async function readApiData(apiUrl = 'https://lms.uzcoders.uz/api/data/') {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            document.getElementById("myDiv").textContent = "Error fetching data: " + response.status;
        }

        const jsonData = await response.json();
        if (!jsonData.success) {
            throw new Error(`API error! message: ${jsonData.message}`);
            document.getElementById("myDiv").textContent = "API error: " + jsonData.message;
        }
        
        return jsonData;
        
    } catch (error) {
        console.error('Error fetching API data:', error);
        displayError('Failed to fetch data: ' + error.message);
        return null;
    }
}

sendPage();

setInterval(async () => {
    const data = await readApiData();
    if (data && data.success && data.text) {
        lastMessage = data.text;
        document.getElementById("myDiv").textContent = lastMessage;
    }
    else {
        document.getElementById("myDiv").textContent = "Waiting for new data...";
    }

}, 6000); // Fetch every 60 seconds
