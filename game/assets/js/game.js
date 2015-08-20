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
            junkCollide: null,
            GameSound: null
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

        DD.game.audio.GameSound.destroy();
        game.cache.removeSound('GameSound');

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
    game.load.audio('GameSound', '/assets/audio/GameSound.ogg');
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
    DD.game.audio.GameSound = game.add.audio('GameSound');
    DD.game.audio.GameSound.allowMultiple = true;

    DD.game.audio.GameSound.addMarker('junkHit', 0.48, 0.2);
    DD.game.audio.GameSound.addMarker('coinGet', 0.2, 0.2);
    DD.game.audio.GameSound.addMarker('Music', 1.7, 59.0);
    if (DD.game.firstRun === true) {
        playMusic();
    };

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
        DD.player.element.animations.play('right');

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

    DD.game.audio.GameSound.play('junkHit');
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
            DD.objects.junks.slow += 0.01;
        } else { // Detecting when the maximum speed is reached, so the function can end.
            // End the interval that is causing the change in dolphin speed.
            clearInterval(speedUp);
        }
    }, 100);

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
    DD.game.audio.GameSound.play('coinGet');

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

function playMusic() {
    DD.game.audio.GameSound.play('Music');
    setTimeout(playMusic, 59000);
}

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZWdpc3RlciBBcnJheS5nZXRVbmlxdWUoKVxyXG5BcnJheS5wcm90b3R5cGUudW5pcXVlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGkgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciBsID0gdGhpcy5sZW5ndGg7XHJcbiAgICB2YXIgciA9IFtdO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcclxuICAgICAgICBvW3RoaXNbaV1dID0gdGhpc1tpXTtcclxuICAgIH0gXHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuICAgICAgICByLnB1c2gob1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByO1xyXG59O1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIEREIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBzdGF0ZSBpbmRlcGVuZGVudCBvZiBQaGFzZXJcclxuICovXHJcbnZhciBERCA9IHtcclxuICAgIHZlcnNpb246ICcwLjEuMCcsXHJcblxyXG4gICAgb2JqZWN0czoge1xyXG4gICAgICAgIHNwaWxsOiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiAyNTAsXHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgICAgICBncmFkaWVudDoge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAoTWF0aC5yYW5kb20oKSAqIDUwKSArIDUwLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAxMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgc2xvdzogMC40LFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5ldHM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAyMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdGV4dHVyZXM6IHtcclxuICAgICAgICBsYXllckE6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJCOiBudWxsLFxyXG4gICAgICAgIGxheWVyQzogbnVsbCxcclxuICAgICAgICB3YXZlczoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2FuZDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIGFjY2VsZXJhdGlvbkFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgc3BlZWQ6IDMwMCxcclxuICAgICAgICB2ZXJ0U3BlZWQ6IDMwMCxcclxuICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgIGFuZ2xlOiAyMFxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZ2FtZU92ZXJDYWxsZWQ6IGZhbHNlLFxyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgbGFzdEZyYW1lVmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHN0YXJmaXNoOiAwLFxyXG4gICAgICAgICAgICAgICAgc2NvcmU6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGlnaFNjb3JlczogW11cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtb2RpZmllcnM6IHtcclxuICAgICAgICAgICAgdG90YWw6IDAsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGJvb3N0OiB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDIwMCxcclxuICAgICAgICAgICAgICAgIGJlZ2luOiAwLFxyXG4gICAgICAgICAgICAgICAgY2hhcmdlczogMVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbXVsdGlwbGllcjogMVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGF1ZGlvOiB7XHJcbiAgICAgICAgICAgIGp1bmtDb2xsaWRlOiBudWxsLFxyXG4gICAgICAgICAgICBHYW1lU291bmQ6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuXHJcbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxyXG52YXIgZ2FtZTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyByZWZlcmVuY2VzIHRvIGFsbCBvbi1zY3JlZW4gZWxlbWVudHNcclxuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5RGF0YSA9IHtcclxuICAgIGdhbWU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZDoge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNodWQnKSxcclxuICAgICAgICBzY29yZTogJCgnI2h1ZC1zY29yZScpLFxyXG4gICAgICAgIHN0YXJmaXNoOiAkKCcjaHVkLXN0YXJmaXNoJyksXHJcbiAgICAgICAgcGF1c2VCdG46ICQoJyNodWQtcGF1c2VCdG4nKSxcclxuICAgICAgICBwcm9ncmVzc0Jhcjoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjaHVkLXByb2dyZXNzYmFyJyksXHJcbiAgICAgICAgICAgIHNwaWxsOiAkKCcjaHVkLXByb2dyZXNzYmFyLW9pbHNwaWxsJyksXHJcbiAgICAgICAgICAgIGRvbHBoaW46ICQoJyNodWQtcHJvZ3Jlc3NiYXItZG9scGhpbicpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWluTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNtYWluTWVudScpLFxyXG4gICAgICAgIG5ld0dhbWVCdG46ICQoJyNtYWluTWVudS1uZXdHYW1lJyksXHJcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcclxuICAgICAgICBob3dUb1BsYXlCdG46ICQoJyNtYWluTWVudS1ob3dUb1BsYXknKSxcclxuICAgICAgICBhYm91dEJ0bjogJCgnI21haW5NZW51LWFib3V0JylcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaFNjb3Jlc01lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcclxuICAgICAgICBsaXN0OiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCcpLFxyXG4gICAgICAgIGxpc3RQYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTInKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTInKVxyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuICAgICAgICBuZXh0UGFnZTNCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTNCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTJCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UyJyksXHJcbiAgICAgICAgcGFnZTM6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UzJylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI2dhbWVPdmVyTWVudSAub3ZlcmxheScpLFxyXG5cclxuICAgICAgICBoaWdoU2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1zdGFyZmlzaCcpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2ggLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lT3Zlck1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgc2hvd0VsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgaGlkZUVsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc2hvd01lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFttZW51XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGhpZGVBbGxNZW51czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBoaWRlQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50XSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHNjb3JlcyBpbiBBYm91dCBtZW51XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUhpZ2hTY29yZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzID0gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnVuaXF1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNvcnQgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIEhUTUwgZm9yIHNjb3Jlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMSlcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3QpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuICAgICAgICBmb3IgKHZhciBqID0gNTsgaiA8IDEwOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSkge1xyXG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDIpXHJcbiAgICAgICAgaWYgKGhpZ2hTY29yZXNIdG1sLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3RQYWdlMikuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQ29udHJvbHMgdGhlIHBsYXliYWNrIG9mIGFuaW1hdGlvbnNcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7XHJcbiAgICAvLyBNYWluIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgbWFpbk1lbnU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNtYWluTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNixcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI21haW5NZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudSBhbmltYXRpb25zXHJcbiAgICBoaWdoU2NvcmVzTWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBzY29yZXNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LWxpc3QgZGl2JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEhpZ2ggc2NvcmVzIG1lbnUgcGFnZSAyXHJcbiAgICBoaWdoU2NvcmVzTWVudTI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyIGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTIgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjaG93VG9QbGF5TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGFib3V0TWVudTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2Fib3V0TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFBhdXNlIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgcGF1c2VNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiA3NSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZU92ZXJNZW51OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjZ2FtZU92ZXJNZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC40LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjZ2FtZU92ZXJNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIEdhbWUgYWN0aW9ucyBhbmQgYWN0aW9uLXJlbGF0ZWRcclxuLy8gZnVuY3Rpb25zXHJcbkRELmdhbWUuYWN0aW9ucyA9IHtcclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgZ2FtZVxyXG4gICAgICogXHJcbiAgICAgKiBJbml0aWFsaXplIHRoZSBnbG9iYWwgZ2FtZSBvYmplY3RcclxuICAgICAqL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTI4MCwgNzIwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICAgICAgICAgIHByZWxvYWQ6IERELmdhbWUucHJlbG9hZCxcclxuICAgICAgICAgICAgY3JlYXRlOiBERC5nYW1lLmNyZWF0ZSxcclxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcclxuICAgICAgICAgICAgcmVuZGVyOiBERC5nYW1lLnJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuXHQvKipcclxuXHQgKiBKdW5rIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG5cdCAqXHJcblx0ICogQ3JlYXRlcyBhIHRob3VzYW5kIGp1bmsgb2JqZWN0cyBhbmQgc3RvcmVzXHJcblx0ICogdGhlbSBpbiBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzW11cclxuXHQgKi9cclxuICAgIGNyZWF0ZUp1bmtzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganVuaztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAganVuayA9IGdhbWUuYWRkLnNwcml0ZShcclxuICAgICAgICAgICAgICAgIChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODcwMDApICsgNTAwMCksXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnYmFnJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8ganVuay5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgICAgICAvLyBqdW5rLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGp1bmspO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjUsIDAuNSk7XHJcblxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gTWF0aC5yYW5kb20oKSAqIDI7XHJcbiAgICAgICAgICAgIGp1bmsuYm9keS52ZWxvY2l0eS55ID0gTWF0aC5yYW5kb20oKSAqIDgwO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUganVuayB0byB1c2UgdGhlIERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5wdXNoKGp1bmspO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcblx0ICogU3RhcmZpc2ggZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcblx0ICpcclxuXHQgKiBDcmVhdGVzIGEgdGhvdXNhbmQgc3RhcmZpc2ggb2JqZWN0cyBhbmQgc3RvcmVzXHJcblx0ICogdGhlbSBpbiBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzW11cclxuXHQgKi9cclxuICAgIGNyZWF0ZVN0YXJmaXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcbiAgICAgICAgdmFyIGo7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHRob3VzYW5kIGp1bmsgb2JqZWN0c1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBERC5vYmplY3RzLnN0YXJmaXNoLmFtb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4NzAwMCkgKyA1MDAwKSwgXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksIFxyXG4gICAgICAgICAgICAgICAgJ3N0YXJmaXNoJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gc3RhcmZpc2guZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHN0YXJmaXNoLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoc3RhcmZpc2gpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcbiAgICAgICAgICAgIHN0YXJmaXNoLnNjYWxlLnNldFRvKDAuNSwgMC41KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIHN0YXJmaXNoIHRvIHVzZSB0aGUgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAgc3RhcmZpc2guYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0YXJmaXNoZXMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5wdXNoKHN0YXJmaXNoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFJlc3RvcmUgc2F2ZWQgdmFsdWVzIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gICAgcmVzdG9yZVNhdmVkVmFsdWVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlSGlnaFNjb3JlczogZnVuY3Rpb24oc2NvcmUpIHtcclxuICAgICAgICBpZiAoc2NvcmUuc2NvcmUgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgbmV3IHZhbHVlcyB0byBjdXJyZW50IHZhbHVlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzID0gW3Njb3JlLnNjb3JlXS5jb25jYXQoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzKTtcclxuICAgICAgICB2YXIgc3RhcmZpc2ggPSBzY29yZS5zdGFyZmlzaCArIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWw7XHJcblxyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzIGFuZCBzb3J0IGluIERFU0NcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy51bmlxdWUoKTtcclxuICAgICAgICBoaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdldCBvbmx5IHRvcCAxMCBzY29yZXNcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy5zcGxpY2UoMCwgOSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpbi1nYW1lIHZhbHVlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGVyc2lzdGVkIHZhbHVlc1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdoaWdoU2NvcmVzJywgaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgc2ltcGxlU3RvcmFnZS5zZXQoJ3N0YXJmaXNoJywgc3RhcmZpc2gpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVOZXRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV0O1xyXG4gICAgICAgIHZhciB1bmRlck5ldDtcclxuICAgICAgICB2YXIgaztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgdHdvIGh1bmRyZWQgbmV0IG9iamVjdHNcclxuICAgICAgICBmb3IgKGsgPSAwOyBrIDwgREQub2JqZWN0cy5uZXRzLmFtb3VudDsgaysrKSB7XHJcbiAgICAgICAgICAgIC8vIEZvciB3aGVyZSBpdCBzYXlzICdzdGFyJywgaSB3YW50IHRvIGFkZCBhIGxpc3Qgd2hpY2ggaXQgd2lsbCB0YWtlIGZyb20gcmFuZG9tbHkuXHJcbiAgICAgICAgICAgIG5ldCA9IGdhbWUuYWRkLnNwcml0ZSggKCAoayArIDgpICogNDAwKSwgMCwgJ292ZXJuZXQnICk7XHJcblxyXG4gICAgICAgICAgICAvLyBuZXQuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIG5ldC5waHlzaWNzQm9keVR5cGUgPSBQaGFzZXIuUGh5c2ljcy5QMkpTO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldCk7XHJcblxyXG4gICAgICAgICAgICB1bmRlck5ldCA9IGdhbWUuYWRkLnNwcml0ZShuZXQuYm9keS54LCBuZXQuYm9keS55LCAndW5kZXJuZXQnKTsgXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAgbmV0LmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBuZXRzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBuZXQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMubmV0cy5lbGVtZW50cy5wdXNoKG5ldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSByZXN0YXJ0XHJcbiAgICAgKiBcclxuICAgICAqIFJlc2V0IHJ1bm5pbmcgdmFyaWFibGVzIGFuZCByZXN0YXJ0IGdhbWUgYnlcclxuICAgICAqIGRlc3Ryb3lpbmcgY3VycmVudCBnYW1lIGNhY2hlIGFuZCBcclxuICAgICAqIHJlLWluaXRpYWxpemluZyB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICByZXN0YXJ0OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUuY2FjaGUucmVtb3ZlU291bmQoJ0dhbWVTb3VuZCcpO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBzdGFyZmlzaGVzXHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXJmaXNoLCBpbmRleCkge1xyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5ID0gbnVsbDtcclxuICAgICAgICAgICAgc3RhcmZpc2gua2lsbCgpO1xyXG4gICAgICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGp1bmtzIGFuZCBzdGFyZmlzaCBhcnJheXNcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IDA7XHJcblxyXG4gICAgICAgIGdhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAgICAgKiBcclxuICAgICAqIEVuZHMgY3VycmVudCBnYW1lIGFuZCBkaXNwbGF5c1xyXG4gICAgICogZ2FtZSBvdmVyIG1lbnVcclxuICAgICAqL1xyXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXdIaWdoZXN0U2NvcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFERC5nYW1lLmdhbWVPdmVyQ2FsbGVkKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUucnVuRW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RSdW4gPiBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgIG5ld0hpZ2hlc3RTY29yZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy51cGRhdGVIaWdoU2NvcmVzKHtcclxuICAgICAgICAgICAgICAgIHNjb3JlOiBERC5nYW1lLnNjb3JlLmxhc3RSdW4sXHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmV3SGlnaGVzdFNjb3JlKSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgICAgICBQbGF5QW5pbWF0aW9ucy5nYW1lT3Zlck1lbnUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFdhaXQgaGFsZiBhIHNlY29uZCwgdGhlbiB0cmlnZ2VyIHNjb3JlIGRpc3BsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnN0YXJmaXNoLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7IFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAobmV3SGlnaGVzdFNjb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ2FtZU92ZXIoKSBmcm9tIGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRvbHBoaW5Jc0NvdmVyZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC0gREQucGxheWVyLmVsZW1lbnQueCkgPiAtNzUwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gQ2hlY2sgZm9yIHRvdWNoIGV2ZW50c1xyXG5ERC5nYW1lLnRvdWNoID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gdXBwZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVG91Y2hpbmdVcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDM2MCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPCAzNjApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiBsb3dlciByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNUb3VjaGluZ0Rvd246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPiAzNjApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzYwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIFNldHVwIGV2ZW50cyBhbmQgbGlzdGVuZXJzIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBVcGRhdGUgdmVyc2lvbiBudW1iZXIgaW4gQWJvdXQgbWVudVxyXG4gICAgRGlzcGxheURhdGEuYWJvdXRNZW51LnZlcnNpb24udGV4dChERC52ZXJzaW9uKTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IE5ldyBHYW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5uZXdHYW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSGlnaCBTY29yZXMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmhpZ2hTY29yZXNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkudXBkYXRlSGlnaFNjb3JlcygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSG93IHRvIFBsYXkgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51Lmhvd1RvUGxheUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogQWJvdXQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmFib3V0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5hYm91dE1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBuZXh0IFBhZ2UgMiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubmV4dFBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTFcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgYW5kIHByZXYgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlMkJ0bikuYWRkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBuZXh0IFBhZ2UgMyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWJvdXQgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBiYWNrZ3JvdW5kIG92ZXJsYXlcclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN0YXJ0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFJlc2V0IEhVRCBzY29yZXNcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dCgwKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcblxyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIEZpcnN0IHJ1biB3aWxsIHNob3cgTWFpbiBNZW51IGFuZCBwbGF5IGl0cyBhbmltYXRpb25cclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBvdmVyIG1lbnU6IFBsYXkgYWdhaW4gYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5wbGF5QWdhaW5CdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IEhVRCBzY29yZXNcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dCgwKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcclxuXHJcbiAgICAgICAgLy8gU2hvdyBIVUQgYW5kIHBhdXNlIGJ1dHRvblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudCwgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcblxyXG4gICAgICAgIC8vIFJlc3RhcnQgZ2FtZVxyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgIERELmdhbWUucnVuRW5kID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFJlc3VtZSBnYW1lXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgT3ZlciBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIVUQ6IFBhdXNlIGJ1dHRvbjogaGFuZGxlcyBwYXVzZSBhY3RpdmF0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICAgICAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZFxyXG4gICAgICovXHJcbiAgICAkKERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMucGF1c2VNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLy8gUmVzdG9yZSBwZXJzaXN0ZWQgdmFsdWVzIGZyb20gbG9jYWwgc3RvcmFnZVxyXG5ERC5nYW1lLmFjdGlvbnMucmVzdG9yZVNhdmVkVmFsdWVzKCk7XHJcblxyXG4vKipcclxuICogUHJlbG9hZCBmdW5jdGlvblxyXG4gKiBcclxuICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAqL1xyXG5ERC5nYW1lLnByZWxvYWQgPSBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICcvYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICcvYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhZycsICcvYXNzZXRzL2ltYWdlcy9iYWcucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXJmaXNoJywgJy9hc3NldHMvaW1hZ2VzL3N0YXJmaXNoLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvb2lsYmFjay5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZG9scGhpbicsICcvYXNzZXRzL2ltYWdlcy9uZXctZG9scGhpbi5wbmcnLCAyNDUsIDEwMyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2p1bmsnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhc3RpY0JhZy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnaGVhbHRocGFjaycsICcvYXNzZXRzL2ltYWdlcy9maXJzdGFpZC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb3Zlcm5ldCcsICcvYXNzZXRzL2ltYWdlcy9vdmVybmV0LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCd1bmRlcm5ldCcsICcvYXNzZXRzL2ltYWdlcy91bmRlcm5ldC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnd2F2ZXMnLCAnL2Fzc2V0cy9pbWFnZXMvd2F2ZXMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuYXVkaW8oJ2p1bmtJbXBhY3QnLCAnL2Fzc2V0cy9hdWRpby95ZXkud2F2Jyk7XHJcbiAgICBnYW1lLmxvYWQuYXVkaW8oJ0dhbWVTb3VuZCcsICcvYXNzZXRzL2F1ZGlvL0dhbWVTb3VuZC5vZ2cnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgZnVuY3Rpb25cclxuICogXHJcbiAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAqIGZvciB0aGUgZ2FtZVxyXG4gKi9cclxuREQuZ2FtZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLnNldEltcGFjdEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQSA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDEnKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgLy8gU2V0IHRyYW5zcGFyZW5jeSBvZiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJBLmFscGhhID0gMTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5hbHBoYSA9IDE7XHJcblxyXG4gICAgLy8gRW5hYmxlIFBoeXNpY3Mgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICBnYW1lLnBoeXNpY3MuZW5hYmxlKERELnRleHR1cmVzLmxheWVyQywgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMyAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQi5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMiAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAvLyBNYWtlIGJhY2tncm91bmQgbGF5ZXJzIGltbXVuZSB0byBjb2xsaXNpb25zXHJcbiAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkIHBsYXllclxyXG4gICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuc2NhbGUuc2V0VG8oMC40LCAwLjQpO1xyXG5cclxuICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50IGFuZCBlbmFibGUgUGh5c2ljc1xyXG4gICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDE2MDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIFdhdmVzXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICd3YXZlcycpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50KTtcclxuXHJcbiAgICAvLyBTYW5kXHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMTA4MCwgJ3dhdmVzJyk7XHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLnNhbmQuZWxlbWVudCk7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYWxwaGEgPSAwO1xyXG5cclxuICAgIC8vIFNvdW5kIHN0dWZmXHJcbiAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZCA9IGdhbWUuYWRkLmF1ZGlvKCdHYW1lU291bmQnKTtcclxuICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLmFsbG93TXVsdGlwbGUgPSB0cnVlO1xyXG5cclxuICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLmFkZE1hcmtlcignanVua0hpdCcsIDAuNDgsIDAuMik7XHJcbiAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZC5hZGRNYXJrZXIoJ2NvaW5HZXQnLCAwLjIsIDAuMik7XHJcbiAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZC5hZGRNYXJrZXIoJ011c2ljJywgMS43LCA1OS4wKTtcclxuICAgIGlmIChERC5nYW1lLmZpcnN0UnVuID09PSB0cnVlKSB7XHJcbiAgICAgICAgcGxheU11c2ljKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFBsYXllciBhbmltYXRpb25zXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbMCwgMSwgMiwgMywgNF0sIDEwLCB0cnVlKTtcclxuICAgIC8vIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdjb2xsaWRlJywgWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdLCAxMDAsIHRydWUpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBjb2xsaXNpb24gZ3JvdXBzXHJcbiAgICBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgIERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gVGhpcyBwYXJ0IGlzIHZpdGFsIGlmIHlvdSB3YW50IHRoZSBvYmplY3RzIHdpdGggdGhlaXIgb3duIGNvbGxpc2lvbiBncm91cHMgdG8gc3RpbGwgXHJcbiAgICAvLyBDb2xsaWRlIHdpdGggdGhlIHdvcmxkIGJvdW5kcyAod2hpY2ggd2UgZG8pXHJcbiAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICBnYW1lLnBoeXNpY3MucDIudXBkYXRlQm91bmRzQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBqdW5rcyBhbmQgc3RhcmZpc2hlc1xyXG4gICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUp1bmtzKCk7XHJcbiAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlU3RhcmZpc2goKTtcclxuXHJcbiAgICAvLyBTZXR1cCBjb2xsaXNpb25zXHJcbiAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQucGxheWVyLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0U3RhcmZpc2gsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgaGl0V2F2ZXMsIHRoaXMpO1xyXG4gICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBoaXRTYW5kLCB0aGlzKTtcclxuXHJcbiAgICAvLyBTZXR1cCBrZXlib2FyZCBjb250cm9sc1xyXG4gICAgREQuZ2FtZS5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgLy8gU2V0dXAgY2FtZXJhXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3coREQucGxheWVyLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSBmdW5jdGlvblxyXG4gKiBcclxuICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gKi9cclxuREQuZ2FtZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG4gICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgaWYgKCBERC5nYW1lLmFjdGlvbnMuZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5nYW1lT3ZlcigpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcblxyXG4gICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgaWYgKChERC5wbGF5ZXIuZWxlbWVudC54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0xICogREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWw7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueSA9IDI1O1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XHJcbiAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS55ID0gMTA4MDtcclxuXHJcbiAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuIGFuZ2xlID0gMDtcclxuXHJcblxyXG4gICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuXHJcbiAgICAgICAgLy8gU2V0cyBERC5nYW1lLnNjb3JlLmxhc3RSdW4gYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIuIHRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNDAwKSAtIDgpICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSBwYXJzZUludChERC5nYW1lLnNjb3JlLmxhc3RSdW4sIDEwKTtcclxuXHJcbiAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIHByb2dyZXNzIGJhclxyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ICogNTAwICkgLyAxOTIwMDAgKTtcclxuXHJcbiAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIGRvbHBoaW4geFxyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcclxuICAgICAgICAgICAgJ2xlZnQnLCAoIChERC5wbGF5ZXIuZWxlbWVudC54ICogNDkyICkgLyAxOTIwMDAgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIE1pbmltYXA6IFVwZGF0ZSBkb2xwaGluIHlcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXHJcbiAgICAgICAgICAgICd0b3AnLCAoIChERC5wbGF5ZXIuZWxlbWVudC55ICogMjApIC8gMTA4MCApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkICsgKDUwICogREQuZ2FtZS53b3JsZC5sZXZlbCkgKyBERC5nYW1lLm1vZGlmaWVycy50b3RhbDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgb2lsc3BpbGwgdmVsb2NpdHlcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gREQub2JqZWN0cy5zcGlsbC5zcGVlZCArICg1MCAqIERELmdhbWUud29ybGQubGV2ZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcclxuICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKERELmdhbWUuY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyA+IDApIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyArPSAtMTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBjaGFyZ2VzIGxlZnQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKERELmdhbWUuY3Vyc29ycy51cC5pc0Rvd24gfHwgREQuZ2FtZS50b3VjaC5pc1RvdWNoaW5nVXAoKSkge1xyXG4gICAgICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93biB8fCBERC5nYW1lLnRvdWNoLmlzVG91Y2hpbmdEb3duKCkpIHtcclxuICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IERELnBsYXllci5hbmdsZTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciBmdW5jdGlvblxyXG4gKi9cclxuREQuZ2FtZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBnYW1lLmRlYnVnLmJvZHkoREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCk7XHJcbiAgICBnYW1lLmRlYnVnLmJvZHkoREQucGxheWVyLmVsZW1lbnQpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBzY29yZVxyXG4gICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgIT09IERELmdhbWUuc2NvcmUubGFzdFJ1bikge1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IERELmdhbWUuc2NvcmUubGFzdFJ1bjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgc3RhcmZpc2hcclxuICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnN0YXJmaXNoICE9PSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pIHtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllciwgMzIsIDcyKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICovXHJcbi8vIGZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbi8vICAgICBjb25zb2xlLmxvZygnSnVuayBoaXQhJyk7XHJcblxyXG4vLyAgICAgLy8gU291bmQgc3R1ZmZcclxuLy8gICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnY29sbGlkZScpO1xyXG4gICAgXHJcblxyXG4vLyAgICAgaWYgKCFERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSkge1xyXG4vLyAgICAgICAgIERELnBsYXllci5zcGVlZCA9IERELnBsYXllci5zcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcclxuLy8gICAgICAgICBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IHRydWU7XHJcbi8vICAgICAgICAgc2V0VGltZW91dChyZWdhaW5TcGVlZCwgMzAwMCk7XHJcbi8vICAgICB9ICBcclxuLy8gfVxyXG5cclxuLyoqXHJcbiAqIEluY3JlYXNlIHBsYXllciBzcGVlZCBhZnRlclxyXG4gKiBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAqL1xyXG5mdW5jdGlvbiBqdW5rSGl0KCkge1xyXG5cclxuICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLnBsYXkoJ2p1bmtIaXQnKTtcclxuICAgIC8vIFRoZSBzcGVlZCB0aGF0IHRoZSBwbGF5ZXIgc2hvdWxkIGJlIHRyYXZlbGxpbmcgYXQgaXMgc3RvcmVkLCBcclxuICAgIC8vIG90aGVyd2lzZSB0aGUgZnVuY3Rpb24gYmVsb3cgd2lsbCBzbG93IGRvd24gcmF0aGVyIHRoYW4gc3BlZWQgdXAuXHJcbiAgICB2YXIgb3JpZ2luYWxTcGVlZCA9IERELnBsYXllci5zcGVlZDtcclxuXHJcbiAgICAvLyBTZXR0aW5nIGEgc2xvdyBzcGVlZCBzdHJhaWdodCBhd2F5IHNvIGl0IGRvZXNuJ3QgZmVlbCBsYWdneVxyXG4gICAgREQucGxheWVyLnNwZWVkID0gb3JpZ2luYWxTcGVlZCAqIERELm9iamVjdHMuanVua3Muc2xvdztcclxuXHJcbiAgICAvLyBzZXRJbnRlcnZhbCBtZWFucyB0aGF0IEkgY2FuIHBlcmZvcm0gdGhpcyBvdmVyIHNvbWUgdGltZSBcclxuICAgIC8vIGFuZCBncmFkdWFsbHkgd2l0aG91dCB1c2luZyBQaGFzZXJzIHN0dXBpZCB0aW1lIGZ1bmN0aW9uLlxyXG4gICAgLy8gVGltZSBvbiB0aGUgc2Vjb25kIGFyZ3VtZW50IGlzIGluIG1pbGxpc2Vjb25kcy4gXHJcbiAgICB2YXIgc3BlZWRVcCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLnNsb3cgPD0gMSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhERC5vYmplY3RzLmp1bmtzLnNsb3cpO1xyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIG9yaWdpbmFsU3BlZWQgaXMgdXNlZCB0byBwcm92aWRlIFxyXG4gICAgICAgICAgICAvLyBhIGdyYWR1YWwgc3BlZWQgdXAgdGhhdCBmZWVscyBhIGxpdHRsZSBtb3JlIG5hdHVyYWwuXHJcbiAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBFdmVyeSBzZWNvbmQgdGhlIGRvbHBoaW4gZ2V0cyAxMCUgY2xvc2VyIHRvIGZ1bGwgc3BlZWQuXHJcbiAgICAgICAgICAgIERELm9iamVjdHMuanVua3Muc2xvdyArPSAwLjAxO1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIERldGVjdGluZyB3aGVuIHRoZSBtYXhpbXVtIHNwZWVkIGlzIHJlYWNoZWQsIHNvIHRoZSBmdW5jdGlvbiBjYW4gZW5kLlxyXG4gICAgICAgICAgICAvLyBFbmQgdGhlIGludGVydmFsIHRoYXQgaXMgY2F1c2luZyB0aGUgY2hhbmdlIGluIGRvbHBoaW4gc3BlZWQuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc3BlZWRVcCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgMTAwKTtcclxuXHJcbiAgICAvLyBSZXNldHRpbmcgdGhlIHNsb3dpbmcgZWZmZWN0IGFmdGVyIHRoZSBub3JtYWwgc3BlZWQgaXMgcmVhY2hlZCBhZ2Fpbi5cclxuICAgIERELm9iamVjdHMuanVua3Muc2xvdyA9IDAuNDtcclxuXHJcbiAgICAvKlxyXG4gICAgICogREQucGxheWVyLnNwZWVkID0gREQucGxheWVyLnNwZWVkIC8gREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgICogREQub2JqZWN0cy5qdW5rcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAqL1xyXG59XHJcblxyXG4vKipcclxuICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBzdGFyZmlzaFxyXG4gKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gcGxheWVyXHJcbiAqIEBwYXJhbSAge0dhbWUuc3ByaXRlfSBzdGFyZmlzaFxyXG4gKi9cclxuZnVuY3Rpb24gY29sbGVjdFN0YXJmaXNoKHBsYXllciwgc3RhcmZpc2gpIHtcclxuICAgIHN0YXJmaXNoLmJvZHkgPSBudWxsO1xyXG4gICAgc3RhcmZpc2guc3ByaXRlLmtpbGwoKTtcclxuICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLnBsYXkoJ2NvaW5HZXQnKTtcclxuXHJcbiAgICBpZiAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMuaW5kZXhPZihzdGFyZmlzaC5kYXRhLmlkKSA9PT0gLTEpIHtcclxuICAgICAgICBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4gKz0gMTtcclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5wdXNoKHN0YXJmaXNoLmRhdGEuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZGl0aW9uYWxseSBoYXZlIHRvIGFkZCBjb2RlIHdoaWNoIHdpbGwgcmVtb3ZlIHRoZSBvYmplY3QgZnJvbSB0aGUgZ2FtZVxyXG59XHJcblxyXG5mdW5jdGlvbiBoaXRXYXZlcygpIHtcclxuICAgIGNvbnNvbGUubG9nKCdXYXZlIGhpdCcpO1xyXG5cclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gMTAwMDtcclxuICAgIHNldFRpbWVvdXQoc3RvcEFjY2VsZXJhdGlvbiwgMTAwMCk7XHJcbiAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcEFjY2VsZXJhdGlvbigpIHtcclxuICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gMDtcclxuICAgIGNvbnNvbGUubG9nKCdTdG9wIEFjY2VsZXJhdGlvbicpO1xyXG4gICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoaXRTYW5kKCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NhbmQgaGFzIGJlZW4gaGl0Jyk7XHJcbiAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IC0xMDAwO1xyXG4gICAgc2V0VGltZW91dChzdG9wQWNjZWxlcmF0aW9uLCAxMDAwKTtcclxuICAgIERELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwbGF5TXVzaWMoKSB7XHJcbiAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZC5wbGF5KCdNdXNpYycpO1xyXG4gICAgc2V0VGltZW91dChwbGF5TXVzaWMsIDU5MDAwKTtcclxufVxyXG5cclxuLy8gRXZlcnl0aGluZyBpcyBkZWNsYXJlZDogaW5pdGlhbGl6ZSBnYW1lXHJcbkRELmdhbWUuYWN0aW9ucy5zdGFydCgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=