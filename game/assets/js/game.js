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
            collisionGroup: null
        },

        coins: {
            amount: Math.random() * 10,
            elements: [],
            collisionGroup: null 
        },

        junks: {
            amount: 1000,
            elements: [],
            collisionGroup: null 
        },
    },

    textures: {
        layerA: null,
        layerB: null,
        layerC: null,
        speed: -50
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
    DD.textures.layerB.alpha = 0;
    DD.textures.layerC.alpha = 1;

    game.physics.enable(DD.textures.layerA, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerB, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerC, Phaser.Physics.ARCADE);

    // Begin Parallax
    DD.textures.layerA.body.velocity.x = DD.textures.speed;
    DD.textures.layerB.body.velocity.x = 2*DD.textures.speed;
    DD.textures.layerC.body.velocity.x = 3*DD.textures.speed;

    DD.textures.layerA.body.immovable = true;
    DD.textures.layerB.body.immovable = true;
    DD.textures.layerC.body.immovable = true;

    // Add oilspill elements.
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');
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
        junk.body.velocity.x = Math.random()*100;
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
        DD.game.score.lastRun = ((DD.player.element.x / 50) - 60) * DD.game.score.lastRunMultiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Updates the player and oil spill velocities
        DD.player.element.body.velocity.x = DD.player.speed + DD.game.modifiers.total;
        DD.player.element.animations.play('right');
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed;
    } else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice.
        DD.objects.spill.element.body.velocity.x = 0;
        DD.player.element.body.velocity.x = 0;
    }

    // Reset the players velocity (movement)
    DD.player.element.body.velocity.y = 0;

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level) ) {
        console.log('speed up!');

        DD.player.speed += 50;
        DD.objects.spill.speed += 50;
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
}

function junkHit() {
    console.log('junk hit!');
    DD.player.speed += -50;
}

function collectCoin(playerA, coinA) {
    console.log('Coin Collected');
    coinA.body = null;
    coinA.sprite.kill();
    DD.game.score.coins.lastRun += 1;
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
    game.debug.text('Score Multiplier: ' + DD.game.score.multiplier, 32, 72);
    game.debug.text('Coins: ' + DD.game.score.coins.lastRun, 32, 92);
}

