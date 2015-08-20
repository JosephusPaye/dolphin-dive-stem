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
            starfish.scale.setTo(0.5, 0.5);

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
        DD.player.element.body.velocity.x = DD.player.speed + (30 * DD.game.world.level) + DD.game.modifiers.total;

        // Update the oilspill velocity
        DD.objects.spill.element.body.velocity.x = 350;

        if (DD.objects.junks.active !== true) {
            DD.player.element.animations.play('right');
        }

    }

    // Reset the player's velocity (movement)
    if (!DD.player.accelerationActive) {
        DD.player.element.body.velocity.y = 0;
    }

    if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level)) {
        if (DD.game.world.level < 19) {
            DD.game.world.level += 1;
            console.log('Level (speed) up!');
        }
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

/*
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

/*
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

/*
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gUmVnaXN0ZXIgQXJyYXkuZ2V0VW5pcXVlKClcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIGwgPSB0aGlzLmxlbmd0aDtcbiAgICB2YXIgciA9IFtdO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICBvW3RoaXNbaV1dID0gdGhpc1tpXTtcbiAgICB9IFxuXG4gICAgZm9yIChpIGluIG8pIHtcbiAgICAgICAgci5wdXNoKG9baV0pO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcjtcbn07XG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xuXG4vKipcbiAqIEdsb2JhbCBERCBvYmplY3RcbiAqIFxuICogQ29udGFpbnMgZ2FtZSBzdGF0ZSBpbmRlcGVuZGVudCBvZiBQaGFzZXJcbiAqL1xudmFyIEREID0ge1xuICAgIHZlcnNpb246ICcwLjEuMCcsXG5cbiAgICBvYmplY3RzOiB7XG4gICAgICAgIHNwaWxsOiB7XG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXG4gICAgICAgICAgICBncmFkaWVudDoge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdGFyZmlzaDoge1xuICAgICAgICAgICAgYW1vdW50OiAoTWF0aC5yYW5kb20oKSAqIDUwKSArIDUwLFxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxuICAgICAgICAgICAgY29sbGVjdGVkSWRzOiBbXSxcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAganVua3M6IHtcbiAgICAgICAgICAgIGFtb3VudDogMTAwLFxuICAgICAgICAgICAgZWxlbWVudHM6IFtdLFxuICAgICAgICAgICAgc2xvdzogMC40LFxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV0czoge1xuICAgICAgICAgICAgYW1vdW50OiAyMDAsXG4gICAgICAgICAgICBlbGVtZW50czogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB0ZXh0dXJlczoge1xuICAgICAgICBsYXllckE6IG51bGwsXG4gICAgICAgIGxheWVyQjogbnVsbCxcbiAgICAgICAgbGF5ZXJDOiBudWxsLFxuICAgICAgICB3YXZlczoge1xuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIHNhbmQ6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICBzcGVlZDogNTBcbiAgICB9LFxuXG4gICAgcGxheWVyOiB7XG4gICAgICAgIGFjY2VsZXJhdGlvbkFjdGl2ZTogZmFsc2UsXG4gICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgIHZlcnRTcGVlZDogMzAwLFxuICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcbiAgICAgICAgYW5nbGU6IDIwXG4gICAgfSxcblxuICAgIGdhbWU6IHtcbiAgICAgICAgZ2FtZU92ZXJDYWxsZWQ6IGZhbHNlLFxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcbiAgICAgICAgcnVuRW5kOiBmYWxzZSxcbiAgICAgICAgY3Vyc29yczogbnVsbCxcblxuICAgICAgICB3b3JsZDoge1xuICAgICAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxuICAgICAgICB9LFxuXG4gICAgICAgIHNjb3JlOiB7XG4gICAgICAgICAgICBzdGFyZmlzaDoge1xuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxhc3RSdW46IDAsXG4gICAgICAgICAgICBsYXN0RnJhbWVWYWx1ZToge1xuICAgICAgICAgICAgICAgIHN0YXJmaXNoOiAwLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cbiAgICAgICAgfSxcblxuICAgICAgICBtb2RpZmllcnM6IHtcbiAgICAgICAgICAgIHRvdGFsOiAwLFxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuXG4gICAgICAgICAgICBib29zdDoge1xuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG90YWw6IDIwMCxcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAxXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXG4gICAgICAgIH0sXG5cbiAgICAgICAgYXVkaW86IHtcbiAgICAgICAgICAgIGp1bmtDb2xsaWRlOiBudWxsXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgREQudmVyc2lvbik7XG5cbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxudmFyIGdhbWU7XG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxuXG4vKipcbiAqIEhvbGRzIHJlZmVyZW5jZXMgdG8gYWxsIG9uLXNjcmVlbiBlbGVtZW50c1xuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxuICogXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgRGlzcGxheURhdGEgPSB7XG4gICAgZ2FtZToge1xuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXG4gICAgfSxcblxuICAgIGh1ZDoge1xuICAgICAgICBlbGVtZW50OiAkKCcjaHVkJyksXG4gICAgICAgIHNjb3JlOiAkKCcjaHVkLXNjb3JlJyksXG4gICAgICAgIHN0YXJmaXNoOiAkKCcjaHVkLXN0YXJmaXNoJyksXG4gICAgICAgIHBhdXNlQnRuOiAkKCcjaHVkLXBhdXNlQnRuJyksXG4gICAgICAgIHByb2dyZXNzQmFyOiB7XG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjaHVkLXByb2dyZXNzYmFyJyksXG4gICAgICAgICAgICBzcGlsbDogJCgnI2h1ZC1wcm9ncmVzc2Jhci1vaWxzcGlsbCcpLFxuICAgICAgICAgICAgZG9scGhpbjogJCgnI2h1ZC1wcm9ncmVzc2Jhci1kb2xwaGluJylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBtYWluTWVudToge1xuICAgICAgICBlbGVtZW50OiAkKCcjbWFpbk1lbnUnKSxcbiAgICAgICAgbmV3R2FtZUJ0bjogJCgnI21haW5NZW51LW5ld0dhbWUnKSxcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcbiAgICAgICAgaG93VG9QbGF5QnRuOiAkKCcjbWFpbk1lbnUtaG93VG9QbGF5JyksXG4gICAgICAgIGFib3V0QnRuOiAkKCcjbWFpbk1lbnUtYWJvdXQnKVxuICAgIH0sXG5cbiAgICBoaWdoU2NvcmVzTWVudToge1xuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcbiAgICAgICAgbGlzdDogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QnKSxcbiAgICAgICAgbGlzdFBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdC1wYWdlMicpLFxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JyksXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW5leHQtcGFnZTJCdG4nKSxcbiAgICAgICAgcHJldlBhZ2UxQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtcHJldi1wYWdlMUJ0bicpLFxuXG4gICAgICAgIHBhZ2UxOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTEnKSxcbiAgICAgICAgcGFnZTI6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMicpXG4gICAgfSxcblxuICAgIGhvd1RvUGxheU1lbnU6IHtcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNob3dUb1BsYXlNZW51LW1haW5NZW51JyksXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbmV4dC1wYWdlMkJ0bicpLFxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTFCdG4nKSxcbiAgICAgICAgbmV4dFBhZ2UzQnRuOiAkKCcjaG93VG9QbGF5TWVudS1uZXh0LXBhZ2UzQnRuJyksXG4gICAgICAgIHByZXZQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtcHJldi1wYWdlMkJ0bicpLFxuXG4gICAgICAgIHBhZ2UxOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMScpLFxuICAgICAgICBwYWdlMjogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTInKSxcbiAgICAgICAgcGFnZTM6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UzJylcbiAgICB9LFxuXG4gICAgYWJvdXRNZW51OiB7XG4gICAgICAgIGVsZW1lbnQ6ICQoJyNhYm91dE1lbnUnKSxcbiAgICAgICAgdmVyc2lvbjogJCgnI2Fib3V0TWVudS12ZXJzaW9uJyksXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcbiAgICB9LFxuXG4gICAgcGF1c2VNZW51OiB7XG4gICAgICAgIGVsZW1lbnQ6ICQoJyNwYXVzZU1lbnUnKSxcbiAgICAgICAgb3ZlcmxheTogJCgnI3BhdXNlTWVudSAub3ZlcmxheScpLFxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXG4gICAgICAgIHJlc3RhcnRCdG46ICQoJyNwYXVzZU1lbnUtcmVzdGFydCcpLFxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI3BhdXNlTWVudS1tYWluTWVudScpXG4gICAgfSxcblxuICAgIGdhbWVPdmVyTWVudToge1xuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXG4gICAgICAgIG92ZXJsYXk6ICQoJyNnYW1lT3Zlck1lbnUgLm92ZXJsYXknKSxcblxuICAgICAgICBoaWdoU2NvcmU6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlJyksXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlIC5zY29yZScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2NvcmU6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1zY29yZSAuc2NvcmUnKVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0YXJmaXNoOiB7XG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LXN0YXJmaXNoJyksXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2ggLnNjb3JlJylcbiAgICAgICAgfSxcblxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjZ2FtZU92ZXJNZW51LW1haW5NZW51JylcbiAgICB9XG59O1xuXG4vKipcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxuICogb2JqZWN0XG4gKiBcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBEaXNwbGF5ID0ge1xuICAgIC8qKlxuICAgICAqIFNob3cgZ2l2ZW4gZWxlbWVudCBvbiBzY3JlZW5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcbiAgICAgKi9cbiAgICBzaG93RWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxuICAgICAqIFxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xuICAgICAqL1xuICAgIGhpZGVFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYSBtZW51IGJ5IGZpcnN0IGhpZGluZyBhbGwgb3RoZXIgbWVudXNcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gIHtET01FbGVtZW50fSBtZW51XG4gICAgICovXG4gICAgc2hvd01lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsRWxlbWVudHMoKTtcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW21lbnVdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXG4gICAgICovXG4gICAgaGlkZUFsbE1lbnVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1lbnVzID0gW1xuICAgICAgICAgICAgRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCwgXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50LFxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxuICAgICAgICAgICAgRGlzcGxheURhdGEuYWJvdXRNZW51LmVsZW1lbnQsXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudCxcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XG4gICAgICAgIF07XG5cbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XG4gICAgICAgICAgICBtZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxuICAgICAqL1xuICAgIGhpZGVBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudF0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2NvcmVzIGluIEFib3V0IG1lbnVcbiAgICAgKi9cbiAgICB1cGRhdGVIaWdoU2NvcmVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gR2V0IHVuaXF1ZSBzY29yZXNcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzID0gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnVuaXF1ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBzY29yZXNcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBIVE1MIGZvciBzY29yZXNcbiAgICAgICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0pIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDEpXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3QpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGlnaFNjb3Jlc0h0bWwgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaiA9IDU7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdKSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAyKVxuICAgICAgICBpZiAoaGlnaFNjb3Jlc0h0bWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3RQYWdlMikuaHRtbChoaWdoU2NvcmVzSHRtbCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyoqXG4gKiBDb250cm9scyB0aGUgcGxheWJhY2sgb2YgYW5pbWF0aW9uc1xuICogXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7XG4gICAgLy8gTWFpbiBNZW51IGFuaW1hdGlvbnNcbiAgICBtYWluTWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjbWFpbk1lbnUgaDEnLCAxLCB7XG4gICAgICAgICAgICBzY2FsZTogMC42LFxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcbiAgICAgICAgfSwgMC4xKTtcblxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNtYWluTWVudSBsaScsIDAuMywge1xuICAgICAgICAgICAgeTogMTAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuICAgICAgICB9LCAwLjEpO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51IGFuaW1hdGlvbnNcbiAgICBoaWdoU2NvcmVzTWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCBkaXYnLCAwLjMsIHtcbiAgICAgICAgICAgIHk6IDEwMCxcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgICAgfSwgMC4xKTtcblxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudSBsaScsIDAuMywge1xuICAgICAgICAgICAgeTogMTAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuICAgICAgICB9LCAwLjEpO1xuICAgIH0sXG5cbiAgICAvLyBIaWdoIHNjb3JlcyBtZW51IHBhZ2UgMlxuICAgIGhpZ2hTY29yZXNNZW51MjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdC1wYWdlMiBkaXYnLCAwLjMsIHtcbiAgICAgICAgICAgIHk6IDEwMCxcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcbiAgICAgICAgfSwgMC4xKTtcblxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1wYWdlMiBsaScsIDAuMywge1xuICAgICAgICAgICAgeTogMTAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxuICAgICAgICB9LCAwLjEpO1xuICAgIH0sXG5cbiAgICBob3dUb1BsYXlNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNob3dUb1BsYXlNZW51IC50ZXh0JywgMC4zLCB7XG4gICAgICAgICAgICB5OiAxMDAsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgIH0sIDAuMSk7XG4gICAgfSxcblxuICAgIGFib3V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgdGV4dFxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjYWJvdXRNZW51IC50ZXh0JywgMC4zLCB7XG4gICAgICAgICAgICB5OiAxMDAsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgIH0sIDAuMSk7XG4gICAgfSxcblxuICAgIC8vIFBhdXNlIE1lbnUgYW5pbWF0aW9uc1xuICAgIHBhdXNlTWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xuICAgICAgICAgICAgeTogNzUsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgIH0sIDAuMSk7XG4gICAgfSxcblxuICAgIGdhbWVPdmVyTWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjZ2FtZU92ZXJNZW51IGgxJywgMSwge1xuICAgICAgICAgICAgc2NhbGU6IDAuNCxcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XG4gICAgICAgIH0sIDAuMSk7XG5cbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjZ2FtZU92ZXJNZW51IGxpJywgMC4zLCB7XG4gICAgICAgICAgICB5OiAxMDAsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XG4gICAgICAgIH0sIDAuMSk7XG4gICAgfVxufTtcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XG5cbi8vIEdhbWUgYWN0aW9ucyBhbmQgYWN0aW9uLXJlbGF0ZWRcbi8vIGZ1bmN0aW9uc1xuREQuZ2FtZS5hY3Rpb25zID0ge1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IGdhbWVcbiAgICAgKiBcbiAgICAgKiBJbml0aWFsaXplIHRoZSBnbG9iYWwgZ2FtZSBvYmplY3RcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTI4MCwgNzIwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XG4gICAgICAgICAgICBwcmVsb2FkOiBERC5nYW1lLnByZWxvYWQsXG4gICAgICAgICAgICBjcmVhdGU6IERELmdhbWUuY3JlYXRlLFxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcbiAgICAgICAgICAgIHJlbmRlcjogREQuZ2FtZS5yZW5kZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgIH0sXG5cblx0LyoqXG5cdCAqIEp1bmsgZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXG5cdCAqXG5cdCAqIENyZWF0ZXMgYSB0aG91c2FuZCBqdW5rIG9iamVjdHMgYW5kIHN0b3Jlc1xuXHQgKiB0aGVtIGluIERELm9iamVjdHMuanVua3MuZWxlbWVudHNbXVxuXHQgKi9cbiAgICBjcmVhdGVKdW5rczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBqdW5rO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgREQub2JqZWN0cy5qdW5rcy5hbW91bnQ7IGkrKykge1xuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cbiAgICAgICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSxcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXG4gICAgICAgICAgICAgICAgJ2JhZydcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIGp1bmsucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcbiAgICAgICAgICAgIC8vIGp1bmsuZW5hYmxlQm9keSA9IHRydWU7XG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGp1bmspO1xuXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcbiAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcbiAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC41LCAwLjUpO1xuXG4gICAgICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSAqIDI7XG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcblxuICAgICAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAgXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XG5cbiAgICAgICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXG4gICAgICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xuXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVuayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG5cdCAqIFN0YXJmaXNoIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxuXHQgKlxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQgc3RhcmZpc2ggb2JqZWN0cyBhbmQgc3RvcmVzXG5cdCAqIHRoZW0gaW4gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50c1tdXG5cdCAqL1xuICAgIGNyZWF0ZVN0YXJmaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0YXJmaXNoO1xuICAgICAgICB2YXIgajtcblxuICAgICAgICAvLyBDcmVhdGUgYSB0aG91c2FuZCBqdW5rIG9iamVjdHNcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXG4gICAgICAgICAgICBzdGFyZmlzaCA9IGdhbWUuYWRkLnNwcml0ZShcbiAgICAgICAgICAgICAgICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTg3MDAwKSArIDUwMDApLCBcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksIFxuICAgICAgICAgICAgICAgICdzdGFyZmlzaCdcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIHN0YXJmaXNoLmVuYWJsZUJvZHkgPSB0cnVlO1xuICAgICAgICAgICAgLy8gc3RhcmZpc2gucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoc3RhcmZpc2gpO1xuXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XG4gICAgICAgICAgICBzdGFyZmlzaC5zY2FsZS5zZXRUbygwLjUsIDAuNSk7XG5cbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIHN0YXJmaXNoIHRvIHVzZSB0aGUgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCBcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XG5cbiAgICAgICAgICAgIC8vIFN0YXJmaXNoZXMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xuXG4gICAgICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLnB1c2goc3RhcmZpc2gpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc3RvcmUgc2F2ZWQgdmFsdWVzIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgIHJlc3RvcmVTYXZlZFZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoaWdoU2NvcmVzO1xuICAgICAgICB2YXIgc3RhcmZpc2g7XG5cbiAgICAgICAgaWYgKCFzaW1wbGVTdG9yYWdlLmNhblVzZSgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3RvcmUgaGlnaCBzY29yZXNcbiAgICAgICAgaGlnaFNjb3JlcyA9IHNpbXBsZVN0b3JhZ2UuZ2V0KCdoaWdoU2NvcmVzJyk7XG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzdG9yZSBzdGFyZmlzaCBjb3VudFxuICAgICAgICBzdGFyZmlzaCA9IHNpbXBsZVN0b3JhZ2UuZ2V0KCdzdGFyZmlzaCcpO1xuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVIaWdoU2NvcmVzOiBmdW5jdGlvbihzY29yZSkge1xuICAgICAgICBpZiAoc2NvcmUuc2NvcmUgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcbiAgICAgICAgdmFyIGhpZ2hTY29yZXMgPSBbc2NvcmUuc2NvcmVdLmNvbmNhdChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMpO1xuICAgICAgICB2YXIgc3RhcmZpc2ggPSBzY29yZS5zdGFyZmlzaCArIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWw7XG5cbiAgICAgICAgLy8gR2V0IHVuaXF1ZSBzY29yZXMgYW5kIHNvcnQgaW4gREVTQ1xuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy51bmlxdWUoKTtcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IG9ubHkgdG9wIDEwIHNjb3Jlc1xuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy5zcGxpY2UoMCwgOSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGluLWdhbWUgdmFsdWVzXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcblxuICAgICAgICAvLyBVcGRhdGUgcGVyc2lzdGVkIHZhbHVlc1xuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnc3RhcmZpc2gnLCBzdGFyZmlzaCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZU5ldHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV0O1xuICAgICAgICB2YXIgdW5kZXJOZXQ7XG4gICAgICAgIHZhciBrO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHR3byBodW5kcmVkIG5ldCBvYmplY3RzXG4gICAgICAgIGZvciAoayA9IDA7IGsgPCBERC5vYmplY3RzLm5ldHMuYW1vdW50OyBrKyspIHtcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXG4gICAgICAgICAgICBuZXQgPSBnYW1lLmFkZC5zcHJpdGUoICggKGsgKyA4KSAqIDQwMCksIDAsICdvdmVybmV0JyApO1xuXG4gICAgICAgICAgICAvLyBuZXQuZW5hYmxlQm9keSA9IHRydWU7XG4gICAgICAgICAgICAvLyBuZXQucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuUDJKUztcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUobmV0KTtcblxuICAgICAgICAgICAgdW5kZXJOZXQgPSBnYW1lLmFkZC5zcHJpdGUobmV0LmJvZHkueCwgbmV0LmJvZHkueSwgJ3VuZGVybmV0Jyk7IFxuXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xuXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXAgXG4gICAgICAgICAgICBuZXQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xuXG4gICAgICAgICAgICAvLyBuZXRzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXG4gICAgICAgICAgICBuZXQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcblxuICAgICAgICAgICAgREQub2JqZWN0cy5uZXRzLmVsZW1lbnRzLnB1c2gobmV0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGdhbWUgcmVzdGFydFxuICAgICAqIFxuICAgICAqIFJlc2V0IHJ1bm5pbmcgdmFyaWFibGVzIGFuZCByZXN0YXJ0IGdhbWUgYnlcbiAgICAgKiBkZXN0cm95aW5nIGN1cnJlbnQgZ2FtZSBjYWNoZSBhbmQgXG4gICAgICogcmUtaW5pdGlhbGl6aW5nIHRoZSBnYW1lXG4gICAgICovXG4gICAgcmVzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEtpbGwgb2ZmIGp1bmtzXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xuICAgICAgICAgICAganVuay5ib2R5ID0gbnVsbDtcbiAgICAgICAgICAgIGp1bmsua2lsbCgpO1xuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBLaWxsIG9mZiBzdGFyZmlzaGVzXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdGFyZmlzaCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkgPSBudWxsO1xuICAgICAgICAgICAgc3RhcmZpc2gua2lsbCgpO1xuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaFtpbmRleF0gPSBudWxsO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXNldCBqdW5rcyBhbmQgc3RhcmZpc2ggYXJyYXlzXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMgPSBbXTtcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cyA9IFtdO1xuXG4gICAgICAgIC8vIFJlc2V0IGdhbWUgd29ybGRcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NvcmVzXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IDA7XG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSAwO1xuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gMDtcblxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcbiAgICAgICAgZ2FtZSA9IG51bGw7XG5cbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBnYW1lIG92ZXJcbiAgICAgKiBcbiAgICAgKiBFbmRzIGN1cnJlbnQgZ2FtZSBhbmQgZGlzcGxheXNcbiAgICAgKiBnYW1lIG92ZXIgbWVudVxuICAgICAqL1xuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5ld0hpZ2hlc3RTY29yZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xuICAgICAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XG4gICAgICAgICAgICAgICAgbmV3SGlnaGVzdFNjb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnVwZGF0ZUhpZ2hTY29yZXMoe1xuICAgICAgICAgICAgICAgIHNjb3JlOiBERC5nYW1lLnNjb3JlLmxhc3RSdW4sXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICBpZiAobmV3SGlnaGVzdFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUuZWxlbWVudFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcbiAgICAgICAgICAgIFBsYXlBbmltYXRpb25zLmdhbWVPdmVyTWVudSgpO1xuXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnN0YXJmaXNoLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ2FtZU92ZXIoKSBmcm9tIGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZG9scGhpbklzQ292ZXJlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC0gREQucGxheWVyLmVsZW1lbnQueCkgPiAtNzUwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG4vLyBDaGVjayBmb3IgdG91Y2ggZXZlbnRzXG5ERC5nYW1lLnRvdWNoID0ge1xuICAgIC8qKlxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiB1cHBlciByaWdodCBoYWxmIG9mIHNjcmVlblxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXG4gICAgICogXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1RvdWNoaW5nVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDM2MCkgfHxcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55IDwgMzYwKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gbG93ZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNUb3VjaGluZ0Rvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA+IDM2MCkgfHxcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzYwKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxuXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgdmVyc2lvbiBudW1iZXIgaW4gQWJvdXQgbWVudVxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XG5cbiAgICAvLyBNYWluIG1lbnU6IE5ldyBHYW1lIGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XG5cbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5cbiAgICAgICAgXSk7XG5cbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIE1haW4gbWVudTogSGlnaCBTY29yZXMgYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5oaWdoU2NvcmVzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzKCk7XG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCk7XG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWluIG1lbnU6IEhvdyB0byBQbGF5IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaG93VG9QbGF5QnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQpO1xuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWluIG1lbnU6IEFib3V0IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuYWJvdXRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuYWJvdXRNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xuICAgIH0pO1xuXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogbmV4dCBQYWdlIDIgYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5uZXh0UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXG4gICAgICAgIF0pO1xuXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXG4gICAgICAgIF0pO1xuXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MigpO1xuICAgIH0pO1xuXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXG4gICAgICAgIF0pO1xuXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxXG4gICAgICAgIF0pO1xuXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xuICAgIH0pO1xuXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcbiAgICAgICAgXSk7XG5cbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMVxuICAgICAgICBdKTtcblxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBhbmQgcHJldiBQYWdlIDIgYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlMkJ0bikuYWRkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXG4gICAgICAgIF0pO1xuXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTJcbiAgICAgICAgXSk7XG5cbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xuICAgIH0pO1xuXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgUGFnZSAzIGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcbiAgICAgICAgXSk7XG5cbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xuICAgICAgICBdKTtcblxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XG4gICAgfSk7XG5cbiAgICAvLyBBYm91dCBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcbiAgICB9KTtcblxuICAgIC8vIFBhdXNlIG1lbnU6IGJhY2tncm91bmQgb3ZlcmxheVxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcbiAgICB9KTtcblxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3VtZSBidXR0b25cbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN1bWVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcbiAgICB9KTtcblxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdGFydEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXG4gICAgICAgIFxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcblxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XG5cbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIFBhdXNlIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcbiAgICAgICAgICAgIFxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xuICAgIH0pO1xuXG4gICAgLy8gR2FtZSBvdmVyIG1lbnU6IFBsYXkgYWdhaW4gYnV0dG9uXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUucGxheUFnYWluQnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcblxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcblxuICAgICAgICAvLyBTaG93IEhVRCBhbmQgcGF1c2UgYnV0dG9uXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudCwgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XG5cbiAgICAgICAgLy8gUmVzdGFydCBnYW1lXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSBmYWxzZTtcblxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gR2FtZSBPdmVyIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxuICAgICQoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcblxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBIVUQ6IFBhdXNlIGJ1dHRvbjogaGFuZGxlcyBwYXVzZSBhY3RpdmF0aW9uXG4gICAgICogXG4gICAgICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxuICAgICAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZFxuICAgICAqL1xuICAgICQoRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudF0pO1xuXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xuICAgIH0pO1xuXG59KTtcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XG5cbi8vIFJlc3RvcmUgcGVyc2lzdGVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbkRELmdhbWUuYWN0aW9ucy5yZXN0b3JlU2F2ZWRWYWx1ZXMoKTtcblxuLyoqXG4gKiBQcmVsb2FkIGZ1bmN0aW9uXG4gKiBcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXG4gKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcbiAqL1xuREQuZ2FtZS5wcmVsb2FkID0gZnVuY3Rpb24gcHJlbG9hZCgpIHtcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvU3RhdGljQmFja2dyb3VuZC5wbmcnKTtcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICcvYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDInLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIyLnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnYmFnJywgJy9hc3NldHMvaW1hZ2VzL2JhZy5wbmcnKTtcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXJmaXNoJywgJy9hc3NldHMvaW1hZ2VzL3N0YXJmaXNoLnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9vaWxiYWNrLnBuZycpO1xuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZG9scGhpbicsICcvYXNzZXRzL2ltYWdlcy9uZXctZG9scGhpbi5wbmcnLCAyNDUsIDEwMyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdqdW5rJywgJy9hc3NldHMvaW1hZ2VzL3BsYXN0aWNCYWcucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdoZWFsdGhwYWNrJywgJy9hc3NldHMvaW1hZ2VzL2ZpcnN0YWlkLnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnb3Zlcm5ldCcsICcvYXNzZXRzL2ltYWdlcy9vdmVybmV0LnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgndW5kZXJuZXQnLCAnL2Fzc2V0cy9pbWFnZXMvdW5kZXJuZXQucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCd3YXZlcycsICcvYXNzZXRzL2ltYWdlcy93YXZlcy5wbmcnKTtcbiAgICBnYW1lLmxvYWQuYXVkaW8oJ2p1bmtJbXBhY3QnLCAnL2Fzc2V0cy9hdWRpby95ZXkud2F2Jyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBmdW5jdGlvblxuICogXG4gKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xuICogZm9yIHRoZSBnYW1lXG4gKi9cbkRELmdhbWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIC8vIFNldCBib3VuZGFyaWVzIG9mIHRoZSB3b3JsZFxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XG5cbiAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XG5cbiAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcbiAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcbiAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xuICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XG5cbiAgICAvLyBTZXQgdHJhbnNwYXJlbmN5IG9mIGJhY2tncm91bmQgbGF5ZXJzXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmFscGhhID0gMTtcbiAgICBERC50ZXh0dXJlcy5sYXllckIuYWxwaGEgPSAwLjY7XG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmFscGhhID0gMTtcblxuICAgIC8vIEVuYWJsZSBQaHlzaWNzIG9uIGJhY2tncm91bmQgbGF5ZXJzXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cbiAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcblxuICAgIC8vIE1ha2UgYmFja2dyb3VuZCBsYXllcnMgaW1tdW5lIHRvIGNvbGxpc2lvbnNcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuICAgIERELnRleHR1cmVzLmxheWVyQi5ib2R5LmltbW92YWJsZSA9IHRydWU7XG4gICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIC8vIEFkZCBwbGF5ZXJcbiAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkb2xwaGluJyk7XG4gICAgREQucGxheWVyLmVsZW1lbnQuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xuXG4gICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50IGFuZCBlbmFibGUgUGh5c2ljc1xuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgxNjAwLCAwLCAnb2lsc3BpbGwnKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XG5cbiAgICAvLyBXYXZlc1xuICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3dhdmVzJyk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50KTtcblxuICAgIC8vIFNhbmRcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMTA4MCwgJ3dhdmVzJyk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQpO1xuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5hbHBoYSA9IDA7XG5cbiAgICAvLyBTb3VuZCBzdHVmZlxuICAgIERELmdhbWUuYXVkaW8uanVua0NvbGxpZGUgPSBnYW1lLmFkZC5hdWRpbygnanVua0ltcGFjdCcpO1xuICAgIERELmdhbWUuYXVkaW8uanVua0NvbGxpZGUuYWxsb3dNdWx0aXBsZSA9IHRydWU7XG5cbiAgICAvLyBQbGF5ZXIgYW5pbWF0aW9uc1xuICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFswLCAxLCAyLCAzLCA0XSwgMTAsIHRydWUpO1xuICAgIC8vIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdjb2xsaWRlJywgWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdLCAxMDAsIHRydWUpO1xuXG4gICAgLy8gQ3JlYXRlIGNvbGxpc2lvbiBncm91cHNcbiAgICBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcbiAgICBERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xuICAgIERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcbiAgICBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XG4gICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xuICAgIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcblxuICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxuICAgIC8vIENvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzICh3aGljaCB3ZSBkbylcbiAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXG4gICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBqdW5rcyBhbmQgc3RhcmZpc2hlc1xuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xuICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVTdGFyZmlzaCgpO1xuXG4gICAgLy8gU2V0dXAgY29sbGlzaW9uc1xuICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXApO1xuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQucGxheWVyLmNvbGxpc2lvbkdyb3VwKTtcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXApO1xuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXApO1xuXG4gICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcblxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCwgY29sbGVjdFN0YXJmaXNoLCB0aGlzKTtcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwLCBoaXRXYXZlcywgdGhpcyk7XG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBoaXRTYW5kLCB0aGlzKTtcblxuICAgIC8vIFNldHVwIGtleWJvYXJkIGNvbnRyb2xzXG4gICAgREQuZ2FtZS5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG5cbiAgICAvLyBTZXR1cCBjYW1lcmFcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3coREQucGxheWVyLmVsZW1lbnQpO1xuXG4gICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxuICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xuXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBVcGRhdGUgZnVuY3Rpb25cbiAqIFxuICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxuICovXG5ERC5nYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAvLyBDaGVjayBmb3IgZ2FtZSBvdmVyXG4gICAgaWYgKCBERC5nYW1lLmFjdGlvbnMuZG9scGhpbklzQ292ZXJlZCgpICkge1xuICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcblxuICAgICAgICBpZiAoIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ID49IChnYW1lLmNhbWVyYS54ICsgNTAwKSkge1xuICAgICAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XG4gICAgICAgIGlmICgoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAxMDAwKSB7XG5cbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0xICogREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnggPSBnYW1lLmNhbWVyYS54O1xuICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS55ID0gMjU7XG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkueSA9IDEwODA7XG5cbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LiBhbmdsZSA9IDA7XG5cblxuICAgIC8vIEdvdmVybnMgYW5kIGNvbnRyb2xzIGJvb3N0XG4gICAgaWYgKCFERC5nYW1lLnJ1bkVuZCkge1xuXG4gICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiB0aGUgLTggY29tcGVuc2F0ZXMgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyIGluIHRoZSB3b3JsZFxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAoKERELnBsYXllci5lbGVtZW50LnggLyA0MDApIC0gOCkgKiBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyO1xuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSBwYXJzZUludChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDEwKTtcblxuICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgcHJvZ3Jlc3MgYmFyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ICogNTAwICkgLyAxOTIwMDAgKTtcblxuICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgZG9scGhpbiB4XG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcbiAgICAgICAgICAgICdsZWZ0JywgKCAoREQucGxheWVyLmVsZW1lbnQueCAqIDQ5MiApIC8gMTkyMDAwIClcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBNaW5pbWFwOiBVcGRhdGUgZG9scGhpbiB5XG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcbiAgICAgICAgICAgICd0b3AnLCAoIChERC5wbGF5ZXIuZWxlbWVudC55ICogMjApIC8gMTA4MCApXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCArICgzMCAqIERELmdhbWUud29ybGQubGV2ZWwpICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMzUwO1xuXG4gICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgcGxheWVyJ3MgdmVsb2NpdHkgKG1vdmVtZW50KVxuICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xuICAgIH1cblxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSkge1xuICAgICAgICBpZiAoREQuZ2FtZS53b3JsZC5sZXZlbCA8IDE5KSB7XG4gICAgICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyArPSAtMTtcblxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XG5cbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCT09TVCEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBjaGFyZ2VzIGxlZnQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChERC5nYW1lLmN1cnNvcnMudXAuaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ1VwKCkpIHtcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gLTEgKiBERC5wbGF5ZXIuYW5nbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duIHx8IERELmdhbWUudG91Y2guaXNUb3VjaGluZ0Rvd24oKSkge1xuICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcbiAgICB9XG59O1xuXG4vKlxuICogUmVuZGVyIGZ1bmN0aW9uXG4gKi9cbkRELmdhbWUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGdhbWUuZGVidWcuYm9keShERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50KTtcbiAgICBnYW1lLmRlYnVnLmJvZHkoREQucGxheWVyLmVsZW1lbnQpO1xuXG4gICAgLy8gVXBkYXRlIHNjb3JlXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgIT09IERELmdhbWUuc2NvcmUubGFzdFJ1bikge1xuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gREQuZ2FtZS5zY29yZS5sYXN0UnVuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBzdGFyZmlzaFxuICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnN0YXJmaXNoICE9PSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pIHtcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKTtcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bjtcbiAgICB9XG5cbiAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyLCAzMiwgNzIpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGp1bmtcbiAqL1xuLy8gZnVuY3Rpb24ganVua0hpdCgpIHtcbi8vICAgICBjb25zb2xlLmxvZygnSnVuayBoaXQhJyk7XG5cbi8vICAgICAvLyBTb3VuZCBzdHVmZlxuLy8gICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnY29sbGlkZScpO1xuLy8gICAgIERELmdhbWUuYXVkaW8uanVua0NvbGxpZGUucGxheSgpO1xuXG4vLyAgICAgaWYgKCFERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSkge1xuLy8gICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XG4vLyAgICAgICAgIERELm9iamVjdHMuanVua3MuYWN0aXZlID0gdHJ1ZTtcbi8vICAgICAgICAgc2V0VGltZW91dChyZWdhaW5TcGVlZCwgMzAwMCk7XG4vLyAgICAgfSAgXG4vLyB9XG5cbi8qXG4gKiBJbmNyZWFzZSBwbGF5ZXIgc3BlZWQgYWZ0ZXJcbiAqIGNvbGxpc2lvbiB3aXRoIGp1bmtcbiAqL1xuZnVuY3Rpb24ganVua0hpdCgpIHtcbiAgICAvLyBUaGUgc3BlZWQgdGhhdCB0aGUgcGxheWVyIHNob3VsZCBiZSB0cmF2ZWxsaW5nIGF0IGlzIHN0b3JlZCwgXG4gICAgLy8gb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbiBiZWxvdyB3aWxsIHNsb3cgZG93biByYXRoZXIgdGhhbiBzcGVlZCB1cC5cbiAgICB2YXIgb3JpZ2luYWxTcGVlZCA9IERELnBsYXllci5zcGVlZDtcblxuICAgIC8vIFNldHRpbmcgYSBzbG93IHNwZWVkIHN0cmFpZ2h0IGF3YXkgc28gaXQgZG9lc24ndCBmZWVsIGxhZ2d5XG4gICAgREQucGxheWVyLnNwZWVkID0gb3JpZ2luYWxTcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcblxuICAgIC8vIHNldEludGVydmFsIG1lYW5zIHRoYXQgSSBjYW4gcGVyZm9ybSB0aGlzIG92ZXIgc29tZSB0aW1lIFxuICAgIC8vIGFuZCBncmFkdWFsbHkgd2l0aG91dCB1c2luZyBQaGFzZXJzIHN0dXBpZCB0aW1lIGZ1bmN0aW9uLlxuICAgIC8vIFRpbWUgb24gdGhlIHNlY29uZCBhcmd1bWVudCBpcyBpbiBtaWxsaXNlY29uZHMuIFxuICAgIHZhciBzcGVlZFVwID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLnNsb3cgPD0gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coREQub2JqZWN0cy5qdW5rcy5zbG93KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSBvcmlnaW5hbFNwZWVkIGlzIHVzZWQgdG8gcHJvdmlkZSBcbiAgICAgICAgICAgIC8vIGEgZ3JhZHVhbCBzcGVlZCB1cCB0aGF0IGZlZWxzIGEgbGl0dGxlIG1vcmUgbmF0dXJhbC5cbiAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEV2ZXJ5IHNlY29uZCB0aGUgZG9scGhpbiBnZXRzIDEwJSBjbG9zZXIgdG8gZnVsbCBzcGVlZC5cbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3Muc2xvdyArPSAwLjE7XG4gICAgICAgIH0gZWxzZSB7IC8vIERldGVjdGluZyB3aGVuIHRoZSBtYXhpbXVtIHNwZWVkIGlzIHJlYWNoZWQsIHNvIHRoZSBmdW5jdGlvbiBjYW4gZW5kLlxuICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcnZhbCB0aGF0IGlzIGNhdXNpbmcgdGhlIGNoYW5nZSBpbiBkb2xwaGluIHNwZWVkLlxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzcGVlZFVwKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMDApO1xuXG4gICAgLy8gUmVzZXR0aW5nIHRoZSBzbG93aW5nIGVmZmVjdCBhZnRlciB0aGUgbm9ybWFsIHNwZWVkIGlzIHJlYWNoZWQgYWdhaW4uXG4gICAgREQub2JqZWN0cy5qdW5rcy5zbG93ID0gMC40O1xuXG4gICAgLypcbiAgICAgKiBERC5wbGF5ZXIuc3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQgLyBERC5vYmplY3RzLmp1bmtzLnNsb3c7XG4gICAgICogREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgKi9cbn1cblxuLypcbiAqIEhhbmRsZSBwbGF5ZXIgY29sbGlzaW9uIHdpdGggc3RhcmZpc2hcbiAqIEBwYXJhbSAge0dhbWUuc3ByaXRlfSBwbGF5ZXJcbiAqIEBwYXJhbSAge0dhbWUuc3ByaXRlfSBzdGFyZmlzaFxuICovXG5mdW5jdGlvbiBjb2xsZWN0U3RhcmZpc2gocGxheWVyLCBzdGFyZmlzaCkge1xuICAgIHN0YXJmaXNoLmJvZHkgPSBudWxsO1xuICAgIHN0YXJmaXNoLnNwcml0ZS5raWxsKCk7XG5cbiAgICBpZiAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMuaW5kZXhPZihzdGFyZmlzaC5kYXRhLmlkKSA9PT0gLTEpIHtcbiAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuICs9IDE7XG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guY29sbGVjdGVkSWRzLnB1c2goc3RhcmZpc2guZGF0YS5pZCk7XG4gICAgfVxuXG4gICAgLy8gQWRkaXRpb25hbGx5IGhhdmUgdG8gYWRkIGNvZGUgd2hpY2ggd2lsbCByZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSBnYW1lXG59XG5cbmZ1bmN0aW9uIGhpdFdhdmVzKCkge1xuICAgIGNvbnNvbGUubG9nKCdXYXZlIGhpdCcpO1xuXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAxMDAwO1xuICAgIHNldFRpbWVvdXQoc3RvcEFjY2VsZXJhdGlvbiwgMTAwMCk7XG4gICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIHN0b3BBY2NlbGVyYXRpb24oKSB7XG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAwO1xuICAgIGNvbnNvbGUubG9nKCdTdG9wIEFjY2VsZXJhdGlvbicpO1xuICAgIERELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaGl0U2FuZCgpIHtcbiAgICBjb25zb2xlLmxvZygnU2FuZCBoYXMgYmVlbiBoaXQnKTtcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IC0xMDAwO1xuICAgIHNldFRpbWVvdXQoc3RvcEFjY2VsZXJhdGlvbiwgMTAwMCk7XG4gICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XG59XG5cbi8vIEV2ZXJ5dGhpbmcgaXMgZGVjbGFyZWQ6IGluaXRpYWxpemUgZ2FtZVxuREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=