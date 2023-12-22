import { describe, it, expect, beforeEach, vi } from "vitest";
import { SummaryTable } from '../src/summaryBox';
import { Line, cornerType } from '../src/lines';


describe('SummaryTable', () => {

  let table: SummaryTable;
  let line1:Line;
  let line2:Line;


  beforeEach(() => {
    document.body.innerHTML = `<div class="summaryBox">
    <table class="summaryTable">
      <thead>
        <th>Wall #</th>
        <th>Wall Length</th>
        <th>Corner Type</th>
      </thead>
      <tbody id="summaryTable"></tbody>
    </table>`; 
    table = new SummaryTable('summaryTable');
    line1 = new Line(1,1,2,2,1,null)   
    .createLine()
    .setIndex(0)
    .createText(1);
    
    line2 = new Line(2,2,3,3,1,null)
    .createLine()
    .setIndex(0)
    .createText(1);
    
  });

  describe('constructor', () => {

    it('sets tableId property', () => {
      expect(table.tableId).toBe('summaryTable');
    });

    // it('sets table property to null', () => {
    //   expect(table.table).toBeNull(); 
    // });

    it('initializes empty summaryRows array', () => {
      expect(table.summaryRows).toEqual([]);
    });

  });

  describe('initializeRows', () => {

    it('adds a row for each line', () => {
      table.initializeRows([line1, line2]);

      expect(table.summaryRows).toHaveLength(2);
    });

    it('sets correct properties on each row', () => {
      table.initializeRows([line1]);

      const row = table.summaryRows[0];
      expect(row.wallNum).toBe('1');
      expect(row.length).toBe(line1.lengthText);
      expect(row.cornerType).toBe(line1.cornerType);
    });

  });

  describe('refreshRows', () => {

    it('clears existing rows', () => {
    //   table.summaryRows = [{}, {}];
      table.refreshRows([]);

      expect(table.summaryRows).toEqual([]);
    });

  });

});