function displayHighScores() {
    var highScores = [120, 1200, 10920, 153135, 555, 343, 2];

    highScores.sort(function(a, b) {
        return a < b;
    });

    var highScoresHtml = '';

    highScores.forEach(function(score, index) { 
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

    DD = jQuery.extend(true, {}, DDBluepint);
    DD.game.firstRun = false;

    create();

    // start();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgcHJvcGVydGllcyBsaWtlIGN1cnJlbnQgdmVyc2lvblxyXG4gKi9cclxudmFyIEREID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgc3BlZWQ6IDI1MCxcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb2luczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IE1hdGgucmFuZG9tKCkgKiAxMCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCBcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBqdW5rczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IDEwMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwgXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgdGV4dHVyZXM6IHtcclxuICAgICAgICBsYXllckE6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJCOiBudWxsLFxyXG4gICAgICAgIGxheWVyQzogbnVsbCxcclxuICAgICAgICBzcGVlZDogLTUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb2RpZmllcnM6IHtcclxuICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGJvb3N0OiB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ29weSBkZWZhdWx0cyBmb3IgcmVzZXRcclxudmFyIEREQmx1ZXBpbnQgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCBERCk7XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuJCgnI3ZlcnNpb25UYWcnKS5odG1sKERELnZlcnNpb24pO1xyXG5cclxuLy8gSW5pdGlhbGl6ZSBnYW1lIHZhcmlhYmxlXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICB1cGRhdGU6IHVwZGF0ZSxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFByZWxvYWQgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAqIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gKi9cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9TdGF0aWNCYWNrZ3JvdW5kLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDEnLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIxLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDInLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2hlYWx0aHBhY2snLCAnL2Fzc2V0cy9pbWFnZXMvZmlyc3RhaWQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gKiBmb3IgdGhlIGdhbWVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAvLyBBZGQgYmFja2dyb3VuZFxyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMDtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5hbHBoYSA9IDE7XHJcblxyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQiwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIEJlZ2luIFBhcmFsbGF4XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQudGV4dHVyZXMuc3BlZWQ7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gMipERC50ZXh0dXJlcy5zcGVlZDtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSAzKkRELnRleHR1cmVzLnNwZWVkO1xyXG5cclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZWxlbWVudHMuXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgIFxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgIERELnBsYXllci5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDMwMDAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnBsYXllci5lbGVtZW50KTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBbmltYXRpb24gZm9yIG1vdmluZyByaWdodFxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuICAgIFxyXG4gICAgLy9cclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgdmFyIGp1bms7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ3N0YXInKTtcclxuXHJcbiAgICAgICAgLy8ganVuay5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSoyO1xyXG4gICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS54ID0gTWF0aC5yYW5kb20oKSoxMDA7XHJcbiAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnkgPSBNYXRoLnJhbmRvbSgpKjgwO1xyXG5cclxuICAgICAgICAvLyBUZWxsIHRoZSBqdW5rIHRvIHVzZSB0aGUgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVuayk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvaW47XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgY29pbiA9IGdhbWUuYWRkLnNwcml0ZSggKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgZ2FtZS53b3JsZC5yYW5kb21ZLCAnaGVhbHRocGFjaycpO1xyXG5cclxuICAgICAgICAvLyBjb2luLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgIC8vIGNvaW4ucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGNvaW4pO1xyXG5cclxuICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICBjb2luLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGNvaW4gdG8gdXNlIHRoZSBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgIGNvaW4uYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMucHVzaChjb2luKTtcclxuICAgIH1cclxuXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBnYW1lT3ZlciwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAsIGNvbGxlY3RDb2luLCB0aGlzKTtcclxuXHJcbiAgICAvLyBUaGUgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIG1haW5NZW51KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICBpZiAoKERELnBsYXllci5lbGVtZW50LnggLSBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbikgPj0gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gLTEgKiBERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbDtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdvdmVybnMgYW5kIGNvbnRyb2xzIGJvb3N0XHJcbiAgICBpZiAoISBERC5nYW1lLnJ1bkVuZCkge1xyXG4gICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiB0aGUgLTYwIGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAoKERELnBsYXllci5lbGVtZW50LnggLyA1MCkgLSA2MCkgKiBERC5nYW1lLnNjb3JlLmxhc3RSdW5NdWx0aXBsaWVyO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGVzIHRoZSBwbGF5ZXIgYW5kIG9pbCBzcGlsbCB2ZWxvY2l0aWVzXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLnNwZWVkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTdG9wcyBhbGwgb2YgdGhlIG9iamVjdHMgc28gdGhhdCBpdHMgbm90IGNsdW5reS4gT25jZSB0aGUgZGVhdGggbWVudSBpcyBpbXBsZW1lbnRlZCwgdGhpcyB3aWxsIGxvb2sgcXVpdGUgbmljZS5cclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmJvZHkueCA+PSAoREQuZ2FtZS53b3JsZC5pbnRlcnZhbCAqIERELmdhbWUud29ybGQubGV2ZWwpICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzcGVlZCB1cCEnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLnNwZWVkICs9IDUwO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuc3BlZWQgKz0gNTA7XHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gLTE7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSBERC5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcgc28gaSB3aWxsIGhhdmUgdG8gcmVhZCB0aGUgZG9jcyB3aGVuIGkgY2FuIHRvIHNlZSBob3cgdG8gZml4IHRoaXMuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuY29sbGlkZVdvcmxkQm91bmRzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RvdWNoaW5nJyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXVzZSBhY3RpdmF0aW9uXHJcbiAqIFxyXG4gKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZC5cclxuICovXHJcbiQoJyNwYXVzZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVGhpcyB3aWxsIGFjdGl2YXRlIFBoYXNlcidzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXHJcbiAgICBnYW1lLnBhdXNlZCA9ICFnYW1lLnBhdXNlZDtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZSB0aGUgcGF1c2UgbWVudVxyXG4gICAgcGF1c2VNZW51KCk7XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFBhdXNlIE1lbnVcclxuICpcclxuICogU2hvd3MgUGF1c2UgTWVudSBhbmQgaGFuZGxlcyByZXN1bWUsIHJlc3RhcnRcclxuICogYW5kIHF1aXRcclxuICovXHJcbmZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgIHZhciBwYXVzZU1lbnUgPSAkKCcjcGF1c2VNZW51Jyk7XHJcbiAgICB2YXIgcGF1c2VCdXR0b24gPSAkKCcjcGF1c2VCdXR0b24nKTtcclxuXHJcbiAgICBpZiAoZ2FtZS5wYXVzZWQpIHtcclxuICAgICAgICBwYXVzZU1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRvIE1haW4gTWVudVxyXG4gICAgICAgICQoJyNtYWluTWVudUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBEbyBzY29yZSBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGJ1dHRvbiBoYW5kbGVyXHJcbiAgICAgICAgJCgnI3Jlc3VtZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgZ2FtZSwgd2l0aCB0aGUgc2FtZSBwcmluY2lwbGVcclxuICAgICAgICAkKCcjcmVzdGFydEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBTY29yZSBjYWxjXHJcblxyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICByZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYWluIE1lbnVcclxuICpcclxuICogU2hvd3MgTWFpbiBNZW51IGFuZCBoYW5kbGVzIHN0YXJ0LCBoaWdoc2NvcmVzXHJcbiAqIGFuZCBhYm91dFxyXG4gKi9cclxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAvLyBTaG93IHRoZSBtYWluIG1lbnVcclxuICAgICQoJyNtYWluTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnI3BhdXNlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEhpZ2hzY29yZXMgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjaGlnaFNjb3Jlc0J1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgZGlzcGxheUhpZ2hTY29yZXMoKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlUmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgQWJvdXQgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNhYm91dE1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNhYm91dFJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAqIFxyXG4gKiBEaXNwbGF5IHNjb3JlIGFuZCBzdWNoLi4uXHJcbiAqL1xyXG5mdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgIERELmdhbWUucmVzdWx0ID0gJ0dhbWUgT3ZlciEnO1xyXG4gICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ2p1bmsgaGl0IScpO1xyXG4gICAgREQucGxheWVyLnNwZWVkICs9IC01MDtcclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyQSwgY29pbkEpIHtcclxuICAgIGNvbnNvbGUubG9nKCdDb2luIENvbGxlY3RlZCcpO1xyXG4gICAgY29pbkEuYm9keSA9IG51bGw7XHJcbiAgICBjb2luQS5zcHJpdGUua2lsbCgpO1xyXG4gICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAvL2FkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vKipcclxuICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAvL3BsYXllci5ib2R5LmRlYnVnID0gdHJ1ZTtcclxuICAgIC8vc3BpbGwuYm9keS5kZWJ1ZyA9IHRydWU7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoREQuZ2FtZS5yZXN1bHQsIDMyLCAzMik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAzMiwgNTIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgREQuZ2FtZS5zY29yZS5tdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KCdDb2luczogJyArIERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1biwgMzIsIDkyKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlzcGxheUhpZ2hTY29yZXMoKSB7XHJcbiAgICB2YXIgaGlnaFNjb3JlcyA9IFsxMjAsIDEyMDAsIDEwOTIwLCAxNTMxMzUsIDU1NSwgMzQzLCAyXTtcclxuXHJcbiAgICBoaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIHJldHVybiBhIDwgYjtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG5cclxuICAgIGhpZ2hTY29yZXMuZm9yRWFjaChmdW5jdGlvbihzY29yZSwgaW5kZXgpIHsgXHJcbiAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGxpPjxhPicgKyBzY29yZSArICc8L2E+PC9saT4nO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnI2hpZ2hzY29yZXMtbWVudScpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZVxyXG4gKlxyXG4gKiBJcyBidWdneSBhdCB0aGUgbW9tZW50LCB3ZSBuZWVkIHRvIG5vdCBjYWxsIGNyZWF0ZSgpLFxyXG4gKiBzaW5jZSB0aGF0IGNhdXNlcyBhbiBvdmVyd3JpdGUgb2YgdGhlIGN1cnJlbnQgdmFyaWFibGVzXHJcbiAqIGFuZCBsZWFkcyB0byBsYWcuXHJcbiAqXHJcbiAqIEkgdGhpbmsgd2Ugc2hvdWxkIGp1c3QgcmVzZXQgcGxheWVyLCBzcGlsbCBhbmQganVuayBwb3NpdGlvbnMsXHJcbiAqIHNwZWVkIGFuZCBzY29yZSwgZXRjLCBub3QgdGhlIG9iamVjdHMgdGhlbXNlbHZlcyBsaWtlIGp1bmssXHJcbiAqIGNvaW4sIHBsYXllciwgd2hpY2ggaXMgd2hhdCBjcmVhdGUoKSBkb2VzLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAvLyBSZXNldCBnYW1lXHJcbiAgICAvLyBERCA9IG51bGw7XHJcbiAgICAvLyBnYW1lID0gbnVsbDtcclxuXHJcbiAgICBERCA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge30sIEREQmx1ZXBpbnQpO1xyXG4gICAgREQuZ2FtZS5maXJzdFJ1biA9IGZhbHNlO1xyXG5cclxuICAgIGNyZWF0ZSgpO1xyXG5cclxuICAgIC8vIHN0YXJ0KCk7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9