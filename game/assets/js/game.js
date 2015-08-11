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
            elements: [],
            collisionGroup: null 
        },

        junks: {
            amount: 0,
            elements: [],
            collisionGroup: null 
        },
    },

    player: {
        speed: 300,
        element: null,
        collisionGroup: null
    },

    game: {
        firstRun: true,
        runEnd: false,
        inputs: null,
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
        }

        modifiers: {
            active: true,

            boost: {
                active: false,
                value: 0,
                start: 0,
                charges: 0,
            },

            scoreMultiplier: 1,
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
var score;
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
    DD.objects.oilSpill = game.add.group();
    DD.objects.oilSpill.enableBody = true;
    DD.objects.oilSpill.physicsBodyType = Phaser.Physics.P2JS;

    // Add oilspill elements
    DD.objects.spill.element = DD.objects.oilSpill.create(0, 0, 'oilspill');
    DD.objects.oilSpill.spillFront = DD.objects.oilSpill.create(2450, 550, 'oilspillfront');

    // Add player
    DD.objects.player = game.add.sprite(3000, game.world.centerY, 'dude');
    DD.objects.player.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.objects.player);
    DD.objects.player.body.collideWorldBounds = true;

    // Animation for moving right
    DD.objects.player.animations.add('right', [4, 3, 5], 6, true);
    
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
    for (var i = 0; i < junkCount; i++) {
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

        DD.objects.junks.push(junk);
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

    spill.body.setCollisionGroup(spillCollisionGroup);
    spill.body.collides([spillCollisionGroup, playerCollisionGroup]);

    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(junkCollisionGroup, junkHit, this);
    player.body.collides(spillCollisionGroup, gameOver, this);
    player.body.collides(coinCollisionGroup, collectCoin, this);
    
    score = 0;

    // The controls
    DD.game.input = game.input.keyboard.createCursorKeys();

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
    if (DD.game.runEnd) {
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
    if (DD.game.input.right.isDown) {
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
    if (DD.game.input.up.isDown) {

        player.body.angle = -1 * angle;
        player.body.velocity.y = -1 * 300;

    } 
    else if (DD.game.input.down.isDown) {

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
    DD.game.runEnd = true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgcHJvcGVydGllcyBsaWtlIGN1cnJlbnQgdmVyc2lvblxyXG4gKi9cclxudmFyIEREID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgc3BlZWQ6IDI1MCxcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb2luczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IE1hdGgucmFuZG9tKCkgKiAxMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwgXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsIFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZmlyc3RSdW46IHRydWUsXHJcbiAgICAgICAgcnVuRW5kOiBmYWxzZSxcclxuICAgICAgICBpbnB1dHM6IG51bGwsXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAwLFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgc2NvcmVNdWx0aXBsaWVyOiAxLFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIEp1c3QgYSBmcmllbmRseSByZW1pbmRlclxyXG5jb25zb2xlLmluZm8oJ0RvbHBoaW4gRGl2ZSB2JyArIERELnZlcnNpb24pO1xyXG4kKCcjdmVyc2lvblRhZycpLmh0bWwoREQudmVyc2lvbik7XHJcblxyXG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xyXG4gICAgcHJlbG9hZDogcHJlbG9hZCxcclxuICAgIGNyZWF0ZTogY3JlYXRlLFxyXG4gICAgdXBkYXRlOiB1cGRhdGUsXHJcbiAgICByZW5kZXI6IHJlbmRlclxyXG59KTtcclxuXHJcbnZhciBzcGlsbCA7XHJcbnZhciBvaWxTcGlsbDtcclxudmFyIHNwaWxsRnJvbnQ7XHJcbnZhciBwb2ludDtcclxudmFyIGRlYXRoQWxlcnQ7XHJcbnZhciBvYnN0YWNsZXM7XHJcbnZhciBqdW5rTWFrZXI7XHJcbnZhciBhbmdsZTtcclxudmFyIGFuZ2xlQ29tcGVuc2F0aW9uO1xyXG52YXIgcmVzdWx0O1xyXG52YXIgc2NvcmU7XHJcbi8qKlxyXG4gKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHMgaW5jbHVkaW5nIFxyXG4gKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICovXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvQmFja2dyb3VuZFN0YXRpYy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2hlYWx0aHBhY2snLCAnL2Fzc2V0cy9pbWFnZXMvZmlyc3RhaWQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gKiBmb3IgdGhlIGdhbWVcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIC8vIEVuYWJsZSB0aGUgUDIgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG4gICAgLy8gQWRkIGJhY2tncm91bmRcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdzZWFmbG9vcicpO1xyXG5cclxuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZ3JvdXBcclxuICAgIERELm9iamVjdHMub2lsU3BpbGwgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5vaWxTcGlsbC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIERELm9iamVjdHMub2lsU3BpbGwucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZWxlbWVudHNcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IERELm9iamVjdHMub2lsU3BpbGwuY3JlYXRlKDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgREQub2JqZWN0cy5vaWxTcGlsbC5zcGlsbEZyb250ID0gREQub2JqZWN0cy5vaWxTcGlsbC5jcmVhdGUoMjQ1MCwgNTUwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG5cclxuICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgIERELm9iamVjdHMucGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDMwMDAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIERELm9iamVjdHMucGxheWVyLnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMucGxheWVyKTtcclxuICAgIERELm9iamVjdHMucGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBbmltYXRpb24gZm9yIG1vdmluZyByaWdodFxyXG4gICAgREQub2JqZWN0cy5wbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuICAgIFxyXG4gICAgLy9cclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgdmFyIGp1bms7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGp1bmtDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIGdhbWUud29ybGQucmFuZG9tWSwgJ3N0YXInKTtcclxuICAgICAgICBqdW5rLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgIGp1bmsucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuXHJcbiAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkqMjtcclxuICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueCA9IE1hdGgucmFuZG9tKCkqMTAwO1xyXG4gICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSo4MDtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIGp1bmtDb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoanVua0NvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbanVua0NvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLnB1c2goanVuayk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvaW47XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgY29pbiA9IGNvaW5zLmNyZWF0ZSgoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBnYW1lLndvcmxkLnJhbmRvbVksICdoZWFsdGhwYWNrJyk7XHJcbiAgICAgICAgY29pbi5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICBjb2luLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgIGNvaW4uYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcbiAgICAgICAgLy8gVGVsbCB0aGUgY29pbiB0byB1c2UgdGhlIGNvaW5Db2xsaXNpb25Hcm91cCBcclxuICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoY29pbkNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbY29pbkNvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zLnB1c2goY29pbik7XHJcbiAgICB9XHJcblxyXG4gICAgc3BpbGwuYm9keS5zZXRDb2xsaXNpb25Hcm91cChzcGlsbENvbGxpc2lvbkdyb3VwKTtcclxuICAgIHNwaWxsLmJvZHkuY29sbGlkZXMoW3NwaWxsQ29sbGlzaW9uR3JvdXAsIHBsYXllckNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgcGxheWVyLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAocGxheWVyQ29sbGlzaW9uR3JvdXApO1xyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZXMoanVua0NvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVzKHNwaWxsQ29sbGlzaW9uR3JvdXAsIGdhbWVPdmVyLCB0aGlzKTtcclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVzKGNvaW5Db2xsaXNpb25Hcm91cCwgY29sbGVjdENvaW4sIHRoaXMpO1xyXG4gICAgXHJcbiAgICBzY29yZSA9IDA7XHJcblxyXG4gICAgLy8gVGhlIGNvbnRyb2xzXHJcbiAgICBERC5nYW1lLmlucHV0ID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgLy8gU2V0dXAgY2FtZXJhXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoZmlyc3RSdW4pIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgfVxyXG4gICAgLy8gR2FtZSBtb2RpZmllcnMgYW5kIHVwZ3JhZGVzXHJcbiAgICBpZiAobW9kaWZpZXJzID09PSB0cnVlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQmFzaWMgbW9kc1xyXG4gICAgICAgIHBsYXllclNwZWVkO1xyXG4gICAgICAgIHNwaWxsU3BlZWQ7XHJcbiAgICAgICAgc2NvcmVNdWx0aXBsaWVyO1xyXG4gICAgICAgIEludGVydmFsO1xyXG4gICAgICAgIGp1bmtDb3VudDtcclxuICAgICAgICBib29zdDtcclxuICAgICAgICBib29zdFZhbHVlID0gNTAwO1xyXG4gICAgICAgIGJvb3N0Q2hhcmdlcyA9IDE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVXBncmFkZXNcclxuICAgICAgICBwbGF5ZXIuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBUaGUgZ2FtZSBsb29wIC0gcnVuIG9uY2UgcGVyIGZyYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG4gICAgaWYgKGJvb3N0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKChwbGF5ZXIueCAtIGJvb3N0U3RhcnQpID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIG1vZGlmaWVycyArPSAtMSAqIGJvb3N0VmFsdWU7XHJcbiAgICAgICAgICAgIGJvb3N0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCb29zdCBFbmQgOignKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmIChERC5nYW1lLnJ1bkVuZCkge1xyXG4gICAgICAgIC8vIFNldHMgc2NvcmUgYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIuIHRoZSAtNjAgY29tcGVuc2F0ZXMgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyIGluIHRoZSB3b3JsZFxyXG4gICAgICAgIHNjb3JlID0gKChwbGF5ZXIueC81MCktNjApKnNjb3JlTXVsdGlwbGllcjtcclxuICAgICAgICBzY29yZSA9IHBhcnNlSW50KHNjb3JlLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZXMgdGhlIHBsYXllciBhbmQgb2lsIHNwaWxsIHZlbG9jaXRpZXNcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gcGxheWVyU3BlZWQgKyBtb2RpZmllcnM7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSBzcGlsbFNwZWVkO1xyXG4gICAgICAgIHNwaWxsRnJvbnQuYm9keS52ZWxvY2l0eS54ID0gc3BpbGxTcGVlZDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIFN0b3BzIGFsbCBvZiB0aGUgb2JqZWN0cyBzbyB0aGF0IGl0cyBub3QgY2x1bmt5LiBPbmNlIHRoZSBkZWF0aCBtZW51IGlzIGltcGxlbWVudGVkLCB0aGlzIHdpbGwgbG9vayBxdWl0ZSBuaWNlLlxyXG4gICAgICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgc3BpbGxGcm9udC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICAgYW5nbGUgPSAyMDtcclxuXHJcblxyXG4gICAgaWYgKHBsYXllci5ib2R5LnggPj0gKEludGVydmFsICogbGV2ZWwpICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzcGVlZCB1cCEnKTtcclxuICAgICAgICBwbGF5ZXJTcGVlZCArPSA1MDtcclxuICAgICAgICBzcGlsbFNwZWVkICs9IDUwO1xyXG4gICAgICAgIGxldmVsICs9IDE7XHJcbiAgICBcclxuICAgIH1cclxuICAgIGlmIChERC5nYW1lLmlucHV0LnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChib29zdENoYXJnZXMgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBib29zdENoYXJnZXMgKz0gLTE7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycyArPSBib29zdFZhbHVlO1xyXG4gICAgICAgICAgICBib29zdCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJvb3N0U3RhcnQgPSBwbGF5ZXIueDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gY2hhcmdlcyBsZWZ0Jyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG4gICAgaWYgKERELmdhbWUuaW5wdXQudXAuaXNEb3duKSB7XHJcblxyXG4gICAgICAgIHBsYXllci5ib2R5LmFuZ2xlID0gLTEgKiBhbmdsZTtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTEgKiAzMDA7XHJcblxyXG4gICAgfSBcclxuICAgIGVsc2UgaWYgKERELmdhbWUuaW5wdXQuZG93bi5pc0Rvd24pIHtcclxuXHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSBhbmdsZTtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMzAwO1xyXG5cclxuICAgIH0gXHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgcGxheWVyLmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgXHJcbiAgICB9XHJcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGN1cnJlbnRseSBub3Qgd29ya2luZyBzbyBpIHdpbGwgaGF2ZSB0byByZWFkIHRoZSBkb2NzIHdoZW4gaSBjYW4gdG8gc2VlIGhvdyB0byBmaXggdGhpcy5cclxuICAgIGlmIChwbGF5ZXIuY29sbGlkZVdvcmxkQm91bmRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RvdWNoaW5nJyk7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUGF1c2UgYWN0aXZhdGlvblxyXG4gKiBcclxuICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxyXG4gKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWQuXHJcbiAqL1xyXG4kKCcjcGF1c2VCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgIC8vIFRoaXMgd2lsbCBhY3RpdmF0ZSBQaGFzZXIncyBwYXVzZSBmdW5jdGlvbiwgd2hlcmUgc29tZSBtYWdpYyBzaG91bGQgaGFwcGVuLlxyXG4gICAgZ2FtZS5wYXVzZWQgPSAhZ2FtZS5wYXVzZWQ7XHJcblxyXG4gICAgLy8gQWN0aXZhdGUgdGhlIHBhdXNlIG1lbnVcclxuICAgIHBhdXNlTWVudSgpO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBQYXVzZSBNZW51XHJcbiAqXHJcbiAqIFNob3dzIFBhdXNlIE1lbnUgYW5kIGhhbmRsZXMgcmVzdW1lLCByZXN0YXJ0XHJcbiAqIGFuZCBxdWl0XHJcbiAqL1xyXG5mdW5jdGlvbiBwYXVzZU1lbnUoKSB7XHJcbiAgICB2YXIgcGF1c2VNZW51ID0gJCgnI3BhdXNlTWVudScpO1xyXG4gICAgdmFyIHBhdXNlQnV0dG9uID0gJCgnI3BhdXNlQnV0dG9uJyk7XHJcblxyXG4gICAgaWYgKGdhbWUucGF1c2VkKSB7XHJcbiAgICAgICAgcGF1c2VNZW51LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICBwYXVzZUJ1dHRvbi5hZGRDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiB0byBNYWluIE1lbnVcclxuICAgICAgICAkKCcjbWFpbk1lbnVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gRG8gc2NvcmUgY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBwYXVzZUJ1dHRvbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICBmaXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgYnV0dG9uIGhhbmRsZXJcclxuICAgICAgICAkKCcjcmVzdW1lQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBnYW1lLCB3aXRoIHRoZSBzYW1lIHByaW5jaXBsZVxyXG4gICAgICAgICQoJyNyZXN0YXJ0QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIFNjb3JlIGNhbGNcclxuXHJcbiAgICAgICAgICAgIHBhdXNlTWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBwYXVzZU1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE1haW4gTWVudVxyXG4gKlxyXG4gKiBTaG93cyBNYWluIE1lbnUgYW5kIGhhbmRsZXMgc3RhcnQsIGhpZ2hzY29yZXNcclxuICogYW5kIGFib3V0XHJcbiAqL1xyXG5mdW5jdGlvbiBtYWluTWVudSgpIHtcclxuICAgIC8vIFNob3cgdGhlIG1haW4gbWVudVxyXG4gICAgJCgnI21haW5NZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgJCgnI3BhdXNlQnV0dG9uJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgIC8vIFNldHVwIG1haW4gbWVudSBidXR0b25cclxuICAgICQoJyNiZWdpbkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAkKCcjcGF1c2VCdXR0b24nKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgSGlnaHNjb3JlcyBidXR0b24gY2xpY2tcclxuICAgICQoJyNoaWdoU2NvcmVzQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTY29yZSBhcnJheSBjaGFuZ2VzIGVsZW1lbnRzIGJlZm9yZSBkaXNwbGF5IGhlcmVcclxuICAgICAgICBkaXNwbGF5SGlnaFNjb3JlcygpO1xyXG5cclxuICAgICAgICAkKCcjc2NvcmVNZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAkKCcjc2NvcmVSZXR1cm5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3Njb3JlTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBBYm91dCBidXR0b24gY2xpY2tcclxuICAgICQoJyNhYm91dEJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNtYWluTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlXHJcbiAgICAgICAgJCgnI2Fib3V0TWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI2Fib3V0UmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNhYm91dE1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICogXHJcbiAqIERpc3BsYXkgc2NvcmUgYW5kIHN1Y2guLi5cclxuICovXHJcbmZ1bmN0aW9uIGdhbWVPdmVyKCkge1xyXG4gICAgcmVzdWx0ID0gJ0dhbWUgT3ZlciEnO1xyXG4gICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ2p1bmsgaGl0IScpO1xyXG4gICAgcGxheWVyU3BlZWQgKz0gLTUwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0Q29pbihwbGF5ZXJBLCBjb2luQSkge1xyXG4gICAgY29uc29sZS5sb2coJ0NvaW4gQ29sbGVjdGVkJyk7XHJcbiAgICBjb2luQS5ib2R5ID0gbnVsbDtcclxuICAgIGNvaW5BLnNwcml0ZS5raWxsKCk7XHJcbiAgICBjb2luUnVuICs9IDE7XHJcbiAgICAvL2FkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vKipcclxuICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAvL3BsYXllci5ib2R5LmRlYnVnID0gdHJ1ZTtcclxuICAgIC8vc3BpbGwuYm9keS5kZWJ1ZyA9IHRydWU7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQocmVzdWx0LCAzMiwgMzIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KHNjb3JlLCAzMiwgNTIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgc2NvcmVNdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG4gICAgZ2FtZS5kZWJ1Zy50ZXh0KCdDb2luczogJyArIGNvaW5SdW4sIDMyLCA5Mik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlIaWdoU2NvcmVzKCkge1xyXG4gICAgdmFyIGhpZ2hTY29yZXMgPSBbMTIwLCAxMjAwLCAxMDkyMCwgMTUzMTM1LCA1NTUsIDM0MywgMl07XHJcblxyXG4gICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuXHJcbiAgICBoaWdoU2NvcmVzLmZvckVhY2goZnVuY3Rpb24oc2NvcmUsIGluZGV4KSB7IFxyXG4gICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxsaT48YT4nICsgc2NvcmUgKyAnPC9hPjwvbGk+JztcclxuICAgIH0pO1xyXG5cclxuICAgICQoJyNoaWdoc2NvcmVzLW1lbnUnKS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=