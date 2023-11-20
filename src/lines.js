
export class Lines{
  constructor(){
    this.lines = []
  }
  addLine(line){
    this.lines.push(line)
  }
  updateLine(id=null,line=null){
    throw ReferenceError('Not Implemented')
    // if(id){

    // }
    // if(line){

    // }
  }
  removeLine(line){
    const index = this.lines.indexOf(line);
    this.lines.splice(index,1)
  }

  clearLines(){
    this.lines = []
  }


}

export class Line{
  constructor(x1,y1,x2,y2,length,color){
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.length = length
        this.color = color
    }

  static createLineFromBoxes(startBox,endBox, color=null){
    let initialColor = color;
    if (!color){
      initialColor ='red';
    }
    const startCenter = getBoxCenter(startBox);
    const endCenter = getBoxCenter(endBox);
    const length = calculateLineLength(startCenter.x,startCenter.y, endCenter.x, endCenter.y);
    const x1 = parseFloat(startCenter.x);
    const x2 = parseFloat(endCenter.x);
    const y1 = parseFloat(startCenter.y);
    const y2 = parseFloat(endCenter.y);
    return new Line(x1,y1,x2,y2,length,initialColor);
  }

  createLine(){
    this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');  
    this.line.setAttribute('x1', this.x1 + 'px');
    this.line.setAttribute('y1', this.y1 + 'px');
    this.line.setAttribute('x2', this.x2 + 'px');
    this.line.setAttribute('y2', this.y2 + 'px');
    this.line.setAttribute('stroke', this.color); // Set the stroke color to red
    this.line.setAttribute('data-original-length', this.length); // Set the stroke color to red
    this.line.classList.add('clickable-line')
    return this
  }

  setIndex(index){
    this.index = index
    this.line.setAttribute('data-index', index)
    return this
  }

  setColor(color){
      this.color = color
    return this
  }
  getLineText(){
    
    const lengthInPixels = calculateLineLength(this.x1, this.y1, this.x2, this.y2);
    
    // Convert length from pixels to feet and inches (adjust the conversion factor as needed)
    const pixelsToFeet = 1 / 10; // Adjust this factor to match your scale
    const lengthInFeet = lengthInPixels * pixelsToFeet;
    const lengthFeet = Math.floor(lengthInFeet);
    const lengthInches = Math.round((lengthInFeet - lengthFeet) * 12);
    
    // Display the length in a dialog or alert (you can customize this part)
    const formattedLengthText = formatLength(lengthFeet, lengthInches);
    return formattedLengthText
  }

  length(){
    return this.length
  }

  getVector(){
    return {x:this.x1 - this.x2, y: this.y1-this.y2}
  }

}



/**
 * Uses the getVector method on a line and calculates the cross product for 2 liens
 * @param {Line} line1 
 * @param {Line} line2 
 * @returns Number
 */
export function lineCrossProduct(line1,line2){
  const line1Vector = line1.getVector();
  const line2Vector = line2.getVector();

  const result = line1Vector.x * line2Vector.y - line1Vector.y * line2Vector.x;
  return result
}

const dotProduct = (x1,x2,y1,y2) => x1 * x2 + y1 * y2;

export function lineDotProduct(line1,line2){
  const line1Vector = line1.getVector();
  const line2Vector = line2.getVector();

  const result = dotProduct(line1Vector.x,line2Vector.x,line1Vector.y,line2Vector.y)
  return result
}

/**
 * Function to calculate the angle (in degrees) between two vectors given their components (x1, y1) and (x2, y2)
 *  @param {Number} x1 - Start X
 *  @param {Number} y1 - Start Y
 *  @param {Number} x2 - End X
 *  @param {Number} y2 - End Y
 */ 
export function calculateAngle(x1, y1, x2, y2) {
    const dotProd = dotProduct(x1,x2,y1,y2)
    const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
    const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);
    const cosTheta = dotProd / (magnitude1 * magnitude2);
    const thetaRad = Math.acos(cosTheta);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    return thetaDeg;
  }
  



/**
 * 
 * Calculate angles for line pairs inside the closed area
 * @param {[Line]} lines 
 * @returns angle - Number
 */
export function calculateAnglesForClosedArea(lines) {
    const angles = [];
  
    // Ensure there are at least three lines to form a closed area
    if (lines.length < 3) {
      console.error('At least three lines are required to form a closed area.');
      return angles;
    }
    
    lines.forEach((line,i,lineArray) =>{
      const nextLine = lineArray[(i + 1) % lineArray.length];
      const angle = Math.atan2(lineCrossProduct(line,nextLine),lineDotProduct(line,nextLine))
      angles.push(angle)

    })

    // for (let i = 0; i < lines.length; i++) {
    //   const currentLine = lines[i];
    //   const nextLine = lines[(i + 1) % lines.length]; // Wrap around for the last line

    //   const x1 = currentLine.x2 - currentLine.x1;
    //   const y1 = currentLine.y2 - currentLine.y1;
    //   const x2 = nextLine.x2 - nextLine.x1;
    //   const y2 = nextLine.y2 - nextLine.y1;
    
    //   const angle = calculateAngle(x1, y1, x2, y2);

    //   const midX = (currentLine.x2 + nextLine.x2) / 2;
    //   const midY = (currentLine.y2 + nextLine.y2) / 2;
    //   const inside = isPointInsideClosedArea(midX,midY, lines);

    //     if (inside){
    //         angles.push(180 - angle)
    //     }else{
    //         angles.push(angle)
    //     }
        
    // }
  
    return angles;
  }

function isPointInsideClosedArea(pointX, pointY, lines){
    const polygon = linesToPolygon(lines)
    return isPointInsidePolygon(pointX,pointY,polygon)
}
  
// Function to check if a point is inside a closed polygon
function isPointInsidePolygon(pointX, pointY, polygon) {
  const n = polygon.length;
  let isInside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > pointY !== yj > pointY &&
      pointX < ((xj - xi) * (pointY - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}


export function formatLine(line){
  return { x1: parseFloat(line.getAttribute('x1')), y1: parseFloat(line.getAttribute('y1')), x2: parseFloat(line.getAttribute('x2')), y2: parseFloat(line.getAttribute('y2')) };
}

// Function to convert an array of lines into a polygon by extracting endpoints
export function linesToPolygon(lines) {
  const polygon = [];
  for (const line of lines) {
    polygon.push({ x: line.x1, y: line.y1 });
    polygon.push({ x: line.x2, y: line.y2 });
  }
  return polygon;
}

  // const anglesInsideClosedArea = calculateAnglesForClosedArea(lines);
  // console.log('Angles inside closed area:', anglesInsideClosedArea);

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

// Helper function to get the center coordinates of a box
function getBoxCenter(box) {
  const rect = box.getBoundingClientRect();
  return {
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
  };
}

