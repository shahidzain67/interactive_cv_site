export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueUI.style.display = 'block';

    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;
            return;
        }

        clearInterval(intervalRef);
        
        // Add a pause before allowing the dialogue box to be closed
        setTimeout(() => {
            document.addEventListener("click", closeDialogue);
        }, 100); // Adjust the delay as needed (1000ms = 1 second)
    }, 15);

    // Function to handle closing the dialogue box
    function closeDialogue() {
        onDisplayEnd();
        dialogueUI.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        document.removeEventListener("click", closeDialogue); // Remove the event listener
    }
}

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));;
        return;
    }

    k.camScale(k.vec2(1.2));
}
