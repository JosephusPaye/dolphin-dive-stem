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

        starfish: {
            amount: (Math.random() * 50) + 50,
            elements: [],
            collectedIds: [],
            collisionGroup: null
        },

        junks: {
            amount: 100,
            elements: [],
            slow: 0.4,
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
        waves: {
            element: null,
            collisionGroup: null
        },
        sand: {
            element: null,
            collisionGroup: null
        },
        speed: 50
    },

    player: {
        accelerationActive: false,
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
            starfish: {
                lastRun: 0,
                total: 0
            },

            lastRun: 0,
            lastFrameValue: {
                starfish: 0,
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
        },

        audio: {
            junkCollide: null
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
        starfish: $('#hud-starfish'),
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

        starfish: {
            element: $('#gameOverMenu-starfish'),
            number: $('#gameOverMenu-starfish .score')
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
        game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', {
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
	 * Starfish generation on game.create()
	 *
	 * Creates a thousand starfish objects and stores
	 * them in DD.objects.starfish.elements[]
	 */
    createStarfish: function() {
        var starfish;
        var j;

        // Create a thousand junk objects
        for (j = 0; j < DD.objects.starfish.amount; j++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            starfish = game.add.sprite(
                (Math.floor(Math.random() * 187000) + 5000), 
                game.world.randomY, 
                'starfish'
            );

            // starfish.enableBody = true;
            // starfish.physicsBodyType = Phaser.Physics.P2JS;
            game.physics.p2.enable(starfish);

            // The size of the object will likely change too, if that is possible
            starfish.body.setRectangle(24, 22);
            junk.scale.setTo(0.5, 0.5);

            // Tell the starfish to use the DD.objects.starfish.collisionGroup 
            starfish.body.setCollisionGroup(DD.objects.starfish.collisionGroup);

            // Starfishes will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            starfish.body.collides([DD.objects.starfish.collisionGroup, DD.player.collisionGroup]);

            DD.objects.starfish.elements.push(starfish);
        }
    },

    // Restore saved values from local storage
    restoreSavedValues: function() {
        var highScores;
        var starfish;

        if (!simpleStorage.canUse()) {
            console.error('Local storage not available');
            return;
        }

        // Restore high scores
        highScores = simpleStorage.get('highScores');
        if (highScores) {
            DD.game.score.highScores = highScores;
        }

        // Restore starfish count
        starfish = simpleStorage.get('starfish');
        if (starfish) {
            DD.game.score.starfish.total = starfish;
        }
    },

    updateHighScores: function(score) {
        if (score.score <= 0) {
            return;
        }

        // Add new values to current values
        var highScores = [score.score].concat(DD.game.score.highScores);
        var starfish = score.starfish + DD.game.score.starfish.total;

        // Get unique scores and sort in DESC
        highScores = highScores.unique();
        highScores.sort(function(a, b) {
            return a < b;
        });

        // Get only top 10 scores
        highScores = highScores.splice(0, 9);

        // Update in-game values
        DD.game.score.highScores = highScores;
        DD.game.score.starfish.total = starfish;

        // Update persisted values
        simpleStorage.set('highScores', highScores);
        simpleStorage.set('starfish', starfish);
    },

    createNets: function() {
        var net;
        var underNet;
        var k;

        // Create a two hundred net objects
        for (k = 0; k < DD.objects.nets.amount; k++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            net = game.add.sprite( ( (k + 8) * 400), 0, 'overnet' );

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

        // Kill off starfishes
        DD.objects.starfish.elements.forEach(function(starfish, index) {
            starfish.body = null;
            starfish.kill();
            DD.objects.starfish[index] = null;
        });

        // Reset junks and starfish arrays
        DD.objects.junks.elements = [];
        DD.objects.starfish.elements = [];

        // Reset game world
        DD.game.world.level = 1;

        // Reset scores
        DD.game.score.lastRun = 0;
        DD.game.score.lastFrameValue.starfish = 0;
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
                starfish: DD.game.score.starfish.lastRun
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
                DisplayData.gameOverMenu.starfish.number.text(DD.game.score.starfish.lastRun); 
                
                if (newHighestScore) {
                    DisplayData.gameOverMenu.highScore.number.text(DD.game.score.lastRun);
                } else {
                    DisplayData.gameOverMenu.score.number.text(DD.game.score.lastRun);
                }
            }, 500);

            // Prevent gameOver() from being called multiple times
            DD.game.gameOverCalled = true;
        }
    },

    dolphinIsCovered: function() {
        if ( (DD.objects.spill.element.x - DD.player.element.x) > -750) {
            return true;
        }

        return false;
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
            (game.input.pointer1.isDown && game.input.pointer1.x > 780 && game.input.pointer1.y < 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 780 && game.input.pointer2.y < 360)
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
            (game.input.pointer1.isDown && game.input.pointer1.x > 780 && game.input.pointer1.y > 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 780 && game.input.pointer2.y > 360)
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
        
        // Reset HUD scores
        DisplayData.hud.score.text(0);
        DisplayData.hud.starfish.text(0);

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
        DisplayData.hud.starfish.text(0);

        // Show HUD and pause button
        Display.showElements([DisplayData.hud.element, DisplayData.hud.pauseBtn]);

        // Restart game
        DD.game.actions.restart();
        DD.game.gameOverCalled = false;
        DD.game.runEnd = false;

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
    game.load.spritesheet('dolphin', '/assets/images/new-dolphin.png', 245, 103);
    game.load.image('junk', '/assets/images/plasticBag.png');
    game.load.image('healthpack', '/assets/images/firstaid.png');
    game.load.image('overnet', '/assets/images/overnet.png');
    game.load.image('undernet', '/assets/images/undernet.png');
    game.load.image('waves', '/assets/images/waves.png');
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

    // Add player
    DD.player.element = game.add.sprite(3000, game.world.centerY, 'dolphin');
    DD.player.element.scale.setTo(0.4, 0.4);

    // Player physics properties
    game.physics.p2.enable(DD.player.element);
    DD.player.element.body.collideWorldBounds = true;

    // Add oilspill element and enable Physics
    DD.objects.spill.element = game.add.sprite(1600, 0, 'oilspill');
    game.physics.p2.enable(DD.objects.spill.element);

    // Waves
    DD.textures.waves.element = game.add.sprite(0, 0, 'waves');
    game.physics.p2.enable(DD.textures.waves.element);

    // Sand
    DD.textures.sand.element = game.add.sprite(0, 1080, 'waves');
    game.physics.p2.enable(DD.textures.sand.element);
    DD.textures.sand.element.alpha = 0;

    // Sound stuff
    DD.game.audio.junkCollide = game.add.audio('junkImpact');
    DD.game.audio.junkCollide.allowMultiple = true;

    // Player animations
    DD.player.element.animations.add('right', [0, 1, 2, 3, 4], 10, true);
    // DD.player.element.animations.add('collide', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 100, true);

    // Create collision groups
    DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.waves.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.textures.sand.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
    DD.objects.starfish.collisionGroup = game.physics.p2.createCollisionGroup();

    // This part is vital if you want the objects with their own collision groups to still 
    // Collide with the world bounds (which we do)
    // What this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    // Generate junks and starfishes
    DD.game.actions.createJunks();
    DD.game.actions.createStarfish();

    // Setup collisions
    DD.objects.spill.element.body.setCollisionGroup(DD.objects.spill.collisionGroup);
    DD.player.element.body.setCollisionGroup(DD.player.collisionGroup);
    DD.textures.waves.element.body.setCollisionGroup(DD.textures.waves.collisionGroup);
    DD.textures.sand.element.body.setCollisionGroup(DD.textures.sand.collisionGroup);

    DD.textures.waves.element.body.collides([DD.textures.waves.collisionGroup, DD.player.collisionGroup]);
    DD.textures.sand.element.body.collides([DD.textures.sand.collisionGroup, DD.player.collisionGroup]);
    // DD.objects.spill.element.body.collides([DD.objects.spill.collisionGroup, DD.player.collisionGroup]);

    DD.player.element.body.collides(DD.objects.junks.collisionGroup, junkHit, this);
    DD.player.element.body.collides(DD.objects.spill.collisionGroup, DD.game.actions.gameOver, this);
    DD.player.element.body.collides(DD.objects.starfish.collisionGroup, collectStarfish, this);
    DD.player.element.body.collides(DD.textures.waves.collisionGroup, hitWaves, this);
    DD.player.element.body.collides(DD.textures.sand.collisionGroup, hitSand, this);

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
    // Check for game over
    if ( DD.game.actions.dolphinIsCovered() ) {
        DD.game.actions.gameOver();
        DD.player.element.body.velocity.x = 0;

        if ( DD.objects.spill.element.x >= (game.camera.x + 500)) {
            DD.objects.spill.element.body.velocity.x = 0;
        }
    }

    if (DD.game.modifiers.boost.active) {
        if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

            DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
            DD.game.modifiers.boost.active = false;

            console.log('Boost End :(');
        }
    }

    DD.textures.waves.element.body.x = game.camera.x;
    DD.textures.waves.element.body.y = 25;
    DD.textures.sand.element.body.x = game.camera.x;
    DD.textures.sand.element.body.y = 1080;

    DD.textures.waves.element.body.angle = 0;
    DD.textures.sand.element.body. angle = 0;


    // Governs and controls boost
    if (!DD.game.runEnd) {

        // Sets DD.game.score.lastRun based on the position of the player. the -8 compensates for the position of the player in the world
        DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
        DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

        // Minimap: update progress bar
        DisplayData.hud.progressBar.spill.width( (DD.objects.spill.element.x * 500 ) / 192000 );

        // Minimap: update dolphin x
        DisplayData.hud.progressBar.dolphin.css(
            'left', ( (DD.player.element.x * 492 ) / 192000 )
        );

        // Minimap: Update dolphin y
        DisplayData.hud.progressBar.dolphin.css(
            'top', ( (DD.player.element.y * 20) / 1080 )
        );

        // Update the player velocity and play animation
        DD.player.element.body.velocity.x = DD.player.speed + (50 * DD.game.world.level) + DD.game.modifiers.total;
        if (DD.objects.junks.active !== true) {
            DD.player.element.animations.play('right');
        }

        // Update the oilspill velocity
        DD.objects.spill.element.body.velocity.x = DD.objects.spill.speed + (50 * DD.game.world.level);
    }

    // Reset the player's velocity (movement)
    if (!DD.player.accelerationActive) {
        DD.player.element.body.velocity.y = 0;
    }

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
        if (!DD.player.accelerationActive) {
            DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
            DD.player.element.body.angle = -1 * DD.player.angle;
        } else {
            DD.player.element.body.angle = 0;
        }
    } else if (DD.game.cursors.down.isDown || DD.game.touch.isTouchingDown()) {
        if (!DD.player.accelerationActive) {
            DD.player.element.body.angle = DD.player.angle;
            DD.player.element.body.velocity.y = DD.player.vertSpeed;
        } else {
            DD.player.element.body.angle = 0;
        }
    } else {
        DD.player.element.body.angle = 0;
    }
};

