// Function to create a grid of points
export function createGrid(spacing) {
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
export function snapToGrid(box, spacing) {
    const x = parseInt(box.style.left);
    const y = parseInt(box.style.top);
  
    // Calculate the closest grid point
    const snappedX = Math.round(x / spacing) * spacing;
    const snappedY = Math.round(y / spacing) * spacing;
  
    // Update the box's position
    box.style.left = snappedX + 'px';
    box.style.top = snappedY + 'px';
  }
  
export function scaleGrid(spacing,currentScale){
  const gridDots = document.querySelectorAll('.grid-dot');
  const scaledGridSpacing = spacing * currentScale;
  console.log("scalegrid",scaledGridSpacing)
  // Update the size and spacing of the grid dots
  gridDots.forEach((dot) => {
    dot.setAttribute('r', scaledGridSpacing / 2)
  });

}