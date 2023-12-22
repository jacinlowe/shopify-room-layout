
import { configService as config, TFeatureFlags } from "./config";

type handlerType = {
    [key: string]: EventHandler[];
};

export class Mediator {
  private handlers: handlerType = {}
  constructor() {
    this.handlers = {}
  }
  /**
   * Can only be one state handler if there are more that one registered only the last one will be retained
   * @param handler 
   * @returns void
   */
  registerStateHandler(handler:EventHandler): void{
    this.registerHandler('state', handler);
    let stateHandlers = this.handlers['state']

    // only use the last handler if there are more than one
    if(stateHandlers.length >= 1){
      const lastHandler = stateHandlers.pop();
      if(!lastHandler){
        return;
      }
      stateHandlers = []
      stateHandlers.push(lastHandler);
      this.handlers['state'] = stateHandlers;
    } 
  }
  registerHandler(event: string, handler: EventHandler): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
  notify(event: string, data: any): void {
    let currentData = data;

    if (this.handlers[event]) {
      if(config.getFeatureFlag('eventLogging')){
        console.log(`[EVENT]: ${event.toString()}, Logging:`, currentData);
      }
      this.handlers[event].forEach((handler) => {
        //call each handler and pass the current data
        const result = handler(currentData);
        //update the current data with the result for the next handler
        currentData = result ?? currentData;
      });

      // update the save state
      if (this.handlers['state']){
        const stateHandler = this.handlers['state'][0]
        if (stateHandler){
          stateHandler(currentData);
        }
      }
    }
    return currentData;
  }
}

export type EventHandler<R = any> = (data: any | never) => R | void;
/**
 * 
 * @param data 
 */
export const loggerHandler: EventHandler = (data: any): void => {
  console.log("Logging: ", data);
};

export const transformerHandler: EventHandler = (data) => {
  data.tranformed = true;
  console.log("Transforming: ", data);
  return data;
};
export const clickHandler: EventHandler = (data) => {
  console.log("Click event Handled: ", data);
  return data;
};

export const mouseEnterHandler: EventHandler = (data) => {
  console.log("Mouse Enter Event Handled: ", data);
  return data;
};

export const mouseLeaveHandler: EventHandler = (data: any): void => {
  console.log("Mouse Leave Event Handled: ", data);
  return data;
};
