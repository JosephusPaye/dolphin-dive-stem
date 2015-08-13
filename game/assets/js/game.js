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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgcHJvcGVydGllcyBsaWtlIGN1cnJlbnQgdmVyc2lvblxyXG4gKi9cclxudmFyIEREID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgc3BlZWQ6IDI1MCxcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGdyYWRpZW50OiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb2luczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IChNYXRoLnJhbmRvbSgpICogNTApICsgNTAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGVjdGVkSWRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBqdW5rczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IDEwMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgc2xvdzogMC42LFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb2RpZmllcnM6IHtcclxuICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGJvb3N0OiB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ29weSBkZWZhdWx0cyBmb3IgcmVzZXRcclxudmFyIEREQmx1ZXBpbnQgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCBERCk7XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuJCgnI3ZlcnNpb25UYWcnKS5odG1sKERELnZlcnNpb24pO1xyXG5cclxuLy8gSW5pdGlhbGl6ZSBnYW1lIHZhcmlhYmxlXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICB1cGRhdGU6IHVwZGF0ZSxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFByZWxvYWQgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAqIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gKi9cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9TdGF0aWNCYWNrZ3JvdW5kLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDEnLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIxLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDInLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2hlYWx0aHBhY2snLCAnL2Fzc2V0cy9pbWFnZXMvZmlyc3RhaWQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnLCAxOTIwLCAxMDgwKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gKiBmb3IgdGhlIGdhbWVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAvLyBBZGQgYmFja2dyb3VuZFxyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMC42O1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmFscGhhID0gMTtcclxuXHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gQmVnaW4gUGFyYWxsYXhcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMypERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDIqREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgxKkRELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnRzLlxyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5ncmFkaWVudC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdvaWxzcGlsbGZyb250Jyk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG5cclxuICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgIERELnBsYXllci5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDMwMDAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnBsYXllci5lbGVtZW50KTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBbmltYXRpb24gZm9yIG1vdmluZyByaWdodFxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuICAgIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudC5hbmltYXRpb25zLmFkZCgnc3BpbGwnLCBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sIDEwLCB0cnVlKTtcclxuICAgIFxyXG4gICAgLy9cclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgdmFyIGp1bms7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ3N0YXInKTtcclxuXHJcbiAgICAgICAgLy8ganVuay5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSoyO1xyXG4gICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSo4MDtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5wdXNoKGp1bmspO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2luO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuY29pbnMuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgIGNvaW4gPSBnYW1lLmFkZC5zcHJpdGUoIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ2hlYWx0aHBhY2snKTtcclxuXHJcbiAgICAgICAgLy8gY29pbi5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAvLyBjb2luLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShjb2luKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgY29pbi5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAvLyBUZWxsIHRoZSBjb2luIHRvIHVzZSB0aGUgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIC8vIGNvaW5zIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBjb2luLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzLnB1c2goY29pbik7XHJcbiAgICB9XHJcblxyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0Q29pbiwgdGhpcyk7XHJcblxyXG4gICAgLy8gVGhlIGNvbnRyb2xzXHJcbiAgICBERC5nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhERC5wbGF5ZXIuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxyXG4gICAgaWYgKERELmdhbWUuZmlyc3RSdW4pIHtcclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBUaGUgZ2FtZSBsb29wIC0gcnVuIG9uY2UgcGVyIGZyYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgaWYgKChERC5wbGF5ZXIuZWxlbWVudC54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0xICogREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHb3Zlcm5zIGFuZCBjb250cm9scyBib29zdFxyXG4gICAgaWYgKCEgREQuZ2FtZS5ydW5FbmQpIHtcclxuICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gdGhlIC02MCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNTApIC0gNjApICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSBwYXJzZUludChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDEwKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlcyB0aGUgcGxheWVyIGFuZCBvaWwgc3BpbGwgdmVsb2NpdGllc1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCArICg1MCpERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5zcGVlZCArICg1MCpERC5nYW1lLndvcmxkLmxldmVsKTtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5zcGVlZCArICg1MCpERC5nYW1lLndvcmxkLmxldmVsKTtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdzcGlsbCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTdG9wcyBhbGwgb2YgdGhlIG9iamVjdHMgc28gdGhhdCBpdHMgbm90IGNsdW5reS4gT25jZSB0aGUgZGVhdGggbWVudSBpcyBpbXBsZW1lbnRlZCwgdGhpcyB3aWxsIGxvb2sgcXVpdGUgbmljZS5cclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmJvZHkueCA+PSAoREQuZ2FtZS53b3JsZC5pbnRlcnZhbCAqIERELmdhbWUud29ybGQubGV2ZWwpICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzcGVlZCB1cCEnKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gLTE7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSBERC5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcgc28gaSB3aWxsIGhhdmUgdG8gcmVhZCB0aGUgZG9jcyB3aGVuIGkgY2FuIHRvIHNlZSBob3cgdG8gZml4IHRoaXMuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuY29sbGlkZVdvcmxkQm91bmRzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RvdWNoaW5nJyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXVzZSBhY3RpdmF0aW9uXHJcbiAqIFxyXG4gKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZC5cclxuICovXHJcbiQoJyNwYXVzZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVGhpcyB3aWxsIGFjdGl2YXRlIFBoYXNlcidzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXHJcbiAgICBnYW1lLnBhdXNlZCA9ICFnYW1lLnBhdXNlZDtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZSB0aGUgcGF1c2UgbWVudVxyXG4gICAgcGF1c2VNZW51KCk7XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFBhdXNlIE1lbnVcclxuICpcclxuICogU2hvd3MgUGF1c2UgTWVudSBhbmQgaGFuZGxlcyByZXN1bWUsIHJlc3RhcnRcclxuICogYW5kIHF1aXRcclxuICovXHJcbmZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgIHZhciBwYXVzZU1lbnUgPSAkKCcjcGF1c2VNZW51Jyk7XHJcbiAgICB2YXIgcGF1c2VCdXR0b24gPSAkKCcjcGF1c2VCdXR0b24nKTtcclxuXHJcbiAgICBpZiAoZ2FtZS5wYXVzZWQpIHtcclxuICAgICAgICBwYXVzZU1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRvIE1haW4gTWVudVxyXG4gICAgICAgICQoJyNtYWluTWVudUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBEbyBzY29yZSBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGJ1dHRvbiBoYW5kbGVyXHJcbiAgICAgICAgJCgnI3Jlc3VtZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgZ2FtZSwgd2l0aCB0aGUgc2FtZSBwcmluY2lwbGVcclxuICAgICAgICAkKCcjcmVzdGFydEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBTY29yZSBjYWxjXHJcblxyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICByZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYWluIE1lbnVcclxuICpcclxuICogU2hvd3MgTWFpbiBNZW51IGFuZCBoYW5kbGVzIHN0YXJ0LCBoaWdoc2NvcmVzXHJcbiAqIGFuZCBhYm91dFxyXG4gKi9cclxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAvLyBTaG93IHRoZSBtYWluIG1lbnVcclxuICAgICQoJyNtYWluTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnI3BhdXNlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEhpZ2hzY29yZXMgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjaGlnaFNjb3Jlc0J1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgZGlzcGxheUhpZ2hTY29yZXMoKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlUmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgQWJvdXQgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNhYm91dE1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNhYm91dFJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAqIFxyXG4gKiBEaXNwbGF5IHNjb3JlIGFuZCBzdWNoLi4uXHJcbiAqL1xyXG5mdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgIERELmdhbWUucmVzdWx0ID0gJ0dhbWUgT3ZlciEnO1xyXG4gICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG4gICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnB1c2goREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxufVxyXG5cclxuZnVuY3Rpb24ganVua0hpdCgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdqdW5rIGhpdCEnKTtcclxuICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCpERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKFBoYXNlci5UaW1lci5TRUNPTkQgKiAyLCByZWdhaW5TcGVlZCwgdGhpcyk7IFxyXG4gICAgICAgIH0gIFxyXG59XHJcblxyXG5mdW5jdGlvbiByZWdhaW5TcGVlZCgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZWdhaW5pbmcgc3BlZWQhJyk7XHJcbiAgICBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQvREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyQSwgY29pbkEpIHtcclxuICAgIGNvbnNvbGUubG9nKCdDb2luIENvbGxlY3RlZCcpO1xyXG4gICAgY29pbkEuYm9keSA9IG51bGw7XHJcbiAgICBjb2luQS5zcHJpdGUua2lsbCgpO1xyXG4gICAgaWYgKERELm9iamVjdHMuY29pbnMuY29sbGVjdGVkSWRzLmluZGV4T2YoY29pbkEuZGF0YS5pZCkgPT09IC0xKSB7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMucHVzaChjb2luQS5kYXRhLmlkKTtcclxuICAgIH07XHJcbiAgICAvL2FkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vKipcclxuICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAvL3BsYXllci5ib2R5LmRlYnVnID0gdHJ1ZTtcclxuICAgIC8vc3BpbGwuYm9keS5kZWJ1ZyA9IHRydWU7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoREQuZ2FtZS5yZXN1bHQsIDMyLCAzMik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAzMiwgNTIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllciwgMzIsIDcyKTtcclxuICAgIGdhbWUuZGVidWcudGV4dCgnQ29pbnM6ICcgKyBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4sIDMyLCA5Mik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlIaWdoU2NvcmVzKCkge1xyXG5cclxuICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuXHJcbiAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuZm9yRWFjaChmdW5jdGlvbihzY29yZSwgaW5kZXgpIHsgXHJcbiAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGxpPjxhPicgKyBzY29yZSArICc8L2E+PC9saT4nO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnI2hpZ2hzY29yZXMtbWVudScpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZVxyXG4gKlxyXG4gKiBJcyBidWdneSBhdCB0aGUgbW9tZW50LCB3ZSBuZWVkIHRvIG5vdCBjYWxsIGNyZWF0ZSgpLFxyXG4gKiBzaW5jZSB0aGF0IGNhdXNlcyBhbiBvdmVyd3JpdGUgb2YgdGhlIGN1cnJlbnQgdmFyaWFibGVzXHJcbiAqIGFuZCBsZWFkcyB0byBsYWcuXHJcbiAqXHJcbiAqIEkgdGhpbmsgd2Ugc2hvdWxkIGp1c3QgcmVzZXQgcGxheWVyLCBzcGlsbCBhbmQganVuayBwb3NpdGlvbnMsXHJcbiAqIHNwZWVkIGFuZCBzY29yZSwgZXRjLCBub3QgdGhlIG9iamVjdHMgdGhlbXNlbHZlcyBsaWtlIGp1bmssXHJcbiAqIGNvaW4sIHBsYXllciwgd2hpY2ggaXMgd2hhdCBjcmVhdGUoKSBkb2VzLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAvLyBSZXNldCBnYW1lXHJcbiAgICAvLyBERCA9IG51bGw7XHJcbiAgICAvLyBnYW1lID0gbnVsbDtcclxuXHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oanVuaykge1xyXG4gICAgICAgIGp1bmsuYm9keSA9IG51bGw7XHJcbiAgICAgICAganVuay5raWxsKCk7XHJcbiAgICB9KTtcclxuICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihjb2luKSB7XHJcbiAgICAgICAgY29pbi5ib2R5ID0gbnVsbDtcclxuICAgICAgICBjb2luLmtpbGwoKTtcclxuICAgIH0pO1xyXG4gICAgREQuZ2FtZS5sZXZlbCA9IDE7XHJcbiAgICBERFxyXG5cclxuICAgIEREID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcGludCk7XHJcbiAgICBERC5nYW1lLmZpcnN0UnVuID0gZmFsc2U7XHJcblxyXG4gICAgY3JlYXRlKCk7XHJcblxyXG4gICAgLy8gc3RhcnQoKTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=