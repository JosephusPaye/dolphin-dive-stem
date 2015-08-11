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
            amount: Math.random() * 100,
            element: [],
            collisionGroup: null 
        },

        junks: {
            amount: 1000,
            element: [],
            collisionGroup: null 
        },
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

            ultiplier: 1,
        }
    }
};

// Just a friendly reminder
console.info('Dolphin Dive v' + DD.version);
$('#versionTag').html(DD.version);

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

    // Add oilspill elements.
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');
    DD.objects.spill.element.enableBody = true;
    DD.objects.spill.element.physicsBodyType = Phaser.Physics.P2JS;

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
        junk = game.add.sprite((Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'star');
        junk.enableBody = true;
        junk.physicsBodyType = Phaser.Physics.P2JS;

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

        DD.objects.junks.element.push(junk);
    }

    var coin;

    // Create a thousand junk objects
    for (i = 0; i < DD.objects.coins.amount; i++) {
        // For where it says 'star', i want to add a list which it will take from randomly.
        coin = coins.create((Math.floor(Math.random() * 187000) + 5000), game.world.randomY, 'healthpack');
        coin.enableBody = true;
        coin.physicsBodyType = Phaser.Physics.P2JS;

        // The size of the object will likely change too, if that is possible
        coin.body.setRectangle(24, 22);

        // Tell the coin to use the coinCollisionGroup 
        coin.body.setCollisionGroup(coinCollisionGroup);

        // coins will collide against themselves and the player
        // If you don't set this they'll not collide with anything.
        // The first parameter is either an array or a single collision group.
        coin.body.collides([coinCollisionGroup, playerCollisionGroup]);

        DD.objects.coins.push(coin);
    }

    DD.objects.spill.body.setCollisionGroup(spillCollisionGroup);
    DD.objects.spill.body.collides([spillCollisionGroup, playerCollisionGroup]);

    DD.player.body.setCollisionGroup(playerCollisionGroup);
    DD.player.body.collides(junkCollisionGroup, junkHit, this);
    DD.player.body.collides(spillCollisionGroup, gameOver, this);
    DD.player.body.collides(coinCollisionGroup, collectCoin, this);

    // The controls
    DD.game.cursors = game.input.keyboard.createCursorKeys();

    // Setup camera
    game.camera.follow(DD.player.element);
    // Pause and show Main Menu on first run
    if (DD.game.firstRun) {
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

    if (DD.game.modifiers.boost.active === true) {
        if ((player.x - DD.game.modifiers.boost.begin) >= 1000) {

            modifiers += -1 * boostValue;
            boost = false;
            console.log('Boost End :(');

        }
    }
    // Governs and controls boost
    if (DD.game.runEnd !== true) {
        // Sets DD.game.score.lastRun based on the position of the player. the -60 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x/50)-60)*DD.game.score.lastRunMultiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Updates the player and oil spill velocities
        DD.player.element.body.velocity.x = DD.player.Speed + DD.game.modifiers.total;
        DD.player.element.animations.play('right');
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed;
    }
    else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice.
        DD.objects.spill.element.body.velocity.x = 0;
        DD.player.element.body.velocity.x = 0;
    }

    // Reset the players velocity (movement)
    DD.player.element.body.velocity.y = 0;

    if (player.body.x >= (Interval * level) ) {
        
        console.log('speed up!');
        playerSpeed += 50;
        spillSpeed += 50;
        level += 1;
    
    }
    if (DD.game.cursors.right.isDown) {
        if (boostCharges > 0) {

            DD.modifiers.boost.charges += -1;
            DD.modifiers.total += DD.modifiers.boost.total;
            DD.modifiers.boost.active = true;
            boostStart = player.x;
            console.log('BOOST!');
      
        }
        else {

            console.log('no charges left');

        }
    
    }
    if (DD.game.cursors.up.isDown) {

        DD.player.element.body.angle = -1 * DD.player.angle;
        DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;

    } 
    else if (DD.game.cursors.down.isDown) {

        DD.player.element.body.angle = DD.player.angle;
        DD.player.element.body.velocity.y = DD.player.vertSpeed;

    } 
    else {

        DD.player.element.body.angle = 0;
    
    }
    // This function is currently not working so i will have to read the docs when i can to see how to fix this.
    if (DD.player.element.collideWorldBounds === true) {
        
        console.log('touching');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIEREIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBwcm9wZXJ0aWVzIGxpa2UgY3VycmVudCB2ZXJzaW9uXHJcbiAqL1xyXG52YXIgREQgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxyXG5cclxuICAgIG9iamVjdHM6IHtcclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBzcGVlZDogMjUwLFxyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNvaW5zOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogTWF0aC5yYW5kb20oKSAqIDEwMCxcclxuICAgICAgICAgICAgZWxlbWVudDogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsIFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGp1bmtzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMTAwMCxcclxuICAgICAgICAgICAgZWxlbWVudDogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsIFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuICAgICAgICB3b3JsZDoge1xyXG4gICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIwMDBcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzY29yZToge1xyXG4gICAgICAgICAgICBjb2luczoge1xyXG4gICAgICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICBoaWdoU2NvcmVzOiBbXVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYm9vc3Q6IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgICAgIGJlZ2luOiAwLFxyXG4gICAgICAgICAgICAgICAgY2hhcmdlczogMCxcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHVsdGlwbGllcjogMSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuJCgnI3ZlcnNpb25UYWcnKS5odG1sKERELnZlcnNpb24pO1xyXG5cclxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgIHByZWxvYWQ6IHByZWxvYWQsXHJcbiAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgIHVwZGF0ZTogdXBkYXRlLFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSk7XHJcblxyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL0JhY2tncm91bmRTdGF0aWMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdoZWFsdGhwYWNrJywgJy9hc3NldHMvaW1hZ2VzL2ZpcnN0YWlkLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvT2lsU3BpbGwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsZnJvbnQnLCAnL2Fzc2V0cy9pbWFnZXMvR3JhZGllbnRPaWwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2Fzc2V0cy9pbWFnZXMvRG9scGhpbi5wbmcnLCAyMzUsIDk2KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgIC8vIEFkZCBiYWNrZ3JvdW5kXHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnc2VhZmxvb3InKTtcclxuXHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnRzLlxyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgLy8gQWRkIHBsYXllclxyXG4gICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZHVkZScpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xyXG5cclxuICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFuaW1hdGlvbiBmb3IgbW92aW5nIHJpZ2h0XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNCwgMywgNV0sIDYsIHRydWUpO1xyXG4gICAgXHJcbiAgICAvL1xyXG4gICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gVGhpcyBwYXJ0IGlzIHZpdGFsIGlmIHlvdSB3YW50IHRoZSBvYmplY3RzIHdpdGggdGhlaXIgb3duIGNvbGxpc2lvbiBncm91cHMgdG8gc3RpbGwgXHJcbiAgICAvLyBDb2xsaWRlIHdpdGggdGhlIHdvcmxkIGJvdW5kcyAod2hpY2ggd2UgZG8pXHJcbiAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICBnYW1lLnBoeXNpY3MucDIudXBkYXRlQm91bmRzQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICB2YXIganVuaztcclxuXHJcbiAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgREQub2JqZWN0cy5qdW5rcy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAganVuayA9IGdhbWUuYWRkLnNwcml0ZSgoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBnYW1lLndvcmxkLnJhbmRvbVksICdzdGFyJyk7XHJcbiAgICAgICAganVuay5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICBqdW5rLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcblxyXG4gICAgICAgIGp1bmsuYm9keS5hbmd1bGFyVmVsb2NpdHkgPSBNYXRoLnJhbmRvbSgpKjI7XHJcbiAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnggPSBNYXRoLnJhbmRvbSgpKjEwMDtcclxuICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkqODA7XHJcblxyXG4gICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBqdW5rQ29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKGp1bmtDb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW2p1bmtDb2xsaXNpb25Hcm91cCwgcGxheWVyQ29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50LnB1c2goanVuayk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvaW47XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgY29pbiA9IGNvaW5zLmNyZWF0ZSgoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBnYW1lLndvcmxkLnJhbmRvbVksICdoZWFsdGhwYWNrJyk7XHJcbiAgICAgICAgY29pbi5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICBjb2luLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgIGNvaW4uYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUgY29pbiB0byB1c2UgdGhlIGNvaW5Db2xsaXNpb25Hcm91cCBcclxuICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoY29pbkNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbY29pbkNvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zLnB1c2goY29pbik7XHJcbiAgICB9XHJcblxyXG4gICAgREQub2JqZWN0cy5zcGlsbC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKHNwaWxsQ29sbGlzaW9uR3JvdXApO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5ib2R5LmNvbGxpZGVzKFtzcGlsbENvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgIERELnBsYXllci5ib2R5LnNldENvbGxpc2lvbkdyb3VwKHBsYXllckNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELnBsYXllci5ib2R5LmNvbGxpZGVzKGp1bmtDb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuYm9keS5jb2xsaWRlcyhzcGlsbENvbGxpc2lvbkdyb3VwLCBnYW1lT3ZlciwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuYm9keS5jb2xsaWRlcyhjb2luQ29sbGlzaW9uR3JvdXAsIGNvbGxlY3RDb2luLCB0aGlzKTtcclxuXHJcbiAgICAvLyBUaGUgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIGZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPT09IHRydWUpIHtcclxuICAgICAgICBpZiAoKHBsYXllci54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIG1vZGlmaWVycyArPSAtMSAqIGJvb3N0VmFsdWU7XHJcbiAgICAgICAgICAgIGJvb3N0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCb29zdCBFbmQgOignKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmIChERC5nYW1lLnJ1bkVuZCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiB0aGUgLTYwIGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAoKERELnBsYXllci5lbGVtZW50LngvNTApLTYwKSpERC5nYW1lLnNjb3JlLmxhc3RSdW5NdWx0aXBsaWVyO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGVzIHRoZSBwbGF5ZXIgYW5kIG9pbCBzcGlsbCB2ZWxvY2l0aWVzXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLlNwZWVkICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLnNwZWVkO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gU3RvcHMgYWxsIG9mIHRoZSBvYmplY3RzIHNvIHRoYXQgaXRzIG5vdCBjbHVua3kuIE9uY2UgdGhlIGRlYXRoIG1lbnUgaXMgaW1wbGVtZW50ZWQsIHRoaXMgd2lsbCBsb29rIHF1aXRlIG5pY2UuXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGxheWVycyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG5cclxuICAgIGlmIChwbGF5ZXIuYm9keS54ID49IChJbnRlcnZhbCAqIGxldmVsKSApIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnc3BlZWQgdXAhJyk7XHJcbiAgICAgICAgcGxheWVyU3BlZWQgKz0gNTA7XHJcbiAgICAgICAgc3BpbGxTcGVlZCArPSA1MDtcclxuICAgICAgICBsZXZlbCArPSAxO1xyXG4gICAgXHJcbiAgICB9XHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChib29zdENoYXJnZXMgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBERC5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyArPSAtMTtcclxuICAgICAgICAgICAgREQubW9kaWZpZXJzLnRvdGFsICs9IERELm1vZGlmaWVycy5ib29zdC50b3RhbDtcclxuICAgICAgICAgICAgREQubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGJvb3N0U3RhcnQgPSBwbGF5ZXIueDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gY2hhcmdlcyBsZWZ0Jyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG4gICAgaWYgKERELmdhbWUuY3Vyc29ycy51cC5pc0Rvd24pIHtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IC0xICogREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuXHJcbiAgICB9IFxyXG4gICAgZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duKSB7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuXHJcbiAgICB9IFxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgXHJcbiAgICB9XHJcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGN1cnJlbnRseSBub3Qgd29ya2luZyBzbyBpIHdpbGwgaGF2ZSB0byByZWFkIHRoZSBkb2NzIHdoZW4gaSBjYW4gdG8gc2VlIGhvdyB0byBmaXggdGhpcy5cclxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5jb2xsaWRlV29ybGRCb3VuZHMgPT09IHRydWUpIHtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hpbmcnKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICBcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhdXNlIGFjdGl2YXRpb25cclxuICogXHJcbiAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gKi9cclxuJCgnI3BhdXNlQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUaGlzIHdpbGwgYWN0aXZhdGUgUGhhc2VyJ3MgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgIGdhbWUucGF1c2VkID0gIWdhbWUucGF1c2VkO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBwYXVzZSBtZW51XHJcbiAgICBwYXVzZU1lbnUoKTtcclxufSk7XHJcblxyXG4vKipcclxuICogUGF1c2UgTWVudVxyXG4gKlxyXG4gKiBTaG93cyBQYXVzZSBNZW51IGFuZCBoYW5kbGVzIHJlc3VtZSwgcmVzdGFydFxyXG4gKiBhbmQgcXVpdFxyXG4gKi9cclxuZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgdmFyIHBhdXNlTWVudSA9ICQoJyNwYXVzZU1lbnUnKTtcclxuICAgIHZhciBwYXVzZUJ1dHRvbiA9ICQoJyNwYXVzZUJ1dHRvbicpO1xyXG5cclxuICAgIGlmIChnYW1lLnBhdXNlZCkge1xyXG4gICAgICAgIHBhdXNlTWVudS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgcGF1c2VCdXR0b24uYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdG8gTWFpbiBNZW51XHJcbiAgICAgICAgJCgnI21haW5NZW51QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIERvIHNjb3JlIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcGF1c2VNZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgcGF1c2VCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgYnV0dG9uIGhhbmRsZXJcclxuICAgICAgICAkKCcjcmVzdW1lQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBnYW1lLCB3aXRoIHRoZSBzYW1lIHByaW5jaXBsZVxyXG4gICAgICAgICQoJyNyZXN0YXJ0QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIFNjb3JlIGNhbGNcclxuXHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE1haW4gTWVudVxyXG4gKlxyXG4gKiBTaG93cyBNYWluIE1lbnUgYW5kIGhhbmRsZXMgc3RhcnQsIGhpZ2hzY29yZXNcclxuICogYW5kIGFib3V0XHJcbiAqL1xyXG5mdW5jdGlvbiBtYWluTWVudSgpIHtcclxuICAgIC8vIFNob3cgdGhlIG1haW4gbWVudVxyXG4gICAgJCgnI21haW5NZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnI3BhdXNlQnV0dG9uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFNldHVwIG1haW4gbWVudSBidXR0b25cclxuICAgICQoJyNiZWdpbkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAkKCcjcGF1c2VCdXR0b24nKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgSGlnaHNjb3JlcyBidXR0b24gY2xpY2tcclxuICAgICQoJyNoaWdoU2NvcmVzQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTY29yZSBhcnJheSBjaGFuZ2VzIGVsZW1lbnRzIGJlZm9yZSBkaXNwbGF5IGhlcmVcclxuICAgICAgICBkaXNwbGF5SGlnaFNjb3JlcygpO1xyXG5cclxuICAgICAgICAkKCcjc2NvcmVNZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAkKCcjc2NvcmVSZXR1cm5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3Njb3JlTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBBYm91dCBidXR0b24gY2xpY2tcclxuICAgICQoJyNhYm91dEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgJCgnI2Fib3V0TWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI2Fib3V0UmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNhYm91dE1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICogXHJcbiAqIERpc3BsYXkgc2NvcmUgYW5kIHN1Y2guLi5cclxuICovXHJcbmZ1bmN0aW9uIGdhbWVPdmVyKCkge1xyXG4gICAgREQuZ2FtZS5yZXN1bHQgPSAnR2FtZSBPdmVyISc7XHJcbiAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnanVuayBoaXQhJyk7XHJcbiAgICBERC5wbGF5ZXIuc3BlZWQgKz0gLTUwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0Q29pbihwbGF5ZXJBLCBjb2luQSkge1xyXG4gICAgY29uc29sZS5sb2coJ0NvaW4gQ29sbGVjdGVkJyk7XHJcbiAgICBjb2luQS5ib2R5ID0gbnVsbDtcclxuICAgIGNvaW5BLnNwcml0ZS5raWxsKCk7XHJcbiAgICBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4gKz0gMTtcclxuICAgIC8vYWRkaXRpb25hbGx5IGhhdmUgdG8gYWRkIGNvZGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBnYW1lXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgZnVuY3Rpb25cclxuICovXHJcbmZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIC8vcGxheWVyLmJvZHkuZGVidWcgPSB0cnVlO1xyXG4gICAgLy9zcGlsbC5ib2R5LmRlYnVnID0gdHJ1ZTtcclxuICAgIGdhbWUuZGVidWcudGV4dChERC5nYW1lLnJlc3VsdCwgMzIsIDMyKTtcclxuICAgIGdhbWUuZGVidWcudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDMyLCA1Mik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLnNjb3JlLm11bHRpcGxpZXIsIDMyLCA3Mik7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQoJ0NvaW5zOiAnICsgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuLCAzMiwgOTIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNwbGF5SGlnaFNjb3JlcygpIHtcclxuICAgIHZhciBoaWdoU2NvcmVzID0gWzEyMCwgMTIwMCwgMTA5MjAsIDE1MzEzNSwgNTU1LCAzNDMsIDJdO1xyXG5cclxuICAgIGhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcblxyXG4gICAgaGlnaFNjb3Jlcy5mb3JFYWNoKGZ1bmN0aW9uKHNjb3JlLCBpbmRleCkgeyBcclxuICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8bGk+PGE+JyArIHNjb3JlICsgJzwvYT48L2xpPic7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCcjaGlnaHNjb3Jlcy1tZW51JykuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9