import { Box } from "./boxes";

export class Lines{
  svg: any;
  lines: Line[];
  constructor(lineSVG:HTMLOrSVGElement){
    this.svg = lineSVG
    this.lines = []
  }
  addLine(line:Line){
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');  
    group.appendChild(line.line as SVGElement );
    group.appendChild(line.text as SVGElement)
    this.svg.appendChild(group)
    this.lines.push(line)
  }
  updateLine(id:number|null=null, line:Line|null=null){
    throw ReferenceError('Not Implemented')
    if(id){

    }
    if(line){

    }
  }
  removeLine(line:Line){
    const index = this.lines.indexOf(line);
    this.lines.splice(index,1)
  }

  clearLines(){
        
    while (this.svg.firstChild){
      this.svg.removeChild(this.svg.firstChild);
    }
    this.lines = []

  }


}

export type cornerType = 'Inside' | 'Outside' | 'Corner' | 'None';

export class Line{
  x1: any;
  y1: any;
  x2: any;
  y2: any;
  color: any;
  lengthText: string | undefined;
  line: SVGLineElement | undefined;
  index: number;
  text: SVGGElement | undefined;
  cornerType: cornerType| undefined;
  private _length:number;
  constructor(x1: number,y1: number,x2: number,y2: number,length: number,color:string|null){
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this._length = length
        this.color = color
        this.index = 0
        
    }

  static createLineFromBoxes(startBox:Box,endBox:Box, color:string|null=null){
    let initialColor = color;
    if (!color){
      initialColor ='red';
    }
    const startCenter = getBoxCenter(startBox);
    const endCenter = getBoxCenter(endBox);
    const length = calculateLineLength(startCenter.x,startCenter.y, endCenter.x, endCenter.y);
    const x1 = startCenter.x;
    const x2 = endCenter.x;
    const y1 = startCenter.y;
    const y2 = endCenter.y;
    return new Line(x1,y1,x2,y2,length,initialColor);
  }

  createLine(){
    
    this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');  
    
    this.line.setAttribute('x1', this.x1 + 'px');
    this.line.setAttribute('y1', this.y1 + 'px');
    this.line.setAttribute('x2', this.x2 + 'px');
    this.line.setAttribute('y2', this.y2 + 'px');
    this.line.setAttribute('stroke', this.color); // Set the stroke color to red
    this.line.setAttribute('data-original-length', this.length.toString()); // Set the stroke color to red
    this.line.classList.add('clickable-line')
    this.cornerType = "Inside";
    return this
  }

  setIndex(index:number){
    this.index = index
    if (!this.line) throw new Error('Line must be created before setting index')
    this.line.setAttribute('data-index', index.toString())
    return this
  }

  setColor(color:string){
      this.color = color
    return this
  }
  createText(scale=10,xOffset=20,yOffset=-10){
    // if(!this.index) throw new Error('Line index must be set before creating text')
    const middleX = (parseFloat(this.x1) + parseFloat(this.x2)) / 2
    const middleY = (parseFloat(this.y1) + parseFloat(this.y2)) / 2

    // Offset values for text position (adjust as needed)
    // const xOffset = xOffset; // Offset text horizontally
    // const yOffset = yOffset; // Offset text vertically

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');  
    
    // create the text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (middleX + xOffset).toString());
    text.setAttribute('y', (middleY + yOffset).toString());
    text.setAttribute('text-anchor','start');
    text.setAttribute('dominant-baseline','middle');
    text.setAttribute('class', 'line-text')
    text.setAttribute('index', (this.index-1).toString())
    text.textContent = this.getLineText(scale);
    group.appendChild(text)
    
    // added wall num
    const wallNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    wallNum.setAttribute('x', (middleX + xOffset).toString());
    wallNum.setAttribute('y', (middleY + yOffset+20).toString());
    wallNum.setAttribute('text-anchor','start');
    wallNum.setAttribute('dominant-baseline','middle');
    wallNum.setAttribute('class', 'line-text')
    wallNum.setAttribute('index', (this.index-1).toString())
    wallNum.textContent = `Wall: ${this.index+1}`
    group.appendChild(wallNum)
    this.text = group
    return this
  }
  
