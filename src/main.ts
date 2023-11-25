
import '../style.scss'
import { Grid,Slider } from './grid.ts';
import { Line, Lines, calculateArcAngles } from './lines.ts';
import { shadePolygon } from './polygon.ts'
import { SummaryTable } from './summaryBox.ts';
import { Boxes,Box } from './boxes.ts';
import { EventHandler, Mediator, clickHandler,loggerHandler, mouseEnterHandler, mouseLeaveHandler, transformerHandler } from './mediator.ts';

const container = document.getElementById('container') as HTMLDivElement;
const rootContainer = document.getElementById('rootContainer')as HTMLDivElement;
const svg = document.getElementById('lines') as HTMLElement;

const GRID_SPACING = 20
const POLYGON_FILL_COLOR = 'blue'; // Replace with the desired fill color

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_INCREMENT = 0.1;

let currentScale = 1.0;


const mouseMoveHandler:EventHandler = (data)=>{
  switch(false){
    case data.boxes && data.grid && data.e:
     throw new Error('no data')
    default:
      boxes.moveBox(data.grid, data.e)
      
      redrawLines()
  }
}

const mouseUpHandler:EventHandler = (data) =>{
  if (!data.boxes) throw new Error('boxes not found in data transfer')
  if (!data.e.target) return;
  const selectedBox = data.boxes.selectedBox;
  const boxes = data.boxes;
  if (selectedBox) {
    selectedBox.getElement().style.cursor = 'grab';
    boxes.unselectBox();
    selectedBox.hoverInfo.setHoverInfoEvents();
    }
}

const resizeHandler:EventHandler = (data) => {
  if(!data.document) throw new ReferenceError("Data doesn't have documentElement")
  const document = data.document
  console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);
  console.log('window resized')
}

const mouseDownHandler:EventHandler = (data) =>{
  // console.log('container mouse down')
  switch(false){
    case data.e:
      throw new ReferenceError('Data doesnt have Mouse Event')
    case data.boxes:
      throw new ReferenceError('Data doesnt have Boxes object')
    default:
      const e:MouseEvent = data.e
      const boxes:Boxes = data.boxes
      if (!e.target) return;
      
      if ((e.target as HTMLDivElement).classList.contains('drag-box')){
        const boxId = (e.target as HTMLDivElement).getAttribute('id')
        if (!boxId) throw new Error('Cannot get Box Id')
        const box = boxes.getBox(parseInt(boxId))
          boxes.selectBox(box);
          const boxRect = box.getElement().getBoundingClientRect();
          // offsetX = e.clientX - boxRect.left;
          // offsetY = e.clientY - boxRect.top;
          box.getElement().style.cursor = 'grabbing';
          // handleLongP/ress(e.target)
      }
  }
}

const wheelHandler:EventHandler = (data)=>{
  if (!data.e) throw new Error('Data does not have a wheel event')
  const e = data.e
  handleZoom(e)
}

const lineClickHandler:EventHandler = (data) => {
  switch(false){
    case data.e:
      throw new ReferenceError('Data does not have Mouse click event');
    case data.boxList:
      throw new ReferenceError('Data does not have Boxes.Boxes');
    case data.line:
      throw new ReferenceError('Data does not have Line instance');
    default:
      const e = data.e
      const boxes = data.boxes
      const line:Line = data.line
      const lineIndex = line.index
      console.log(`line Index: ${lineIndex}`);

      const lineMidPoint = calculateLineMidpoint(line);
    
      boxes.addBoxBetweenBoxes(lineIndex, handleDeleteBox, lineMidPoint);
      redrawLines();
      summaryTable.refreshRows(lines.lines)
  }
}

const mediator = new Mediator();

mediator.registerHandler('mousemove', mouseMoveHandler)
mediator.registerHandler('mouseup', mouseUpHandler)
// mediator.registerHandler('mouseup', loggerHandler)
mediator.registerHandler('resize', resizeHandler)
mediator.registerHandler('mousedown', mouseDownHandler )
mediator.registerHandler('wheel', wheelHandler)
mediator.registerHandler('line_click',lineClickHandler)


const boxes = new Boxes(container);
let lines = new Lines(svg);
const grid = new Grid(GRID_SPACING,currentScale);
const scaleSlider = new Slider(grid.currentScale ?? 1);
const summaryTable = new SummaryTable('summaryTable')


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
boxes.spreadBoxes();

// Initialize lines between the boxes
initializeLines();

grid.drawGrid();
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
  mediator.notify('mousemove', {boxes,grid,e})    
});

document.addEventListener('mouseup', (e) => mediator.notify('mouseup',{boxes,e}));
document.addEventListener('resize',() => mediator.notify('resize',{document}))
container.addEventListener('mousedown', (e)=>{
  mediator.notify('mousedown',{boxes, e})  
})

rootContainer.addEventListener('wheel', (e) =>  handleZoom(e));
scaleSlider.zoomInCallback(zoomIn)
scaleSlider.zoomOutCallback(zoomOut)



//TODO: NEED TO COLLAPSE THIS INTO A SIMPLER IMPLEMENTATION
function zoomOut(event:MouseEvent){
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
//@ts-ignore
function zoomIn(event:MouseEvent){
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

function handleZoom(event:WheelEvent){
  
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


function drawLines() {
  lines.clearLines();
  const boxList = boxes.boxes;
  boxList.forEach((box, index, array) => {
    const nextBox = array[(index + 1) % array.length];

    const line = Line.createLineFromBoxes(box, nextBox)
    .createLine()
    .setIndex(index)
    .createText(grid.scale)
      ;

    lines.addLine(line);
  });

  // Add a click event listener to each line for adding a box between boxes
  lines.lines.forEach((line) => {
    if (!line.line) return;
    line.line.addEventListener("click", (e: MouseEvent) => {
      mediator.notify('line_click',{boxes, e, line})
    });
  });

  drawAngles(lines.lines);
  shadePolygon(lines.lines, POLYGON_FILL_COLOR);
}


function calculateLineMidpoint(line:Line) {
  const x = (line.x1 + line.x2) / 2
  const y = (line.y1 + line.y2) / 2
  return {x,y}
}


function drawAngles(lines:Line[]){
  const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
  
  if (!canvas) throw new ReferenceError('No canvas found');

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ReferenceError('No canvas context found');

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
//@ts-ignore
const line1 = lines[0];
//@ts-ignore
const line2 = lines[1];
//@ts-ignore
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

//@ts-ignore
function drawArcBetweenPoints(ctx:CanvasRenderingContext2D,box1:Box,box2:Box,box3:Box,radius=60){
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

function drawArc(ctx:CanvasRenderingContext2D,x:number,y:number,startAngle:number,endAngle:number,radius=40){
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



// Function to calculate the length of a line segment
//@ts-ignore
function calculateLineLength(x1: number, y1: number, x2: number, y2: number) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return length;
}

// Function to format length in feet and inches
//@ts-ignore
  function formatLength(feet: number, inches: number) {
    return `${feet} ft ${inches} in`;
  }


function handleDeleteBox(box: Box){
    if (boxes.boxes.length <= 3) {
      console.log("Cannot delete box. Must have at least 3 boxes.");
      return
    };
    boxes.removeBox(box);
    boxes.updateBoxText();
    redrawLines();
    summaryTable.refreshRows(lines.lines)
  }




