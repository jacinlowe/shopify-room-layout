import { describe, it, expect, beforeEach, vi } from "vitest";

import { Boxes, Box } from '../src/boxes';



describe('Boxes', () => {
    let boxes: Boxes;

    beforeEach(() => {
        const container = document.createElement('div');
        boxes = new Boxes(container);
        const boxSeed = 5;
        for (let i = 0; i < boxSeed; i++) {
            const box = new Box(i);
            boxes.addBox(box);
        }
    })
    it('adds a box to the list', () => {
        const index = boxes.boxes.length
        const box = new Box(index);
        boxes.addBox(box);
        expect(boxes.boxes.length).toBe(6);
    })
    it ('removes a box from the list', () => {
        const index = 0;
        const box = boxes.boxes[index];
        const secondBox = boxes.boxes[index + 1];
        boxes.removeBox(box);
        expect(boxes.boxes.length).toBe(4);
        expect(boxes.boxes[index]).toBe(secondBox);
    })
})