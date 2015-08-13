// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DD object
 * 
 * Contains game properties like current version
 */
var DD = {
    version: '0.1.0',

    objects: {
        spill: {
            speed: 250,
            element: null,
            collisionGroup: null,
            gradient: {
                element: null
            }
        },

        coins: {
            amount: (Math.random() * 50) + 50,
            elements: [],
            collectedIds: [],
            collisionGroup: null
        },

        junks: {
            amount: 1000,
            elements: [],
            slow: 0.6,
            collisionGroup: null,
            active: false
        },
    },

    textures: {
        layerA: null,
        layerB: null,
        layerC: null,
        speed: 50
    },

    player: {
        speed: 300,
        vertSpeed: 300,
        element: null,
        collisionGroup: null,
        angle: 20
    },

    game: {
        firstRun: true,
        runEnd: false,
        cursors: null,

        world: {
            level: 1,
            interval: 2000
        },

        score: {
            coins: {
                lastRun: 0,
                total: 0
            },

            lastRun: 0,
            highScores: []
        },

        modifiers: {
            total: 0,
            active: true,

            boost: {
                active: false,
                total: 0,
                begin: 0,
                charges: 0,
            },

            multiplier: 1
        }
    }
};

// Copy defaults for reset
var DDBluepint = jQuery.extend(true, {}, DD);

// Just a friendly reminder
console.info('Dolphin Dive v' + DD.version);
$('#versionTag').html(DD.version);

// Initialize game variable
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

/**
 * Preload function
 * 
 * Where we register and load assets including 
 * images and sprite sheets
 */
function preload() {
    game.load.image('background', '/assets/images/StaticBackground.png');
    game.load.image('backgroundL1', '/assets/images/Layer1.png');
    game.load.image('backgroundL2', '/assets/images/Layer2.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.spritesheet('oilspillfront', '/assets/images/GradientOil.png', 1920, 1080);
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);
}

/**
 * Create function
 * 
 * Where we create and initialize objects
 * for the game
 */
function create() {

    // Set boundaries of the world
    game.world.setBounds(0, 0, 192000, 1080);

    // Enable the P2 Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    // Add background
    DD.textures.layerA = game.add.tileSprite(0, 0, 192000, 1080, 'background');
    DD.textures.layerB = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL1');
    DD.textures.layerC = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL2');

    DD.textures.layerA.alpha = 1;
    DD.textures.layerB.alpha = 0.6;
    DD.textures.layerC.alpha = 1;

    game.physics.enable(DD.textures.layerA, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerB, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerC, Phaser.Physics.ARCADE);

    // Begin Parallax
    DD.textures.layerA.body.velocity.x = DD.player.speed - (3*DD.textures.speed);
    DD.textures.layerB.body.velocity.x = DD.player.speed - (2*DD.textures.speed);
    DD.textures.layerC.body.velocity.x = DD.player.speed - (1*DD.textures.speed);

    DD.textures.layerA.body.immovable = true;
    DD.textures.layerB.body.immovable = true;
    DD.textures.layerC.body.immovable = true;

    // Add oilspill elements.
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');
    DD.objects.spill.gradient.element = game.add.sprite(0, 0, 'oilspillfront');
    game.physics.enable(DD.objects.spill.gradient.element, Phaser.Physics.ARCADE);
    // DD.objects.spill.element.enableBody = true;
    // DD.objects.spill.element.physicsBodyType = Phaser.Physics.P2JS;
    
    game.physics.p2.enable(DD.objects.spill.element);


    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dude');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Animation for moving right
    DD.player.element.animations.add('right', [4, 3, 5], 6, true);
    DD.objects.spill.gradient.element.animations.add('spill', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);
    
    //
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.coins.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    var junk;

    // Create a thousand junk objects
    for (var i = 0; i < DD.objects.junks.amount; i++) {
        // For where it says 'star', i want to add a list which it will take from randomly.
        junk = game.add.sprite( (Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'star');

        // junk.physicsBodyType = Phaser.Physics.P2JS;
        // junk.enableBody = true;
        game.physics.p2.enable(junk);

        // The size of the object will likely change too, if that is possible
        junk.body.setRectangle(24, 22);

        junk.body.angularVelocity = Math.random()*2;
        junk.body.velocity.y = Math.random()*80;

        // Tell the junk to use the DD.objects.junks.collisionGroup 
        junk.body.setCollisionGroup(DD.objects.junks.collisionGroup);

        // junks will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        junk.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);

        DD.objects.junks.elements.push(junk);
    }

    var coin;

    // Create a thousand junk objects
    for (i = 0; i < DD.objects.coins.amount; i++) {
        // For where it says 'star', i want to add a list which it will take from randomly.
        coin = game.add.sprite( (Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'healthpack');

        // coin.enableBody = true;
        // coin.physicsBodyType = Phaser.Physics.P2JS;
        game.physics.p2.enable(coin);

        // The size of the object will likely change too, if that is possible
        coin.body.setRectangle(24, 22);

        // Tell the coin to use the DD.objects.coins.collisionGroup 
        coin.body.setCollisionGroup(DD.objects.coins.collisionGroup);

        // coins will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        coin.body.collides([DD.objects.coins.collisionGroup, DD.player.collisionGroup]);

        DD.objects.coins.elements.push(coin);
    }

    DD.objects.spill.element.body.setCollisionGroup(DD.objects.spill.collisionGroup);
    DD.objects.spill.element.body.collides([DD.objects.spill.collisionGroup, DD.player.collisionGroup]);

    DD.player.element.body.setCollisionGroup(DD.player.collisionGroup);
    DD.player.element.body.collides(DD.objects.junks.collisionGroup, junkHit, this);
    DD.player.element.body.collides(DD.objects.spill.collisionGroup, gameOver, this);
    DD.player.element.body.collides(DD.objects.coins.collisionGroup, collectCoin, this);

    // The controls
    DD.game.cursors = game.input.keyboard.createCursorKeys();

    // Setup camera
    game.camera.follow(DD.player.element);

    // Pause and show Main Menu on first run
    if (DD.game.firstRun) {
        DD.game.firstRun = false;
        game.paused = true;

        mainMenu();
    }
}

/**
 * Update function
 * 
 * The game loop - run once per frame
 */
function update() {
    if (DD.game.modifiers.boost.active) {
        if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

            DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
            DD.game.modifiers.boost.active = false;

            console.log('Boost End :(');
        }
    }

    // Governs and controls boost
    if (! DD.game.runEnd) {
        // Sets DD.game.score.lastRun based on the position of the player. the -60 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 50) - 60) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Updates the player and oil spill velocities
        DD.player.element.body.velocity.x = DD.player.speed + (50*DD.game.world.level) + DD.game.modifiers.total;
        DD.player.element.animations.play('right');
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed + (50*DD.game.world.level);
        DD.objects.spill.gradient.element.body.velocity.x = DD.objects.spill.speed + (50*DD.game.world.level);
        DD.objects.spill.gradient.element.animations.play('spill');
    } else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice.
        DD.objects.spill.element.body.velocity.x = 0;
        DD.player.element.body.velocity.x = 0;
    }

    // Reset the players velocity (movement)
    DD.player.element.body.velocity.y = 0;

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level) ) {
        console.log('speed up!');

        DD.game.world.level += 1;
    }

    if (DD.game.cursors.right.isDown) {
        if (DD.game.modifiers.boost.charges > 0) {
            DD.game.modifiers.boost.charges += -1;

            DD.game.modifiers.total += DD.modifiers.boost.total;

            DD.game.modifiers.boost.active = true;
            DD.game.modifiers.boost.begin = DD.player.element.x;

            console.log('BOOST!');
        } else {
            console.log('No charges left');
        }
    }

    if (DD.game.cursors.up.isDown) {
        DD.player.element.body.angle = -1 * DD.player.angle;
        DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
    } else if (DD.game.cursors.down.isDown) {
        DD.player.element.body.angle = DD.player.angle;
        DD.player.element.body.velocity.y = DD.player.vertSpeed;
    } else {
        DD.player.element.body.angle = 0;
    }

    // This function is currently not working so i will have to read the docs when i can to see how to fix this.
    if (DD.player.element.collideWorldBounds) {
        console.log('Touching');

        DD.player.element.body.velocity.y = 0;
    }
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

            DD.game.firstRun = true;
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

            reset();

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
        displayHighScores();

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
function gameOver() {
    DD.game.result = 'Game Over!';
    DD.game.runEnd = true;
    DD.game.score.highScores.push(DD.game.score.lastRun);
}

