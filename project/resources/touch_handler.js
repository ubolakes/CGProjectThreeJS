/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains functions used to handle touch events */

// variables to store data
var old_x, old_y;
var dX, dY;

function initTouchEvents( canvas) {
    // binding listeners to handlers
    canvas.ontouchstart = touchStart;
    canvas.ontouchmove = touchMove;
    canvas.ontouchend = touchEnd;
    canvas.ontouchcancel = touchCancel;
}

var touchStart = function(e) {
    e.preventDefault();
    // counting touch points
    if (e.touches.length > 1) {
        keys['Space'] = true;    
    } 
    // one touch point
    const touch = e.touches[0];
    old_x = touch.clientX, old_y = touch.clientY;
}

var touchMove = function(e) {
    //console.log(canvas.width);
    e.preventDefault();
    if (e.touches.length == 1) {
        const touch = e.touches[0];
        // computing deltas
        dX = (touch.clientX - old_x);
        dY = (touch.clientY - old_y);
        // calling function to redirect touch inputs to keyboard inputs
        touch2Keys(dX, dY);
        // setting actual values as the old ones
        old_x = touch.clientX, old_y = touch.clientY;
    }
}

var touchEnd = function(e) {
    e.preventDefault();
    keys['KeyD'] = false;
    keys['KeyA'] = false;
    keys['KeyS'] = false;
    keys['KeyW'] = false;
    keys['Space'] = false;
}

var touchCancel = function(e) {
    e.preventDefault();
    keys['KeyD'] = false;
    keys['KeyA'] = false;
    keys['KeyS'] = false;
    keys['KeyW'] = false;
    keys['Space'] = false;
}

function touch2Keys(dX, dY) {
    if (dX > 5) keys['KeyD'] = true;
    if (dX < -5) keys['KeyA'] = true;
    if (dY > 5) keys['KeyS'] = true;
    if (dY < -5) keys['KeyW'] = true;
}