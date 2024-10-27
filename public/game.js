/*global Phaser*/
class Player {
    constructor(scene, x, y) {
        this.alive = true;
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.anims.play('player_idle');
        this.sprite.setBounce(0.0);
        this.sprite.setCollideWorldBounds(true);
        /*this.sprite.displayWidth = blocksize;
        this.sprite.displayHeight = blocksize;*/
        this.sprite.setScale(2); // Scale up by 2
        // Adjust the body size to maintain the original 16x16 hitbox
        this.sprite.body.setSize(16, 16);
    }

    jump(strength) {
        if (this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-400 * strength);
        }
    }

    resetPosition() {
        this.sprite.setX(16);
        this.sprite.setY(450);
    }
    resetVelocity() {
        this.sprite.body.setVelocityX(0);//player.sprite.body.velocity.y = 0;
        this.sprite.body.setVelocityY(0);
    }
    disableMovement() {
        // Disable WASD keys
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.D);
        // Disable arrow keys
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    enableMovement() {
        // Enable WASD keys
        this.scene.wasd = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        // Enable arrow keys
        this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
    }
}

class Block {
    constructor(scene, x, y, type) {
        this.sprite = scene.physics.add.staticSprite(x, y, type);
        this.sprite.setScale(1);
        this.type = type;
    }
}

const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
            bounds: { x: 0, y: 0, width: 512, height: 512 } 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
let player;
let blocksize = 32;
let isTouchingLeft;
let isTouchingRight;
let isTouchingUp;
let chunkIndex = 0;
let flagCollider;

function preload() {
    this.load.spritesheet('player', './sprites/Knight.png', { frameWidth: 48, frameHeight: 48 });
    this.load.image('platform', './sprites/platform_tile.png');
    this.load.image('sky', './sprites/sky_tile.png');
    this.load.spritesheet('boing', './sprites/boing_sheet.png', { frameWidth: blocksize, frameHeight: blocksize });
    this.load.spritesheet('fire', './sprites/fire_sheet.png', { frameWidth: blocksize, frameHeight: blocksize });
    this.load.spritesheet('flag', './sprites/flag_sheet.png', { frameWidth: blocksize, frameHeight: blocksize });
    this.load.text('map', './map/chunk(0).txt');
}

