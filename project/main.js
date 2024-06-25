/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importin home made libraries
import { Box } from './resources/box.js';

// taking canvas from index.html
const canvas = document.getElementById("canvas");

// scene
const scene = new THREE.Scene();

// camera
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);

camera.position.set(2, 2, 2); // TODO: set correctly

// renderer
const renderer = new THREE.WebGLRenderer({
    //alpha: true,
    //antialias: true,
    canvas: canvas
});
renderer.shadowMap.enabled = true; // enabling shadows using shadow mapping
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // using the canvas to render

// controls
const controls = new OrbitControls(camera, renderer.domElement);

// extending the Box class - TODO: move it in a separate file
// moved to another file

// instancing ground floor
const ground = new Box({
    width: 10,
    height: 0.5,
    depth: 50,
    color: 0x0369a1,
    position: {
        x: 0,
        y: -2, // positioned under cube
        z: 0
    }
});
ground.receiveShadow = true; // shadows can be casted
scene.add(ground);

// instancing cube
const cube = new Box({
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
        x: 0,
        y: -0.01, // moving downward
        z: 0
    },
    ground: ground
});
cube.castShadow = true; // enabling shadow casting 
scene.add(cube);


// setting directional light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.y = 3;
directionalLight.position.z = 1;
directionalLight.castShadow = true; // enabling shadow casting
scene.add(directionalLight);

// setting ambient light
scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));

camera.position.z = 5;

// TODO
// keyboard inputs management


// render function
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    cube.update( ground );
}
render();
