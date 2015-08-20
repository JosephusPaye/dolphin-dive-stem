// vim: set expandtab ts=4 sts=4 sw=4:

// Restore persisted values from local storage
DD.game.actions.restoreSavedValues();

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
    game.load.image('bag', '/assets/images/bag.png');
    game.load.image('starfish', '/assets/images/starfish.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/oilback.png');
    game.load.spritesheet('dolphin', '/assets/images/new-dolphin.png', 245, 103);
    game.load.image('junk', '/assets/images/plasticBag.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('overnet', '/assets/images/overnet.png');
    game.load.image('undernet', '/assets/images/undernet.png');
    game.load.image('waves', '/assets/images/waves.png');
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

    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dolphin');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Add oilspill element and enable Physics
    DD.objects.spill.element = game.add.sprite(1600, 0, 'oilspill');
    game.physics.p2.enable(DD.objects.spill.element);

    // Waves
    DD.textures.waves.element = game.add.sprite(0, 0, 'waves');
    game.physics.p2.enable(DD.textures.waves.element);

    // Sand
    DD.textures.sand.element = game.add.sprite(0, 1080, 'waves');
    game.physics.p2.enable(DD.textures.sand.element);
    DD.textures.sand.element.alpha = 0;

    // Sound stuff
    DD.game.audio.junkCollide = game.add.audio('junkImpact');
    DD.game.audio.junkCollide.allowMultiple = true;

    // Player animations
    DD.player.element.animations.add('right', [0, 1, 2, 3, 4], 10, true);
    // DD.player.element.animations.add('collide', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 100, true);

    // Create collision groups
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.waves.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.sand.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.starfish.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    // Generate junks and starfishes
    DD.game.actions.createJunks();
    DD.game.actions.createStarfish();

    // Setup collisions
    DD.objects.spill.element.body.setCollisionGroup(DD.objects.spill.collisionGroup);
    DD.player.element.body.setCollisionGroup(DD.player.collisionGroup);
    DD.textures.waves.element.body.setCollisionGroup(DD.textures.waves.collisionGroup);
    DD.textures.sand.element.body.setCollisionGroup(DD.textures.sand.collisionGroup);

    DD.textures.waves.element.body.collides([DD.textures.waves.collisionGroup, DD.player.collisionGroup]);
    DD.textures.sand.element.body.collides([DD.textures.sand.collisionGroup, DD.player.collisionGroup]);
    // DD.objects.spill.element.body.collides([DD.objects.spill.collisionGroup, DD.player.collisionGroup]);

    DD.player.element.body.collides(DD.objects.junks.collisionGroup, junkHit, this);
    DD.player.element.body.collides(DD.objects.spill.collisionGroup, DD.game.actions.gameOver, this);
    DD.player.element.body.collides(DD.objects.starfish.collisionGroup, collectStarfish, this);
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
    // Check for game over
    if ( DD.game.actions.dolphinIsCovered() ) {
        DD.game.actions.gameOver();
        DD.player.element.body.velocity.x = 0;

        if ( DD.objects.spill.element.x >= (game.camera.x + 500)) {
            DD.objects.spill.element.body.velocity.x = 0;
        }
    }

    if (DD.game.modifiers.boost.active) {
        if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

            DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
            DD.game.modifiers.boost.active = false;

            console.log('Boost End :(');
        }
    }

    DD.textures.waves.element.body.x = game.camera.x;
    DD.textures.waves.element.body.y = 25;
    DD.textures.sand.element.body.x = game.camera.x;
    DD.textures.sand.element.body.y = 1080;

    DD.textures.waves.element.body.angle = 0;
    DD.textures.sand.element.body. angle = 0;


    // Governs and controls boost
    if (!DD.game.runEnd) {

        // Sets DD.game.score.lastRun based on the position of the player. the -8 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Minimap: update progress bar
        DisplayData.hud.progressBar.spill.width( (DD.objects.spill.element.x * 500 ) / 192000 );

        // Minimap: update dolphin x
        DisplayData.hud.progressBar.dolphin.css(
            'left', ( (DD.player.element.x * 492 ) / 192000 )
        );

        // Minimap: Update dolphin y
        DisplayData.hud.progressBar.dolphin.css(
            'top', ( (DD.player.element.y * 20) / 1080 )
        );

        // Update the player velocity and play animation
        DD.player.element.body.velocity.x = DD.player.speed + (30 * DD.game.world.level) + DD.game.modifiers.total;

        // Update the oilspill velocity
        DD.objects.spill.element.body.velocity.x = 350;

        if (DD.objects.junks.active !== true) {
            DD.player.element.animations.play('right');
        }

    }

    // Reset the player's velocity (movement)
    if (!DD.player.accelerationActive) {
        DD.player.element.body.velocity.y = 0;
    }

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level)) {
        if (DD.game.world.level < 19) {
            DD.game.world.level += 1;
            console.log('Level (speed) up!');
        }
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
        if (!DD.player.accelerationActive) {
            DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
            DD.player.element.body.angle = -1 * DD.player.angle;
        } else {
            DD.player.element.body.angle = 0;
        }
    } else if (DD.game.cursors.down.isDown || DD.game.touch.isTouchingDown()) {
        if (!DD.player.accelerationActive) {
            DD.player.element.body.angle = DD.player.angle;
            DD.player.element.body.velocity.y = DD.player.vertSpeed;
        } else {
            DD.player.element.body.angle = 0;
        }
    } else {
        DD.player.element.body.angle = 0;
    }
};

