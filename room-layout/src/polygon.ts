// Function to create and shade the polygon

import { Line } from "./lines";


export function shadePolygon(lines:Line[], fillColor:string) {
    const polygon = document.getElementById('polygon'); // Get the SVG element
    if (!polygon) throw new ReferenceError('No polygon element found');
    const polygonPoints = [];
    while (polygon.firstChild){
        polygon.removeChild(polygon.firstChild);
    }
    for (const line of lines) {
      polygonPoints.push(`${line.x1},${line.y1}`);
      polygonPoints.push(`${line.x2},${line.y2}`);
    }
  
    // Close the polygon by connecting the last point to the first point
    polygonPoints.push(`${lines[0].x1},${lines[0].y1}`);
  
    // Create a polygon element and set its attributes
    const polygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygonElement.setAttribute('points', polygonPoints.join(' '));
    polygonElement.setAttribute('fill', fillColor); // Set the fill color
    polygonElement.setAttribute('class', 'polygon'); // Set the fill color
  
    // Append the polygon to the SVG
    polygon.appendChild(polygonElement);
  }
  
// Example usage:
// const lines = [
// { x1: 0, y1: 0, x2: 100, y2: 0 },
// { x1: 100, y1: 0, x2: 100, y2: 100 },
// { x1: 100, y1: 100, x2: 0, y2: 100 },
// { x1: 0, y1: 100, x2: 0, y2: 0 },
// ];

// const fillColor = 'blue'; // Replace with the desired fill color

// shadePolygon(lines, fillColor);