/**
 * Summary Table class
 * @param {string} tableId
 */
export class SummaryTable {
    constructor(tableId) {
      this.tableId = tableId;
      this.table = document.getElementById(tableId);
      this.summaryRows = [];
    }
    /**
     * Use to initialize the summary table rows
     * @param {[Line]} lines 
     */
    initializeRows(lines){
      lines.forEach((line) => {
          const wallNum = line.index +1;
          const length = line.lengthText;
          const cornerType = line.cornerType?? 'Inside';
          this.addRow(wallNum, length, cornerType);
      })
    }
    /** 
     * Use to refresh the summary table rows
     * @param {[Line]} lines
    */
    refreshRows(lines){
      this.summaryRows = [];
      
      while (this.table.lastElementChild) {
        this.table.removeChild(this.table.lastElementChild);
      }

      this.initializeRows(lines);
    }
    /**
     * 
     * @param {Number} wallNum 
     * @param {Number} length 
     * @param {CornerEnum} cornerType 
     */
    addRow(wallNum, length, cornerType) {
      const row = new SummaryRow(wallNum, length, cornerType);
      this.summaryRows.push(row);
      this.table.appendChild(row.element);
    }
    
    /**
     * 
     * @param {SummaryRow} row 
     * @param {Row Index} id 
     */
    removeRow(row=null,id=null) {
      let index = null;
      if (!row) {
        row = this.summaryRows[id];
        index = id;
      }
      if (!id){
        index = this.summaryRows.indexOf(row);
      }
  
      if (index!= -1) {
        this.summaryRows.splice(index, 1);
        this.table.removeChild(row.element);
      }
    }
  
    /**
     * 
     * @param {SummaryRow} row 
     * @param {Number} wallNum 
     * @param {Number} length 
     * @param {CornerEnum} cornerType 
     */
    updateRow(row, wallNum, length, cornerType) {
      row.updateRow(wallNum, length, cornerType);
    }
  
  }
  
  class SummaryRow {
    /**
     * 
     * @param {Number} wallNum 
     * @param {Number} length 
     * @param {CornerEnum} cornerType 
     */
    constructor(wallNum, length, cornerType) {
      this.element = document.createElement('tr');
      this.wallNumCell = document.createElement('td');
      this.wallNumCell.textContent = wallNum;
      this.lengthCell = document.createElement('td');
      this.lengthCell.textContent = length;
      this.cornerTypeCell = document.createElement('td');
      this.cornerTypeCell.textContent = cornerType;
      this.element.appendChild(this.wallNumCell);
      this.element.appendChild(this.lengthCell);
      this.element.appendChild(this.cornerTypeCell);
    }
    updateRow(wallNum, length, cornerType) {
      this.wallNumCell.textContent = wallNum;
      this.lengthCell.textContent = length;
      this.cornerTypeCell.textContent = cornerType;
    }
  }
  