/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importin home made libraries
import { Box, boxCollision } from './resources/box.js';
import * as UTILS from './resources/utils.js';

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
    alpha: true,
    //antialias: true,
    canvas: canvas
});
renderer.shadowMap.enabled = true; // enabling shadows using shadow mapping
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // using the canvas to render

// controls
const controls = new OrbitControls(camera, renderer.domElement);

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
scene.add(new THREE.AmbientLight(0xFFFFFF, 1.5));

camera.position.z = 5;

// TODO
// keyboard inputs management

// movement initialization
initKeyEvents();

// enemy instantation
const enemies = []; // list of enemies

// keeping track if frames
// it's used to determine the number of enemies to spawn
let frames = 0;
// period of enemy spawning
let spawnRate = 200;

// render function
function render() {
    // setting an id to the frame to stop the game in case of collision with enemy
    const animationId = requestAnimationFrame(render);
    // rendering scene
    renderer.render(scene, camera);

    // movement management
    // called at each frame
    resetVelocity(cube); // resetting speed
    updateVelocity(cube); // updating speed

    cube.update( ground );

    // updating for each enemy
    enemies.forEach(enemy => {
        enemy.update(ground);

        // collision with player
        if (boxCollision({ box0: cube, box1: enemy })) {
            cancelAnimationFrame(animationId);
        }
    });

    if (frames % spawnRate === 0){
        // decreasing the period length as it stays alive
        spawnRate = spawnRate > 10 ? spawnRate-10 : spawnRate;

        // instancing a new enemy
        const enemy = UTILS.instanceEnemy();
        scene.add(enemy);
        enemies.push(enemy); // adding to the list
    }
    console.log(spawnRate);

    frames++; // increasing frames number
}
render();
