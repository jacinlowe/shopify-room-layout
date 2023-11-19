import { createGrid,scaleGrid,snapToGrid } from './grid.js';
import { calculateAnglesForClosedArea,linesToPolygon, formatLine } from './lines.js';
import { shadePolygon } from './polygon.js'

const container = document.getElementById('container');
const rootContainer = document.getElementById('rootContainer');
const svg = document.getElementById('lines');
const hoverInfoContainer = document.getElementById('hoverInfoContainer');
const summaryTable = document.getElementById('summaryTable');
const rows = document.querySelectorAll('#summaryTable tr');

const GRID_SPACING = 20
const POLYGON_FILL_COLOR = 'blue'; // Replace with the desired fill color
const DELETE_BUTTON_OFFSET = {x:60,y:-20}
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_INCREMENT = 0.1;

let currentScale = 1.0;
let selectedBox = null;
let offsetX, offsetY;

const boxes = [];
let lines = [];


rows.forEach(row => {

  row.addEventListener('click', () => {
    
    // Get current corner type text
    const cornerTypeCell = row.querySelector('td:last-child');
    const currentType = cornerTypeCell.textContent;

    // Create and show dropdown with current selected
    const select = document.createElement('select');
    select.value = currentType;

    const insideOption = document.createElement('option');
    insideOption.value = 'Inside';
    insideOption.text = 'Inside';

    const outsideOption = document.createElement('option');
    outsideOption.value = 'Outside';  
    outsideOption.text = 'Outside';

    select.append(insideOption, outsideOption);

    cornerTypeCell.textContent = ''; 
    cornerTypeCell.append(select);

    // Hide on change
    select.addEventListener('change', () => {
      cornerTypeCell.textContent = select.value;
      select.remove(); 
    });

  });

}); 

// Create N draggable boxes
const N = 5; // Change N to the desired number of boxes
let latestBoxId = N;

const boxSize = 50; // Adjust the box size as needed
for (let i = 1; i <= N; i++) {
    const box = document.createElement('div');
    box.className = 'drag-box';
    box.id = `box${i}`;
    box.style.width = boxSize + 'px'; // Set the width
    box.style.height = boxSize + 'px'; // Set the height
    box.textContent = `Box ${i}`;
    container.appendChild(box);
    boxes.push(box);
}



// Spread out the boxes evenly
spreadBoxes();

// Initialize lines between the boxes
initializeLines();

createGrid(20);


// Box Event Listeners
boxes.forEach(box => {
    box.addEventListener('mousedown', (e) => {
    selectedBox = box;
    const boxRect = selectedBox.getBoundingClientRect();
    // offsetX = e.clientX - (boxRect.left + boxRect.width / 2);
    // offsetY = e.clientY - (boxRect.top + boxRect.height / 2);
    offsetX = e.clientX - boxRect.left;
    offsetY = e.clientY - boxRect.top;
    selectedBox.style.cursor = 'grabbing';
    // to be able to  delete btn
    
    });
    box.addEventListener('mouseenter', () => showHoverInfo(box))
    box.addEventListener('mouseleave', () => delayHideHoverInfo())
    // box.addEventListener('mouseup', cancelLongPress);
});

//Document event listeners
document.addEventListener('mousemove', (e) => {
    // console.log(e.clientX,e.clientY)
    if (!selectedBox) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    selectedBox.style.left = x + 'px';
    selectedBox.style.top = y + 'px';
    snapToGrid(selectedBox, GRID_SPACING)

    // Redraw lines
    redrawLines();
    updateDeleteButtonPosition(selectedBox);
});

document.addEventListener('mouseup', () => {
    if (selectedBox) {
    selectedBox.style.cursor = 'grab';
    selectedBox = null;
    }
});

container.addEventListener('mousedown', (e)=>{
    console.log('container mouse down')
    if (e.target.classList.contains('drag-box')){
        selectedBox = e.target;
        const boxRect = selectedBox.getBoundingClientRect();
        offsetX = e.clientX - boxRect.left;
        offsetY = e.clientY - boxRect.top;
        selectedBox.style.cursor = 'grabbing';
        // handleLongP/ress(e.target)
    }
})
// rootContainer.addEventListener('wheel',() => console.log('scrolling'))

rootContainer.addEventListener('wheel', (e) => handleZoom(e));


// Event listeners for long-press and delete confirmation


// confirmDeleteButton.addEventListener('click', () => {
//     // Perform the deletion logic here
//     console.log(selectedBoxDelete)
//     if (selectedBoxDelete) {
//         // Remove the box from the 'boxes' list
//         const indexToRemove = boxes.indexOf(selectedBoxDelete);
//         if (indexToRemove !== -1) {
//         boxes.splice(indexToRemove, 1);
//         }
//         selectedBoxDelete.remove();
//       hideDeletePopup();
//     }
//   });
  
//   cancelDeleteButton.addEventListener('click', () => {
//     hideDeletePopup();
//   });


