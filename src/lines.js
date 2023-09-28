// Function to calculate the angle (in degrees) between two vectors given their components (x1, y1) and (x2, y2)
export function calculateAngle(x1, y1, x2, y2) {
    const dotProduct = x1 * x2 + y1 * y2;
    const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
    const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);
    const cosTheta = dotProduct / (magnitude1 * magnitude2);
    const thetaRad = Math.acos(cosTheta);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    return thetaDeg;
  }
  


// Calculate angles for line pairs inside the closed area
export function calculateAnglesForClosedArea(lines) {
    const angles = [];
  
    // Ensure there are at least three lines to form a closed area
    if (lines.length < 3) {
      console.error('At least three lines are required to form a closed area.');
      return angles;
    }
  
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const nextLine = lines[(i + 1) % lines.length]; // Wrap around for the last line
        const currentLineFormatted = {x1:parseFloat(currentLine.getAttribute('x1')), x2:parseFloat(currentLine.getAttribute('x2')),y1:parseFloat(currentLine.getAttribute('y1')),y2:parseFloat(currentLine.getAttribute('y2'))}
        const nextLineFormatted = {x1:parseFloat(nextLine.getAttribute('x1')), x2:parseFloat(nextLine.getAttribute('x2')),y1:parseFloat(nextLine.getAttribute('y1')),y2:parseFloat(nextLine.getAttribute('y2'))}
      const x1 = currentLineFormatted.x2 - currentLineFormatted.x1;
      const y1 = currentLineFormatted.y2 - currentLineFormatted.y1;
      const x2 = nextLineFormatted.x2 - nextLineFormatted.x1;
      const y2 = nextLineFormatted.y2 - nextLineFormatted.y1;
    
      const angle = calculateAngle(x1, y1, x2, y2);

      const midX = (currentLine.x2 + nextLine.x2) / 2;
      const midY = (currentLine.y2 + nextLine.y2) / 2;
      const inside = isPointInsideClosedArea(midX,midY, lines);

        if (inside){
            angles.push(180 - angle)
        }else{
            angles.push(angle)
        }
        
    }
  
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
    polygon.push({ x: parseFloat(line.getAttribute('x1')), y: parseFloat(line.getAttribute('y1')) });
    polygon.push({ x: parseFloat(line.getAttribute('x2')), y: parseFloat(line.getAttribute('y2')) });
  }
  return polygon;
}

  const anglesInsideClosedArea = calculateAnglesForClosedArea(lines);
  console.log('Angles inside closed area:', anglesInsideClosedArea);