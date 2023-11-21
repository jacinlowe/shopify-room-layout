import { Grid } from './grid.js';
import { Line, Lines, calculateArcAngles } from './lines.js';
import { shadePolygon } from './polygon.js'
import { SummaryTable } from './summaryBox.js';
import { Boxes,Box } from './boxes.js';

const container = document.getElementById('container');
const rootContainer = document.getElementById('rootContainer');
const svg = document.getElementById('lines');
const hoverInfoContainer = document.getElementById('hoverInfoContainer');
const angleIndicators = document.getElementById('angleIndicators');
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

const boxes = new Boxes(container);
let lines = new Lines();
const grid = new Grid(GRID_SPACING);


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
// const N = 5; // Change N to the desired number of boxes
// let latestBoxId = N;

const boxSize = 50; // Adjust the box size as needed
// for (let i = 1; i <= N; i++) {
//   const box = document.createElement('div');
//   box.className = 'drag-box';
//   box.id = `box${i}`;
//   box.style.width = boxSize + 'px'; // Set the width
//   box.style.height = boxSize + 'px'; // Set the height
//   box.textContent = `Box ${i}`;
//   container.appendChild(box);
//   boxes.push(box);
// }


function createBoxes(){
  const boxLimit = 5;
  const boxSize = 50; // Adjust the box size as needed
  for (let i = 1; i <= boxLimit; i++) {
    boxes.addBox(new Box(i,boxSize));
  }
}

// Create the initial Boxes
createBoxes();
// Spread out the boxes evenly
// spreadBoxes();
boxes.spreadBoxes();

// Initialize lines between the boxes
initializeLines();

grid.drawGrid();
const summaryTable = new SummaryTable('summaryTable')
summaryTable.initializeRows(lines.lines)


