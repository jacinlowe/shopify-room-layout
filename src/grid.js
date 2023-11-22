

export class Slider{
  constructor(min, max, steps=null, value=null){
    this.displayValue = document.getElementById('sliderValue')
    this.element = document.getElementById('rangeSlider');
    
    if (steps){
      this.steps = steps
    }
    if(value){
      this.updateValue(value)
    }else{
      this.value = this.element.value;
    }

    this.element.min = min;
    this.element.max = max;
    this.element.addEventListener('input',(e) => this.updateValue(e.target.value))
    // this.element.addEventListener('change',(e) => console.log(e.target.value))
  }

  updateValue(value){
    this.value = value;
    this.element.value = value;
    this.displayValue.textContent = value;
  }
}

export class Grid{
  constructor(spacing, pointRadius=2, svgID='grid'){
    this.spacing = spacing;
    this.pointRadius = pointRadius*2;
    this.svg = document.getElementById(svgID);
    this.screenWidth = window.innerWidth;
    this.screenHight = window.innerHeight;
    this.numRows = Math.floor(this.screenHight / this.spacing);
    this.numCols = Math.floor(this.screenWidth / this.spacing);
    this.scale = this.spacing;
  }

  drawGrid(spacing=null){
    let gridSpacing = this.spacing
    if (spacing){
      gridSpacing = spacing
    }
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', col * gridSpacing);
        point.setAttribute('cy', row * gridSpacing);
        
        point.setAttribute('fill', 'black'); // Adjust the fill color as needed
        point.setAttribute('class', 'grid-dot'); // Adjust the fill color as needed
        point.setAttribute('r', this.pointRadius / 2)
        point.setAttribute('id', row+col)

        this.svg.appendChild(point);
      }
    }
  }

  scaleGrid(currentScale){
    const gridPoints = document.querySelectorAll('.grid-dot');
    const scaledGridSpacing = this.spacing * currentScale;
    this.scale = scaledGridSpacing
    console.log("scalegrid",scaledGridSpacing)
    // Update the size and spacing of the grid dots
    this.updateRowAndColumns(scaledGridSpacing)
    this.svg.innerHTML = ''
    this.drawGrid(scaledGridSpacing) // TODO: THIS GETS SLOW AND NEEDS A RE THINK 
    // gridPoints.forEach((point) => {
    //   point.setAttribute('r', scaledGridSpacing / 2)
    // });
    
  }
  updateRowAndColumns(spacing){
    this.numRows = Math.floor(this.screenHight/spacing)
    this.numCols = Math.floor(this.screenWidth/spacing)
    console.log(`total points on grid: ${this.numCols*this.numRows}`)

  }

/**
 * 
 * @param {Box.Element} box 
 */

  snapToGrid(box){
    const boxElem = box
    const x = parseInt(boxElem.style.left);
    const y = parseInt(boxElem.style.top);
  
    // Calculate the closest grid point
    const snappedX = Math.round(x / this.spacing) * this.spacing;
    const snappedY = Math.round(y / this.spacing) * this.spacing;
  
    // Update the box's position
    boxElem.style.left = snappedX + 'px';
    boxElem.style.top = snappedY + 'px';
  }
}


// Function to create a grid of points
function createGrid(spacing) {
    const svg = document.getElementById('grid');

    const screenWidth = window.innerWidth;
    const screenHight = window.innerHeight;

    const numRows = Math.floor(screenHight / spacing);
    const numCols = Math.floor(screenWidth / spacing);

  
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', col * spacing);
        point.setAttribute('cy', row * spacing);
        
        point.setAttribute('fill', 'black'); // Adjust the fill color as needed
        point.setAttribute('class', 'grid-dot'); // Adjust the fill color as needed
        svg.appendChild(point);
      }
    }
  }

  // Function to snap a box to the nearest grid point
function snapToGrid(box, spacing) {
    const x = parseInt(box.style.left);
    const y = parseInt(box.style.top);
  
    // Calculate the closest grid point
    const snappedX = Math.round(x / spacing) * spacing;
    const snappedY = Math.round(y / spacing) * spacing;
  
    // Update the box's position
    box.style.left = snappedX + 'px';
    box.style.top = snappedY + 'px';
  }
  
/**
 * will scalle the grid and resize all the points to the new scale
 * @param {Number} spacing - the new spacing of the grid
 * @param {Number} currentScale - the current scale of the grid
 */
function scaleGrid(spacing,currentScale){
  const gridDots = document.querySelectorAll('.grid-dot');
  const scaledGridSpacing = spacing * currentScale;
  console.log("scalegrid",scaledGridSpacing)
  // Update the size and spacing of the grid dots
  gridDots.forEach((dot) => {
    dot.setAttribute('r', scaledGridSpacing / 2)
  });

}