// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DD object
 * 
 * Contains game state independent of Phaser
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
        },

        nets: {
            amount: 200,
            elements: []
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

// Global game object
var game;

// vim: set expandtab ts=4 sts=4 sw=4:

/**
 * Holds references to all on-screen elements
 * (exteral to Phaser)
 * 
 * @type {Object}
 */
var DisplayData = {
    game: {
        element: $('#game')
    },

    hud: {
        element: $('#hud'),
        score: $('#hud-score'),
        coins: $('#hud-coins'),
        pauseBtn: $('#hud-pauseBtn'),
        progressBar: $('#progress-bar')
    },

    mainMenu: {
        element: $('#mainMenu'),
        newGameBtn: $('#mainMenu-newGame'),
        highScoresBtn: $('#mainMenu-highScores'),
        howToPlayBtn: $('#mainMenu-howToPlay'),
        aboutBtn: $('#mainMenu-about')
    },

    highScoresMenu: {
        element: $('#highScoresMenu'),
        list: $('#highScoresMenu-list'),
        mainMenuBtn: $('#highScoresMenu-mainMenu')
    },

    howToPlayMenu: {
        element: $('#howToPlayMenu'),
        mainMenuBtn: $('#howToPlayMenu-mainMenu')
    },

    aboutMenu: {
        element: $('#aboutMenu'),
        version: $('#aboutMenu-version'),
        mainMenuBtn: $('#aboutMenu-mainMenu')
    },

    pauseMenu: {
        element: $('#pauseMenu'),
        overlay: $('#pauseMenu .overlay'),
        resumeBtn: $('#pauseMenu-resume'),
        restartBtn: $('#pauseMenu-restart'),
        mainMenuBtn: $('#pauseMenu-mainMenu')
    }
};

/**
 * Display and menus manipulation
 * object
 * 
 * @type {Object}
 */
var Display = {
    /**
     * Show given element on screen
     * 
     * @param  {Array} elements
     */
    showElements: function(elements) {
        elements.forEach(function(element) {
            element.removeClass('hidden');
        });
    },

    /**
     * Hide given elements from the screen
     * 
     * @param  {Array} elements
     */
    hideElements: function(elements) {
        elements.forEach(function(element) {
            element.addClass('hidden');
        });
    },

    /**
     * Show a menu by first hiding all other menus
     * 
     * @param  {DOMElement} menu
     */
    showMenu: function(menu) {
        Display.hideAllElements();
        Display.showElements([menu]);
    },

    /**
     * Hide all menus from the screen
     */
    hideAllMenus: function() {
        var menus = [
            DisplayData.mainMenu.element, 
            DisplayData.highScoresMenu.element,
            DisplayData.howToPlayMenu.element,
            DisplayData.aboutMenu.element,
            DisplayData.pauseMenu.element
        ];

        menus.forEach(function(menu) {
            menu.addClass('hidden');
        });
    },

    /**
     * Hide all elements from the screen
     */
    hideAllElements: function() {
        Display.hideAllMenus();
        Display.hideElements([DisplayData.hud.element]);
    },

    /**
     * Update scores in About menu
     */
    updateHighScores: function() {
        // Sort scores
        DD.game.score.highScores.sort(function(a, b) {
            return a < b;
        });

        // Generate HTML for scores
        var highScoresHtml = '';
        DD.game.score.highScores.forEach(function(score) { 
            highScoresHtml += '<li>' + score + '</li>';
        });

        // Display updated scores
        if (DD.game.score.highScores.length) {
            $(DisplayData.highScoresMenu.list).html(highScoresHtml);
        }
    }
};

/**
 * Controls the playback of animations
 * 
 * @type {Object}
 */
var PlayAnimations = {
    // Main Menu animations
    mainMenu: function() {
        // Animate menu title
        TweenMax.from('#mainMenu h1', 1, {
            scale: 0.6,
            ease: Bounce.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#mainMenu li', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    // Pause Menu animations
    pauseMenu: function() {
        // Animate buttons
        TweenMax.staggerFrom('#pauseMenu li', 0.3, {
            y: 75,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    }
};

// vim: set expandtab ts=4 sts=4 sw=4:

// Game actions and action-related
// functions
DD.game.actions = {
    /**
     * Start game
     * 
     * Initialize the global game object
     */
    start: function() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
            preload: DD.game.preload,
            create: DD.game.create,
            update: DD.game.update,
            render: DD.game.render
        });

        // game.paused = true;
    },

	/**
	 * Junk generation on game.create()
	 *
	 * Creates a thousand junk objects and stores
	 * them in DD.objects.junks.elements[]
	 */
    createJunks: function() {
        var junk;
        var i;

        for (i = 0; i < DD.objects.junks.amount; i++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            junk = game.add.sprite(
                (Math.floor(Math.random() * 187000) + 5000),
                game.world.randomY,
                'junk'
            );

            // junk.physicsBodyType = Phaser.Physics.P2JS;
            // junk.enableBody = true;
            game.physics.p2.enable(junk);

            // The size of the object will likely change too, if that is possible
            junk.body.setRectangle(24, 22);
            junk.scale.setTo(0.5, 0.5);

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
    },

    /**
	 * Coin generation on game.create()
	 *
	 * Creates a thousand coin objects and stores
	 * them in DD.objects.coins.elements[]
	 */
    createCoins: function() {
        var coin;
        var j;

        // Create a thousand junk objects
        for (j = 0; j < DD.objects.coins.amount; j++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            coin = game.add.sprite(
                (Math.floor(Math.random() * 187000) + 5000), 
                game.world.randomY, 
                'healthpack'
            );

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
    },

    createNets: function() {
        var net;
        var underNet;
        var k;

        // Create a two hundred net objects
        for (k = 0; k < DD.objects.nets.amount; k++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            net = game.add.sprite(((k+8)*400), 0, 'overnet'); 
            // net.enableBody = true;
            // net.physicsBodyType = Phaser.Physics.P2JS;
            game.physics.p2.enable(net);

            underNet = game.add.sprite(net.body.x, net.body.y, 'undernet'); 

            // The size of the object will likely change too, if that is possible
            net.body.setRectangle(24, 22);

            // Tell the net to use the DD.objects.nets.collisionGroup 
            net.body.setCollisionGroup(DD.objects.nets.collisionGroup);

            // nets will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            net.body.collides([DD.objects.nets.collisionGroup, DD.player.collisionGroup]);

            DD.objects.nets.elements.push(net);
        }
    },

    /**
     * Handle game restart
     * 
     * Reset running variables and restart game by
     * destroying current game cache and 
     * re-initializing the game
     */
    restart: function() {
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

        // Reset game world
        DD.game.world.level = 1;

        game.destroy();
        game = null;

        DD.game.actions.start();
    },

    /**
     * Handle game over
     * 
     * Ends current game and displays
     * game over menu
     */
    gameOver: function() {
        DD.game.result = 'Game Over!';
        DD.game.runEnd = true;
        DD.game.score.highScores.push(DD.game.score.lastRun);
    }
};

// Check for touch events
DD.game.touch = {
    /**
     * Detect touch input in upper right half of screen
     * for both pointer1 (first finger) & pointer2 (second finger)
     * 
     * @return {Boolean}
     */
    isTouchingUp: function() {
        if (
            (game.input.pointer1.isDown && game.input.pointer1.x > 500 && game.input.pointer1.y < 300) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 500 && game.input.pointer2.y < 300)
        ) {
            return true;
        }

        return false;
    },

    /**
     * Detect touch input in lower right half of screen
     * for both pointer1 (first finger) & pointer2 (second finger)
     * 
     * @return {Boolean}
     */
    isTouchingDown: function() {
        if (
            (game.input.pointer1.isDown && game.input.pointer1.x > 500 && game.input.pointer1.y > 300) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 500 && game.input.pointer2.y > 300)
        ) {
            return true;
        }

        return false;
    }
};

// vim: set expandtab ts=4 sts=4 sw=4:

// Setup events and listeners when the page is ready
$(document).ready(function() {
    // Update version number in About menu
    DisplayData.aboutMenu.version.text(DD.version);

    // Main menu: New Game button
    $(DisplayData.mainMenu.newGameBtn).click(function() {
        Display.hideAllMenus();

        Display.showElements([
            DisplayData.hud.element,
            DisplayData.hud.pauseBtn
        ]);

        game.paused = false;
    });

    // Main menu: High Scores button
    $(DisplayData.mainMenu.highScoresBtn).click(function() {
        Display.updateHighScores();
        Display.showMenu(DisplayData.highScoresMenu.element);
    });

    // Main menu: How to Play button
    $(DisplayData.mainMenu.howToPlayBtn).click(function() {
        Display.showMenu(DisplayData.howToPlayMenu.element);
    });

    // Main menu: About button
    $(DisplayData.mainMenu.aboutBtn).click(function() {
        Display.showMenu(DisplayData.aboutMenu.element);
    });

    // High Scores menu: Return to Main Menu button
    $(DisplayData.highScoresMenu.mainMenuBtn).click(function() {
        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    });

    // High to Play menu: Return to Main Menu button
    $(DisplayData.howToPlayMenu.mainMenuBtn).click(function() {
        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    });

    // About menu: Return to Main Menu button
    $(DisplayData.aboutMenu.mainMenuBtn).click(function() {
        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    });

    // Pause menu: background overlay
    $(DisplayData.pauseMenu.overlay).click(function() {
        game.paused = false;

        Display.hideAllMenus();
        Display.showElements([DisplayData.hud.pauseBtn]);
    });

    // Pause menu: Resume button
    $(DisplayData.pauseMenu.resumeBtn).click(function() {
        game.paused = false;

        Display.hideAllMenus();
        Display.showElements([DisplayData.hud.pauseBtn]);
    });

    // Pause menu: Restart button
    $(DisplayData.pauseMenu.restartBtn).click(function() {
        // TODO: Calculate score here
        
        Display.hideAllMenus();
        Display.showElements([DisplayData.hud.pauseBtn]);

        DD.game.actions.restart();
        game.paused = false;
    });

    // Pause menu: Quit to Main Menu button
    $(DisplayData.pauseMenu.mainMenuBtn).click(function() {
        // TODO: Calculate score here
            
        // First run will show Main Menu and play its animation
        DD.game.firstRun = true;
        DD.game.actions.restart();
    });

    /**
     * HUD: Pause button: handles pause activation
     * 
     * On the event where the player clicks the button change 
     * the game state to paused
     */
    $(DisplayData.hud.pauseBtn).click(function() {
        game.paused = true;
        Display.hideElements([DisplayData.hud.pauseBtn]);
        Display.showElements([DisplayData.pauseMenu.element]);

        PlayAnimations.pauseMenu();
    });

});

// vim: set expandtab ts=4 sts=4 sw=4:

/**
 * Preload function
 * 
 * Where we register and load assets including 
 * images and sprite sheets
 */
DD.game.preload = function preload() {
    game.load.image('background', '/assets/images/StaticBackground.png');
    game.load.image('backgroundL1', '/assets/images/Layer1.png');
    game.load.image('backgroundL2', '/assets/images/Layer2.png');
    game.load.image('junk', '/assets/images/plasticBag.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('overnet', '/assets/images/overnet.png');
    game.load.image('undernet', '/assets/images/undernet.png');
    game.load.spritesheet('oilspillfront', '/assets/images/GradientOil.png', 1920, 1080);
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);

    game.load.audio('junkImpact', '/assets/audio/junkCollide.mp3');
};

/**
 * Create function
 * 
 * Where we create and initialize objects
 * for the game
 */
DD.game.create = function create() {
    // Set boundaries of the world
    game.world.setBounds(0, 0, 192000, 1080);

    // Enable the P2 Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    // Add background layers
    DD.textures.layerA = game.add.tileSprite(0, 0, 192000, 1080, 'background');
    DD.textures.layerB = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL1');
    DD.textures.layerC = game.add.tileSprite(0, 0, 192000, 1080, 'backgroundL2');

    // Set transparency of background layers
    DD.textures.layerA.alpha = 1;
    DD.textures.layerB.alpha = 0.6;
    DD.textures.layerC.alpha = 1;

    // Enable Physics on background layers
    game.physics.enable(DD.textures.layerA, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerB, Phaser.Physics.ARCADE);
    game.physics.enable(DD.textures.layerC, Phaser.Physics.ARCADE);

    // Setup Parallax scrolling on background layers
    DD.textures.layerA.body.velocity.x = DD.player.speed - (3 * DD.textures.speed);
    DD.textures.layerB.body.velocity.x = DD.player.speed - (2 * DD.textures.speed);
    DD.textures.layerC.body.velocity.x = DD.player.speed - (1 * DD.textures.speed);

    // Make background layers immune to collisions
    DD.textures.layerA.body.immovable = true;
    DD.textures.layerB.body.immovable = true;
    DD.textures.layerC.body.immovable = true;

    //sound stuff
    junkCollide = game.add.audio('junkImpact');
    junkCollide.addMarker('beginning', 0, 1.0);

    // Add oilspill element and enable Physics
    DD.objects.spill.element = game.add.sprite(0, 0, 'oilspill');
    game.physics.p2.enable(DD.objects.spill.element);

    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dude');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Player animations
    DD.player.element.animations.add('right', [4, 3, 5], 6, true);

    // Create collision groups
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.coins.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    // Generate junks and coins
    DD.game.actions.createJunks();
    DD.game.actions.createCoins();


    // Setup collisions
    DD.objects.spill.element.body.setCollisionGroup(DD.objects.spill.collisionGroup);
    DD.player.element.body.setCollisionGroup(DD.player.collisionGroup);

    DD.objects.spill.element.body.collides([DD.objects.spill.collisionGroup, DD.player.collisionGroup]);
    DD.player.element.body.collides(DD.objects.junks.collisionGroup, junkHit, this);
    DD.player.element.body.collides(DD.objects.spill.collisionGroup, DD.game.actions.gameOver, this);
    DD.player.element.body.collides(DD.objects.coins.collisionGroup, collectCoin, this);

    // Setup keyboard controls
    DD.game.cursors = game.input.keyboard.createCursorKeys();

    // Setup camera
    game.camera.follow(DD.player.element);

    // Pause and show Main Menu on first run
    if (DD.game.firstRun) {
        DD.game.firstRun = false;
        game.paused = true;

        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    }
};

/**
 * Update function
 * 
 * The game loop - run once per frame
 */
DD.game.update = function update() {
    if (DD.game.modifiers.boost.active) {
        if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

            DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
            DD.game.modifiers.boost.active = false;

            console.log('Boost End :(');
        }
    }

    // Governs and controls boost
    if (!DD.game.runEnd) {
        // Sets DD.game.score.lastRun based on the position of the player. the -8 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Update the player velocity and play animation
        DD.player.element.body.velocity.x = DD.player.speed + (50 * DD.game.world.level) + DD.game.modifiers.total;
        DD.player.element.animations.play('right');

        // Update the oilspill velocity
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed + (50 * DD.game.world.level);

        // DD.objects.spill.gradient.element.body.velocity.x = DD.objects.spill.element.body.velocity.x;
        // DD.objects.spill.gradient.element.animations.play('spill');
    } else {
        // Stops all of the objects so that its not clunky. Once the death menu is implemented, this will look quite nice
        DD.objects.spill.element.body.velocity.x = 0;
        DD.player.element.body.velocity.x = 0;
    }

    // Reset the player's velocity (movement)
    DD.player.element.body.velocity.y = 0;

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level) ) {
        console.log('Level (speed) up!');

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

    if (DD.game.cursors.up.isDown || DD.game.touch.isTouchingUp()) {
        DD.player.element.body.angle = -1 * DD.player.angle;
        DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
    } else if (DD.game.cursors.down.isDown || DD.game.touch.isTouchingDown()) {
        DD.player.element.body.angle = DD.player.angle;
        DD.player.element.body.velocity.y = DD.player.vertSpeed;
    } else {
        DD.player.element.body.angle = 0;
    }

    // This function is currently not working.
    // I (Brian) will have to read the docs when i can to see how to fix this.
    if (DD.player.element.collideWorldBounds) {
        console.log('Touching');

        DD.player.element.body.velocity.y = 0;
    }
};

/**
 * Render function
 */
DD.game.render = function render() {
    // Update score
    if (DD.game.score.lastFrameValue.score !== DD.game.score.lastRun) {
        DisplayData.hud.score.text(DD.game.score.lastRun);
        DD.game.score.lastFrameValue.score = DD.game.score.lastRun;
    }

    // Update coins
    if (DD.game.score.lastFrameValue.coins !== DD.game.score.coins.lastRun) {
        DisplayData.hud.coins.text(DD.game.score.coins.lastRun);
        DD.game.score.lastFrameValue.coins = DD.game.score.coins.lastRun;
    }

    // game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
};

/**
 * Handle player collision with junk
 */
function junkHit() {
    console.log('Junk hit!');

    if (DD.objects.junks.active !== true) {
        DD.player.speed = DD.player.speed * DD.objects.junks.slow;
        DD.objects.junks.active = true;
        game.time.events.add(Phaser.Timer.SECOND * 2, regainSpeed, this); 
        //sound stuff
        junkCollide.play('beginning');
    }  
}

/**
 * Increase player speed after
 * collision with junk
 */
function regainSpeed() {
    console.log('Regaining speed!');

    DD.player.speed = DD.player.speed / DD.objects.junks.slow;
    DD.objects.junks.active = false;
}

/**
 * Handle player collision with coin
 * @param  {Game.sprite} player
 * @param  {Game.sprite} coin
 */
function collectCoin(player, coin) {
    console.log('Coin collected');

    coin.body = null;
    coin.sprite.kill();

    if (DD.objects.coins.collectedIds.indexOf(coin.data.id) === -1) {
        DD.game.score.coins.lastRun += 1;
        DD.objects.coins.collectedIds.push(coin.data.id);
    }

    // Additionally have to add code which will remove the object from the game
}

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIEREIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBzdGF0ZSBpbmRlcGVuZGVudCBvZiBQaGFzZXJcclxuICovXHJcbnZhciBERCA9IHtcclxuICAgIHZlcnNpb246ICcwLjEuMCcsXHJcblxyXG4gICAgb2JqZWN0czoge1xyXG4gICAgICAgIHNwaWxsOiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiAyNTAsXHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBncmFkaWVudDoge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAoTWF0aC5yYW5kb20oKSAqIDUwKSArIDUwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAxMDAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXRzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMjAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW11cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgbGFzdEZyYW1lVmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIGNvaW5zOiAwLFxyXG4gICAgICAgICAgICAgICAgc2NvcmU6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb2RpZmllcnM6IHtcclxuICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGJvb3N0OiB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDIwMCxcclxuICAgICAgICAgICAgICAgIGJlZ2luOiAwLFxyXG4gICAgICAgICAgICAgICAgY2hhcmdlczogMVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbXVsdGlwbGllcjogMVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIEp1c3QgYSBmcmllbmRseSByZW1pbmRlclxyXG5jb25zb2xlLmluZm8oJ0RvbHBoaW4gRGl2ZSB2JyArIERELnZlcnNpb24pO1xyXG5cclxuLy8gR2xvYmFsIGdhbWUgb2JqZWN0XHJcbnZhciBnYW1lO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHJlZmVyZW5jZXMgdG8gYWxsIG9uLXNjcmVlbiBlbGVtZW50c1xyXG4gKiAoZXh0ZXJhbCB0byBQaGFzZXIpXHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIERpc3BsYXlEYXRhID0ge1xyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lJylcclxuICAgIH0sXHJcblxyXG4gICAgaHVkOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2h1ZCcpLFxyXG4gICAgICAgIHNjb3JlOiAkKCcjaHVkLXNjb3JlJyksXHJcbiAgICAgICAgY29pbnM6ICQoJyNodWQtY29pbnMnKSxcclxuICAgICAgICBwYXVzZUJ0bjogJCgnI2h1ZC1wYXVzZUJ0bicpLFxyXG4gICAgICAgIHByb2dyZXNzQmFyOiAkKCcjcHJvZ3Jlc3MtYmFyJylcclxuICAgIH0sXHJcblxyXG4gICAgbWFpbk1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXdHYW1lQnRuOiAkKCcjbWFpbk1lbnUtbmV3R2FtZScpLFxyXG4gICAgICAgIGhpZ2hTY29yZXNCdG46ICQoJyNtYWluTWVudS1oaWdoU2NvcmVzJyksXHJcbiAgICAgICAgaG93VG9QbGF5QnRuOiAkKCcjbWFpbk1lbnUtaG93VG9QbGF5JyksXHJcbiAgICAgICAgYWJvdXRCdG46ICQoJyNtYWluTWVudS1hYm91dCcpXHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hTY29yZXNNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hpZ2hTY29yZXNNZW51JyksXHJcbiAgICAgICAgbGlzdDogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgaG93VG9QbGF5TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNob3dUb1BsYXlNZW51JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNob3dUb1BsYXlNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgc2hvd0VsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgaGlkZUVsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc2hvd01lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFttZW51XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxNZW51czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnRcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBtZW51cy5mb3JFYWNoKGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnRdKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgc2NvcmVzIGluIEFib3V0IG1lbnVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlSGlnaFNjb3JlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gU29ydCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhIDwgYjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgSFRNTCBmb3Igc2NvcmVzXHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLmZvckVhY2goZnVuY3Rpb24oc2NvcmUpIHsgXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8bGk+JyArIHNjb3JlICsgJzwvbGk+JztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3Jlc1xyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdCkuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ29udHJvbHMgdGhlIHBsYXliYWNrIG9mIGFuaW1hdGlvbnNcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7XHJcbiAgICAvLyBNYWluIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgbWFpbk1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNtYWluTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNixcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI21haW5NZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUGF1c2UgTWVudSBhbmltYXRpb25zXHJcbiAgICBwYXVzZU1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjcGF1c2VNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDc1LFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLy8gR2FtZSBhY3Rpb25zIGFuZCBhY3Rpb24tcmVsYXRlZFxyXG4vLyBmdW5jdGlvbnNcclxuREQuZ2FtZS5hY3Rpb25zID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBnYW1lXHJcbiAgICAgKiBcclxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBnYW1lIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xyXG4gICAgICAgICAgICBwcmVsb2FkOiBERC5nYW1lLnByZWxvYWQsXHJcbiAgICAgICAgICAgIGNyZWF0ZTogREQuZ2FtZS5jcmVhdGUsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogREQuZ2FtZS51cGRhdGUsXHJcbiAgICAgICAgICAgIHJlbmRlcjogREQuZ2FtZS5yZW5kZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcblx0LyoqXHJcblx0ICogSnVuayBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuXHQgKlxyXG5cdCAqIENyZWF0ZXMgYSB0aG91c2FuZCBqdW5rIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG5cdCAqIHRoZW0gaW4gREQub2JqZWN0cy5qdW5rcy5lbGVtZW50c1tdXHJcblx0ICovXHJcbiAgICBjcmVhdGVKdW5rczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGp1bms7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBERC5vYmplY3RzLmp1bmtzLmFtb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoXHJcbiAgICAgICAgICAgICAgICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLFxyXG4gICAgICAgICAgICAgICAgZ2FtZS53b3JsZC5yYW5kb21ZLFxyXG4gICAgICAgICAgICAgICAgJ2p1bmsnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoanVuayk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNSwgMC41KTtcclxuXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5hbmd1bGFyVmVsb2NpdHkgPSBNYXRoLnJhbmRvbSgpICogMjtcclxuICAgICAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnkgPSBNYXRoLnJhbmRvbSgpICogODA7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBqdW5rIHRvIHVzZSB0aGUgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuXHQgKiBDb2luIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG5cdCAqXHJcblx0ICogQ3JlYXRlcyBhIHRob3VzYW5kIGNvaW4gb2JqZWN0cyBhbmQgc3RvcmVzXHJcblx0ICogdGhlbSBpbiBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzW11cclxuXHQgKi9cclxuICAgIGNyZWF0ZUNvaW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29pbjtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuY29pbnMuYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAgY29pbiA9IGdhbWUuYWRkLnNwcml0ZShcclxuICAgICAgICAgICAgICAgIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksIFxyXG4gICAgICAgICAgICAgICAgZ2FtZS53b3JsZC5yYW5kb21ZLCBcclxuICAgICAgICAgICAgICAgICdoZWFsdGhwYWNrJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gY29pbi5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gY29pbi5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGNvaW4pO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGNvaW4uYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGNvaW4gdG8gdXNlIHRoZSBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb2lucyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgY29pbi5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMucHVzaChjb2luKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZU5ldHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXQ7XHJcbiAgICAgICAgdmFyIHVuZGVyTmV0O1xyXG4gICAgICAgIHZhciBrO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0d28gaHVuZHJlZCBuZXQgb2JqZWN0c1xyXG4gICAgICAgIGZvciAoayA9IDA7IGsgPCBERC5vYmplY3RzLm5ldHMuYW1vdW50OyBrKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAgbmV0ID0gZ2FtZS5hZGQuc3ByaXRlKCgoays4KSo0MDApLCAwLCAnb3Zlcm5ldCcpOyBcclxuICAgICAgICAgICAgLy8gbmV0LmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBuZXQucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShuZXQpO1xyXG5cclxuICAgICAgICAgICAgdW5kZXJOZXQgPSBnYW1lLmFkZC5zcHJpdGUobmV0LmJvZHkueCwgbmV0LmJvZHkueSwgJ3VuZGVybmV0Jyk7IFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgbmV0IHRvIHVzZSB0aGUgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBuZXQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gbmV0cyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgbmV0LmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSByZXN0YXJ0XHJcbiAgICAgKiBcclxuICAgICAqIFJlc2V0IHJ1bm5pbmcgdmFyaWFibGVzIGFuZCByZXN0YXJ0IGdhbWUgYnlcclxuICAgICAqIGRlc3Ryb3lpbmcgY3VycmVudCBnYW1lIGNhY2hlIGFuZCBcclxuICAgICAqIHJlLWluaXRpYWxpemluZyB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICByZXN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBjb2luc1xyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihjb2luLCBpbmRleCkge1xyXG4gICAgICAgICAgICBjb2luLmJvZHkgPSBudWxsO1xyXG4gICAgICAgICAgICBjb2luLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5jb2luc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBqdW5rcyBhbmQgY29pbnMgYXJyYXlzXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgZ2FtZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgPSAxO1xyXG5cclxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgb3ZlclxyXG4gICAgICogXHJcbiAgICAgKiBFbmRzIGN1cnJlbnQgZ2FtZSBhbmQgZGlzcGxheXNcclxuICAgICAqIGdhbWUgb3ZlciBtZW51XHJcbiAgICAgKi9cclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBERC5nYW1lLnJlc3VsdCA9ICdHYW1lIE92ZXIhJztcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnB1c2goREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIENoZWNrIGZvciB0b3VjaCBldmVudHNcclxuREQuZ2FtZS50b3VjaCA9IHtcclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1RvdWNoaW5nVXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPCAzMDApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55IDwgMzAwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gbG93ZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdEb3duOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55ID4gMzAwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54ID4gNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA+IDMwMClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhpZ2ggU2NvcmVzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5oaWdoU2NvcmVzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LmVsZW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIb3cgdG8gUGxheSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaG93VG9QbGF5QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUuZWxlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEFib3V0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5hYm91dEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFib3V0IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmFib3V0TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogYmFja2dyb3VuZCBvdmVybGF5XHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5vdmVybGF5KS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3VtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3VtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN0YXJ0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdGFydEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICBcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhVRDogUGF1c2UgYnV0dG9uOiBoYW5kbGVzIHBhdXNlIGFjdGl2YXRpb25cclxuICAgICAqIFxyXG4gICAgICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxyXG4gICAgICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkXHJcbiAgICAgKi9cclxuICAgICQoRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5wYXVzZU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxufSk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5ERC5nYW1lLnByZWxvYWQgPSBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICcvYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICcvYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2p1bmsnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhc3RpY0JhZy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnaGVhbHRocGFjaycsICcvYXNzZXRzL2ltYWdlcy9maXJzdGFpZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvdmVybmV0JywgJy9hc3NldHMvaW1hZ2VzL292ZXJuZXQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3VuZGVybmV0JywgJy9hc3NldHMvaW1hZ2VzL3VuZGVybmV0LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycsIDE5MjAsIDEwODApO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL0RvbHBoaW4ucG5nJywgMjM1LCA5Nik7XHJcblxyXG4gICAgZ2FtZS5sb2FkLmF1ZGlvKCdqdW5rSW1wYWN0JywgJy9hc3NldHMvYXVkaW8vanVua0NvbGxpZGUubXAzJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gKiBmb3IgdGhlIGdhbWVcclxuICovXHJcbkRELmdhbWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMDAsIDEwODApO1xyXG5cclxuICAgIC8vIEVuYWJsZSB0aGUgUDIgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG4gICAgLy8gQWRkIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQiA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwxJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMicpO1xyXG5cclxuICAgIC8vIFNldCB0cmFuc3BhcmVuY3kgb2YgYmFja2dyb3VuZCBsYXllcnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5hbHBoYSA9IDE7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYWxwaGEgPSAwLjY7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMuYWxwaGEgPSAxO1xyXG5cclxuICAgIC8vIEVuYWJsZSBQaHlzaWNzIG9uIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQSwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gU2V0dXAgUGFyYWxsYXggc2Nyb2xsaW5nIG9uIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDIgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDEgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcblxyXG4gICAgLy8gTWFrZSBiYWNrZ3JvdW5kIGxheWVycyBpbW11bmUgdG8gY29sbGlzaW9uc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vc291bmQgc3R1ZmZcclxuICAgIGp1bmtDb2xsaWRlID0gZ2FtZS5hZGQuYXVkaW8oJ2p1bmtJbXBhY3QnKTtcclxuICAgIGp1bmtDb2xsaWRlLmFkZE1hcmtlcignYmVnaW5uaW5nJywgMCwgMS4wKTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZWxlbWVudCBhbmQgZW5hYmxlIFBoeXNpY3NcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5wbGF5ZXIuZWxlbWVudCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gUGxheWVyIGFuaW1hdGlvbnNcclxuICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs0LCAzLCA1XSwgNiwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNvbGxpc2lvbiBncm91cHNcclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUganVua3MgYW5kIGNvaW5zXHJcbiAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlSnVua3MoKTtcclxuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVDb2lucygpO1xyXG5cclxuXHJcbiAgICAvLyBTZXR1cCBjb2xsaXNpb25zXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQucGxheWVyLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0Q29pbiwgdGhpcyk7XHJcblxyXG4gICAgLy8gU2V0dXAga2V5Ym9hcmQgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbkRELmdhbWUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgIGlmICgoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAxMDAwKSB7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSAtMSAqIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCb29zdCBFbmQgOignKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gdGhlIC04IGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAoKERELnBsYXllci5lbGVtZW50LnggLyA0MDApIC0gOCkgKiBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciB2ZWxvY2l0eSBhbmQgcGxheSBhbmltYXRpb25cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgKyAoNTAgKiBERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCk7XHJcblxyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54O1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3NwaWxsJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFN0b3BzIGFsbCBvZiB0aGUgb2JqZWN0cyBzbyB0aGF0IGl0cyBub3QgY2x1bmt5LiBPbmNlIHRoZSBkZWF0aCBtZW51IGlzIGltcGxlbWVudGVkLCB0aGlzIHdpbGwgbG9vayBxdWl0ZSBuaWNlXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGxheWVyJ3MgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuYm9keS54ID49IChERC5nYW1lLndvcmxkLmludGVydmFsICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0xldmVsIChzcGVlZCkgdXAhJyk7XHJcblxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBERC5nYW1lLnRvdWNoLmlzVG91Y2hpbmdVcCgpKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IC0xICogREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcuXHJcbiAgICAvLyBJIChCcmlhbikgd2lsbCBoYXZlIHRvIHJlYWQgdGhlIGRvY3Mgd2hlbiBpIGNhbiB0byBzZWUgaG93IHRvIGZpeCB0aGlzLlxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmNvbGxpZGVXb3JsZEJvdW5kcykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUb3VjaGluZycpO1xyXG5cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuREQuZ2FtZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAvLyBVcGRhdGUgc2NvcmVcclxuICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlICE9PSBERC5nYW1lLnNjb3JlLmxhc3RSdW4pIHtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSBERC5nYW1lLnNjb3JlLmxhc3RSdW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGNvaW5zXHJcbiAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5jb2lucyAhPT0gREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuKSB7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLmNvaW5zLnRleHQoREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuKTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLmNvaW5zID0gREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdhbWUuZGVidWcudGV4dCgnU2NvcmUgTXVsdGlwbGllcjogJyArIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXIsIDMyLCA3Mik7XHJcbn07XHJcblxyXG4vKipcclxuICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAqL1xyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ0p1bmsgaGl0IScpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgZ2FtZS50aW1lLmV2ZW50cy5hZGQoUGhhc2VyLlRpbWVyLlNFQ09ORCAqIDIsIHJlZ2FpblNwZWVkLCB0aGlzKTsgXHJcbiAgICAgICAgLy9zb3VuZCBzdHVmZlxyXG4gICAgICAgIGp1bmtDb2xsaWRlLnBsYXkoJ2JlZ2lubmluZycpO1xyXG4gICAgfSAgXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZWFzZSBwbGF5ZXIgc3BlZWQgYWZ0ZXJcclxuICogY29sbGlzaW9uIHdpdGgganVua1xyXG4gKi9cclxuZnVuY3Rpb24gcmVnYWluU3BlZWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUmVnYWluaW5nIHNwZWVkIScpO1xyXG5cclxuICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAvIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGNvaW5cclxuICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHBsYXllclxyXG4gKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gY29pblxyXG4gKi9cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyLCBjb2luKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ29pbiBjb2xsZWN0ZWQnKTtcclxuXHJcbiAgICBjb2luLmJvZHkgPSBudWxsO1xyXG4gICAgY29pbi5zcHJpdGUua2lsbCgpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLmNvaW5zLmNvbGxlY3RlZElkcy5pbmRleE9mKGNvaW4uZGF0YS5pZCkgPT09IC0xKSB7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMucHVzaChjb2luLmRhdGEuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vLyBFdmVyeXRoaW5nIGlzIGRlY2xhcmVkOiBpbml0aWFsaXplIGdhbWVcclxuREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==