// Box Event Listeners
boxes.boxes.forEach(box => {
  const boxElem = box.getElement();
  boxElem.addEventListener('mousedown', (e) => {
    selectedBox = boxElem;
    const boxRect = selectedBox.getBoundingClientRect();
    // offsetX = e.clientX - (boxRect.left + boxRect.width / 2);
    // offsetY = e.clientY - (boxRect.top + boxRect.height / 2);
    offsetX = e.clientX - boxRect.left;
    offsetY = e.clientY - boxRect.top;
    selectedBox.style.cursor = 'grabbing';
    // to be able to  delete btn
    
    });
    // HOVER INFO for BOXES
    boxElem.addEventListener('mouseenter', () => showHoverInfo(box))
    boxElem.addEventListener('mouseleave', () => delayHideHoverInfo())
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
    grid.snapToGrid(selectedBox)

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

rootContainer.addEventListener('wheel', (e) =>  handleZoom(e));


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
    grid.scaleGrid(currentScale)
    redrawLines()
    // lines.forEach((line) =>{
    //   const originalLength = line.getAttribute('data-original-length');
    //   const scaledLength = originalLength * currentScale;
    //   line.setAttribute('x2',scaledLength)
    //   line.setAttribute('y2',scaledLength)
    // })
}


export function drawLines(){
    
    while (svg.firstChild){
        svg.removeChild(svg.firstChild);
    }
    
    lines.clearLines()
    const boxList = boxes.boxes;
    boxList.forEach((box, index, array) => {
        const nextBox = array[(index + 1) %array.length];
        // const line = createLine(box,nextBox,index)
        const line = Line
        .createLineFromBoxes(box.element,nextBox.element)
        .createLine()
        .setIndex(index)

        lines.addLine(line);
        svg.appendChild(line.line);
        createTextOnLine(line,index+1)
    })

    // Add a click event listener to each line for adding a box between boxes
    lines.lines.forEach((line) => {
        line.line.addEventListener('click', (e) => {
            const lineIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            console.log(lineIndex)
            const startBox = boxList[lineIndex];
            const endBoxIndex = (lineIndex + 1) % boxList.length
            const endBox = boxList[endBoxIndex]; // Wrap around for the last box
            // console.log(lineIndex)
            console.log(boxList,'startBox: ',startBox,'endBox: ',endBox)
            addBoxBetweenBoxes(startBox, endBox);
            createTextOnLine(line,lineIndex)
        });})
        // svg.appendChild(line);
    drawAngles(lines.lines)
    shadePolygon(lines.lines,POLYGON_FILL_COLOR)
    return false
    }



/**
 * 
 * @param {[Line]} lines 
 */
function drawAngles(lines){
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const angleArray = [];

  // boxes.boxes.forEach((box,index,boxArray) => {
  //   const nextBox = boxArray[(index + 1) %boxArray.length];
  //   const thirdBox = boxArray[(index + 2) %boxArray.length];
  //   drawArcBetweenPoints(ctx,box,nextBox,thirdBox)
  // })

  lines.forEach((line,index,lineArray) => {
    const nextLine = lineArray[(index + 1) %lineArray.length];
    
    // const angle = line.calculateAngle(nextLine);
    const centerX = nextLine.x2;
    const centerY = nextLine.y2;
    const {startAngle,endAngle} = calculateArcAngles(centerX,centerY,line,nextLine)
    angleArray.push({startAngle,endAngle});

    drawArc(ctx,centerX,centerY,startAngle,endAngle)
  })
  
  // console.log(`angle between lines: ${angleArray} degrees`);
  // console.table(angleArray);

  const line1 = lines[0];
  const line2 = lines[1];
  const line3 = lines[2];
  // const angle = calculateInteriorAngle(line1,line2,line3)
  
  // // draw angle arc
  // const radius = 50
  // const centerX = line1.x2;
  // const centerY = line1.y2;

  // ctx.beginPath();

  // ctx.arc(centerX,centerY,radius,Math.PI, endAngle)
  // ctx.strokeStyle = 'red';
  // ctx.stroke();
}

function drawArcBetweenPoints(ctx,box1,box2,box3,radius=60){
  const box1Pos = box1.getPosition();
  const box2Pos = box2.getPosition();
  const box3Pos = box3.getPosition();
  ctx.beginPath();
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 5;
  ctx.arcTo(box1Pos.x,box1Pos.y,box2Pos.x,box2Pos.y,radius);
  ctx.arcTo(box2Pos.x,box2Pos.y,box3Pos.x,box3Pos.y,radius);
  ctx.stroke();
}

function drawArc(ctx,x,y,startAngle,endAngle,radius=40){
  // draw angle arc
  const centerX = x;
  const centerY = y;

  ctx.beginPath();
  ctx.arc(centerX,centerY,radius, startAngle, endAngle)
  ctx.strokeStyle = 'red';
  ctx.stroke();
}

// Initialize lines between the boxes
function initializeLines() {
    drawLines()
}

// Redraw lines between the boxes
function redrawLines() {
    svg.innerHTML = '';
    drawLines()
    summaryTable.refreshRows(lines.lines)

        
    // const anglesInsideClosedArea = calculateAnglesForClosedArea(lines.lines);
    // console.log('Angles inside closed area:', anglesInsideClosedArea);


}

// // Spread out the boxes evenly
// function spreadBoxes() {
//     const centerX = container.offsetWidth / 2;
//     const centerY = container.offsetHeight / 2;
//     const angleIncrement = (2 * Math.PI) / N;

//     for (let i = 0; i < N; i++) {
//     const angle = i * angleIncrement;
//     const x = centerX + (container.offsetWidth / 4) * Math.cos(angle) - boxSize / 2;
//     const y = centerY + (container.offsetHeight / 4) * Math.sin(angle) - boxSize / 2;

//     boxes[i].style.left = x + 'px';
//     boxes[i].style.top = y + 'px';
//     }
// }


/**
 * 
 * @param {Line} line 
 * @param {Number} lineIndex 
 */
function createTextOnLine(line,lineIndex){
    
    // add text to the line
    // const x1 = line.getAttribute('x1');
    // const x2 = line.getAttribute('x2');
    // const y1 = line.getAttribute('y1');
    // const y2 = line.getAttribute('y2');
    
    const middleX = (parseFloat(line.x1) + parseFloat(line.x2)) / 2
    const middleY = (parseFloat(line.y1) + parseFloat(line.y2)) / 2

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
    text.textContent = line.getLineText();
    // added wall num
    text.textContent += ` Wall: ${lineIndex}`
    document.getElementById('lines').appendChild(text)
}

  // Function to add a box between two existing boxes connected by a line
function addBoxBetweenBoxes(startBox, endBox) {

    const endIndex = boxes.boxes.indexOf(endBox);
    if (endIndex === -1){
        console.error("End box not found in boxes array.");
        return
    }
    const box1Rect = startBox.element.getBoundingClientRect();
    const box2Rect = endBox.element.getBoundingClientRect();
  
    const x = (box1Rect.left + box2Rect.left) / 2;
    const y = (box1Rect.top + box2Rect.top) / 2;
  
    const newBox = new Box(endIndex-1);
    newBox.positionBox(x,y);
    newBox.element.addEventListener('mouseenter', () => showHoverInfo(newBox))
    newBox.element.addEventListener('mouseleave', () => delayHideHoverInfo())

    startBox.element.parentElement.insertBefore(newBox.element,endBox.element.nextSibling)
    boxes.boxes.splice(endIndex,0,newBox)
    // update the box text
    boxes.updateBoxText()
    // Redraw lines to include the new box
    redrawLines();
    summaryTable.refreshRows(lines.lines)
    
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


// Function to create and display the hover info near a box
function showHoverInfo(box) {
    const hoverInfo = document.createElement('div');
    hoverInfo.className = 'delete-button';
    hoverInfo.textContent = 'X';
  
    // Calculate the position of the hover info near the box
    const boxRect = box.getElement().getBoundingClientRect();
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
    hoverInfo.classList.add('transition')
    // hoverInfo.style.transition = 'opacity 0.3s ease-in-out';
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
function updateDeleteButtonPosition(boxElement) {
    const deleteButton = boxElement.querySelector('.delete-button');
    if (deleteButton) {
      const transition = deleteButton.style.transition;
      deleteButton.style.opacity = '0';
      deleteButton.style.transition = 'none';
      const boxRect = boxElement.getBoundingClientRect();
    //   deleteButton.style.left = boxRect.width - 10 + 'px'; // Adjust the horizontal position
      const xOffset = DELETE_BUTTON_OFFSET.x; // Adjust the horizontal offset
      const yOffset = DELETE_BUTTON_OFFSET.y; // Adjust the vertical offset
    
      deleteButton.style.left = boxRect.left + xOffset + 'px';
      deleteButton.style.top = boxRect.top + yOffset + 'px';
      deleteButton.style.opacity = '1';
      deleteButton.style.transition = transition;
    }
  }

  function handleDeleteBox(box){
    boxes.removeBox(box);
    boxes.updateBoxText();
    redrawLines();
    summaryTable.refreshRows(lines.lines)
  }




