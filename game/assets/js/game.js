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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIERvbHBoaW5EaXZlIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBwcm9wZXJ0aWVzIGxpa2UgY3VycmVudCB2ZXJzaW9uXHJcbiAqL1xyXG52YXIgRG9scGhpbkRpdmUgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnXHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBEb2xwaGluRGl2ZS52ZXJzaW9uKTtcclxuJCgnI3ZlcnNpb25UYWcnKS5odG1sKERvbHBoaW5EaXZlLnZlcnNpb24pO1xyXG5cclxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgIHByZWxvYWQ6IHByZWxvYWQsXHJcbiAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSk7XHJcblxyXG52YXIgcGxheWVyO1xyXG52YXIgY3Vyc29ycztcclxudmFyIHNwZWVkID0gMzAwO1xyXG52YXIgZmlyc3RSdW4gPSB0cnVlO1xyXG52YXIgZ2FtZVBhdXNlQnV0dG9uO1xyXG5cclxudmFyIHNwaWxsIDtcclxudmFyIG9pbFNwaWxsO1xyXG52YXIgc3BpbGxGcm9udDtcclxudmFyIHBvaW50O1xyXG52YXIgZGVhdGhBbGVydDtcclxudmFyIG9ic3RhY2xlcztcclxudmFyIGp1bmtNYWtlcjtcclxudmFyIGFuZ2xlO1xyXG52YXIgYW5nbGVDb21wZW5zYXRpb247XHJcbnZhciByZXN1bHQ7XHJcbnZhciBsZXZlbCA9IDE7XHJcbnZhciB4ID0gMjAwMDtcclxuXHJcbi8qKlxyXG4gKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHMgaW5jbHVkaW5nIFxyXG4gKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICovXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvQmFja2dyb3VuZFN0YXRpYy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gKiBmb3IgdGhlIGdhbWVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIC8vIEVuYWJsZSB0aGUgUDIgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG4gICAgLy8gQWRkIGJhY2tncm91bmRcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdzZWFmbG9vcicpO1xyXG5cclxuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZ3JvdXBcclxuICAgIG9pbFNwaWxsID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIG9pbFNwaWxsLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50c1xyXG4gICAgc3BpbGwgPSBvaWxTcGlsbC5jcmVhdGUoLTMxMDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgc3BpbGxGcm9udCA9IG9pbFNwaWxsLmNyZWF0ZSgtODAwLCAwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG5cclxuICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgIHBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgyMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZHVkZScpO1xyXG4gICAgcGxheWVyLnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAvLyBBZGQgc3RhclxyXG4gICAgcG9pbnQgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ3N0YXInKTtcclxuXHJcbiAgICAvLyBFbmFibGUgcGh5c2ljcyBvbiB0aGUgb2JqZWN0c1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShwbGF5ZXIpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShzcGlsbCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy4gQWRkIGJvdW5jZSB0byBwbGF5ZXJcclxuICAgIC8vIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gQW5pbWF0aW9uczogd2Fsa2luZyBsZWZ0IGFuZCByaWdodFxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDJdLCA2LCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNCwgMywgNV0sIDYsIHRydWUpO1xyXG5cclxuICAgIC8vIGp1bmtNYWtlciA9IGdhbWUuYWRkLmVtaXR0ZXIoMSwgMSwgNTAwMCk7XHJcbiAgICAvLyBqdW5rTWFrZXIuYXJlYSA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKGdhbWUuY2FtZXJhLngsIDEsIDEwLCAxMDgwKTtcclxuICAgIC8vIGp1bmtNYWtlci5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIC8vIGp1bmtNYWtlci5mcmVxdWVuY3kgPSAxMDAwO1xyXG4gICAgLy8ganVua01ha2VyLm1heFJvdGF0aW9uID0gMjA7XHJcbiAgICAvLyBqdW5rTWFrZXIubWluUm90YXRpb24gPSAyMDtcclxuICAgIC8vIGp1bmtNYWtlci5saWZlc3BhbiA9IDEwMDAwMDAwO1xyXG4gICAgLy8ganVua01ha2VyLm1ha2VQYXJ0aWNsZXMoJ3N0YXInKTtcclxuICAgIC8vIGp1bmtNYWtlci5ib3VuY2Uuc2V0VG8oMC41LCAwLjUpO1xyXG4gICAgLy8ganVua01ha2VyLmdyYXZpdHkgPSAwO1xyXG4gICAgLy8ganVua01ha2VyLm9uID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgdmFyIHBsYXllckNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICB2YXIganVua0NvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gVGhpcyBwYXJ0IGlzIHZpdGFsIGlmIHlvdSB3YW50IHRoZSBvYmplY3RzIHdpdGggdGhlaXIgb3duIGNvbGxpc2lvbiBncm91cHMgdG8gc3RpbGwgXHJcbiAgICAvLyBjb2xsaWRlIHdpdGggdGhlIHdvcmxkIGJvdW5kcyAod2hpY2ggd2UgZG8pXHJcbiAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICBnYW1lLnBoeXNpY3MucDIudXBkYXRlQm91bmRzQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICB2YXIganVua3MgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAganVua3MuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICBqdW5rcy5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDAwOyBpKyspIHtcclxuICAgICAgICB2YXIganVuayA9IGp1bmtzLmNyZWF0ZShnYW1lLndvcmxkLnJhbmRvbVgsIGdhbWUud29ybGQucmFuZG9tWSwgJ3N0YXInKTtcclxuICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBqdW5rQ29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKGp1bmtDb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW2p1bmtDb2xsaXNpb25Hcm91cCwgcGxheWVyQ29sbGlzaW9uR3JvdXBdKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5ZXIuYm9keS5zZXRDb2xsaXNpb25Hcm91cChwbGF5ZXJDb2xsaXNpb25Hcm91cCk7XHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlcyhqdW5rQ29sbGlzaW9uR3JvdXAsIGdhbWVPdmVyLCB0aGlzKTtcclxuXHJcbiAgICAvLyBUaGUgY29udHJvbHNcclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhwbGF5ZXIpO1xyXG5cclxuICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgIGlmIChmaXJzdFJ1bikge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBmaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIG1haW5NZW51KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuICAgIC8vIGp1bmtNYWtlci54ID0gZ2FtZS5jYW1lcmEueCAgKyA4NTA7XHJcblxyXG4gICAgLy8gQ29sbGlzaW9uc1xyXG4gICAgLy8gcGxheWVyLmJvZHkub25CZWdpbkNvbnRhY3QuYWRkKGdhbWVPdmVyLCB0aGlzKVxyXG4gICAgLy8gZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKTtcclxuICAgIC8vIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHNwaWxsLCBnYW1lT3ZlciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgc3BpbGwuYm9keS52ZWxvY2l0eS54ID0gc3BlZWQgLSAyMDA7XHJcbiAgICBzcGlsbEZyb250LmJvZHkudmVsb2NpdHkueCA9IHNwZWVkIC0gMjAwO1xyXG5cclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBhbmdsZSA9IDQ1O1xyXG5cclxuICAgIGlmIChwbGF5ZXIuYm9keS54ID49ICh4ICogbGV2ZWwpICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzcGVlZCB1cCEnKTtcclxuXHJcbiAgICAgICAgc3BlZWQgKz0gNTA7XHJcbiAgICAgICAgbGV2ZWwgKz0gMTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTEgKiBzcGVlZDtcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICAgICAgYW5nbGVDb21wZW5zYXRpb24gPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSBzcGVlZDtcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIGFuZ2xlQ29tcGVuc2F0aW9uID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bikge1xyXG4gICAgICAgIGlmIChhbmdsZUNvbXBlbnNhdGlvbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgYW5nbGUgPSBhbmdsZSAqIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTEgKiAzMDA7XHJcbiAgICB9IGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pIHtcclxuICAgICAgICBpZiAoYW5nbGVDb21wZW5zYXRpb24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICBhbmdsZSA9IGFuZ2xlICogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5ZXIuYm9keS5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3Vyc29ycy5kb3duLmlzRG93biAmJiBjdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkO1xyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gNDU7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBhbmdsZUNvbXBlbnNhdGlvbiA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmKGN1cnNvcnMuZG93bi5pc0Rvd24gJiYgY3Vyc29ycy5sZWZ0LmlzRG93bikge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xICogc3BlZWQ7XHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSAtNDU7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgICAgIGFuZ2xlQ29tcGVuc2F0aW9uID0gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYoY3Vyc29ycy51cC5pc0Rvd24gJiYgY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSAtNDU7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBhbmdsZUNvbXBlbnNhdGlvbiA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmKGN1cnNvcnMudXAuaXNEb3duICYmIGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLXNwZWVkO1xyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gNDU7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgICAgIGFuZ2xlQ29tcGVuc2F0aW9uID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiAoZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKSA9PT0gdHJ1ZSkge1xyXG4gICAgLy8gICAgIGRlYXRoQWxlcnQgPSBnYW1lLmFkZC50ZXh0KChnYW1lLmNhbWVyYS54ICsgMTYpLCAoZ2FtZS5jYW1lcmEueSArIDE2KSwgJ0l0cyB0b3VjaGluZyBtZSEnLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjRkZGJyB9KTtcclxuICAgIC8vIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhdXNlIGFjdGl2YXRpb25cclxuICogXHJcbiAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gKi9cclxuJCgnI3BhdXNlQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUaGlzIHdpbGwgYWN0aXZhdGUgUGhhc2VyJ3MgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgIGdhbWUucGF1c2VkID0gIWdhbWUucGF1c2VkO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBwYXVzZSBtZW51XHJcbiAgICBwYXVzZU1lbnUoKTtcclxufSk7XHJcblxyXG4vKipcclxuICogUGF1c2UgTWVudVxyXG4gKlxyXG4gKiBTaG93cyBQYXVzZSBNZW51IGFuZCBoYW5kbGVzIHJlc3VtZSwgcmVzdGFydFxyXG4gKiBhbmQgcXVpdFxyXG4gKi9cclxuZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgdmFyIHBhdXNlTWVudSA9ICQoJyNwYXVzZU1lbnUnKTtcclxuICAgIHZhciBwYXVzZUJ1dHRvbiA9ICQoJyNwYXVzZUJ1dHRvbicpO1xyXG5cclxuICAgIGlmIChnYW1lLnBhdXNlZCkge1xyXG4gICAgICAgIHBhdXNlTWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgcGF1c2VCdXR0b24uYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdG8gTWFpbiBNZW51XHJcbiAgICAgICAgJCgnI21haW5NZW51QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIERvIHNjb3JlIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGJ1dHRvbiBoYW5kbGVyXHJcbiAgICAgICAgJCgnI3Jlc3VtZUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgZ2FtZSwgd2l0aCB0aGUgc2FtZSBwcmluY2lwbGVcclxuICAgICAgICAkKCcjcmVzdGFydEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBTY29yZSBjYWxjXHJcblxyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYWluIE1lbnVcclxuICpcclxuICogU2hvd3MgTWFpbiBNZW51IGFuZCBoYW5kbGVzIHN0YXJ0LCBoaWdoc2NvcmVzXHJcbiAqIGFuZCBhYm91dFxyXG4gKi9cclxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAvLyBTaG93IHRoZSBtYWluIG1lbnVcclxuICAgICQoJyNtYWluTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnI3BhdXNlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIEhpZ2hzY29yZXMgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjaGlnaFNjb3Jlc0J1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgJCgnI3Njb3JlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI3Njb3JlUmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNzY29yZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgQWJvdXQgYnV0dG9uIGNsaWNrXHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFNjb3JlIGFycmF5IGNoYW5nZXMgZWxlbWVudHMgYmVmb3JlIGRpc3BsYXkgaGVyZVxyXG4gICAgICAgICQoJyNhYm91dE1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNhYm91dFJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjYWJvdXRNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAqIFxyXG4gKiBEaXNwbGF5IHNjb3JlIGFuZCBzdWNoLi4uXHJcbiAqL1xyXG5mdW5jdGlvbiBnYW1lT3Zlcihib2R5LCBzaGFwZUEsIHNoYXBlQiwgZXF1YXRpb24pIHtcclxuICAgIHJlc3VsdCA9ICdHYW1lIE92ZXIhJztcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgLy8gcGxheWVyLmJvZHkuZGVidWcgPSB0cnVlO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KHJlc3VsdCwgMzIsIDMyKTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=