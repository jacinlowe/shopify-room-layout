import { expect } from 'vitest';

import "../style.scss";
import { Grid, Zoom } from "./grid.ts";
import { Line, Lines } from "./lines.ts";
import { shadePolygon } from "./polygon.ts";
import { SummaryTable } from "./summaryBox.ts";
import { Boxes, Box } from "./boxes.ts";
import { EventHandler, Mediator } from "./mediator.ts";
import { LayoutManager,StateType } from "./statemanager.ts";
import {  configService as config, TFeatureFlags } from "./config"
import { configDefaults } from "vitest/dist/config.js";
import { renderButtons } from "./debug-buttons.ts";

const container = document.getElementById("container") as HTMLDivElement;
const rootContainer = document.getElementById(
  "rootContainer",
) as HTMLDivElement;
const svg = document.getElementById("lines") as HTMLElement;
const reset = document.getElementById('reset') as HTMLButtonElement;
const save = document.getElementById('save') as HTMLButtonElement;
const cancel = document.getElementById('cancel') as HTMLButtonElement;




const GRID_SPACING = 20;
const POLYGON_FILL_COLOR = "blue"; // Replace with the desired fill color

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_INCREMENT = 0.1;

let currentScale = 1.0;


let boxes:Boxes;
let lines:Lines;
let grid:Grid;
let zoom:Zoom;
let summaryTable:SummaryTable;


const initialState:StateType = {

}

const layoutManager = new LayoutManager(initialState)
const loadedState = layoutManager.loadLayout();

if (config.getFeatureFlag("debugMode")){
  renderButtons([
    {name:'angles',text:'Show Angles'},
    {name:'wallText',text:'Show Wall Text'},
    {name:'boxIcon',text:'Show Box Icon'},
  ])
  const angleBtn = document.getElementById('angles') as HTMLButtonElement;
  const wallTextBtn = document.getElementById('wallText') as HTMLButtonElement;
  const boxIconBtn = document.getElementById('boxIcon') as HTMLButtonElement;
  angleBtn?.addEventListener('click',(e) => mediator.notify('toggleAngles',null));
  wallTextBtn?.addEventListener('click',(e) => mediator.notify('toggleWallText',null));
}





if (loadedState){
  boxes = loadedState.boxes
  lines = loadedState.lines;
  grid = loadedState.grid;
  zoom = loadedState.Zoom
  summaryTable = loadedState.summaryTable;
  
} else{

  boxes = new Boxes(container);
  lines = new Lines(svg);
  grid = new Grid(GRID_SPACING, currentScale);
  zoom = new Zoom(grid.currentScale ?? 1);
  if(config.getFeatureFlag("showSummaryWindow")){
    summaryTable = new SummaryTable("summaryTable");
  }
  initializeState();
  
}


const stateHandler: EventHandler = () =>{
  layoutManager.onUpdateLayout({ boxes, lines, grid, zoom, summaryTable })
}

const mouseMoveHandler: EventHandler = (data) => {
  switch (false) {
    case data.boxes && data.grid && data.e:
      throw new Error("no data");
    default:
      boxes.moveBox(data.grid, data.e);

      redrawLines();
  }
};

const mouseUpHandler: EventHandler = (data) => {
  if (!data.boxes) throw new Error("boxes not found in data transfer");
  if (!data.e.target) return;
  const selectedBox = data.boxes.selectedBox;
  const boxes = data.boxes;
  if (selectedBox) {
    selectedBox.getElement().style.cursor = "grab";
    boxes.unselectBox();
    selectedBox.hoverInfo.setHoverInfoEvents();
  }
};

const resizeHandler: EventHandler = (data) => {
  if (!data.document)
    throw new ReferenceError("Data doesn't have documentElement");
  const document = data.document;
  console.log(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  );
  console.log("window resized");
};

const mouseDownHandler: EventHandler = (data) => {
  // console.log('container mouse down')
  switch (false) {
    case data.e:
      throw new ReferenceError("Data doesnt have Mouse Event");
    case data.boxes:
      throw new ReferenceError("Data doesnt have Boxes object");
    default:
      const e: MouseEvent = data.e;
      const boxes: Boxes = data.boxes;
      if (!e.target) return;

      if ((e.target as HTMLDivElement).classList.contains("drag-box")) {
        const boxId = (e.target as HTMLDivElement).getAttribute("id");
        if (!boxId) throw new Error("Cannot get Box Id");
        const box = boxes.getBox(parseInt(boxId));
        boxes.selectBox(box);
        // const boxRect = box.getElement().getBoundingClientRect();
        // offsetX = e.clientX - boxRect.left;
        // offsetY = e.clientY - boxRect.top;
        box.getElement().style.cursor = "grabbing";
        // handleLongP/ress(e.target)
      }
  }
};