function create() {

    //loads animation
    this.anims.create({
        key: 'slime',
        frames: this.anims.generateFrameNumbers('boing', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'fire',
        frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player_run',
        frames: this.anims.generateFrameNumbers('player', { start: 24, end: 27 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player_death',
        frames: this.anims.generateFrameNumbers('player', { start: 80, end: 83 }),
        frameRate: 3,
        repeat: 0
    });
    this.anims.create({
        key: 'player_fall',
        frames: this.anims.generateFrameNumbers('player', { start: 64, end: 67 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'flag-gif',
        frames: this.anims.generateFrameNumbers('flag', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    //loads chunk
    load_chunk(this);

    // Set cursors and wasd as scene attributes
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Touch controls
    // touchstart,touchend
    // mousedown,mouseup
    document.getElementById('left-button').addEventListener('touchstart', () => {
        isTouchingLeft = true;
    });

    document.getElementById('left-button').addEventListener('touchend', () => {
        isTouchingLeft = false;
    });

    document.getElementById('right-button').addEventListener('touchstart', () => {
        isTouchingRight = true;
    });

    document.getElementById('right-button').addEventListener('touchend', () => {
        isTouchingRight = false;
    });

    document.getElementById('up-button').addEventListener('touchstart', () => {
        isTouchingUp = true;
    });

    document.getElementById('up-button').addEventListener('touchend', () => {
        isTouchingUp = false;
    });

    //you can move touching the screen
    this.input.on('pointerdown', (pointer) => {
        const blockSize = blocksize;
        const numBlocks = 16;

        // Calculate the block coordinates based on the pointer position
        const blockColumn = Math.floor(pointer.x / blockSize);
        const blockRow = Math.floor(pointer.y/ blockSize);

        // Calculate the block number within the grid
        
        const blockNumber = blockRow * numBlocks + blockColumn;

        console.log(blockNumber);
    });
}

isTouchingLeft = false;
isTouchingRight = false;
isTouchingUp = false;
let canMove= false;

function update() {
    // Reset horizontal velocity
    player.sprite.setVelocityX(0);

    // Check if the player is touching the ground
    const isGrounded = player.sprite.body.touching.down;

    // Check if the player is alive
    if (player.alive) {
        // Allow movement if the player has touched the ground before or is currently grounded
        if (canMove || isGrounded) {
            // Horizontal movement controls
            if (this.cursors.left.isDown || this.wasd.left.isDown || isTouchingLeft) {
                player.sprite.setVelocityX(-250);
                player.sprite.setFlipX(true); // Flip the sprite when moving left
                player.sprite.anims.play('player_run', true); // Play the run animation
            } else if (this.cursors.right.isDown || this.wasd.right.isDown || isTouchingRight) {
                player.sprite.setVelocityX(250);
                player.sprite.setFlipX(false); // Unflip the sprite when moving right
                player.sprite.anims.play('player_run', true); // Play the run animation
            } else if (isGrounded) {
                // If not moving left or right and on the ground, play the idle animation
                player.sprite.anims.play('player_idle', true);
            } else {
                player.sprite.anims.play('player_fall', true); // Play falling animation
            }

            // Jumping logic
            if (this.cursors.up.isDown || this.wasd.up.isDown || isTouchingUp) {
                player.jump(1);
            }
        }

        // Update hasTouchedGround if the player touches the ground
        if (isGrounded) {
            canMove = true; // Allow movement after first ground touch
        }
    } else {
        player.sprite.setVelocityY(0); // Prevent falling velocity if dead
    }
}


function die(player, scene) {
    isTouchingLeft = false;
    isTouchingRight = false;
    isTouchingUp = false;
    if (player.alive) {
        player.sprite.body.allowGravity = false;
        player.alive = false;

        // Disable player movement
        player.disableMovement();

        // Play the death animation
        player.sprite.anims.play('player_death', true);

        // Wait for the death animation to finish
        scene.time.delayedCall(666, () => {
            // Respawn the player
            player.resetPosition();

            // Re-enable player movement
            player.enableMovement();
            player.alive = true;
            player.sprite.body.allowGravity = true;
        });
    }
}

function next_chunk(player, scene) {
    // Set the player's position to the next chunk start point
    canMove = false;
    player.disableMovement();
    player.resetVelocity();
    player.sprite.setX(16);
    player.sprite.setY(450);
    // Load the next chunk
    ++chunkIndex;
    if(chunkIndex == 2)
        window.location.href = 'demo-ended.html';
    scene.physics.world.removeCollider(flagCollider);
    load_next_chunk(scene, () => {
        console.log("Chunk Index: " + chunkIndex);
    });
    canMove = true;
}

function jump_boing(player, boing) {
    //console.log(`Velocity before boost - X: ${player.body.velocity.x}, Y: ${player.body.velocity.y}`);
        player.setVelocityY(-400 * 1.2); // Apply the jump boost
    //console.log(`Velocity after boost - X: ${player.body.velocity.x}, Y: ${player.body.velocity.y}`);
}

function load_chunk(scene) {
    let mapText = scene.cache.text.get('map');
    let mapData = mapText.split('\n').map(row => row.replace(/[/[\],'\r]/g, '').split(' '));

    let platform = scene.physics.add.staticGroup();
    for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
            new Block(scene, (c * blocksize) + 16, (r * blocksize) + 16, 'sky');
        }
    }

    player = new Player(scene, 16, 450);

    for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
            const tile = mapData[row][col];
            const x = col * blocksize + 16;
            const y = row * blocksize + 16;
            if (tile === 'p') {
                platform.create(x, y, 'platform').refreshBody();
                scene.physics.add.collider(player.sprite, platform);
            } else if (tile === 'F') {
                let fire = new Block(scene, x, y, 'fire');
                // eslint-disable-next-line no-loop-func
                scene.physics.add.collider(player.sprite, fire.sprite, () => die(player, scene), null, scene);
                fire.sprite.anims.play('fire');
            } else if (tile === 'E') {
                let flag = new Block(scene, x, y, 'flag');
                // eslint-disable-next-line no-loop-func
                flagCollider = scene.physics.add.collider(player.sprite, flag.sprite, () => next_chunk(player, scene), null, scene);
                flag.sprite.anims.play('flag-gif');
                flag.sprite.setDisplayOrigin(5, 16);
            } else if (tile === 'J') {
                let boing = new Block(scene, x, y, 'boing');
                scene.physics.add.collider(player.sprite, boing.sprite, jump_boing, null, scene);
                boing.sprite.anims.play('slime');
            }
        }
    }
}

function load_next_chunk(scene, callback) {
    // Ensure the previous text is removed before loading the next chunk
    scene.cache.text.remove('map');
    scene.load.text('map', './map/chunk(' + chunkIndex + ').txt');
    scene.load.once('complete', () => {
        load_chunk(scene);
        if (callback) callback();
    });
    scene.load.start();
    player.enableMovement();
}
