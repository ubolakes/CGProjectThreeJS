/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

const velocity = 0.05;
var keys = {}; // used to store and manage inputs

function initKeyEvents() {
    // listeners to keyboard events
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
}

function updateVelocity( player ) {
    // handling different inputs
    if (keys['KeyW']) player.velocity.z = -velocity ;
    if (keys['KeyA']) player.velocity.x = -velocity;
    if (keys['KeyS']) player.velocity.z = velocity;
    if (keys['KeyD']) player.velocity.x = velocity;
}

// TODO: move to a utils.js like file?
function resetVelocity( object ) {
    object.velocity.x = 0;
    //object.velocity.y = 0;
    object.velocity.z = 0;
}

