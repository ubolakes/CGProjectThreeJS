/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import { Box } from './box.js'

export function instanceEnemy() {
    const enemy = new Box({
        width: 1,
        height: 1,
        depth: 1,
        color: 0xff0000,
        velocity: {
            x: 0,
            y: 0,
            z: 0.001
        },
        position: {
            x: (Math.random() - 0.5) * 10,
            y: 0,
            z: -15,
        },
        zAcceleration: true
    });
    enemy.castShadow = true;

    return enemy;
}
