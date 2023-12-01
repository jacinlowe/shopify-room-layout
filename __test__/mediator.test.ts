import { describe, it, expect,beforeEach, vi } from 'vitest';
import { Mediator } from './../src/mediator';

describe("Mediator", () => {
  let mediator: Mediator;

  beforeEach(() => {
    mediator = new Mediator();
  });

  describe("constructor", () => {
    it("initializes handlers property", () => {
      
        expect(mediator.handlers).toEqual({});
    });
  });

  describe("registerHandler", () => {
    it("adds handler to handlers object", () => {
      const handler = () => {};
      mediator.registerHandler("test", handler);
    
      expect(mediator.handlers["test"]).toEqual([handler]);
    });
  });

  describe("registerStateHandler", () => {
    it("calls registerHandler with state event", () => {
      const registerHandlerSpy = vi.spyOn(mediator, "registerHandler");
      const handler = () => {};

      mediator.registerStateHandler(handler);

      expect(registerHandlerSpy).toHaveBeenCalledWith("state", handler);
    });

    it("overrides previous state handler with new one", () => {
      const handler1 = () => {};
      const handler2 = () => {};

      mediator.registerStateHandler(handler1);
      mediator.registerStateHandler(handler2);

      expect(mediator.handlers["state"]).toEqual([handler2]);
    });

    it("keeps last state handler if more than one registered", () => {
      const handler1 = () => {};
      const handler2 = () => {};
      const handler3 = () => {};

      mediator.registerStateHandler(handler1);
      mediator.registerStateHandler(handler2);
      mediator.registerStateHandler(handler3);

      expect(mediator.handlers["state"]).toEqual([handler3]);
    });
  });
});
