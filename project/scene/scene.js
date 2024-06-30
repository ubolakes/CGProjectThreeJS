/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importing home made libraries
import { Box, boxCollision, fallOff } from '../resources/box.js';
import * as UTILS from '../resources/utils.js';

// variables 
// rendering
let renderer, scene, camera;
// mesh
let player, ground;
// reflection
let mirrorCamera, mirror;
// optional lights
let spotLight;
// enemies
const enemies = []; // list of enemies
let frames = 0; // number of frames, determines the number of enemies to spawn
let spawnRate = 200; // period of enemy spawning

// init function
export async function init( canvas ) {
    // scene
    scene = new THREE.Scene();
    // instancing the skybox
    const loader = new THREE.CubeTextureLoader();
    scene.background = UTILS.loadSkybox(loader);

    // camera
    const fov = 75;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);

    camera.position.set(4.6, 2.7, 8);

    // renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        //antialias: true,
        canvas: canvas
    });
    renderer.shadowMap.enabled = true; // enabling shadows using shadow mapping
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); // using the canvas to render

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // dat.GUI
    UTILS.addDatGui(canvas);

    // instancing ground floor
    ground = new Box({
        width: 10,
        height: 0.01,
        depth: 35,
        color: 0x0369a1,
        position: {
            x: 0,
            y: -2, // positioned under cube
            z: -10
        }
    });
    ground.receiveShadow = true; // shadows can be casted
    scene.add(ground);

    // instancing player controlled cube
    player = new Box({
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
    player.castShadow = true; // enabling shadow casting 
    scene.add(player);

    // setting directional light
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(-1, 4, 1);
    directionalLight.castShadow = true; // enabling shadow casting
    scene.add(directionalLight);

    // setting ambient light
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));

    // movement initialization
    initKeyEvents();
    initTouchEvents(canvas);

    // dat.GUI controlled elements
    // spotlight to follow the player controlled mesh
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    spotLight.intensity = 200;
    spotLight.angle = Math.PI / 15;
    spotLight.distance = 1000;
    // setting the spotLight to follow the player controlled mesh
    spotLight.target = player;

    // mirror
    // cubeRenderTarget
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 512 ); // TODO: set this value editable at runtime
    cubeRenderTarget.texture.type = THREE.HalfFloatType;
    // mirror camera
    mirrorCamera = new THREE.CubeCamera( 0.01, 100, cubeRenderTarget );
    // material
    const mirrorMaterial = new THREE.MeshStandardMaterial({
        envMap: cubeRenderTarget.texture,
        roughness: 0.01,
        metalness: 1
    });
    mirror = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 35), mirrorMaterial);
    mirrorCamera.position.set(-6, 0, -10);
    mirror.position.set(-6, 0, -10);
    //mirror.rotation.y = Math.PI / 2; // rotation about the y axis
    //mirrorCamera.position.copy(mirror.position);
}


// render function
export function render() {
    // setting an id to the frame to stop the game in case of collision with enemy
    const animationId = requestAnimationFrame(render);
    
    // reflection
    mirrorCamera.update(renderer, scene);

    // rendering scene
    renderer.render(scene, camera);

    // movement management
    // called at each frame
    resetVelocity( player ); // resetting speed
    updateVelocity( player ); // updating speed

    // player position management
    player.update( ground );

    // updating for each enemy
    enemies.forEach(enemy => {
        enemy.update(ground);
        // collision with player
        if (boxCollision({ box0: player, box1: enemy }) || 
            fallOff({ box0: player, box1: ground})) {
            cancelAnimationFrame(animationId);
        }
    });

    // changing the number of enemies spawned
    if (frames % spawnRate === 0){
        // decreasing the period length as it stays alive
        spawnRate = spawnRate > 10 ? spawnRate-10 : spawnRate;

        // instancing a new enemy
        const enemy = UTILS.instanceEnemy();
        scene.add(enemy);
        enemies.push(enemy); // adding to the list        
    }

    // checking every 10 frames to reduce overhead
    if (frames % 10 === 0) {
        // checking if the spotlight needs to be rendered in the scene
        if (UTILS.params.spotLightEnabled) scene.add(spotLight);
        else scene.remove(spotLight);
        // checking if the mirror needs to be rendered in the scene
        if (UTILS.params.mirrorEnabled) scene.add(mirror);
        else scene.remove(mirror);
    }

    frames++; // increasing frames number
}