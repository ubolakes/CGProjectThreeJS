/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

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