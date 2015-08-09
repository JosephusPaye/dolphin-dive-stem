// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DolphinDive object
 * 
 * Contains game properties like current version
 */
var DolphinDive = {
    version: '0.1.0'
};

// Just a friendly reminder
console.info('Dolphin Dive v' + DolphinDive.version);
$('#versionTag').html(DolphinDive.version);

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

var player;
var cursors;
var speed = 300;
var firstRun = true;
var gamePauseButton;

var spill ;
var oilSpill;
var spillFront;
var point;
var deathAlert;
var obstacles;
var junkMaker;
var angle;
var angleCompensation;
var result;
var level = 1;
var x = 2000;

/**
 * Preload function
 * 
 * Where we register and load assets including 
 * images and sprite sheets
 */
function preload() {
    game.load.image('background', '/assets/images/BackgroundStatic.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('oilspillfront', '/assets/images/GradientOil.png');
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);
}

/**
 * Create function
 * 
 * Where we create and initialize objects
 * for the game
 */
function create() {
    // Enable the P2 Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    // Add background
    game.add.tileSprite(0, 0, 192000, 1080, 'background');
    game.add.tileSprite(0, 0, 192000, 1080, 'seafloor');

    // Set boundaries of the world
    game.world.setBounds(0, 0, 192000, 1080);

    // Add oilspill group
    oilSpill = game.add.group();
    oilSpill.enableBody = true;

    // Add oilspill elements
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');

    // Add player
    player = game.add.sprite(20, game.world.centerY, 'dude');
    player.scale.setTo(0.4, 0.4);

    // Add star
    point = game.add.sprite(20, game.world.centerY, 'star');

    // Enable physics on the objects
    game.physics.p2.enable(player);
    game.physics.p2.enable(spill);

    // Player physics properties. Add bounce to player
    // player.body.collideWorldBounds = true;

    // Animations: walking left and right
    player.animations.add('left', [0, 1, 2], 6, true);
    player.animations.add('right', [4, 3, 5], 6, true);

    // junkMaker = game.add.emitter(1, 1, 5000);
    // junkMaker.area = new Phaser.Rectangle(game.camera.x, 1, 10, 1080);
    // junkMaker.enableBody = true;
    // junkMaker.frequency = 1000;
    // junkMaker.maxRotation = 20;
    // junkMaker.minRotation = 20;
    // junkMaker.lifespan = 10000000;
    // junkMaker.makeParticles('star');
    // junkMaker.bounce.setTo(0.5, 0.5);
    // junkMaker.gravity = 0;
    // junkMaker.on = true;
    
    var playerCollisionGroup = game.physics.p2.createCollisionGroup();
    var junkCollisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    var junks = game.add.group();
    junks.enableBody = true;
    junks.physicsBodyType = Phaser.Physics.P2JS;

    // Create a thousand junk objects
    for (var i = 0; i < 1000; i++) {
        var junk = junks.create(game.world.randomX, game.world.randomY, 'star');
        junk.body.setRectangle(24, 22);

        // Tell the junk to use the junkCollisionGroup 
        junk.body.setCollisionGroup(junkCollisionGroup);

        // junks will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        junk.body.collides([junkCollisionGroup, playerCollisionGroup]);
    }

    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(junkCollisionGroup, gameOver, this);

    // The controls
    cursors = game.input.keyboard.createCursorKeys();

    // Setup camera
    game.camera.follow(player);

    // Pause and show Main Menu on first run
    if (firstRun) {
        game.paused = true;
        firstRun = false;
        mainMenu();
    }
}

/**
 * Update function
 * 
 * The game loop - run once per frame
 */
