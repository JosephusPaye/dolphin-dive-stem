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

// Declare jQuery in Electron app
if (window.$ === undefined) {
    $ = require('jQuery');
    jQuery = require('jQuery');
}

var Helper = {};

(function() {

    // Export functions
    Helper.getRandomIntBetween = getRandomIntBetween;
    Helper.restoreSavedValues = restoreSavedValues;
    Helper.isVisible = isVisible;

    /**
     * Check if a sprite is visible on screen
     * or to the right of the player
     * 
     * @param  {Phaser.Sprite}  junk
     * @return {Boolean}
     */
    function isVisible(junk) {
        return junk.x > ( DD.player.element.x - (game.camera.width / 2) ); 
    }

    /**
     * Get a random integet between min
     * and max (inclusive)
     * 
     * @param  {Integer} min
     * @param  {Integer} max
     * @return {Integer}
     */
    function getRandomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Restore saved values from local storage
     */
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

})();

// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DD object
 * 
 * Contains game state independent of Phaser
 */
var DD = {
    version: '1.0.0',

    objects: {
        spill: {
            element: null,
            collisionGroup: null,
            gradient: {
                element: null
            }
        },

        starfish: {
            amount: Helper.getRandomIntBetween(1, 2),
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
            amount: Helper.getRandomIntBetween(0, 1),
            elements: [],
            collisionGroup: null
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
        vertSpeed: 500,
        element: null,
        collisionGroup: null,
        angle: 20,

        barrier: {
            element: null
        }
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
                total: 2.5,
                begin: 0,
                charges: 0
            },

            multiplier: 1
        },

        audio: {
            junkCollide: null,
            GameSound: null,
            bottle: null,
            barrel: null,
            plasticBag: null
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
        playMusic: playMusic,
        createJunks: createJunks,
        cleanUp: cleanUp,
        killSprite: killSprite,
        createStarfish: createStarfish,
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
     * Play game background music
     */
    function playMusic() {
        ion.sound.play('GameMusic');
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
            switch (junk.key) {
                case 'bag':
                    junk.scale.setTo(0.8, 0.8);
                    junk.body.setRectangle(10, 10);
                    break;
                case 'barrel':
                    junk.scale.setTo(0.8, 0.8);
                    junk.body.setRectangle(30, 40);
                    break;
                case 'boot':
                    junk.scale.setTo(0.6, 0.6);
                    junk.body.setRectangle(15, 15);
                    break;
                case 'bottle':
                    junk.scale.setTo(0.5, 0.5);
                    junk.body.setRectangle(5, 10);
                    break;
                case 'tyre':
                    junk.scale.setTo(0.6, 0.6);
                    junk.body.setRectangle(25, 25);
                    break;
                default:
                    console.log('Whut?');
            }

            // Set junk velocity
            junk.body.angularVelocity = Math.random() * 2;
            junk.body.velocity.y = Math.random() * 80;

            // Tell the junk to use the DD.objects.junks.collisionGroup 
            junk.body.setCollisionGroup(DD.objects.junks.collisionGroup);

            // Junks will collide against themselves and the player
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

            starfishes.push(starfish);
        }

        DD.objects.starfish.elements.push(starfishes);
    }

    /**
     * Clean up junks, starfishes and nets
     */
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
                    if ( Helper.isVisible(junk) ) {
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
                    if ( Helper.isVisible(starfish) ) {
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

    /**
     * Destroy a sprite and remove it from the 
     * game
     * 
     * @param  {Phaser.Sprite} sprite
     */
    function killSprite(sprite) {
        sprite.body = null;
        sprite.kill();

        if (sprite.group) {
            sprite.group.remove(sprite);
        } else if (sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
    }

    /**
     * Update and persist high scores after
     * a game
     * 
     * @param  {Object} score
     */
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

    /**
     * Generate nets for maze
     */
    function createNets() {
        var currentEdge;
        var nextEdge;
        var nets = [];
        var netA;
        var netB;
        var j;
        var wallX;
        var wallAY;
        var wallBY;

        for (j = 0; j < DD.objects.nets.amount; j++) {
            currentEdge = DD.player.element.x + (game.camera.width / 2) + 200;
            nextEdge = currentEdge + game.camera.width;

            wallX = Helper.getRandomIntBetween(currentEdge, nextEdge);
            wallAY = Helper.getRandomIntBetween(-560, 420);
            wallBY = wallAY + 1080 + Helper.getRandomIntBetween(100, 500);

            console.log(wallAY);
            console.log(wallBY);

            netA = game.add.sprite(currentEdge + wallX, wallAY, 'topnet');
            netB = game.add.sprite(currentEdge + wallX, wallBY, 'topnet');

            game.physics.p2.enable(netA);
            game.physics.p2.enable(netB);

            netA.body.static = true;
            netB.body.static = true;

            netB.body.angle = 180;

            netA.body.setRectangle(250, 950);
            netB.body.setRectangle(250, 950);

            // Tell the net to use the DD.objects.net.collisionGroup 
            netA.body.setCollisionGroup(DD.objects.nets.collisionGroup);
            netB.body.setCollisionGroup(DD.objects.nets.collisionGroup);

            // Nets will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            netA.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);
            netB.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);

            nets.push(netA);
            nets.push(netB);
        }

        DD.objects.nets.elements.push(nets);
    }

    /**
     * Handle game restart
     * 
     * Reset running variables and restart game by
     * destroying current game cache and 
     * re-initializing the game
     */
    function restart() {
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

        // Resetting values that seem to get altered at some point
        DD.player.speed = 300;
        DD.objects.spill.speed = 280;
        DD.game.modifiers.boost.active = false;

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
        // This sets a limit on the up-scale
        // game.scale.maxWidth = 1280;
        // game.scale.maxHeight = 720;

        // Set scale mode and resize game
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize();

        // Backgrounds
        game.load.image('background', 'assets/images/StaticBackground.png');
        game.load.image('backgroundL1', 'assets/images/Layer1.png');
        game.load.image('backgroundL2', 'assets/images/Layer2.png');
        game.load.image('seafloor', 'assets/images/SeaFloor.png');
        game.load.spritesheet('waves', 'assets/images/waveFinal.png', 1280, 45);

        // Junks
        game.load.image('bag', 'assets/images/bag.png');
        game.load.image('barrel', 'assets/images/barrel.png');
        game.load.image('boot', 'assets/images/boot.png');
        game.load.image('bottle', 'assets/images/bottle.png');
        game.load.image('tyre', 'assets/images/tyre.png');

        // Objects
        game.load.image('crab', 'assets/images/angrycrab.png');
        game.load.image('starfish', 'assets/images/starfish.png');
        game.load.spritesheet('barrier', '/assets/images/boost.png', 288, 289);

        // Nets
        game.load.image('overnet', 'assets/images/overnet.png');
        game.load.image('botnet', 'assets/images/botnet.png');
        game.load.image('undernet', 'assets/images/undernet.png');
        game.load.image('topnet', 'assets/images/topnet.png');

        // Main characters
        game.load.image('oilspill', 'assets/images/oilback.png');
        game.load.spritesheet('dolphin', 'assets/images/dolphinFinal.png', 573, 295);
        // game.load.spritesheet('dolphin', 'assets/images/new-dolphin.png', 245, 103);

        // Audio
        game.load.audio('junkImpact', 'assets/audio/yey.wav');
        game.load.audio('GameSound', 'assets/audio/GameSound.ogg');
        game.load.audio('Junks', 'assets/audio/Junks.ogg');
        
        // Ion sounds
        ion.sound({
            sounds: [{
                name: 'GameMusic',
                loop: true,
                multiplay: false
            }],

            path: 'assets/audio/',
            preload: true,
            volume: 1
        });

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
        // Play background music on load
        game.load.onLoadComplete.add(DD.game.actions.playMusic(), this);

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
        DD.player.element.scale.setTo(0.2, 0.2);

        // Add boost and setup physics
        DD.player.barrier.element = game.add.sprite(0, 0, 'barrier');
        DD.player.barrier.element.alpha = 0;
        game.physics.enable(DD.player.barrier.element, Phaser.Physics.ARCADE);

        // Add boost animations
        DD.player.barrier.element.animations.add('boost', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 10, true);
        DD.player.barrier.element.animations.play('boost');

        // Player physics properties
        game.physics.p2.enable(DD.player.element);
        DD.player.element.body.collideWorldBounds = true;

        // Add oilspill element and enable Physics
        DD.objects.spill.element = game.add.sprite(1600, 0, 'oilspill');
        game.physics.p2.enable(DD.objects.spill.element);

        // Waves
        DD.textures.waves.element = game.add.sprite(0, 0, 'waves');
        game.physics.p2.enable(DD.textures.waves.element);
        DD.textures.waves.element.animations.add('wave', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);

        // Sand
        DD.textures.sand.element = game.add.sprite(0, 1080, 'waves');
        game.physics.p2.enable(DD.textures.sand.element);
        DD.textures.sand.element.alpha = 0;

        // Sound stuff
        DD.game.audio.JunkSound = game.add.audio('Junks');
        DD.game.audio.JunkSound.allowMultiple = true;

        // Setup sounds
        DD.game.audio.JunkSound.addMarker('barrel', 0, 2);
        DD.game.audio.JunkSound.addMarker('bottle', 2, 0.5);
        DD.game.audio.JunkSound.addMarker('bag', 3, 0.4);
        DD.game.audio.JunkSound.addMarker('boot', 3.5, 0.1);
        DD.game.audio.JunkSound.addMarker('tyre', 4, 0.2);
        DD.game.audio.JunkSound.addMarker('starfish', 3.6, 0.35);
        DD.game.audio.JunkSound.addMarker('boost', 4.5, 1);

        // Player animations
        DD.player.element.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
        // DD.player.element.animations.add('collide', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 100, true);

        // Create collision groups
        DD.player.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.textures.waves.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.textures.sand.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.objects.junks.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.objects.spill.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.objects.starfish.collisionGroup = game.physics.p2.createCollisionGroup();
        DD.objects.nets.collisionGroup = game.physics.p2.createCollisionGroup();

        // This part is vital if you want the objects with their own collision groups to still 
        // Collide with the world bounds (which we do)
        // What this does is adjust the bounds to use its own collision group.
        game.physics.p2.updateBoundsCollisionGroup();

        // Generate junks, starfishes and nets
        DD.game.actions.createJunks();
        DD.game.actions.createStarfish();
        DD.game.actions.createNets();

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
        DD.player.element.body.collides(DD.objects.nets.collisionGroup, netHit, this);

        // Setup keyboard controls
        DD.game.cursors = game.input.keyboard.createCursorKeys();

        // Setup camera
        game.camera.follow(DD.player.element);

        // Pause and show Main Menu on first run
        if (DD.game.firstRun) {
            // DD.game.actions.playMusic();

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
            DD.game.actions.createNets();

            DD.game.world.lastGeneratedPosition = DD.player.element.x;
        }

        // Cleanup 
        if (DD.objects.junks.elements.length >= 2 & !DD.game.world.cleaningUp) {
            DD.game.actions.cleanUp();
        }

        // Activate boost
        if (DD.game.modifiers.boost.active) {
            if ( (DD.player.element.x - DD.game.modifiers.boost.begin) >= 300) {
                DD.game.modifiers.total += -0.4 * (DD.player.speed / DD.game.modifiers.boost.total);
                
                var fadeOut = setInterval(function() {
                    if (DD.game.modifiers.boost.total !== 0) {
                        DD.player.barrier.element.alpha += -0.3;
                    } else {
                        clearInterval(fadeOut);
                    }
                }, 1000);

                if (DD.game.modifiers.total <= 0) {
                    DD.game.modifiers.total = 0;
                    DD.game.modifiers.boost.active = false;

                    console.log('Boost End :(');
                }
            }
        }

        // Update positions of characters
        DD.textures.waves.element.body.x = game.camera.x + 647;
        DD.textures.waves.element.body.y = 20;
        DD.textures.sand.element.body.x = game.camera.x;
        DD.textures.sand.element.body.y = 1080;
        DD.textures.waves.element.animations.play('wave');

        DD.textures.waves.element.body.angle = 0.000000;
        DD.textures.sand.element.body. angle = 0.000000;

        // Update external elements
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
            DD.player.barrier.element.body.x = DD.player.element.body.x - 100;
            DD.player.barrier.element.body.y = DD.player.element.body.y - 150;
    
            // Update the oilspill velocity
            DD.objects.spill.element.body.velocity.x = 280 + (28 * DD.game.world.level);

            if (!DD.objects.junks.active) {
                DD.player.element.animations.play('right');
            }
        }

        // Reset the player's velocity (movement)
        if (!DD.player.accelerationActive) {
            DD.player.element.body.velocity.y = 0;
        }

        // Apply speed up
        if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level)) {
            if (DD.game.world.level < 19) {
                DD.game.world.level += 1;
                console.log('Level (speed) up!');
            }
        }

        // Handle Boost
        if (DD.game.cursors.right.isDown) {
            if (DD.game.modifiers.boost.charges > 0) {
                if (!DD.game.modifiers.boost.active) {
                    DD.game.audio.JunkSound.play('boost');

                    // Decrement boost changes and starfish count
                    DD.game.modifiers.boost.charges--;
                    DD.game.score.starfish.lastRun--;
                    
                    // Update modifiers
                    DD.game.modifiers.total += (DD.player.speed * DD.game.modifiers.boost.total);
                    DD.game.modifiers.boost.active = true;

                    // Set boost begin position and show boost animation
                    DD.game.modifiers.boost.begin = DD.player.element.x;
                    DD.player.barrier.element.alpha = 1;

                    console.log('BOOST!');
                }
            } else {
                console.log('No charges left');
            }
        }

        // Handle controls
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
            (game.input.pointer1.isDown && game.input.pointer1.x < 500 && game.input.pointer1.y < 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x < 500 && game.input.pointer2.y < 360)
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
            (game.input.pointer1.isDown && game.input.pointer1.x < 500 && game.input.pointer1.y > 360) ||
            (game.input.pointer2.isDown && game.input.pointer2.x < 500 && game.input.pointer2.y > 360)
        ) {
            return true;
        }

        return false;
    }


    /**
     * Increase player speed after
     * collision with junk
     */
    function junkHit(player, junk) {
        // Play junk hit sound
        DD.game.audio.JunkSound.play(junk.sprite.key);
        
        if (!DD.game.modifiers.boost.active) {
            // The speed that the player should be travelling at is stored, 
            // otherwise the function below will slow down rather than speed up.
            var originalSpeed = DD.player.speed;

            // Setting a slow speed straight away so it doesn't feel laggy
            DD.player.speed = originalSpeed * (DD.objects.junks.slow / DD.game.world.level);

            // setInterval means that I can perform this over some time 
            // and gradually without using Phasers stupid time function.
            // Time on the second argument is in milliseconds. 
            var speedUp = setInterval(function() {
                if (DD.objects.junks.slow <= 1.05) {
                    // This is where originalSpeed is used to provide 
                    // a gradual speed up that feels a little more natural.
                    DD.player.speed = originalSpeed * DD.objects.junks.slow;
                    // Every second the dolphin gets 10% closer to full speed.
                    DD.objects.junks.slow += 0.05;
                } else { // Detecting when the maximum speed is reached, so the function can end.
                    // End the interval that is causing the change in dolphin speed.
                    console.log(DD.player.element.body.velocity.x);
                    clearInterval(speedUp);
                }
            }, 100);

            // Resetting the slowing effect after the normal speed is reached again.
            DD.objects.junks.slow = 0.4;
        }
    }

    /**
     * Handle player collision with waves
     */
    function hitWaves() {
        console.log('Wave hit');

        DD.player.element.body.velocity.y = 500;
        DD.player.element.body.gravity.y = -500;
        DD.player.element.body.velocity.x += -100;
        setTimeout(stopAcceleration, 100);
        DD.player.accelerationActive = true;
    }

    /**
     * Handle player collision with starfish
     * @param  {Game.sprite} player
     * @param  {Game.sprite} starfish
     */
    function collectStarfish(player, starfish) {
        var id = starfish.data.id;
        DD.game.actions.killSprite(starfish.sprite);

        if (DD.objects.starfish.collectedIds.indexOf(id) === -1) {
            DD.game.audio.JunkSound.play('starfish');
            DD.game.score.starfish.lastRun += 1;
            DD.game.modifiers.boost.charges += 1;
            DD.objects.starfish.collectedIds.push(id);
        }

        starfish = null;
    }

    /**
     * Stop player's bounce acceleration
     * after colliding with waves
     */
    function stopAcceleration() {
        DD.player.element.body.velocity.y = 0;
        DD.player.element.body.gravity.y = 0;
        DD.player.element.body.velocity.x += 100;
        DD.player.accelerationActive = false;

        console.log('Stop Acceleration');
    }

    /**
     * Handle player collision with sand
     */
    function hitSand() {
        console.log('Sand has been hit');

        DD.player.element.body.velocity.y = -500;
        DD.player.element.body.gravity.y = -500;
        DD.player.element.body.velocity.x += -100;
        setTimeout(stopAcceleration, 100);
        DD.player.accelerationActive = true;
    }
    
    function netHit(player, net) {
        console.log('netHit');
        console.log(net);
        // if (DD.game.modifiers.boost.active) {
        //     net.body = null;
        //     net.kill();
        // }
        DD.player.element.body.velocity.x = 0;
    }

})();

