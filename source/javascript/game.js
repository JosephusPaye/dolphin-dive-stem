// vim: set expandtab ts=4 sts=4 sw=4:
var junkCollide;
/**
 * Preload function
 * 
 * Where we register and load assets including 
 * images and sprite sheets
 */
DD.game.preload = function preload() {
    game.load.image('background', '/assets/images/StaticBackground.png');
    game.load.image('backgroundL1', '/assets/images/Layer1.png');
    game.load.image('backgroundL2', '/assets/images/Layer2.png');
    game.load.image('junk', '/assets/images/plasticBag.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('overnet', '/assets/images/overnet.png');
    game.load.image('undernet', '/assets/images/undernet.png');
    game.load.image('waves', '/assets/images/waves.png');
    game.load.spritesheet('oilspillfront', '/assets/images/GradientOil.png', 1920, 1080);
    game.load.spritesheet('dude', '/assets/images/dolphinsprite.png', 227, 95);

    game.load.audio('junkImpact', '/assets/audio/yey.wav');
};

/**
 * Create function
 * 
 * Where we create and initialize objects
 * for the game
 */
DD.game.create = function create() {
    // Set boundaries of the world
    game.world.setBounds(0, 0, 192000, 1080);

    // Enable the P2 Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    // Add background layers
    DD.textures.layerA = game.add.tileSprite(0, 0, 192000, 1080, 'background');
    DD.textures.layerB = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL1');
    DD.textures.layerC = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL2');

    // Set transparency of background layers
    DD.textures.layerA.alpha = 1;
    DD.textures.layerB.alpha = 0.6;
    DD.textures.layerC.alpha = 1;

    // Enable Physics on background layers
    game.physics.enable(DD.textures.layerA, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerB, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerC, Phaser.Physics.ARCADE);

    // Setup Parallax scrolling on background layers
    DD.textures.layerA.body.velocity.x = DD.player.speed - (3 * DD.textures.speed);
    DD.textures.layerB.body.velocity.x = DD.player.speed - (2 * DD.textures.speed);
    DD.textures.layerC.body.velocity.x = DD.player.speed - (1 * DD.textures.speed);

    // Make background layers immune to collisions
    DD.textures.layerA.body.immovable = true;
    DD.textures.layerB.body.immovable = true;
    DD.textures.layerC.body.immovable = true;

    DD.textures.waves.element = game.add.sprite(0, 0, 'waves');
    game.physics.p2.enable(DD.textures.waves.element);
    DD.textures.sand.element = game.add.sprite(0, 1080, 'waves');
    game.physics.p2.enable(DD.textures.sand.element);
    DD.textures.sand.element.alpha = 0;

    //sound stuff
    junkCollide = game.add.audio('junkImpact');
    junkCollide.allowMultiple = true;

    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dude');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Add oilspill element and enable Physics
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');
    game.physics.p2.enable(DD.objects.spill.element);


    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Player animations
    DD.player.element.animations.add('right', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 20, true);
    DD.player.element.animations.add('collide', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 100, true);

    // Create collision groups
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.waves.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.sand.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.coins.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    // Generate junks and coins
    DD.game.actions.createJunks();
    DD.game.actions.createCoins();


    // Setup collisions
    DD.objects.spill.element.body.setCollisionGroup(DD.objects.spill.collisionGroup);
    DD.player.element.body.setCollisionGroup(DD.player.collisionGroup);
    DD.textures.waves.element.body.setCollisionGroup(DD.textures.waves.collisionGroup);
    DD.textures.sand.element.body.setCollisionGroup(DD.textures.sand.collisionGroup);

    DD.textures.waves.element.body.collides([DD.textures.waves.collisionGroup, DD.player.collisionGroup]);
    DD.textures.sand.element.body.collides([DD.textures.sand.collisionGroup, DD.player.collisionGroup]);
    DD.objects.spill.element.body.collides([DD.objects.spill.collisionGroup, DD.player.collisionGroup]);

    DD.player.element.body.collides(DD.objects.junks.collisionGroup, junkHit, this);
    DD.player.element.body.collides(DD.objects.spill.collisionGroup, DD.game.actions.gameOver, this);
    DD.player.element.body.collides(DD.objects.coins.collisionGroup, collectCoin, this);
    DD.player.element.body.collides(DD.textures.waves.collisionGroup, hitWaves, this);
    DD.player.element.body.collides(DD.textures.sand.collisionGroup, hitSand, this);

    // Setup keyboard controls
    DD.game.cursors = game.input.keyboard.createCursorKeys();

    // Setup camera
    game.camera.follow(DD.player.element);

    // Pause and show Main Menu on first run
    if (DD.game.firstRun) {
        DD.game.firstRun = false;
        game.paused = true;

        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    }
};

/**
 * Update function
 * 
 * The game loop - run once per frame
 */
DD.game.update = function update() {
    if (DD.game.modifiers.boost.active) {
        if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

            DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
            DD.game.modifiers.boost.active = false;

            console.log('Boost End :(');
        }
    }

    DD.textures.waves.element.body.x = game.camera.x;
    DD.textures.waves.element.body.y = 0;
    DD.textures.sand.element.body.x = game.camera.x;
    DD.textures.sand.element.body.y = 1080;

    DD.textures.waves.element.body.angle = 0;
    DD.textures.sand.element.body. angle = 0;

        
    // Governs and controls boost
    if (!DD.game.runEnd) {


        // Sets DD.game.score.lastRun based on the position of the player. the -8 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);
        DisplayData.hud.progressBar.spill.width(((DD.objects.spill.element.x / 400) - 8)*(2.5));
        DisplayData.hud.progressBar.dolphin.css("margin-left", (((((DD.player.element.x / 400) - 8) - (DD.objects.spill.element.x / 400) - 8))*(2.5) + 28));
        DisplayData.hud.progressBar.dolphin.css("margin-top", (DD.player.element.y / 27));


        // Update the player velocity and play animation
        DD.player.element.body.velocity.x = DD.player.speed + (50 * DD.game.world.level) + DD.game.modifiers.total;
        if (DD.objects.junks.active !== true) {
            DD.player.element.animations.play('right');
        }

        // Update the oilspill velocity
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed + (50 * DD.game.world.level);

    } else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice
        DD.objects.spill.element.body.velocity.x = 0;
        DD.player.element.body.velocity.x = 0;
    }

    // Reset the player's velocity (movement)
    if (DD.player.accelerationActive === false) {
        DD.player.element.body.velocity.y = 0;
    }

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level) ) {
        console.log('Level (speed) up!');

        DD.game.world.level += 1;
    }

    if (DD.game.cursors.right.isDown) {
        if (DD.game.modifiers.boost.charges > 0) {
            DD.game.modifiers.boost.charges += -1;

            DD.game.modifiers.total += DD.game.modifiers.boost.total;

            DD.game.modifiers.boost.active = true;
            DD.game.modifiers.boost.begin = DD.player.element.x;

            console.log('BOOST!');
        } else {
            console.log('No charges left');
        }
    }

    if (DD.game.cursors.up.isDown || DD.game.touch.isTouchingUp()) {
        
        if (DD.player.accelerationActive === false) {
            DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
            DD.player.element.body.angle = -1 * DD.player.angle;
        }
        else {
            DD.player.element.body.angle = 0;
        }

    } else if (DD.game.cursors.down.isDown || DD.game.touch.isTouchingDown()) {

        if (DD.player.accelerationActive === false) {
            DD.player.element.body.angle = DD.player.angle;
            DD.player.element.body.velocity.y = DD.player.vertSpeed;
        }
        else {
            DD.player.element.body.angle = 0;
        }

    } else {
        DD.player.element.body.angle = 0;
    }
};

