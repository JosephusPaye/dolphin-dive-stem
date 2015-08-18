// Register Array.getUnique()
Array.prototype.unique = function() {
    var o = {};
    var i = this.length;
    var l = this.length;
    var r = [];

    for (i = 0; i < l; i += 1) {
        o[this[i]] = this[i];
    } 

    for (i in o) {
        r.push(o[i]);
    }
    
    return r;
};

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
        gameOverCalled: false,
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
        pauseBtn: $('#hud-pauseBtn')
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
    },

    gameOverMenu: {
        element: $('#gameOverMenu'),
        overlay: $('#gameOverMenu .overlay'),

        highScore: {
            element: $('#gameOverMenu-highScore'),
            number: $('#gameOverMenu-highScore .score')
        },

        score: {
            element: $('#gameOverMenu-score'),
            number: $('#gameOverMenu-score .score')
        },

        coins: {
            element: $('#gameOverMenu-coins'),
            number: $('#gameOverMenu-coins .score')
        },

        playAgainBtn: $('#gameOverMenu-playAgain'),
        mainMenuBtn: $('#gameOverMenu-mainMenu')
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
            DisplayData.pauseMenu.element,
            DisplayData.gameOverMenu.element
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
        // Get unique scores
        DD.game.score.highScores = DD.game.score.highScores.unique();
        
        // Sort scores
        DD.game.score.highScores.sort(function(a, b) {
            return a < b;
        });

        // Generate HTML for scores
        var highScoresHtml = '';

        for (var i = 0; i < 5; i++) {
            if (DD.game.score.highScores[i]) {
                highScoresHtml += '<div>' + DD.game.score.highScores[i] + '</div>';
            }
        }

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

    // High Scores menu animations
    highScoresMenu: function() {
        // Animate scores
        TweenMax.staggerFrom('#highScoresMenu-list div', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#highScoresMenu li', 0.3, {
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
    },

    gameOverMenu: function() {
        // Animate menu title
        TweenMax.from('#gameOverMenu h1', 1, {
            scale: 0.4,
            ease: Bounce.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#gameOverMenu li', 0.3, {
            y: 100,
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
                'star'
            );

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

    // Restore saved values from local storage
    restoreSavedValues: function() {
        var highScores;
        var coins;

        if (!simpleStorage.canUse()) {
            console.error('Local storage not available');
            return;
        }

        // Restore high scores
        highScores = simpleStorage.get('highScores');
        if (highScores) {
            DD.game.score.highScores = highScores;
        }

        // Restore coins
        coins = simpleStorage.get('coins');
        if (coins) {
            DD.game.score.coins.total = coins;
        }
    },

    updateHighScores: function(score) {
        if (score.score <= 0) {
            return;
        }

        // Add new values to current values
        var highScores = [score.score].concat(DD.game.score.highScores);
        var coins = score.coins + DD.game.score.coins.total;

        // Get unique scores and sort in DESC
        highScores = highScores.unique();
        highScores.sort(function(a, b) {
            return a < b;
        });

        // Get only top 10 scores
        highScores = highScores.splice(0, 9);

        // Update in-game values
        DD.game.score.highScores = highScores;
        DD.game.score.coins.total = coins;

        // Update persisted values
        simpleStorage.set('highScores', highScores);
        simpleStorage.set('coins', coins);
    },

    // TODO: function similar to that above for coins

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

        // Reset scores
        DD.game.score.lastRun = 0;
        DD.game.score.lastFrameValue.coins = 0;
        DD.game.score.lastFrameValue.score = 0;

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
        var newHighestScore = false;

        if (!DD.game.gameOverCalled) {
            DD.game.runEnd = true;

            if (DD.game.score.lastRun > DD.game.score.highScores[0]) {
                newHighestScore = true;
            }

            DD.game.actions.updateHighScores({
                score: DD.game.score.lastRun,
                coins: DD.game.score.coins.lastRun
            });

            Display.hideElements([
                DisplayData.gameOverMenu.highScore.element,
                DisplayData.gameOverMenu.score.element
            ]);

            if (newHighestScore) {
                Display.showElements([
                    DisplayData.gameOverMenu.highScore.element
                ]);
            } else {
                Display.showElements([
                    DisplayData.gameOverMenu.score.element
                ]);
            }

            Display.showMenu(DisplayData.gameOverMenu.element);
            PlayAnimations.gameOverMenu();

            // Wait half a second, then trigger score display animation
            window.setTimeout(function() {
                DisplayData.gameOverMenu.coins.number.text(DD.game.score.coins.lastRun); 
                
                if (newHighestScore) {
                    DisplayData.gameOverMenu.highScore.number.text(DD.game.score.lastRun);
                } else {
                    DisplayData.gameOverMenu.score.number.text(DD.game.score.lastRun);
                }
            }, 500);

            // Prevent gameOver() from being called multiple times
            DD.game.gameOverCalled = true;
        }
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
        PlayAnimations.highScoresMenu();
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

    // Game over menu: Play again button
    $(DisplayData.gameOverMenu.playAgainBtn).click(function() {
        Display.hideAllMenus();

        // Reset HUD scores
        DisplayData.hud.score.text(0);
        DisplayData.hud.coins.text(0);

        // Show HUD and pause button
        Display.showElements([DisplayData.hud.element, DisplayData.hud.pauseBtn]);

        // Restart game
        DD.game.actions.restart();
        DD.game.gameOverCalled = false;

        // Resume game
        game.paused = false;
    });

    // Game Over menu: Quit to Main Menu button
    $(DisplayData.gameOverMenu.mainMenuBtn).click(function() {
        // First run will show Main Menu and play its animation
        DD.game.firstRun = true;
        DD.game.actions.restart();

        DD.game.gameOverCalled = false;
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

// Restore persisted values from local storage
DD.game.actions.restoreSavedValues();

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
    game.load.image('star', '/assets/images/star.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/oilback.png');
    game.load.spritesheet('oilspillfront', '/assets/images/GradientOil.png', 1920, 1080);
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);
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

    // Add oilspill element and enable Physics
    DD.objects.spill.element = game.add.sprite(1600, 0, 'oilspill');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gUmVnaXN0ZXIgQXJyYXkuZ2V0VW5pcXVlKClcclxuQXJyYXkucHJvdG90eXBlLnVuaXF1ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICB2YXIgbCA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIHIgPSBbXTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XHJcbiAgICAgICAgb1t0aGlzW2ldXSA9IHRoaXNbaV07XHJcbiAgICB9IFxyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcbiAgICAgICAgci5wdXNoKG9baV0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgc3RhdGUgaW5kZXBlbmRlbnQgb2YgUGhhc2VyXHJcbiAqL1xyXG52YXIgREQgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxyXG5cclxuICAgIG9iamVjdHM6IHtcclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBzcGVlZDogMjUwLFxyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgZ3JhZGllbnQ6IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNvaW5zOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogKE1hdGgucmFuZG9tKCkgKiA1MCkgKyA1MCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsZWN0ZWRJZHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGp1bmtzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMTAwMCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBzbG93OiAwLjUsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0dXJlczoge1xyXG4gICAgICAgIGxheWVyQTogbnVsbCxcclxuICAgICAgICBsYXllckI6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJDOiBudWxsLFxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBzcGVlZDogMzAwLFxyXG4gICAgICAgIHZlcnRTcGVlZDogMzAwLFxyXG4gICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgYW5nbGU6IDIwXHJcbiAgICB9LFxyXG5cclxuICAgIGdhbWU6IHtcclxuICAgICAgICBnYW1lT3ZlckNhbGxlZDogZmFsc2UsXHJcbiAgICAgICAgZmlyc3RSdW46IHRydWUsXHJcbiAgICAgICAgcnVuRW5kOiBmYWxzZSxcclxuICAgICAgICBjdXJzb3JzOiBudWxsLFxyXG5cclxuICAgICAgICB3b3JsZDoge1xyXG4gICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIwMDBcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzY29yZToge1xyXG4gICAgICAgICAgICBjb2luczoge1xyXG4gICAgICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICBsYXN0RnJhbWVWYWx1ZToge1xyXG4gICAgICAgICAgICAgICAgY29pbnM6IDAsXHJcbiAgICAgICAgICAgICAgICBzY29yZTogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoaWdoU2NvcmVzOiBbXVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYm9vc3Q6IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMjAwLFxyXG4gICAgICAgICAgICAgICAgYmVnaW46IDAsXHJcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAxXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gSnVzdCBhIGZyaWVuZGx5IHJlbWluZGVyXHJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgREQudmVyc2lvbik7XHJcblxyXG4vLyBHbG9iYWwgZ2FtZSBvYmplY3RcclxudmFyIGdhbWU7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vKipcclxuICogSG9sZHMgcmVmZXJlbmNlcyB0byBhbGwgb24tc2NyZWVuIGVsZW1lbnRzXHJcbiAqIChleHRlcmFsIHRvIFBoYXNlcilcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheURhdGEgPSB7XHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2dhbWUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBodWQ6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaHVkJyksXHJcbiAgICAgICAgc2NvcmU6ICQoJyNodWQtc2NvcmUnKSxcclxuICAgICAgICBjb2luczogJCgnI2h1ZC1jb2lucycpLFxyXG4gICAgICAgIHBhdXNlQnRuOiAkKCcjaHVkLXBhdXNlQnRuJylcclxuICAgIH0sXHJcblxyXG4gICAgbWFpbk1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXdHYW1lQnRuOiAkKCcjbWFpbk1lbnUtbmV3R2FtZScpLFxyXG4gICAgICAgIGhpZ2hTY29yZXNCdG46ICQoJyNtYWluTWVudS1oaWdoU2NvcmVzJyksXHJcbiAgICAgICAgaG93VG9QbGF5QnRuOiAkKCcjbWFpbk1lbnUtaG93VG9QbGF5JyksXHJcbiAgICAgICAgYWJvdXRCdG46ICQoJyNtYWluTWVudS1hYm91dCcpXHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hTY29yZXNNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hpZ2hTY29yZXNNZW51JyksXHJcbiAgICAgICAgbGlzdDogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgaG93VG9QbGF5TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNob3dUb1BsYXlNZW51JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNob3dUb1BsYXlNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI2dhbWVPdmVyTWVudSAub3ZlcmxheScpLFxyXG5cclxuICAgICAgICBoaWdoU2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1jb2lucycpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtY29pbnMgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lT3Zlck1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgc2hvd0VsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgaGlkZUVsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc2hvd01lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFttZW51XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxNZW51czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBoaWRlQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHNjb3JlcyBpbiBBYm91dCBtZW51XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhpZ2hTY29yZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzID0gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnVuaXF1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNvcnQgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIEhUTUwgZm9yIHNjb3Jlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXNcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3QpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIENvbnRyb2xzIHRoZSBwbGF5YmFjayBvZiBhbmltYXRpb25zXHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIFBsYXlBbmltYXRpb25zID0ge1xyXG4gICAgLy8gTWFpbiBNZW51IGFuaW1hdGlvbnNcclxuICAgIG1haW5NZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjbWFpbk1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjYsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNtYWluTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnUgYW5pbWF0aW9uc1xyXG4gICAgaGlnaFNjb3Jlc01lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0IGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQYXVzZSBNZW51IGFuaW1hdGlvbnNcclxuICAgIHBhdXNlTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNwYXVzZU1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogNzUsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdhbWVPdmVyTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2dhbWVPdmVyTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNCxcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2dhbWVPdmVyTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBHYW1lIGFjdGlvbnMgYW5kIGFjdGlvbi1yZWxhdGVkXHJcbi8vIGZ1bmN0aW9uc1xyXG5ERC5nYW1lLmFjdGlvbnMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGdhbWVcclxuICAgICAqIFxyXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgZ2xvYmFsIGdhbWUgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICAgICAgICAgIHByZWxvYWQ6IERELmdhbWUucHJlbG9hZCxcclxuICAgICAgICAgICAgY3JlYXRlOiBERC5nYW1lLmNyZWF0ZSxcclxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcclxuICAgICAgICAgICAgcmVuZGVyOiBERC5nYW1lLnJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuXHQvKipcclxuXHQgKiBKdW5rIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG5cdCAqXHJcblx0ICogQ3JlYXRlcyBhIHRob3VzYW5kIGp1bmsgb2JqZWN0cyBhbmQgc3RvcmVzXHJcblx0ICogdGhlbSBpbiBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzW11cclxuXHQgKi9cclxuICAgIGNyZWF0ZUp1bmtzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganVuaztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAganVuayA9IGdhbWUuYWRkLnNwcml0ZShcclxuICAgICAgICAgICAgICAgIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnc3RhcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGp1bmsucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgLy8ganVuay5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSAqIDI7XHJcbiAgICAgICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSAqIDgwO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5wdXNoKGp1bmspO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcblx0ICogQ29pbiBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuXHQgKlxyXG5cdCAqIENyZWF0ZXMgYSB0aG91c2FuZCBjb2luIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG5cdCAqIHRoZW0gaW4gREQub2JqZWN0cy5jb2lucy5lbGVtZW50c1tdXHJcblx0ICovXHJcbiAgICBjcmVhdGVDb2luczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvaW47XHJcbiAgICAgICAgdmFyIGo7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBERC5vYmplY3RzLmNvaW5zLmFtb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgICAgIGNvaW4gPSBnYW1lLmFkZC5zcHJpdGUoXHJcbiAgICAgICAgICAgICAgICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSwgXHJcbiAgICAgICAgICAgICAgICAnaGVhbHRocGFjaydcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvaW4uZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIGNvaW4ucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShjb2luKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBjb2luLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBjb2luIHRvIHVzZSB0aGUgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAgY29pbi5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gY29pbnMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIGNvaW4uYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzLnB1c2goY29pbik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSZXN0b3JlIHNhdmVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgIHJlc3RvcmVTYXZlZFZhbHVlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXM7XHJcbiAgICAgICAgdmFyIGNvaW5zO1xyXG5cclxuICAgICAgICBpZiAoIXNpbXBsZVN0b3JhZ2UuY2FuVXNlKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTG9jYWwgc3RvcmFnZSBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc3RvcmUgaGlnaCBzY29yZXNcclxuICAgICAgICBoaWdoU2NvcmVzID0gc2ltcGxlU3RvcmFnZS5nZXQoJ2hpZ2hTY29yZXMnKTtcclxuICAgICAgICBpZiAoaGlnaFNjb3Jlcykge1xyXG4gICAgICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBjb2luc1xyXG4gICAgICAgIGNvaW5zID0gc2ltcGxlU3RvcmFnZS5nZXQoJ2NvaW5zJyk7XHJcbiAgICAgICAgaWYgKGNvaW5zKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuY29pbnMudG90YWwgPSBjb2lucztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUhpZ2hTY29yZXM6IGZ1bmN0aW9uKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIGNvaW5zID0gc2NvcmUuY29pbnMgKyBERC5nYW1lLnNjb3JlLmNvaW5zLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuY29pbnMudG90YWwgPSBjb2lucztcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdjb2lucycsIGNvaW5zKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gVE9ETzogZnVuY3Rpb24gc2ltaWxhciB0byB0aGF0IGFib3ZlIGZvciBjb2luc1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgcmVzdGFydFxyXG4gICAgICogXHJcbiAgICAgKiBSZXNldCBydW5uaW5nIHZhcmlhYmxlcyBhbmQgcmVzdGFydCBnYW1lIGJ5XHJcbiAgICAgKiBkZXN0cm95aW5nIGN1cnJlbnQgZ2FtZSBjYWNoZSBhbmQgXHJcbiAgICAgKiByZS1pbml0aWFsaXppbmcgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgcmVzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gS2lsbCBvZmYganVua3NcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oanVuaywgaW5kZXgpIHtcclxuICAgICAgICAgICAganVuay5ib2R5ID0gbnVsbDtcclxuICAgICAgICAgICAganVuay5raWxsKCk7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3NbaW5kZXhdID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gS2lsbCBvZmYgY29pbnNcclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oY29pbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgY29pbi5ib2R5ID0gbnVsbDtcclxuICAgICAgICAgICAgY29pbi5raWxsKCk7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuY29pbnNbaW5kZXhdID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQganVua3MgYW5kIGNvaW5zIGFycmF5c1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMgPSBbXTtcclxuICAgICAgICBERC5vYmplY3RzLmNvaW5zLmVsZW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGdhbWUgd29ybGRcclxuICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsID0gMTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gMDtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLmNvaW5zID0gMDtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gMDtcclxuXHJcbiAgICAgICAgZ2FtZS5kZXN0cm95KCk7XHJcbiAgICAgICAgZ2FtZSA9IG51bGw7XHJcblxyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5zdGFydCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICAgICAqIFxyXG4gICAgICogRW5kcyBjdXJyZW50IGdhbWUgYW5kIGRpc3BsYXlzXHJcbiAgICAgKiBnYW1lIG92ZXIgbWVudVxyXG4gICAgICovXHJcbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld0hpZ2hlc3RTY29yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIURELmdhbWUuZ2FtZU92ZXJDYWxsZWQpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUubGFzdFJ1biA+IERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgbmV3SGlnaGVzdFNjb3JlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnVwZGF0ZUhpZ2hTY29yZXMoe1xyXG4gICAgICAgICAgICAgICAgc2NvcmU6IERELmdhbWUuc2NvcmUubGFzdFJ1bixcclxuICAgICAgICAgICAgICAgIGNvaW5zOiBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIFBsYXlBbmltYXRpb25zLmdhbWVPdmVyTWVudSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCBoYWxmIGEgc2Vjb25kLCB0aGVuIHRyaWdnZXIgc2NvcmUgZGlzcGxheSBhbmltYXRpb25cclxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuY29pbnMubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuKTsgXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCBnYW1lT3ZlcigpIGZyb20gYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIENoZWNrIGZvciB0b3VjaCBldmVudHNcclxuREQuZ2FtZS50b3VjaCA9IHtcclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1RvdWNoaW5nVXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPCAzMDApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55IDwgMzAwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gbG93ZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdEb3duOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55ID4gMzAwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54ID4gNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA+IDMwMClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhpZ2ggU2NvcmVzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5oaWdoU2NvcmVzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhvdyB0byBQbGF5IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5ob3dUb1BsYXlCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogQWJvdXQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmFib3V0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWJvdXQgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBiYWNrZ3JvdW5kIG92ZXJsYXlcclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN0YXJ0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgIFxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgb3ZlciBtZW51OiBQbGF5IGFnYWluIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUucGxheUFnYWluQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLmNvaW5zLnRleHQoMCk7XHJcblxyXG4gICAgICAgIC8vIFNob3cgSFVEIGFuZCBwYXVzZSBidXR0b25cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGdhbWVcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBPdmVyIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEZpcnN0IHJ1biB3aWxsIHNob3cgTWFpbiBNZW51IGFuZCBwbGF5IGl0cyBhbmltYXRpb25cclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG5cclxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhVRDogUGF1c2UgYnV0dG9uOiBoYW5kbGVzIHBhdXNlIGFjdGl2YXRpb25cclxuICAgICAqIFxyXG4gICAgICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxyXG4gICAgICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkXHJcbiAgICAgKi9cclxuICAgICQoRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5wYXVzZU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxufSk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBSZXN0b3JlIHBlcnNpc3RlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbkRELmdhbWUuYWN0aW9ucy5yZXN0b3JlU2F2ZWRWYWx1ZXMoKTtcclxuXHJcbi8qKlxyXG4gKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHMgaW5jbHVkaW5nIFxyXG4gKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICovXHJcbkRELmdhbWUucHJlbG9hZCA9IGZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvU3RhdGljQmFja2dyb3VuZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwxJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwyJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMi5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdoZWFsdGhwYWNrJywgJy9hc3NldHMvaW1hZ2VzL2ZpcnN0YWlkLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvb2lsYmFjay5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnLCAxOTIwLCAxMDgwKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5ERC5nYW1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgIC8vIEFkZCBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICAvLyBTZXQgdHJhbnNwYXJlbmN5IG9mIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMC42O1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmFscGhhID0gMTtcclxuXHJcbiAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQiwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIFNldHVwIFBhcmFsbGF4IHNjcm9sbGluZyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgzICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgxICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG5cclxuICAgIC8vIE1ha2UgYmFja2dyb3VuZCBsYXllcnMgaW1tdW5lIHRvIGNvbGxpc2lvbnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgb2lsc3BpbGwgZWxlbWVudCBhbmQgZW5hYmxlIFBoeXNpY3NcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgxNjAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5wbGF5ZXIuZWxlbWVudCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gUGxheWVyIGFuaW1hdGlvbnNcclxuICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs0LCAzLCA1XSwgNiwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNvbGxpc2lvbiBncm91cHNcclxuICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUganVua3MgYW5kIGNvaW5zXHJcbiAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlSnVua3MoKTtcclxuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVDb2lucygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNvbGxpc2lvbnNcclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAsIERELmdhbWUuYWN0aW9ucy5nYW1lT3ZlciwgdGhpcyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuY29pbnMuY29sbGlzaW9uR3JvdXAsIGNvbGxlY3RDb2luLCB0aGlzKTtcclxuXHJcbiAgICAvLyBTZXR1cCBrZXlib2FyZCBjb250cm9sc1xyXG4gICAgREQuZ2FtZS5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgLy8gU2V0dXAgY2FtZXJhXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3coREQucGxheWVyLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gKi9cclxuREQuZ2FtZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgaWYgKChERC5wbGF5ZXIuZWxlbWVudC54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0xICogREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHb3Zlcm5zIGFuZCBjb250cm9scyBib29zdFxyXG4gICAgaWYgKCFERC5nYW1lLnJ1bkVuZCkge1xyXG4gICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiB0aGUgLTggY29tcGVuc2F0ZXMgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyIGluIHRoZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9ICgoREQucGxheWVyLmVsZW1lbnQueCAvIDQwMCkgLSA4KSAqIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXI7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gcGFyc2VJbnQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHZlbG9jaXR5IGFuZCBwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCArICg1MCAqIERELmdhbWUud29ybGQubGV2ZWwpICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIG9pbHNwaWxsIHZlbG9jaXR5XHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELm9iamVjdHMuc3BpbGwuc3BlZWQgKyAoNTAgKiBERC5nYW1lLndvcmxkLmxldmVsKTtcclxuXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zcGlsbC5ncmFkaWVudC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5Lng7XHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zcGlsbC5ncmFkaWVudC5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnc3BpbGwnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gU3RvcHMgYWxsIG9mIHRoZSBvYmplY3RzIHNvIHRoYXQgaXRzIG5vdCBjbHVua3kuIE9uY2UgdGhlIGRlYXRoIG1lbnUgaXMgaW1wbGVtZW50ZWQsIHRoaXMgd2lsbCBsb29rIHF1aXRlIG5pY2VcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG5cclxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gLTE7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSBERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbDtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luID0gREQucGxheWVyLmVsZW1lbnQueDtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCT09TVCEnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gY2hhcmdlcyBsZWZ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMudXAuaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ1VwKCkpIHtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gLTEgKiBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gLTEgKiBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgfSBlbHNlIGlmIChERC5nYW1lLmN1cnNvcnMuZG93bi5pc0Rvd24gfHwgREQuZ2FtZS50b3VjaC5pc1RvdWNoaW5nRG93bigpKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IERELnBsYXllci5hbmdsZTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGN1cnJlbnRseSBub3Qgd29ya2luZy5cclxuICAgIC8vIEkgKEJyaWFuKSB3aWxsIGhhdmUgdG8gcmVhZCB0aGUgZG9jcyB3aGVuIGkgY2FuIHRvIHNlZSBob3cgdG8gZml4IHRoaXMuXHJcbiAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuY29sbGlkZVdvcmxkQm91bmRzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RvdWNoaW5nJyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAqL1xyXG5ERC5nYW1lLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIC8vIFVwZGF0ZSBzY29yZVxyXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgIT09IERELmdhbWUuc2NvcmUubGFzdFJ1bikge1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IERELmdhbWUuc2NvcmUubGFzdFJ1bjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgY29pbnNcclxuICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLmNvaW5zICE9PSBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4pIHtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuY29pbnMudGV4dChERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4pO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuY29pbnMgPSBERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllciwgMzIsIDcyKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICovXHJcbmZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnSnVuayBoaXQhJyk7XHJcblxyXG4gICAgaWYgKERELm9iamVjdHMuanVua3MuYWN0aXZlICE9PSB0cnVlKSB7XHJcbiAgICAgICAgREQucGxheWVyLnNwZWVkID0gREQucGxheWVyLnNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBnYW1lLnRpbWUuZXZlbnRzLmFkZChQaGFzZXIuVGltZXIuU0VDT05EICogMiwgcmVnYWluU3BlZWQsIHRoaXMpOyBcclxuICAgIH0gIFxyXG59XHJcblxyXG4vKipcclxuICogSW5jcmVhc2UgcGxheWVyIHNwZWVkIGFmdGVyXHJcbiAqIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICovXHJcbmZ1bmN0aW9uIHJlZ2FpblNwZWVkKCkge1xyXG4gICAgY29uc29sZS5sb2coJ1JlZ2FpbmluZyBzcGVlZCEnKTtcclxuXHJcbiAgICBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgLyBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBjb2luXHJcbiAqIEBwYXJhbSAge0dhbWUuc3ByaXRlfSBwbGF5ZXJcclxuICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IGNvaW5cclxuICovXHJcbmZ1bmN0aW9uIGNvbGxlY3RDb2luKHBsYXllciwgY29pbikge1xyXG4gICAgY29uc29sZS5sb2coJ0NvaW4gY29sbGVjdGVkJyk7XHJcblxyXG4gICAgY29pbi5ib2R5ID0gbnVsbDtcclxuICAgIGNvaW4uc3ByaXRlLmtpbGwoKTtcclxuXHJcbiAgICBpZiAoREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMuaW5kZXhPZihjb2luLmRhdGEuaWQpID09PSAtMSkge1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1biArPSAxO1xyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuY29sbGVjdGVkSWRzLnB1c2goY29pbi5kYXRhLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGRpdGlvbmFsbHkgaGF2ZSB0byBhZGQgY29kZSB3aGljaCB3aWxsIHJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIGdhbWVcclxufVxyXG5cclxuLy8gRXZlcnl0aGluZyBpcyBkZWNsYXJlZDogaW5pdGlhbGl6ZSBnYW1lXHJcbkRELmdhbWUuYWN0aW9ucy5zdGFydCgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=