const wheelHandler: EventHandler = (data) => {
  if (!data.e) throw new Error("Data does not have a wheel event");
  const e = data.e;
  handleZoom(e);
};

const lineClickHandler: EventHandler = (data) => {
  switch (false) {
    case data.e:
      throw new ReferenceError("Data does not have Mouse click event");
    case data.boxList:
      throw new ReferenceError("Data does not have Boxes.Boxes");
    case data.line:
      throw new ReferenceError("Data does not have Line instance");
    default:
      const e = data.e;
      const boxes = data.boxes;
      const line: Line = data.line;
      const lineIndex = line.index;
      console.log(`line Index: ${lineIndex}`);

      const lineMidPoint = calculateLineMidpoint(line);

      boxes.addBoxBetweenBoxes(lineIndex, handleDeleteBox, lineMidPoint);
      redrawLines();
      if(config.getFeatureFlag('showSummaryWindow')){
      summaryTable.refreshRows(lines.lines);
      }
  }
};

const saveHandler: EventHandler = (data) => {
  const saveData = summaryTable.getRowsData()
  console.log(saveData)
}
const resetHandler: EventHandler = (data) => {}
const cancelHandler: EventHandler = (data) => {}
const toggleAnglesHandler: EventHandler = (data) => {
  const status = config.toggleFeatureFlag("drawArcs");
  console.log(status? "Arcs off" : "Arcs on");
  clearAngles();
  redrawLines();
}
const toggleWallTextHandler: EventHandler = (data) => {
  const status = config.toggleFeatureFlag("showLineText");
  console.log(status? "Wall Text off" : "Wall Text on");
  redrawLines();
}


const mediator = new Mediator();
// mediator.registerStateHandler(stateHandler);
mediator.registerHandler("mousemove", mouseMoveHandler);
mediator.registerHandler("mouseup", mouseUpHandler);
// mediator.registerHandler('mouseup', loggerHandler)
mediator.registerHandler("resize", resizeHandler);
mediator.registerHandler("mousedown", mouseDownHandler);
mediator.registerHandler("wheel", wheelHandler);
mediator.registerHandler("line_click", lineClickHandler);
mediator.registerHandler("save", saveHandler);
mediator.registerHandler("reset", resetHandler);
mediator.registerHandler("cancel", cancelHandler);
mediator.registerHandler("toggleAngles", toggleAnglesHandler);

function createBoxes() {
  const boxLimit = 5;
  const boxSize = 50; // Adjust the box size as needed
  for (let i = 1; i <= boxLimit; i++) {
    boxes.addBox(new Box(i, boxSize));
  }
}

function initializeState(){
  // Create the initial Boxes
  createBoxes();
  
  // Spread out the boxes evenly
  boxes.spreadBoxes();
  
  // Initialize lines between the boxes
  initializeLines();
  
  grid.drawGrid();
  if(config.getFeatureFlag('showSummaryWindow')){
    summaryTable.initializeRows(lines.lines);
  }
  
  // layoutManager.onUpdateLayout({ boxes, lines, grid, zoom, summaryTable })
}

// Box Event Listeners
boxes.boxes.forEach((box) => {
  box.hoverInfo.addCallback("click", "deleteBtn", () => handleDeleteBox(box));
});

// MOVE SELECTED BOX
//Document event listeners
document.addEventListener("mousemove", (e) => {
  if (!boxes.selectedBox) return;
  if (!boxes.boxOffset) return;
  mediator.notify("mousemove", { boxes, grid, e });
});

document.addEventListener("mouseup", (e) =>
  mediator.notify("mouseup", { boxes, e }),
);
document.addEventListener("resize", () =>
  mediator.notify("resize", { document }),
);
container.addEventListener("mousedown", (e) => {
  mediator.notify("mousedown", { boxes, e });
});

rootContainer.addEventListener("wheel", (e) => handleZoom(e));
zoom.zoomInCallback(zoomIn);
zoom.zoomOutCallback(zoomOut);

cancel?.addEventListener('click',(e) => mediator.notify('cancel',null));
reset?.addEventListener('click',(e) => mediator.notify('reset',null));
save?.addEventListener('click',(e) => mediator.notify('save',null));

// FIXME:


