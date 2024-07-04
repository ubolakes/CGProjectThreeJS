/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file is the entry point of the program */

// importing home made libraries
import * as SCENE from '../scene/scene.js';

// movement binding
initKeyEvents();
initTouchEvents(document.getElementById("canvas"));

// making render wait until init is complete
SCENE.init().then(SCENE.animate);