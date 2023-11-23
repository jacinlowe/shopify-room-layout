

const DELETE_BUTTON_OFFSET = {x:60,y:-20}

export class Boxes{
    constructor(container){
        this.container = container;
        this.boxes = [];
        this.selectedBox = null;
        this.boxOffset = null
    }
    addBox(box){
        // box.hoverInfo.addCallback('click','deleteBtn',() => this.removeBox(box))
        this.boxes.push(box)
        this.container.appendChild(box.getElement())
        this.grabBox(box)
        // this.moveBox()
    }

    addBoxAtIndex(box, index) {
        const nextBox = this.boxes[(index+1) % this.boxes.length]
        this.boxes.splice(index, 0, box)
        this.container.insertBefore(box.getElement(),nextBox.getElement())
        this.grabBox(box)
        this.updateBoxText()
    }
    /**
     * ALLOWS THE BOXES TO BE DRAGGED AROUND THE SCREEN
     * @param {HTMLElement} boxElem
     *  */
    grabBox(box) {
        console.log('selected box: ',box.id )
        const boxElem = box.getElement()
        boxElem.addEventListener('mousedown', (e) => {
        this.selectBox(box);
        const boxRect = this.selectedBox.getElement().getBoundingClientRect();
        this.selectedBox.getElement().style.cursor = 'grabbing';
        
        const offsetX = e.clientX - boxRect.left;
        const offsetY = e.clientY - boxRect.top;
            
       
        this.boxOffset = { offsetX, offsetY }
            // console.log(this.boxOffset)
        box.hoverInfo.pauseHoverInfo()
        });

    }

    // moveBox() {
    //     document.addEventListener('mousemove', (e) => {
    //        if (!this.selectedBox) return
    //         // console.log(e)

    //     })

    // }

    
    selectBox(box) {
        this.selectedBox = box;
    }
    unselectBox() {
        this.selectedBox = null;
        // this.boxOffset = null;
    }
    getBoxes(){
        return this.boxes
    }
    removeBox(box){
        this.boxes.splice(this.boxes.indexOf(box), 1)
        this.container.removeChild(box.getElement())
        box = null;
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

            box.positionBox(x,y);
            
        })
    }
    updateBoxText(){
        // update the box text
        this.boxes.forEach((box,index) => {
            box.updateText(index+1);
        })
    }
}



export class Box{
    constructor(id,size=50){
        this.size = size;
        this.id = id;
        this.element = document.createElement('div');
        this.text = document.createElement('p');
        this.element.className = 'drag-box';
        
        this.element.id = `box${id}`;
        this.element.style.width = size + 'px'; // Set the width
        this.element.style.height = size + 'px'; // Set the height
        this.text.textContent = `Box ${id}`;
        
        this.hoverInfo = new HoverInfo(this)
        .createHoverInfo()
        this.element.appendChild(this.text)
        this.element.appendChild(this.hoverInfo.getHoverInfo())
        // this.pointGroup.appendChild(this.element)
    }

    getElement(){
        return this.element
    };
    getHoverInfo(){
        return this.hoverInfo.getHoverInfo()
    }
    // getPointGroup(){
    //     return this.pointGroup
    // }
    positionBox(x,y){
        const xPos = x - this.size / 2;
        const yPos = y - this.size / 2;

        // this.pointGroup.style.left = xPos + 'px';
        // this.pointGroup.style.top = yPos + 'px';

        this.element.style.left = xPos + 'px';
        this.element.style.top = yPos + 'px';
    }
    
    getPosition(){
        return getBoxCenter(this)
    }

    updateText(id){
        this.text.textContent = `Box ${id}`;
        // this.element.textContent += `Box ${id}`;
        this.element.id = `box${id}`
        
    }

}

/**
 *  Helper function to get the center coordinates of a box
 * @param {Box} box 
 * @returns {{x:Number,y:Number}}
 */
export function getBoxCenter(box) {
    const rect = box.getElement().getBoundingClientRect();
    return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    };
}


class HoverInfo{
    /**
     * 
     * @param {Box} box 
     */
    constructor(box){
        this.box = box
        this.elements = new Object()
        
    }
    getHoverInfo(){
        return this.hoverInfo
    }
    createHoverInfo(){
        this.hoverInfo = document.createElement('div');
        this.hoverInfo.className = 'hoverInfo';
        
        while (this.hoverInfo.firstChild){
            this.hoverInfo.removeChild(this.hoverInfo.firstChild);
        }
        const deleteBtn = this.createDeleteBtn()
        const optionsBtn = this.createOptionsBtn()
        // Append the hover info to the container and fade it in
        this.hoverInfo.appendChild(deleteBtn);
        this.hoverInfo.appendChild(optionsBtn);

        this.setHoverInfoEvents();
        this.hoverInfo.style.opacity = '0';
        this.hoverInfo.classList.add('transition')
        return this
    }

    pauseHoverInfo() {
        this.hideHoverInfo();
        this.hoverInfo.removeEventListener('mouseenter', () => this.showHoverInfo())
        this.hoverInfo.removeEventListener('mouseleave', () => this.hideHoverInfo())
    }
    setHoverInfoEvents() {
        // LISTENERS
        this.hoverInfo.addEventListener('mouseenter', () => this.showHoverInfo())
        this.hoverInfo.addEventListener('mouseleave', () => this.hideHoverInfo())
    }

    createDeleteBtn(){
        const deleteBtn = document.createElement('div');
        deleteBtn.classList.add('button')
        deleteBtn.classList.add('delete-button');
        deleteBtn.textContent = 'X';
        
        //Add the event listner to delete the box
        // deleteBtn.addEventListener('click', () => handleDeleteBox(this.box))
        this.elements = {deleteBtn, ...this.elements}
        return deleteBtn
    }

    createOptionsBtn(){
        const optionsBtn = document.createElement('div');
        for (let i=1; i<=3;i++){
            const line = document.createElement('span')
            optionsBtn.appendChild(line)
        }
        optionsBtn.classList.add('button')
        optionsBtn.classList.add('options-button');
        
        
        //Add the event listner to delete the box
        // deleteBtn.addEventListener('click', () => handleDeleteBox(this.box))
        this.elements = {optionsBtn: optionsBtn, ...this.elements}
        return optionsBtn
    }
    /**
     * 
     * @param {type} event - click
     * @param {HTMLElementName} element 
     * @param {Event} listener
     */
    addCallback(event, element, listener){
        if(element in this.elements){
            this.elements[element].addEventListener(event,listener)
        }
    }

    addInfoItem(item,){
        this.elements.push(item)
    }
    
    showHoverInfo() {
        
        this.hoverInfo.style.opacity = '0';
        this.hoverInfo.classList.add('transition')
        setTimeout(() => {
            this.hoverInfo.style.opacity = '1';
        }, 10); // Delay for smoother fade-in
    }



    hideHoverInfo(){
    
    this.hoverInfo.style.opacity = '1';
    this.hoverInfo.classList.add('transition')
    setTimeout(() => {
      this.hoverInfo.style.opacity = '0';
      
    
  }, 50); // Delay for smoother fade-out
  }
}