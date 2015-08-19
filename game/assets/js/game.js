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
        listPage2: $('#highScoresMenu-list-page2'),
        mainMenuBtn: $('#highScoresMenu-mainMenu'),
        nextPage2Btn: $('#highScoresMenu-next-page2Btn'),
        prevPage1Btn: $('#highScoresMenu-prev-page1Btn'),

        page1: $('#highScoresMenu-page1'),
        page2: $('#highScoresMenu-page2')
    },

    howToPlayMenu: {
        element: $('#howToPlayMenu'),
        mainMenuBtn: $('#howToPlayMenu-mainMenu'),
        nextPage2Btn: $('#howToPlayMenu-next-page2Btn'),
        prevPage1Btn: $('#howToPlayMenu-prev-page1Btn'),
        nextPage3Btn: $('#howToPlayMenu-next-page3Btn'),
        prevPage2Btn: $('#howToPlayMenu-prev-page2Btn'),

        page1: $('#howToPlayMenu-page1'),
        page2: $('#howToPlayMenu-page2'),
        page3: $('#howToPlayMenu-page3')
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

        // Display updated scores (page 1)
        if (DD.game.score.highScores.length) {
            $(DisplayData.highScoresMenu.list).html(highScoresHtml);
        }

        highScoresHtml = '';
        for (var j = 5; j < 10; j++) {
            if (DD.game.score.highScores[j]) {
                highScoresHtml += '<div>' + DD.game.score.highScores[j] + '</div>';
            }
        }

        // Display updated scores (page 2)
        if (highScoresHtml.length) {
            $(DisplayData.highScoresMenu.listPage2).html(highScoresHtml);
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

    // High scores menu page 2
    highScoresMenu2: function() {
        // Animate scores
        TweenMax.staggerFrom('#highScoresMenu-list-page2 div', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#highScoresMenu-page2 li', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    howToPlayMenu: function() {
        // Animate text
        TweenMax.from('#howToPlayMenu .text', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    aboutMenu: function() {
        // Animate text
        TweenMax.from('#aboutMenu .text', 0.3, {
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
                'bag'
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
                'starfish'
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
        PlayAnimations.howToPlayMenu();
    });

    // Main menu: About button
    $(DisplayData.mainMenu.aboutBtn).click(function() {
        Display.showMenu(DisplayData.aboutMenu.element);
        PlayAnimations.aboutMenu();
    });

    // High Scores menu: Return to Main Menu button
    $(DisplayData.highScoresMenu.mainMenuBtn).click(function() {
        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    });

    // High Scores menu: next Page 2 button
    $(DisplayData.highScoresMenu.nextPage2Btn).click(function() {
        Display.hideElements([
            DisplayData.highScoresMenu.page1,
            DisplayData.highScoresMenu.page2
        ]);

        Display.showElements([
            DisplayData.highScoresMenu.page2
        ]);

        PlayAnimations.highScoresMenu2();
    });

    // High Scores menu: prev Page 1 button
    $(DisplayData.highScoresMenu.prevPage1Btn).click(function() {
        Display.hideElements([
            DisplayData.highScoresMenu.page1,
            DisplayData.highScoresMenu.page2
        ]);

        Display.showElements([
            DisplayData.highScoresMenu.page1
        ]);

        PlayAnimations.highScoresMenu();
    });

    // High to Play menu: Return to Main Menu button
    $(DisplayData.howToPlayMenu.mainMenuBtn).click(function() {
        Display.showMenu(DisplayData.mainMenu.element);
        PlayAnimations.mainMenu();
    });

    // High to Play menu: prev Page 1 button
    $(DisplayData.howToPlayMenu.prevPage1Btn).click(function() {
        Display.hideElements([
            DisplayData.howToPlayMenu.page1,
            DisplayData.howToPlayMenu.page2,
            DisplayData.howToPlayMenu.page3
        ]);

        Display.showElements([
            DisplayData.howToPlayMenu.page1
        ]);

        PlayAnimations.howToPlayMenu();
    });

    // High to Play menu: next and prev Page 2 button
    $(DisplayData.howToPlayMenu.nextPage2Btn).add(DisplayData.howToPlayMenu.prevPage2Btn).click(function() {
        Display.hideElements([
            DisplayData.howToPlayMenu.page1,
            DisplayData.howToPlayMenu.page2,
            DisplayData.howToPlayMenu.page3
        ]);

        Display.showElements([
            DisplayData.howToPlayMenu.page2
        ]);

        PlayAnimations.howToPlayMenu();
    });

    // High to Play menu: next Page 3 button
    $(DisplayData.howToPlayMenu.nextPage3Btn).click(function() {
        Display.hideElements([
            DisplayData.howToPlayMenu.page1,
            DisplayData.howToPlayMenu.page2,
            DisplayData.howToPlayMenu.page3
        ]);

        Display.showElements([
            DisplayData.howToPlayMenu.page3
        ]);

        PlayAnimations.howToPlayMenu();
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
    game.load.image('bag', '/assets/images/bag.png');
    game.load.image('starfish', '/assets/images/starfish.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/oilback.png');
    game.load.spritesheet('oilspillfront', '/assets/images/GradientOil.png', 1920, 1080);
    game.load.spritesheet('dolphin', '/assets/images/new-dolphin.png', 245, 103);
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
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dolphin');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Player animations
    DD.player.element.animations.add('right', [0, 1, 2, 3, 4], 10, true);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZWdpc3RlciBBcnJheS5nZXRVbmlxdWUoKVxyXG5BcnJheS5wcm90b3R5cGUudW5pcXVlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGkgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciBsID0gdGhpcy5sZW5ndGg7XHJcbiAgICB2YXIgciA9IFtdO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcclxuICAgICAgICBvW3RoaXNbaV1dID0gdGhpc1tpXTtcclxuICAgIH0gXHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuICAgICAgICByLnB1c2gob1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByO1xyXG59O1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIEREIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBzdGF0ZSBpbmRlcGVuZGVudCBvZiBQaGFzZXJcclxuICovXHJcbnZhciBERCA9IHtcclxuICAgIHZlcnNpb246ICcwLjEuMCcsXHJcblxyXG4gICAgb2JqZWN0czoge1xyXG4gICAgICAgIHNwaWxsOiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiAyNTAsXHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBncmFkaWVudDoge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAoTWF0aC5yYW5kb20oKSAqIDUwKSArIDUwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAxMDAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGdhbWVPdmVyQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGNvaW5zOiB7XHJcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBjb2luczogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXM6IFtdXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiAwLFxyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDFcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IDFcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuXHJcbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxyXG52YXIgZ2FtZTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyByZWZlcmVuY2VzIHRvIGFsbCBvbi1zY3JlZW4gZWxlbWVudHNcclxuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5RGF0YSA9IHtcclxuICAgIGdhbWU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZDoge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNodWQnKSxcclxuICAgICAgICBzY29yZTogJCgnI2h1ZC1zY29yZScpLFxyXG4gICAgICAgIGNvaW5zOiAkKCcjaHVkLWNvaW5zJyksXHJcbiAgICAgICAgcGF1c2VCdG46ICQoJyNodWQtcGF1c2VCdG4nKVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWluTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNtYWluTWVudScpLFxyXG4gICAgICAgIG5ld0dhbWVCdG46ICQoJyNtYWluTWVudS1uZXdHYW1lJyksXHJcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcclxuICAgICAgICBob3dUb1BsYXlCdG46ICQoJyNtYWluTWVudS1ob3dUb1BsYXknKSxcclxuICAgICAgICBhYm91dEJ0bjogJCgnI21haW5NZW51LWFib3V0JylcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaFNjb3Jlc01lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcclxuICAgICAgICBsaXN0OiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCcpLFxyXG4gICAgICAgIGxpc3RQYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTInKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTInKVxyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuICAgICAgICBuZXh0UGFnZTNCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTNCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTJCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UyJyksXHJcbiAgICAgICAgcGFnZTM6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UzJylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI2dhbWVPdmVyTWVudSAub3ZlcmxheScpLFxyXG5cclxuICAgICAgICBoaWdoU2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29pbnM6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1jb2lucycpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtY29pbnMgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lT3Zlck1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgc2hvd0VsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgaGlkZUVsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc2hvd01lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFttZW51XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxNZW51czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBoaWRlQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHNjb3JlcyBpbiBBYm91dCBtZW51XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhpZ2hTY29yZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzID0gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnVuaXF1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNvcnQgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIEhUTUwgZm9yIHNjb3Jlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMSlcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3QpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuICAgICAgICBmb3IgKHZhciBqID0gNTsgaiA8IDEwOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSkge1xyXG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDIpXHJcbiAgICAgICAgaWYgKGhpZ2hTY29yZXNIdG1sLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3RQYWdlMikuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ29udHJvbHMgdGhlIHBsYXliYWNrIG9mIGFuaW1hdGlvbnNcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7XHJcbiAgICAvLyBNYWluIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgbWFpbk1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNtYWluTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNixcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI21haW5NZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudSBhbmltYXRpb25zXHJcbiAgICBoaWdoU2NvcmVzTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBzY29yZXNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LWxpc3QgZGl2JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEhpZ2ggc2NvcmVzIG1lbnUgcGFnZSAyXHJcbiAgICBoaWdoU2NvcmVzTWVudTI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyIGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTIgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjaG93VG9QbGF5TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGFib3V0TWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2Fib3V0TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFBhdXNlIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgcGF1c2VNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiA3NSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZU92ZXJNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjZ2FtZU92ZXJNZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC40LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjZ2FtZU92ZXJNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIEdhbWUgYWN0aW9ucyBhbmQgYWN0aW9uLXJlbGF0ZWRcclxuLy8gZnVuY3Rpb25zXHJcbkRELmdhbWUuYWN0aW9ucyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgZ2FtZVxyXG4gICAgICogXHJcbiAgICAgKiBJbml0aWFsaXplIHRoZSBnbG9iYWwgZ2FtZSBvYmplY3RcclxuICAgICAqL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgICAgICAgICAgcHJlbG9hZDogREQuZ2FtZS5wcmVsb2FkLFxyXG4gICAgICAgICAgICBjcmVhdGU6IERELmdhbWUuY3JlYXRlLFxyXG4gICAgICAgICAgICB1cGRhdGU6IERELmdhbWUudXBkYXRlLFxyXG4gICAgICAgICAgICByZW5kZXI6IERELmdhbWUucmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIEp1bmsgZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcblx0ICpcclxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQganVuayBvYmplY3RzIGFuZCBzdG9yZXNcclxuXHQgKiB0aGVtIGluIERELm9iamVjdHMuanVua3MuZWxlbWVudHNbXVxyXG5cdCAqL1xyXG4gICAgY3JlYXRlSnVua3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqdW5rO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5qdW5rcy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSxcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSxcclxuICAgICAgICAgICAgICAgICdiYWcnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoanVuayk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMucHVzaChqdW5rKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG5cdCAqIENvaW4gZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcblx0ICpcclxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQgY29pbiBvYmplY3RzIGFuZCBzdG9yZXNcclxuXHQgKiB0aGVtIGluIERELm9iamVjdHMuY29pbnMuZWxlbWVudHNbXVxyXG5cdCAqL1xyXG4gICAgY3JlYXRlQ29pbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb2luO1xyXG4gICAgICAgIHZhciBqO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgREQub2JqZWN0cy5jb2lucy5hbW91bnQ7IGorKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBjb2luID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksIFxyXG4gICAgICAgICAgICAgICAgJ3N0YXJmaXNoJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gY29pbi5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gY29pbi5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGNvaW4pO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGNvaW4uYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGNvaW4gdG8gdXNlIHRoZSBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBjb2luLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb2lucyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgY29pbi5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMucHVzaChjb2luKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFJlc3RvcmUgc2F2ZWQgdmFsdWVzIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gICAgcmVzdG9yZVNhdmVkVmFsdWVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgY29pbnM7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIGNvaW5zXHJcbiAgICAgICAgY29pbnMgPSBzaW1wbGVTdG9yYWdlLmdldCgnY29pbnMnKTtcclxuICAgICAgICBpZiAoY29pbnMpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy50b3RhbCA9IGNvaW5zO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlSGlnaFNjb3JlczogZnVuY3Rpb24oc2NvcmUpIHtcclxuICAgICAgICBpZiAoc2NvcmUuc2NvcmUgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgbmV3IHZhbHVlcyB0byBjdXJyZW50IHZhbHVlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzID0gW3Njb3JlLnNjb3JlXS5jb25jYXQoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzKTtcclxuICAgICAgICB2YXIgY29pbnMgPSBzY29yZS5jb2lucyArIERELmdhbWUuc2NvcmUuY29pbnMudG90YWw7XHJcblxyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzIGFuZCBzb3J0IGluIERFU0NcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy51bmlxdWUoKTtcclxuICAgICAgICBoaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdldCBvbmx5IHRvcCAxMCBzY29yZXNcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy5zcGxpY2UoMCwgOSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpbi1nYW1lIHZhbHVlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy50b3RhbCA9IGNvaW5zO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGVyc2lzdGVkIHZhbHVlc1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdoaWdoU2NvcmVzJywgaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgc2ltcGxlU3RvcmFnZS5zZXQoJ2NvaW5zJywgY29pbnMpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBUT0RPOiBmdW5jdGlvbiBzaW1pbGFyIHRvIHRoYXQgYWJvdmUgZm9yIGNvaW5zXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSByZXN0YXJ0XHJcbiAgICAgKiBcclxuICAgICAqIFJlc2V0IHJ1bm5pbmcgdmFyaWFibGVzIGFuZCByZXN0YXJ0IGdhbWUgYnlcclxuICAgICAqIGRlc3Ryb3lpbmcgY3VycmVudCBnYW1lIGNhY2hlIGFuZCBcclxuICAgICAqIHJlLWluaXRpYWxpemluZyB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICByZXN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBjb2luc1xyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihjb2luLCBpbmRleCkge1xyXG4gICAgICAgICAgICBjb2luLmJvZHkgPSBudWxsO1xyXG4gICAgICAgICAgICBjb2luLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5jb2luc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBqdW5rcyBhbmQgY29pbnMgYXJyYXlzXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIERELm9iamVjdHMuY29pbnMuZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgZ2FtZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgPSAxO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuY29pbnMgPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSAwO1xyXG5cclxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgb3ZlclxyXG4gICAgICogXHJcbiAgICAgKiBFbmRzIGN1cnJlbnQgZ2FtZSBhbmQgZGlzcGxheXNcclxuICAgICAqIGdhbWUgb3ZlciBtZW51XHJcbiAgICAgKi9cclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV3SGlnaGVzdFNjb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgY29pbnM6IERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5jb2lucy5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmNvaW5zLmxhc3RSdW4pOyBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGdhbWVPdmVyKCkgZnJvbSBiZWluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcclxuICAgICAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ2hlY2sgZm9yIHRvdWNoIGV2ZW50c1xyXG5ERC5nYW1lLnRvdWNoID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gdXBwZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdVcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDMwMCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPCAzMDApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiBsb3dlciByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNUb3VjaGluZ0Rvd246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPiAzMDApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzAwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIFNldHVwIGV2ZW50cyBhbmQgbGlzdGVuZXJzIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBVcGRhdGUgdmVyc2lvbiBudW1iZXIgaW4gQWJvdXQgbWVudVxyXG4gICAgRGlzcGxheURhdGEuYWJvdXRNZW51LnZlcnNpb24udGV4dChERC52ZXJzaW9uKTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IE5ldyBHYW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5uZXdHYW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSGlnaCBTY29yZXMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmhpZ2hTY29yZXNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkudXBkYXRlSGlnaFNjb3JlcygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSG93IHRvIFBsYXkgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51Lmhvd1RvUGxheUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogQWJvdXQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmFib3V0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5hYm91dE1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBuZXh0IFBhZ2UgMiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubmV4dFBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTFcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgYW5kIHByZXYgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlMkJ0bikuYWRkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBuZXh0IFBhZ2UgMyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWJvdXQgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBiYWNrZ3JvdW5kIG92ZXJsYXlcclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN0YXJ0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgIFxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgb3ZlciBtZW51OiBQbGF5IGFnYWluIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUucGxheUFnYWluQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLmNvaW5zLnRleHQoMCk7XHJcblxyXG4gICAgICAgIC8vIFNob3cgSFVEIGFuZCBwYXVzZSBidXR0b25cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGdhbWVcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBPdmVyIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEZpcnN0IHJ1biB3aWxsIHNob3cgTWFpbiBNZW51IGFuZCBwbGF5IGl0cyBhbmltYXRpb25cclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG5cclxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhVRDogUGF1c2UgYnV0dG9uOiBoYW5kbGVzIHBhdXNlIGFjdGl2YXRpb25cclxuICAgICAqIFxyXG4gICAgICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxyXG4gICAgICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkXHJcbiAgICAgKi9cclxuICAgICQoRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5wYXVzZU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxufSk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBSZXN0b3JlIHBlcnNpc3RlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbkRELmdhbWUuYWN0aW9ucy5yZXN0b3JlU2F2ZWRWYWx1ZXMoKTtcclxuXHJcbi8qKlxyXG4gKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHMgaW5jbHVkaW5nIFxyXG4gKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICovXHJcbkRELmdhbWUucHJlbG9hZCA9IGZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvU3RhdGljQmFja2dyb3VuZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwxJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwyJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMi5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFnJywgJy9hc3NldHMvaW1hZ2VzL2JhZy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcmZpc2gnLCAnL2Fzc2V0cy9pbWFnZXMvc3RhcmZpc2gucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9vaWxiYWNrLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycsIDE5MjAsIDEwODApO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkb2xwaGluJywgJy9hc3NldHMvaW1hZ2VzL25ldy1kb2xwaGluLnBuZycsIDI0NSwgMTAzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAqIGZvciB0aGUgZ2FtZVxyXG4gKi9cclxuREQuZ2FtZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQSA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDEnKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgLy8gU2V0IHRyYW5zcGFyZW5jeSBvZiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmFscGhhID0gMTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5hbHBoYSA9IDE7XHJcblxyXG4gICAgLy8gRW5hYmxlIFBoeXNpY3Mgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQywgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMyAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMiAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAvLyBNYWtlIGJhY2tncm91bmQgbGF5ZXJzIGltbXVuZSB0byBjb2xsaXNpb25zXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnQgYW5kIGVuYWJsZSBQaHlzaWNzXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMTYwMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gQWRkIHBsYXllclxyXG4gICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xyXG5cclxuICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vIFBsYXllciBhbmltYXRpb25zXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbMCwgMSwgMiwgMywgNF0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgY29sbGlzaW9uIGdyb3Vwc1xyXG4gICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLmNvaW5zLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gVGhpcyBwYXJ0IGlzIHZpdGFsIGlmIHlvdSB3YW50IHRoZSBvYmplY3RzIHdpdGggdGhlaXIgb3duIGNvbGxpc2lvbiBncm91cHMgdG8gc3RpbGwgXHJcbiAgICAvLyBDb2xsaWRlIHdpdGggdGhlIHdvcmxkIGJvdW5kcyAod2hpY2ggd2UgZG8pXHJcbiAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICBnYW1lLnBoeXNpY3MucDIudXBkYXRlQm91bmRzQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBqdW5rcyBhbmQgY29pbnNcclxuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUNvaW5zKCk7XHJcblxyXG4gICAgLy8gU2V0dXAgY29sbGlzaW9uc1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQuZ2FtZS5hY3Rpb25zLmdhbWVPdmVyLCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5jb2lucy5jb2xsaXNpb25Hcm91cCwgY29sbGVjdENvaW4sIHRoaXMpO1xyXG5cclxuICAgIC8vIFNldHVwIGtleWJvYXJkIGNvbnRyb2xzXHJcbiAgICBERC5nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhERC5wbGF5ZXIuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxyXG4gICAgaWYgKERELmdhbWUuZmlyc3RSdW4pIHtcclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIGZ1bmN0aW9uXHJcbiAqIFxyXG4gKiBUaGUgZ2FtZSBsb29wIC0gcnVuIG9uY2UgcGVyIGZyYW1lXHJcbiAqL1xyXG5ERC5nYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICBpZiAoKERELnBsYXllci5lbGVtZW50LnggLSBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbikgPj0gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gLTEgKiBERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbDtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdvdmVybnMgYW5kIGNvbnRyb2xzIGJvb3N0XHJcbiAgICBpZiAoIURELmdhbWUucnVuRW5kKSB7XHJcbiAgICAgICAgLy8gU2V0cyBERC5nYW1lLnNjb3JlLmxhc3RSdW4gYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIuIHRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNDAwKSAtIDgpICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSBwYXJzZUludChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDEwKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKyBERC5nYW1lLm1vZGlmaWVycy50b3RhbDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgb2lsc3BpbGwgdmVsb2NpdHlcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5zcGVlZCArICg1MCAqIERELmdhbWUud29ybGQubGV2ZWwpO1xyXG5cclxuICAgICAgICAvLyBERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueDtcclxuICAgICAgICAvLyBERC5vYmplY3RzLnNwaWxsLmdyYWRpZW50LmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdzcGlsbCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBTdG9wcyBhbGwgb2YgdGhlIG9iamVjdHMgc28gdGhhdCBpdHMgbm90IGNsdW5reS4gT25jZSB0aGUgZGVhdGggbWVudSBpcyBpbXBsZW1lbnRlZCwgdGhpcyB3aWxsIGxvb2sgcXVpdGUgbmljZVxyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHBsYXllcidzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmJvZHkueCA+PSAoREQuZ2FtZS53b3JsZC5pbnRlcnZhbCAqIERELmdhbWUud29ybGQubGV2ZWwpICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdMZXZlbCAoc3BlZWQpIHVwIScpO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKERELmdhbWUuY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyA+IDApIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyArPSAtMTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBjaGFyZ2VzIGxlZnQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKERELmdhbWUuY3Vyc29ycy51cC5pc0Rvd24gfHwgREQuZ2FtZS50b3VjaC5pc1RvdWNoaW5nVXAoKSkge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93biB8fCBERC5nYW1lLnRvdWNoLmlzVG91Y2hpbmdEb3duKCkpIHtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY3VycmVudGx5IG5vdCB3b3JraW5nLlxyXG4gICAgLy8gSSAoQnJpYW4pIHdpbGwgaGF2ZSB0byByZWFkIHRoZSBkb2NzIHdoZW4gaSBjYW4gdG8gc2VlIGhvdyB0byBmaXggdGhpcy5cclxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5jb2xsaWRlV29ybGRCb3VuZHMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnVG91Y2hpbmcnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgZnVuY3Rpb25cclxuICovXHJcbkRELmdhbWUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgLy8gVXBkYXRlIHNjb3JlXHJcbiAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gREQuZ2FtZS5zY29yZS5sYXN0UnVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBjb2luc1xyXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuY29pbnMgIT09IERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1bikge1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5jb2lucy50ZXh0KERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1bik7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5jb2lucyA9IERELmdhbWUuc2NvcmUuY29pbnMubGFzdFJ1bjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBwbGF5ZXIgY29sbGlzaW9uIHdpdGgganVua1xyXG4gKi9cclxuZnVuY3Rpb24ganVua0hpdCgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdKdW5rIGhpdCEnKTtcclxuXHJcbiAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgIT09IHRydWUpIHtcclxuICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKFBoYXNlci5UaW1lci5TRUNPTkQgKiAyLCByZWdhaW5TcGVlZCwgdGhpcyk7IFxyXG4gICAgfSAgXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbmNyZWFzZSBwbGF5ZXIgc3BlZWQgYWZ0ZXJcclxuICogY29sbGlzaW9uIHdpdGgganVua1xyXG4gKi9cclxuZnVuY3Rpb24gcmVnYWluU3BlZWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUmVnYWluaW5nIHNwZWVkIScpO1xyXG5cclxuICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAvIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGNvaW5cclxuICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHBsYXllclxyXG4gKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gY29pblxyXG4gKi9cclxuZnVuY3Rpb24gY29sbGVjdENvaW4ocGxheWVyLCBjb2luKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ29pbiBjb2xsZWN0ZWQnKTtcclxuXHJcbiAgICBjb2luLmJvZHkgPSBudWxsO1xyXG4gICAgY29pbi5zcHJpdGUua2lsbCgpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLmNvaW5zLmNvbGxlY3RlZElkcy5pbmRleE9mKGNvaW4uZGF0YS5pZCkgPT09IC0xKSB7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5jb2lucy5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgREQub2JqZWN0cy5jb2lucy5jb2xsZWN0ZWRJZHMucHVzaChjb2luLmRhdGEuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG4vLyBFdmVyeXRoaW5nIGlzIGRlY2xhcmVkOiBpbml0aWFsaXplIGdhbWVcclxuREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==