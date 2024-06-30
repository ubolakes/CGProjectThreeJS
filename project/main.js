/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importing home made libraries
import { Box, boxCollision, fallOff } from './resources/box.js';
import * as UTILS from './resources/utils.js';
import * as SCENE from './scene/scene.js';


// taking canvas from index.html
const canvas = document.getElementById("canvas");

// making render wait until init is complete
SCENE.init(canvas).then(SCENE.render);