/**
 * Render function
 */
DD.game.render = function render() {

    game.debug.body(DD.textures.waves.element);
    game.debug.body(DD.player.element);

    // Update score
    if (DD.game.score.lastFrameValue.score !== DD.game.score.lastRun) {
        DisplayData.hud.score.text(DD.game.score.lastRun);
        DD.game.score.lastFrameValue.score = DD.game.score.lastRun;
    }

    // Update coins
    if (DD.game.score.lastFrameValue.coins !== DD.game.score.coins.lastRun) {
        DisplayData.hud.coins.text(DD.game.score.coins.lastRun);
        DD.game.score.lastFrameValue.coins = DD.game.score.coins.lastRun;
    }
    // game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
};

/**
 * Handle player collision with junk
 */
function junkHit() {
    console.log('Junk hit!');
    //sound stuff
    DD.player.element.animations.play('collide');
    junkCollide.play();
    if (DD.objects.junks.active !== true) {
        DD.player.speed = DD.player.speed * DD.objects.junks.slow;
        DD.objects.junks.active = true;
        setTimeout(regainSpeed, 3000);
    }  
}

/**
 * Increase player speed after
 * collision with junk
 */
function regainSpeed() {
    console.log('Regaining speed!');

    DD.player.speed = DD.player.speed / DD.objects.junks.slow;
    DD.objects.junks.active = false;
}

/**
 * Handle player collision with coin
 * @param  {Game.sprite} player
 * @param  {Game.sprite} coin
 */
function collectCoin(player, coin) {
    console.log('Coin collected');

    coin.body = null;
    coin.sprite.kill();

    if (DD.objects.coins.collectedIds.indexOf(coin.data.id) === -1) {
        DD.game.score.coins.lastRun += 1;
        DD.objects.coins.collectedIds.push(coin.data.id);
    }

    // Additionally have to add code which will remove the object from the game
}

function hitWaves() {
    console.log('waves have been hit');
    DD.player.element.body.gravity.y = 1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

function stopAcceleration() {
    DD.player.element.body.gravity.y = 0;
    console.log('stopAcceleration');
    DD.player.accelerationActive = false;
}

function hitSand() {
    console.log('sand has been hit');
    DD.player.element.body.gravity.y = -1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

// Everything is declared: initialize game
DD.game.actions.start();
