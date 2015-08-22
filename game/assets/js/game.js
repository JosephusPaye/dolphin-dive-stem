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
var DDBlueprint = {
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
        gameEndCalled: false,
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

            newBoost: {
                active: false,
                amount: 2.5,
                startX: 0,
                originalSpeed: 0
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

var DD = jQuery.extend(true, {}, DDBlueprint);

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
    },

    gameEndMenu: {
        element: $('#gameEndMenu'),
        overlay: $('#gameEndMenu .overlay'),

        highScore: {
            element: $('#gameEndMenu-highScore'),
            number: $('#gameEndMenu-highScore .score')
        },

        score: {
            element: $('#gameEndMenu-score'),
            number: $('#gameEndMenu-score .score')
        },

        playAgainBtn: $('#gameEndMenu-playAgain'),
        mainMenuBtn: $('#gameEndMenu-mainMenu')
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
    PlayAnimations.gameEndMenu = gameEndMenu;

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

    function gameEndMenu() {
        // Animate menu title
        TweenMax.from('#gameEndMenu h1', 1, {
            scale: 0.4,
            ease: Bounce.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#gameEndMenu li', 0.3, {
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
        gameOver: gameOver,
        gameEnd: gameEnd
    };

    /**
     * Start game
     * 
     * Initialize the global game object
     */
    function start() {
        // var w = window.innerWidth * window.devicePixelRatio;
        // var h = window.innerHeight * window.devicePixelRatio;

        game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', {
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

            // console.log(wallAY);
            // console.log(wallBY);

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
        // DD.objects.junks.elements = [];
        // DD.objects.starfish.elements = [];

        // // Reset game world
        // DD.game.world.level = 1;

        // // Reset scores
        // DD.game.score.lastRun = 0;
        // DD.game.score.starfish.total = 0;
        // DD.game.score.starfish.lastRun = 0;
        // DD.game.score.lastFrameValue.starfish = 0;
        // DD.game.score.lastFrameValue.score = 0;

        DD.objects = jQuery.extend(true, {}, DDBlueprint.objects);
        DD.textures = jQuery.extend(true, {}, DDBlueprint.textures);
        DD.player = jQuery.extend(true, {}, DDBlueprint.player);

        DD.game.gameOverCalled = false;
        DD.game.runEnd = false;
        DD.game.cursors = null;
        DD.game.world = jQuery.extend(true, {}, DDBlueprint.game.world);
        DD.game.score = jQuery.extend(true, {}, DDBlueprint.game.score);
        DD.game.modifiers = jQuery.extend(true, {}, DDBlueprint.game.modifiers);
        DD.game.audio = jQuery.extend(true, {}, DDBlueprint.game.audio);

        Helper.restoreSavedValues();

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

    /**
     * Handle game end
     * 
     * Ends current game and displays
     * game end menu
     */
    function gameEnd() {
        var newHighestScore = false;

        if (!DD.game.gameEndCalled) {
            DD.game.runEnd = true;

            if (DD.game.score.lastRun > DD.game.score.highScores[0]) {
                newHighestScore = true;
            }

            DD.game.actions.updateHighScores({
                score: DD.game.score.lastRun,
                starfish: DD.game.score.starfish.lastRun
            });

            Display.hideElements([
                DisplayData.gameEndMenu.highScore.element,
                DisplayData.gameEndMenu.score.element
            ]);

            if (newHighestScore) {
                Display.showElements([
                    DisplayData.gameEndMenu.highScore.element
                ]);
            } else {
                Display.showElements([
                    DisplayData.gameEndMenu.score.element
                ]);
            }

            Display.showMenu(DisplayData.gameEndMenu.element);
            PlayAnimations.gameEndMenu();

            // Wait half a second, then trigger score display animation
            window.setTimeout(function() {
                if (newHighestScore) {
                    DisplayData.gameEndMenu.highScore.number.text(DD.game.score.lastRun);
                } else {
                    DisplayData.gameEndMenu.score.number.text(DD.game.score.lastRun);
                }
            }, 500);

            // Prevent gameEnd() from being called multiple times
            DD.game.gameEndCalled = true;
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

    // Game End Menu: Play again button
    $(DisplayData.gameEndMenu.playAgainBtn).click(function() {
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

    // Game End Menu: Quit to Main Menu button
    $(DisplayData.gameEndMenu.mainMenuBtn).click(function() {
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
        game.scale.maxWidth = 1280;
        game.scale.maxHeight = 720;

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
        game.load.spritesheet('barrier', 'assets/images/boost.png', 288, 289);

        // Nets
        game.load.image('overnet', 'assets/images/overnet.png');
        game.load.image('botnet', 'assets/images/botnet.png');
        game.load.image('undernet', 'assets/images/undernet.png');
        game.load.image('topnet', 'assets/images/topnet.png');

        // Main characters
        game.load.image('oilspill', 'assets/images/oilback.png');
        game.load.spritesheet('dolphin', 'assets/images/dolphinFinal.png', 573, 295);

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
        // game.time.advancedTiming = true;
    }

    /**
     * Create function
     * 
     * Where we create and initialize objects
     * for the game
     */
    function create() { 
        // Play background music on load
        // game.load.onLoadComplete.add(DD.game.actions.playMusic(), this);

        // Set boundaries of the world
        game.world.setBounds(0, 0, 300000, 1080);

        // Enable the P2 Physics system
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);

        // Add background layers
        DD.textures.layerA = game.add.tileSprite(0, 0, 300000, 1080, 'background');
        DD.textures.layerB = game.add.tileSprite(0, 0, 300000, 1080, 'backgroundL1');
        DD.textures.layerC = game.add.tileSprite(0, 0, 300000, 1080, 'backgroundL2');

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

        // Player end
        if ( DD.player.element.x > (game.camera.width * 4) ) { // DD.player.element.x > (300000 - game.camera.width / 2 ) ) {
            DD.game.actions.gameEnd();
            DD.player.element.body.velocity.x = 0;
            DD.objects.spill.element.body.velocity.x = 0;
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
            if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 300) {
                
                DD.game.modifiers.total +=  -0.4 * (DD.player.speed / DD.game.modifiers.boost.total);
                
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
        DD.textures.waves.element.body.x = game.camera.x + (game.camera.width / 2) + 5;
        DD.textures.waves.element.body.y = 20;
        DD.textures.waves.element.animations.play('wave');

        DD.textures.sand.element.body.x = game.camera.x;
        DD.textures.sand.element.body.y = 1080;

        DD.textures.waves.element.body.angle = 0.000000;
        DD.textures.sand.element.body. angle = 0.000000;

        // Update external elements
        if (!DD.game.runEnd) {
            // Sets DD.game.score.lastRun based on the position of the player. 
            // The -8 compensates for the position of the player in the world
            DD.game.score.lastRun = ((DD.player.element.x / 400) - 8) * DD.game.modifiers.multiplier;
            DD.game.score.lastRun = parseInt(DD.game.score.lastRun, 10);

            // Minimap: update progress bar
            DisplayData.hud.progressBar.spill.width( (DD.objects.spill.element.x * 500 ) / 300000 );

            // Minimap: update dolphin x
            DisplayData.hud.progressBar.dolphin.css(
                'left', ( (DD.player.element.x * 492 ) / 300000 )
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
        if (DD.game.cursors.right.isDown || isTouchingRight()) {
            DD.game.audio.JunkSound.play('boost');

            if (DD.game.modifiers.boost.charges > 0) {
                if (!DD.game.modifiers.boost.active) {
                    DD.game.modifiers.boost.charges += -1;
                    DD.game.score.starfish.lastRun += -1;

                    DD.game.modifiers.total += (DD.player.speed * DD.game.modifiers.boost.total);

                    DD.game.modifiers.boost.active = true;
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
        // game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');

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
     * Detect touch input in upper left half of screen
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
     * Detect touch input in upper right half of screen
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
     * Detect touch input in right half of screen
     * for both pointer1 (first finger) & pointer2 (second finger)
     * 
     * @return {Boolean}
     */
    function isTouchingRight() {
        if (
            (game.input.pointer1.isDown && game.input.pointer1.x > 780) ||
            (game.input.pointer2.isDown && game.input.pointer2.x < 780)
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImhlbHBlci5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlZ2lzdGVyIEFycmF5LmdldFVuaXF1ZSgpXHJcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIGwgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciByID0gW107XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xyXG4gICAgICAgIG9bdGhpc1tpXV0gPSB0aGlzW2ldO1xyXG4gICAgfSBcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG4gICAgICAgIHIucHVzaChvW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG4vLyBEZWNsYXJlIGpRdWVyeSBpbiBFbGVjdHJvbiBhcHBcclxuaWYgKHdpbmRvdy4kID09PSB1bmRlZmluZWQpIHtcclxuICAgICQgPSByZXF1aXJlKCdqUXVlcnknKTtcclxuICAgIGpRdWVyeSA9IHJlcXVpcmUoJ2pRdWVyeScpO1xyXG59XHJcbiIsInZhciBIZWxwZXIgPSB7fTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZnVuY3Rpb25zXHJcbiAgICBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbiA9IGdldFJhbmRvbUludEJldHdlZW47XHJcbiAgICBIZWxwZXIucmVzdG9yZVNhdmVkVmFsdWVzID0gcmVzdG9yZVNhdmVkVmFsdWVzO1xyXG4gICAgSGVscGVyLmlzVmlzaWJsZSA9IGlzVmlzaWJsZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGEgc3ByaXRlIGlzIHZpc2libGUgb24gc2NyZWVuXHJcbiAgICAgKiBvciB0byB0aGUgcmlnaHQgb2YgdGhlIHBsYXllclxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtQaGFzZXIuU3ByaXRlfSAganVua1xyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNWaXNpYmxlKGp1bmspIHtcclxuICAgICAgICByZXR1cm4ganVuay54ID4gKCBERC5wbGF5ZXIuZWxlbWVudC54IC0gKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKTsgXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYSByYW5kb20gaW50ZWdldCBiZXR3ZWVuIG1pblxyXG4gICAgICogYW5kIG1heCAoaW5jbHVzaXZlKVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtJbnRlZ2VyfSBtaW5cclxuICAgICAqIEBwYXJhbSAge0ludGVnZXJ9IG1heFxyXG4gICAgICogQHJldHVybiB7SW50ZWdlcn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50QmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdG9yZSBzYXZlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlc3RvcmVTYXZlZFZhbHVlcygpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcbid1c2Ugc3RyaWN0JzsgLy8gU2hvd3MgYWxsIGVycm9ycyBhbmQgd2FybmluZ3NcclxuXHJcbi8qKlxyXG4gKiBHbG9iYWwgREQgb2JqZWN0XHJcbiAqIFxyXG4gKiBDb250YWlucyBnYW1lIHN0YXRlIGluZGVwZW5kZW50IG9mIFBoYXNlclxyXG4gKi9cclxudmFyIEREQmx1ZXByaW50ID0ge1xyXG4gICAgdmVyc2lvbjogJzEuMC4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGdyYWRpZW50OiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDEsIDIpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigxMCwgMTUpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXRzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMCwgMSksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcblxyXG4gICAgICAgIHdhdmVzOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2FuZDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBhY2NlbGVyYXRpb25BY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiA1MDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjAsXHJcblxyXG4gICAgICAgIGJhcnJpZXI6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGdhbWVPdmVyQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBnYW1lRW5kQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGNsZWFuaW5nVXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYXN0R2VuZXJhdGVkUG9zaXRpb246IDAsXHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIHRleHQ6IG51bGwsXHJcblxyXG4gICAgICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBoaWdoU2NvcmVzOiBbXVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYm9vc3Q6IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMi41LFxyXG4gICAgICAgICAgICAgICAgYmVnaW46IDAsXHJcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBuZXdCb29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFtb3VudDogMi41LFxyXG4gICAgICAgICAgICAgICAgc3RhcnRYOiAwLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxTcGVlZDogMFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbXVsdGlwbGllcjogMVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGF1ZGlvOiB7XHJcbiAgICAgICAgICAgIGp1bmtDb2xsaWRlOiBudWxsLFxyXG4gICAgICAgICAgICBHYW1lU291bmQ6IG51bGwsXHJcbiAgICAgICAgICAgIGJvdHRsZTogbnVsbCxcclxuICAgICAgICAgICAgYmFycmVsOiBudWxsLFxyXG4gICAgICAgICAgICBwbGFzdGljQmFnOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIEREID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcHJpbnQpO1xyXG5cclxuLy8gSnVzdCBhIGZyaWVuZGx5IHJlbWluZGVyXHJcbmNvbnNvbGUuaW5mbygnRG9scGhpbiBEaXZlIHYnICsgREQudmVyc2lvbik7XHJcblxyXG4vLyBHbG9iYWwgZ2FtZSBvYmplY3RcclxudmFyIGdhbWU7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vKipcclxuICogSG9sZHMgcmVmZXJlbmNlcyB0byBhbGwgb24tc2NyZWVuIGVsZW1lbnRzXHJcbiAqIChleHRlcmFsIHRvIFBoYXNlcilcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheURhdGEgPSB7XHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2dhbWUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBodWQ6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaHVkJyksXHJcbiAgICAgICAgc2NvcmU6ICQoJyNodWQtc2NvcmUnKSxcclxuICAgICAgICBzdGFyZmlzaDogJCgnI2h1ZC1zdGFyZmlzaCcpLFxyXG4gICAgICAgIHBhdXNlQnRuOiAkKCcjaHVkLXBhdXNlQnRuJyksXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJvZ3Jlc3NCYXI6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2h1ZC1wcm9ncmVzc2JhcicpLFxyXG4gICAgICAgICAgICBzcGlsbDogJCgnI2h1ZC1wcm9ncmVzc2Jhci1vaWxzcGlsbCcpLFxyXG4gICAgICAgICAgICBkb2xwaGluOiAkKCcjaHVkLXByb2dyZXNzYmFyLWRvbHBoaW4nKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgbWFpbk1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXdHYW1lQnRuOiAkKCcjbWFpbk1lbnUtbmV3R2FtZScpLFxyXG4gICAgICAgIGhpZ2hTY29yZXNCdG46ICQoJyNtYWluTWVudS1oaWdoU2NvcmVzJyksXHJcbiAgICAgICAgaG93VG9QbGF5QnRuOiAkKCcjbWFpbk1lbnUtaG93VG9QbGF5JyksXHJcbiAgICAgICAgYWJvdXRCdG46ICQoJyNtYWluTWVudS1hYm91dCcpXHJcbiAgICB9LFxyXG5cclxuICAgIGhpZ2hTY29yZXNNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hpZ2hTY29yZXNNZW51JyksXHJcbiAgICAgICAgbGlzdDogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QnKSxcclxuICAgICAgICBsaXN0UGFnZTI6ICQoJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1tYWluTWVudScpLFxyXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1wcmV2LXBhZ2UxQnRuJyksXHJcblxyXG4gICAgICAgIHBhZ2UxOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTEnKSxcclxuICAgICAgICBwYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LXBhZ2UyJylcclxuICAgIH0sXHJcblxyXG4gICAgaG93VG9QbGF5TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNob3dUb1BsYXlNZW51JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNob3dUb1BsYXlNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaG93VG9QbGF5TWVudS1uZXh0LXBhZ2UyQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UxQnRuOiAkKCcjaG93VG9QbGF5TWVudS1wcmV2LXBhZ2UxQnRuJyksXHJcbiAgICAgICAgbmV4dFBhZ2UzQnRuOiAkKCcjaG93VG9QbGF5TWVudS1uZXh0LXBhZ2UzQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UyQnRuOiAkKCcjaG93VG9QbGF5TWVudS1wcmV2LXBhZ2UyQnRuJyksXHJcblxyXG4gICAgICAgIHBhZ2UxOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMicpLFxyXG4gICAgICAgIHBhZ2UzOiAkKCcjaG93VG9QbGF5TWVudS1wYWdlMycpXHJcbiAgICB9LFxyXG5cclxuICAgIGFib3V0TWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNhYm91dE1lbnUnKSxcclxuICAgICAgICB2ZXJzaW9uOiAkKCcjYWJvdXRNZW51LXZlcnNpb24nKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2Fib3V0TWVudS1tYWluTWVudScpXHJcbiAgICB9LFxyXG5cclxuICAgIHBhdXNlTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNwYXVzZU1lbnUnKSxcclxuICAgICAgICBvdmVybGF5OiAkKCcjcGF1c2VNZW51IC5vdmVybGF5JyksXHJcbiAgICAgICAgcmVzdW1lQnRuOiAkKCcjcGF1c2VNZW51LXJlc3VtZScpLFxyXG4gICAgICAgIHJlc3RhcnRCdG46ICQoJyNwYXVzZU1lbnUtcmVzdGFydCcpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjcGF1c2VNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZU92ZXJNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNnYW1lT3Zlck1lbnUgLm92ZXJsYXknKSxcclxuXHJcbiAgICAgICAgaGlnaFNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzY29yZToge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1zY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2gnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXN0YXJmaXNoIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGxheUFnYWluQnRuOiAkKCcjZ2FtZU92ZXJNZW51LXBsYXlBZ2FpbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjZ2FtZU92ZXJNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZUVuZE1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZUVuZE1lbnUnKSxcclxuICAgICAgICBvdmVybGF5OiAkKCcjZ2FtZUVuZE1lbnUgLm92ZXJsYXknKSxcclxuXHJcbiAgICAgICAgaGlnaFNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lRW5kTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZUVuZE1lbnUtaGlnaFNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVFbmRNZW51LXNjb3JlJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVFbmRNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGxheUFnYWluQnRuOiAkKCcjZ2FtZUVuZE1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lRW5kTWVudS1tYWluTWVudScpXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGlzcGxheSBhbmQgbWVudXMgbWFuaXB1bGF0aW9uXHJcbiAqIG9iamVjdFxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5ID0ge307XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gRXhwb3J0IGZ1bmN0aW9uc1xyXG4gICAgRGlzcGxheS5zaG93RWxlbWVudHMgPSBzaG93RWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyA9IGhpZGVFbGVtZW50cztcclxuICAgIERpc3BsYXkuc2hvd01lbnUgPSBzaG93TWVudTtcclxuICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzID0gaGlkZUFsbE1lbnVzO1xyXG4gICAgRGlzcGxheS5oaWRlQWxsRWxlbWVudHMgPSBoaWRlQWxsRWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMgPSB1cGRhdGVIaWdoU2NvcmVzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2hvd0VsZW1lbnRzKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBnaXZlbiBlbGVtZW50cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVFbGVtZW50cyhlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBtZW51IGJ5IGZpcnN0IGhpZGluZyBhbGwgb3RoZXIgbWVudXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7RE9NRWxlbWVudH0gbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzaG93TWVudShtZW51KSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsRWxlbWVudHMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbbWVudV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVBbGxNZW51cygpIHtcclxuICAgICAgICB2YXIgbWVudXMgPSBbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmVsZW1lbnRcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBtZW51cy5mb3JFYWNoKGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGlkZUFsbEVsZW1lbnRzKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50XSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgc2NvcmVzIGluIEFib3V0IG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlSGlnaFNjb3JlcygpIHtcclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy51bmlxdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBTb3J0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBIVE1MIGZvciBzY29yZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tpXSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDEpXHJcbiAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5saXN0KS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDU7IGogPCAxMDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbal0pIHtcclxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8ZGl2PicgKyBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbal0gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAyKVxyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzSHRtbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5saXN0UGFnZTIpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBDb250cm9scyB0aGUgcGxheWJhY2sgb2YgYW5pbWF0aW9uc1xyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBQbGF5QW5pbWF0aW9ucyA9IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gRXhwb3J0IGFuaW1hdGlvbnNcclxuICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51ID0gbWFpbk1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSA9IGhpZ2hTY29yZXNNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUyID0gaGlnaFNjb3Jlc01lbnUyO1xyXG4gICAgUGxheUFuaW1hdGlvbnMucGF1c2VNZW51ID0gcGF1c2VNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuYWJvdXRNZW51ID0gYWJvdXRNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSA9IGhvd1RvUGxheU1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5nYW1lT3Zlck1lbnUgPSBnYW1lT3Zlck1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5nYW1lRW5kTWVudSA9IGdhbWVFbmRNZW51O1xyXG5cclxuICAgIC8vIE1haW4gTWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBtYWluTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjbWFpbk1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjYsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNtYWluTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBoaWdoU2NvcmVzTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHNjb3Jlc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCBkaXYnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIaWdoIHNjb3JlcyBtZW51IHBhZ2UgMlxyXG4gICAgZnVuY3Rpb24gaGlnaFNjb3Jlc01lbnUyKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyIGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTIgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhvd1RvUGxheU1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2hvd1RvUGxheU1lbnUgLnRleHQnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFib3V0TWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjYWJvdXRNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXVzZSBNZW51IGFuaW1hdGlvbnNcclxuICAgIGZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiA3NSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnYW1lT3Zlck1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2dhbWVPdmVyTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNCxcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2dhbWVPdmVyTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2FtZUVuZE1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2dhbWVFbmRNZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC40LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjZ2FtZUVuZE1lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZ2FtZSBhY3Rpb25zIGFuZCBhY3Rpb24tcmVsYXRlZCBmdW5jdGlvbnNcclxuICAgIERELmdhbWUuYWN0aW9ucyA9IHtcclxuICAgICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgICAgcGxheU11c2ljOiBwbGF5TXVzaWMsXHJcbiAgICAgICAgY3JlYXRlSnVua3M6IGNyZWF0ZUp1bmtzLFxyXG4gICAgICAgIGNsZWFuVXA6IGNsZWFuVXAsXHJcbiAgICAgICAga2lsbFNwcml0ZToga2lsbFNwcml0ZSxcclxuICAgICAgICBjcmVhdGVTdGFyZmlzaDogY3JlYXRlU3RhcmZpc2gsXHJcbiAgICAgICAgdXBkYXRlSGlnaFNjb3JlczogdXBkYXRlSGlnaFNjb3JlcyxcclxuICAgICAgICBjcmVhdGVOZXRzOiBjcmVhdGVOZXRzLFxyXG4gICAgICAgIHJlc3RhcnQ6IHJlc3RhcnQsXHJcbiAgICAgICAgZ2FtZU92ZXI6IGdhbWVPdmVyLFxyXG4gICAgICAgIGdhbWVFbmQ6IGdhbWVFbmRcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBnYW1lXHJcbiAgICAgKiBcclxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBnYW1lIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcclxuICAgICAgICAvLyB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgLy8gdmFyIGggPSB3aW5kb3cuaW5uZXJIZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxMjgwLCA3MjAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgICAgICAgICAgcHJlbG9hZDogREQuZ2FtZS5wcmVsb2FkLFxyXG4gICAgICAgICAgICBjcmVhdGU6IERELmdhbWUuY3JlYXRlLFxyXG4gICAgICAgICAgICB1cGRhdGU6IERELmdhbWUudXBkYXRlLFxyXG4gICAgICAgICAgICByZW5kZXI6IERELmdhbWUucmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBsYXkgZ2FtZSBiYWNrZ3JvdW5kIG11c2ljXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBsYXlNdXNpYygpIHtcclxuICAgICAgICBpb24uc291bmQucGxheSgnR2FtZU11c2ljJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBKdW5rIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG4gICAgICpcclxuICAgICAqIENyZWF0ZXMgYSB0aG91c2FuZCBqdW5rIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlSnVua3MoKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIganVua3MgPSBbXTtcclxuICAgICAgICB2YXIganVuaztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBqdW5rXHJcbiAgICAgICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoXHJcbiAgICAgICAgICAgICAgICBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbihjdXJyZW50RWRnZSwgbmV4dEVkZ2UpLCAvLyBERC5wbGF5ZXIuZWxlbWVudC54ICsgMTAwLCAvLyBcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSxcclxuICAgICAgICAgICAgICAgIFsnYmFnJywgJ2JhcnJlbCcsICdib290JywgJ2JvdHRsZScsICd0eXJlJ11bSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMCwgNCldXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgcGh5c2ljc1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGp1bmspO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHN3aXRjaCAoanVuay5rZXkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JhZyc6XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjgsIDAuOCk7XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgxMCwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYmFycmVsJzpcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuOCwgMC44KTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDMwLCA0MCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdib290JzpcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNiwgMC42KTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDE1LCAxNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdib3R0bGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC41LCAwLjUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoNSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndHlyZSc6XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNSwgMjUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV2h1dD8nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU2V0IGp1bmsgdmVsb2NpdHlcclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBKdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVua3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcmZpc2ggZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcbiAgICAgKlxyXG4gICAgICogQ3JlYXRlcyBhIHRob3VzYW5kIHN0YXJmaXNoIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhcmZpc2goKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgc3RhcmZpc2hlcyA9IFtdO1xyXG4gICAgICAgIHZhciBzdGFyZmlzaDtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnc3RhcmZpc2gnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHN0YXJmaXNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBzdGFyZmlzaC5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBzdGFyZmlzaCB0byB1c2UgdGhlIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFyZmlzaGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoZXMucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLnB1c2goc3RhcmZpc2hlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhbiB1cCBqdW5rcywgc3RhcmZpc2hlcyBhbmQgbmV0c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjbGVhblVwKCkge1xyXG4gICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCA8PSAzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGVhbmluZyB1cCcpO1xyXG4gICAgICAgIERELmdhbWUud29ybGQuY2xlYW5pbmdVcCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIGp1bmtzXHJcbiAgICAgICAgdmFyIGp1bmtzVG9DbGVhciA9IERELm9iamVjdHMuanVua3MuZWxlbWVudHMuc3BsaWNlKDAsIERELm9iamVjdHMuanVua3MuZWxlbWVudHMubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAganVua3NUb0NsZWFyLmZvckVhY2goZnVuY3Rpb24oZ2VuZXJhdGlvbiwgaSkge1xyXG4gICAgICAgICAgICBnZW5lcmF0aW9uLmZvckVhY2goZnVuY3Rpb24oanVuaywgaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGp1bmspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIEhlbHBlci5pc1Zpc2libGUoanVuaykgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuanVua3MuZWxlbWVudHNbMF0ucHVzaChqdW5rKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBraWxsU3ByaXRlKGp1bmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbltqXSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAganVua3NUb0NsZWFyW2ldID0gbnVsbDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYW4gdXAgc3RhcnNcclxuICAgICAgICB2YXIgc3RhcnNUb0NsZWFyID0gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5zcGxpY2UoMCwgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5sZW5ndGggLSAzKTtcclxuICAgICAgICBzdGFyc1RvQ2xlYXIuZm9yRWFjaChmdW5jdGlvbihnZW5lcmF0aW9uLCBpKSB7XHJcbiAgICAgICAgICAgIGdlbmVyYXRpb24uZm9yRWFjaChmdW5jdGlvbihzdGFyZmlzaCwgaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJmaXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBIZWxwZXIuaXNWaXNpYmxlKHN0YXJmaXNoKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50c1swXS5wdXNoKHN0YXJmaXNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBraWxsU3ByaXRlKHN0YXJmaXNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25bal0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHN0YXJzVG9DbGVhcltpXSA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERELmdhbWUud29ybGQuY2xlYW5pbmdVcCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ2xlYW4gdXAgZG9uZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSBhIHNwcml0ZSBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIFxyXG4gICAgICogZ2FtZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtQaGFzZXIuU3ByaXRlfSBzcHJpdGVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24ga2lsbFNwcml0ZShzcHJpdGUpIHtcclxuICAgICAgICBzcHJpdGUuYm9keSA9IG51bGw7XHJcbiAgICAgICAgc3ByaXRlLmtpbGwoKTtcclxuXHJcbiAgICAgICAgaWYgKHNwcml0ZS5ncm91cCkge1xyXG4gICAgICAgICAgICBzcHJpdGUuZ3JvdXAucmVtb3ZlKHNwcml0ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzcHJpdGUucGFyZW50KSB7XHJcbiAgICAgICAgICAgIHNwcml0ZS5wYXJlbnQucmVtb3ZlQ2hpbGQoc3ByaXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgYW5kIHBlcnNpc3QgaGlnaCBzY29yZXMgYWZ0ZXJcclxuICAgICAqIGEgZ2FtZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHNjb3JlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUhpZ2hTY29yZXMoc2NvcmUpIHtcclxuICAgICAgICBpZiAoc2NvcmUuc2NvcmUgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgbmV3IHZhbHVlcyB0byBjdXJyZW50IHZhbHVlc1xyXG4gICAgICAgIHZhciBoaWdoU2NvcmVzID0gW3Njb3JlLnNjb3JlXS5jb25jYXQoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzKTtcclxuICAgICAgICB2YXIgc3RhcmZpc2ggPSBzY29yZS5zdGFyZmlzaCArIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWw7XHJcblxyXG4gICAgICAgIC8vIEdldCB1bmlxdWUgc2NvcmVzIGFuZCBzb3J0IGluIERFU0NcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy51bmlxdWUoKTtcclxuICAgICAgICBoaWdoU2NvcmVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSA8IGI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEdldCBvbmx5IHRvcCAxMCBzY29yZXNcclxuICAgICAgICBoaWdoU2NvcmVzID0gaGlnaFNjb3Jlcy5zcGxpY2UoMCwgOSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpbi1nYW1lIHZhbHVlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGVyc2lzdGVkIHZhbHVlc1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdoaWdoU2NvcmVzJywgaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgc2ltcGxlU3RvcmFnZS5zZXQoJ3N0YXJmaXNoJywgc3RhcmZpc2gpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgbmV0cyBmb3IgbWF6ZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVOZXRzKCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50RWRnZTtcclxuICAgICAgICB2YXIgbmV4dEVkZ2U7XHJcbiAgICAgICAgdmFyIG5ldHMgPSBbXTtcclxuICAgICAgICB2YXIgbmV0QTtcclxuICAgICAgICB2YXIgbmV0QjtcclxuICAgICAgICB2YXIgajtcclxuICAgICAgICB2YXIgd2FsbFg7XHJcbiAgICAgICAgdmFyIHdhbGxBWTtcclxuICAgICAgICB2YXIgd2FsbEJZO1xyXG5cclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgREQub2JqZWN0cy5uZXRzLmFtb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gREQucGxheWVyLmVsZW1lbnQueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgMjAwO1xyXG4gICAgICAgICAgICBuZXh0RWRnZSA9IGN1cnJlbnRFZGdlICsgZ2FtZS5jYW1lcmEud2lkdGg7XHJcblxyXG4gICAgICAgICAgICB3YWxsWCA9IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKGN1cnJlbnRFZGdlLCBuZXh0RWRnZSk7XHJcbiAgICAgICAgICAgIHdhbGxBWSA9IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKC01NjAsIDQyMCk7XHJcbiAgICAgICAgICAgIHdhbGxCWSA9IHdhbGxBWSArIDEwODAgKyBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigxMDAsIDUwMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh3YWxsQVkpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh3YWxsQlkpO1xyXG5cclxuICAgICAgICAgICAgbmV0QSA9IGdhbWUuYWRkLnNwcml0ZShjdXJyZW50RWRnZSArIHdhbGxYLCB3YWxsQVksICd0b3BuZXQnKTtcclxuICAgICAgICAgICAgbmV0QiA9IGdhbWUuYWRkLnNwcml0ZShjdXJyZW50RWRnZSArIHdhbGxYLCB3YWxsQlksICd0b3BuZXQnKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUobmV0QSk7XHJcbiAgICAgICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUobmV0Qik7XHJcblxyXG4gICAgICAgICAgICBuZXRBLmJvZHkuc3RhdGljID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV0Qi5ib2R5LnN0YXRpYyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBuZXRCLmJvZHkuYW5nbGUgPSAxODA7XHJcblxyXG4gICAgICAgICAgICBuZXRBLmJvZHkuc2V0UmVjdGFuZ2xlKDI1MCwgOTUwKTtcclxuICAgICAgICAgICAgbmV0Qi5ib2R5LnNldFJlY3RhbmdsZSgyNTAsIDk1MCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldC5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAgbmV0QS5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gTmV0cyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAgbmV0QS5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAgICAgbmV0Qi5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIG5ldHMucHVzaChuZXRBKTtcclxuICAgICAgICAgICAgbmV0cy5wdXNoKG5ldEIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgREQub2JqZWN0cy5uZXRzLmVsZW1lbnRzLnB1c2gobmV0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSByZXN0YXJ0XHJcbiAgICAgKiBcclxuICAgICAqIFJlc2V0IHJ1bm5pbmcgdmFyaWFibGVzIGFuZCByZXN0YXJ0IGdhbWUgYnlcclxuICAgICAqIGRlc3Ryb3lpbmcgY3VycmVudCBnYW1lIGNhY2hlIGFuZCBcclxuICAgICAqIHJlLWluaXRpYWxpemluZyB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZXN0YXJ0KCkge1xyXG4gICAgICAgIC8vIEtpbGwgb2ZmIGp1bmtzXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGp1bmssIGluZGV4KSB7XHJcbiAgICAgICAgLy8gICAgIGp1bmsuYm9keSA9IG51bGw7XHJcbiAgICAgICAgLy8gICAgIGp1bmsua2lsbCgpO1xyXG4gICAgICAgIC8vICAgICBERC5vYmplY3RzLmp1bmtzW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgIC8vIEtpbGwgb2ZmIHN0YXJmaXNoZXNcclxuICAgICAgICAvLyBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3RhcmZpc2gsIGluZGV4KSB7XHJcbiAgICAgICAgLy8gICAgIHN0YXJmaXNoLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBzdGFyZmlzaC5raWxsKCk7XHJcbiAgICAgICAgLy8gICAgIERELm9iamVjdHMuc3RhcmZpc2hbaW5kZXhdID0gbnVsbDtcclxuICAgICAgICAvLyB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQganVua3MgYW5kIHN0YXJmaXNoIGFycmF5c1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuanVua3MuZWxlbWVudHMgPSBbXTtcclxuICAgICAgICAvLyBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzID0gW107XHJcblxyXG4gICAgICAgIC8vIC8vIFJlc2V0IGdhbWUgd29ybGRcclxuICAgICAgICAvLyBERC5nYW1lLndvcmxkLmxldmVsID0gMTtcclxuXHJcbiAgICAgICAgLy8gLy8gUmVzZXQgc2NvcmVzXHJcbiAgICAgICAgLy8gREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gMDtcclxuICAgICAgICAvLyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsID0gMDtcclxuICAgICAgICAvLyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4gPSAwO1xyXG4gICAgICAgIC8vIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSAwO1xyXG4gICAgICAgIC8vIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSAwO1xyXG5cclxuICAgICAgICBERC5vYmplY3RzID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcHJpbnQub2JqZWN0cyk7XHJcbiAgICAgICAgREQudGV4dHVyZXMgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCBEREJsdWVwcmludC50ZXh0dXJlcyk7XHJcbiAgICAgICAgREQucGxheWVyID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcHJpbnQucGxheWVyKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgIERELmdhbWUucnVuRW5kID0gZmFsc2U7XHJcbiAgICAgICAgREQuZ2FtZS5jdXJzb3JzID0gbnVsbDtcclxuICAgICAgICBERC5nYW1lLndvcmxkID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcHJpbnQuZ2FtZS53b3JsZCk7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZSA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge30sIEREQmx1ZXByaW50LmdhbWUuc2NvcmUpO1xyXG4gICAgICAgIERELmdhbWUubW9kaWZpZXJzID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7fSwgRERCbHVlcHJpbnQuZ2FtZS5tb2RpZmllcnMpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8gPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCBEREJsdWVwcmludC5nYW1lLmF1ZGlvKTtcclxuXHJcbiAgICAgICAgSGVscGVyLnJlc3RvcmVTYXZlZFZhbHVlcygpO1xyXG5cclxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAgICAgKiBcclxuICAgICAqIEVuZHMgY3VycmVudCBnYW1lIGFuZCBkaXNwbGF5c1xyXG4gICAgICogZ2FtZSBvdmVyIG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XHJcbiAgICAgICAgdmFyIG5ld0hpZ2hlc3RTY29yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIURELmdhbWUuZ2FtZU92ZXJDYWxsZWQpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUubGFzdFJ1biA+IERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgbmV3SGlnaGVzdFNjb3JlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnVwZGF0ZUhpZ2hTY29yZXMoe1xyXG4gICAgICAgICAgICAgICAgc2NvcmU6IERELmdhbWUuc2NvcmUubGFzdFJ1bixcclxuICAgICAgICAgICAgICAgIHN0YXJmaXNoOiBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIFBsYXlBbmltYXRpb25zLmdhbWVPdmVyTWVudSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCBoYWxmIGEgc2Vjb25kLCB0aGVuIHRyaWdnZXIgc2NvcmUgZGlzcGxheSBhbmltYXRpb25cclxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc3RhcmZpc2gubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobmV3SGlnaGVzdFNjb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ2FtZU92ZXIoKSBmcm9tIGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSBlbmRcclxuICAgICAqIFxyXG4gICAgICogRW5kcyBjdXJyZW50IGdhbWUgYW5kIGRpc3BsYXlzXHJcbiAgICAgKiBnYW1lIGVuZCBtZW51XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdhbWVFbmQoKSB7XHJcbiAgICAgICAgdmFyIG5ld0hpZ2hlc3RTY29yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIURELmdhbWUuZ2FtZUVuZENhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVFbmRNZW51LmhpZ2hTY29yZS5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZUVuZE1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lRW5kTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZUVuZE1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuZ2FtZUVuZE1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIFBsYXlBbmltYXRpb25zLmdhbWVFbmRNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lRW5kTWVudS5oaWdoU2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZUVuZE1lbnUuc2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ2FtZUVuZCgpIGZyb20gYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICAgIERELmdhbWUuZ2FtZUVuZENhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8vIFNldHVwIGV2ZW50cyBhbmQgbGlzdGVuZXJzIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBVcGRhdGUgdmVyc2lvbiBudW1iZXIgaW4gQWJvdXQgbWVudVxyXG4gICAgRGlzcGxheURhdGEuYWJvdXRNZW51LnZlcnNpb24udGV4dChERC52ZXJzaW9uKTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IE5ldyBHYW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5uZXdHYW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhpZ2ggU2NvcmVzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5oaWdoU2NvcmVzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEhvdyB0byBQbGF5IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5ob3dUb1BsYXlCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBNYWluIG1lbnU6IEFib3V0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5tYWluTWVudS5hYm91dEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuYWJvdXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogbmV4dCBQYWdlIDIgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm5leHRQYWdlMkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudTIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTFcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UxQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBuZXh0IGFuZCBwcmV2IFBhZ2UgMiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTJCdG4pLmFkZChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnByZXZQYWdlMkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBQYWdlIDMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubmV4dFBhZ2UzQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFib3V0IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmFib3V0TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogYmFja2dyb3VuZCBvdmVybGF5XHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5vdmVybGF5KS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3VtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3VtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN0YXJ0IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdGFydEJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICBcclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoMCk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBRdWl0IHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgb3ZlciBtZW51OiBQbGF5IGFnYWluIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUucGxheUFnYWluQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBIVUQgc2NvcmVzXHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnNjb3JlLnRleHQoMCk7XHJcbiAgICAgICAgRGlzcGxheURhdGEuaHVkLnN0YXJmaXNoLnRleHQoMCk7XHJcblxyXG4gICAgICAgIC8vIFNob3cgSFVEIGFuZCBwYXVzZSBidXR0b25cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIE92ZXIgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcblxyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdhbWUgRW5kIE1lbnU6IFBsYXkgYWdhaW4gYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVFbmRNZW51LnBsYXlBZ2FpbkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICAvLyBTaG93IEhVRCBhbmQgcGF1c2UgYnV0dG9uXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LCBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgLy8gUmVzdGFydCBnYW1lXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gZmFsc2U7XHJcbiAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUmVzdW1lIGdhbWVcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBFbmQgTWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVFbmRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBGaXJzdCBydW4gd2lsbCBzaG93IE1haW4gTWVudSBhbmQgcGxheSBpdHMgYW5pbWF0aW9uXHJcbiAgICAgICAgREQuZ2FtZS5maXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIVUQ6IFBhdXNlIGJ1dHRvbjogaGFuZGxlcyBwYXVzZSBhY3RpdmF0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSBcclxuICAgICAqIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZFxyXG4gICAgICovXHJcbiAgICAkKERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMucGF1c2VNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBnYW1lIGZ1bmN0aW9uc1xyXG4gICAgREQuZ2FtZS5wcmVsb2FkID0gcHJlbG9hZDtcclxuICAgIERELmdhbWUuY3JlYXRlID0gY3JlYXRlO1xyXG4gICAgREQuZ2FtZS51cGRhdGUgPSB1cGRhdGU7XHJcbiAgICBERC5nYW1lLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByZWxvYWQgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzIGluY2x1ZGluZyBcclxuICAgICAqIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gICAgICAgIC8vIFRoaXMgc2V0cyBhIGxpbWl0IG9uIHRoZSB1cC1zY2FsZVxyXG4gICAgICAgIGdhbWUuc2NhbGUubWF4V2lkdGggPSAxMjgwO1xyXG4gICAgICAgIGdhbWUuc2NhbGUubWF4SGVpZ2h0ID0gNzIwO1xyXG5cclxuICAgICAgICAvLyBTZXQgc2NhbGUgbW9kZSBhbmQgcmVzaXplIGdhbWVcclxuICAgICAgICBnYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XHJcbiAgICAgICAgZ2FtZS5zY2FsZS5zZXRTY3JlZW5TaXplKCk7XHJcblxyXG4gICAgICAgIC8vIEJhY2tncm91bmRzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJ2Fzc2V0cy9pbWFnZXMvU3RhdGljQmFja2dyb3VuZC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMScsICdhc3NldHMvaW1hZ2VzL0xheWVyMS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICdhc3NldHMvaW1hZ2VzL0xheWVyMi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJ2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCd3YXZlcycsICdhc3NldHMvaW1hZ2VzL3dhdmVGaW5hbC5wbmcnLCAxMjgwLCA0NSk7XHJcblxyXG4gICAgICAgIC8vIEp1bmtzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWcnLCAnYXNzZXRzL2ltYWdlcy9iYWcucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYXJyZWwnLCAnYXNzZXRzL2ltYWdlcy9iYXJyZWwucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib290JywgJ2Fzc2V0cy9pbWFnZXMvYm9vdC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JvdHRsZScsICdhc3NldHMvaW1hZ2VzL2JvdHRsZS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3R5cmUnLCAnYXNzZXRzL2ltYWdlcy90eXJlLnBuZycpO1xyXG5cclxuICAgICAgICAvLyBPYmplY3RzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdjcmFiJywgJ2Fzc2V0cy9pbWFnZXMvYW5ncnljcmFiLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcmZpc2gnLCAnYXNzZXRzL2ltYWdlcy9zdGFyZmlzaC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2JhcnJpZXInLCAnYXNzZXRzL2ltYWdlcy9ib29zdC5wbmcnLCAyODgsIDI4OSk7XHJcblxyXG4gICAgICAgIC8vIE5ldHNcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ292ZXJuZXQnLCAnYXNzZXRzL2ltYWdlcy9vdmVybmV0LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYm90bmV0JywgJ2Fzc2V0cy9pbWFnZXMvYm90bmV0LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgndW5kZXJuZXQnLCAnYXNzZXRzL2ltYWdlcy91bmRlcm5ldC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3RvcG5ldCcsICdhc3NldHMvaW1hZ2VzL3RvcG5ldC5wbmcnKTtcclxuXHJcbiAgICAgICAgLy8gTWFpbiBjaGFyYWN0ZXJzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICdhc3NldHMvaW1hZ2VzL29pbGJhY2sucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkb2xwaGluJywgJ2Fzc2V0cy9pbWFnZXMvZG9scGhpbkZpbmFsLnBuZycsIDU3MywgMjk1KTtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9cclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ2p1bmtJbXBhY3QnLCAnYXNzZXRzL2F1ZGlvL3lleS53YXYnKTtcclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ0dhbWVTb3VuZCcsICdhc3NldHMvYXVkaW8vR2FtZVNvdW5kLm9nZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5hdWRpbygnSnVua3MnLCAnYXNzZXRzL2F1ZGlvL0p1bmtzLm9nZycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElvbiBzb3VuZHNcclxuICAgICAgICBpb24uc291bmQoe1xyXG4gICAgICAgICAgICBzb3VuZHM6IFt7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnR2FtZU11c2ljJyxcclxuICAgICAgICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1dLFxyXG5cclxuICAgICAgICAgICAgcGF0aDogJ2Fzc2V0cy9hdWRpby8nLFxyXG4gICAgICAgICAgICBwcmVsb2FkOiB0cnVlLFxyXG4gICAgICAgICAgICB2b2x1bWU6IDFcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIGFkdmFuY2VkIHRpbWluZyBmb3IgRlBTIGNvdW50ZXJcclxuICAgICAgICAvLyBnYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGZ1bmN0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIFdoZXJlIHdlIGNyZWF0ZSBhbmQgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAgICAgKiBmb3IgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlKCkgeyBcclxuICAgICAgICAvLyBQbGF5IGJhY2tncm91bmQgbXVzaWMgb24gbG9hZFxyXG4gICAgICAgIC8vIGdhbWUubG9hZC5vbkxvYWRDb21wbGV0ZS5hZGQoREQuZ2FtZS5hY3Rpb25zLnBsYXlNdXNpYygpLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMzAwMDAwLCAxMDgwKTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDMwMDAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDMwMDAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMzAwMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc3BhcmVuY3kgb2YgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYWxwaGEgPSAxO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBiYWNrZ3JvdW5kIGxheWVycyBpbW11bmUgdG8gY29sbGlzaW9uc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBBZGQgcGxheWVyXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuMiwgMC4yKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJvb3N0IGFuZCBzZXR1cCBwaHlzaWNzXHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnYmFycmllcicpO1xyXG4gICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgPSAwO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJvb3N0IGFuaW1hdGlvbnNcclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdib29zdCcsIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTFdLCAxMCwgdHJ1ZSk7XHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ2Jvb3N0Jyk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnBsYXllci5lbGVtZW50KTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50IGFuZCBlbmFibGUgUGh5c2ljc1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgxNjAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFdhdmVzXHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3dhdmUnLCBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gU2FuZFxyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAxMDgwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLnNhbmQuZWxlbWVudCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmFscGhhID0gMDtcclxuXHJcbiAgICAgICAgLy8gU291bmQgc3R1ZmZcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZCA9IGdhbWUuYWRkLmF1ZGlvKCdKdW5rcycpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFsbG93TXVsdGlwbGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBzb3VuZHNcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhcnJlbCcsIDAsIDIpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcignYm90dGxlJywgMiwgMC41KTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhZycsIDMsIDAuNCk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib290JywgMy41LCAwLjEpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcigndHlyZScsIDQsIDAuMik7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdzdGFyZmlzaCcsIDMuNiwgMC4zNSk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib29zdCcsIDQuNSwgMSk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBhbmltYXRpb25zXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDddLCAxNSwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ2NvbGxpZGUnLCBbOSwgOCwgNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sIDEwMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBjb2xsaXNpb24gZ3JvdXBzXHJcbiAgICAgICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgICAgIC8vIENvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzICh3aGljaCB3ZSBkbylcclxuICAgICAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGp1bmtzLCBzdGFyZmlzaGVzIGFuZCBuZXRzXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUp1bmtzKCk7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZVN0YXJmaXNoKCk7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZU5ldHMoKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sYXN0R2VuZXJhdGVkUG9zaXRpb24gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBjb2xsaXNpb25zXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXApO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQudGV4dHVyZXMuc2FuZC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAvLyBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwganVua0hpdCwgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCwgY29sbGVjdFN0YXJmaXNoLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwLCBoaXRXYXZlcywgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwLCBoaXRTYW5kLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCwgbmV0SGl0LCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAga2V5Ym9hcmQgY29udHJvbHNcclxuICAgICAgICBERC5nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dXAgY2FtZXJhXHJcbiAgICAgICAgZ2FtZS5jYW1lcmEuZm9sbG93KERELnBsYXllci5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy8gUGF1c2UgYW5kIHNob3cgTWFpbiBNZW51IG9uIGZpcnN0IHJ1blxyXG4gICAgICAgIGlmIChERC5nYW1lLmZpcnN0UnVuKSB7XHJcbiAgICAgICAgICAgIC8vIERELmdhbWUuYWN0aW9ucy5wbGF5TXVzaWMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgICAgIGlmICggZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGxheWVyIGVuZFxyXG4gICAgICAgIGlmICggREQucGxheWVyLmVsZW1lbnQueCA+IChnYW1lLmNhbWVyYS53aWR0aCAqIDQpICkgeyAvLyBERC5wbGF5ZXIuZWxlbWVudC54ID4gKDMwMDAwMCAtIGdhbWUuY2FtZXJhLndpZHRoIC8gMiApICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZUVuZCgpO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE9uIGRlbWFuZCBnZW5lcmF0aW9uXHJcbiAgICAgICAgaWYgKERELnBsYXllci5lbGVtZW50LnggPj0gREQuZ2FtZS53b3JsZC5sYXN0R2VuZXJhdGVkUG9zaXRpb24gKyBnYW1lLmNhbWVyYS53aWR0aCArIDIwMCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlSnVua3MoKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZVN0YXJmaXNoKCk7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVOZXRzKCk7XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDbGVhbnVwIFxyXG4gICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCA+PSAyICYgIURELmdhbWUud29ybGQuY2xlYW5pbmdVcCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuY2xlYW5VcCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWN0aXZhdGUgYm9vc3RcclxuICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGlmICgoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gIC0wLjQgKiAoREQucGxheWVyLnNwZWVkIC8gREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgZmFkZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFscGhhICs9IC0wLjM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChmYWRlT3V0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMudG90YWwgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBwb3NpdGlvbnMgb2YgY2hhcmFjdGVyc1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS54ID0gZ2FtZS5jYW1lcmEueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgNTtcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueSA9IDIwO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCd3YXZlJyk7XHJcblxyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnggPSBnYW1lLmNhbWVyYS54O1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnkgPSAxMDgwO1xyXG5cclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwLjAwMDAwMDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS4gYW5nbGUgPSAwLjAwMDAwMDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGV4dGVybmFsIGVsZW1lbnRzXHJcbiAgICAgICAgaWYgKCFERC5nYW1lLnJ1bkVuZCkge1xyXG4gICAgICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gXHJcbiAgICAgICAgICAgIC8vIFRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9ICgoREQucGxheWVyLmVsZW1lbnQueCAvIDQwMCkgLSA4KSAqIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXI7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIHByb2dyZXNzIGJhclxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuc3BpbGwud2lkdGgoIChERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQueCAqIDUwMCApIC8gMzAwMDAwICk7XHJcblxyXG4gICAgICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgZG9scGhpbiB4XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcclxuICAgICAgICAgICAgICAgICdsZWZ0JywgKCAoREQucGxheWVyLmVsZW1lbnQueCAqIDQ5MiApIC8gMzAwMDAwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbmltYXA6IFVwZGF0ZSBkb2xwaGluIHlcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmRvbHBoaW4uY3NzKFxyXG4gICAgICAgICAgICAgICAgJ3RvcCcsICggKERELnBsYXllci5lbGVtZW50LnkgKiAyMCkgLyAxMDgwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHZlbG9jaXR5IGFuZCBwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgKyAoMzAgKiBERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmJvZHkueCA9IERELnBsYXllci5lbGVtZW50LmJvZHkueCAtIDEwMDtcclxuICAgICAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5ib2R5LnkgPSBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnkgLSAxNTA7XHJcbiAgICBcclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxyXG4gICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMjgwICsgKDI4ICogREQuZ2FtZS53b3JsZC5sZXZlbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIURELm9iamVjdHMuanVua3MuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBzcGVlZCB1cFxyXG4gICAgICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSkge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS53b3JsZC5sZXZlbCA8IDE5KSB7XHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSGFuZGxlIEJvb3N0XHJcbiAgICAgICAgaWYgKERELmdhbWUuY3Vyc29ycy5yaWdodC5pc0Rvd24gfHwgaXNUb3VjaGluZ1JpZ2h0KCkpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQucGxheSgnYm9vc3QnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1biArPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gKERELnBsYXllci5zcGVlZCAqIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcbiAgICAgICAgICAgICAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5hbHBoYSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgY29udHJvbHNcclxuICAgICAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBpc1RvdWNoaW5nVXAoKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChERC5nYW1lLmN1cnNvcnMuZG93bi5pc0Rvd24gfHwgaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIC8vIGdhbWUuZGVidWcudGV4dChnYW1lLnRpbWUuZnBzIHx8ICctLScsIDIsIDE0LCAnIzAwZmYwMCcpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2NvcmVcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSBERC5nYW1lLnNjb3JlLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc3RhcmZpc2hcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCAhPT0gREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IGlmIG9pbHNwaWxsIGlzIGNvdmVyaW5nIERvbHBoaW5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZG9scGhpbklzQ292ZXJlZCgpIHtcclxuICAgICAgICBpZiAoKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC0gREQucGxheWVyLmVsZW1lbnQueCkgPiAtNzUwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIGxlZnQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVG91Y2hpbmdVcCgpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPCA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55IDwgMzYwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54IDwgNTAwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA8IDM2MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlY3QgdG91Y2ggaW5wdXQgaW4gdXBwZXIgcmlnaHQgaGFsZiBvZiBzY3JlZW5cclxuICAgICAqIGZvciBib3RoIHBvaW50ZXIxIChmaXJzdCBmaW5nZXIpICYgcG9pbnRlcjIgKHNlY29uZCBmaW5nZXIpXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVG91Y2hpbmdEb3duKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA8IDUwMCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPiAzNjApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPCA1MDAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55ID4gMzYwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNUb3VjaGluZ1JpZ2h0KCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDc4MCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA8IDc4MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5jcmVhc2UgcGxheWVyIHNwZWVkIGFmdGVyXHJcbiAgICAgKiBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGp1bmtIaXQocGxheWVyLCBqdW5rKSB7XHJcbiAgICAgICAgLy8gUGxheSBqdW5rIGhpdCBzb3VuZFxyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLnBsYXkoanVuay5zcHJpdGUua2V5KTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIURELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAvLyBUaGUgc3BlZWQgdGhhdCB0aGUgcGxheWVyIHNob3VsZCBiZSB0cmF2ZWxsaW5nIGF0IGlzIHN0b3JlZCwgXHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSB0aGUgZnVuY3Rpb24gYmVsb3cgd2lsbCBzbG93IGRvd24gcmF0aGVyIHRoYW4gc3BlZWQgdXAuXHJcbiAgICAgICAgICAgIHZhciBvcmlnaW5hbFNwZWVkID0gREQucGxheWVyLnNwZWVkO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0dGluZyBhIHNsb3cgc3BlZWQgc3RyYWlnaHQgYXdheSBzbyBpdCBkb2Vzbid0IGZlZWwgbGFnZ3lcclxuICAgICAgICAgICAgREQucGxheWVyLnNwZWVkID0gb3JpZ2luYWxTcGVlZCAqIChERC5vYmplY3RzLmp1bmtzLnNsb3cgLyBERC5nYW1lLndvcmxkLmxldmVsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNldEludGVydmFsIG1lYW5zIHRoYXQgSSBjYW4gcGVyZm9ybSB0aGlzIG92ZXIgc29tZSB0aW1lIFxyXG4gICAgICAgICAgICAvLyBhbmQgZ3JhZHVhbGx5IHdpdGhvdXQgdXNpbmcgUGhhc2VycyBzdHVwaWQgdGltZSBmdW5jdGlvbi5cclxuICAgICAgICAgICAgLy8gVGltZSBvbiB0aGUgc2Vjb25kIGFyZ3VtZW50IGlzIGluIG1pbGxpc2Vjb25kcy4gXHJcbiAgICAgICAgICAgIHZhciBzcGVlZFVwID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5zbG93IDw9IDEuMDUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIG9yaWdpbmFsU3BlZWQgaXMgdXNlZCB0byBwcm92aWRlIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGEgZ3JhZHVhbCBzcGVlZCB1cCB0aGF0IGZlZWxzIGEgbGl0dGxlIG1vcmUgbmF0dXJhbC5cclxuICAgICAgICAgICAgICAgICAgICBERC5wbGF5ZXIuc3BlZWQgPSBvcmlnaW5hbFNwZWVkICogREQub2JqZWN0cy5qdW5rcy5zbG93O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEV2ZXJ5IHNlY29uZCB0aGUgZG9scGhpbiBnZXRzIDEwJSBjbG9zZXIgdG8gZnVsbCBzcGVlZC5cclxuICAgICAgICAgICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLnNsb3cgKz0gMC4wNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIERldGVjdGluZyB3aGVuIHRoZSBtYXhpbXVtIHNwZWVkIGlzIHJlYWNoZWQsIHNvIHRoZSBmdW5jdGlvbiBjYW4gZW5kLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVuZCB0aGUgaW50ZXJ2YWwgdGhhdCBpcyBjYXVzaW5nIHRoZSBjaGFuZ2UgaW4gZG9scGhpbiBzcGVlZC5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LngpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc3BlZWRVcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXNldHRpbmcgdGhlIHNsb3dpbmcgZWZmZWN0IGFmdGVyIHRoZSBub3JtYWwgc3BlZWQgaXMgcmVhY2hlZCBhZ2Fpbi5cclxuICAgICAgICAgICAgREQub2JqZWN0cy5qdW5rcy5zbG93ID0gMC40O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBwbGF5ZXIgY29sbGlzaW9uIHdpdGggd2F2ZXNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGl0V2F2ZXMoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dhdmUgaGl0Jyk7XHJcblxyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IC01MDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ICs9IC0xMDA7XHJcbiAgICAgICAgc2V0VGltZW91dChzdG9wQWNjZWxlcmF0aW9uLCAxMDApO1xyXG4gICAgICAgIERELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCBzdGFyZmlzaFxyXG4gICAgICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHBsYXllclxyXG4gICAgICogQHBhcmFtICB7R2FtZS5zcHJpdGV9IHN0YXJmaXNoXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNvbGxlY3RTdGFyZmlzaChwbGF5ZXIsIHN0YXJmaXNoKSB7XHJcbiAgICAgICAgdmFyIGlkID0gc3RhcmZpc2guZGF0YS5pZDtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMua2lsbFNwcml0ZShzdGFyZmlzaC5zcHJpdGUpO1xyXG5cclxuICAgICAgICBpZiAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMuaW5kZXhPZihpZCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLnBsYXkoJ3N0YXJmaXNoJyk7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1biArPSAxO1xyXG4gICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IDE7XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guY29sbGVjdGVkSWRzLnB1c2goaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhcmZpc2ggPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcCBwbGF5ZXIncyBib3VuY2UgYWNjZWxlcmF0aW9uXHJcbiAgICAgKiBhZnRlciBjb2xsaWRpbmcgd2l0aCB3YXZlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdG9wQWNjZWxlcmF0aW9uKCkge1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5ncmF2aXR5LnkgPSAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCArPSAxMDA7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnU3RvcCBBY2NlbGVyYXRpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBwbGF5ZXIgY29sbGlzaW9uIHdpdGggc2FuZFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaXRTYW5kKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTYW5kIGhhcyBiZWVuIGhpdCcpO1xyXG5cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG5ldEhpdChwbGF5ZXIsIG5ldCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCduZXRIaXQnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhuZXQpO1xyXG4gICAgICAgIC8vIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAvLyAgICAgbmV0LmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBuZXQua2lsbCgpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIFJlc3RvcmUgcGVyc2lzdGVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuSGVscGVyLnJlc3RvcmVTYXZlZFZhbHVlcygpO1xyXG5cclxuLy8gRXZlcnl0aGluZyBpcyBkZWNsYXJlZDogaW5pdGlhbGl6ZSBnYW1lXHJcbkRELmdhbWUuYWN0aW9ucy5zdGFydCgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=