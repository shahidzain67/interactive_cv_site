import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";

k.loadAseprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31, // every frame is 16x16, so can be calculated by dividing image size by 16
    anims: {
        "idle-down": 944, //frame id from tiled
        "walk-down": { from: 944, to: 947, loop: true, speed: 8 },
        "idle-side": 983,
        "walk-side": { from: 983, to: 986, loop: true, speed: 8 },
        "idle-up": 1022,
        "walk-up": { from: 1022, to: 1025, loop: true, speed: 8 }, 
    },
}); 

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json() //load map data before doing anything else and load as JSON
    const layers = mapData.layers;

    const map = k.make([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor)
    ]);

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
        if (layer.name === "boundaries") { // handle boundaries
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
                        player.isInDialogue: true,
                        // TODO
                    })
                }
            }
        }
    }
});

k.go("main");