//TODO: NEED TO COLLAPSE THIS INTO A SIMPLER IMPLEMENTATION
function zoomOut(event: MouseEvent) {
  if (currentScale <= MIN_SCALE) return;
  event.preventDefault();

  //calculate the scale factor based on the scroll direction
  currentScale += -SCALE_INCREMENT;
  //Clamp the scale factor within the defined bounds
  currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale));
  console.log(currentScale);

  // Apply the scale transform to the container and its contents
  container.style.transform = `scale(${currentScale})`;

  // update the position of lines boxes,and polygons here.
  grid.scaleGrid(currentScale);

  redrawLines();
  zoom.updateScale(currentScale);
}
//@ts-ignore
function zoomIn(event: MouseEvent) {
  if (currentScale >= MAX_SCALE) return;
  //calculate the scale factor based on the scroll direction
  currentScale += SCALE_INCREMENT;
  //Clamp the scale factor within the defined bounds
  currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale));
  console.log(currentScale);

  // Apply the scale transform to the container and its contents
  container.style.transform = `scale(${currentScale})`;

  // update the position of lines boxes,and polygons here.
  grid.scaleGrid(currentScale);

  redrawLines();
  zoom.updateScale(currentScale);
}

function handleZoom(event: WheelEvent) {
  event.preventDefault();

  //calculate the scale factor based on the scroll direction
  currentScale += event.deltaY * -0.01 * SCALE_INCREMENT;
  //Clamp the scale factor within the defined bounds
  currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale));
  console.log(currentScale);

  // Apply the scale transform to the container and its contents
  container.style.transform = `scale(${currentScale})`;

  // update the position of lines boxes,and polygons here.
  grid.scaleGrid(currentScale);

  redrawLines();
  zoom.updateScale(currentScale);
}

function drawLines() {
  lines.clearLines();
  const boxList = boxes.boxes;
  boxList.forEach((box, index, array) => {
    const nextBox = array[(index + 1) % array.length];

    const line = Line.createLineFromBoxes(box, nextBox)
      .createLine()
      .setIndex(index)
      .createText(grid.scale);
    lines.addLine(line);
  });

  // Add a click event listener to each line for adding a box between boxes
  lines.lines.forEach((line) => {
    if (!line.line) return;
    line.line.addEventListener("click", (e: MouseEvent) => {
      mediator.notify("line_click", { boxes, e, line });
    });
  });

  if (config.getFeatureFlag('drawArcs')){
    drawAngles(lines.lines);

  }
  if (config.getFeatureFlag('drawPolygon')){
    shadePolygon(lines.lines, POLYGON_FILL_COLOR);
  }
}

// Initialize lines between the boxes
function initializeLines() {
  drawLines();
}

// Redraw lines between the boxes
function redrawLines() {
  svg.innerHTML = "";
  drawLines();
  if(config.getFeatureFlag('showSummaryWindow')){
    summaryTable.refreshRows(lines.lines);

  }
}

function calculateLineMidpoint(line: Line) {
  const x = (line.x1 + line.x2) / 2;
  const y = (line.y1 + line.y2) / 2;
  return { x, y };
}


function clearAngles(){
  const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

  if (!canvas) throw new ReferenceError("No canvas found");

  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0,0,canvas.width,canvas.height);
}