function junkHit() {
    console.log('junk hit!');
    if (DD.objects.junks.active !== true) {
        DD.player.speed = DD.player.speed*DD.objects.junks.slow;
        DD.objects.junks.active = true;
        game.time.events.add(Phaser.Timer.SECOND * 2, regainSpeed, this); 
        }  
}

function regainSpeed() {
    console.log('regaining speed!');
    DD.player.speed = DD.player.speed/DD.objects.junks.slow;
    DD.objects.junks.active = false;
}

function collectCoin(playerA, coinA) {
    console.log('Coin Collected');
    coinA.body = null;
    coinA.sprite.kill();
    if (DD.objects.coins.collectedIds.indexOf(coinA.data.id) === -1) {
        DD.game.score.coins.lastRun += 1;
        DD.objects.coins.collectedIds.push(coinA.data.id);
    };
    //additionally have to add code which will remove the object from the game
}

/**
 * Render function
 */
function render() {
    //player.body.debug = true;
    //spill.body.debug = true;
    game.debug.text(DD.game.result, 32, 32);
    game.debug.text(DD.game.score.lastRun, 32, 52);
    game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
    game.debug.text('Coins: ' + DD.game.score.coins.lastRun, 32, 92);
}

function displayHighScores() {

    DD.game.score.highScores.sort(function(a, b) {
        return a < b;
    });

    var highScoresHtml = '';

    DD.game.score.highScores.forEach(function(score, index) { 
       highScoresHtml += '<li><a>' + score + '</a></li>';
    });

    $('#highscores-menu').html(highScoresHtml);
}

/**
 * Reset running variables and restart game
 *
 * Is buggy at the moment, we need to not call create(),
 * since that causes an overwrite of the current variables
 * and leads to lag.
 *
 * I think we should just reset player, spill and junk positions,
 * speed and score, etc, not the objects themselves like junk,
 * coin, player, which is what create() does.
 */
function reset() {
    // Reset game
    // DD = null;
    // game = null;

    DD.objects.junks.elements.forEach(function(junk) {
        junk.body = null;
        junk.kill();
    });
    DD.objects.coins.elements.forEach(function(coin) {
        coin.body = null;
        coin.kill();
    });
    DD.game.level = 1;
    DD

    DD = jQuery.extend(true, {}, DDBluepint);
    DD.game.firstRun = false;

    create();

    // start();
}
