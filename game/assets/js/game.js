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
            slow: 0.5,
            collisionGroup: null,
            active: false
        }
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
            lastFrameValue: {
                coins: 0,
                score: 0
            },
            highScores: []
        },

        modifiers: {
            total: 0,
            active: true,

            boost: {
                active: false,
                total: 200,
                begin: 0,
                charges: 1
            },

            multiplier: 1
        }
    }
};

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
    DD.textures.layerA.body.velocity.x = DD.player.speed - (3 * DD.textures.speed);
    DD.textures.layerB.body.velocity.x = DD.player.speed - (2 * DD.textures.speed);
    DD.textures.layerC.body.velocity.x = DD.player.speed - (1 * DD.textures.speed);

    DD.textures.layerA.body.immovable = true;
    DD.textures.layerB.body.immovable = true;
    DD.textures.layerC.body.immovable = true;

    // Add oilspill elements
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');

    // DD.objects.spill.gradient.element = game.add.sprite(0, 0, 'oilspillfront');
    // game.physics.enable(DD.objects.spill.gradient.element, Phaser.Physics.ARCADE);
    
    game.physics.p2.enable(DD.objects.spill.element);

    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dude');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Player animations
    DD.player.element.animations.add('right', [4, 3, 5], 6, true);
    // DD.objects.spill.gradient.element.animations.add('spill', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);
    
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.coins.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    // Generate junks and coins
    createJunks();
    createCoins();

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
    if (!DD.game.runEnd) {
        // Sets DD.game.score.lastRun based on the position of the player. the -60 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Updates the player and oil spill velocities
        DD.player.element.body.velocity.x = DD.player.speed + (50 * DD.game.world.level) + DD.game.modifiers.total;
        DD.player.element.animations.play('right');

        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed + (50 * DD.game.world.level);

        // DD.objects.spill.gradient.element.body.velocity.x = DD.objects.spill.element.body.velocity.x;
        // DD.objects.spill.gradient.element.animations.play('spill');
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

            DD.game.modifiers.total += DD.game.modifiers.boost.total;

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

function createJunks() {
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

        junk.body.angularVelocity = Math.random() * 2;
        junk.body.velocity.y = Math.random() * 80;

        // Tell the junk to use the DD.objects.junks.collisionGroup 
        junk.body.setCollisionGroup(DD.objects.junks.collisionGroup);

        // junks will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        junk.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);

        DD.objects.junks.elements.push(junk);
    }
}

