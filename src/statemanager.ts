export class LayoutManager{
    state:StateType;
    saveThrottle: NodeJS.Timeout| null;
    constructor(initialState:StateType){
        this.saveThrottle = null;
        this.state = initialState;
    }

    onUpdateLayout(state:StateType){
        if (this.saveThrottle !== null){
            
            clearTimeout(this.saveThrottle);
        }
        this.state = state;
        this.saveThrottle = setTimeout(() => {
            this.saveLayout()
            .catch((err) => console.error(err));
        }, 1000);
    }
    
    saveLayout(){    
        return new Promise<void>((resolve,reject) => {
            try{
                const state = this.state
        
                const stateJson = JSON.stringify(state);
                const binary = btoa(stateJson);
                console.log(binary)
                localStorage.setItem('layout', binary);
                resolve();
            } catch(err){
                reject(err);
            }

        })
    }

    loadLayout():StateType | null{
        try{
            const stateJson = localStorage.getItem('layout');
            if (stateJson === null) {
                return null;
            }
            const bstate = atob(stateJson);
            console.log(bstate);
            const state = JSON.parse(bstate) as StateType;
    
            this.state = state;
            return this.state;
        }catch(err){
            console.error(err);
            return null;
        }

    }
}

export type StateType ={
    [key: string]: any;
}