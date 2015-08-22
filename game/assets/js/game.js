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

var Helper = {
    getRandomIntBetween: getRandomIntBetween
};

function getRandomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (window.$ === undefined) {
    $ = require('jQuery');
    jQuery = require('jQuery');
}

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
        allSprites: [],

        spill: {
            element: null,
            collisionGroup: null,
            gradient: {
                element: null
            }
        },

        starfish: {
            amount: Helper.getRandomIntBetween(1, 4),
            elements: [],
            collectedIds: [],
            collisionGroup: null
        },

        junks: {
            amount: Helper.getRandomIntBetween(10, 15),
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
            cleaningUp: false,
            lastGeneratedPosition: 0,
            level: 1,
            interval: 2000
        },

        score: {
            text: null,
            starfish: {
                text: null,
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
var Display = {};

(function() {

    // Export functions
    Display.showElements = showElements;
    Display.hideElements = hideElements;
    Display.showMenu = showMenu;
    Display.hideAllMenus = hideAllMenus;
    Display.hideAllElements = hideAllElements;
    Display.updateHighScores = updateHighScores;

    /**
     * Show given element on screen
     * 
     * @param  {Array} elements
     */
    function showElements(elements) {
        elements.forEach(function(element) {
            element.removeClass('hidden');
        });
    }

    /**
     * Hide given elements from the screen
     * 
     * @param  {Array} elements
     */
    function hideElements(elements) {
        elements.forEach(function(element) {
            element.addClass('hidden');
        });
    }

    /**
     * Show a menu by first hiding all other menus
     * 
     * @param  {DOMElement} menu
     */
    function showMenu(menu) {
        Display.hideAllElements();
        Display.showElements([menu]);
    }

    /**
     * Hide all menus from the screen
     */
    function hideAllMenus() {
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
    }

    /**
     * Hide all elements from the screen
     */
    function hideAllElements() {
        Display.hideAllMenus();
        Display.hideElements([DisplayData.hud.element]);
    }

    /**
     * Update scores in About menu
     */
    function updateHighScores() {
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

})();

/**
 * Controls the playback of animations
 * 
 * @type {Object}
 */
var PlayAnimations = {};

(function() {
    // Export animations
    PlayAnimations.mainMenu = mainMenu;
    PlayAnimations.highScoresMenu = highScoresMenu;
    PlayAnimations.highScoresMenu2 = highScoresMenu2;
    PlayAnimations.pauseMenu = pauseMenu;
    PlayAnimations.aboutMenu = aboutMenu;
    PlayAnimations.howToPlayMenu = howToPlayMenu;
    PlayAnimations.gameOverMenu = gameOverMenu;

    // Main Menu animations
    function mainMenu() {
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
    }

    // High Scores menu animations
    function highScoresMenu() {
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
    }

    // High scores menu page 2
    function highScoresMenu2() {
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
    }

    function howToPlayMenu() {
        // Animate text
        TweenMax.from('#howToPlayMenu .text', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    }

    function aboutMenu() {
        // Animate text
        TweenMax.from('#aboutMenu .text', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    }

    // Pause Menu animations
    function pauseMenu() {
        // Animate buttons
        TweenMax.staggerFrom('#pauseMenu li', 0.3, {
            y: 75,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    }

    function gameOverMenu() {
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

})();

// vim: set expandtab ts=4 sts=4 sw=4:

(function() {

    // Export game actions and action-related functions
    DD.game.actions = {
        start: start,
        createJunks: createJunks,
        cleanUp: cleanUp,
        killSprite: killSprite,
        isVisible: isVisible,
        createStarfish: createStarfish,
        restoreSavedValues: restoreSavedValues,
        updateHighScores: updateHighScores,
        createNets: createNets,
        restart: restart,
        gameOver: gameOver
    };

    /**
     * Start game
     * 
     * Initialize the global game object
     */
    function start() {
        var w = window.innerWidth * window.devicePixelRatio;
        var h = window.innerHeight * window.devicePixelRatio;

        game = new Phaser.Game(w, h, Phaser.AUTO, 'game', {
            preload: DD.game.preload,
            create: DD.game.create,
            update: DD.game.update,
            render: DD.game.render
        });

        // game.paused = true;
    }

    /**
     * Junk generation on game.create()
     *
     * Creates a thousand junk objects and stores
     * them in DD.objects.junks.elements[]
     */
    function createJunks() {
        var currentEdge;
        var nextEdge;
        var junks = [];
        var junk;
        var i;

        for (i = 0; i < DD.objects.junks.amount; i++) {
            currentEdge = DD.player.element.x + (game.camera.width / 2) + 200;
            nextEdge = currentEdge + game.camera.width;

            // Generate random junk
            junk = game.add.sprite(
                Helper.getRandomIntBetween(currentEdge, nextEdge), // DD.player.element.x + 100, // 
                game.world.randomY,
                ['bag', 'barrel', 'boot', 'bottle', 'tyre'][Helper.getRandomIntBetween(0, 4)]
            );

            // Enable physics
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

            junks.push(junk);
        }

        DD.objects.junks.elements.push(junks);
    }

    /**
     * Starfish generation on game.create()
     *
     * Creates a thousand starfish objects and stores
     * them in DD.objects.starfish.elements[]
     */
    function createStarfish() {
        var currentEdge;
        var nextEdge;
        var starfishes = [];
        var starfish;
        var j;

        for (j = 0; j < DD.objects.starfish.amount; j++) {
            currentEdge = DD.player.element.x + (game.camera.width / 2) + 200;
            nextEdge = currentEdge + game.camera.width;

            starfish = game.add.sprite(
                Helper.getRandomIntBetween(currentEdge, nextEdge), // DD.player.element.x + 100, // 
                game.world.randomY,
                'starfish'
            );

            game.physics.p2.enable(starfish);

            // The size of the object will likely change too, if that is possible
            starfish.body.setRectangle(24, 22);
            starfish.scale.setTo(0.6, 0.6);

            // Tell the starfish to use the DD.objects.starfish.collisionGroup 
            starfish.body.setCollisionGroup(DD.objects.starfish.collisionGroup);

            // Starfishes will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            starfish.body.collides([DD.objects.starfish.collisionGroup, DD.player.collisionGroup]);
            starfish.collectionIndex = j;

            starfishes.push(starfish);
        }

        DD.objects.starfish.elements.push(starfishes);
    }

    function cleanUp() {
        if (DD.objects.junks.elements.length <= 3) {
            return;
        }

        console.log('Cleaning up');
        DD.game.world.cleaningUp = true;

        // Clean up junks
        var junksToClear = DD.objects.junks.elements.splice(0, DD.objects.junks.elements.length - 3);
        junksToClear.forEach(function(generation, i) {
            generation.forEach(function(junk, j) {
                if (junk) {
                    if ( isVisible(junk) ) { //  || junk.x >= DD.player.element.x
                        DD.objects.junks.elements[0].push(junk);
                    } else {
                        killSprite(junk);
                    }

                    generation[j] = null;
                }
            });

            junksToClear[i] = null;
        });

        // Clean up stars
        var starsToClear = DD.objects.starfish.elements.splice(0, DD.objects.starfish.elements.length - 3);
        starsToClear.forEach(function(generation, i) {
            generation.forEach(function(starfish, j) {
                if (starfish) {
                    if ( isVisible(starfish) ) { //  || junk.x >= DD.player.element.x
                        DD.objects.starfish.elements[0].push(starfish);
                    } else {
                        killSprite(starfish);
                    }

                    generation[j] = null;
                }
            });

            starsToClear[i] = null;
        });

        DD.game.world.cleaningUp = false;

        console.log('Clean up done');
    }

    function killSprite(sprite) {
        sprite.body = null;
        sprite.kill();

        if (sprite.group) {
            sprite.group.remove(sprite);
        } else if (sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
    }

    // Restore saved values from local storage
    function restoreSavedValues() {
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
    }

    function updateHighScores(score) {
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
    }

    function createNets() {
        var net;
        var underNet;
        var k;

        // Create a two hundred net objects
        for (k = 0; k < DD.objects.nets.amount; k++) {
            // For where it says 'star', i want to add a list which it will take from randomly.
            net = game.add.sprite(((k + 8) * 400), 0, 'overnet');

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
    }

    /**
     * Handle game restart
     * 
     * Reset running variables and restart game by
     * destroying current game cache and 
     * re-initializing the game
     */
    function restart() {
        DD.game.audio.GameSound.destroy();
        game.cache.removeSound('GameSound');

        // Kill off junks
        // DD.objects.junks.elements.forEach(function(junk, index) {
        //     junk.body = null;
        //     junk.kill();
        //     DD.objects.junks[index] = null;
        // });

        // Kill off starfishes
        // DD.objects.starfish.elements.forEach(function(starfish, index) {
        //     starfish.body = null;
        //     starfish.kill();
        //     DD.objects.starfish[index] = null;
        // });

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
    }

    /**
     * Handle game over
     * 
     * Ends current game and displays
     * game over menu
     */
    function gameOver() {
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
    }

    function isVisible(junk) {
        return junk.x > ( DD.player.element.x - (game.camera.width / 2) ); 
    }

})();

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
            DisplayData.hud.progressBar.element,
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

(function() {

    // Export game functions
    DD.game.preload = preload;
    DD.game.create = create;
    DD.game.update = update;
    DD.game.render = render;

    /**
     * Preload function
     * 
     * Where we register and load assets including 
     * images and sprite sheets
     */
    function preload() {
        // Setup scaling
        
        // This sets a limit on the up-scale
        // game.scale.maxWidth = 1280;
        // game.scale.maxHeight = 720;

        // Then we tell Phaser that we want it to scale up to whatever 
        // the browser can handle, but to do it proportionally
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize();

        // Backgrounds
        game.load.image('background', 'assets/images/StaticBackground.png');
        game.load.image('backgroundL1', 'assets/images/Layer1.png');
        game.load.image('backgroundL2', 'assets/images/Layer2.png');
        game.load.image('seafloor', 'assets/images/SeaFloor.png');
        game.load.image('waves', 'assets/images/waves.png');

        // Junks
        game.load.image('bag', 'assets/images/bag.png');
        game.load.image('barrel', 'assets/images/barrel.png');
        game.load.image('boot', 'assets/images/boot.png');
        game.load.image('bottle', 'assets/images/bottle.png');
        game.load.image('tyre', 'assets/images/tyre.png');
        game.load.image('overnet', 'assets/images/overnet.png');
        game.load.image('undernet', 'assets/images/undernet.png');

        // Objects
        game.load.image('crab', 'assets/images/angrycrab.png');
        game.load.image('starfish', 'assets/images/starfish.png');

        // Main characters
        game.load.image('oilspill', 'assets/images/oilback.png');
        game.load.spritesheet('dolphin', 'assets/images/new-dolphin.png', 245, 103);

        // Audio
        game.load.audio('junkImpact', 'assets/audio/yey.wav');
        game.load.audio('GameSound', 'assets/audio/GameSound.ogg');

        // Enable advanced timing for FPS counter
        game.time.advancedTiming = true;
    }

    /**
     * Create function
     * 
     * Where we create and initialize objects
     * for the game
     */
    function create() {
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
        DD.game.world.lastGeneratedPosition = DD.player.element.x;

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
            playMusic();

            DD.game.firstRun = false;
            game.paused = true;

            Display.showMenu(DisplayData.mainMenu.element);
            PlayAnimations.mainMenu();
        }
    }

    /**
     * Update function
     * 
     * The game loop - run once per frame
     */
    function update() {
        // Check for game over
        if ( dolphinIsCovered() ) {
            DD.game.actions.gameOver();
            DD.player.element.body.velocity.x = 0;

            if ( DD.objects.spill.element.x >= (game.camera.x + 500)) {
                DD.objects.spill.element.body.velocity.x = 0;
            }
        }

        // On demand generation
        if (DD.player.element.x >= DD.game.world.lastGeneratedPosition + game.camera.width + 200) {
            DD.game.actions.createJunks();
            DD.game.actions.createStarfish();
            DD.game.world.lastGeneratedPosition = DD.player.element.x;
        }

        // Cleanup 
        if (DD.objects.junks.elements.length >= 2 & !DD.game.world.cleaningUp) {
            DD.game.actions.cleanUp();
        }

        if (DD.game.modifiers.boost.active) {
            if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 1000) {

                DD.game.modifiers.total += -1 * DD.game.modifiers.boost.total;
                DD.game.modifiers.boost.active = false;

                console.log('Boost End :(');
            }
        }

        // DD.textures.waves.element.body.x = game.camera.x;
        // DD.textures.waves.element.body.y = 25;
        // DD.textures.sand.element.body.x = game.camera.x;
        // DD.textures.sand.element.body.y = 1080;

        // DD.textures.waves.element.body.angle = 0;
        // DD.textures.sand.element.body. angle = 0;

        // Governs and controls boost
        if (!DD.game.runEnd) {

            // Sets DD.game.score.lastRun based on the position of the player. 
            // The -8 compensates for the position of the player in the world
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

            if (!DD.objects.junks.active) {
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

        if (DD.game.cursors.up.isDown || isTouchingUp()) {
            if (!DD.player.accelerationActive) {
                DD.player.element.body.velocity.y = -1 * DD.player.vertSpeed;
                DD.player.element.body.angle = -1 * DD.player.angle;
            } else {
                DD.player.element.body.angle = 0;
            }
        } else if (DD.game.cursors.down.isDown || isTouchingDown()) {
            if (!DD.player.accelerationActive) {
                DD.player.element.body.angle = DD.player.angle;
                DD.player.element.body.velocity.y = DD.player.vertSpeed;
            } else {
                DD.player.element.body.angle = 0;
            }
        } else {
            DD.player.element.body.angle = 0;
        }
    }

    /**
     * Render function
     */
    function render() {
        game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');

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
    }

    /**
     * Detect if oilspill is covering Dolphin
     * 
     * @return {Boolean}
     */
    function dolphinIsCovered() {
        if ((DD.objects.spill.element.x - DD.player.element.x) > -750) {
            return true;
        }

        return false;
    }

    /**
     * Detect touch input in upper right half of screen
     * for both pointer1 (first finger) & pointer2 (second finger)
     * 
     * @return {Boolean}
     */
    function isTouchingUp() {
        if (
            (game.input.pointer1.isDown && game.input.pointer1.x > 780 && game.input.pointer1.y < 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 780 && game.input.pointer2.y < 360)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Detect touch input in lower right half of screen
     * for both pointer1 (first finger) & pointer2 (second finger)
     * 
     * @return {Boolean}
     */
    function isTouchingDown() {
        if (
            (game.input.pointer1.isDown && game.input.pointer1.x > 780 && game.input.pointer1.y > 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x > 780 && game.input.pointer2.y > 360)
        ) {
            return true;
        }

        return false;
    }

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
    }

    /**
     * Handle player collision with waves
     */
    function hitWaves() {
        console.log('Wave hit');

        DD.player.element.body.gravity.y = 1000;
        setTimeout(stopAcceleration, 1000);
        DD.player.accelerationActive = true;
    }

    /**
     * Handle player collision with starfish
     * @param  {Game.sprite} player
     * @param  {Game.sprite} starfish
     */
    function collectStarfish(player, starfish) {
        DD.game.audio.GameSound.play('coinGet');
        
        var id = starfish.data.id;
        DD.game.actions.killSprite(starfish.sprite);

        if (DD.objects.starfish.collectedIds.indexOf(id) === -1) {
            DD.game.score.starfish.lastRun += 1;
            DD.objects.starfish.collectedIds.push(id);
        }

        starfish = null;
    }

    /**
     * Stop player's bounce acceleration
     * after colliding with waves
     */
    function stopAcceleration() {
        DD.player.element.body.gravity.y = 0;
        console.log('Stop Acceleration');
        DD.player.accelerationActive = false;
    }

    /**
     * Handle player collision with sand
     */
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
    
})();

// Restore persisted values from local storage
DD.game.actions.restoreSavedValues();

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlZ2lzdGVyIEFycmF5LmdldFVuaXF1ZSgpXHJcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIGwgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciByID0gW107XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xyXG4gICAgICAgIG9bdGhpc1tpXV0gPSB0aGlzW2ldO1xyXG4gICAgfSBcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG4gICAgICAgIHIucHVzaChvW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG52YXIgSGVscGVyID0ge1xyXG4gICAgZ2V0UmFuZG9tSW50QmV0d2VlbjogZ2V0UmFuZG9tSW50QmV0d2VlblxyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50QmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn1cclxuXHJcbmlmICh3aW5kb3cuJCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAkID0gcmVxdWlyZSgnalF1ZXJ5Jyk7XHJcbiAgICBqUXVlcnkgPSByZXF1aXJlKCdqUXVlcnknKTtcclxufVxyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG4ndXNlIHN0cmljdCc7IC8vIFNob3dzIGFsbCBlcnJvcnMgYW5kIHdhcm5pbmdzXHJcblxyXG4vKipcclxuICogR2xvYmFsIEREIG9iamVjdFxyXG4gKiBcclxuICogQ29udGFpbnMgZ2FtZSBzdGF0ZSBpbmRlcGVuZGVudCBvZiBQaGFzZXJcclxuICovXHJcbnZhciBERCA9IHtcclxuICAgIHZlcnNpb246ICcwLjEuMCcsXHJcblxyXG4gICAgb2JqZWN0czoge1xyXG4gICAgICAgIGFsbFNwcml0ZXM6IFtdLFxyXG5cclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgZ3JhZGllbnQ6IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMSwgNCksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGVjdGVkSWRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBqdW5rczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDEwLCAxNSksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgc2xvdzogMC40LFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5ldHM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAyMDAsXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdGV4dHVyZXM6IHtcclxuICAgICAgICBsYXllckE6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJCOiBudWxsLFxyXG4gICAgICAgIGxheWVyQzogbnVsbCxcclxuICAgICAgICB3YXZlczoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2FuZDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3BlZWQ6IDUwXHJcbiAgICB9LFxyXG5cclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIGFjY2VsZXJhdGlvbkFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgc3BlZWQ6IDMwMCxcclxuICAgICAgICB2ZXJ0U3BlZWQ6IDMwMCxcclxuICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsLFxyXG4gICAgICAgIGFuZ2xlOiAyMFxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZ2FtZU92ZXJDYWxsZWQ6IGZhbHNlLFxyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgY2xlYW5pbmdVcDogZmFsc2UsXHJcbiAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRQb3NpdGlvbjogMCxcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgdGV4dDogbnVsbCxcclxuICAgICAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXM6IFtdXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiAwLFxyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDFcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IDFcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhdWRpbzoge1xyXG4gICAgICAgICAgICBqdW5rQ29sbGlkZTogbnVsbCxcclxuICAgICAgICAgICAgR2FtZVNvdW5kOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gSnVzdCBhIGZyaWVuZGx5IHJlbWluZGVyXHJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgREQudmVyc2lvbik7XHJcblxyXG4vLyBHbG9iYWwgZ2FtZSBvYmplY3RcclxudmFyIGdhbWU7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vKipcclxuICogSG9sZHMgcmVmZXJlbmNlcyB0byBhbGwgb24tc2NyZWVuIGVsZW1lbnRzXHJcbiAqIChleHRlcmFsIHRvIFBoYXNlcilcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheURhdGEgPSB7XHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2dhbWUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBodWQ6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaHVkJyksXHJcbiAgICAgICAgc2NvcmU6ICQoJyNodWQtc2NvcmUnKSxcclxuICAgICAgICBzdGFyZmlzaDogJCgnI2h1ZC1zdGFyZmlzaCcpLFxyXG4gICAgICAgIHBhdXNlQnRuOiAkKCcjaHVkLXBhdXNlQnRuJyksXHJcbiAgICAgICAgcHJvZ3Jlc3NCYXI6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2h1ZC1wcm9ncmVzc2JhcicpLFxyXG4gICAgICAgICAgICBzcGlsbDogJCgnI2h1ZC1wcm9ncmVzc2Jhci1vaWxzcGlsbCcpLFxyXG4gICAgICAgICAgICBkb2xwaGluOiAkKCcjaHVkLXByb2dyZXNzYmFyLWRvbHBoaW4nKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgbWFpbk1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXdHYW1lQnRuOiAkKCcjbWFpbk1lbnUtbmV3R2FtZScpLFxyXG4gICAgICAgIGhpZ2hTY29yZXNCdG46ICQoJyNtYWluTWVudS1oaWdoU2NvcmVzJyksXHJcbiAgICAgICAgaG93VG9QbGF5QnRuOiAkKCcjbWFpbk1lbnUtaG93VG9QbGF5JyksXHJcbiAgICAgICAgYWJvdXRCdG46ICQoJyNtYWluTWVudS1hYm91dCcpXHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hTY29yZXNNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hpZ2hTY29yZXNNZW51JyksXHJcbiAgICAgICAgbGlzdDogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QnKSxcclxuICAgICAgICBsaXN0UGFnZTI6ICQoJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1tYWluTWVudScpLFxyXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1wcmV2LXBhZ2UxQnRuJyksXHJcblxyXG4gICAgICAgIHBhZ2UxOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTEnKSxcclxuICAgICAgICBwYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LXBhZ2UyJylcclxuICAgIH0sXHJcblxyXG4gICAgaG93VG9QbGF5TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNob3dUb1BsYXlNZW51JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNob3dUb1BsYXlNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaG93VG9QbGF5TWVudS1uZXh0LXBhZ2UyQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UxQnRuOiAkKCcjaG93VG9QbGF5TWVudS1wcmV2LXBhZ2UxQnRuJyksXHJcbiAgICAgICAgbmV4dFBhZ2UzQnRuOiAkKCcjaG93VG9QbGF5TWVudS1uZXh0LXBhZ2UzQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UyQnRuOiAkKCcjaG93VG9QbGF5TWVudS1wcmV2LXBhZ2UyQnRuJyksXHJcblxyXG4gICAgICAgIHBhZ2UxOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMicpLFxyXG4gICAgICAgIHBhZ2UzOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMycpXHJcbiAgICB9LFxyXG5cclxuICAgIGFib3V0TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNhYm91dE1lbnUnKSxcclxuICAgICAgICB2ZXJzaW9uOiAkKCcjYWJvdXRNZW51LXZlcnNpb24nKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2Fib3V0TWVudS1tYWluTWVudScpXHJcbiAgICB9LFxyXG5cclxuICAgIHBhdXNlTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNwYXVzZU1lbnUnKSxcclxuICAgICAgICBvdmVybGF5OiAkKCcjcGF1c2VNZW51IC5vdmVybGF5JyksXHJcbiAgICAgICAgcmVzdW1lQnRuOiAkKCcjcGF1c2VNZW51LXJlc3VtZScpLFxyXG4gICAgICAgIHJlc3RhcnRCdG46ICQoJyNwYXVzZU1lbnUtcmVzdGFydCcpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjcGF1c2VNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZU92ZXJNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNnYW1lT3Zlck1lbnUgLm92ZXJsYXknKSxcclxuXHJcbiAgICAgICAgaGlnaFNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzY29yZToge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1zY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2gnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXN0YXJmaXNoIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGxheUFnYWluQnRuOiAkKCcjZ2FtZU92ZXJNZW51LXBsYXlBZ2FpbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjZ2FtZU92ZXJNZW51LW1haW5NZW51JylcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5IGFuZCBtZW51cyBtYW5pcHVsYXRpb25cclxuICogb2JqZWN0XHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIERpc3BsYXkgPSB7fTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZnVuY3Rpb25zXHJcbiAgICBEaXNwbGF5LnNob3dFbGVtZW50cyA9IHNob3dFbGVtZW50cztcclxuICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzID0gaGlkZUVsZW1lbnRzO1xyXG4gICAgRGlzcGxheS5zaG93TWVudSA9IHNob3dNZW51O1xyXG4gICAgRGlzcGxheS5oaWRlQWxsTWVudXMgPSBoaWRlQWxsTWVudXM7XHJcbiAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cyA9IGhpZGVBbGxFbGVtZW50cztcclxuICAgIERpc3BsYXkudXBkYXRlSGlnaFNjb3JlcyA9IHVwZGF0ZUhpZ2hTY29yZXM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGdpdmVuIGVsZW1lbnQgb24gc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzaG93RWxlbWVudHMoZWxlbWVudHMpIHtcclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGdpdmVuIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGlkZUVsZW1lbnRzKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBhIG1lbnUgYnkgZmlyc3QgaGlkaW5nIGFsbCBvdGhlciBtZW51c1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtET01FbGVtZW50fSBtZW51XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNob3dNZW51KG1lbnUpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxFbGVtZW50cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFttZW51XSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBtZW51cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGlkZUFsbE1lbnVzKCkge1xyXG4gICAgICAgIHZhciBtZW51cyA9IFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCwgXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuYWJvdXRNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuZWxlbWVudFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIG1lbnVzLmZvckVhY2goZnVuY3Rpb24obWVudSkge1xyXG4gICAgICAgICAgICBtZW51LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaWRlQWxsRWxlbWVudHMoKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnRdKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSBzY29yZXMgaW4gQWJvdXQgbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIaWdoU2NvcmVzKCkge1xyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzID0gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnVuaXF1ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNvcnQgc2NvcmVzXHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIEhUTUwgZm9yIHNjb3Jlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2ldICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMSlcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3QpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuICAgICAgICBmb3IgKHZhciBqID0gNTsgaiA8IDEwOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSkge1xyXG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tqXSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDIpXHJcbiAgICAgICAgaWYgKGhpZ2hTY29yZXNIdG1sLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lmxpc3RQYWdlMikuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiLyoqXHJcbiAqIENvbnRyb2xzIHRoZSBwbGF5YmFjayBvZiBhbmltYXRpb25zXHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIFBsYXlBbmltYXRpb25zID0ge307XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBFeHBvcnQgYW5pbWF0aW9uc1xyXG4gICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUgPSBtYWluTWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51ID0gaGlnaFNjb3Jlc01lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudTIgPSBoaWdoU2NvcmVzTWVudTI7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5wYXVzZU1lbnUgPSBwYXVzZU1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5hYm91dE1lbnUgPSBhYm91dE1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51ID0gaG93VG9QbGF5TWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmdhbWVPdmVyTWVudSA9IGdhbWVPdmVyTWVudTtcclxuXHJcbiAgICAvLyBNYWluIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI21haW5NZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC42LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjbWFpbk1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnUgYW5pbWF0aW9uc1xyXG4gICAgZnVuY3Rpb24gaGlnaFNjb3Jlc01lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBzY29yZXNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LWxpc3QgZGl2JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGlnaCBzY29yZXMgbWVudSBwYWdlIDJcclxuICAgIGZ1bmN0aW9uIGhpZ2hTY29yZXNNZW51MigpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHNjb3Jlc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdC1wYWdlMiBkaXYnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LXBhZ2UyIGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBob3dUb1BsYXlNZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgdGV4dFxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNob3dUb1BsYXlNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhYm91dE1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2Fib3V0TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGF1c2UgTWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBwYXVzZU1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNwYXVzZU1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogNzUsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2FtZU92ZXJNZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNnYW1lT3Zlck1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNnYW1lT3Zlck1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZ2FtZSBhY3Rpb25zIGFuZCBhY3Rpb24tcmVsYXRlZCBmdW5jdGlvbnNcclxuICAgIERELmdhbWUuYWN0aW9ucyA9IHtcclxuICAgICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgICAgY3JlYXRlSnVua3M6IGNyZWF0ZUp1bmtzLFxyXG4gICAgICAgIGNsZWFuVXA6IGNsZWFuVXAsXHJcbiAgICAgICAga2lsbFNwcml0ZToga2lsbFNwcml0ZSxcclxuICAgICAgICBpc1Zpc2libGU6IGlzVmlzaWJsZSxcclxuICAgICAgICBjcmVhdGVTdGFyZmlzaDogY3JlYXRlU3RhcmZpc2gsXHJcbiAgICAgICAgcmVzdG9yZVNhdmVkVmFsdWVzOiByZXN0b3JlU2F2ZWRWYWx1ZXMsXHJcbiAgICAgICAgdXBkYXRlSGlnaFNjb3JlczogdXBkYXRlSGlnaFNjb3JlcyxcclxuICAgICAgICBjcmVhdGVOZXRzOiBjcmVhdGVOZXRzLFxyXG4gICAgICAgIHJlc3RhcnQ6IHJlc3RhcnQsXHJcbiAgICAgICAgZ2FtZU92ZXI6IGdhbWVPdmVyXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgZ2FtZVxyXG4gICAgICogXHJcbiAgICAgKiBJbml0aWFsaXplIHRoZSBnbG9iYWwgZ2FtZSBvYmplY3RcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XHJcbiAgICAgICAgdmFyIHcgPSB3aW5kb3cuaW5uZXJXaWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIHZhciBoID0gd2luZG93LmlubmVySGVpZ2h0ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XHJcblxyXG4gICAgICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUodywgaCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xyXG4gICAgICAgICAgICBwcmVsb2FkOiBERC5nYW1lLnByZWxvYWQsXHJcbiAgICAgICAgICAgIGNyZWF0ZTogREQuZ2FtZS5jcmVhdGUsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogREQuZ2FtZS51cGRhdGUsXHJcbiAgICAgICAgICAgIHJlbmRlcjogREQuZ2FtZS5yZW5kZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSnVuayBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuICAgICAqXHJcbiAgICAgKiBDcmVhdGVzIGEgdGhvdXNhbmQganVuayBvYmplY3RzIGFuZCBzdG9yZXNcclxuICAgICAqIHRoZW0gaW4gREQub2JqZWN0cy5qdW5rcy5lbGVtZW50c1tdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUp1bmtzKCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50RWRnZTtcclxuICAgICAgICB2YXIgbmV4dEVkZ2U7XHJcbiAgICAgICAgdmFyIGp1bmtzID0gW107XHJcbiAgICAgICAgdmFyIGp1bms7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBERC5vYmplY3RzLmp1bmtzLmFtb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gREQucGxheWVyLmVsZW1lbnQueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgMjAwO1xyXG4gICAgICAgICAgICBuZXh0RWRnZSA9IGN1cnJlbnRFZGdlICsgZ2FtZS5jYW1lcmEud2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSByYW5kb20ganVua1xyXG4gICAgICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICBbJ2JhZycsICdiYXJyZWwnLCAnYm9vdCcsICdib3R0bGUnLCAndHlyZSddW0hlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDAsIDQpXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIHBoeXNpY3NcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcbiAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC41LCAwLjUpO1xyXG5cclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVua3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcmZpc2ggZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcbiAgICAgKlxyXG4gICAgICogQ3JlYXRlcyBhIHRob3VzYW5kIHN0YXJmaXNoIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhcmZpc2goKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgc3RhcmZpc2hlcyA9IFtdO1xyXG4gICAgICAgIHZhciBzdGFyZmlzaDtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnc3RhcmZpc2gnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHN0YXJmaXNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBzdGFyZmlzaC5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBzdGFyZmlzaCB0byB1c2UgdGhlIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFyZmlzaGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAgICAgc3RhcmZpc2guY29sbGVjdGlvbkluZGV4ID0gajtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoZXMucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLnB1c2goc3RhcmZpc2hlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW5VcCgpIHtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPD0gMykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ2xlYW5pbmcgdXAnKTtcclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBDbGVhbiB1cCBqdW5rc1xyXG4gICAgICAgIHZhciBqdW5rc1RvQ2xlYXIgPSBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnNwbGljZSgwLCBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgIGp1bmtzVG9DbGVhci5mb3JFYWNoKGZ1bmN0aW9uKGdlbmVyYXRpb24sIGkpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGp1bmssIGopIHtcclxuICAgICAgICAgICAgICAgIGlmIChqdW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpc1Zpc2libGUoanVuaykgKSB7IC8vICB8fCBqdW5rLnggPj0gREQucGxheWVyLmVsZW1lbnQueFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzWzBdLnB1c2goanVuayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2lsbFNwcml0ZShqdW5rKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25bal0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzVG9DbGVhcltpXSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIHN0YXJzXHJcbiAgICAgICAgdmFyIHN0YXJzVG9DbGVhciA9IERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMuc3BsaWNlKDAsIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgc3RhcnNUb0NsZWFyLmZvckVhY2goZnVuY3Rpb24oZ2VuZXJhdGlvbiwgaSkge1xyXG4gICAgICAgICAgICBnZW5lcmF0aW9uLmZvckVhY2goZnVuY3Rpb24oc3RhcmZpc2gsIGopIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFyZmlzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaXNWaXNpYmxlKHN0YXJmaXNoKSApIHsgLy8gIHx8IGp1bmsueCA+PSBERC5wbGF5ZXIuZWxlbWVudC54XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHNbMF0ucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2lsbFNwcml0ZShzdGFyZmlzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uW2pdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzdGFyc1RvQ2xlYXJbaV0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NsZWFuIHVwIGRvbmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBraWxsU3ByaXRlKHNwcml0ZSkge1xyXG4gICAgICAgIHNwcml0ZS5ib2R5ID0gbnVsbDtcclxuICAgICAgICBzcHJpdGUua2lsbCgpO1xyXG5cclxuICAgICAgICBpZiAoc3ByaXRlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHNwcml0ZS5ncm91cC5yZW1vdmUoc3ByaXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNwcml0ZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXN0b3JlIHNhdmVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgIGZ1bmN0aW9uIHJlc3RvcmVTYXZlZFZhbHVlcygpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIaWdoU2NvcmVzKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoID0gc2NvcmUuc3RhcmZpc2ggKyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdzdGFyZmlzaCcsIHN0YXJmaXNoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVOZXRzKCkge1xyXG4gICAgICAgIHZhciBuZXQ7XHJcbiAgICAgICAgdmFyIHVuZGVyTmV0O1xyXG4gICAgICAgIHZhciBrO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgYSB0d28gaHVuZHJlZCBuZXQgb2JqZWN0c1xyXG4gICAgICAgIGZvciAoayA9IDA7IGsgPCBERC5vYmplY3RzLm5ldHMuYW1vdW50OyBrKyspIHtcclxuICAgICAgICAgICAgLy8gRm9yIHdoZXJlIGl0IHNheXMgJ3N0YXInLCBpIHdhbnQgdG8gYWRkIGEgbGlzdCB3aGljaCBpdCB3aWxsIHRha2UgZnJvbSByYW5kb21seS5cclxuICAgICAgICAgICAgbmV0ID0gZ2FtZS5hZGQuc3ByaXRlKCgoayArIDgpICogNDAwKSwgMCwgJ292ZXJuZXQnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG5ldC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gbmV0LnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUobmV0KTtcclxuXHJcbiAgICAgICAgICAgIHVuZGVyTmV0ID0gZ2FtZS5hZGQuc3ByaXRlKG5ldC5ib2R5LngsIG5ldC5ib2R5LnksICd1bmRlcm5ldCcpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgbmV0IHRvIHVzZSB0aGUgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBuZXQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gbmV0cyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgbmV0LmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIHJlc3RhcnRcclxuICAgICAqIFxyXG4gICAgICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZSBieVxyXG4gICAgICogZGVzdHJveWluZyBjdXJyZW50IGdhbWUgY2FjaGUgYW5kIFxyXG4gICAgICogcmUtaW5pdGlhbGl6aW5nIHRoZSBnYW1lXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlc3RhcnQoKSB7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUuY2FjaGUucmVtb3ZlU291bmQoJ0dhbWVTb3VuZCcpO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAvLyAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBzdGFyZmlzaGVzXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXJmaXNoLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBzdGFyZmlzaC5ib2R5ID0gbnVsbDtcclxuICAgICAgICAvLyAgICAgc3RhcmZpc2gua2lsbCgpO1xyXG4gICAgICAgIC8vICAgICBERC5vYmplY3RzLnN0YXJmaXNoW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGp1bmtzIGFuZCBzdGFyZmlzaCBhcnJheXNcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IDA7XHJcblxyXG4gICAgICAgIGdhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICAgICAqIFxyXG4gICAgICogRW5kcyBjdXJyZW50IGdhbWUgYW5kIGRpc3BsYXlzXHJcbiAgICAgKiBnYW1lIG92ZXIgbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgICAgICB2YXIgbmV3SGlnaGVzdFNjb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zdGFyZmlzaC5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCBnYW1lT3ZlcigpIGZyb20gYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1Zpc2libGUoanVuaykge1xyXG4gICAgICAgIHJldHVybiBqdW5rLnggPiAoIERELnBsYXllci5lbGVtZW50LnggLSAoZ2FtZS5jYW1lcmEud2lkdGggLyAyKSApOyBcclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0blxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIaWdoIFNjb3JlcyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaGlnaFNjb3Jlc0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIb3cgdG8gUGxheSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaG93VG9QbGF5QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBBYm91dCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuYWJvdXRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuYWJvdXRNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmFib3V0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IG5leHQgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5uZXh0UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucHJldlBhZ2UxQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBhbmQgcHJldiBQYWdlIDIgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubmV4dFBhZ2UyQnRuKS5hZGQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgUGFnZSAzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlM0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBYm91dCBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5hYm91dE1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IGJhY2tncm91bmQgb3ZlcmxheVxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUub3ZlcmxheSkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN1bWUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN1bWVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdGFydCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3RhcnRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIG92ZXIgbWVudTogUGxheSBhZ2FpbiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnBsYXlBZ2FpbkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICAvLyBTaG93IEhVRCBhbmQgcGF1c2UgYnV0dG9uXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LCBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgLy8gUmVzdGFydCBnYW1lXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XHJcbiAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGdhbWVcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBPdmVyIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIEZpcnN0IHJ1biB3aWxsIHNob3cgTWFpbiBNZW51IGFuZCBwbGF5IGl0cyBhbmltYXRpb25cclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG5cclxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhVRDogUGF1c2UgYnV0dG9uOiBoYW5kbGVzIHBhdXNlIGFjdGl2YXRpb25cclxuICAgICAqIFxyXG4gICAgICogT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIFxyXG4gICAgICogdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkXHJcbiAgICAgKi9cclxuICAgICQoRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5wYXVzZU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxufSk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gRXhwb3J0IGdhbWUgZnVuY3Rpb25zXHJcbiAgICBERC5nYW1lLnByZWxvYWQgPSBwcmVsb2FkO1xyXG4gICAgREQuZ2FtZS5jcmVhdGUgPSBjcmVhdGU7XHJcbiAgICBERC5nYW1lLnVwZGF0ZSA9IHVwZGF0ZTtcclxuICAgIERELmdhbWUucmVuZGVyID0gcmVuZGVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJlbG9hZCBmdW5jdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHMgaW5jbHVkaW5nIFxyXG4gICAgICogaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICAgICAgLy8gU2V0dXAgc2NhbGluZ1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRoaXMgc2V0cyBhIGxpbWl0IG9uIHRoZSB1cC1zY2FsZVxyXG4gICAgICAgIC8vIGdhbWUuc2NhbGUubWF4V2lkdGggPSAxMjgwO1xyXG4gICAgICAgIC8vIGdhbWUuc2NhbGUubWF4SGVpZ2h0ID0gNzIwO1xyXG5cclxuICAgICAgICAvLyBUaGVuIHdlIHRlbGwgUGhhc2VyIHRoYXQgd2Ugd2FudCBpdCB0byBzY2FsZSB1cCB0byB3aGF0ZXZlciBcclxuICAgICAgICAvLyB0aGUgYnJvd3NlciBjYW4gaGFuZGxlLCBidXQgdG8gZG8gaXQgcHJvcG9ydGlvbmFsbHlcclxuICAgICAgICBnYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XHJcbiAgICAgICAgZ2FtZS5zY2FsZS5zZXRTY3JlZW5TaXplKCk7XHJcblxyXG4gICAgICAgIC8vIEJhY2tncm91bmRzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJ2Fzc2V0cy9pbWFnZXMvU3RhdGljQmFja2dyb3VuZC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICdhc3NldHMvaW1hZ2VzL0xheWVyMS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICdhc3NldHMvaW1hZ2VzL0xheWVyMi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJ2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd3YXZlcycsICdhc3NldHMvaW1hZ2VzL3dhdmVzLnBuZycpO1xyXG5cclxuICAgICAgICAvLyBKdW5rc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFnJywgJ2Fzc2V0cy9pbWFnZXMvYmFnLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFycmVsJywgJ2Fzc2V0cy9pbWFnZXMvYmFycmVsLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYm9vdCcsICdhc3NldHMvaW1hZ2VzL2Jvb3QucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib3R0bGUnLCAnYXNzZXRzL2ltYWdlcy9ib3R0bGUucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd0eXJlJywgJ2Fzc2V0cy9pbWFnZXMvdHlyZS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ292ZXJuZXQnLCAnYXNzZXRzL2ltYWdlcy9vdmVybmV0LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgndW5kZXJuZXQnLCAnYXNzZXRzL2ltYWdlcy91bmRlcm5ldC5wbmcnKTtcclxuXHJcbiAgICAgICAgLy8gT2JqZWN0c1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnY3JhYicsICdhc3NldHMvaW1hZ2VzL2FuZ3J5Y3JhYi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXJmaXNoJywgJ2Fzc2V0cy9pbWFnZXMvc3RhcmZpc2gucG5nJyk7XHJcblxyXG4gICAgICAgIC8vIE1haW4gY2hhcmFjdGVyc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnYXNzZXRzL2ltYWdlcy9vaWxiYWNrLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZG9scGhpbicsICdhc3NldHMvaW1hZ2VzL25ldy1kb2xwaGluLnBuZycsIDI0NSwgMTAzKTtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9cclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ2p1bmtJbXBhY3QnLCAnYXNzZXRzL2F1ZGlvL3lleS53YXYnKTtcclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ0dhbWVTb3VuZCcsICdhc3NldHMvYXVkaW8vR2FtZVNvdW5kLm9nZycpO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgYWR2YW5jZWQgdGltaW5nIGZvciBGUFMgY291bnRlclxyXG4gICAgICAgIGdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICAgICAqIGZvciB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAgICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc3BhcmVuY3kgb2YgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYWxwaGEgPSAxO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBiYWNrZ3JvdW5kIGxheWVycyBpbW11bmUgdG8gY29sbGlzaW9uc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBBZGQgcGxheWVyXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAgICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnQgYW5kIGVuYWJsZSBQaHlzaWNzXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDE2MDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy8gV2F2ZXNcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICd3YXZlcycpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFNhbmRcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMCwgMTA4MCwgJ3dhdmVzJyk7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5hbHBoYSA9IDA7XHJcblxyXG4gICAgICAgIC8vIFNvdW5kIHN0dWZmXHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQgPSBnYW1lLmFkZC5hdWRpbygnR2FtZVNvdW5kJyk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQuYWxsb3dNdWx0aXBsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLmFkZE1hcmtlcignanVua0hpdCcsIDAuNDgsIDAuMik7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQuYWRkTWFya2VyKCdjb2luR2V0JywgMC4yLCAwLjIpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uR2FtZVNvdW5kLmFkZE1hcmtlcignTXVzaWMnLCAxLjcsIDU5LjApO1xyXG5cclxuICAgICAgICAvLyBQbGF5ZXIgYW5pbWF0aW9uc1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFswLCAxLCAyLCAzLCA0XSwgMTAsIHRydWUpO1xyXG4gICAgICAgIC8vIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdjb2xsaWRlJywgWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdLCAxMDAsIHRydWUpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgY29sbGlzaW9uIGdyb3Vwc1xyXG4gICAgICAgIERELnBsYXllci5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgICAgICAvLyBUaGlzIHBhcnQgaXMgdml0YWwgaWYgeW91IHdhbnQgdGhlIG9iamVjdHMgd2l0aCB0aGVpciBvd24gY29sbGlzaW9uIGdyb3VwcyB0byBzdGlsbCBcclxuICAgICAgICAvLyBDb2xsaWRlIHdpdGggdGhlIHdvcmxkIGJvdW5kcyAod2hpY2ggd2UgZG8pXHJcbiAgICAgICAgLy8gV2hhdCB0aGlzIGRvZXMgaXMgYWRqdXN0IHRoZSBib3VuZHMgdG8gdXNlIGl0cyBvd24gY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi51cGRhdGVCb3VuZHNDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBqdW5rcyBhbmQgc3RhcmZpc2hlc1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVTdGFyZmlzaCgpO1xyXG4gICAgICAgIERELmdhbWUud29ybGQubGFzdEdlbmVyYXRlZFBvc2l0aW9uID0gREQucGxheWVyLmVsZW1lbnQueDtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgY29sbGlzaW9uc1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQucGxheWVyLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG5cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXAsIGp1bmtIaXQsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQuZ2FtZS5hY3Rpb25zLmdhbWVPdmVyLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAsIGNvbGxlY3RTdGFyZmlzaCwgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgaGl0V2F2ZXMsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCwgaGl0U2FuZCwgdGhpcyk7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIGtleWJvYXJkIGNvbnRyb2xzXHJcbiAgICAgICAgREQuZ2FtZS5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIGNhbWVyYVxyXG4gICAgICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhERC5wbGF5ZXIuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFBhdXNlIGFuZCBzaG93IE1haW4gTWVudSBvbiBmaXJzdCBydW5cclxuICAgICAgICBpZiAoREQuZ2FtZS5maXJzdFJ1bikge1xyXG4gICAgICAgICAgICBwbGF5TXVzaWMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgICAgIGlmICggZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT24gZGVtYW5kIGdlbmVyYXRpb25cclxuICAgICAgICBpZiAoREQucGxheWVyLmVsZW1lbnQueCA+PSBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiArIGdhbWUuY2FtZXJhLndpZHRoICsgMjAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlU3RhcmZpc2goKTtcclxuICAgICAgICAgICAgREQuZ2FtZS53b3JsZC5sYXN0R2VuZXJhdGVkUG9zaXRpb24gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2xlYW51cCBcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPj0gMiAmICFERC5nYW1lLndvcmxkLmNsZWFuaW5nVXApIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNsZWFuVXAoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgaWYgKChERC5wbGF5ZXIuZWxlbWVudC54IC0gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4pID49IDEwMDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSAtMSAqIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLng7XHJcbiAgICAgICAgLy8gREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnkgPSAyNTtcclxuICAgICAgICAvLyBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS54ID0gZ2FtZS5jYW1lcmEueDtcclxuICAgICAgICAvLyBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS55ID0gMTA4MDtcclxuXHJcbiAgICAgICAgLy8gREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICAvLyBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS4gYW5nbGUgPSAwO1xyXG5cclxuICAgICAgICAvLyBHb3Zlcm5zIGFuZCBjb250cm9scyBib29zdFxyXG4gICAgICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiBcclxuICAgICAgICAgICAgLy8gVGhlIC04IGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNDAwKSAtIDgpICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gcGFyc2VJbnQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAxMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ICogNTAwICkgLyAxOTIwMDAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbmltYXA6IHVwZGF0ZSBkb2xwaGluIHhcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmRvbHBoaW4uY3NzKFxyXG4gICAgICAgICAgICAgICAgJ2xlZnQnLCAoIChERC5wbGF5ZXIuZWxlbWVudC54ICogNDkyICkgLyAxOTIwMDAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluaW1hcDogVXBkYXRlIGRvbHBoaW4geVxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXHJcbiAgICAgICAgICAgICAgICAndG9wJywgKCAoREQucGxheWVyLmVsZW1lbnQueSAqIDIwKSAvIDEwODAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCArICgzMCAqIERELmdhbWUud29ybGQubGV2ZWwpICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIG9pbHNwaWxsIHZlbG9jaXR5XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAzNTA7XHJcblxyXG4gICAgICAgICAgICBpZiAoIURELm9iamVjdHMuanVua3MuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuYm9keS54ID49IChERC5nYW1lLndvcmxkLmludGVydmFsICogREQuZ2FtZS53b3JsZC5sZXZlbCkpIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUud29ybGQubGV2ZWwgPCAxOSkge1xyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCArPSAxO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xldmVsIChzcGVlZCkgdXAhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuY2hhcmdlcyArPSAtMTtcclxuICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsO1xyXG5cclxuICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBpc1RvdWNoaW5nVXAoKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChERC5nYW1lLmN1cnNvcnMuZG93bi5pc0Rvd24gfHwgaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGdhbWUuZGVidWcudGV4dChnYW1lLnRpbWUuZnBzIHx8ICctLScsIDIsIDE0LCAnIzAwZmYwMCcpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2NvcmVcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSBERC5nYW1lLnNjb3JlLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc3RhcmZpc2hcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCAhPT0gREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IGlmIG9pbHNwaWxsIGlzIGNvdmVyaW5nIERvbHBoaW5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZG9scGhpbklzQ292ZXJlZCgpIHtcclxuICAgICAgICBpZiAoKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC0gREQucGxheWVyLmVsZW1lbnQueCkgPiAtNzUwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1RvdWNoaW5nVXAoKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDM2MCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPCAzNjApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIGxvd2VyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1RvdWNoaW5nRG93bigpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55ID4gMzYwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA+IDM2MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICAgICAqL1xyXG4gICAgLy8gZnVuY3Rpb24ganVua0hpdCgpIHtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZygnSnVuayBoaXQhJyk7XHJcblxyXG4gICAgLy8gICAgIC8vIFNvdW5kIHN0dWZmXHJcbiAgICAvLyAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCdjb2xsaWRlJyk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgLy8gICAgIGlmICghREQub2JqZWN0cy5qdW5rcy5hY3RpdmUpIHtcclxuICAgIC8vICAgICAgICAgREQucGxheWVyLnNwZWVkID0gREQucGxheWVyLnNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgLy8gICAgICAgICBERC5vYmplY3RzLmp1bmtzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAvLyAgICAgICAgIHNldFRpbWVvdXQocmVnYWluU3BlZWQsIDMwMDApO1xyXG4gICAgLy8gICAgIH0gIFxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5jcmVhc2UgcGxheWVyIHNwZWVkIGFmdGVyXHJcbiAgICAgKiBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGp1bmtIaXQoKSB7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5HYW1lU291bmQucGxheSgnanVua0hpdCcpO1xyXG5cclxuICAgICAgICAvLyBUaGUgc3BlZWQgdGhhdCB0aGUgcGxheWVyIHNob3VsZCBiZSB0cmF2ZWxsaW5nIGF0IGlzIHN0b3JlZCwgXHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbiBiZWxvdyB3aWxsIHNsb3cgZG93biByYXRoZXIgdGhhbiBzcGVlZCB1cC5cclxuICAgICAgICB2YXIgb3JpZ2luYWxTcGVlZCA9IERELnBsYXllci5zcGVlZDtcclxuXHJcbiAgICAgICAgLy8gU2V0dGluZyBhIHNsb3cgc3BlZWQgc3RyYWlnaHQgYXdheSBzbyBpdCBkb2Vzbid0IGZlZWwgbGFnZ3lcclxuICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBvcmlnaW5hbFNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG5cclxuICAgICAgICAvLyBzZXRJbnRlcnZhbCBtZWFucyB0aGF0IEkgY2FuIHBlcmZvcm0gdGhpcyBvdmVyIHNvbWUgdGltZSBcclxuICAgICAgICAvLyBhbmQgZ3JhZHVhbGx5IHdpdGhvdXQgdXNpbmcgUGhhc2VycyBzdHVwaWQgdGltZSBmdW5jdGlvbi5cclxuICAgICAgICAvLyBUaW1lIG9uIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgaW4gbWlsbGlzZWNvbmRzLiBcclxuICAgICAgICB2YXIgc3BlZWRVcCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5zbG93IDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgb3JpZ2luYWxTcGVlZCBpcyB1c2VkIHRvIHByb3ZpZGUgXHJcbiAgICAgICAgICAgICAgICAvLyBhIGdyYWR1YWwgc3BlZWQgdXAgdGhhdCBmZWVscyBhIGxpdHRsZSBtb3JlIG5hdHVyYWwuXHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBvcmlnaW5hbFNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBFdmVyeSBzZWNvbmQgdGhlIGRvbHBoaW4gZ2V0cyAxMCUgY2xvc2VyIHRvIGZ1bGwgc3BlZWQuXHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLnNsb3cgKz0gMC4xO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBEZXRlY3Rpbmcgd2hlbiB0aGUgbWF4aW11bSBzcGVlZCBpcyByZWFjaGVkLCBzbyB0aGUgZnVuY3Rpb24gY2FuIGVuZC5cclxuICAgICAgICAgICAgICAgIC8vIEVuZCB0aGUgaW50ZXJ2YWwgdGhhdCBpcyBjYXVzaW5nIHRoZSBjaGFuZ2UgaW4gZG9scGhpbiBzcGVlZC5cclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc3BlZWRVcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXR0aW5nIHRoZSBzbG93aW5nIGVmZmVjdCBhZnRlciB0aGUgbm9ybWFsIHNwZWVkIGlzIHJlYWNoZWQgYWdhaW4uXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5zbG93ID0gMC40O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCB3YXZlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaXRXYXZlcygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV2F2ZSBoaXQnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAxMDAwO1xyXG4gICAgICAgIHNldFRpbWVvdXQoc3RvcEFjY2VsZXJhdGlvbiwgMTAwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHN0YXJmaXNoXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gcGxheWVyXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gc3RhcmZpc2hcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29sbGVjdFN0YXJmaXNoKHBsYXllciwgc3RhcmZpc2gpIHtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZC5wbGF5KCdjb2luR2V0Jyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGlkID0gc3RhcmZpc2guZGF0YS5pZDtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMua2lsbFNwcml0ZShzdGFyZmlzaC5zcHJpdGUpO1xyXG5cclxuICAgICAgICBpZiAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMuaW5kZXhPZihpZCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1biArPSAxO1xyXG4gICAgICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5wdXNoKGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXJmaXNoID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3AgcGxheWVyJ3MgYm91bmNlIGFjY2VsZXJhdGlvblxyXG4gICAgICogYWZ0ZXIgY29sbGlkaW5nIHdpdGggd2F2ZXNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc3RvcEFjY2VsZXJhdGlvbigpIHtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IDA7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1N0b3AgQWNjZWxlcmF0aW9uJyk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBzYW5kXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpdFNhbmQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NhbmQgaGFzIGJlZW4gaGl0Jyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAtMTAwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMDApO1xyXG4gICAgICAgIERELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBsYXlNdXNpYygpIHtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkdhbWVTb3VuZC5wbGF5KCdNdXNpYycpO1xyXG4gICAgICAgIHNldFRpbWVvdXQocGxheU11c2ljLCA1OTAwMCk7XHJcbiAgICB9XHJcbiAgICBcclxufSkoKTtcclxuXHJcbi8vIFJlc3RvcmUgcGVyc2lzdGVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuREQuZ2FtZS5hY3Rpb25zLnJlc3RvcmVTYXZlZFZhbHVlcygpO1xyXG5cclxuLy8gRXZlcnl0aGluZyBpcyBkZWNsYXJlZDogaW5pdGlhbGl6ZSBnYW1lXHJcbkRELmdhbWUuYWN0aW9ucy5zdGFydCgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=