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
        progressBar: {
            element: $('#hud-progressbar'),
            spill: $('#hud-progressbar-oilspill'),
            dolphin: $('#hud-progressbar-dolphin')
        }
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
var junkCollide;
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
    game.load.spritesheet('dude', '/assets/images/dolphinsprite.png', 227, 95);

    game.load.audio('junkImpact', '/assets/audio/yey.wav');
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
    junkCollide.allowMultiple = true;

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
    DD.player.element.animations.add('right', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 20, true);
    DD.player.element.animations.add('collide', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 100, true);

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
        DisplayData.hud.progressBar.spill.width(((DD.objects.spill.element.x / 400) - 8)*(2.5));
        DisplayData.hud.progressBar.dolphin.css("margin-left", (((((DD.player.element.x / 400) - 8) - (DD.objects.spill.element.x / 400) - 8))*(2.5) + 28));
        DisplayData.hud.progressBar.dolphin.css("margin-bottom", (DD.player.element.y / 21.6));


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
    //sound stuff
    DD.player.element.animations.play('collide');
    junkCollide.play();
    if (DD.objects.junks.active !== true) {
        DD.player.speed = DD.player.speed * DD.objects.junks.slow;
        DD.objects.junks.active = true;
        setTimeout(regainSpeed, 3000);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgc3RhdGUgaW5kZXBlbmRlbnQgb2YgUGhhc2VyXHJcbiAqL1xyXG52YXIgREQgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxyXG5cclxuICAgIG9iamVjdHM6IHtcclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBzcGVlZDogMjUwLFxyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgZ3JhZGllbnQ6IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNvaW5zOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogKE1hdGgucmFuZG9tKCkgKiA1MCkgKyA1MCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsZWN0ZWRJZHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGp1bmtzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMTAwMCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBzbG93OiAwLjUsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbmV0czoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IDIwMCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0dXJlczoge1xyXG4gICAgICAgIGxheWVyQTogbnVsbCxcclxuICAgICAgICBsYXllckI6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJDOiBudWxsLFxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBzcGVlZDogMzAwLFxyXG4gICAgICAgIHZlcnRTcGVlZDogMzAwLFxyXG4gICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgYW5nbGU6IDIwXHJcbiAgICB9LFxyXG5cclxuICAgIGdhbWU6IHtcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGNvaW5zOiB7XHJcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBjb2luczogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXM6IFtdXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiAwLFxyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDFcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IDFcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuXHJcbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxyXG52YXIgZ2FtZTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyByZWZlcmVuY2VzIHRvIGFsbCBvbi1zY3JlZW4gZWxlbWVudHNcclxuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5RGF0YSA9IHtcclxuICAgIGdhbWU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZDoge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNodWQnKSxcclxuICAgICAgICBzY29yZTogJCgnI2h1ZC1zY29yZScpLFxyXG4gICAgICAgIGNvaW5zOiAkKCcjaHVkLWNvaW5zJyksXHJcbiAgICAgICAgcGF1c2VCdG46ICQoJyNodWQtcGF1c2VCdG4nKSxcclxuICAgICAgICBwcm9ncmVzc0Jhcjoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjaHVkLXByb2dyZXNzYmFyJyksXHJcbiAgICAgICAgICAgIHNwaWxsOiAkKCcjaHVkLXByb2dyZXNzYmFyLW9pbHNwaWxsJyksXHJcbiAgICAgICAgICAgIGRvbHBoaW46ICQoJyNodWQtcHJvZ3Jlc3NiYXItZG9scGhpbicpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWluTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNtYWluTWVudScpLFxyXG4gICAgICAgIG5ld0dhbWVCdG46ICQoJyNtYWluTWVudS1uZXdHYW1lJyksXHJcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcclxuICAgICAgICBob3dUb1BsYXlCdG46ICQoJyNtYWluTWVudS1ob3dUb1BsYXknKSxcclxuICAgICAgICBhYm91dEJ0bjogJCgnI21haW5NZW51LWFib3V0JylcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaFNjb3Jlc01lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcclxuICAgICAgICBsaXN0OiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCcpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBhYm91dE1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjYWJvdXRNZW51JyksXHJcbiAgICAgICAgdmVyc2lvbjogJCgnI2Fib3V0TWVudS12ZXJzaW9uJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNhYm91dE1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBwYXVzZU1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjcGF1c2VNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI3BhdXNlTWVudSAub3ZlcmxheScpLFxyXG4gICAgICAgIHJlc3VtZUJ0bjogJCgnI3BhdXNlTWVudS1yZXN1bWUnKSxcclxuICAgICAgICByZXN0YXJ0QnRuOiAkKCcjcGF1c2VNZW51LXJlc3RhcnQnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI3BhdXNlTWVudS1tYWluTWVudScpXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGlzcGxheSBhbmQgbWVudXMgbWFuaXB1bGF0aW9uXHJcbiAqIG9iamVjdFxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGdpdmVuIGVsZW1lbnQgb24gc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBzaG93RWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgZ2l2ZW4gZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBoaWRlRWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBtZW51IGJ5IGZpcnN0IGhpZGluZyBhbGwgb3RoZXIgbWVudXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7RE9NRWxlbWVudH0gbWVudVxyXG4gICAgICovXHJcbiAgICBzaG93TWVudTogZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW21lbnVdKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBtZW51cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgaGlkZUFsbE1lbnVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWVudXMgPSBbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIG1lbnVzLmZvckVhY2goZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgICAgICBtZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgaGlkZUFsbEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudF0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBzY29yZXMgaW4gQWJvdXQgbWVudVxyXG4gICAgICovXHJcbiAgICB1cGRhdGVIaWdoU2NvcmVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBTb3J0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBIVE1MIGZvciBzY29yZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuZm9yRWFjaChmdW5jdGlvbihzY29yZSkgeyBcclxuICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxsaT4nICsgc2NvcmUgKyAnPC9saT4nO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzXHJcbiAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5saXN0KS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDb250cm9scyB0aGUgcGxheWJhY2sgb2YgYW5pbWF0aW9uc1xyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBQbGF5QW5pbWF0aW9ucyA9IHtcclxuICAgIC8vIE1haW4gTWVudSBhbmltYXRpb25zXHJcbiAgICBtYWluTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI21haW5NZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC42LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjbWFpbk1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQYXVzZSBNZW51IGFuaW1hdGlvbnNcclxuICAgIHBhdXNlTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNwYXVzZU1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogNzUsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBHYW1lIGFjdGlvbnMgYW5kIGFjdGlvbi1yZWxhdGVkXHJcbi8vIGZ1bmN0aW9uc1xyXG5ERC5nYW1lLmFjdGlvbnMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGdhbWVcclxuICAgICAqIFxyXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgZ2xvYmFsIGdhbWUgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICAgICAgICAgIHByZWxvYWQ6IERELmdhbWUucHJlbG9hZCxcclxuICAgICAgICAgICAgY3JlYXRlOiBERC5nYW1lLmNyZWF0ZSxcclxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcclxuICAgICAgICAgICAgcmVuZGVyOiBERC5nYW1lLnJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuXHQvKipcclxuXHQgKiBKdW5rIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG5cdCAqXHJcblx0ICogQ3JlYXRlcyBhIHRob3VzYW5kIGp1bmsgb2JqZWN0cyBhbmQgc3RvcmVzXHJcblx0ICogdGhlbSBpbiBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzW11cclxuXHQgKi9cclxuICAgIGNyZWF0ZUp1bmtzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganVuaztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAganVuayA9IGdhbWUuYWRkLnNwcml0ZShcclxuICAgICAgICAgICAgICAgIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnanVuaydcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGp1bmsucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgLy8ganVuay5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcbiAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC41LCAwLjUpO1xyXG5cclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMucHVzaChqdW5rKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG5cdCAqIENvaW4gZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcblx0ICpcclxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQgY29pbiBvYmplY3RzIGFuZCBzdG9yZXNcclxuXHQgKiB0aGVtIGluIERELm9iamVjdHMuY29pbnMuZWxlbWVudHNbXVxyXG5cdCAqL1xyXG4gICAgY3JlYXRlQ29pbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb2luO1xyXG4gICAgICAgIHZhciBqO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGorKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBjb2luID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksIFxyXG4gICAgICAgICAgICAgICAgJ2hlYWx0aHBhY2snXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb2luLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBjb2luLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoY29pbik7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAgY29pbi5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgY29pbiB0byB1c2UgdGhlIERELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIGNvaW4uYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvaW5zIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBjb2luLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5jb2lucy5lbGVtZW50cy5wdXNoKGNvaW4pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY3JlYXRlTmV0czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ldDtcclxuICAgICAgICB2YXIgdW5kZXJOZXQ7XHJcbiAgICAgICAgdmFyIGs7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHR3byBodW5kcmVkIG5ldCBvYmplY3RzXHJcbiAgICAgICAgZm9yIChrID0gMDsgayA8IERELm9iamVjdHMubmV0cy5hbW91bnQ7IGsrKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBuZXQgPSBnYW1lLmFkZC5zcHJpdGUoKChrKzgpKjQwMCksIDAsICdvdmVybmV0Jyk7IFxyXG4gICAgICAgICAgICAvLyBuZXQuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIG5ldC5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldCk7XHJcblxyXG4gICAgICAgICAgICB1bmRlck5ldCA9IGdhbWUuYWRkLnNwcml0ZShuZXQuYm9keS54LCBuZXQuYm9keS55LCAndW5kZXJuZXQnKTsgXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAgbmV0LmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBuZXRzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBuZXQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMubmV0cy5lbGVtZW50cy5wdXNoKG5ldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIHJlc3RhcnRcclxuICAgICAqIFxyXG4gICAgICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZSBieVxyXG4gICAgICogZGVzdHJveWluZyBjdXJyZW50IGdhbWUgY2FjaGUgYW5kIFxyXG4gICAgICogcmUtaW5pdGlhbGl6aW5nIHRoZSBnYW1lXHJcbiAgICAgKi9cclxuICAgIHJlc3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEtpbGwgb2ZmIGp1bmtzXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGp1bmssIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGp1bmsuYm9keSA9IG51bGw7XHJcbiAgICAgICAgICAgIGp1bmsua2lsbCgpO1xyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEtpbGwgb2ZmIGNvaW5zXHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGNvaW4sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGNvaW4uYm9keSA9IG51bGw7XHJcbiAgICAgICAgICAgIGNvaW4ua2lsbCgpO1xyXG4gICAgICAgICAgICBERC5vYmplY3RzLmNvaW5zW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGp1bmtzIGFuZCBjb2lucyBhcnJheXNcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5lbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XHJcblxyXG4gICAgICAgIGdhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAgICAgKiBcclxuICAgICAqIEVuZHMgY3VycmVudCBnYW1lIGFuZCBkaXNwbGF5c1xyXG4gICAgICogZ2FtZSBvdmVyIG1lbnVcclxuICAgICAqL1xyXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERELmdhbWUucmVzdWx0ID0gJ0dhbWUgT3ZlciEnO1xyXG4gICAgICAgIERELmdhbWUucnVuRW5kID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMucHVzaChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ2hlY2sgZm9yIHRvdWNoIGV2ZW50c1xyXG5ERC5nYW1lLnRvdWNoID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gdXBwZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdVcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDMwMCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPCAzMDApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiBsb3dlciByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNUb3VjaGluZ0Rvd246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPiAzMDApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzAwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIFNldHVwIGV2ZW50cyBhbmQgbGlzdGVuZXJzIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBVcGRhdGUgdmVyc2lvbiBudW1iZXIgaW4gQWJvdXQgbWVudVxyXG4gICAgRGlzcGxheURhdGEuYWJvdXRNZW51LnZlcnNpb24udGV4dChERC52ZXJzaW9uKTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IE5ldyBHYW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5uZXdHYW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSGlnaCBTY29yZXMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmhpZ2hTY29yZXNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkudXBkYXRlSGlnaFNjb3JlcygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhvdyB0byBQbGF5IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5ob3dUb1BsYXlCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogQWJvdXQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmFib3V0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWJvdXQgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBiYWNrZ3JvdW5kIG92ZXJsYXlcclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN0YXJ0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgIFxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFVEOiBQYXVzZSBidXR0b246IGhhbmRsZXMgcGF1c2UgYWN0aXZhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAgICAgKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWRcclxuICAgICAqL1xyXG4gICAgJChEaXNwbGF5RGF0YS5odWQucGF1c2VCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50XSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxudmFyIGp1bmtDb2xsaWRlO1xyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5ERC5nYW1lLnByZWxvYWQgPSBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICcvYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICcvYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2p1bmsnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhc3RpY0JhZy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnaGVhbHRocGFjaycsICcvYXNzZXRzL2ltYWdlcy9maXJzdGFpZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvdmVybmV0JywgJy9hc3NldHMvaW1hZ2VzL292ZXJuZXQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3VuZGVybmV0JywgJy9hc3NldHMvaW1hZ2VzL3VuZGVybmV0LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycsIDE5MjAsIDEwODApO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL2RvbHBoaW5zcHJpdGUucG5nJywgMjI3LCA5NSk7XHJcblxyXG4gICAgZ2FtZS5sb2FkLmF1ZGlvKCdqdW5rSW1wYWN0JywgJy9hc3NldHMvYXVkaW8veWV5LndhdicpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5ERC5nYW1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgIC8vIEFkZCBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICAvLyBTZXQgdHJhbnNwYXJlbmN5IG9mIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMC42O1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmFscGhhID0gMTtcclxuXHJcbiAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQiwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIFNldHVwIFBhcmFsbGF4IHNjcm9sbGluZyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgzICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgxICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG5cclxuICAgIC8vIE1ha2UgYmFja2dyb3VuZCBsYXllcnMgaW1tdW5lIHRvIGNvbGxpc2lvbnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvL3NvdW5kIHN0dWZmXHJcbiAgICBqdW5rQ29sbGlkZSA9IGdhbWUuYWRkLmF1ZGlvKCdqdW5rSW1wYWN0Jyk7XHJcbiAgICBqdW5rQ29sbGlkZS5hbGxvd011bHRpcGxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZWxlbWVudCBhbmQgZW5hYmxlIFBoeXNpY3NcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5wbGF5ZXIuZWxlbWVudCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gUGxheWVyIGFuaW1hdGlvbnNcclxuICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxLCAwXSwgMjAsIHRydWUpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ2NvbGxpZGUnLCBbOSwgOCwgNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sIDEwMCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNvbGxpc2lvbiBncm91cHNcclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUganVua3MgYW5kIGNvaW5zXHJcbiAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlSnVua3MoKTtcclxuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVDb2lucygpO1xyXG5cclxuXHJcbiAgICAvLyBTZXR1cCBjb2xsaXNpb25zXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQucGxheWVyLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0Q29pbiwgdGhpcyk7XHJcblxyXG4gICAgLy8gU2V0dXAga2V5Ym9hcmQgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbkRELmdhbWUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgIGlmICgoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAxMDAwKSB7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSAtMSAqIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCb29zdCBFbmQgOignKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gdGhlIC04IGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAoKERELnBsYXllci5lbGVtZW50LnggLyA0MDApIC0gOCkgKiBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCgoKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC8gNDAwKSAtIDgpKigyLjUpKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXCJtYXJnaW4tbGVmdFwiLCAoKCgoKERELnBsYXllci5lbGVtZW50LnggLyA0MDApIC0gOCkgLSAoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggLyA0MDApIC0gOCkpKigyLjUpICsgMjgpKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXCJtYXJnaW4tYm90dG9tXCIsIChERC5wbGF5ZXIuZWxlbWVudC55IC8gMjEuNikpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKyBERC5nYW1lLm1vZGlmaWVycy50b3RhbDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgb2lsc3BpbGwgdmVsb2NpdHlcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5zcGVlZCArICg1MCAqIERELmdhbWUud29ybGQubGV2ZWwpO1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54O1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZ3JhZGllbnQuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3NwaWxsJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFN0b3BzIGFsbCBvZiB0aGUgb2JqZWN0cyBzbyB0aGF0IGl0cyBub3QgY2x1bmt5LiBPbmNlIHRoZSBkZWF0aCBtZW51IGlzIGltcGxlbWVudGVkLCB0aGlzIHdpbGwgbG9vayBxdWl0ZSBuaWNlXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGxheWVyJ3MgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuYm9keS54ID49IChERC5nYW1lLndvcmxkLmludGVydmFsICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0xldmVsIChzcGVlZCkgdXAhJyk7XHJcblxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBERC5nYW1lLnRvdWNoLmlzVG91Y2hpbmdVcCgpKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IC0xICogREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgbm90IHdvcmtpbmcuXHJcbiAgICAvLyBJIChCcmlhbikgd2lsbCBoYXZlIHRvIHJlYWQgdGhlIGRvY3Mgd2hlbiBpIGNhbiB0byBzZWUgaG93IHRvIGZpeCB0aGlzLlxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmNvbGxpZGVXb3JsZEJvdW5kcykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUb3VjaGluZycpO1xyXG5cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuREQuZ2FtZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAvLyBVcGRhdGUgc2NvcmVcclxuICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlICE9PSBERC5nYW1lLnNjb3JlLmxhc3RSdW4pIHtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSBERC5nYW1lLnNjb3JlLmxhc3RSdW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIGNvaW5zXHJcbiAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5jb2lucyAhPT0gREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuKSB7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLmNvaW5zLnRleHQoREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuKTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLmNvaW5zID0gREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGdhbWUuZGVidWcudGV4dCgnU2NvcmUgTXVsdGlwbGllcjogJyArIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXIsIDMyLCA3Mik7XHJcbn07XHJcblxyXG4vKipcclxuICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAqL1xyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ0p1bmsgaGl0IScpO1xyXG4gICAgLy9zb3VuZCBzdHVmZlxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdjb2xsaWRlJyk7XHJcbiAgICBqdW5rQ29sbGlkZS5wbGF5KCk7XHJcbiAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgIT09IHRydWUpIHtcclxuICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHNldFRpbWVvdXQocmVnYWluU3BlZWQsIDMwMDApO1xyXG4gICAgfSAgXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZWFzZSBwbGF5ZXIgc3BlZWQgYWZ0ZXJcclxuICogY29sbGlzaW9uIHdpdGgganVua1xyXG4gKi9cclxuZnVuY3Rpb24gcmVnYWluU3BlZWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUmVnYWluaW5nIHNwZWVkIScpO1xyXG5cclxuICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAvIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGNvaW5cclxuICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHBsYXllclxyXG4gKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gY29pblxyXG4gKi9cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyLCBjb2luKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ29pbiBjb2xsZWN0ZWQnKTtcclxuXHJcbiAgICBjb2luLmJvZHkgPSBudWxsO1xyXG4gICAgY29pbi5zcHJpdGUua2lsbCgpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLmNvaW5zLmNvbGxlY3RlZElkcy5pbmRleE9mKGNvaW4uZGF0YS5pZCkgPT09IC0xKSB7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMucHVzaChjb2luLmRhdGEuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vLyBFdmVyeXRoaW5nIGlzIGRlY2xhcmVkOiBpbml0aWFsaXplIGdhbWVcclxuREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==