/**
 * Render function
 */
DD.game.render = function render() {
    game.debug.body(DD.textures.waves.element);
    game.debug.body(DD.player.element);

    // Update score
    if (DD.game.score.lastFrameValue.score !== DD.game.score.lastRun) {
        DisplayData.hud.score.text(DD.game.score.lastRun);
        DD.game.score.lastFrameValue.score = DD.game.score.lastRun;
    }

    // Update starfish
    if (DD.game.score.lastFrameValue.starfish !== DD.game.score.starfish.lastRun) {
        DisplayData.hud.starfish.text(DD.game.score.starfish.lastRun);
        DD.game.score.lastFrameValue.starfish = DD.game.score.starfish.lastRun;
    }

    // game.debug.text('Score Multiplier: ' + DD.game.modifiers.multiplier, 32, 72);
};

/**
 * Handle player collision with junk
 */
// function junkHit() {
//     console.log('Junk hit!');

//     // Sound stuff
//     DD.player.element.animations.play('collide');
//     DD.game.audio.junkCollide.play();

//     if (!DD.objects.junks.active) {
//         DD.player.speed = DD.player.speed * DD.objects.junks.slow;
//         DD.objects.junks.active = true;
//         setTimeout(regainSpeed, 3000);
//     }  
// }

/**
 * Increase player speed after
 * collision with junk
 */
