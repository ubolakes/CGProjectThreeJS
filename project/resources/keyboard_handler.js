/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains functions used to handle keyboard inputs */

const velocity = 0.1;
var keys = {}; // used to store and manage inputs

function initKeyEvents() {
    // listeners to keyboard events
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
}

function updateVelocity( player ) {
    // handling different inputs
    if (keys['KeyW']) player.velocity.z = -velocity;
    if (keys['KeyA']) player.velocity.x = -velocity;
    if (keys['KeyS']) player.velocity.z = velocity;
    if (keys['KeyD']) player.velocity.x = velocity;
    if (keys['Space'] && player.canJump) player.velocity.y = velocity * 0.7;
}

// TODO: move to a utils.js like file?
function resetVelocity( object ) {
    object.velocity.x = 0;
    //object.velocity.y = 0;
    object.velocity.z = 0;
}

