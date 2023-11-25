export class Mediator{
   private  handlers: {[key:string]:EventHandler[]} = {};
    constructor(){
        this.handlers = {};
    }
    registerHandler(event:string, handler:EventHandler):void{
        if (!this.handlers[event]){
            this.handlers[event] = [];

        }
        this.handlers[event].push(handler);
    }
    notify(event:string,data:any):void {
        let currentData = data;

        if (this.handlers[event]){
            console.log(`[EVENT]: ${event.toString()}, Logging:`,currentData)
            this.handlers[event].forEach((handler) =>{
                //call each handler and pass the current data
                const result =  handler(currentData)
                //update the current data with the result for the next handler
                currentData = result??currentData
            });
        }
        return currentData;
    }
}


export type EventHandler<R=any> = (data:any) => R | void;

export const loggerHandler:EventHandler = (data:any):void => {
    console.log('Logging: ', data)
}

export const transformerHandler:EventHandler = (data) => {
    data.tranformed= true
    console.log('Transforming: ', data)
    return data
}
export const clickHandler:EventHandler = (data) => {
    console.log('Click event Handled: ', data)
    return data
}

export const mouseEnterHandler:EventHandler = (data) => {
    console.log('Mouse Enter Event Handled: ', data)
    return data
}

export const mouseLeaveHandler:EventHandler = (data:any): void =>{
    console.log('Mouse Leave Event Handled: ',data)
    return data
}



