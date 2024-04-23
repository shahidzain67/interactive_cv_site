import kaboom from "kaboom";

// All functions we need 
export const k = kaboom({
    global: false,
    touchToMouse: true,
    canvas: document.getElementById("game") 
})