function createCoins() {
    var coin;

    // Create a thousand junk objects
    for (var j = 0; j < DD.objects.coins.amount; j++) {
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
    var pauseMenuElement = $('#pauseMenu');
    var pauseButton = $('#pauseButton');
    var hud = $('#hud');

    if (game.paused) {
        // Hide HUD and pause button
        pauseButton.addClass('hidden');
        hud.addClass('hidden');

        // Show pause menu
        pauseMenuElement.removeClass('hidden');

        // Return to Main Menu
        $('#mainMenuButton').click(function() {
            // Do score calculations
            
            // Hide pause menu
            pauseMenuElement.addClass('hidden');
            pauseButton.removeClass('hidden');

            DD.game.firstRun = true;
            reset();
            game.paused = true;

            // Show main menu
            mainMenu();
        });

        // Resume button handler
        $('#resumeButton').click(function() {
            pauseMenuElement.addClass('hidden');
            pauseButton.removeClass('hidden');

            game.paused = false;
        });

        // Reset the game, with the same principle
        $('#restartButton').click(function() {
            // Score calc

            pauseMenuElement.addClass('hidden');
            pauseButton.removeClass('hidden');

            reset();

            game.paused = false;
        });
    } else {
        pauseMenuElement.addClass('hidden');
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
        $('#hud').removeClass('hidden');
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

function hideAllElements() {
    $('#mainMenu').addClass('hidden');
    $('#pauseMenu').addClass('hidden');
    $('#scoreMenu').addClass('hidden');
    $('#aboutMenu').addClass('hidden');
    
    $('#hud').addClass('hidden');
    $('#pauseButton').addClass('hidden');
}

function junkHit() {
    console.log('Junk hit!');

    if (DD.objects.junks.active !== true) {
        DD.player.speed = DD.player.speed * DD.objects.junks.slow;
        DD.objects.junks.active = true;
        game.time.events.add(Phaser.Timer.SECOND * 2, regainSpeed, this); 
    }  
}

function regainSpeed() {
    console.log('Regaining speed!');

    DD.player.speed = DD.player.speed / DD.objects.junks.slow;
    DD.objects.junks.active = false;
}

function collectCoin(playerA, coinA) {
    console.log('Coin Collected');

    coinA.body = null;
    coinA.sprite.kill();

    if (DD.objects.coins.collectedIds.indexOf(coinA.data.id) === -1) {
        DD.game.score.coins.lastRun += 1;
        DD.objects.coins.collectedIds.push(coinA.data.id);
    }

    // Additionally have to add code which will remove the object from the game
}

/**
 * Render function
 */
function render() {
    // Update score
    if (DD.game.score.lastFrameValue.score !== DD.game.score.lastRun) {
        $('#currentScore').text(DD.game.score.lastRun);
        DD.game.score.lastFrameValue.score = DD.game.score.lastRun;
    }

    // Update coins
    if (DD.game.score.lastFrameValue.coins !== DD.game.score.coins.lastRun) {
        $('#currentCoinCount').text(DD.game.score.coins.lastRun);
        DD.game.score.lastFrameValue.coins = DD.game.score.coins.lastRun;
    }

    // game.debug.text(DD.game.score.lastRun, 32, 52);
    // game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
    // game.debug.text('Coins: ' + DD.game.score.coins.lastRun, 32, 92);
}

function displayHighScores() {
    DD.game.score.highScores.sort(function(a, b) {
        return a < b;
    });

    var highScoresHtml = '';

    DD.game.score.highScores.forEach(function(score) { 
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
    // Kill off junks
    DD.objects.junks.elements.forEach(function(junk, index) {
        junk.body = null;
        junk.kill();
        DD.objects.junks[index] = null;
    });

    // Kill off coins
    DD.objects.coins.elements.forEach(function(coin, index) {
        coin.body = null;
        coin.kill();
        DD.objects.coins[index] = null;
    });

    // Reset junks and coins arrays
    DD.objects.junks.elements = [];
    DD.objects.coins.elements = [];

    // Reset background textures' position
    // DD.textures.layerA.body.x = 0;
    // DD.textures.layerB.body.x = 0;
    // DD.textures.layerC.body.x = 0;

    // Reset background textures' velocities
    // DD.textures.layerA.body.velocity.x = DD.player.speed - (3 * DD.textures.speed);
    // DD.textures.layerB.body.velocity.x = DD.player.speed - (2 * DD.textures.speed);
    // DD.textures.layerC.body.velocity.x = DD.player.speed - (1 * DD.textures.speed);

    // Reset player position and velocity
    // DD.player.element.body.x = 3000;
    // DD.player.element.body.y = game.world.centerY;

    // DD.player.element.body.velocity.x = 0;
    // DD.player.element.body.velocity.y = 0;

    // // Reset spill position and velocity
    // DD.objects.spill.element.body.x = 0;
    // DD.objects.spill.element.body.y = 0;

    // DD.objects.spill.element.body.velocity.x = 0;
    // DD.objects.spill.element.body.velocity.y = 0;

    // Reset game world
    DD.game.world.level = 1;

    game.destroy();
    game = null;

    game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcbid1c2Ugc3RyaWN0JzsgLy8gU2hvd3MgYWxsIGVycm9ycyBhbmQgd2FybmluZ3NcclxuXHJcbi8qKlxyXG4gKiBHbG9iYWwgREQgb2JqZWN0XHJcbiAqIFxyXG4gKiBDb250YWlucyBnYW1lIHByb3BlcnRpZXMgbGlrZSBjdXJyZW50IHZlcnNpb25cclxuICovXHJcbnZhciBERCA9IHtcclxuICAgIHZlcnNpb246ICcwLjEuMCcsXHJcblxyXG4gICAgb2JqZWN0czoge1xyXG4gICAgICAgIHNwaWxsOiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiAyNTAsXHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBncmFkaWVudDoge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAoTWF0aC5yYW5kb20oKSAqIDUwKSArIDUwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAxMDAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgbGFzdEZyYW1lVmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIGNvaW5zOiAwLFxyXG4gICAgICAgICAgICAgICAgc2NvcmU6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb2RpZmllcnM6IHtcclxuICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGJvb3N0OiB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDIwMCxcclxuICAgICAgICAgICAgICAgIGJlZ2luOiAwLFxyXG4gICAgICAgICAgICAgICAgY2hhcmdlczogMVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbXVsdGlwbGllcjogMVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIEp1c3QgYSBmcmllbmRseSByZW1pbmRlclxyXG5jb25zb2xlLmluZm8oJ0RvbHBoaW4gRGl2ZSB2JyArIERELnZlcnNpb24pO1xyXG4kKCcjdmVyc2lvblRhZycpLmh0bWwoREQudmVyc2lvbik7XHJcblxyXG4vLyBJbml0aWFsaXplIGdhbWUgdmFyaWFibGVcclxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgIHByZWxvYWQ6IHByZWxvYWQsXHJcbiAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSk7XHJcblxyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICcvYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICcvYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnaGVhbHRocGFjaycsICcvYXNzZXRzL2ltYWdlcy9maXJzdGFpZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycsIDE5MjAsIDEwODApO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL0RvbHBoaW4ucG5nJywgMjM1LCA5Nik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAqIGZvciB0aGUgZ2FtZVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMDAsIDEwODApO1xyXG5cclxuICAgIC8vIEVuYWJsZSB0aGUgUDIgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG4gICAgLy8gQWRkIGJhY2tncm91bmRcclxuICAgIERELnRleHR1cmVzLmxheWVyQSA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDEnKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmFscGhhID0gMTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5hbHBoYSA9IDE7XHJcblxyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQiwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIEJlZ2luIFBhcmFsbGF4XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDIgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDEgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcblxyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50c1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdvaWxzcGlsbCcpO1xyXG5cclxuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG4gICAgLy8gZ2FtZS5waHlzaWNzLmVuYWJsZShERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5wbGF5ZXIuZWxlbWVudCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gUGxheWVyIGFuaW1hdGlvbnNcclxuICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs0LCAzLCA1XSwgNiwgdHJ1ZSk7XHJcbiAgICAvLyBERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3NwaWxsJywgWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLCAxMCwgdHJ1ZSk7XHJcbiAgICBcclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUganVua3MgYW5kIGNvaW5zXHJcbiAgICBjcmVhdGVKdW5rcygpO1xyXG4gICAgY3JlYXRlQ29pbnMoKTtcclxuXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBnYW1lT3ZlciwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAsIGNvbGxlY3RDb2luLCB0aGlzKTtcclxuXHJcbiAgICAvLyBUaGUgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIG1haW5NZW51KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICBpZiAoKERELnBsYXllci5lbGVtZW50LnggLSBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbikgPj0gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gLTEgKiBERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbDtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdvdmVybnMgYW5kIGNvbnRyb2xzIGJvb3N0XHJcbiAgICBpZiAoIURELmdhbWUucnVuRW5kKSB7XHJcbiAgICAgICAgLy8gU2V0cyBERC5nYW1lLnNjb3JlLmxhc3RSdW4gYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIuIHRoZSAtNjAgY29tcGVuc2F0ZXMgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyIGluIHRoZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9ICgoREQucGxheWVyLmVsZW1lbnQueCAvIDQwMCkgLSA4KSAqIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXI7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gcGFyc2VJbnQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZXMgdGhlIHBsYXllciBhbmQgb2lsIHNwaWxsIHZlbG9jaXRpZXNcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgKyAoNTAgKiBERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELm9iamVjdHMuc3BpbGwuc3BlZWQgKyAoNTAgKiBERC5nYW1lLndvcmxkLmxldmVsKTtcclxuXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zcGlsbC5ncmFkaWVudC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zcGlsbC5ncmFkaWVudC5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnc3BpbGwnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gU3RvcHMgYWxsIG9mIHRoZSBvYmplY3RzIHNvIHRoYXQgaXRzIG5vdCBjbHVua3kuIE9uY2UgdGhlIGRlYXRoIG1lbnUgaXMgaW1wbGVtZW50ZWQsIHRoaXMgd2lsbCBsb29rIHF1aXRlIG5pY2UuXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGxheWVycyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG5cclxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnc3BlZWQgdXAhJyk7XHJcblxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93bikge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcgc28gaSB3aWxsIGhhdmUgdG8gcmVhZCB0aGUgZG9jcyB3aGVuIGkgY2FuIHRvIHNlZSBob3cgdG8gZml4IHRoaXMuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuY29sbGlkZVdvcmxkQm91bmRzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RvdWNoaW5nJyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUp1bmtzKCkge1xyXG4gICAgdmFyIGp1bms7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ3N0YXInKTtcclxuXHJcbiAgICAgICAgLy8ganVuay5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSAqIDI7XHJcbiAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnkgPSBNYXRoLnJhbmRvbSgpICogODA7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgIGp1bmsuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMucHVzaChqdW5rKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ29pbnMoKSB7XHJcbiAgICB2YXIgY29pbjtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGorKykge1xyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgY29pbiA9IGdhbWUuYWRkLnNwcml0ZSggKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgZ2FtZS53b3JsZC5yYW5kb21ZLCAnaGVhbHRocGFjaycpO1xyXG5cclxuICAgICAgICAvLyBjb2luLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgIC8vIGNvaW4ucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGNvaW4pO1xyXG5cclxuICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICBjb2luLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGNvaW4gdG8gdXNlIHRoZSBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgIGNvaW4uYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMucHVzaChjb2luKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhdXNlIGFjdGl2YXRpb25cclxuICogXHJcbiAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gKi9cclxuJCgnI3BhdXNlQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUaGlzIHdpbGwgYWN0aXZhdGUgUGhhc2VyJ3MgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgIGdhbWUucGF1c2VkID0gIWdhbWUucGF1c2VkO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBwYXVzZSBtZW51XHJcbiAgICBwYXVzZU1lbnUoKTtcclxufSk7XHJcblxyXG4vKipcclxuICogUGF1c2UgTWVudVxyXG4gKlxyXG4gKiBTaG93cyBQYXVzZSBNZW51IGFuZCBoYW5kbGVzIHJlc3VtZSwgcmVzdGFydFxyXG4gKiBhbmQgcXVpdFxyXG4gKi9cclxuZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgdmFyIHBhdXNlTWVudUVsZW1lbnQgPSAkKCcjcGF1c2VNZW51Jyk7XHJcbiAgICB2YXIgcGF1c2VCdXR0b24gPSAkKCcjcGF1c2VCdXR0b24nKTtcclxuICAgIHZhciBodWQgPSAkKCcjaHVkJyk7XHJcblxyXG4gICAgaWYgKGdhbWUucGF1c2VkKSB7XHJcbiAgICAgICAgLy8gSGlkZSBIVUQgYW5kIHBhdXNlIGJ1dHRvblxyXG4gICAgICAgIHBhdXNlQnV0dG9uLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBodWQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTaG93IHBhdXNlIG1lbnVcclxuICAgICAgICBwYXVzZU1lbnVFbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRvIE1haW4gTWVudVxyXG4gICAgICAgICQoJyNtYWluTWVudUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBEbyBzY29yZSBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEhpZGUgcGF1c2UgbWVudVxyXG4gICAgICAgICAgICBwYXVzZU1lbnVFbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgICAgIHJlc2V0KCk7XHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgbWFpbiBtZW51XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc3VtZSBidXR0b24gaGFuZGxlclxyXG4gICAgICAgICQoJyNyZXN1bWVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcGF1c2VNZW51RWxlbWVudC5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBnYW1lLCB3aXRoIHRoZSBzYW1lIHByaW5jaXBsZVxyXG4gICAgICAgICQoJyNyZXN0YXJ0QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIFNjb3JlIGNhbGNcclxuXHJcbiAgICAgICAgICAgIHBhdXNlTWVudUVsZW1lbnQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICByZXNldCgpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF1c2VNZW51RWxlbWVudC5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWFpbiBNZW51XHJcbiAqXHJcbiAqIFNob3dzIE1haW4gTWVudSBhbmQgaGFuZGxlcyBzdGFydCwgaGlnaHNjb3Jlc1xyXG4gKiBhbmQgYWJvdXRcclxuICovXHJcbmZ1bmN0aW9uIG1haW5NZW51KCkge1xyXG4gICAgLy8gU2hvdyB0aGUgbWFpbiBtZW51XHJcbiAgICAkKCcjbWFpbk1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcjcGF1c2VCdXR0b24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgbWFpbiBtZW51IGJ1dHRvblxyXG4gICAgJCgnI2JlZ2luQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICQoJyNwYXVzZUJ1dHRvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAkKCcjaHVkJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEhpZ2hzY29yZXMgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjaGlnaFNjb3Jlc0J1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgZGlzcGxheUhpZ2hTY29yZXMoKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlUmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgQWJvdXQgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNhYm91dE1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNhYm91dFJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAqIFxyXG4gKiBEaXNwbGF5IHNjb3JlIGFuZCBzdWNoLi4uXHJcbiAqL1xyXG5mdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgIERELmdhbWUucmVzdWx0ID0gJ0dhbWUgT3ZlciEnO1xyXG4gICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG4gICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnB1c2goREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGlkZUFsbEVsZW1lbnRzKCkge1xyXG4gICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnI3BhdXNlTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgXHJcbiAgICAkKCcjaHVkJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnI3BhdXNlQnV0dG9uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ0p1bmsgaGl0IScpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgZ2FtZS50aW1lLmV2ZW50cy5hZGQoUGhhc2VyLlRpbWVyLlNFQ09ORCAqIDIsIHJlZ2FpblNwZWVkLCB0aGlzKTsgXHJcbiAgICB9ICBcclxufVxyXG5cclxuZnVuY3Rpb24gcmVnYWluU3BlZWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUmVnYWluaW5nIHNwZWVkIScpO1xyXG5cclxuICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAvIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbGxlY3RDb2luKHBsYXllckEsIGNvaW5BKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ29pbiBDb2xsZWN0ZWQnKTtcclxuXHJcbiAgICBjb2luQS5ib2R5ID0gbnVsbDtcclxuICAgIGNvaW5BLnNwcml0ZS5raWxsKCk7XHJcblxyXG4gICAgaWYgKERELm9iamVjdHMuY29pbnMuY29sbGVjdGVkSWRzLmluZGV4T2YoY29pbkEuZGF0YS5pZCkgPT09IC0xKSB7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMucHVzaChjb2luQS5kYXRhLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGRpdGlvbmFsbHkgaGF2ZSB0byBhZGQgY29kZSB3aGljaCB3aWxsIHJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIGdhbWVcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgLy8gVXBkYXRlIHNjb3JlXHJcbiAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgJCgnI2N1cnJlbnRTY29yZScpLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gREQuZ2FtZS5zY29yZS5sYXN0UnVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBjb2luc1xyXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuY29pbnMgIT09IERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1bikge1xyXG4gICAgICAgICQoJyNjdXJyZW50Q29pbkNvdW50JykudGV4dChERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4pO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuY29pbnMgPSBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2FtZS5kZWJ1Zy50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMzIsIDUyKTtcclxuICAgIC8vIGdhbWUuZGVidWcudGV4dCgnU2NvcmUgTXVsdGlwbGllcjogJyArIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXIsIDMyLCA3Mik7XHJcbiAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ0NvaW5zOiAnICsgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuLCAzMiwgOTIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNwbGF5SGlnaFNjb3JlcygpIHtcclxuICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuXHJcbiAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuZm9yRWFjaChmdW5jdGlvbihzY29yZSkgeyBcclxuICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGxpPjxhPicgKyBzY29yZSArICc8L2E+PC9saT4nO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnI2hpZ2hzY29yZXMtbWVudScpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG59XHJcblxyXG4vKipcclxuICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZVxyXG4gKlxyXG4gKiBJcyBidWdneSBhdCB0aGUgbW9tZW50LCB3ZSBuZWVkIHRvIG5vdCBjYWxsIGNyZWF0ZSgpLFxyXG4gKiBzaW5jZSB0aGF0IGNhdXNlcyBhbiBvdmVyd3JpdGUgb2YgdGhlIGN1cnJlbnQgdmFyaWFibGVzXHJcbiAqIGFuZCBsZWFkcyB0byBsYWcuXHJcbiAqXHJcbiAqIEkgdGhpbmsgd2Ugc2hvdWxkIGp1c3QgcmVzZXQgcGxheWVyLCBzcGlsbCBhbmQganVuayBwb3NpdGlvbnMsXHJcbiAqIHNwZWVkIGFuZCBzY29yZSwgZXRjLCBub3QgdGhlIG9iamVjdHMgdGhlbXNlbHZlcyBsaWtlIGp1bmssXHJcbiAqIGNvaW4sIHBsYXllciwgd2hpY2ggaXMgd2hhdCBjcmVhdGUoKSBkb2VzLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGp1bmssIGluZGV4KSB7XHJcbiAgICAgICAganVuay5ib2R5ID0gbnVsbDtcclxuICAgICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzW2luZGV4XSA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBLaWxsIG9mZiBjb2luc1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGNvaW4sIGluZGV4KSB7XHJcbiAgICAgICAgY29pbi5ib2R5ID0gbnVsbDtcclxuICAgICAgICBjb2luLmtpbGwoKTtcclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zW2luZGV4XSA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXNldCBqdW5rcyBhbmQgY29pbnMgYXJyYXlzXHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzID0gW107XHJcblxyXG4gICAgLy8gUmVzZXQgYmFja2dyb3VuZCB0ZXh0dXJlcycgcG9zaXRpb25cclxuICAgIC8vIERELnRleHR1cmVzLmxheWVyQS5ib2R5LnggPSAwO1xyXG4gICAgLy8gREQudGV4dHVyZXMubGF5ZXJCLmJvZHkueCA9IDA7XHJcbiAgICAvLyBERC50ZXh0dXJlcy5sYXllckMuYm9keS54ID0gMDtcclxuXHJcbiAgICAvLyBSZXNldCBiYWNrZ3JvdW5kIHRleHR1cmVzJyB2ZWxvY2l0aWVzXHJcbiAgICAvLyBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAvLyBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDIgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAvLyBERC50ZXh0dXJlcy5sYXllckMuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDEgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcblxyXG4gICAgLy8gUmVzZXQgcGxheWVyIHBvc2l0aW9uIGFuZCB2ZWxvY2l0eVxyXG4gICAgLy8gREQucGxheWVyLmVsZW1lbnQuYm9keS54ID0gMzAwMDtcclxuICAgIC8vIERELnBsYXllci5lbGVtZW50LmJvZHkueSA9IGdhbWUud29ybGQuY2VudGVyWTtcclxuXHJcbiAgICAvLyBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgLy8gREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcbiAgICAvLyAvLyBSZXNldCBzcGlsbCBwb3NpdGlvbiBhbmQgdmVsb2NpdHlcclxuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnggPSAwO1xyXG4gICAgLy8gREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkueSA9IDA7XHJcblxyXG4gICAgLy8gREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcbiAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICBERC5nYW1lLndvcmxkLmxldmVsID0gMTtcclxuXHJcbiAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgICAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgICAgIGNyZWF0ZTogY3JlYXRlLFxyXG4gICAgICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgICAgIHJlbmRlcjogcmVuZGVyXHJcbiAgICB9KTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=