function handleZoom(event){
    event.preventDefault();

    //calculate the scale factor based on the scroll direction
    currentScale += event.deltaY * -0.01 * SCALE_INCREMENT;
    //Clamp the scale factor within the defined bounds
    currentScale = Math.min(MAX_SCALE,Math.max(MIN_SCALE,currentScale))
    console.log(currentScale)
    // Apply the scale transform to the container and its contents
    container.style.transform = `scale(${currentScale})`;
    // update the position of lines boxes,and polygons here.
    scaleGrid(GRID_SPACING,currentScale)
    redrawLines()
    // lines.forEach((line) =>{
    //   const originalLength = line.getAttribute('data-original-length');
    //   const scaledLength = originalLength * currentScale;
    //   line.setAttribute('x2',scaledLength)
    //   line.setAttribute('y2',scaledLength)
    // })
}

// Helper function to get the center coordinates of a box
function getBoxCenter(box) {
    const rect = box.getBoundingClientRect();
    return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    };
}

export function drawLines(){
    
    while (svg.firstChild){
        svg.removeChild(svg.firstChild);
    }
    
    lines =[]
    
    boxes.forEach((box, index, array) => {
        const nextBox = array[(index + 1) %array.length];
        const line = createLine(box,nextBox,index)
        lines.push(line);
        svg.appendChild(line);
        createTextOnLine(line,index+1)
    })

    // Add a click event listener to each line for adding a box between boxes
    lines.forEach((line) => {
        line.addEventListener('click', (e) => {
            const lineIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            console.log(lineIndex)
            const startBox = boxes[lineIndex];
            const endBoxIndex = (lineIndex + 1) % boxes.length
            const endBox = boxes[endBoxIndex]; // Wrap around for the last box
            // console.log(lineIndex)
            console.log(boxes,'startBox: ',startBox,'endBox: ',endBox)
            addBoxBetweenBoxes(startBox, endBox);
            createTextOnLine(line,lineIndex)
        });})
        // svg.appendChild(line);
    shadePolygon(lines.map((line) => formatLine(line)),POLYGON_FILL_COLOR)
    return false
    }

// Initialize lines between the boxes
function initializeLines() {
    drawLines()

}

// Redraw lines between the boxes
function redrawLines() {
    svg.innerHTML = '';
    drawLines()
        
    const anglesInsideClosedArea = calculateAnglesForClosedArea(lines);
    // console.log('Angles inside closed area:', anglesInsideClosedArea);

}

// Spread out the boxes evenly
function spreadBoxes() {
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const angleIncrement = (2 * Math.PI) / N;

    for (let i = 0; i < N; i++) {
    const angle = i * angleIncrement;
    const x = centerX + (container.offsetWidth / 4) * Math.cos(angle) - boxSize / 2;
    const y = centerY + (container.offsetHeight / 4) * Math.sin(angle) - boxSize / 2;

    boxes[i].style.left = x + 'px';
    boxes[i].style.top = y + 'px';
    }
}

function createLine(startBox, endBox,index){
    const startCenter = getBoxCenter(startBox);
    const endCenter = getBoxCenter(endBox);
    const originalLength = calculateLineLength(startCenter.x,startCenter.y, endCenter.x, endCenter.y);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startCenter.x + 'px');
    line.setAttribute('y1', startCenter.y + 'px');
    line.setAttribute('x2', endCenter.x + 'px');
    line.setAttribute('y2', endCenter.y + 'px');
    line.setAttribute('stroke', 'red'); // Set the stroke color to red
    line.setAttribute('data-original-length', originalLength); // Set the stroke color to red
    
    line.setAttribute('data-index', index)
    line.classList.add('clickable-line')
    return line
}

function createTextOnLine(line,lineIndex){
    
    // add text to the line
    const x1 = line.getAttribute('x1');
    const x2 = line.getAttribute('x2');
    const y1 = line.getAttribute('y1');
    const y2 = line.getAttribute('y2');
    const middleX = (parseFloat(x1) + parseFloat(x2)) / 2
    const middleY = (parseFloat(y1) + parseFloat(y2)) / 2

    // Offset values for text position (adjust as needed)
    const xOffset = 20; // Offset text horizontally
    const yOffset = -10; // Offset text vertically


    // create the text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x',middleX + xOffset);
    text.setAttribute('y',middleY + yOffset);
    text.setAttribute('text-anchor','start');
    text.setAttribute('dominant-baseline','middle');
    text.setAttribute('class', 'line-text')
    text.textContent = getLineLength(line);
    document.getElementById('lines').appendChild(text)
}

  // Function to add a box between two existing boxes connected by a line