function junkHit() {
    // The speed that the player should be travelling at is stored, 
    // otherwise the function below will slow down rather than speed up.
    var originalSpeed = DD.player.speed;

    // Setting a slow speed straight away so it doesn't feel laggy
    DD.player.speed = originalSpeed * DD.objects.junks.slow;

    // setInterval means that I can perform this over some time 
    // and gradually without using Phasers stupid time function.
    // Time on the second argument is in milliseconds. 
    var speedUp = setInterval(function() {
        if (DD.objects.junks.slow <= 1) {
            console.log(DD.objects.junks.slow);
            
            // This is where originalSpeed is used to provide 
            // a gradual speed up that feels a little more natural.
            DD.player.speed = originalSpeed * DD.objects.junks.slow;
            
            // Every second the dolphin gets 10% closer to full speed.
            DD.objects.junks.slow += 0.1;
        } else { // Detecting when the maximum speed is reached, so the function can end.
            // End the interval that is causing the change in dolphin speed.
            clearInterval(speedUp);
        }
    }, 1000);

    // Resetting the slowing effect after the normal speed is reached again.
    DD.objects.junks.slow = 0.4;

    /*
     * DD.player.speed = DD.player.speed / DD.objects.junks.slow;
     * DD.objects.junks.active = false;
     */
}

/**
 * Handle player collision with starfish
 * @param  {Game.sprite} player
 * @param  {Game.sprite} starfish
 */
function collectStarfish(player, starfish) {
    starfish.body = null;
    starfish.sprite.kill();

    if (DD.objects.starfish.collectedIds.indexOf(starfish.data.id) === -1) {
        DD.game.score.starfish.lastRun += 1;
        DD.objects.starfish.collectedIds.push(starfish.data.id);
    }

    // Additionally have to add code which will remove the object from the game
}

