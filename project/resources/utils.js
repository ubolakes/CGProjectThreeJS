/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import { Box } from './box.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export function instanceObstacle() {
    const enemy = new Box({
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
            z: -25,
        },
        zAcceleration: true
    });
    loadMesh( enemy, '../data/obstacle/obstacle.mtl', '../data/obstacle/obstacle.obj' );
    return enemy;
}

export function instancePlayer() {
    const player = new Box({
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
    loadMesh( player, '../data/player/player.mtl', '../data/player/player.obj' );
    return player;
}

export function instanceGround() {
    const ground = new Box({
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
    ground.receiveShadow = true; // shadows can be casted
    loadMesh( ground, '../data/ground/ground.mtl', '../data/ground/ground.obj' );
    return ground;
}


function loadMesh(object, mtlPath, objPath) {
    const objloader = new OBJLoader();
    const mtlloader = new MTLLoader();

    // loading materials
    mtlloader.load( mtlPath, (materials) => {
        materials.preload();

        // loading geometry
        objloader.setMaterials(materials);
        objloader.load( objPath, (mesh) => {
            mesh.position.y = -0.5;
            // enabling shadow casting for each part of the mesh
            mesh.traverse( function (node) {
                if (node.isMesh)
                    node.castShadow = true;
                    node.receiveShadow = true;
            });
            object.add(mesh);
        });
    });
}

export function loadSkybox( loader ) {
    const texture = loader.load([
        '../data/skybox/pos-x.jpg',
        '../data/skybox/neg-x.jpg',
        '../data/skybox/pos-y.jpg',
        '../data/skybox/neg-y.jpg',
        '../data/skybox/pos-z.jpg',
        '../data/skybox/neg-z.jpg'
    ]);
    return texture;
}

// params for data.GUI
export const params = {
    spotLightEnabled: false,
    mirrorEnabled: false,
    mirrorFollow: false,
};

function toggleSpotlight() {
    params.spotLightEnabled = !params.spotLightEnabled;
}

function toggleMirror() {
    params.mirrorEnabled = !params.mirrorEnabled;
}

function toggleMirrorFollow() {
    params.mirrorFollow = !params.mirrorFollow;
}

export function addDatGui( canvas ) {
    let gui = new dat.gui.GUI( {autoPlace: true});

    gui.add(params, 'spotLightEnabled').name('Toggle spotlight').onChange((v) => {
        toggleSpotlight
    });
    gui.add(params, 'mirrorEnabled').name('Toggle mirror').onChange((v) => {
        toggleMirror
    });
    gui.add(params, 'mirrorFollow').name('Toggle follow').onChange((v) => {
        toggleMirrorFollow
    });
}