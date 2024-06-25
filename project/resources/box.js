import * as THREE from 'three'

export class Box extends THREE.Mesh {
    constructor({
        width,
        height,
        depth,
        color = 0x00FF00, // default color
        velocity = { // default values
            x: 0,
            y: 0,
            z: 0
        },
        position = {
            x: 0,
            y: 0,
            z: 0
        }
    }) {
        // calling constructor of extended class
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshPhongMaterial({color})
        );

        // setting properties
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.position.set(position.x, position.y, position.z);

        // computing bottom and top positions
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;

        // movement parameters
        this.velocity = velocity;
        this.gravity = -0.002; // to be tuned
    }

    // methods
    updateSides() {
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height /2;
    }

    // comment what it does
    update(ground){
        this.updateSides();

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

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

function boxCollision({ box0, box1 }) {
    const yCollision = 
        box0.bottom + box0.velocity.y <= box1.top && box0.top >= box1.bottom;

    return yCollision;
}