/*
Author: Umberto Laghi
E-mail: umberto.laghi@studio.unibo.it
Github: @ubolakes
*/

import * as THREE from 'three'

export class Box extends THREE.Mesh {
    constructor({
        width,
        height,
        depth,
        color = 0x00FF00, // default color
        transparent = false,
        opacity = 1,
        velocity = { // default values
            x: 0,
            y: 0,
            z: 0
        },
        position = {
            x: 0,
            y: 0,
            z: 0
        },
        zAcceleration = false
    }) {
        // calling constructor of extended class
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshPhongMaterial({ color, transparent, opacity})
        );

        // setting properties
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.position.set(position.x, position.y, position.z);

        // computing bottom and top positions
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;
        // right and left positions
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2; 
        // front and back positions
        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;

        // movement parameters
        this.velocity = velocity;
        this.gravity = -0.002; // to be tuned
        this.zAcceleration = zAcceleration;
    }

    // methods
    // computes faces position
    updateSides() {
        // right and left positions
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2; 
        // bottom and top positions
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height /2;
        // front and back positions
        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;
    }

    // comment what it does
    update(ground){
        this.updateSides();

        // accelerate on z axis
        if (this.zAcceleration)
            this.velocity.z += 0.001;

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        // checking if it can jump
        this.canJump = (this.bottom - 0.001).toFixed(2) == ground.top.toFixed(2) ? true : false;

        this.applyGravity(ground);
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity;

        // collision detection w/ground
        if (boxCollision({ box0: this, box1: ground })) {
            const friction = 0.5;
            this.velocity.y *= friction;
            this.velocity.y = -this.velocity.y;
        } else {
            this.position.y += this.velocity.y;
        }
    }
} // Box class

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

export function fallOff({ box0, box1 }) {
    // checking if box0 top is below box1 bottom
    return box0.top < box1.bottom;
}