function hitWaves() {
    console.log('Wave hit');

    DD.player.element.body.gravity.y = 1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

function stopAcceleration() {
    DD.player.element.body.gravity.y = 0;
    console.log('Stop Acceleration');
    DD.player.accelerationActive = false;
}

function hitSand() {
    console.log('Sand has been hit');
    DD.player.element.body.gravity.y = -1000;
    setTimeout(stopAcceleration, 1000);
    DD.player.accelerationActive = true;
}

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gUmVnaXN0ZXIgQXJyYXkuZ2V0VW5pcXVlKClcclxuQXJyYXkucHJvdG90eXBlLnVuaXF1ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG8gPSB7fTtcclxuICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICB2YXIgbCA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIHIgPSBbXTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSArPSAxKSB7XHJcbiAgICAgICAgb1t0aGlzW2ldXSA9IHRoaXNbaV07XHJcbiAgICB9IFxyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcbiAgICAgICAgci5wdXNoKG9baV0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgc3RhdGUgaW5kZXBlbmRlbnQgb2YgUGhhc2VyXHJcbiAqL1xyXG52YXIgREQgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxyXG5cclxuICAgIG9iamVjdHM6IHtcclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBzcGVlZDogMjUwLFxyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgZ3JhZGllbnQ6IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogKE1hdGgucmFuZG9tKCkgKiA1MCkgKyA1MCxcclxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsZWN0ZWRJZHM6IFtdLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGp1bmtzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMTAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXRzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogMjAwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW11cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgd2F2ZXM6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNhbmQ6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBhY2NlbGVyYXRpb25BY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiAzMDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjBcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGdhbWVPdmVyQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXM6IFtdXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiAwLFxyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDFcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IDFcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhdWRpbzoge1xyXG4gICAgICAgICAgICBqdW5rQ29sbGlkZTogbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIEp1c3QgYSBmcmllbmRseSByZW1pbmRlclxyXG5jb25zb2xlLmluZm8oJ0RvbHBoaW4gRGl2ZSB2JyArIERELnZlcnNpb24pO1xyXG5cclxuLy8gR2xvYmFsIGdhbWUgb2JqZWN0XHJcbnZhciBnYW1lO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHJlZmVyZW5jZXMgdG8gYWxsIG9uLXNjcmVlbiBlbGVtZW50c1xyXG4gKiAoZXh0ZXJhbCB0byBQaGFzZXIpXHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIERpc3BsYXlEYXRhID0ge1xyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lJylcclxuICAgIH0sXHJcblxyXG4gICAgaHVkOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2h1ZCcpLFxyXG4gICAgICAgIHNjb3JlOiAkKCcjaHVkLXNjb3JlJyksXHJcbiAgICAgICAgc3RhcmZpc2g6ICQoJyNodWQtc3RhcmZpc2gnKSxcclxuICAgICAgICBwYXVzZUJ0bjogJCgnI2h1ZC1wYXVzZUJ0bicpLFxyXG4gICAgICAgIHByb2dyZXNzQmFyOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNodWQtcHJvZ3Jlc3NiYXInKSxcclxuICAgICAgICAgICAgc3BpbGw6ICQoJyNodWQtcHJvZ3Jlc3NiYXItb2lsc3BpbGwnKSxcclxuICAgICAgICAgICAgZG9scGhpbjogJCgnI2h1ZC1wcm9ncmVzc2Jhci1kb2xwaGluJylcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG1haW5NZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI21haW5NZW51JyksXHJcbiAgICAgICAgbmV3R2FtZUJ0bjogJCgnI21haW5NZW51LW5ld0dhbWUnKSxcclxuICAgICAgICBoaWdoU2NvcmVzQnRuOiAkKCcjbWFpbk1lbnUtaGlnaFNjb3JlcycpLFxyXG4gICAgICAgIGhvd1RvUGxheUJ0bjogJCgnI21haW5NZW51LWhvd1RvUGxheScpLFxyXG4gICAgICAgIGFib3V0QnRuOiAkKCcjbWFpbk1lbnUtYWJvdXQnKVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdoU2NvcmVzTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNoaWdoU2NvcmVzTWVudScpLFxyXG4gICAgICAgIGxpc3Q6ICQoJyNoaWdoU2NvcmVzTWVudS1saXN0JyksXHJcbiAgICAgICAgbGlzdFBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdC1wYWdlMicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1uZXh0LXBhZ2UyQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UxQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtcHJldi1wYWdlMUJ0bicpLFxyXG5cclxuICAgICAgICBwYWdlMTogJCgnI2hpZ2hTY29yZXNNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMicpXHJcbiAgICB9LFxyXG5cclxuICAgIGhvd1RvUGxheU1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaG93VG9QbGF5TWVudScpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjaG93VG9QbGF5TWVudS1tYWluTWVudScpLFxyXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtcHJldi1wYWdlMUJ0bicpLFxyXG4gICAgICAgIG5leHRQYWdlM0J0bjogJCgnI2hvd1RvUGxheU1lbnUtbmV4dC1wYWdlM0J0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtcHJldi1wYWdlMkJ0bicpLFxyXG5cclxuICAgICAgICBwYWdlMTogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTEnKSxcclxuICAgICAgICBwYWdlMjogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTInKSxcclxuICAgICAgICBwYWdlMzogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTMnKVxyXG4gICAgfSxcclxuXHJcbiAgICBhYm91dE1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjYWJvdXRNZW51JyksXHJcbiAgICAgICAgdmVyc2lvbjogJCgnI2Fib3V0TWVudS12ZXJzaW9uJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNhYm91dE1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBwYXVzZU1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjcGF1c2VNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI3BhdXNlTWVudSAub3ZlcmxheScpLFxyXG4gICAgICAgIHJlc3VtZUJ0bjogJCgnI3BhdXNlTWVudS1yZXN1bWUnKSxcclxuICAgICAgICByZXN0YXJ0QnRuOiAkKCcjcGF1c2VNZW51LXJlc3RhcnQnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI3BhdXNlTWVudS1tYWluTWVudScpXHJcbiAgICB9LFxyXG5cclxuICAgIGdhbWVPdmVyTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUnKSxcclxuICAgICAgICBvdmVybGF5OiAkKCcjZ2FtZU92ZXJNZW51IC5vdmVybGF5JyksXHJcblxyXG4gICAgICAgIGhpZ2hTY29yZToge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZScpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1zY29yZScpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LXN0YXJmaXNoJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1zdGFyZmlzaCAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHBsYXlBZ2FpbkJ0bjogJCgnI2dhbWVPdmVyTWVudS1wbGF5QWdhaW4nKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2dhbWVPdmVyTWVudS1tYWluTWVudScpXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGlzcGxheSBhbmQgbWVudXMgbWFuaXB1bGF0aW9uXHJcbiAqIG9iamVjdFxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGdpdmVuIGVsZW1lbnQgb24gc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBzaG93RWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgZ2l2ZW4gZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBoaWRlRWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBtZW51IGJ5IGZpcnN0IGhpZGluZyBhbGwgb3RoZXIgbWVudXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7RE9NRWxlbWVudH0gbWVudVxyXG4gICAgICovXHJcbiAgICBzaG93TWVudTogZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW21lbnVdKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBtZW51cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgaGlkZUFsbE1lbnVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWVudXMgPSBbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmVsZW1lbnRcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBtZW51cy5mb3JFYWNoKGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnRdKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgc2NvcmVzIGluIEFib3V0IG1lbnVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlSGlnaFNjb3JlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gR2V0IHVuaXF1ZSBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU29ydCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhIDwgYjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgSFRNTCBmb3Igc2NvcmVzXHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8ZGl2PicgKyBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAxKVxyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdCkuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG4gICAgICAgIGZvciAodmFyIGogPSA1OyBqIDwgMTA7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMilcclxuICAgICAgICBpZiAoaGlnaFNjb3Jlc0h0bWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdFBhZ2UyKS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDb250cm9scyB0aGUgcGxheWJhY2sgb2YgYW5pbWF0aW9uc1xyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBQbGF5QW5pbWF0aW9ucyA9IHtcclxuICAgIC8vIE1haW4gTWVudSBhbmltYXRpb25zXHJcbiAgICBtYWluTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI21haW5NZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC42LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjbWFpbk1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51IGFuaW1hdGlvbnNcclxuICAgIGhpZ2hTY29yZXNNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHNjb3Jlc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCBkaXYnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSGlnaCBzY29yZXMgbWVudSBwYWdlIDJcclxuICAgIGhpZ2hTY29yZXNNZW51MjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBzY29yZXNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTIgZGl2JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1wYWdlMiBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhvd1RvUGxheU1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgdGV4dFxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNob3dUb1BsYXlNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjYWJvdXRNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUGF1c2UgTWVudSBhbmltYXRpb25zXHJcbiAgICBwYXVzZU1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjcGF1c2VNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDc1LFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNnYW1lT3Zlck1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNnYW1lT3Zlck1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLy8gR2FtZSBhY3Rpb25zIGFuZCBhY3Rpb24tcmVsYXRlZFxyXG4vLyBmdW5jdGlvbnNcclxuREQuZ2FtZS5hY3Rpb25zID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBnYW1lXHJcbiAgICAgKiBcclxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBnYW1lIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxMjgwLCA3MjAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgICAgICAgICAgcHJlbG9hZDogREQuZ2FtZS5wcmVsb2FkLFxyXG4gICAgICAgICAgICBjcmVhdGU6IERELmdhbWUuY3JlYXRlLFxyXG4gICAgICAgICAgICB1cGRhdGU6IERELmdhbWUudXBkYXRlLFxyXG4gICAgICAgICAgICByZW5kZXI6IERELmdhbWUucmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIEp1bmsgZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcblx0ICpcclxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQganVuayBvYmplY3RzIGFuZCBzdG9yZXNcclxuXHQgKiB0aGVtIGluIERELm9iamVjdHMuanVua3MuZWxlbWVudHNbXVxyXG5cdCAqL1xyXG4gICAgY3JlYXRlSnVua3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqdW5rO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5qdW5rcy5hbW91bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSxcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSxcclxuICAgICAgICAgICAgICAgICdiYWcnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoanVuayk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNSwgMC41KTtcclxuXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5hbmd1bGFyVmVsb2NpdHkgPSBNYXRoLnJhbmRvbSgpICogMjtcclxuICAgICAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnkgPSBNYXRoLnJhbmRvbSgpICogODA7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBqdW5rIHRvIHVzZSB0aGUgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8ganVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuXHQgKiBTdGFyZmlzaCBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuXHQgKlxyXG5cdCAqIENyZWF0ZXMgYSB0aG91c2FuZCBzdGFyZmlzaCBvYmplY3RzIGFuZCBzdG9yZXNcclxuXHQgKiB0aGVtIGluIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHNbXVxyXG5cdCAqL1xyXG4gICAgY3JlYXRlU3RhcmZpc2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFyZmlzaDtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGhvdXNhbmQganVuayBvYmplY3RzXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAgc3RhcmZpc2ggPSBnYW1lLmFkZC5zcHJpdGUoXHJcbiAgICAgICAgICAgICAgICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSwgXHJcbiAgICAgICAgICAgICAgICAnc3RhcmZpc2gnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBzdGFyZmlzaC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gc3RhcmZpc2gucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShzdGFyZmlzaCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAgc3RhcmZpc2guYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjUsIDAuNSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBzdGFyZmlzaCB0byB1c2UgdGhlIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFyZmlzaGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSZXN0b3JlIHNhdmVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgIHJlc3RvcmVTYXZlZFZhbHVlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXM7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoO1xyXG5cclxuICAgICAgICBpZiAoIXNpbXBsZVN0b3JhZ2UuY2FuVXNlKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTG9jYWwgc3RvcmFnZSBub3QgYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc3RvcmUgaGlnaCBzY29yZXNcclxuICAgICAgICBoaWdoU2NvcmVzID0gc2ltcGxlU3RvcmFnZS5nZXQoJ2hpZ2hTY29yZXMnKTtcclxuICAgICAgICBpZiAoaGlnaFNjb3Jlcykge1xyXG4gICAgICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBzdGFyZmlzaCBjb3VudFxyXG4gICAgICAgIHN0YXJmaXNoID0gc2ltcGxlU3RvcmFnZS5nZXQoJ3N0YXJmaXNoJyk7XHJcbiAgICAgICAgaWYgKHN0YXJmaXNoKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUhpZ2hTY29yZXM6IGZ1bmN0aW9uKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoID0gc2NvcmUuc3RhcmZpc2ggKyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdzdGFyZmlzaCcsIHN0YXJmaXNoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY3JlYXRlTmV0czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ldDtcclxuICAgICAgICB2YXIgdW5kZXJOZXQ7XHJcbiAgICAgICAgdmFyIGs7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHR3byBodW5kcmVkIG5ldCBvYmplY3RzXHJcbiAgICAgICAgZm9yIChrID0gMDsgayA8IERELm9iamVjdHMubmV0cy5hbW91bnQ7IGsrKykge1xyXG4gICAgICAgICAgICAvLyBGb3Igd2hlcmUgaXQgc2F5cyAnc3RhcicsIGkgd2FudCB0byBhZGQgYSBsaXN0IHdoaWNoIGl0IHdpbGwgdGFrZSBmcm9tIHJhbmRvbWx5LlxyXG4gICAgICAgICAgICBuZXQgPSBnYW1lLmFkZC5zcHJpdGUoICggKGsgKyA4KSAqIDQwMCksIDAsICdvdmVybmV0JyApO1xyXG5cclxuICAgICAgICAgICAgLy8gbmV0LmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBuZXQucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShuZXQpO1xyXG5cclxuICAgICAgICAgICAgdW5kZXJOZXQgPSBnYW1lLmFkZC5zcHJpdGUobmV0LmJvZHkueCwgbmV0LmJvZHkueSwgJ3VuZGVybmV0Jyk7IFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgbmV0IHRvIHVzZSB0aGUgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBuZXQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gbmV0cyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgbmV0LmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgcmVzdGFydFxyXG4gICAgICogXHJcbiAgICAgKiBSZXNldCBydW5uaW5nIHZhcmlhYmxlcyBhbmQgcmVzdGFydCBnYW1lIGJ5XHJcbiAgICAgKiBkZXN0cm95aW5nIGN1cnJlbnQgZ2FtZSBjYWNoZSBhbmQgXHJcbiAgICAgKiByZS1pbml0aWFsaXppbmcgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgcmVzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gS2lsbCBvZmYganVua3NcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oanVuaywgaW5kZXgpIHtcclxuICAgICAgICAgICAganVuay5ib2R5ID0gbnVsbDtcclxuICAgICAgICAgICAganVuay5raWxsKCk7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3NbaW5kZXhdID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gS2lsbCBvZmYgc3RhcmZpc2hlc1xyXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdGFyZmlzaCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgc3RhcmZpc2guYm9keSA9IG51bGw7XHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaFtpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBqdW5rcyBhbmQgc3RhcmZpc2ggYXJyYXlzXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgZ2FtZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgPSAxO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSAwO1xyXG5cclxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgb3ZlclxyXG4gICAgICogXHJcbiAgICAgKiBFbmRzIGN1cnJlbnQgZ2FtZSBhbmQgZGlzcGxheXNcclxuICAgICAqIGdhbWUgb3ZlciBtZW51XHJcbiAgICAgKi9cclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV3SGlnaGVzdFNjb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zdGFyZmlzaC5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pOyBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGdhbWVPdmVyKCkgZnJvbSBiZWluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcclxuICAgICAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkb2xwaGluSXNDb3ZlcmVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIChERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQueCAtIERELnBsYXllci5lbGVtZW50LngpID4gLTc1MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIENoZWNrIGZvciB0b3VjaCBldmVudHNcclxuREQuZ2FtZS50b3VjaCA9IHtcclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1RvdWNoaW5nVXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPCAzNjApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55IDwgMzYwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gbG93ZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdEb3duOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55ID4gMzYwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA+IDM2MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhpZ2ggU2NvcmVzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5oaWdoU2NvcmVzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhvdyB0byBQbGF5IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5ob3dUb1BsYXlCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEFib3V0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5hYm91dEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuYWJvdXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogbmV4dCBQYWdlIDIgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm5leHRQYWdlMkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudTIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTFcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UxQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBuZXh0IGFuZCBwcmV2IFBhZ2UgMiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTJCdG4pLmFkZChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnByZXZQYWdlMkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBQYWdlIDMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubmV4dFBhZ2UzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFib3V0IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmFib3V0TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogYmFja2dyb3VuZCBvdmVybGF5XHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5vdmVybGF5KS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3VtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3VtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN0YXJ0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdGFydEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICBcclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoMCk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgb3ZlciBtZW51OiBQbGF5IGFnYWluIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUucGxheUFnYWluQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoMCk7XHJcblxyXG4gICAgICAgIC8vIFNob3cgSFVEIGFuZCBwYXVzZSBidXR0b25cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIE92ZXIgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcblxyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFVEOiBQYXVzZSBidXR0b246IGhhbmRsZXMgcGF1c2UgYWN0aXZhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAgICAgKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWRcclxuICAgICAqL1xyXG4gICAgJChEaXNwbGF5RGF0YS5odWQucGF1c2VCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50XSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIFJlc3RvcmUgcGVyc2lzdGVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuREQuZ2FtZS5hY3Rpb25zLnJlc3RvcmVTYXZlZFZhbHVlcygpO1xyXG5cclxuLyoqXHJcbiAqIFByZWxvYWQgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAqIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gKi9cclxuREQuZ2FtZS5wcmVsb2FkID0gZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9TdGF0aWNCYWNrZ3JvdW5kLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDEnLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIxLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDInLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWcnLCAnL2Fzc2V0cy9pbWFnZXMvYmFnLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyZmlzaCcsICcvYXNzZXRzL2ltYWdlcy9zdGFyZmlzaC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL29pbGJhY2sucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2RvbHBoaW4nLCAnL2Fzc2V0cy9pbWFnZXMvbmV3LWRvbHBoaW4ucG5nJywgMjQ1LCAxMDMpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdqdW5rJywgJy9hc3NldHMvaW1hZ2VzL3BsYXN0aWNCYWcucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2hlYWx0aHBhY2snLCAnL2Fzc2V0cy9pbWFnZXMvZmlyc3RhaWQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ292ZXJuZXQnLCAnL2Fzc2V0cy9pbWFnZXMvb3Zlcm5ldC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgndW5kZXJuZXQnLCAnL2Fzc2V0cy9pbWFnZXMvdW5kZXJuZXQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3dhdmVzJywgJy9hc3NldHMvaW1hZ2VzL3dhdmVzLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmF1ZGlvKCdqdW5rSW1wYWN0JywgJy9hc3NldHMvYXVkaW8veWV5LndhdicpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5ERC5nYW1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgIC8vIEFkZCBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICAvLyBTZXQgdHJhbnNwYXJlbmN5IG9mIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMC42O1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmFscGhhID0gMTtcclxuXHJcbiAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQiwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIFNldHVwIFBhcmFsbGF4IHNjcm9sbGluZyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgzICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgxICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG5cclxuICAgIC8vIE1ha2UgYmFja2dyb3VuZCBsYXllcnMgaW1tdW5lIHRvIGNvbGxpc2lvbnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgcGxheWVyXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkb2xwaGluJyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5zY2FsZS5zZXRUbygwLjQsIDAuNCk7XHJcblxyXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5wbGF5ZXIuZWxlbWVudCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnQgYW5kIGVuYWJsZSBQaHlzaWNzXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMTYwMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gV2F2ZXNcclxuICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3dhdmVzJyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIFNhbmRcclxuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAxMDgwLCAnd2F2ZXMnKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQudGV4dHVyZXMuc2FuZC5lbGVtZW50KTtcclxuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5hbHBoYSA9IDA7XHJcblxyXG4gICAgLy8gU291bmQgc3R1ZmZcclxuICAgIERELmdhbWUuYXVkaW8uanVua0NvbGxpZGUgPSBnYW1lLmFkZC5hdWRpbygnanVua0ltcGFjdCcpO1xyXG4gICAgREQuZ2FtZS5hdWRpby5qdW5rQ29sbGlkZS5hbGxvd011bHRpcGxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgYW5pbWF0aW9uc1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzAsIDEsIDIsIDMsIDRdLCAxMCwgdHJ1ZSk7XHJcbiAgICAvLyBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgnY29sbGlkZScsIFs5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxLCAwXSwgMTAwLCB0cnVlKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgY29sbGlzaW9uIGdyb3Vwc1xyXG4gICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUganVua3MgYW5kIHN0YXJmaXNoZXNcclxuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZVN0YXJmaXNoKCk7XHJcblxyXG4gICAgLy8gU2V0dXAgY29sbGlzaW9uc1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQuZ2FtZS5hY3Rpb25zLmdhbWVPdmVyLCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCwgY29sbGVjdFN0YXJmaXNoLCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAsIGhpdFdhdmVzLCB0aGlzKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCwgaGl0U2FuZCwgdGhpcyk7XHJcblxyXG4gICAgLy8gU2V0dXAga2V5Ym9hcmQgY29udHJvbHNcclxuICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFRoZSBnYW1lIGxvb3AgLSBydW4gb25jZSBwZXIgZnJhbWVcclxuICovXHJcbkRELmdhbWUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgaWYgKCBERC5nYW1lLmFjdGlvbnMuZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5nYW1lT3ZlcigpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcblxyXG4gICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgaWYgKChERC5wbGF5ZXIuZWxlbWVudC54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0xICogREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueSA9IDI1O1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS55ID0gMTA4MDtcclxuXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuIGFuZ2xlID0gMDtcclxuXHJcblxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuXHJcbiAgICAgICAgLy8gU2V0cyBERC5nYW1lLnNjb3JlLmxhc3RSdW4gYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIuIHRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNDAwKSAtIDgpICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSBwYXJzZUludChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDEwKTtcclxuXHJcbiAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIHByb2dyZXNzIGJhclxyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ICogNTAwICkgLyAxOTIwMDAgKTtcclxuXHJcbiAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIGRvbHBoaW4geFxyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcclxuICAgICAgICAgICAgJ2xlZnQnLCAoIChERC5wbGF5ZXIuZWxlbWVudC54ICogNDkyICkgLyAxOTIwMDAgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIE1pbmltYXA6IFVwZGF0ZSBkb2xwaGluIHlcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXHJcbiAgICAgICAgICAgICd0b3AnLCAoIChERC5wbGF5ZXIuZWxlbWVudC55ICogMjApIC8gMTA4MCApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKyBERC5nYW1lLm1vZGlmaWVycy50b3RhbDtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5vYmplY3RzLnNwaWxsLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHBsYXllcidzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKERELnBsYXllci5lbGVtZW50LmJvZHkueCA+PSAoREQuZ2FtZS53b3JsZC5pbnRlcnZhbCAqIERELmdhbWUud29ybGQubGV2ZWwpICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdMZXZlbCAoc3BlZWQpIHVwIScpO1xyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBERC5nYW1lLnRvdWNoLmlzVG91Y2hpbmdVcCgpKSB7XHJcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IC0xICogREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAqL1xyXG5ERC5nYW1lLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIGdhbWUuZGVidWcuYm9keShERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50KTtcclxuICAgIGdhbWUuZGVidWcuYm9keShERC5wbGF5ZXIuZWxlbWVudCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHNjb3JlXHJcbiAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gREQuZ2FtZS5zY29yZS5sYXN0UnVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBzdGFyZmlzaFxyXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggIT09IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bikge1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBwbGF5ZXIgY29sbGlzaW9uIHdpdGgganVua1xyXG4gKi9cclxuLy8gZnVuY3Rpb24ganVua0hpdCgpIHtcclxuLy8gICAgIGNvbnNvbGUubG9nKCdKdW5rIGhpdCEnKTtcclxuXHJcbi8vICAgICAvLyBTb3VuZCBzdHVmZlxyXG4vLyAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdjb2xsaWRlJyk7XHJcbi8vICAgICBERC5nYW1lLmF1ZGlvLmp1bmtDb2xsaWRlLnBsYXkoKTtcclxuXHJcbi8vICAgICBpZiAoIURELm9iamVjdHMuanVua3MuYWN0aXZlKSB7XHJcbi8vICAgICAgICAgREQucGxheWVyLnNwZWVkID0gREQucGxheWVyLnNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4vLyAgICAgICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gdHJ1ZTtcclxuLy8gICAgICAgICBzZXRUaW1lb3V0KHJlZ2FpblNwZWVkLCAzMDAwKTtcclxuLy8gICAgIH0gIFxyXG4vLyB9XHJcblxyXG4vKipcclxuICogSW5jcmVhc2UgcGxheWVyIHNwZWVkIGFmdGVyXHJcbiAqIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICovXHJcbmZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbiAgICAvLyBUaGUgc3BlZWQgdGhhdCB0aGUgcGxheWVyIHNob3VsZCBiZSB0cmF2ZWxsaW5nIGF0IGlzIHN0b3JlZCwgXHJcbiAgICAvLyBvdGhlcndpc2UgdGhlIGZ1bmN0aW9uIGJlbG93IHdpbGwgc2xvdyBkb3duIHJhdGhlciB0aGFuIHNwZWVkIHVwLlxyXG4gICAgdmFyIG9yaWdpbmFsU3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQ7XHJcblxyXG4gICAgLy8gU2V0dGluZyBhIHNsb3cgc3BlZWQgc3RyYWlnaHQgYXdheSBzbyBpdCBkb2Vzbid0IGZlZWwgbGFnZ3lcclxuICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcblxyXG4gICAgLy8gc2V0SW50ZXJ2YWwgbWVhbnMgdGhhdCBJIGNhbiBwZXJmb3JtIHRoaXMgb3ZlciBzb21lIHRpbWUgXHJcbiAgICAvLyBhbmQgZ3JhZHVhbGx5IHdpdGhvdXQgdXNpbmcgUGhhc2VycyBzdHVwaWQgdGltZSBmdW5jdGlvbi5cclxuICAgIC8vIFRpbWUgb24gdGhlIHNlY29uZCBhcmd1bWVudCBpcyBpbiBtaWxsaXNlY29uZHMuIFxyXG4gICAgdmFyIHNwZWVkVXAgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5zbG93IDw9IDEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coREQub2JqZWN0cy5qdW5rcy5zbG93KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgb3JpZ2luYWxTcGVlZCBpcyB1c2VkIHRvIHByb3ZpZGUgXHJcbiAgICAgICAgICAgIC8vIGEgZ3JhZHVhbCBzcGVlZCB1cCB0aGF0IGZlZWxzIGEgbGl0dGxlIG1vcmUgbmF0dXJhbC5cclxuICAgICAgICAgICAgREQucGxheWVyLnNwZWVkID0gb3JpZ2luYWxTcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEV2ZXJ5IHNlY29uZCB0aGUgZG9scGhpbiBnZXRzIDEwJSBjbG9zZXIgdG8gZnVsbCBzcGVlZC5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rcy5zbG93ICs9IDAuMTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBEZXRlY3Rpbmcgd2hlbiB0aGUgbWF4aW11bSBzcGVlZCBpcyByZWFjaGVkLCBzbyB0aGUgZnVuY3Rpb24gY2FuIGVuZC5cclxuICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcnZhbCB0aGF0IGlzIGNhdXNpbmcgdGhlIGNoYW5nZSBpbiBkb2xwaGluIHNwZWVkLlxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHNwZWVkVXApO1xyXG4gICAgICAgIH1cclxuICAgIH0sIDEwMDApO1xyXG5cclxuICAgIC8vIFJlc2V0dGluZyB0aGUgc2xvd2luZyBlZmZlY3QgYWZ0ZXIgdGhlIG5vcm1hbCBzcGVlZCBpcyByZWFjaGVkIGFnYWluLlxyXG4gICAgREQub2JqZWN0cy5qdW5rcy5zbG93ID0gMC40O1xyXG5cclxuICAgIC8qXHJcbiAgICAgKiBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgLyBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgKiBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICovXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHN0YXJmaXNoXHJcbiAqIEBwYXJhbSAge0dhbWUuc3ByaXRlfSBwbGF5ZXJcclxuICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHN0YXJmaXNoXHJcbiAqL1xyXG5mdW5jdGlvbiBjb2xsZWN0U3RhcmZpc2gocGxheWVyLCBzdGFyZmlzaCkge1xyXG4gICAgc3RhcmZpc2guYm9keSA9IG51bGw7XHJcbiAgICBzdGFyZmlzaC5zcHJpdGUua2lsbCgpO1xyXG5cclxuICAgIGlmIChERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5pbmRleE9mKHN0YXJmaXNoLmRhdGEuaWQpID09PSAtMSkge1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1biArPSAxO1xyXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guY29sbGVjdGVkSWRzLnB1c2goc3RhcmZpc2guZGF0YS5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkaXRpb25hbGx5IGhhdmUgdG8gYWRkIGNvZGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBnYW1lXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpdFdhdmVzKCkge1xyXG4gICAgY29uc29sZS5sb2coJ1dhdmUgaGl0Jyk7XHJcblxyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAxMDAwO1xyXG4gICAgc2V0VGltZW91dChzdG9wQWNjZWxlcmF0aW9uLCAxMDAwKTtcclxuICAgIERELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wQWNjZWxlcmF0aW9uKCkge1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAwO1xyXG4gICAgY29uc29sZS5sb2coJ1N0b3AgQWNjZWxlcmF0aW9uJyk7XHJcbiAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpdFNhbmQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU2FuZCBoYXMgYmVlbiBoaXQnKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTEwMDA7XHJcbiAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMDApO1xyXG4gICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbn1cclxuXHJcbi8vIEV2ZXJ5dGhpbmcgaXMgZGVjbGFyZWQ6IGluaXRpYWxpemUgZ2FtZVxyXG5ERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9