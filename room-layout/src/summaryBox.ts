import { Line,cornerType } from "./lines";

/**
 * Summary Table class
 * @param {string} tableId
 */
export class SummaryTable {
    
    tableId: string;
    table: HTMLElement | null;
    summaryRows: SummaryRow[];

    constructor(tableId: string) {
      this.tableId = tableId;
      this.table = document.getElementById(tableId);
      this.summaryRows = [];
    }
    /**
     * Use to initialize the summary table rows
     * @param {[Line]} lines 
     */
    initializeRows(lines:Line[]){
      lines.forEach((line) => {
          const wallNum = line.index + 1;
          const length = line.lengthText ?? '';
          const cornerType = line.cornerType?? 'Inside';
          this.addRow(wallNum, length, cornerType);
      })
    }
    /** 
     * Use to refresh the summary table rows
    */
    refreshRows(lines:Line[]){
      this.summaryRows = [];
      if (!this.table) throw new ReferenceError('Table is not initialized');
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
    addRow(wallNum:number, length:string, cornerType:cornerType) {
      if (!this.table) throw new ReferenceError('Table is not initialized');
      const row = new SummaryRow(wallNum.toString(), length, cornerType);
      this.summaryRows.push(row);
      this.table.appendChild(row.element);
    }
    
    /**
     * 
     * @param {SummaryRow} row 
     * @param {Row Index} id 
     */
    removeRow(row:SummaryRow|null=null, id:number|null=null) {
      if (!this.table) throw new ReferenceError('Table is not initialized');
      if(!row && !id) throw new Error('Row or Row Id is not provided');
      let index = null;

      if (!row) {
        row = this.summaryRows[id as number];
        index = id;
      }
      if (!id){
        index = this.summaryRows.indexOf(row);
      }
  
      if (index!= -1) {
        this.summaryRows.splice(index as number, 1);
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
    updateRow(row:SummaryRow, wallNum:number, length:number, cornerType:cornerType) {
      row.updateRow(wallNum.toString(), length.toString(), cornerType);
    }
  
  }
  
  class SummaryRow {
    wallNumCell: HTMLTableCellElement;
    lengthCell: HTMLTableCellElement;
    cornerTypeCell: HTMLTableCellElement;
    element: HTMLTableRowElement;
    /**
     * 
     * @param {Number} wallNum 
     * @param {Number} length 
     * @param {CornerEnum} cornerType 
     */
    constructor(wallNum:string, length:string, cornerType:cornerType) {
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
    updateRow(wallNum:string, length:string, cornerType:cornerType) {
      this.wallNumCell.textContent = wallNum;
      this.lengthCell.textContent = length;
      this.cornerTypeCell.textContent = cornerType;
    }
  }
  