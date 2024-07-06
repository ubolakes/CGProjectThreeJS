/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains functions to initialize the scene, render it */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importing home made libraries
import * as BOX from './box.js';
import * as UTILS from '../resources/utils.js';

import Stats from 'three/addons/libs/stats.module.js'

// variables 
// rendering
let renderer, scene, camera;
// mesh
let player, ground;
// reflection
let mirrorCamera, mirror;
let renderTarget;
let scene2, camera2;
// lights
let directionalLight, spotLight;
// obstacles
var obstacles = []; // list of obstacles
let frames = 0; // number of frames
let spawnRate = 200; // period of obstacle spawning
// score
let score = 0;
let scoreDiv;

// init function
export async function init() {
    // extracting canvas from html page
    const canvas = document.getElementById("canvas");

    // scene
    scene = new THREE.Scene();

    // loading the skybox
    scene.background = loadSkybox();

    // camera
    const fov = 75;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);

    camera.position.set(2, 2.7, 8);

    // renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        canvas: canvas, // using canvas to render
        //depth: true
    });
    renderer.shadowMap.enabled = true; // enabling shadows using shadow mapping
    renderer.setPixelRatio( window.devicePixelRatio * 0.7);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // controls - used for debugging
    //const controls = new OrbitControls(camera, renderer.domElement);

    // dat.GUI
    UTILS.addDatGui(canvas);

    // instancing ground floor
    ground = instanceGround();
    scene.add(ground);

    // instancing player controlled cube
    player = instancePlayer();
    scene.add(player);

    // setting directional light
    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(-20, 100, 20);
    directionalLight.castShadow = true; // enabling shadow casting
    directionalLight.target = player; // following the player to always have shadow
    scene.add(directionalLight);

    // setting ambient light
    scene.add(new THREE.AmbientLight(0xFFFFFF, 2.5));

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
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding
    });
    // camera to capture what happens along vertices
    mirrorCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
    mirrorCamera.position.set(-6, 1, -4);
    mirrorCamera.rotation.y = Math.PI / 2;

    scene2 = new THREE.Scene();
    //camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100);
    camera2 = new THREE.PerspectiveCamera(50, 1, 0.1, 100 );
    camera2.position.z = 3;
    // shader material to reflect
    const material = new THREE.ShaderMaterial({
        uniforms: {
            cubemap: {value: cubeRenderTarget.texture}
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform samplerCube cubemap;
            varying vec2 vUv;

            void main() {
                vec3 direction = normalize(vec3(vUv * 2.0 - 1.0, 1.0));
                vec3 color = textureCube(cubemap, direction).rgb;
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });
    
    // geometry on which to stick the reflection
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
    scene2.add(reflection);

    renderTarget = new THREE.WebGLRenderTarget(256, 256);
    // geometry with the reflection attached
    const mirrorMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture});
    mirror = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), mirrorMaterial);
    // setting position
    mirror.position.set(-6, 1, -4);
    mirror.rotation.y = Math.PI / 2;

    // output score
    scoreDiv = document.getElementById('score');
}

// performance monitoring
const stats = new Stats();
document.body.appendChild(stats.dom);

// render function
export function animate() {
    // setting an id to the frame to stop the game in case of collision with obstacle
    const animationId = requestAnimationFrame(animate);
    
    // performance monitoring
    stats.update();

    // rendering scene
    renderer.render(scene, camera);

    // movement management - called at each frame
    resetVelocity( player ); // resetting speed
    updateVelocity( player ); // updating speed

    // player position management
    player.update( ground );

    // updating for each obstacle
    obstacles.forEach(obstacle => {
        obstacle.update(ground);
        if (UTILS.boxCollision({ box0: player, box1: obstacle }) ||  // collision with player
            UTILS.fallOff({ box0: player, box1: ground})) {       // player falls off the platform
            cancelAnimationFrame(animationId);
            // communicating final score
            alert("Your final score is: " + score);
            // redirecting to death page
            location.href = "../death.html";
        }
    });

    // changing the number of obstacles spawned
    if (frames % spawnRate === 0){
        // decreasing the period length as it stays alive
        spawnRate = spawnRate > 10 ? spawnRate-10 : spawnRate;

        // instancing a new obstacle
        let obstacle = instanceObstacle();
        scene.add(obstacle);
        obstacles.push(obstacle); // adding to the list
    }

        // checking every 10 frames to reduce overhead
    if (frames % 10 === 0) {
        // checking if the spotlight needs to be rendered in the scene
        if (UTILS.params.spotLightEnabled) scene.add(spotLight);
        else scene.remove(spotLight);
        // checking if the mirror needs to be rendered in the scene
        if (UTILS.params.mirrorEnabled) scene.add(mirror);
        else scene.remove(mirror);

        // removing obstacle entities from the list
        if (frames > 1500) {
            obstacles.shift();
        }
        //increasing score
        scoreDiv.innerText = ++score;
    }

    // checking if mirror enabled
    if (UTILS.params.mirrorEnabled) {
        mirrorCamera.update(renderer, scene);
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene2, camera2);
        renderer.setRenderTarget(null);

        // checking if mirror needs to be moved according to player z
        if (UTILS.params.mirrorFollow) {
            // updating mirror z to always reflect the player
            mirrorCamera.position.z = player.position.z;
            mirror.position.z = player.position.z;
        }
    }

    frames++; // increasing frames number
}

// instancing functions
function instanceObstacle() {
    const obstacle = new BOX.Box({
        width: 1,
        height: 1,
        depth: 1,
        color: 0xff0000,
        transparent: true,
        opacity: 0.0,
        velocity: {
            x: 0,
            y: 0,
            z: 0.001
        },
        position: {
            x: (Math.random() - 0.5) * 10,
            y: 0,
            z: -28,
        },
        zAcceleration: true
    });
    UTILS.loadMesh( obstacle, '../data/obstacle/obstacle.mtl', '../data/obstacle/obstacle.obj' );
    return obstacle;
}

function instancePlayer() {
    const player = new BOX.Box({
        width: 0.4,
        height: 1,
        depth: 0.4,
        transparent: true,
        opacity: 0.0,
        velocity: {
            x: 0,
            y: -0.01, // moving downward
            z: 0
        }
    });
    UTILS.loadMesh( player, '../data/player/player.mtl', '../data/player/player.obj' );
    return player;
}

function instanceGround() {
    const ground = new BOX.Box({
        width: 10,
        height: 0.01,
        depth: 35,
        color: 0x0369a1,
        transparent: true,
        opacity: 0.0,
        position: {
            x: 0,
            y: -2, // positioned under cube
            z: -10
        }
    });
    //ground.receiveShadow = true; // shadows can be casted
    UTILS.loadMesh( ground, '../data/ground/ground.mtl', '../data/ground/ground.obj' );
    return ground;
}

// function to load skybox
function loadSkybox() {
    return new THREE.CubeTextureLoader().load([
        '../data/skybox/pos-x.jpg',
        '../data/skybox/neg-x.jpg',
        '../data/skybox/pos-y.jpg',
        '../data/skybox/neg-y.jpg',
        '../data/skybox/pos-z.jpg',
        '../data/skybox/neg-z.jpg'
    ]);
}