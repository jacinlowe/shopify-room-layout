import { Grid,Slider } from './grid.js';
import { Line, Lines, calculateArcAngles } from './lines.js';
import { shadePolygon } from './polygon.js'
import { SummaryTable } from './summaryBox.js';
import { Boxes,Box } from './boxes.js';

const container = document.getElementById('container');
const rootContainer = document.getElementById('rootContainer');
const svg = document.getElementById('lines');
const hoverInfoContainer = document.getElementById('hoverInfoContainer');
const angleIndicators = document.getElementById('angleIndicators');
const body = document.getElementById('body')
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
let lines = new Lines(svg);
const grid = new Grid(GRID_SPACING,currentScale);
const scaleSlider = new Slider(grid.currentScale ?? 1);

// rows.forEach(row => {
  
//   row.addEventListener('click', () => {
    
//     // Get current corner type text
//     const cornerTypeCell = row.querySelector('td:last-child');
//     const currentType = cornerTypeCell.textContent;
    
//     // Create and show dropdown with current selected
//     const select = document.createElement('select');
//     select.value = currentType;
    
//     const insideOption = document.createElement('option');
//     insideOption.value = 'Inside';
//     insideOption.text = 'Inside';
    
//     const outsideOption = document.createElement('option');
//     outsideOption.value = 'Outside';  
//     outsideOption.text = 'Outside';
    
//     select.append(insideOption, outsideOption);
    
//     cornerTypeCell.textContent = ''; 
//     cornerTypeCell.append(select);
    
//     // Hide on change
//     select.addEventListener('change', () => {
//       cornerTypeCell.textContent = select.value;
//       select.remove(); 
//     });
    
//   });
  
// }); 

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
    box.hoverInfo.addCallback('click','deleteBtn',() => handleDeleteBox(box))
});


// MOVE SELECTED BOX
//Document event listeners
document.addEventListener('mousemove', (e) => {

  if (!boxes.selectedBox) return 
  if (!boxes.boxOffset) return;
    moveBox(boxes,grid,e)
    // Redraw lines
    redrawLines();
    
});

/**
 * 
 * @param {Boxes} boxes 
 * @param {Grid} grid 
 * @param {MouseEvent} e 
 * @returns 
 */
function moveBox(boxes, grid, e) {
  
  const selectedBox = boxes.selectedBox.getElement();
  const { offsetX, offsetY } = boxes.boxOffset;
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  
  selectedBox.style.left = x + 'px';
  selectedBox.style.top = y + 'px';
  if(!e.ctrlKey){
    grid.snapToGrid(selectedBox)
  }

}

document.addEventListener('mouseup', () => {
  const selectedBox = boxes.selectedBox;
  if (selectedBox) {
    selectedBox.getElement().style.cursor = 'grab';
    boxes.unselectBox();
    selectedBox.hoverInfo.setHoverInfoEvents();
    }
});


document.addEventListener('resize',handleWindowResize)

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
scaleSlider.zoomInCallback(zoomIn)
scaleSlider.zoomOutCallback(zoomOut)

//TODO: NEED TO COLLAPSE THIS INTO A SIMPLER IMPLEMENTATION
function zoomOut(event){
  if (currentScale <= MIN_SCALE) return;
  event.preventDefault();

  //calculate the scale factor based on the scroll direction
  currentScale += -SCALE_INCREMENT;
  //Clamp the scale factor within the defined bounds
  currentScale = Math.min(MAX_SCALE,Math.max(MIN_SCALE,currentScale))
  console.log(currentScale)

  // Apply the scale transform to the container and its contents
  container.style.transform = `scale(${currentScale})`;
  
  // update the position of lines boxes,and polygons here.
  grid.scaleGrid(currentScale)
  
  redrawLines()
  scaleSlider.updateScale(currentScale)
}

function zoomIn(event){
  if (currentScale >= MAX_SCALE) return;
  //calculate the scale factor based on the scroll direction
  currentScale += SCALE_INCREMENT;
  //Clamp the scale factor within the defined bounds
  currentScale = Math.min(MAX_SCALE,Math.max(MIN_SCALE,currentScale))
  console.log(currentScale)

  // Apply the scale transform to the container and its contents
  container.style.transform = `scale(${currentScale})`;
  
  // update the position of lines boxes,and polygons here.
  grid.scaleGrid(currentScale)
  
  redrawLines()
  scaleSlider.updateScale(currentScale)
}

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
    scaleSlider.updateScale(currentScale)
}

function handleWindowResize(){
  
  console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);
  console.log('window resized')
}




export function drawLines(){
    lines.clearLines()
    const boxList = boxes.boxes;
    boxList.forEach((box, index, array) => {
        const nextBox = array[(index + 1) %array.length];
        const line = Line
        .createLineFromBoxes(box.element,nextBox.element)
        .createLine()
        .setIndex(index)
        .createText(grid.scale)

        lines.addLine(line);
    })

    // Add a click event listener to each line for adding a box between boxes
    lines.lines.forEach((line) => {
        line.line.addEventListener('click', (e) => {
            const lineIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            console.log(`line Index: ${lineIndex}`)
            const startBox = boxList[lineIndex];
            const endBoxIndex = (lineIndex + 1) % boxList.length
            const endBox = boxList[endBoxIndex]; // Wrap around for the last box
          // console.log(lineIndex)
          console.log(e)
          
          
          const lineMidPoint = calculateLineMidpoint(line)
            // console.log(boxList,'startBox: ',startBox,'endBox: ',endBox)
            addBoxBetweenBoxes(startBox, endBox, lineMidPoint);
            
        });})
        // svg.appendChild(line);
    drawAngles(lines.lines)
    shadePolygon(lines.lines,POLYGON_FILL_COLOR)
    return false
    }

/**
 * 
 * @param {Line} line 
 * @returns {{x:Number,y:Number}}
 */
function calculateLineMidpoint(line) {
  const x = (line.x1 + line.x2) / 2
  const y = (line.y1 + line.y2) / 2
  return {x,y}
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


// TODO:REPLACE THIS WITH A BOX METHOD TO UPDATE THE POSITIONING
  // Function to add a box between two existing boxes connected by a line
function addBoxBetweenBoxes(startBox, endBox,lineMidPoint=null) {
    let x 
    let y
    if (!lineMidPoint) {
      const box1Rect = startBox.getElement().getBoundingClientRect();
      const box2Rect = endBox.getElement().getBoundingClientRect();
    
      x = (box1Rect.left + box2Rect.left) / 2;
      y = (box1Rect.top + box2Rect.top) / 2;
        
  }
  
  ({x, y} = lineMidPoint)
  
    const endIndex = boxes.boxes.indexOf(endBox);
    if (endIndex === -1){
        console.error("End box not found in boxes array.");
        return
    }
  
    const newBox = new Box(endIndex-1);
    newBox.positionBox(x,y);
    newBox.hoverInfo.addCallback('click','deleteBtn',() => handleDeleteBox(newBox));

    boxes.addBoxAtIndex(newBox,endIndex)

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


  function handleDeleteBox(box){
    if (boxes.boxes.length <= 3) {
      console.log("Cannot delete box. Must have at least 3 boxes.");
      return
    };
    boxes.removeBox(box);
    boxes.updateBoxText();
    redrawLines();
    summaryTable.refreshRows(lines.lines)
  }