function drawAngles(lines: Line[]) {
  const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

  if (!canvas) throw new ReferenceError("No canvas found");

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ReferenceError("No canvas context found");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const angleArray = [];
  lines.forEach((line,index) =>{
    let angle;
    if (index === 0){
      angle = line.calculateAngle(lines[(lines.length-1)]);
    }
    else{

      angle = line.calculateAngle(lines[(index-1)%lines.length]);
    }
    ctx.font = "24px Arial";
    ctx.fillText(`${angle.toFixed(2)} degs`,line.x1+40,line.y1+40);
  })

  // boxes.boxes.forEach((box,index,boxArray) => {
  //   const nextBox = boxArray[(index + 1) %boxArray.length];
  //   const thirdBox = boxArray[(index + 2) %boxArray.length];
  //   drawArcBetweenPoints(ctx,box,nextBox,thirdBox)
  // })

  // lines.forEach((line, index, lineArray) => {
  //   const previousLine = lineArray[(index - 1 + lineArray.length) % lineArray.length];
  //   const nextLine = lineArray[(index + 1) % lineArray.length];

  //   // const angle = line.calculateAngle(nextLine);
  //   const centerX = nextLine.x2;
  //   const centerY = nextLine.y2;
  //   const { startAngle, endAngle } = calculateArcAngles(
  //     centerX,
  //     centerY,
  //     previousLine,
  //     nextLine,
  //   );

  //   // const startAngle = Math.atan2(previousLine.y2,previousLine.x2);
  //   // const endAngle = Math.atan2(nextLine.y2, nextLine.x2);
  //   const angle = startAngle - endAngle;
  //   const deg = angle * (180/Math.PI);
  //   console.log(index,deg)
  //   angleArray.push({ startAngle, endAngle });
    
  //   drawArc(ctx, centerX, centerY, startAngle,endAngle);
  // });
  // console.log(Math.PI*1.4)
  // console.log(angleArray)

  // console.log(`angle between lines: ${angleArray} degrees`);
  // console.table(angleArray);
  //@ts-ignore
  const line1 = lines[0];
  //@ts-ignore
  const line2 = lines[1];
  // //@ts-ignore
  // const line3 = lines[2];
  // // const angle = calculateInteriorAngle(line1,line2,line3)

  // // draw angle arc
  // const radius = 50
  // const centerX = line1.x1;
  // const centerY = line1.y1;
  // const dx = line1.x2 - line1.x1;
  // const dy = line1.y2 - line1.y1;
  // const angle = (Math.atan2(dy,dx)*180/Math.PI)*-1;
  // console.log(angle)
  // console.log((angle*Math.PI)/180)

  // ctx.beginPath();
  // ctx.arc(line1.x1,line1.y1,40,-2,-1*(angle*Math.PI/180),true);
  // ctx.strokeStyle = 'blue';
  // ctx.stroke();

  // ctx.beginPath();

  // ctx.arc(centerX,centerY,radius,2, Math.PI);
  // ctx.strokeStyle = 'red';
  // ctx.stroke();

  const angles = calculateArcAngles(line1,line2);
  console.log(angles)
  drawArc(ctx,angles.centerX,angles.centerY,angles.startAngle,angles.endAngle,angles.radius);
  drawSquare(ctx,line1.getMidPoint().x, line1.getMidPoint().y,5,5);
}

function drawSquare(ctx: CanvasRenderingContext2D,x:number,y:number,width:number,height:number){
  ctx.beginPath();
  ctx.ellipse(x,y,width,height,0,0,Math.PI*2);
  // ctx.rect(x,y,width,height);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  
  ctx.stroke();
}

//@ts-ignore
function drawArcBetweenPoints(
  ctx: CanvasRenderingContext2D,
  box1: Box,
  box2: Box,
  box3: Box,
  radius = 60,
) {
  const box1Pos = box1.getPosition();
  const box2Pos = box2.getPosition();
  const box3Pos = box3.getPosition();
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  ctx.arcTo(box1Pos.x, box1Pos.y, box2Pos.x, box2Pos.y, radius);
  ctx.arcTo(box2Pos.x, box2Pos.y, box3Pos.x, box3Pos.y, radius);
  ctx.stroke();
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  startAngle: number,
  endAngle: number,
  radius = 40,
) {

  // draw angle arc
  ctx.beginPath();
  // ctx.arcTo(x,y,x+2,y+2,10);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle,true);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.closePath();
}

function calculateAngle(slope:number){
  return Math.atan(slope) * (180 / Math.PI);
}

function calculateArcAngles(line1:Line,line2:Line){
  const centerX = (line1.getMidPoint().x + line2.getMidPoint().x) /2;
  const centerY = (line1.getMidPoint().y + line2.getMidPoint().y) /2;

  // calculate Radii
  const raduis1 = Math.sqrt((line1.x1 - centerX) ** 2 + (line1.y1 - centerY) ** 2);
  const raduis2 = Math.sqrt((line2.x1 - centerX) ** 2 + (line2.y1 - centerY) ** 2);
  const radius = (raduis1 + raduis2) / 2;

  // calculate angles
  const startAngle = Math.atan2(line1.y1 - centerY, line1.x1 - centerX);
  const endAngle = Math.atan2(line2.y1 - centerY, line2.x1 - centerX);
  return { centerX,centerY, startAngle, endAngle,radius };
}

function handleDeleteBox(box: Box) {
  if (boxes.boxes.length <= 3) {
    console.log("Cannot delete box. Must have at least 3 boxes.");
    return;
  }
  boxes.removeBox(box);
  boxes.updateBoxText();
  redrawLines();
  if(config.getFeatureFlag('showSummaryWindow')){
    summaryTable.refreshRows(lines.lines);
  }
}

