import { scaleFactor } from "./constants";
import { dialogueData } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Define a function to initialize the game scene
function initGame() {

    // Hide the title screen
    document.getElementById("title-screen").style.display = "none";

    // Show the game container
    const gameContainer = document.getElementById("game-container");
    gameContainer.style.display = "block";

    // Set focus to the game container to ensure keyboard input is captured
    gameContainer.focus();

    k.loadSprite("spritesheet", "./spritesheet.png", {
        sliceX: 39,
        sliceY: 31, // every frame is 16x16, so can be calculated by dividing image size by 16
        anims: {
            "idle-down": 944,
            "walk-down": { from: 944, to: 947, loop: true, speed: 8 },
            "idle-side": 983,
            "walk-side": { from: 983, to: 986, loop: true, speed: 8 },
            "idle-up": 1022,
            "walk-up": { from: 1022, to: 1025, loop: true, speed: 8 },
        },
    });

    // Load map and animated sprites
    k.loadSprite("map", "./map.png");
    k.loadSprite("exclamation", "./exclamation.png");

    // Set background colour
    k.setBackground(k.Color.fromHex("#311047"));

    k.scene("main", async () => {
        const mapData = await (await fetch("./map.json")).json()
        const layers = mapData.layers;

        // Add map
        const map = k.add([
            k.sprite("map"),
            k.pos(0),
            k.scale(scaleFactor)
        ]);

        // Define exclamation data with sprite name and position
        const exclamationData = [
            { spriteName: "pc", position: k.vec2(770, 285) },
            { spriteName: "mechatronics", position: k.vec2(386, 190) },
            { spriteName: "phd", position: k.vec2(515, 190) },
            { spriteName: "tv", position: k.vec2(1090, 540) },
            { spriteName: "bed", position: k.vec2(1250, 230) },
            { spriteName: "resume", position: k.vec2(462, 375) },
            { spriteName: "projects", position: k.vec2(510, 375) },
            { spriteName: "library", position: k.vec2(962, 190) },
            { spriteName: "fridge", position: k.vec2(642, 190) },
        ];

        // Array to hold references to all exclamation points
        const exclamationPoints = [];

        // Create exclamation points dynamically based on data
        exclamationData.forEach(data => {
            const exclamation = k.add([
                k.sprite("exclamation"),
                k.pos(data.position),
                k.scale(4),
                { spriteName: data.spriteName } // Attach spriteName as a custom component
            ]);
            exclamationPoints.push(exclamation); // Store the exclamation point in the array
        });

        // Animation loop to animate all exclamation points
        k.loop(0.1, () => {
            exclamationPoints.forEach(exclamation => {
                const yOffset = Math.sin(k.time() * 10) * 1.2; 
                exclamation.pos.y += yOffset;
            });
        });

        const player = k.make([
            k.sprite("spritesheet", { anim: "idle-down" }),
            k.area({
                shape: new k.Rect(k.vec2(0, 3), 10, 10)
            }),
            k.body(),
            k.anchor("center"),
            k.pos(),
            k.scale(scaleFactor),
            {
                speed: 250,
                direction: "down",
                isInDialogue: false,
            },
            "player",
        ]);

        for (const layer of layers) {
            if (layer.name === "boundaries") {
                // handle boundaries
                for (const boundary of layer.objects) {
                    map.add([
                        k.area({
                            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                        }),
                        k.body({ isStatic: true }),
                        k.pos(boundary.x, boundary.y),
                        boundary.name
                    ]);

                    if (boundary.name) {
                        player.onCollide(boundary.name, () => {
                            if (boundary.name === "exit") {
                                // Refresh the page when colliding with an "exit" boundary
                                window.location.reload();
                            } else {
                                player.isInDialogue = true;
                                displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
                                const exclamationToDestroy = exclamationPoints.find(exclamation => exclamation.spriteName === boundary.name);
                                    if (exclamationToDestroy) {
                                        console.log("destroyed ", exclamationToDestroy.spriteName)
                                        exclamationToDestroy.destroy();
                        }
                                
                            }
                        })
                    }
                }
                continue;
            }

            if (layer.name === "spawnpoints") {
                for (const entity of layer.objects) {
                    if (entity.name === "player") {
                        player.pos = k.vec2(
                            (map.pos.x + entity.x) * scaleFactor,
                            (map.pos.y + entity.y) * scaleFactor
                        );
                        k.add(player);
                        continue;
                    }
                }
            }
        }

        setCamScale(k);

        k.onResize(() => {
            setCamScale(k);
        });

        k.onUpdate(() => {
            k.camPos(player.pos.x, player.pos.y + 100)
        });

        k.onMouseDown((mouseBtn) => {
            if (mouseBtn !== "left" || player.isInDialogue) return;
            const worldMousePos = k.toWorld(k.mousePos());
            player.moveTo(worldMousePos, player.speed);

            const mouseAngle = player.pos.angle(worldMousePos)

            const lowerBound = 50;
            const upperBound = 125;

            if (
                mouseAngle > lowerBound &&
                mouseAngle < upperBound &&
                player.curAnim() !== "walk-up"
            ) {
                player.play("walk-up");
                player.direction = "up";
                return;
            }

            if (
                mouseAngle < -lowerBound &&
                mouseAngle > -upperBound &&
                player.curAnim() !== "walk-down"
            ) {
                player.play("walk-down");
                player.direction = "down";
                return;
            }

            if (Math.abs(mouseAngle) < lowerBound) {
                player.flipX = true;
                if (player.curAnim() !== "walk-side") player.play("walk-side");
                player.direction = "left";
                return;
            }

            if (Math.abs(mouseAngle) > upperBound) {
                player.flipX = false;
                if (player.curAnim() !== "walk-side") player.play("walk-side");
                player.direction = "right";
                return;
            }
        });

        k.onMouseRelease(() => {
            if (player.direction === "down") {
                player.play("idle-down");
                return;
            }

            if (player.direction === "up") {
                player.play("idle-up");
                return;
            }

            player.play("idle-side");
        })
    });

    k.go("main");
}

// Event listener for the "Start Game" button
function startGame() {
    document.getElementById("start-game").removeEventListener("click", startGame);
    initGame();
}

document.getElementById("start-game").addEventListener("click", startGame);
