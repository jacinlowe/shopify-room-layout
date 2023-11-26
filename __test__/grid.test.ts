import { describe, it, expect, beforeEach, vi } from "vitest";

import { Grid, Zoom } from '../src/grid';

describe("Grid", () => {

    let grid:Grid;
  
    beforeEach(() => {
        document.body.innerHTML = '<svg id="grid" width="100%" height="100%"></svg>'; 
        grid = new Grid(10, 1);
    });
  
    it("instantiates with correct scale", () => {
      expect(grid.currentScale).toBe(1);
    });
  
    it("calculates number of rows and columns", () => {
      expect(grid.numRows).toBe(76); 
      expect(grid.numCols).toBe(102);
    });
  
    // it("draws grid with correct spacing", () => {
    //   document.body.innerHTML = '<svg id="grid" width="100%" height="100%"></svg>'; 
    //   grid.drawGrid();
      
    //   const dots = document.querySelectorAll(".grid-dot");
    //   console.log(dots.length)
    //   expect(dots.length).toBe(10000); // 10 x 10 = 100 rows/cols
    //   expect(dots[0].getAttribute("cx")).toBe("10"); 
    //   expect(dots[0].getAttribute("cy")).toBe("10");
    // });
  
    // it("snaps element to grid correctly", () => {
    //   const elem = document.createElement("div");
    //   elem.style.position = "absolute";
    //   elem.style.left = "53px";
    //   elem.style.top = "38px";
  
    //   grid.snapToGrid(elem);
  
    //   expect(elem.style.left).toBe("50px"); 
    //   expect(elem.style.top).toBe("40px"); 
    // });
  
  });

describe('Zoom',() =>{
    let zoom: Zoom;
    beforeEach(() =>{
        document.body.innerHTML = `
        <div class="zoom-buttons">
          <button id="zoomOut">-</button>
          <div class="zoom-value" id="zoomValue"></div>
          <button id="zoomIn">+</button>
        </div>
        `
        zoom = new Zoom(1);
    }  )
    it('istantiated correctly',() =>{
        expect(zoom.value).toBe(1)
    })

    it('updates the values correctly', ()=>{
        zoom.updateScale(10)
        expect(zoom.zoomDisplay?.textContent).toBe("1000%")
        expect(zoom.value).toBe(10)
    })
    
    it('converts correctly', ()=>{
        const int = zoom.convertToInt('10')
        expect(int).toBe(1000)
    })

    it('will call the zoom in callback function correctly',() => {
        const mock = vi.fn()
        zoom.zoomInCallback(mock)
        zoom.zoomInBtn?.click()
        expect(mock).toHaveBeenCalled()

    })

    it('will call the zoom out callback function correctly',() => {
        const mock = vi.fn()
        zoom.zoomOutCallback(mock)
        zoom.zoomOutBtn?.click()
        expect(mock).toHaveBeenCalled()

    })
})