  getLineText(scale=10){
    
    this.length = calculateLineLength(this.x1, this.y1, this.x2, this.y2);
    
    // Convert length from pixels to feet and inches (adjust the conversion factor as needed)
    const pixelsToFeet = 1 / scale; // Adjust this factor to match your scale
    const lengthInFeet = this.length * pixelsToFeet;
    const lengthFeet = Math.floor(lengthInFeet);
    const lengthInches = Math.round((lengthInFeet - lengthFeet) * 12);
    
    // Display the length in a dialog or alert (you can customize this part)
    const formattedLengthText = formatLength(lengthFeet, lengthInches);
    this.lengthText = formattedLengthText;
    return this.lengthText;
  }

  set length(length:number){
    this._length = length;
  }

  get length(){
    return this._length
  }
  

  getVector(){
    return {x:this.x1 - this.x2, y: this.y1-this.y2}
  }
  
  calculateVector(line2:Line){
    return {x:line2.x1 - this.x2, y: line2.y1-this.y2}
  }

  calculateAngle(line2:Line){
    const vector1 = this.getVector()
    const vector2 = line2.getVector()
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y)
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y)
    
    //Calculate the angle in radians
    const thetaRad = Math.acos(dotProduct / (magnitude1 * magnitude2)) 
    
    //convert the angle to degrees
    const angle = (thetaRad * 180) / Math.PI;
    console.log(`${this.index}: angle between lines: ${angle} degrees`)
    return angle
  }

}


export function calculateArcAngles(centerX:number, centerY:number, line1:Line, line2:Line){
  // Calculate angles for vectors
  const angle1 = Math.atan2(line1.getVector().y, line1.getVector().x);
  const angle2 = Math.atan2(line2.getVector().y, line2.getVector().x);

   // Calculate angles relative to the center point
   const relativeAngle1 = Math.atan2(centerY - centerY, centerX - centerX) + angle1;
   const relativeAngle2 = Math.atan2(centerY - centerY, centerX - centerX) + angle2;
 
   // Convert angles to degrees
  //  const startAngle = (relativeAngle1 * 180) / Math.PI;
  //  const endAngle = (relativeAngle2 * 180) / Math.PI;
 
  return {startAngle:relativeAngle1, endAngle:relativeAngle2};

}


// function angleToDegrees(angle:number){
//   return (angle * 180) / Math.PI;
// }



// function lineCrossProduct(line1:Line,line2:Line){
//   const line1Vector = line1.getVector();
//   const line2Vector = line2.getVector();

//   const result = line1Vector.x * line2Vector.y - line1Vector.y * line2Vector.x;
//   return result
// }

const dotProduct = (x1: number,x2: number,y1: number,y2: number) => x1 * x2 + y1 * y2;

//  function lineDotProduct(line1:Line,line2:Line){
//   const line1Vector = line1.getVector();
//   const line2Vector = line2.getVector();

//   const result = dotProduct(line1Vector.x,line2Vector.x,line1Vector.y,line2Vector.y)
//   return result
// }

/**
 * Function to calculate the angle (in degrees) between two vectors given their components (x1, y1) and (x2, y2)
 * @param {Line} line1 
 * @param {Line} line2 
 */ 
function calculateAngle(line1:Line,line2:Line) {
    const line1Vector = line1.getVector();
    const line2Vector = line2.getVector();

    const dotProd = dotProduct(line1Vector.x,line2Vector.x,line1Vector.y,line2Vector.y);
    const magnitude1 = Math.sqrt(line1Vector.x **2 + line1Vector.y ** 2);
    const magnitude2 = Math.sqrt(line2Vector.x **2 + line2Vector.y ** 2);
    
    //Calculate the angle in Radians
    const cosTheta = dotProd / (magnitude1 * magnitude2);
    const thetaRad = Math.acos(cosTheta);
    
    //Convert angle to degrees
    const thetaDeg = (thetaRad * 180) / Math.PI;
    
    return thetaDeg;
  }
  

  export function calculateInteriorAngle(line1:Line,line2:Line,line3:Line){
    const angle1 = calculateAngle(line1,line2);
    const angle2 = calculateAngle(line2,line3);
    const angle3 = calculateAngle(line3,line1);

    const cosInteriorAngle = (Math.cos(angle1) + Math.cos(angle2) + Math.cos(angle3)) / 2;
    const interiorAngleRad = Math.acos(cosInteriorAngle);
    console.log((interiorAngleRad*180)/Math.PI);
    const interiorAngleDeg = (interiorAngleRad * 180) / Math.PI;

    return interiorAngleDeg
  }



