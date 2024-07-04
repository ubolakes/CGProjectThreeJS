/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

/* this file contains utility methods used by other functions */

import { Box } from '../scene/box.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export function loadMesh(object, mtlPath, objPath) {
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
                if (node.isMesh) // all mesh
                    node.castShadow = true;
                if (objPath.includes("ground")) // ground mesh only
                    node.receiveShadow = true;

            });
            object.add(mesh);
        });
    });
}

// Box class support functions
// determines if a Box collides with another
export function boxCollision({ box0, box1 }) {
    // checking if box0 is within the box1 boundaries
    const xCollision = 
        box0.right >= box1.left && box0.left <= box1.right;

    const yCollision = 
        box0.bottom + box0.velocity.y <= box1.top && box0.top >= box1.bottom;
    
    const zCollision = 
        box0.front >= box1.back && box0.back <= box1.front;
    
    return xCollision && yCollision && zCollision;
}

// determines if the player has fallen of the ground
export function fallOff({ box0, box1 }) {
    // checking if box0 top is below box1 bottom
    return box0.top < box1.bottom;
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
    let gui = new dat.gui.GUI( {autoPlace: false});

    gui.add(params, 'spotLightEnabled').name('Toggle spotlight').onChange((v) => {
        toggleSpotlight
    });
    gui.add(params, 'mirrorEnabled').name('Toggle mirror').onChange((v) => {
        toggleMirror
    });
    gui.add(params, 'mirrorFollow').name('Toggle follow').onChange((v) => {
        toggleMirrorFollow
    });

    // adding dat.GUI to the HTML
    document.getElementById("gui").append(gui.domElement);
}