// Restore persisted values from local storage
Helper.restoreSavedValues();

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImhlbHBlci5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlZ2lzdGVyIEFycmF5LmdldFVuaXF1ZSgpXHJcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIGwgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciByID0gW107XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xyXG4gICAgICAgIG9bdGhpc1tpXV0gPSB0aGlzW2ldO1xyXG4gICAgfSBcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG4gICAgICAgIHIucHVzaChvW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG4vLyBEZWNsYXJlIGpRdWVyeSBpbiBFbGVjdHJvbiBhcHBcclxuaWYgKHdpbmRvdy4kID09PSB1bmRlZmluZWQpIHtcclxuICAgICQgPSByZXF1aXJlKCdqUXVlcnknKTtcclxuICAgIGpRdWVyeSA9IHJlcXVpcmUoJ2pRdWVyeScpO1xyXG59XHJcbiIsInZhciBIZWxwZXIgPSB7fTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZnVuY3Rpb25zXHJcbiAgICBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbiA9IGdldFJhbmRvbUludEJldHdlZW47XHJcbiAgICBIZWxwZXIucmVzdG9yZVNhdmVkVmFsdWVzID0gcmVzdG9yZVNhdmVkVmFsdWVzO1xyXG4gICAgSGVscGVyLmlzVmlzaWJsZSA9IGlzVmlzaWJsZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGEgc3ByaXRlIGlzIHZpc2libGUgb24gc2NyZWVuXHJcbiAgICAgKiBvciB0byB0aGUgcmlnaHQgb2YgdGhlIHBsYXllclxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtQaGFzZXIuU3ByaXRlfSAganVua1xyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNWaXNpYmxlKGp1bmspIHtcclxuICAgICAgICByZXR1cm4ganVuay54ID4gKCBERC5wbGF5ZXIuZWxlbWVudC54IC0gKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKTsgXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSByYW5kb20gaW50ZWdldCBiZXR3ZWVuIG1pblxyXG4gICAgICogYW5kIG1heCAoaW5jbHVzaXZlKVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtJbnRlZ2VyfSBtaW5cclxuICAgICAqIEBwYXJhbSAge0ludGVnZXJ9IG1heFxyXG4gICAgICogQHJldHVybiB7SW50ZWdlcn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50QmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdG9yZSBzYXZlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlc3RvcmVTYXZlZFZhbHVlcygpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcbid1c2Ugc3RyaWN0JzsgLy8gU2hvd3MgYWxsIGVycm9ycyBhbmQgd2FybmluZ3NcclxuXHJcbi8qKlxyXG4gKiBHbG9iYWwgREQgb2JqZWN0XHJcbiAqIFxyXG4gKiBDb250YWlucyBnYW1lIHN0YXRlIGluZGVwZW5kZW50IG9mIFBoYXNlclxyXG4gKi9cclxudmFyIEREID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGdyYWRpZW50OiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDEsIDIpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigxMCwgMTUpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXRzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMCwgMSksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcblxyXG4gICAgICAgIHdhdmVzOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2FuZDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBhY2NlbGVyYXRpb25BY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiA1MDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjAsXHJcblxyXG4gICAgICAgIGJhcnJpZXI6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGdhbWVPdmVyQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGNsZWFuaW5nVXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYXN0R2VuZXJhdGVkUG9zaXRpb246IDAsXHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIHRleHQ6IG51bGwsXHJcblxyXG4gICAgICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBoaWdoU2NvcmVzOiBbXVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYm9vc3Q6IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMi41LFxyXG4gICAgICAgICAgICAgICAgYmVnaW46IDAsXHJcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYXVkaW86IHtcclxuICAgICAgICAgICAganVua0NvbGxpZGU6IG51bGwsXHJcbiAgICAgICAgICAgIEdhbWVTb3VuZDogbnVsbCxcclxuICAgICAgICAgICAgYm90dGxlOiBudWxsLFxyXG4gICAgICAgICAgICBiYXJyZWw6IG51bGwsXHJcbiAgICAgICAgICAgIHBsYXN0aWNCYWc6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuXHJcbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxyXG52YXIgZ2FtZTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyByZWZlcmVuY2VzIHRvIGFsbCBvbi1zY3JlZW4gZWxlbWVudHNcclxuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5RGF0YSA9IHtcclxuICAgIGdhbWU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZDoge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNodWQnKSxcclxuICAgICAgICBzY29yZTogJCgnI2h1ZC1zY29yZScpLFxyXG4gICAgICAgIHN0YXJmaXNoOiAkKCcjaHVkLXN0YXJmaXNoJyksXHJcbiAgICAgICAgcGF1c2VCdG46ICQoJyNodWQtcGF1c2VCdG4nKSxcclxuICAgICAgICBcclxuICAgICAgICBwcm9ncmVzc0Jhcjoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjaHVkLXByb2dyZXNzYmFyJyksXHJcbiAgICAgICAgICAgIHNwaWxsOiAkKCcjaHVkLXByb2dyZXNzYmFyLW9pbHNwaWxsJyksXHJcbiAgICAgICAgICAgIGRvbHBoaW46ICQoJyNodWQtcHJvZ3Jlc3NiYXItZG9scGhpbicpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWluTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNtYWluTWVudScpLFxyXG4gICAgICAgIG5ld0dhbWVCdG46ICQoJyNtYWluTWVudS1uZXdHYW1lJyksXHJcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcclxuICAgICAgICBob3dUb1BsYXlCdG46ICQoJyNtYWluTWVudS1ob3dUb1BsYXknKSxcclxuICAgICAgICBhYm91dEJ0bjogJCgnI21haW5NZW51LWFib3V0JylcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaFNjb3Jlc01lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcclxuICAgICAgICBsaXN0OiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCcpLFxyXG4gICAgICAgIGxpc3RQYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTInKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTInKVxyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuICAgICAgICBuZXh0UGFnZTNCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTNCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTJCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UyJyksXHJcbiAgICAgICAgcGFnZTM6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UzJylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI2dhbWVPdmVyTWVudSAub3ZlcmxheScpLFxyXG5cclxuICAgICAgICBoaWdoU2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1zdGFyZmlzaCcpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2ggLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lT3Zlck1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBmdW5jdGlvbnNcclxuICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzID0gc2hvd0VsZW1lbnRzO1xyXG4gICAgRGlzcGxheS5oaWRlRWxlbWVudHMgPSBoaWRlRWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LnNob3dNZW51ID0gc2hvd01lbnU7XHJcbiAgICBEaXNwbGF5LmhpZGVBbGxNZW51cyA9IGhpZGVBbGxNZW51cztcclxuICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzID0gaGlkZUFsbEVsZW1lbnRzO1xyXG4gICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzID0gdXBkYXRlSGlnaFNjb3JlcztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgZ2l2ZW4gZWxlbWVudCBvbiBzY3JlZW5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50cyhlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgZ2l2ZW4gZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaWRlRWxlbWVudHMoZWxlbWVudHMpIHtcclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2hvd01lbnUobWVudSkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW21lbnVdKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIG1lbnVzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaWRlQWxsTWVudXMoKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVBbGxFbGVtZW50cygpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudF0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHNjb3JlcyBpbiBBYm91dCBtZW51XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUhpZ2hTY29yZXMoKSB7XHJcbiAgICAgICAgLy8gR2V0IHVuaXF1ZSBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU29ydCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhIDwgYjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgSFRNTCBmb3Igc2NvcmVzXHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8ZGl2PicgKyBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAxKVxyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdCkuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG4gICAgICAgIGZvciAodmFyIGogPSA1OyBqIDwgMTA7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMilcclxuICAgICAgICBpZiAoaGlnaFNjb3Jlc0h0bWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdFBhZ2UyKS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQ29udHJvbHMgdGhlIHBsYXliYWNrIG9mIGFuaW1hdGlvbnNcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7fTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgIC8vIEV4cG9ydCBhbmltYXRpb25zXHJcbiAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSA9IG1haW5NZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUgPSBoaWdoU2NvcmVzTWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MiA9IGhpZ2hTY29yZXNNZW51MjtcclxuICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSA9IHBhdXNlTWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmFib3V0TWVudSA9IGFib3V0TWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUgPSBob3dUb1BsYXlNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51ID0gZ2FtZU92ZXJNZW51O1xyXG5cclxuICAgIC8vIE1haW4gTWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBtYWluTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjbWFpbk1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjYsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNtYWluTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBoaWdoU2NvcmVzTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHNjb3Jlc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCBkaXYnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIaWdoIHNjb3JlcyBtZW51IHBhZ2UgMlxyXG4gICAgZnVuY3Rpb24gaGlnaFNjb3Jlc01lbnUyKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyIGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTIgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhvd1RvUGxheU1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2hvd1RvUGxheU1lbnUgLnRleHQnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFib3V0TWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjYWJvdXRNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXVzZSBNZW51IGFuaW1hdGlvbnNcclxuICAgIGZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiA3NSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnYW1lT3Zlck1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2dhbWVPdmVyTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNCxcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2dhbWVPdmVyTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBnYW1lIGFjdGlvbnMgYW5kIGFjdGlvbi1yZWxhdGVkIGZ1bmN0aW9uc1xyXG4gICAgREQuZ2FtZS5hY3Rpb25zID0ge1xyXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICBwbGF5TXVzaWM6IHBsYXlNdXNpYyxcclxuICAgICAgICBjcmVhdGVKdW5rczogY3JlYXRlSnVua3MsXHJcbiAgICAgICAgY2xlYW5VcDogY2xlYW5VcCxcclxuICAgICAgICBraWxsU3ByaXRlOiBraWxsU3ByaXRlLFxyXG4gICAgICAgIGNyZWF0ZVN0YXJmaXNoOiBjcmVhdGVTdGFyZmlzaCxcclxuICAgICAgICB1cGRhdGVIaWdoU2NvcmVzOiB1cGRhdGVIaWdoU2NvcmVzLFxyXG4gICAgICAgIGNyZWF0ZU5ldHM6IGNyZWF0ZU5ldHMsXHJcbiAgICAgICAgcmVzdGFydDogcmVzdGFydCxcclxuICAgICAgICBnYW1lT3ZlcjogZ2FtZU92ZXJcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBnYW1lXHJcbiAgICAgKiBcclxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBnYW1lIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcclxuICAgICAgICB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgdmFyIGggPSB3aW5kb3cuaW5uZXJIZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSh3LCBoLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICAgICAgICAgIHByZWxvYWQ6IERELmdhbWUucHJlbG9hZCxcclxuICAgICAgICAgICAgY3JlYXRlOiBERC5nYW1lLmNyZWF0ZSxcclxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcclxuICAgICAgICAgICAgcmVuZGVyOiBERC5nYW1lLnJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQbGF5IGdhbWUgYmFja2dyb3VuZCBtdXNpY1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwbGF5TXVzaWMoKSB7XHJcbiAgICAgICAgaW9uLnNvdW5kLnBsYXkoJ0dhbWVNdXNpYycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSnVuayBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuICAgICAqXHJcbiAgICAgKiBDcmVhdGVzIGEgdGhvdXNhbmQganVuayBvYmplY3RzIGFuZCBzdG9yZXNcclxuICAgICAqIHRoZW0gaW4gREQub2JqZWN0cy5qdW5rcy5lbGVtZW50c1tdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUp1bmtzKCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50RWRnZTtcclxuICAgICAgICB2YXIgbmV4dEVkZ2U7XHJcbiAgICAgICAgdmFyIGp1bmtzID0gW107XHJcbiAgICAgICAgdmFyIGp1bms7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBERC5vYmplY3RzLmp1bmtzLmFtb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gREQucGxheWVyLmVsZW1lbnQueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgMjAwO1xyXG4gICAgICAgICAgICBuZXh0RWRnZSA9IGN1cnJlbnRFZGdlICsgZ2FtZS5jYW1lcmEud2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSByYW5kb20ganVua1xyXG4gICAgICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICBbJ2JhZycsICdiYXJyZWwnLCAnYm9vdCcsICdib3R0bGUnLCAndHlyZSddW0hlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDAsIDQpXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIHBoeXNpY3NcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzd2l0Y2ggKGp1bmsua2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdiYWcnOlxyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC44LCAwLjgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMTAsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JhcnJlbCc6XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjgsIDAuOCk7XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgzMCwgNDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYm9vdCc6XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgxNSwgMTUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYm90dGxlJzpcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNSwgMC41KTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDUsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3R5cmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC42LCAwLjYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMjUsIDI1KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dodXQ/Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNldCBqdW5rIHZlbG9jaXR5XHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5hbmd1bGFyVmVsb2NpdHkgPSBNYXRoLnJhbmRvbSgpICogMjtcclxuICAgICAgICAgICAganVuay5ib2R5LnZlbG9jaXR5LnkgPSBNYXRoLnJhbmRvbSgpICogODA7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBqdW5rIHRvIHVzZSB0aGUgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAganVuay5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuanVua3MuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gSnVua3Mgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBqdW5rcy5wdXNoKGp1bmspO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5wdXNoKGp1bmtzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJmaXNoIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG4gICAgICpcclxuICAgICAqIENyZWF0ZXMgYSB0aG91c2FuZCBzdGFyZmlzaCBvYmplY3RzIGFuZCBzdG9yZXNcclxuICAgICAqIHRoZW0gaW4gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50c1tdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0YXJmaXNoKCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50RWRnZTtcclxuICAgICAgICB2YXIgbmV4dEVkZ2U7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoZXMgPSBbXTtcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcbiAgICAgICAgdmFyIGo7XHJcblxyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBERC5vYmplY3RzLnN0YXJmaXNoLmFtb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gREQucGxheWVyLmVsZW1lbnQueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgMjAwO1xyXG4gICAgICAgICAgICBuZXh0RWRnZSA9IGN1cnJlbnRFZGdlICsgZ2FtZS5jYW1lcmEud2lkdGg7XHJcblxyXG4gICAgICAgICAgICBzdGFyZmlzaCA9IGdhbWUuYWRkLnNwcml0ZShcclxuICAgICAgICAgICAgICAgIEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKGN1cnJlbnRFZGdlLCBuZXh0RWRnZSksIC8vIERELnBsYXllci5lbGVtZW50LnggKyAxMDAsIC8vIFxyXG4gICAgICAgICAgICAgICAgZ2FtZS53b3JsZC5yYW5kb21ZLFxyXG4gICAgICAgICAgICAgICAgJ3N0YXJmaXNoJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShzdGFyZmlzaCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgc2l6ZSBvZiB0aGUgb2JqZWN0IHdpbGwgbGlrZWx5IGNoYW5nZSB0b28sIGlmIHRoYXQgaXMgcG9zc2libGVcclxuICAgICAgICAgICAgc3RhcmZpc2guYm9keS5zZXRSZWN0YW5nbGUoMjQsIDIyKTtcclxuICAgICAgICAgICAgc3RhcmZpc2guc2NhbGUuc2V0VG8oMC42LCAwLjYpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgc3RhcmZpc2ggdG8gdXNlIHRoZSBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RhcmZpc2hlcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgc3RhcmZpc2guYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBzdGFyZmlzaGVzLnB1c2goc3RhcmZpc2gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5wdXNoKHN0YXJmaXNoZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYW4gdXAganVua3MsIHN0YXJmaXNoZXMgYW5kIG5ldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY2xlYW5VcCgpIHtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPD0gMykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ2xlYW5pbmcgdXAnKTtcclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBDbGVhbiB1cCBqdW5rc1xyXG4gICAgICAgIHZhciBqdW5rc1RvQ2xlYXIgPSBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnNwbGljZSgwLCBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgIGp1bmtzVG9DbGVhci5mb3JFYWNoKGZ1bmN0aW9uKGdlbmVyYXRpb24sIGkpIHtcclxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGp1bmssIGopIHtcclxuICAgICAgICAgICAgICAgIGlmIChqdW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBIZWxwZXIuaXNWaXNpYmxlKGp1bmspICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzWzBdLnB1c2goanVuayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2lsbFNwcml0ZShqdW5rKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25bal0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzVG9DbGVhcltpXSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIHN0YXJzXHJcbiAgICAgICAgdmFyIHN0YXJzVG9DbGVhciA9IERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMuc3BsaWNlKDAsIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgc3RhcnNUb0NsZWFyLmZvckVhY2goZnVuY3Rpb24oZ2VuZXJhdGlvbiwgaSkge1xyXG4gICAgICAgICAgICBnZW5lcmF0aW9uLmZvckVhY2goZnVuY3Rpb24oc3RhcmZpc2gsIGopIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFyZmlzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggSGVscGVyLmlzVmlzaWJsZShzdGFyZmlzaCkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHNbMF0ucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2lsbFNwcml0ZShzdGFyZmlzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uW2pdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzdGFyc1RvQ2xlYXJbaV0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NsZWFuIHVwIGRvbmUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgYSBzcHJpdGUgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBcclxuICAgICAqIGdhbWVcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7UGhhc2VyLlNwcml0ZX0gc3ByaXRlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGtpbGxTcHJpdGUoc3ByaXRlKSB7XHJcbiAgICAgICAgc3ByaXRlLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIHNwcml0ZS5raWxsKCk7XHJcblxyXG4gICAgICAgIGlmIChzcHJpdGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgc3ByaXRlLmdyb3VwLnJlbW92ZShzcHJpdGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3ByaXRlLnBhcmVudCkge1xyXG4gICAgICAgICAgICBzcHJpdGUucGFyZW50LnJlbW92ZUNoaWxkKHNwcml0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIGFuZCBwZXJzaXN0IGhpZ2ggc2NvcmVzIGFmdGVyXHJcbiAgICAgKiBhIGdhbWVcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBzY29yZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIaWdoU2NvcmVzKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoID0gc2NvcmUuc3RhcmZpc2ggKyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdzdGFyZmlzaCcsIHN0YXJmaXNoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIG5ldHMgZm9yIG1hemVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlTmV0cygpIHtcclxuICAgICAgICB2YXIgY3VycmVudEVkZ2U7XHJcbiAgICAgICAgdmFyIG5leHRFZGdlO1xyXG4gICAgICAgIHZhciBuZXRzID0gW107XHJcbiAgICAgICAgdmFyIG5ldEE7XHJcbiAgICAgICAgdmFyIG5ldEI7XHJcbiAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgdmFyIHdhbGxYO1xyXG4gICAgICAgIHZhciB3YWxsQVk7XHJcbiAgICAgICAgdmFyIHdhbGxCWTtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMubmV0cy5hbW91bnQ7IGorKykge1xyXG4gICAgICAgICAgICBjdXJyZW50RWRnZSA9IERELnBsYXllci5lbGVtZW50LnggKyAoZ2FtZS5jYW1lcmEud2lkdGggLyAyKSArIDIwMDtcclxuICAgICAgICAgICAgbmV4dEVkZ2UgPSBjdXJyZW50RWRnZSArIGdhbWUuY2FtZXJhLndpZHRoO1xyXG5cclxuICAgICAgICAgICAgd2FsbFggPSBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbihjdXJyZW50RWRnZSwgbmV4dEVkZ2UpO1xyXG4gICAgICAgICAgICB3YWxsQVkgPSBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigtNTYwLCA0MjApO1xyXG4gICAgICAgICAgICB3YWxsQlkgPSB3YWxsQVkgKyAxMDgwICsgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMTAwLCA1MDApO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cod2FsbEFZKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cod2FsbEJZKTtcclxuXHJcbiAgICAgICAgICAgIG5ldEEgPSBnYW1lLmFkZC5zcHJpdGUoY3VycmVudEVkZ2UgKyB3YWxsWCwgd2FsbEFZLCAndG9wbmV0Jyk7XHJcbiAgICAgICAgICAgIG5ldEIgPSBnYW1lLmFkZC5zcHJpdGUoY3VycmVudEVkZ2UgKyB3YWxsWCwgd2FsbEJZLCAndG9wbmV0Jyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldEEpO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldEIpO1xyXG5cclxuICAgICAgICAgICAgbmV0QS5ib2R5LnN0YXRpYyA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5zdGF0aWMgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgbmV0Qi5ib2R5LmFuZ2xlID0gMTgwO1xyXG5cclxuICAgICAgICAgICAgbmV0QS5ib2R5LnNldFJlY3RhbmdsZSgyNTAsIDk1MCk7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5zZXRSZWN0YW5nbGUoMjUwLCA5NTApO1xyXG5cclxuICAgICAgICAgICAgLy8gVGVsbCB0aGUgbmV0IHRvIHVzZSB0aGUgREQub2JqZWN0cy5uZXQuY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIG5ldEEuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgICAgICAgICBuZXRCLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5ldHMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIG5ldEEuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgICAgICBuZXRzLnB1c2gobmV0QSk7XHJcbiAgICAgICAgICAgIG5ldHMucHVzaChuZXRCKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIERELm9iamVjdHMubmV0cy5lbGVtZW50cy5wdXNoKG5ldHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgcmVzdGFydFxyXG4gICAgICogXHJcbiAgICAgKiBSZXNldCBydW5uaW5nIHZhcmlhYmxlcyBhbmQgcmVzdGFydCBnYW1lIGJ5XHJcbiAgICAgKiBkZXN0cm95aW5nIGN1cnJlbnQgZ2FtZSBjYWNoZSBhbmQgXHJcbiAgICAgKiByZS1pbml0aWFsaXppbmcgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVzdGFydCgpIHtcclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAvLyAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBzdGFyZmlzaGVzXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXJmaXNoLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBzdGFyZmlzaC5ib2R5ID0gbnVsbDtcclxuICAgICAgICAvLyAgICAgc3RhcmZpc2gua2lsbCgpO1xyXG4gICAgICAgIC8vICAgICBERC5vYmplY3RzLnN0YXJmaXNoW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGp1bmtzIGFuZCBzdGFyZmlzaCBhcnJheXNcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IDA7XHJcblxyXG4gICAgICAgIGdhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICAgICAqIFxyXG4gICAgICogRW5kcyBjdXJyZW50IGdhbWUgYW5kIGRpc3BsYXlzXHJcbiAgICAgKiBnYW1lIG92ZXIgbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgICAgICB2YXIgbmV3SGlnaGVzdFNjb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zdGFyZmlzaC5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCBnYW1lT3ZlcigpIGZyb20gYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0blxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIaWdoIFNjb3JlcyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaGlnaFNjb3Jlc0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIb3cgdG8gUGxheSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaG93VG9QbGF5QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBBYm91dCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuYWJvdXRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuYWJvdXRNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmFib3V0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IG5leHQgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5uZXh0UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucHJldlBhZ2UxQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBhbmQgcHJldiBQYWdlIDIgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubmV4dFBhZ2UyQnRuKS5hZGQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgUGFnZSAzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlM0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBYm91dCBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5hYm91dE1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IGJhY2tncm91bmQgb3ZlcmxheVxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUub3ZlcmxheSkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN1bWUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN1bWVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdGFydCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3RhcnRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIG92ZXIgbWVudTogUGxheSBhZ2FpbiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnBsYXlBZ2FpbkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICAvLyBTaG93IEhVRCBhbmQgcGF1c2UgYnV0dG9uXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LCBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXR0aW5nIHZhbHVlcyB0aGF0IHNlZW0gdG8gZ2V0IGFsdGVyZWQgYXQgc29tZSBwb2ludFxyXG4gICAgICAgIERELnBsYXllci5zcGVlZCA9IDMwMDtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLnNwZWVkID0gMjgwO1xyXG4gICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIE92ZXIgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcblxyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFVEOiBQYXVzZSBidXR0b246IGhhbmRsZXMgcGF1c2UgYWN0aXZhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAgICAgKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWRcclxuICAgICAqL1xyXG4gICAgJChEaXNwbGF5RGF0YS5odWQucGF1c2VCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50XSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZ2FtZSBmdW5jdGlvbnNcclxuICAgIERELmdhbWUucHJlbG9hZCA9IHByZWxvYWQ7XHJcbiAgICBERC5nYW1lLmNyZWF0ZSA9IGNyZWF0ZTtcclxuICAgIERELmdhbWUudXBkYXRlID0gdXBkYXRlO1xyXG4gICAgREQuZ2FtZS5yZW5kZXIgPSByZW5kZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAgICAgKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgICAgICAvLyBUaGlzIHNldHMgYSBsaW1pdCBvbiB0aGUgdXAtc2NhbGVcclxuICAgICAgICAvLyBnYW1lLnNjYWxlLm1heFdpZHRoID0gMTI4MDtcclxuICAgICAgICAvLyBnYW1lLnNjYWxlLm1heEhlaWdodCA9IDcyMDtcclxuXHJcbiAgICAgICAgLy8gU2V0IHNjYWxlIG1vZGUgYW5kIHJlc2l6ZSBnYW1lXHJcbiAgICAgICAgZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMO1xyXG4gICAgICAgIGdhbWUuc2NhbGUuc2V0U2NyZWVuU2l6ZSgpO1xyXG5cclxuICAgICAgICAvLyBCYWNrZ3JvdW5kc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICdhc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDEnLCAnYXNzZXRzL2ltYWdlcy9MYXllcjEucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDInLCAnYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICdhc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnd2F2ZXMnLCAnYXNzZXRzL2ltYWdlcy93YXZlRmluYWwucG5nJywgMTI4MCwgNDUpO1xyXG5cclxuICAgICAgICAvLyBKdW5rc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFnJywgJ2Fzc2V0cy9pbWFnZXMvYmFnLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFycmVsJywgJ2Fzc2V0cy9pbWFnZXMvYmFycmVsLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYm9vdCcsICdhc3NldHMvaW1hZ2VzL2Jvb3QucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib3R0bGUnLCAnYXNzZXRzL2ltYWdlcy9ib3R0bGUucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd0eXJlJywgJ2Fzc2V0cy9pbWFnZXMvdHlyZS5wbmcnKTtcclxuXHJcbiAgICAgICAgLy8gT2JqZWN0c1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnY3JhYicsICdhc3NldHMvaW1hZ2VzL2FuZ3J5Y3JhYi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXJmaXNoJywgJ2Fzc2V0cy9pbWFnZXMvc3RhcmZpc2gucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdiYXJyaWVyJywgJy9hc3NldHMvaW1hZ2VzL2Jvb3N0LnBuZycsIDI4OCwgMjg5KTtcclxuXHJcbiAgICAgICAgLy8gTmV0c1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnb3Zlcm5ldCcsICdhc3NldHMvaW1hZ2VzL292ZXJuZXQucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib3RuZXQnLCAnYXNzZXRzL2ltYWdlcy9ib3RuZXQucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd1bmRlcm5ldCcsICdhc3NldHMvaW1hZ2VzL3VuZGVybmV0LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgndG9wbmV0JywgJ2Fzc2V0cy9pbWFnZXMvdG9wbmV0LnBuZycpO1xyXG5cclxuICAgICAgICAvLyBNYWluIGNoYXJhY3RlcnNcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJ2Fzc2V0cy9pbWFnZXMvb2lsYmFjay5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2RvbHBoaW4nLCAnYXNzZXRzL2ltYWdlcy9kb2xwaGluRmluYWwucG5nJywgNTczLCAyOTUpO1xyXG4gICAgICAgIC8vIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZG9scGhpbicsICdhc3NldHMvaW1hZ2VzL25ldy1kb2xwaGluLnBuZycsIDI0NSwgMTAzKTtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9cclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ2p1bmtJbXBhY3QnLCAnYXNzZXRzL2F1ZGlvL3lleS53YXYnKTtcclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ0dhbWVTb3VuZCcsICdhc3NldHMvYXVkaW8vR2FtZVNvdW5kLm9nZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5hdWRpbygnSnVua3MnLCAnYXNzZXRzL2F1ZGlvL0p1bmtzLm9nZycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElvbiBzb3VuZHNcclxuICAgICAgICBpb24uc291bmQoe1xyXG4gICAgICAgICAgICBzb3VuZHM6IFt7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnR2FtZU11c2ljJyxcclxuICAgICAgICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1dLFxyXG5cclxuICAgICAgICAgICAgcGF0aDogJ2Fzc2V0cy9hdWRpby8nLFxyXG4gICAgICAgICAgICBwcmVsb2FkOiB0cnVlLFxyXG4gICAgICAgICAgICB2b2x1bWU6IDFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIGFkdmFuY2VkIHRpbWluZyBmb3IgRlBTIGNvdW50ZXJcclxuICAgICAgICBnYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAgICAgKiBmb3IgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlKCkgeyBcclxuICAgICAgICAvLyBQbGF5IGJhY2tncm91bmQgbXVzaWMgb24gbG9hZFxyXG4gICAgICAgIGdhbWUubG9hZC5vbkxvYWRDb21wbGV0ZS5hZGQoREQuZ2FtZS5hY3Rpb25zLnBsYXlNdXNpYygpLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc3BhcmVuY3kgb2YgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYWxwaGEgPSAxO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBiYWNrZ3JvdW5kIGxheWVycyBpbW11bmUgdG8gY29sbGlzaW9uc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBBZGQgcGxheWVyXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuMiwgMC4yKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJvb3N0IGFuZCBzZXR1cCBwaHlzaWNzXHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnYmFycmllcicpO1xyXG4gICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgPSAwO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJvb3N0IGFuaW1hdGlvbnNcclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdib29zdCcsIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTFdLCAxMCwgdHJ1ZSk7XHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ2Jvb3N0Jyk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnBsYXllci5lbGVtZW50KTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50IGFuZCBlbmFibGUgUGh5c2ljc1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgxNjAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFdhdmVzXHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3dhdmUnLCBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gU2FuZFxyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAxMDgwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLnNhbmQuZWxlbWVudCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmFscGhhID0gMDtcclxuXHJcbiAgICAgICAgLy8gU291bmQgc3R1ZmZcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZCA9IGdhbWUuYWRkLmF1ZGlvKCdKdW5rcycpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFsbG93TXVsdGlwbGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBzb3VuZHNcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhcnJlbCcsIDAsIDIpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcignYm90dGxlJywgMiwgMC41KTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhZycsIDMsIDAuNCk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib290JywgMy41LCAwLjEpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcigndHlyZScsIDQsIDAuMik7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdzdGFyZmlzaCcsIDMuNiwgMC4zNSk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib29zdCcsIDQuNSwgMSk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBhbmltYXRpb25zXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDddLCAxNSwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ2NvbGxpZGUnLCBbOSwgOCwgNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sIDEwMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBjb2xsaXNpb24gZ3JvdXBzXHJcbiAgICAgICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgICAgIC8vIENvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzICh3aGljaCB3ZSBkbylcclxuICAgICAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGp1bmtzLCBzdGFyZmlzaGVzIGFuZCBuZXRzXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUp1bmtzKCk7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZVN0YXJmaXNoKCk7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZU5ldHMoKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sYXN0R2VuZXJhdGVkUG9zaXRpb24gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBjb2xsaXNpb25zXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCwgY29sbGVjdFN0YXJmaXNoLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwLCBoaXRXYXZlcywgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBoaXRTYW5kLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCwgbmV0SGl0LCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAga2V5Ym9hcmQgY29udHJvbHNcclxuICAgICAgICBERC5nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgY2FtZXJhXHJcbiAgICAgICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxyXG4gICAgICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XHJcbiAgICAgICAgICAgIC8vIERELmdhbWUuYWN0aW9ucy5wbGF5TXVzaWMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgICAgIGlmICggZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT24gZGVtYW5kIGdlbmVyYXRpb25cclxuICAgICAgICBpZiAoREQucGxheWVyLmVsZW1lbnQueCA+PSBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiArIGdhbWUuY2FtZXJhLndpZHRoICsgMjAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlU3RhcmZpc2goKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZU5ldHMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUud29ybGQubGFzdEdlbmVyYXRlZFBvc2l0aW9uID0gREQucGxheWVyLmVsZW1lbnQueDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsZWFudXAgXHJcbiAgICAgICAgaWYgKERELm9iamVjdHMuanVua3MuZWxlbWVudHMubGVuZ3RoID49IDIgJiAhREQuZ2FtZS53b3JsZC5jbGVhbmluZ1VwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jbGVhblVwKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBY3RpdmF0ZSBib29zdFxyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgaWYgKCAoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IC0wLjQgKiAoREQucGxheWVyLnNwZWVkIC8gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgZmFkZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFscGhhICs9IC0wLjM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChmYWRlT3V0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMudG90YWwgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcG9zaXRpb25zIG9mIGNoYXJhY3RlcnNcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLnggKyA2NDc7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnkgPSAyMDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS54ID0gZ2FtZS5jYW1lcmEueDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS55ID0gMTA4MDtcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnd2F2ZScpO1xyXG5cclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwLjAwMDAwMDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS4gYW5nbGUgPSAwLjAwMDAwMDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGV4dGVybmFsIGVsZW1lbnRzXHJcbiAgICAgICAgaWYgKCFERC5nYW1lLnJ1bkVuZCkge1xyXG4gICAgICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gXHJcbiAgICAgICAgICAgIC8vIFRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9ICgoREQucGxheWVyLmVsZW1lbnQueCAvIDQwMCkgLSA4KSAqIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXI7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIHByb2dyZXNzIGJhclxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuc3BpbGwud2lkdGgoIChERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQueCAqIDUwMCApIC8gMTkyMDAwICk7XHJcblxyXG4gICAgICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgZG9scGhpbiB4XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcclxuICAgICAgICAgICAgICAgICdsZWZ0JywgKCAoREQucGxheWVyLmVsZW1lbnQueCAqIDQ5MiApIC8gMTkyMDAwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbmltYXA6IFVwZGF0ZSBkb2xwaGluIHlcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmRvbHBoaW4uY3NzKFxyXG4gICAgICAgICAgICAgICAgJ3RvcCcsICggKERELnBsYXllci5lbGVtZW50LnkgKiAyMCkgLyAxMDgwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHZlbG9jaXR5IGFuZCBwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgKyAoMzAgKiBERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmJvZHkueCA9IERELnBsYXllci5lbGVtZW50LmJvZHkueCAtIDEwMDtcclxuICAgICAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5ib2R5LnkgPSBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnkgLSAxNTA7XHJcbiAgICBcclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxyXG4gICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMjgwICsgKDI4ICogREQuZ2FtZS53b3JsZC5sZXZlbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIURELm9iamVjdHMuanVua3MuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBzcGVlZCB1cFxyXG4gICAgICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSkge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS53b3JsZC5sZXZlbCA8IDE5KSB7XHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSGFuZGxlIEJvb3N0XHJcbiAgICAgICAgaWYgKERELmdhbWUuY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIURELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLnBsYXkoJ2Jvb3N0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIERlY3JlbWVudCBib29zdCBjaGFuZ2VzIGFuZCBzdGFyZmlzaCBjb3VudFxyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMtLTtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4tLTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgbW9kaWZpZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gKERELnBsYXllci5zcGVlZCAqIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsKTtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgYm9vc3QgYmVnaW4gcG9zaXRpb24gYW5kIHNob3cgYm9vc3QgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG4gICAgICAgICAgICAgICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQk9PU1QhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gY2hhcmdlcyBsZWZ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBjb250cm9sc1xyXG4gICAgICAgIGlmIChERC5nYW1lLmN1cnNvcnMudXAuaXNEb3duIHx8IGlzVG91Y2hpbmdVcCgpKSB7XHJcbiAgICAgICAgICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gLTEgKiBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IC0xICogREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKERELmdhbWUuY3Vyc29ycy5kb3duLmlzRG93biB8fCBpc1RvdWNoaW5nRG93bigpKSB7XHJcbiAgICAgICAgICAgIGlmICghREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IERELnBsYXllci5hbmdsZTtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlciBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAgICAgZ2FtZS5kZWJ1Zy50ZXh0KGdhbWUudGltZS5mcHMgfHwgJy0tJywgMiwgMTQsICcjMDBmZjAwJyk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBzY29yZVxyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlICE9PSBERC5nYW1lLnNjb3JlLmxhc3RSdW4pIHtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IERELmdhbWUuc2NvcmUubGFzdFJ1bjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBzdGFyZmlzaFxyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnN0YXJmaXNoICE9PSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pIHtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgaWYgb2lsc3BpbGwgaXMgY292ZXJpbmcgRG9scGhpblxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBkb2xwaGluSXNDb3ZlcmVkKCkge1xyXG4gICAgICAgIGlmICgoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggLSBERC5wbGF5ZXIuZWxlbWVudC54KSA+IC03NTApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gdXBwZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVG91Y2hpbmdVcCgpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPCA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55IDwgMzYwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54IDwgNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA8IDM2MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gbG93ZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVG91Y2hpbmdEb3duKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA8IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPiAzNjApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPCA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzYwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbmNyZWFzZSBwbGF5ZXIgc3BlZWQgYWZ0ZXJcclxuICAgICAqIGNvbGxpc2lvbiB3aXRoIGp1bmtcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24ganVua0hpdChwbGF5ZXIsIGp1bmspIHtcclxuICAgICAgICAvLyBQbGF5IGp1bmsgaGl0IHNvdW5kXHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQucGxheShqdW5rLnNwcml0ZS5rZXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBzcGVlZCB0aGF0IHRoZSBwbGF5ZXIgc2hvdWxkIGJlIHRyYXZlbGxpbmcgYXQgaXMgc3RvcmVkLCBcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbiBiZWxvdyB3aWxsIHNsb3cgZG93biByYXRoZXIgdGhhbiBzcGVlZCB1cC5cclxuICAgICAgICAgICAgdmFyIG9yaWdpbmFsU3BlZWQgPSBERC5wbGF5ZXIuc3BlZWQ7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXR0aW5nIGEgc2xvdyBzcGVlZCBzdHJhaWdodCBhd2F5IHNvIGl0IGRvZXNuJ3QgZmVlbCBsYWdneVxyXG4gICAgICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBvcmlnaW5hbFNwZWVkICogKERELm9iamVjdHMuanVua3Muc2xvdyAvIERELmdhbWUud29ybGQubGV2ZWwpO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0SW50ZXJ2YWwgbWVhbnMgdGhhdCBJIGNhbiBwZXJmb3JtIHRoaXMgb3ZlciBzb21lIHRpbWUgXHJcbiAgICAgICAgICAgIC8vIGFuZCBncmFkdWFsbHkgd2l0aG91dCB1c2luZyBQaGFzZXJzIHN0dXBpZCB0aW1lIGZ1bmN0aW9uLlxyXG4gICAgICAgICAgICAvLyBUaW1lIG9uIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgaW4gbWlsbGlzZWNvbmRzLiBcclxuICAgICAgICAgICAgdmFyIHNwZWVkVXAgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLnNsb3cgPD0gMS4wNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgb3JpZ2luYWxTcGVlZCBpcyB1c2VkIHRvIHByb3ZpZGUgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBncmFkdWFsIHNwZWVkIHVwIHRoYXQgZmVlbHMgYSBsaXR0bGUgbW9yZSBuYXR1cmFsLlxyXG4gICAgICAgICAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlcnkgc2Vjb25kIHRoZSBkb2xwaGluIGdldHMgMTAlIGNsb3NlciB0byBmdWxsIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuanVua3Muc2xvdyArPSAwLjA1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gRGV0ZWN0aW5nIHdoZW4gdGhlIG1heGltdW0gc3BlZWQgaXMgcmVhY2hlZCwgc28gdGhlIGZ1bmN0aW9uIGNhbiBlbmQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcnZhbCB0aGF0IGlzIGNhdXNpbmcgdGhlIGNoYW5nZSBpbiBkb2xwaGluIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzcGVlZFVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0dGluZyB0aGUgc2xvd2luZyBlZmZlY3QgYWZ0ZXIgdGhlIG5vcm1hbCBzcGVlZCBpcyByZWFjaGVkIGFnYWluLlxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLnNsb3cgPSAwLjQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCB3YXZlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaXRXYXZlcygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV2F2ZSBoaXQnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHN0YXJmaXNoXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gcGxheWVyXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gc3RhcmZpc2hcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29sbGVjdFN0YXJmaXNoKHBsYXllciwgc3RhcmZpc2gpIHtcclxuICAgICAgICB2YXIgaWQgPSBzdGFyZmlzaC5kYXRhLmlkO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5raWxsU3ByaXRlKHN0YXJmaXNoLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIGlmIChERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5pbmRleE9mKGlkKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQucGxheSgnc3RhcmZpc2gnKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gMTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMucHVzaChpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFyZmlzaCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIHBsYXllcidzIGJvdW5jZSBhY2NlbGVyYXRpb25cclxuICAgICAqIGFmdGVyIGNvbGxpZGluZyB3aXRoIHdhdmVzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHN0b3BBY2NlbGVyYXRpb24oKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ICs9IDEwMDtcclxuICAgICAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTdG9wIEFjY2VsZXJhdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBzYW5kXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpdFNhbmQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NhbmQgaGFzIGJlZW4gaGl0Jyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC01MDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAtNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCArPSAtMTAwO1xyXG4gICAgICAgIHNldFRpbWVvdXQoc3RvcEFjY2VsZXJhdGlvbiwgMTAwKTtcclxuICAgICAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gbmV0SGl0KHBsYXllciwgbmV0KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ25ldEhpdCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKG5ldCk7XHJcbiAgICAgICAgLy8gaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgIC8vICAgICBuZXQuYm9keSA9IG51bGw7XHJcbiAgICAgICAgLy8gICAgIG5ldC5raWxsKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuLy8gUmVzdG9yZSBwZXJzaXN0ZWQgdmFsdWVzIGZyb20gbG9jYWwgc3RvcmFnZVxyXG5IZWxwZXIucmVzdG9yZVNhdmVkVmFsdWVzKCk7XHJcblxyXG4vLyBFdmVyeXRoaW5nIGlzIGRlY2xhcmVkOiBpbml0aWFsaXplIGdhbWVcclxuREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==