/**
 * 
 * Calculate angles for line pairs inside the closed area
 * @param {[Line]} lines 
 * @returns angle - Number
//  */
// function calculateAnglesForClosedArea(lines:Line[]) {
//     const angles:number[] = [];
  
//     // Ensure there are at least three lines to form a closed area
//     if (lines.length < 3) {
//       console.error('At least three lines are required to form a closed area.');
//       return angles;
//     }
//     lines.reverse()
//     lines.forEach((line,i,lineArray) =>{
//       const nextLine = lineArray[(i + 1) % lineArray.length];
//       const angle = Math.atan2(lineCrossProduct(line,nextLine),lineDotProduct(line,nextLine))
//       angles.push(angle)

//     })

//     // for (let i = 0; i < lines.length; i++) {
//     //   const currentLine = lines[i];
//     //   const nextLine = lines[(i + 1) % lines.length]; // Wrap around for the last line

//     //   const x1 = currentLine.x2 - currentLine.x1;
//     //   const y1 = currentLine.y2 - currentLine.y1;
//     //   const x2 = nextLine.x2 - nextLine.x1;
//     //   const y2 = nextLine.y2 - nextLine.y1;
    
//     //   const angle = calculateAngle(x1, y1, x2, y2);

//     //   const midX = (currentLine.x2 + nextLine.x2) / 2;
//     //   const midY = (currentLine.y2 + nextLine.y2) / 2;
//     //   const inside = isPointInsideClosedArea(midX,midY, lines);

//     //     if (inside){
//     //         angles.push(180 - angle)
//     //     }else{
//     //         angles.push(angle)
//     //     }
        
//     // }
  
//     return angles;
//   }

// function isPointInsideClosedArea(pointX: number, pointY: number, lines: Line[]){
//     const polygon = linesToPolygon(lines)
//     return isPointInsidePolygon(pointX,pointY,polygon)
// }
  
// // Function to check if a point is inside a closed polygon
// function isPointInsidePolygon(pointX:number, pointY:number, polygon:{x:number,y:number}[]) {
//   const n = polygon.length;
//   let isInside = false;

//   for (let i = 0, j = n - 1; i < n; j = i++) {
//     const xi = polygon[i].x;
//     const yi = polygon[i].y;
//     const xj = polygon[j].x;
//     const yj = polygon[j].y;

//     const intersect =
//       yi > pointY !== yj > pointY &&
//       pointX < ((xj - xi) * (pointY - yi)) / (yj - yi) + xi;

//     if (intersect) {
//       isInside = !isInside;
//     }
//   }

//   return isInside;
// }


// function formatLine(line:any){
//   return { x1: parseFloat(line.getAttribute('x1')), y1: parseFloat(line.getAttribute('y1')), x2: parseFloat(line.getAttribute('x2')), y2: parseFloat(line.getAttribute('y2')) };
// }

// Function to convert an array of lines into a polygon by extracting endpoints
export function linesToPolygon(lines:Line[]) {
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
function calculateLineLength(x1: number, y1: number, x2: number, y2: number) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return length;
}
// Function to format length in feet and inches
function formatLength(feet: number, inches: number) {
  return `${feet} ft ${inches} in`;
}

// Helper function to get the center coordinates of a box
function getBoxCenter(box: Box) {
  const rect = box.getElement().getBoundingClientRect();
  return {
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
  };
}



