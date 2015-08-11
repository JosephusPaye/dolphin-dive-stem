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
    coinCount = Math.random()*100;

    // Create a thousand junk objects
    for (i = 0; i < coinCount; i++) {

        // For where it says 'star', i want to add a list which it will take from randomly.
        var coin = coins.create((Math.floor(Math.random() * 182000) + 10000), game.world.randomY, 'healthpack');
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

            console.log('no charges left');

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
        
        console.log('touching');
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
    console.log('junk hit!');
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
    game.debug.text('Score Multiplier: ' + scoreMultiplier, 32, 72);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBEb2xwaGluRGl2ZSBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgcHJvcGVydGllcyBsaWtlIGN1cnJlbnQgdmVyc2lvblxyXG4gKi9cclxudmFyIERvbHBoaW5EaXZlID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJ1xyXG59O1xyXG5cclxuLy8gSnVzdCBhIGZyaWVuZGx5IHJlbWluZGVyXHJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgRG9scGhpbkRpdmUudmVyc2lvbik7XHJcbiQoJyN2ZXJzaW9uVGFnJykuaHRtbChEb2xwaGluRGl2ZS52ZXJzaW9uKTtcclxuXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICB1cGRhdGU6IHVwZGF0ZSxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pO1xyXG5cclxudmFyIHBsYXllcjtcclxudmFyIGN1cnNvcnM7XHJcbnZhciBwbGF5ZXJTcGVlZCA9IDMwMDtcclxudmFyIHNwaWxsU3BlZWQgPSAyNTA7XHJcbnZhciBmaXJzdFJ1biA9IHRydWU7XHJcbnZhciBnYW1lUGF1c2VCdXR0b247XHJcbnZhciBtb2RpZmllcnMgPSB0cnVlO1xyXG52YXIgc3BpbGwgO1xyXG52YXIgb2lsU3BpbGw7XHJcbnZhciBzcGlsbEZyb250O1xyXG52YXIgcG9pbnQ7XHJcbnZhciBkZWF0aEFsZXJ0O1xyXG52YXIgb2JzdGFjbGVzO1xyXG52YXIganVua01ha2VyO1xyXG52YXIgYW5nbGU7XHJcbnZhciBhbmdsZUNvbXBlbnNhdGlvbjtcclxudmFyIHJlc3VsdDtcclxudmFyIGxldmVsID0gMTtcclxudmFyIEludGVydmFsID0gMjAwMDtcclxudmFyIHNjb3JlO1xyXG52YXIgc2NvcmVNdWx0aXBsaWVyID0gMTtcclxudmFyIGp1bmtDb3VudCA9IDEwMDA7XHJcbnZhciBjb2luQ291bnQgPSAwO1xyXG5cclxuLy9ib29zdCB2YXJpYWJsZXNcclxudmFyIGJvb3N0ID0gZmFsc2U7XHJcbnZhciBib29zdFZhbHVlID0gMDtcclxudmFyIGJvb3N0U3RhcnQgPSAwO1xyXG52YXIgYm9vc3RDaGFyZ2VzID0gMDtcclxuLyoqXHJcbiAqIFByZWxvYWQgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAqIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gKi9cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9CYWNrZ3JvdW5kU3RhdGljLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnaGVhbHRocGFjaycsICcvYXNzZXRzL2ltYWdlcy9maXJzdGFpZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL0RvbHBoaW4ucG5nJywgMjM1LCA5Nik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAqIGZvciB0aGUgZ2FtZVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAvLyBBZGQgYmFja2dyb3VuZFxyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ3NlYWZsb29yJyk7XHJcblxyXG4gICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMDAsIDEwODApO1xyXG5cclxuICAgIC8vIEFkZCBvaWxzcGlsbCBncm91cFxyXG4gICAgb2lsU3BpbGwgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgb2lsU3BpbGwuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICBvaWxTcGlsbC5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG5cclxuICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50c1xyXG4gICAgc3BpbGwgPSBvaWxTcGlsbC5jcmVhdGUoMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBzcGlsbEZyb250ID0gb2lsU3BpbGwuY3JlYXRlKDI0NTAsIDU1MCwgJ29pbHNwaWxsZnJvbnQnKTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZHVkZScpO1xyXG4gICAgcGxheWVyLnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAvLyBBZGQgc3RhclxyXG4gICAgcG9pbnQgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ3N0YXInKTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHBsYXllcik7XHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFuaW1hdGlvbiBmb3IgbW92aW5nIHJpZ2h0XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuICAgIFxyXG4gICAgLy9cclxuICAgIHZhciBwbGF5ZXJDb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgdmFyIGp1bmtDb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgdmFyIHNwaWxsQ29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgIHZhciBjb2luQ29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICAvLyBUaGlzIHBhcnQgaXMgdml0YWwgaWYgeW91IHdhbnQgdGhlIG9iamVjdHMgd2l0aCB0aGVpciBvd24gY29sbGlzaW9uIGdyb3VwcyB0byBzdGlsbCBcclxuICAgIC8vIENvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzICh3aGljaCB3ZSBkbylcclxuICAgIC8vIFdoYXQgdGhpcyBkb2VzIGlzIGFkanVzdCB0aGUgYm91bmRzIHRvIHVzZSBpdHMgb3duIGNvbGxpc2lvbiBncm91cC5cclxuICAgIGdhbWUucGh5c2ljcy5wMi51cGRhdGVCb3VuZHNDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIHZhciBqdW5rcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICBqdW5rcy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIGp1bmtzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGp1bmtDb3VudDsgaSsrKSB7XHJcblxyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgdmFyIGp1bmsgPSBqdW5rcy5jcmVhdGUoZ2FtZS53b3JsZC5yYW5kb21YLCBnYW1lLndvcmxkLnJhbmRvbVksICdzdGFyJyk7XHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuXHJcbiAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkqMjtcclxuICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueCA9IE1hdGgucmFuZG9tKCkqMTAwO1xyXG4gICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSo4MDtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIGp1bmtDb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoanVua0NvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbanVua0NvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgfVxyXG4gICAgdmFyIGNvaW5zID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIGNvaW5zLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgY29pbnMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgIGNvaW5Db3VudCA9IE1hdGgucmFuZG9tKCkqMTAwO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGNvaW5Db3VudDsgaSsrKSB7XHJcblxyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgdmFyIGNvaW4gPSBjb2lucy5jcmVhdGUoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4MjAwMCkgKyAxMDAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ2hlYWx0aHBhY2snKTtcclxuICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICBjb2luLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGNvaW4gdG8gdXNlIHRoZSBjb2luQ29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgY29pbi5ib2R5LnNldENvbGxpc2lvbkdyb3VwKGNvaW5Db2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIC8vIGNvaW5zIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBjb2luLmJvZHkuY29sbGlkZXMoW2NvaW5Db2xsaXNpb25Hcm91cCwgcGxheWVyQ29sbGlzaW9uR3JvdXBdKTtcclxuICAgIH1cclxuXHJcbiAgICBzcGlsbC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKHNwaWxsQ29sbGlzaW9uR3JvdXApO1xyXG4gICAgc3BpbGwuYm9keS5jb2xsaWRlcyhbc3BpbGxDb2xsaXNpb25Hcm91cCwgcGxheWVyQ29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICBwbGF5ZXIuYm9keS5zZXRDb2xsaXNpb25Hcm91cChwbGF5ZXJDb2xsaXNpb25Hcm91cCk7XHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlcyhqdW5rQ29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZXMoc3BpbGxDb2xsaXNpb25Hcm91cCwgZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZXMoY29pbkNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0Q29pbiwgdGhpcyk7XHJcbiAgICBcclxuICAgIHNjb3JlID0gMDtcclxuXHJcbiAgICAvLyBUaGUgY29udHJvbHNcclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhwbGF5ZXIpO1xyXG5cclxuICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgIGlmIChmaXJzdFJ1bikge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBmaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIG1haW5NZW51KCk7XHJcbiAgICB9XHJcbiAgICAvLyBHYW1lIG1vZGlmaWVycyBhbmQgdXBncmFkZXNcclxuICAgIGlmIChtb2RpZmllcnMgPT09IHRydWUpIHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBCYXNpYyBtb2RzXHJcbiAgICAgICAgcGxheWVyU3BlZWQ7XHJcbiAgICAgICAgc3BpbGxTcGVlZDtcclxuICAgICAgICBzY29yZU11bHRpcGxpZXI7XHJcbiAgICAgICAgSW50ZXJ2YWw7XHJcbiAgICAgICAganVua0NvdW50O1xyXG4gICAgICAgIGJvb3N0O1xyXG4gICAgICAgIGJvb3N0VmFsdWUgPSA1MDA7XHJcbiAgICAgICAgYm9vc3RDaGFyZ2VzID0gMTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBVcGdyYWRlc1xyXG4gICAgICAgIHBsYXllci5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHJcbiAgICBpZiAoYm9vc3QgPT09IHRydWUpIHtcclxuICAgICAgICBpZiAoKHBsYXllci54IC0gYm9vc3RTdGFydCkgPj0gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgbW9kaWZpZXJzICs9IC0xICogYm9vc3RWYWx1ZTtcclxuICAgICAgICAgICAgYm9vc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBHb3Zlcm5zIGFuZCBjb250cm9scyBib29zdFxyXG4gICAgaWYgKHJlc3VsdCAhPT0gJ0dhbWUgT3ZlciEnKSB7XHJcbiAgICAgICAgLy8gU2V0cyBzY29yZSBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gdGhlIC02MCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgc2NvcmUgPSAoKHBsYXllci54LzUwKS02MCkqc2NvcmVNdWx0aXBsaWVyO1xyXG4gICAgICAgIHNjb3JlID0gcGFyc2VJbnQoc2NvcmUsIDEwKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlcyB0aGUgcGxheWVyIGFuZCBvaWwgc3BpbGwgdmVsb2NpdGllc1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSBwbGF5ZXJTcGVlZCArIG1vZGlmaWVycztcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IHNwaWxsU3BlZWQ7XHJcbiAgICAgICAgc3BpbGxGcm9udC5ib2R5LnZlbG9jaXR5LnggPSBzcGlsbFNwZWVkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gU3RvcHMgYWxsIG9mIHRoZSBvYmplY3RzIHNvIHRoYXQgaXRzIG5vdCBjbHVua3kuIE9uY2UgdGhlIGRlYXRoIG1lbnUgaXMgaW1wbGVtZW50ZWQsIHRoaXMgd2lsbCBsb29rIHF1aXRlIG5pY2UuXHJcbiAgICAgICAgc3BpbGwuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICBzcGlsbEZyb250LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBhbmdsZSA9IDIwO1xyXG5cclxuXHJcbiAgICBpZiAocGxheWVyLmJvZHkueCA+PSAoSW50ZXJ2YWwgKiBsZXZlbCkgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ3NwZWVkIHVwIScpO1xyXG4gICAgICAgIHBsYXllclNwZWVkICs9IDUwO1xyXG4gICAgICAgIHNwaWxsU3BlZWQgKz0gNTA7XHJcbiAgICAgICAgbGV2ZWwgKz0gMTtcclxuICAgIFxyXG4gICAgfVxyXG4gICAgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgaWYgKGJvb3N0Q2hhcmdlcyA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGJvb3N0Q2hhcmdlcyArPSAtMTtcclxuICAgICAgICAgICAgbW9kaWZpZXJzICs9IGJvb3N0VmFsdWU7XHJcbiAgICAgICAgICAgIGJvb3N0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYm9vc3RTdGFydCA9IHBsYXllci54O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBjaGFyZ2VzIGxlZnQnKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy51cC5pc0Rvd24pIHtcclxuXHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSAtMSAqIGFuZ2xlO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIDMwMDtcclxuXHJcbiAgICB9IFxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bikge1xyXG5cclxuICAgICAgICBwbGF5ZXIuYm9keS5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcblxyXG4gICAgfSBcclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgICBwbGF5ZXIuYm9keS5hbmdsZSA9IDA7XHJcbiAgICBcclxuICAgIH1cclxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY3VycmVudGx5IG5vdCB3b3JraW5nIHNvIGkgd2lsbCBoYXZlIHRvIHJlYWQgdGhlIGRvY3Mgd2hlbiBpIGNhbiB0byBzZWUgaG93IHRvIGZpeCB0aGlzLlxyXG4gICAgaWYgKHBsYXllci5jb2xsaWRlV29ybGRCb3VuZHMgPT09IHRydWUpIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hpbmcnKTtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXVzZSBhY3RpdmF0aW9uXHJcbiAqIFxyXG4gKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZC5cclxuICovXHJcbiQoJyNwYXVzZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVGhpcyB3aWxsIGFjdGl2YXRlIFBoYXNlcidzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXHJcbiAgICBnYW1lLnBhdXNlZCA9ICFnYW1lLnBhdXNlZDtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZSB0aGUgcGF1c2UgbWVudVxyXG4gICAgcGF1c2VNZW51KCk7XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFBhdXNlIE1lbnVcclxuICpcclxuICogU2hvd3MgUGF1c2UgTWVudSBhbmQgaGFuZGxlcyByZXN1bWUsIHJlc3RhcnRcclxuICogYW5kIHF1aXRcclxuICovXHJcbmZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgIHZhciBwYXVzZU1lbnUgPSAkKCcjcGF1c2VNZW51Jyk7XHJcbiAgICB2YXIgcGF1c2VCdXR0b24gPSAkKCcjcGF1c2VCdXR0b24nKTtcclxuXHJcbiAgICBpZiAoZ2FtZS5wYXVzZWQpIHtcclxuICAgICAgICBwYXVzZU1lbnUucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRvIE1haW4gTWVudVxyXG4gICAgICAgICQoJyNtYWluTWVudUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBEbyBzY29yZSBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgY3JlYXRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc3VtZSBidXR0b24gaGFuZGxlclxyXG4gICAgICAgICQoJyNyZXN1bWVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgdGhlIGdhbWUsIHdpdGggdGhlIHNhbWUgcHJpbmNpcGxlXHJcbiAgICAgICAgJCgnI3Jlc3RhcnRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gU2NvcmUgY2FsY1xyXG5cclxuICAgICAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgY3JlYXRlKCk7XHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWFpbiBNZW51XHJcbiAqXHJcbiAqIFNob3dzIE1haW4gTWVudSBhbmQgaGFuZGxlcyBzdGFydCwgaGlnaHNjb3Jlc1xyXG4gKiBhbmQgYWJvdXRcclxuICovXHJcbmZ1bmN0aW9uIG1haW5NZW51KCkge1xyXG4gICAgLy8gU2hvdyB0aGUgbWFpbiBtZW51XHJcbiAgICAkKCcjbWFpbk1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAkKCcjcGF1c2VCdXR0b24nKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgLy8gU2V0dXAgbWFpbiBtZW51IGJ1dHRvblxyXG4gICAgJCgnI2JlZ2luQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICQoJyNwYXVzZUJ1dHRvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBIaWdoc2NvcmVzIGJ1dHRvbiBjbGlja1xyXG4gICAgJCgnI2hpZ2hTY29yZXNCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNzY29yZU1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNzY29yZVJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjc2NvcmVNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEFib3V0IGJ1dHRvbiBjbGlja1xyXG4gICAgJCgnI2Fib3V0QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTY29yZSBhcnJheSBjaGFuZ2VzIGVsZW1lbnRzIGJlZm9yZSBkaXNwbGF5IGhlcmVcclxuICAgICAgICAkKCcjYWJvdXRNZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAkKCcjYWJvdXRSZXR1cm5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI2Fib3V0TWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogSGFuZGxlIGdhbWUgb3ZlclxyXG4gKiBcclxuICogRGlzcGxheSBzY29yZSBhbmQgc3VjaC4uLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XHJcbiAgICByZXN1bHQgPSAnR2FtZSBPdmVyISc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnanVuayBoaXQhJyk7XHJcbiAgICBwbGF5ZXJTcGVlZCArPSAtNTA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbGxlY3RDb2luKCkge1xyXG4gICAgY29uc29sZS5sb2coJ0NvaW4gQ29sbGVjdGVkJyk7XHJcbiAgICAvL2FkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcbi8qKlxyXG4gKiBSZW5kZXIgZnVuY3Rpb25cclxuICovXHJcbmZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIC8vcGxheWVyLmJvZHkuZGVidWcgPSB0cnVlO1xyXG4gICAgLy9zcGlsbC5ib2R5LmRlYnVnID0gdHJ1ZTtcclxuICAgIGdhbWUuZGVidWcudGV4dChyZXN1bHQsIDMyLCAzMik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoc2NvcmUsIDMyLCA1Mik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBzY29yZU11bHRpcGxpZXIsIDMyLCA3Mik7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9