

const DELETE_BUTTON_OFFSET = {x:60,y:-20}

export class Boxes{
    constructor(container){
        this.container = container;
        this.boxes = [];
    }
    addBox(box){
        this.boxes.push(box)
        this.container.appendChild(box.getElement())
    }
    getBoxes(){
        return this.boxes
    }
    removeBox(box){
        this.boxes.splice(this.boxes.indexOf(box), 1)
        this.container.removeChild(box.getElement())
    }
    clearBoxes(){
        this.boxes = []
        this.container.innerHTML = ''
    }
    spreadBoxes(){
        const centerX = this.container.offsetWidth / 2;
        const centerY = this.container.offsetHeight / 2;
        const angleIncrement = (2 * Math.PI) / this.boxes.length;
        this.boxes.forEach((box,i)=>{
            const angle = i * angleIncrement;
            const x = centerX + (this.container.offsetWidth / 4) * Math.cos(angle) - box.size / 2;
            const y = centerY + (this.container.offsetHeight / 4) * Math.sin(angle) - box.size / 2;

            box.element.style.left = x + 'px';
            box.element.style.top = y + 'px';
        })
    }
}

export class Box{
    constructor(id,size=50){
        ;
        this.size = size;
        this.id = id;
        this.element = document.createElement('div');
        this.element.className = 'drag-box';
        this.element.id = `box${id}`;
        this.element.style.width = size + 'px'; // Set the width
        this.element.style.height = size + 'px'; // Set the height
        this.element.textContent = `Box ${id}`;

    }
    getElement(){
        return this.element
    };

    

}

class HoverInfo{
    /**
     * 
     * @param {Box} box 
     */
    constructor(box){
        this.box = box
        this.elements = []
    }

    addInfoItem(item,){
        this.elements.push(item)
    }

    topLeft(){
        const boxRect = this.box.getElement().getBoundingClientRect();
        const xOffset = DELETE_BUTTON_OFFSET.x; // Adjust the horizontal offset
        const yOffset = DELETE_BUTTON_OFFSET.y; // Adjust the vertical offset
        const leftOffset =  boxRect.left + xOffset + 'px';
        const topOffset = boxRect.top + yOffset + 'px';
        return {leftOffset,topOffset}
    }
}