/*
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

    // Update starfish
    if (DD.game.score.lastFrameValue.starfish !== DD.game.score.starfish.lastRun) {
        DisplayData.hud.starfish.text(DD.game.score.starfish.lastRun);
        DD.game.score.lastFrameValue.starfish = DD.game.score.starfish.lastRun;
    }

    // game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
};

/**
 * Handle player collision with junk
 */
// function junkHit() {
//     console.log('Junk hit!');

//     // Sound stuff
//     DD.player.element.animations.play('collide');
//     DD.game.audio.junkCollide.play();

//     if (!DD.objects.junks.active) {
//         DD.player.speed = DD.player.speed * DD.objects.junks.slow;
//         DD.objects.junks.active = true;
//         setTimeout(regainSpeed, 3000);
//     }  
// }

/*
 * Increase player speed after
 * collision with junk
 */
function junkHit() {
    // The speed that the player should be travelling at is stored, 
    // otherwise the function below will slow down rather than speed up.
    var originalSpeed = DD.player.speed;

    // Setting a slow speed straight away so it doesn't feel laggy
    DD.player.speed = originalSpeed * DD.objects.junks.slow;

    // setInterval means that I can perform this over some time 
    // and gradually without using Phasers stupid time function.
    // Time on the second argument is in milliseconds. 
    var speedUp = setInterval(function() {
        if (DD.objects.junks.slow <= 1) {
            console.log(DD.objects.junks.slow);
            
            // This is where originalSpeed is used to provide 
            // a gradual speed up that feels a little more natural.
            DD.player.speed = originalSpeed * DD.objects.junks.slow;
            
            // Every second the dolphin gets 10% closer to full speed.
            DD.objects.junks.slow += 0.1;
        } else { // Detecting when the maximum speed is reached, so the function can end.
            // End the interval that is causing the change in dolphin speed.
            clearInterval(speedUp);
        }
    }, 1000);

    // Resetting the slowing effect after the normal speed is reached again.
    DD.objects.junks.slow = 0.4;

    /*
     * DD.player.speed = DD.player.speed / DD.objects.junks.slow;
     * DD.objects.junks.active = false;
     */
}

/*
 * Handle player collision with starfish
 * @param  {Game.sprite} player
 * @param  {Game.sprite} starfish
 */
function collectStarfish(player, starfish) {
    starfish.body = null;
    starfish.sprite.kill();

    if (DD.objects.starfish.collectedIds.indexOf(starfish.data.id) === -1) {
        DD.game.score.starfish.lastRun += 1;
        DD.objects.starfish.collectedIds.push(starfish.data.id);
    }

    // Additionally have to add code which will remove the object from the game
}

function hitWaves() {
    console.log('Wave hit');

    DD.player.element.body.gravity.y = 1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

function stopAcceleration() {
    DD.player.element.body.gravity.y = 0;
    console.log('Stop Acceleration');
    DD.player.accelerationActive = false;
}

function hitSand() {
    console.log('Sand has been hit');
    DD.player.element.body.gravity.y = -1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

// Everything is declared: initialize game
DD.game.actions.start();
