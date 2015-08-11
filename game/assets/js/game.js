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
var coinRun = 0;

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
        var junk = junks.create((Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'star');
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
        var coin = coins.create((Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'healthpack');
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
    result = 'Game Over!';
}

function junkHit() {
    console.log('junk hit!');
    playerSpeed += -50;
}

function collectCoin(playerA, coinA) {
    console.log('Coin Collected');
    coinA.body = null;
    coinA.sprite.kill();
    coinRun += 1;
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
    game.debug.text('Coins: ' + coinRun, 32, 92);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBEb2xwaGluRGl2ZSBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgcHJvcGVydGllcyBsaWtlIGN1cnJlbnQgdmVyc2lvblxyXG4gKi9cclxudmFyIERvbHBoaW5EaXZlID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJ1xyXG59O1xyXG5cclxuLy8gSnVzdCBhIGZyaWVuZGx5IHJlbWluZGVyXHJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgRG9scGhpbkRpdmUudmVyc2lvbik7XHJcbiQoJyN2ZXJzaW9uVGFnJykuaHRtbChEb2xwaGluRGl2ZS52ZXJzaW9uKTtcclxuXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICB1cGRhdGU6IHVwZGF0ZSxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pO1xyXG5cclxudmFyIHBsYXllcjtcclxudmFyIGN1cnNvcnM7XHJcbnZhciBwbGF5ZXJTcGVlZCA9IDMwMDtcclxudmFyIHNwaWxsU3BlZWQgPSAyNTA7XHJcbnZhciBmaXJzdFJ1biA9IHRydWU7XHJcbnZhciBnYW1lUGF1c2VCdXR0b247XHJcbnZhciBtb2RpZmllcnMgPSB0cnVlO1xyXG52YXIgc3BpbGwgO1xyXG52YXIgb2lsU3BpbGw7XHJcbnZhciBzcGlsbEZyb250O1xyXG52YXIgcG9pbnQ7XHJcbnZhciBkZWF0aEFsZXJ0O1xyXG52YXIgb2JzdGFjbGVzO1xyXG52YXIganVua01ha2VyO1xyXG52YXIgYW5nbGU7XHJcbnZhciBhbmdsZUNvbXBlbnNhdGlvbjtcclxudmFyIHJlc3VsdDtcclxudmFyIGxldmVsID0gMTtcclxudmFyIEludGVydmFsID0gMjAwMDtcclxudmFyIHNjb3JlO1xyXG52YXIgc2NvcmVNdWx0aXBsaWVyID0gMTtcclxudmFyIGp1bmtDb3VudCA9IDEwMDA7XHJcbnZhciBjb2luQ291bnQgPSAwO1xyXG52YXIgY29pblJ1biA9IDA7XHJcblxyXG4vL2Jvb3N0IHZhcmlhYmxlc1xyXG52YXIgYm9vc3QgPSBmYWxzZTtcclxudmFyIGJvb3N0VmFsdWUgPSAwO1xyXG52YXIgYm9vc3RTdGFydCA9IDA7XHJcbnZhciBib29zdENoYXJnZXMgPSAwO1xyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL0JhY2tncm91bmRTdGF0aWMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdoZWFsdGhwYWNrJywgJy9hc3NldHMvaW1hZ2VzL2ZpcnN0YWlkLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvT2lsU3BpbGwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsZnJvbnQnLCAnL2Fzc2V0cy9pbWFnZXMvR3JhZGllbnRPaWwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2Fzc2V0cy9pbWFnZXMvRG9scGhpbi5wbmcnLCAyMzUsIDk2KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgIC8vIEFkZCBiYWNrZ3JvdW5kXHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnc2VhZmxvb3InKTtcclxuXHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGdyb3VwXHJcbiAgICBvaWxTcGlsbCA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICBvaWxTcGlsbC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIG9pbFNwaWxsLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnRzXHJcbiAgICBzcGlsbCA9IG9pbFNwaWxsLmNyZWF0ZSgwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIHNwaWxsRnJvbnQgPSBvaWxTcGlsbC5jcmVhdGUoMjQ1MCwgNTUwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG5cclxuICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgIHBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBwbGF5ZXIuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xyXG5cclxuICAgIC8vIEFkZCBzdGFyXHJcbiAgICBwb2ludCA9IGdhbWUuYWRkLnNwcml0ZSgyMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnc3RhcicpO1xyXG5cclxuICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUocGxheWVyKTtcclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gQW5pbWF0aW9uIGZvciBtb3ZpbmcgcmlnaHRcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNCwgMywgNV0sIDYsIHRydWUpO1xyXG4gICAgXHJcbiAgICAvL1xyXG4gICAgdmFyIHBsYXllckNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICB2YXIganVua0NvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICB2YXIgc3BpbGxDb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgdmFyIGNvaW5Db2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgdmFyIGp1bmtzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIGp1bmtzLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAganVua3MucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuXHJcbiAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwganVua0NvdW50OyBpKyspIHtcclxuXHJcbiAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICB2YXIganVuayA9IGp1bmtzLmNyZWF0ZSgoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBnYW1lLndvcmxkLnJhbmRvbVksICdzdGFyJyk7XHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuXHJcbiAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkqMjtcclxuICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueCA9IE1hdGgucmFuZG9tKCkqMTAwO1xyXG4gICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSo4MDtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIGp1bmtDb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoanVua0NvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbanVua0NvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgfVxyXG4gICAgdmFyIGNvaW5zID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIGNvaW5zLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgY29pbnMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgIGNvaW5Db3VudCA9IE1hdGgucmFuZG9tKCkqMTAwO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGNvaW5Db3VudDsgaSsrKSB7XHJcblxyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgdmFyIGNvaW4gPSBjb2lucy5jcmVhdGUoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgZ2FtZS53b3JsZC5yYW5kb21ZLCAnaGVhbHRocGFjaycpO1xyXG4gICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgIGNvaW4uYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUgY29pbiB0byB1c2UgdGhlIGNvaW5Db2xsaXNpb25Hcm91cCBcclxuICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoY29pbkNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbY29pbkNvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNwaWxsLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoc3BpbGxDb2xsaXNpb25Hcm91cCk7XHJcbiAgICBzcGlsbC5ib2R5LmNvbGxpZGVzKFtzcGlsbENvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgIHBsYXllci5ib2R5LnNldENvbGxpc2lvbkdyb3VwKHBsYXllckNvbGxpc2lvbkdyb3VwKTtcclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVzKGp1bmtDb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlcyhzcGlsbENvbGxpc2lvbkdyb3VwLCBnYW1lT3ZlciwgdGhpcyk7XHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlcyhjb2luQ29sbGlzaW9uR3JvdXAsIGNvbGxlY3RDb2luLCB0aGlzKTtcclxuICAgIFxyXG4gICAgc2NvcmUgPSAwO1xyXG5cclxuICAgIC8vIFRoZSBjb250cm9sc1xyXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcblxyXG4gICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxyXG4gICAgaWYgKGZpcnN0UnVuKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIGZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgIH1cclxuICAgIC8vIEdhbWUgbW9kaWZpZXJzIGFuZCB1cGdyYWRlc1xyXG4gICAgaWYgKG1vZGlmaWVycyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEJhc2ljIG1vZHNcclxuICAgICAgICBwbGF5ZXJTcGVlZDtcclxuICAgICAgICBzcGlsbFNwZWVkO1xyXG4gICAgICAgIHNjb3JlTXVsdGlwbGllcjtcclxuICAgICAgICBJbnRlcnZhbDtcclxuICAgICAgICBqdW5rQ291bnQ7XHJcbiAgICAgICAgYm9vc3Q7XHJcbiAgICAgICAgYm9vc3RWYWx1ZSA9IDUwMDtcclxuICAgICAgICBib29zdENoYXJnZXMgPSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFVwZ3JhZGVzXHJcbiAgICAgICAgcGxheWVyLnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuICAgIGlmIChib29zdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICgocGxheWVyLnggLSBib29zdFN0YXJ0KSA+PSAxMDAwKSB7XHJcblxyXG4gICAgICAgICAgICBtb2RpZmllcnMgKz0gLTEgKiBib29zdFZhbHVlO1xyXG4gICAgICAgICAgICBib29zdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIEdvdmVybnMgYW5kIGNvbnRyb2xzIGJvb3N0XHJcbiAgICBpZiAocmVzdWx0ICE9PSAnR2FtZSBPdmVyIScpIHtcclxuICAgICAgICAvLyBTZXRzIHNjb3JlIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiB0aGUgLTYwIGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICBzY29yZSA9ICgocGxheWVyLngvNTApLTYwKSpzY29yZU11bHRpcGxpZXI7XHJcbiAgICAgICAgc2NvcmUgPSBwYXJzZUludChzY29yZSwgMTApO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGVzIHRoZSBwbGF5ZXIgYW5kIG9pbCBzcGlsbCB2ZWxvY2l0aWVzXHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHBsYXllclNwZWVkICsgbW9kaWZpZXJzO1xyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgc3BpbGwuYm9keS52ZWxvY2l0eS54ID0gc3BpbGxTcGVlZDtcclxuICAgICAgICBzcGlsbEZyb250LmJvZHkudmVsb2NpdHkueCA9IHNwaWxsU3BlZWQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBTdG9wcyBhbGwgb2YgdGhlIG9iamVjdHMgc28gdGhhdCBpdHMgbm90IGNsdW5reS4gT25jZSB0aGUgZGVhdGggbWVudSBpcyBpbXBsZW1lbnRlZCwgdGhpcyB3aWxsIGxvb2sgcXVpdGUgbmljZS5cclxuICAgICAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIHNwaWxsRnJvbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGxheWVycyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgIGFuZ2xlID0gMjA7XHJcblxyXG5cclxuICAgIGlmIChwbGF5ZXIuYm9keS54ID49IChJbnRlcnZhbCAqIGxldmVsKSApIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnc3BlZWQgdXAhJyk7XHJcbiAgICAgICAgcGxheWVyU3BlZWQgKz0gNTA7XHJcbiAgICAgICAgc3BpbGxTcGVlZCArPSA1MDtcclxuICAgICAgICBsZXZlbCArPSAxO1xyXG4gICAgXHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICBpZiAoYm9vc3RDaGFyZ2VzID4gMCkge1xyXG5cclxuICAgICAgICAgICAgYm9vc3RDaGFyZ2VzICs9IC0xO1xyXG4gICAgICAgICAgICBtb2RpZmllcnMgKz0gYm9vc3RWYWx1ZTtcclxuICAgICAgICAgICAgYm9vc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBib29zdFN0YXJ0ID0gcGxheWVyLng7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCT09TVCEnKTtcclxuICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vIGNoYXJnZXMgbGVmdCcpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bikge1xyXG5cclxuICAgICAgICBwbGF5ZXIuYm9keS5hbmdsZSA9IC0xICogYW5nbGU7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0xICogMzAwO1xyXG5cclxuICAgIH0gXHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKSB7XHJcblxyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gYW5nbGU7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuXHJcbiAgICB9IFxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gMDtcclxuICAgIFxyXG4gICAgfVxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcgc28gaSB3aWxsIGhhdmUgdG8gcmVhZCB0aGUgZG9jcyB3aGVuIGkgY2FuIHRvIHNlZSBob3cgdG8gZml4IHRoaXMuXHJcbiAgICBpZiAocGxheWVyLmNvbGxpZGVXb3JsZEJvdW5kcyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0b3VjaGluZycpO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICBcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhdXNlIGFjdGl2YXRpb25cclxuICogXHJcbiAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gKi9cclxuJCgnI3BhdXNlQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUaGlzIHdpbGwgYWN0aXZhdGUgUGhhc2VyJ3MgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgIGdhbWUucGF1c2VkID0gIWdhbWUucGF1c2VkO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBwYXVzZSBtZW51XHJcbiAgICBwYXVzZU1lbnUoKTtcclxufSk7XHJcblxyXG4vKipcclxuICogUGF1c2UgTWVudVxyXG4gKlxyXG4gKiBTaG93cyBQYXVzZSBNZW51IGFuZCBoYW5kbGVzIHJlc3VtZSwgcmVzdGFydFxyXG4gKiBhbmQgcXVpdFxyXG4gKi9cclxuZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgdmFyIHBhdXNlTWVudSA9ICQoJyNwYXVzZU1lbnUnKTtcclxuICAgIHZhciBwYXVzZUJ1dHRvbiA9ICQoJyNwYXVzZUJ1dHRvbicpO1xyXG5cclxuICAgIGlmIChnYW1lLnBhdXNlZCkge1xyXG4gICAgICAgIHBhdXNlTWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgcGF1c2VCdXR0b24uYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdG8gTWFpbiBNZW51XHJcbiAgICAgICAgJCgnI21haW5NZW51QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIERvIHNjb3JlIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGJ1dHRvbiBoYW5kbGVyXHJcbiAgICAgICAgJCgnI3Jlc3VtZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgZ2FtZSwgd2l0aCB0aGUgc2FtZSBwcmluY2lwbGVcclxuICAgICAgICAkKCcjcmVzdGFydEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBTY29yZSBjYWxjXHJcblxyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYWluIE1lbnVcclxuICpcclxuICogU2hvd3MgTWFpbiBNZW51IGFuZCBoYW5kbGVzIHN0YXJ0LCBoaWdoc2NvcmVzXHJcbiAqIGFuZCBhYm91dFxyXG4gKi9cclxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAvLyBTaG93IHRoZSBtYWluIG1lbnVcclxuICAgICQoJyNtYWluTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnI3BhdXNlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEhpZ2hzY29yZXMgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjaGlnaFNjb3Jlc0J1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgZGlzcGxheUhpZ2hTY29yZXMoKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlUmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgQWJvdXQgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNhYm91dE1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNhYm91dFJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAqIFxyXG4gKiBEaXNwbGF5IHNjb3JlIGFuZCBzdWNoLi4uXHJcbiAqL1xyXG5mdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgIHJlc3VsdCA9ICdHYW1lIE92ZXIhJztcclxufVxyXG5cclxuZnVuY3Rpb24ganVua0hpdCgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdqdW5rIGhpdCEnKTtcclxuICAgIHBsYXllclNwZWVkICs9IC01MDtcclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyQSwgY29pbkEpIHtcclxuICAgIGNvbnNvbGUubG9nKCdDb2luIENvbGxlY3RlZCcpO1xyXG4gICAgY29pbkEuYm9keSA9IG51bGw7XHJcbiAgICBjb2luQS5zcHJpdGUua2lsbCgpO1xyXG4gICAgY29pblJ1biArPSAxO1xyXG4gICAgLy9hZGRpdGlvbmFsbHkgaGF2ZSB0byBhZGQgY29kZSB3aGljaCB3aWxsIHJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIGdhbWVcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgLy9wbGF5ZXIuYm9keS5kZWJ1ZyA9IHRydWU7XHJcbiAgICAvL3NwaWxsLmJvZHkuZGVidWcgPSB0cnVlO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KHJlc3VsdCwgMzIsIDMyKTtcclxuICAgIGdhbWUuZGVidWcudGV4dChzY29yZSwgMzIsIDUyKTtcclxuICAgIGdhbWUuZGVidWcudGV4dCgnU2NvcmUgTXVsdGlwbGllcjogJyArIHNjb3JlTXVsdGlwbGllciwgMzIsIDcyKTtcclxuICAgIGdhbWUuZGVidWcudGV4dCgnQ29pbnM6ICcgKyBjb2luUnVuLCAzMiwgOTIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNwbGF5SGlnaFNjb3JlcygpIHtcclxuICAgIHZhciBoaWdoU2NvcmVzID0gWzEyMCwgMTIwMCwgMTA5MjAsIDE1MzEzNSwgNTU1LCAzNDMsIDJdO1xyXG5cclxuICAgIGhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcblxyXG4gICAgaGlnaFNjb3Jlcy5mb3JFYWNoKGZ1bmN0aW9uKHNjb3JlLCBpbmRleCkgeyBcclxuICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8bGk+PGE+JyArIHNjb3JlICsgJzwvYT48L2xpPic7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcjaGlnaHNjb3Jlcy1tZW51JykuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9