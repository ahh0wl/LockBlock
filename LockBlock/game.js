class Player {
    constructor(scene, x, y) {
        this.alive = true;
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.anims.play('player_idle');
        this.sprite.setBounce(0.0);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.displayWidth = 16;
        this.sprite.displayHeight = 16;
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

const game = new Phaser.Game(config);
let player;
let isTouchingLeft = false;
let isTouchingRight = false;
let isTouchingUp = false;

function preload() {
    this.load.spritesheet('player', './sprites/Knight.png', { frameWidth: 48, frameHeight: 48 });
    this.load.image('platform', './sprites/platform_tile.png');
    this.load.image('sky', './sprites/sky_tile.png');
    this.load.spritesheet('boing', './sprites/boing_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fire', './sprites/fire_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('flag', './sprites/flag_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.text('map', 'map.txt');
}

function create() {
    const mapText = this.cache.text.get('map');
    mapData = mapText.split('\n').map(row => row.replace(/[\[\],'\r]/g, '').split(' '));

    platform = this.physics.add.staticGroup();
    for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
            new Block(this, (c * 32) + 16, (r * 32) + 16, 'sky');
        }
    }

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

    player = new Player(this, 16, 450);

    for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
            const tile = mapData[row][col];
            const x = col * 32 + 16;
            const y = row * 32 + 16;
            if (tile === 'p') {
                platform.create(x, y, 'platform').refreshBody();
                this.physics.add.collider(player.sprite, platform);
            } else if (tile === 'F') {
                fire = new Block(this, x, y, 'fire');
                this.physics.add.collider(player.sprite, fire.sprite, () => die(player, this), null, this);
                fire.sprite.anims.play('fire');
            } else if (tile === 'E') {
                flag = new Block(this, x, y, 'flag');
                this.physics.add.collider(player.sprite, flag.sprite, next_chunk, null, this);
                flag.sprite.anims.play('flag-gif');
                flag.sprite.setDisplayOrigin(5, 16);
            } else if (tile === 'J') {
                boing = new Block(this, x, y, 'boing');
                this.physics.add.collider(player.sprite, boing.sprite, jump_boing, null, this);
                boing.sprite.anims.play('slime');
            }
        }
    }

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
        if (pointer.x < game.config.width / 3) {
            isTouchingLeft = true;
        } else if (pointer.x > (game.config.width / 3) * 2) {
            isTouchingRight = true;
        } else {
            isTouchingUp = true;
        }
    });

    this.input.on('pointerup', (pointer) => {
        if (pointer.x < game.config.width / 3) {
            isTouchingLeft = false;
        } else if (pointer.x > (game.config.width / 3) * 2) {
            isTouchingRight = false;
        } else {
            isTouchingUp = false;
        }
    });
}

function update() {
    player.sprite.setVelocityX(0);
    if (player.alive) {
        if (this.cursors.left.isDown || this.wasd.left.isDown || isTouchingLeft) {
            player.sprite.setVelocityX(-250);
            player.sprite.setFlipX(true); // Flip the sprite when moving left
            player.sprite.anims.play('player_run', true); // Play the run animation
        } else if (this.cursors.right.isDown || this.wasd.right.isDown || isTouchingRight) {
            player.sprite.setVelocityX(250);
            player.sprite.setFlipX(false); // Unflip the sprite when moving right
            player.sprite.anims.play('player_run', true); // Play the run animation
        } else if (player.sprite.body.touching.down){
            // If not moving left or right, play the idle animation
            player.sprite.anims.play('player_idle', true);
        } else {
            player.sprite.anims.play('player_fall', true);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown || isTouchingUp) {
            player.jump(1);
        }
    } else {
        player.sprite.setVelocityY(0);
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

function next_chunk(player_sprite, flag) {
    player_sprite.setX(16);
    player_sprite.setY(450);
}

function jump_boing(player, boing) {
    player.setVelocityY(-400 * 1.2);
}
