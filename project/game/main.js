/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

// importing home made libraries
import * as SCENE from '../scene/scene.js';

// taking canvas from index.html
const canvas = document.getElementById("canvas");

// making render wait until init is complete
SCENE.init(canvas).then(SCENE.animate);
