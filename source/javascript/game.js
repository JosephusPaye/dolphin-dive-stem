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
var playerSpeed = 300;
var spillSpeed = 250;
var firstRun = true;
var gamePauseButton;
var modifiers = true;
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
var Interval = 2000;
var score;
var scoreMultiplier = 1;
var junkCount = 1000;
var coinCount = 0;

//boost variables
var boost = false;
var boostValue = 0;
var boostStart = 0;
var boostCharges = 0;
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
    oilSpill.physicsBodyType = Phaser.Physics.P2JS;

    // Add oilspill elements
    spill = oilSpill.create(0, 0, 'oilspill');
    spillFront = oilSpill.create(2450, 550, 'oilspillfront');

    // Add player
    player = game.add.sprite(3000, game.world.centerY, 'dude');
    player.scale.setTo(0.4, 0.4);

    // Add star
    point = game.add.sprite(20, game.world.centerY, 'star');

    // Player physics properties
    game.physics.p2.enable(player);
    player.body.collideWorldBounds = true;

    // Animation for moving right
    player.animations.add('right', [4, 3, 5], 6, true);
    
    //
    var playerCollisionGroup = game.physics.p2.createCollisionGroup();
    var junkCollisionGroup = game.physics.p2.createCollisionGroup();
    var spillCollisionGroup = game.physics.p2.createCollisionGroup();
    var coinCollisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    var junks = game.add.group();
    junks.enableBody = true;
    junks.physicsBodyType = Phaser.Physics.P2JS;

    // Create a thousand junk objects
    for (var i = 0; i < junkCount; i++) {

        // For where it says 'star', i want to add a list which it will take from randomly.
        var junk = junks.create(game.world.randomX, game.world.randomY, 'star');
        // The size of the object will likely change too, if that is possible
        junk.body.setRectangle(24, 22);


        junk.body.angularVelocity = Math.random()*2;
        junk.body.velocity.x = Math.random()*100;
        junk.body.velocity.y = Math.random()*80;

        // Tell the junk to use the junkCollisionGroup 
        junk.body.setCollisionGroup(junkCollisionGroup);

        // junks will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        junk.body.collides([junkCollisionGroup, playerCollisionGroup]);
    }
    var coins = game.add.group();
    coins.enableBody = true;
    coins.physicsBodyType = Phaser.Physics.P2JS;
    coinCount = Math.random()*1000;

    // Create a thousand junk objects
    for (var i = 0; i < coinCount; i++) {

        // For where it says 'star', i want to add a list which it will take from randomly.
        var coin = coins.create(game.world.randomX, game.world.randomY, 'healthpack');
        // The size of the object will likely change too, if that is possible
        coin.body.setRectangle(24, 22);

        // Tell the coin to use the coinCollisionGroup 
        coin.body.setCollisionGroup(coinCollisionGroup);

        // coins will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        coin.body.collides([coinCollisionGroup, playerCollisionGroup]);
    }

    spill.body.setCollisionGroup(spillCollisionGroup);
    spill.body.collides([spillCollisionGroup, playerCollisionGroup]);

    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(junkCollisionGroup, junkHit, this);
    player.body.collides(spillCollisionGroup, gameOver, this);
    player.body.collides(coinCollisionGroup, collectCoin, this);
    
    score = 0;

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
    // Game modifiers and upgrades
    if (modifiers === true) {
        
        // Basic mods
        playerSpeed;
        spillSpeed;
        scoreMultiplier;
        Interval;
        junkCount;
        boost;
        boostValue = 500;
        boostCharges = 1;
        
        // Upgrades
        player.scale.setTo(0.4, 0.4);
    }
}

/**
 * Update function
 * 
 * The game loop - run once per frame
 */
function update() {

    if (boost === true) {
        if ((player.x - boostStart) >= 1000) {

            modifiers += -1 * boostValue;
            boost = false;
            console.log('Boost End :(');

        }
    }
    // Governs and controls boost
    if (result !== 'Game Over!') {
        // Sets score based on the position of the player. the -60 compensates for the position of the player in the world
        score = ((player.x/50)-60)*scoreMultiplier;
        score = parseInt(score, 10);

        // Updates the player and oil spill velocities
        player.body.velocity.x = playerSpeed + modifiers;
        player.animations.play('right');
        spill.body.velocity.x = spillSpeed;
        spillFront.body.velocity.x = spillSpeed;
    }
    else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice.
        spill.body.velocity.x = 0;
        spillFront.body.velocity.x = 0;
        player.body.velocity.x = 0;
    }

    // Reset the players velocity (movement)
    player.body.velocity.y = 0;
    angle = 20;


    if (player.body.x >= (Interval * level) ) {
        
        console.log('speed up!');
        playerSpeed += 50;
        spillSpeed += 50;
        level += 1;
    
    }
    if (cursors.right.isDown) {
        if (boostCharges > 0) {

            boostCharges += -1;
            modifiers += boostValue;
            boost = true;
            boostStart = player.x;
            console.log('BOOST!');
      
        }
        else {

            console.log('no charges left')

        }
    
    }
    if (cursors.up.isDown) {

        player.body.angle = -1 * angle;
        player.body.velocity.y = -1 * 300;

    } 
    else if (cursors.down.isDown) {

        player.body.angle = angle;
        player.body.velocity.y = 300;

    } 
    else {

        player.body.angle = 0;
    
    }
    // This function is currently not working so i will have to read the docs when i can to see how to fix this.
    if (player.collideWorldBounds === true) {
        
        console.log('touching')
        player.body.velocity.y = 0;
   
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
function gameOver() {
    result = 'Game Over!';
}

function junkHit() {
    console.log('junk hit!')
    playerSpeed += -50;
}

function collectCoin() {
    console.log('Coin Collected');
    //additionally have to add code which will remove the object from the game
}
/**
 * Render function
 */
function render() {
    //player.body.debug = true;
    //spill.body.debug = true;
    game.debug.text(result, 32, 32);
    game.debug.text(score, 32, 52);
    game.debug.text('Score Multiplier: ' + scoreMultiplier, 32, 72)
}