function addBoxBetweenBoxes(startBox, endBox) {

    const endIndex = boxes.indexOf(endBox);
    if (endIndex === -1){
        console.error("End box not found in boxes array.");
        return
    }
    const box1Rect = startBox.getBoundingClientRect();
    const box2Rect = endBox.getBoundingClientRect();
  
    const x = (box1Rect.left + box2Rect.left) / 2;
    const y = (box1Rect.top + box2Rect.top) / 2;
  
    const newBox = document.createElement('div');
    newBox.className = 'drag-box';
    newBox.textContent = `New Box`;
    newBox.style.width = boxSize + 'px';
    newBox.style.height = boxSize + 'px';
    newBox.style.left = x - boxSize / 2 + 'px';
    newBox.style.top = y - boxSize / 2 + 'px';
    
    newBox.addEventListener('mouseenter', () => showHoverInfo(newBox))
    newBox.addEventListener('mouseleave', () => delayHideHoverInfo())

    startBox.parentElement.insertBefore(newBox,endBox.nextSibling)
    boxes.splice(endIndex,0,newBox)
    // update the box text
    updateBoxText()
    // Redraw lines to include the new box
    redrawLines();
  }

function updateBoxText(){
    // update the box text
    boxes.forEach((box,index) => {
        box.textContent = `Box: ${index+1}`
    })
      
}
// Function to calculate the length of a line segment
function calculateLineLength(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return length;
  }
  
  // Function to format length in feet and inches
  function formatLength(feet, inches) {
    return `${feet} ft ${inches} in`;
  }
  
function getLineLength(line){
    const x1 = parseFloat(line.getAttribute('x1'));
    const y1 = parseFloat(line.getAttribute('y1'));
    const x2 = parseFloat(line.getAttribute('x2'));
    const y2 = parseFloat(line.getAttribute('y2'));
    
    const lengthInPixels = calculateLineLength(x1, y1, x2, y2);
    
    // Convert length from pixels to feet and inches (adjust the conversion factor as needed)
    const pixelsToFeet = 1 / 10; // Adjust this factor to match your scale
    const lengthInFeet = lengthInPixels * pixelsToFeet;
    const lengthFeet = Math.floor(lengthInFeet);
    const lengthInches = Math.round((lengthInFeet - lengthFeet) * 12);
    
    // Display the length in a dialog or alert (you can customize this part)
    const formattedLength = formatLength(lengthFeet, lengthInches);
    return formattedLength
}


// Function to create and display the hover info near a box
function showHoverInfo(box) {
    const hoverInfo = document.createElement('div');
    hoverInfo.className = 'delete-button';
    hoverInfo.textContent = 'X';
  
    // Calculate the position of the hover info near the box
    const boxRect = box.getBoundingClientRect();
    const xOffset = DELETE_BUTTON_OFFSET.x; // Adjust the horizontal offset
    const yOffset = DELETE_BUTTON_OFFSET.y; // Adjust the vertical offset
  
    hoverInfo.style.left = boxRect.left + xOffset + 'px';
    hoverInfo.style.top = boxRect.top + yOffset + 'px';
    
    //Add the event listner to delete the box
    hoverInfo.addEventListener('click', () => handleDeleteBox(box))


    while (hoverInfoContainer.firstChild){
        hoverInfoContainer.removeChild(hoverInfoContainer.firstChild);
    }
    
    // Append the hover info to the container and fade it in
    hoverInfoContainer.appendChild(hoverInfo);
    hoverInfo.style.opacity = '0';
    hoverInfo.style.transition = 'opacity 0.3s ease-in-out';
    setTimeout(() => {
      hoverInfo.style.opacity = '1';
    }, 10); // Delay for smoother fade-in
  }
  

  function delayHideHoverInfo(){
    setTimeout(hideHoverInfo,500)
  }

  // Function to hide the hover info when leaving a box
  function hideHoverInfo() {
    const hoverInfo = document.querySelector('.delete-button');
    
    if (hoverInfo) {
      hoverInfo.style.opacity = '0';
      setTimeout(() => {
        hoverInfo.remove();
      }, 750); // Delay for smoother fade-out
    }
  }

  // Function to update the position of the delete button when a box is moved
function updateDeleteButtonPosition(box) {
    const deleteButton = box.querySelector('.delete-button');
    if (deleteButton) {
      const boxRect = box.getBoundingClientRect();
    //   deleteButton.style.left = boxRect.width - 10 + 'px'; // Adjust the horizontal position
      const xOffset = DELETE_BUTTON_OFFSET.x; // Adjust the horizontal offset
      const yOffset = DELETE_BUTTON_OFFSET.y; // Adjust the vertical offset
    
      deleteButton.style.left = boxRect.left + xOffset + 'px';
      deleteButton.style.top = boxRect.top + yOffset + 'px';
    }
  }

  function handleDeleteBox(box){
    deleteBox(box);
    updateBoxText();
    redrawLines();
  }

  function deleteBox(box) {
    const boxIndex = boxes.indexOf(box)
    if (boxIndex != -1){
        boxes.splice(boxIndex,1)
        box.remove()
    }
  }

function appendSummaryRow(wallNum, length) {

  const table = summaryTable

  const row = document.createElement('tr');

  const wallNumCell = document.createElement('td');
  wallNumCell.textContent = wallNum;

  const lengthCell = document.createElement('td');
  lengthCell.textContent = length; 

  const typeCell = document.createElement('td');
  typeCell.textContent = cornerType;

  row.appendChild(wallNumCell);
  row.appendChild(lengthCell);
  row.appendChild(typeCell);

  table.appendChild(row);

}