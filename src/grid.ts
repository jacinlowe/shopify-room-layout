export class Zoom {
  zoomDisplay: HTMLElement | null;
  zoomInBtn: HTMLElement | null;
  zoomOutBtn: HTMLElement | null;
  value: any;
  constructor(value: number | null = null) {
    this.zoomDisplay = document.getElementById("zoomValue");
    this.zoomInBtn = document.getElementById("zoomIn");
    this.zoomOutBtn = document.getElementById("zoomOut");
    if (value) {
      this.updateValue(value);
    }
  }

  updateValue(value: number) {
    // const percentage = (value - this.element.min) / (this.element.max - this.element.min);
    // console.log(value, percentage*100)
    if (!this.zoomDisplay) throw new Error("zoomDisplay is not defined");
    this.value = value;
    this.zoomDisplay.textContent = `${Number(value * 100).toFixed(0)}%`;
  }
  convertToInt(value: string) {
    return parseInt(value) * 100;
  }

  zoomInCallback(fn: CallableFunction) {
    if (!this.zoomInBtn) throw new Error("zoomInBtn is not defined");
    this.zoomInBtn.addEventListener("click", (e) => fn(e));
  }
  zoomOutCallback(fn: CallableFunction) {
    if (!this.zoomOutBtn) throw new Error("zoomInBtn is not defined");
    this.zoomOutBtn.addEventListener("click", (e) => fn(e));
  }

  updateScale(scale: number) {
    this.updateValue(scale);
  }
}

export class Grid {
  spacing: number;
  pointRadius: number;
  svg: HTMLElement | null;
  screenWidth: number;
  screenHight: number;
  numRows: number;
  numCols: number;
  scale: number;
  currentScale: number;
  gridelem: HTMLElement | null;
  constructor(
    spacing: number,
    currentScale: number,
    pointRadius = 2,
    svgID = "grid",
  ) {
    this.spacing = spacing;
    this.pointRadius = pointRadius * 2;
    this.svg = document.getElementById(svgID);
    this.screenWidth = window.innerWidth;
    this.screenHight = window.innerHeight;
    this.numRows = Math.floor(this.screenHight / this.spacing);
    this.numCols = Math.floor(this.screenWidth / this.spacing);
    this.scale = this.spacing;
    this.currentScale = currentScale;
    this.gridelem = document.getElementById('body')
  }

  drawGrid(spacing: number | null = null) {
    if (!this.svg) throw new Error("svg not found");
    let gridSpacing = this.spacing;
    if (spacing) {
      gridSpacing = spacing;
    }
    const pointSize = this.pointRadius/2
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "grid-pattern");
    pattern.setAttribute("width", (pointSize*20).toString());
    pattern.setAttribute("height", (pointSize*20).toString());
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("x", "0");
    pattern.setAttribute("y", "0");
    pattern.setAttribute("patternTransform", `scale(${gridSpacing/20})`);
    // pattern.setAttribute("viewBox", `0 0 ${gridSpacing} ${gridSpacing}`);

    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("r", pointSize.toString());
    point.setAttribute("fill", "black"); // Adjust the fill color as needed
    point.setAttribute("class", "grid-dot"); // Adjust the fill color as needed
    point.setAttribute("cx", pointSize.toString());
    point.setAttribute("cy", pointSize.toString());
    
    pattern.appendChild(point);
    this.svg.appendChild(pattern);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("fill", "url(#grid-pattern)");
    this.svg.appendChild(rect);

    // for (let row = 0; row < this.numRows; row++) {
    //   for (let col = 0; col < this.numCols; col++) {
    //     const point = document.createElementNS(
    //       "http://www.w3.org/2000/svg",
    //       "circle",
    //     );
    //     point.setAttribute("cx", (col * gridSpacing).toString());
    //     point.setAttribute("cy", (row * gridSpacing).toString());

    //     point.setAttribute("fill", "black"); // Adjust the fill color as needed
    //     point.setAttribute("class", "grid-dot"); // Adjust the fill color as needed
    //     point.setAttribute("r", (this.pointRadius / 2).toString());
    //     point.setAttribute("id", (row + col).toString());

    //     this.svg.appendChild(point);
    //   }
    // }
  }

  scaleGrid(currentScale: number) {
    if (!this.svg) throw new Error("svg not found");

    const gridPoints = document.querySelectorAll(".grid-dot");
    if (!gridPoints) throw new Error("gridPoints not found");

    const scaledGridSpacing = this.spacing * currentScale;
    this.scale = scaledGridSpacing;
    console.log("scalegrid", scaledGridSpacing);
    console.log("current Scale", currentScale.toFixed(2));

    this.gridelem?.style.setProperty('background-size', `100% ${currentScale}rem, ${currentScale}rem 100%` )
    

    // Update the size and spacing of the grid dots
    this.updateRowAndColumns(scaledGridSpacing);
    this.svg.innerHTML = "";
    this.drawGrid(scaledGridSpacing); // TODO: THIS GETS SLOW AND NEEDS A RE THINK

    // gridPoints.forEach((point) => {
    //   point.setAttribute('r', scaledGridSpacing / 2)
    // });
  }

  updateRowAndColumns(spacing: number) {
    this.numRows = Math.floor(this.screenHight / spacing);
    this.numCols = Math.floor(this.screenWidth / spacing);
    console.log(`total points on grid: ${this.numCols * this.numRows}`);
  }

  snapToGrid(box: HTMLDivElement) {
    const boxElem = box;
    const x = parseInt(boxElem.style.left);
    const y = parseInt(boxElem.style.top);

    // Calculate the closest grid point
    const snappedX = Math.round(x / this.spacing) * this.spacing;
    const snappedY = Math.round(y / this.spacing) * this.spacing;

    // Update the box's position
    boxElem.style.left = snappedX + "px";
    boxElem.style.top = snappedY + "px";
  }
}
