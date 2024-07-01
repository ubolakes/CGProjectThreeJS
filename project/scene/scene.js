/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// importing home made libraries
import * as BOX from '../resources/box.js';
import * as UTILS from '../resources/utils.js';

// variables 
// rendering
let renderer, scene, camera;
// mesh
let player, ground;
// reflection
let mirrorCamera, mirror;
let renderTarget;
let scene2, camera2;
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
    ground = UTILS.instanceGround();
    scene.add(ground);

    // instancing player controlled cube
    player = UTILS.instancePlayer();
    scene.add(player);

    // setting directional light
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(-1, 4, 1);
    directionalLight.castShadow = true; // enabling shadow casting
    scene.add(directionalLight);

    // setting ambient light
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1.5));

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
        `,
        side: THREE.DoubleSide
    });
    
    // geometry on which to stick the reflection
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
    scene2.add(reflection);

    renderTarget = new THREE.WebGLRenderTarget(512, 512);
    // geometry with the reflection attached
    const mirrorMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture});
    mirror = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), mirrorMaterial);
    // setting position
    mirror.position.set(-6, 1, -4);
    mirror.rotation.y = Math.PI / 2;

}


// render function
export function render() {
    // setting an id to the frame to stop the game in case of collision with enemy
    const animationId = requestAnimationFrame(render);
    
    // reflection
    mirrorCamera.update(renderer, scene);
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene2, camera2);
    renderer.setRenderTarget(null);
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
        if (BOX.boxCollision({ box0: player, box1: enemy }) || 
            BOX.fallOff({ box0: player, box1: ground})) {
            cancelAnimationFrame(animationId);
            // redirecting to death page
            location.href = "death.html";
        }
    });

    // changing the number of enemies spawned
    if (frames % spawnRate === 0){
        // decreasing the period length as it stays alive
        spawnRate = spawnRate > 10 ? spawnRate-10 : spawnRate;

        // instancing a new enemy
        const enemy = UTILS.instanceObstacle();
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