function update() {
    // junkMaker.x = game.camera.x  + 850;

    // Collisions
    // player.body.onBeginContact.add(gameOver, this)
    // game.physics.arcade.collide(player, junkMaker);
    // game.physics.arcade.overlap(player, spill, gameOver, null, this);

    // Reset the players velocity (movement)
    spill.body.velocity.x = speed - 200;
    spillFront.body.velocity.x = speed - 200;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    angle = 45;

    if (player.body.x >= (x * level) ) {
        console.log('speed up!');

        speed += 50;
        level += 1;
    }
    
    if (cursors.left.isDown) {
        player.body.velocity.x = -1 * speed;
        player.animations.play('left');
        angleCompensation = true;
    } else if (cursors.right.isDown) {
        player.body.velocity.x = speed;
        player.animations.play('right');
        angleCompensation = false;
    } else {
        player.body.velocity.x = 0;
    }

    if (cursors.up.isDown) {
        if (angleCompensation === false) {
            angle = angle * -1;
        }

        player.body.angle = angle;
        player.body.velocity.y = -1 * 300;
    } else if (cursors.down.isDown) {
        if (angleCompensation === true){
            angle = angle * -1;
        }

        player.body.angle = angle;
        player.body.velocity.y = 300;
    } else {
        player.body.angle = 0;
    }

    if (cursors.down.isDown && cursors.right.isDown) {
        player.body.velocity.y = 300;
        player.body.velocity.x = speed;
        player.body.angle = 45;
        player.animations.play('right');
        angleCompensation = false;
    } else if(cursors.down.isDown && cursors.left.isDown) {
        player.body.velocity.y = 300;
        player.body.velocity.x = -1 * speed;
        player.body.angle = -45;
        player.animations.play('left');
        angleCompensation = false;
    } else if(cursors.up.isDown && cursors.right.isDown) {
        player.body.velocity.y = -300;
        player.body.velocity.x = speed;
        player.body.angle = -45;
        player.animations.play('right');
        angleCompensation = false;
    } else if(cursors.up.isDown && cursors.left.isDown) {
        player.body.velocity.y = -300;
        player.body.velocity.x = -speed;
        player.body.angle = 45;
        player.animations.play('left');
        angleCompensation = true;
    }

    // if (game.physics.arcade.collide(player, junkMaker) === true) {
    //     deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    // }
}

/**
 * Pause activation
 * 
 * On the event where the player clicks the button change 
 * the game state to paused.
 */
$('#pauseButton').click(function() {
    // This will activate Phaser's pause function, where some magic should happen.
    game.paused = !game.paused;

    // Activate the pause menu
    pauseMenu();
});

/**
 * Pause Menu
 *
 * Shows Pause Menu and handles resume, restart
 * and quit
 */
function pauseMenu() {
    var pauseMenu = $('#pauseMenu');
    var pauseButton = $('#pauseButton');

    if (game.paused) {
        pauseMenu.removeClass('hidden');
        pauseButton.addClass('hidden');

        // Return to Main Menu
        $('#mainMenuButton').click(function() {
            // Do score calculations
            
            pauseMenu.addClass('hidden');
            pauseButton.removeClass('hidden');

            firstRun = true;
            create();
        });

        // Resume button handler
        $('#resumeButton').click(function() {
            pauseMenu.addClass('hidden');
            pauseButton.removeClass('hidden');

            game.paused = false;
        });

        // Reset the game, with the same principle
        $('#restartButton').click(function() {
            // Score calc

            pauseMenu.addClass('hidden');
            pauseButton.removeClass('hidden');

            create();
            game.paused = false;
        });
    } else {
        pauseMenu.addClass('hidden');
        pauseButton.removeClass('hidden');
    }
}

/**
 * Main Menu
 *
 * Shows Main Menu and handles start, highscores
 * and about
 */
function mainMenu() {
    // Show the main menu
    $('#mainMenu').removeClass('hidden');
    $('#pauseButton').addClass('hidden');

    // Setup main menu button
    $('#beginButton').click(function() {
        game.paused = false;

        $('#mainMenu').addClass('hidden');
        $('#pauseButton').removeClass('hidden');
    });

    // Handle Highscores button click
    $('#highScoresButton').click(function() {
        $('#mainMenu').addClass('hidden');

        // Score array changes elements before display here
        $('#scoreMenu').removeClass('hidden');

        $('#scoreReturnButton').click(function() {
            $('#scoreMenu').addClass('hidden');
            mainMenu();
        });
    });

    // Handle About button click
    $('#aboutButton').click(function() {
        $('#mainMenu').addClass('hidden');

        // Score array changes elements before display here
        $('#aboutMenu').removeClass('hidden');

        $('#aboutReturnButton').click(function() {
            $('#aboutMenu').addClass('hidden');
            mainMenu();
        });
    });
}

/**
 * Handle game over
 * 
 * Display score and such...
 */
function gameOver(body, shapeA, shapeB, equation) {
    result = 'Game Over!';
}

/**
 * Render function
 */
function render() {
    // player.body.debug = true;
    game.debug.text(result, 32, 32);
}
