
type debugBtn = {name:string,text:string}

export function renderButtons(debugBtns:debugBtn[]):void{
    const debugContainer = document.getElementById("debug-buttons") as HTMLDivElement;
    if(!debugContainer) throw new ReferenceError("No debug-buttons div found");
    debugBtns.forEach((v,i) =>{
        const btn = document.createElement("button");
        btn.textContent = v.text;
        btn.id = v.name;
        btn.className = "button debug"
        debugContainer.appendChild(btn);
    })
}