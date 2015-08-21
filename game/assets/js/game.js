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
        createJunks: createJunks,
        cleanUp: cleanUp,
        killSprite: killSprite,
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
        game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', {
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
            switch (junk.key) {
                case 'bag':
                    console.log('is bag');
                    junk.scale.setTo(0.8, 0.8);
                    junk.body.setRectangle(10 ,10);

                    break;
                case 'barrel':
                    junk.scale.setTo(0.8, 0.8);
                    junk.body.setRectangle(30, 40);
                    console.log('is barrel');
                    break;
                case 'boot':
                    junk.scale.setTo(0.6, 0.6);
                    junk.body.setRectangle(15, 15);
                    console.log('is boot');
                    break;
                case 'bottle':
                    junk.scale.setTo(0.5, 0.5);
                    junk.body.setRectangle(5, 10);
                    console.log('is bottle');
                    break;
                case 'tyre':
                    console.log('is tyre');
                    junk.scale.setTo(0.6, 0.6);
                    junk.body.setRectangle(25, 25);
                    break;
                default:
                    console.log('whut?');
            };

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

        var toClear = DD.objects.junks.elements.splice(0, DD.objects.junks.elements.length - 3);

        toClear.forEach(function(generation, i) {
            generation.forEach(function(junk, j) {
                if (junk) {
                    killSprite(junk);
                    generation[j] = null;
                }
            });

            toClear[i] = null;
        });

        DD.game.world.cleaningUp = false;

        console.log('Cleaning up done');
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
        var currentEdge;
        var nextEdge;
        var nets = [];
        var net;
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

            // netes will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            netA.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);
            netB.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);
            netA.collectionIndex = j;
            netB.collectionIndex = j;

            nets.push(netA);
            nets.push(netB);
        }

        DD.objects.nets.elements.push(netA);
        DD.objects.nets.elements.push(netB);
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

        //Resetting values that seem to get altered at some point
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

        ion.sound({
            sounds: [
                {
                    name: "GameMusic",
                    loop: true,
                    multiplay: false
                }
            ],

            path: "/assets/audio/",
            preload: true,
            volume: 1
        });

        // Backgrounds
        game.load.image('background', '/assets/images/StaticBackground.png');
        game.load.image('backgroundL1', '/assets/images/Layer1.png');
        game.load.image('backgroundL2', '/assets/images/Layer2.png');
        game.load.image('seafloor', '/assets/images/SeaFloor.png');
        game.load.spritesheet('waves', '/assets/images/waveFinal.png', 1280, 45);

        // Junks
        game.load.image('bag', '/assets/images/bag.png');
        game.load.image('barrel', '/assets/images/barrel.png');
        game.load.image('boot', '/assets/images/boot.png');
        game.load.image('bottle', '/assets/images/bottle.png');
        game.load.image('tyre', '/assets/images/tyre.png');
        game.load.image('botnet', '/assets/images/botnet.png');
        game.load.image('topnet', '/assets/images/topnet.png');

        // Objects
        game.load.image('crab', '/assets/images/angrycrab.png');
        game.load.image('starfish', '/assets/images/starfish.png');

        // Main characters
        game.load.image('oilspill', '/assets/images/oilback.png');
        game.load.spritesheet('dolphin', '/assets/images/dolphinFinal.png', 573, 295);
        game.load.spritesheet('barrier', '/assets/images/boost.png', 288, 289);

        // Audio
        game.load.audio('Junks', '/assets/audio/Junks.ogg');

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

        game.load.onLoadComplete.add(playMusic, this);

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

        DD.player.barrier.element = game.add.sprite(0, 0, 'barrier');
        game.physics.enable(DD.player.barrier.element, Phaser.Physics.ARCADE);
        DD.player.barrier.element.alpha = 0;
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

        // Generate junks and starfishes
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
            //playMusic();

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

        if (DD.game.modifiers.boost.active) {

            if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 300) {
                
                DD.game.modifiers.total +=  -0.4 *(DD.player.speed/DD.game.modifiers.boost.total);
                
                var fadeOut = setInterval(function(){
                    if (DD.game.modifiers.boost.total !== 0) {
                        DD.player.barrier.element.alpha += -0.3;
                    }
                    else {
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

        DD.textures.waves.element.body.x = game.camera.x + 647;
        DD.textures.waves.element.body.y = 20;
        DD.textures.sand.element.body.x = game.camera.x;
        DD.textures.sand.element.body.y = 1080;
        DD.textures.waves.element.animations.play('wave');

        DD.textures.waves.element.body.angle = 0.000000;
        DD.textures.sand.element.body. angle = 0.000000;

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

        if (DD.player.element.body.x >= (DD.game.world.interval * DD.game.world.level)) {
            if (DD.game.world.level < 19) {
                DD.game.world.level += 1;
                console.log('Level (speed) up!');
            }
        }

        if (DD.game.cursors.right.isDown) {
            if (DD.game.modifiers.boost.charges > 0) {
                if (!DD.game.modifiers.boost.active) {
                    DD.game.modifiers.boost.charges += -1;
                    DD.game.score.starfish.lastRun += -1;
                    DD.game.modifiers.total += (DD.player.speed*DD.game.modifiers.boost.total);
                    DD.game.modifiers.boost.active = true;
                    DD.game.modifiers.boost.begin = DD.player.element.x;
                    DD.game.audio.JunkSound.play('boost');
                    DD.player.barrier.element.alpha = 1;
                    console.log('BOOST!');
                }
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
     * Increase player speed after
     * collision with junk
     */
    function junkHit(player, junk) {

        DD.game.audio.JunkSound.play(junk.sprite.key);
        
        if (!DD.game.modifiers.boost.active) {
            // The speed that the player should be travelling at is stored, 
            // otherwise the function below will slow down rather than speed up.
            var originalSpeed = DD.player.speed;

            // Setting a slow speed straight away so it doesn't feel laggy
            DD.player.speed = originalSpeed * (DD.objects.junks.slow/DD.game.world.level);

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
        console.log('Stop Acceleration');
        DD.player.accelerationActive = false;
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

    function playMusic() {
        ion.sound.play("GameMusic");
    }

})();

// Restore persisted values from local storage
DD.game.actions.restoreSavedValues();

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZWdpc3RlciBBcnJheS5nZXRVbmlxdWUoKVxyXG5BcnJheS5wcm90b3R5cGUudW5pcXVlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbyA9IHt9O1xyXG4gICAgdmFyIGkgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciBsID0gdGhpcy5sZW5ndGg7XHJcbiAgICB2YXIgciA9IFtdO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcclxuICAgICAgICBvW3RoaXNbaV1dID0gdGhpc1tpXTtcclxuICAgIH0gXHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuICAgICAgICByLnB1c2gob1tpXSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxudmFyIEhlbHBlciA9IHtcclxuICAgIGdldFJhbmRvbUludEJldHdlZW46IGdldFJhbmRvbUludEJldHdlZW5cclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldFJhbmRvbUludEJldHdlZW4obWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG59XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcbid1c2Ugc3RyaWN0JzsgLy8gU2hvd3MgYWxsIGVycm9ycyBhbmQgd2FybmluZ3NcclxuXHJcbi8qKlxyXG4gKiBHbG9iYWwgREQgb2JqZWN0XHJcbiAqIFxyXG4gKiBDb250YWlucyBnYW1lIHN0YXRlIGluZGVwZW5kZW50IG9mIFBoYXNlclxyXG4gKi9cclxudmFyIEREID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcclxuXHJcbiAgICBvYmplY3RzOiB7XHJcbiAgICAgICAgc3BpbGw6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGdyYWRpZW50OiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDEsIDIpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxlY3RlZElkczogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAganVua3M6IHtcclxuICAgICAgICAgICAgYW1vdW50OiBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigxMCwgMTUpLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIHNsb3c6IDAuNCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBuZXRzOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMCwgMSksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHRleHR1cmVzOiB7XHJcbiAgICAgICAgbGF5ZXJBOiBudWxsLFxyXG4gICAgICAgIGxheWVyQjogbnVsbCxcclxuICAgICAgICBsYXllckM6IG51bGwsXHJcbiAgICAgICAgd2F2ZXM6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNhbmQ6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNwZWVkOiA1MFxyXG4gICAgfSxcclxuXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBhY2NlbGVyYXRpb25BY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIHNwZWVkOiAzMDAsXHJcbiAgICAgICAgdmVydFNwZWVkOiA1MDAsXHJcbiAgICAgICAgZWxlbWVudDogbnVsbCxcclxuICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICBhbmdsZTogMjAsXHJcbiAgICAgICAgYmFycmllcjoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lOiB7XHJcbiAgICAgICAgZ2FtZU92ZXJDYWxsZWQ6IGZhbHNlLFxyXG4gICAgICAgIGZpcnN0UnVuOiB0cnVlLFxyXG4gICAgICAgIHJ1bkVuZDogZmFsc2UsXHJcbiAgICAgICAgY3Vyc29yczogbnVsbCxcclxuXHJcbiAgICAgICAgd29ybGQ6IHtcclxuICAgICAgICAgICAgY2xlYW5pbmdVcDogZmFsc2UsXHJcbiAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRQb3NpdGlvbjogMCxcclxuICAgICAgICAgICAgbGV2ZWw6IDEsXHJcbiAgICAgICAgICAgIGludGVydmFsOiAyMDAwXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgdGV4dDogbnVsbCxcclxuICAgICAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGxhc3RSdW46IDAsXHJcbiAgICAgICAgICAgIGxhc3RGcmFtZVZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFyZmlzaDogMCxcclxuICAgICAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hTY29yZXM6IFtdXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbW9kaWZpZXJzOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiAwLFxyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBib29zdDoge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAyLjUsXHJcbiAgICAgICAgICAgICAgICBiZWdpbjogMCxcclxuICAgICAgICAgICAgICAgIGNoYXJnZXM6IDBcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IDFcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhdWRpbzoge1xyXG4gICAgICAgICAgICBqdW5rQ29sbGlkZTogbnVsbCxcclxuICAgICAgICAgICAgR2FtZVNvdW5kOiBudWxsLFxyXG4gICAgICAgICAgICBib3R0bGU6IG51bGwsXHJcbiAgICAgICAgICAgIGJhcnJlbDogbnVsbCxcclxuICAgICAgICAgICAgcGxhc3RpY0JhZzogbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIEp1c3QgYSBmcmllbmRseSByZW1pbmRlclxyXG5jb25zb2xlLmluZm8oJ0RvbHBoaW4gRGl2ZSB2JyArIERELnZlcnNpb24pO1xyXG5cclxuLy8gR2xvYmFsIGdhbWUgb2JqZWN0XHJcbnZhciBnYW1lO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLyoqXHJcbiAqIEhvbGRzIHJlZmVyZW5jZXMgdG8gYWxsIG9uLXNjcmVlbiBlbGVtZW50c1xyXG4gKiAoZXh0ZXJhbCB0byBQaGFzZXIpXHJcbiAqIFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudmFyIERpc3BsYXlEYXRhID0ge1xyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lJylcclxuICAgIH0sXHJcblxyXG4gICAgaHVkOiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2h1ZCcpLFxyXG4gICAgICAgIHNjb3JlOiAkKCcjaHVkLXNjb3JlJyksXHJcbiAgICAgICAgc3RhcmZpc2g6ICQoJyNodWQtc3RhcmZpc2gnKSxcclxuICAgICAgICBwYXVzZUJ0bjogJCgnI2h1ZC1wYXVzZUJ0bicpLFxyXG4gICAgICAgIHByb2dyZXNzQmFyOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNodWQtcHJvZ3Jlc3NiYXInKSxcclxuICAgICAgICAgICAgc3BpbGw6ICQoJyNodWQtcHJvZ3Jlc3NiYXItb2lsc3BpbGwnKSxcclxuICAgICAgICAgICAgZG9scGhpbjogJCgnI2h1ZC1wcm9ncmVzc2Jhci1kb2xwaGluJylcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG1haW5NZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI21haW5NZW51JyksXHJcbiAgICAgICAgbmV3R2FtZUJ0bjogJCgnI21haW5NZW51LW5ld0dhbWUnKSxcclxuICAgICAgICBoaWdoU2NvcmVzQnRuOiAkKCcjbWFpbk1lbnUtaGlnaFNjb3JlcycpLFxyXG4gICAgICAgIGhvd1RvUGxheUJ0bjogJCgnI21haW5NZW51LWhvd1RvUGxheScpLFxyXG4gICAgICAgIGFib3V0QnRuOiAkKCcjbWFpbk1lbnUtYWJvdXQnKVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWdoU2NvcmVzTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNoaWdoU2NvcmVzTWVudScpLFxyXG4gICAgICAgIGxpc3Q6ICQoJyNoaWdoU2NvcmVzTWVudS1saXN0JyksXHJcbiAgICAgICAgbGlzdFBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdC1wYWdlMicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNoaWdoU2NvcmVzTWVudS1uZXh0LXBhZ2UyQnRuJyksXHJcbiAgICAgICAgcHJldlBhZ2UxQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtcHJldi1wYWdlMUJ0bicpLFxyXG5cclxuICAgICAgICBwYWdlMTogJCgnI2hpZ2hTY29yZXNNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMicpXHJcbiAgICB9LFxyXG5cclxuICAgIGhvd1RvUGxheU1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaG93VG9QbGF5TWVudScpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjaG93VG9QbGF5TWVudS1tYWluTWVudScpLFxyXG4gICAgICAgIG5leHRQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtcHJldi1wYWdlMUJ0bicpLFxyXG4gICAgICAgIG5leHRQYWdlM0J0bjogJCgnI2hvd1RvUGxheU1lbnUtbmV4dC1wYWdlM0J0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMkJ0bjogJCgnI2hvd1RvUGxheU1lbnUtcHJldi1wYWdlMkJ0bicpLFxyXG5cclxuICAgICAgICBwYWdlMTogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTEnKSxcclxuICAgICAgICBwYWdlMjogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTInKSxcclxuICAgICAgICBwYWdlMzogJCgnI2hvd1RvUGxheU1lbnUtcGFnZTMnKVxyXG4gICAgfSxcclxuXHJcbiAgICBhYm91dE1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjYWJvdXRNZW51JyksXHJcbiAgICAgICAgdmVyc2lvbjogJCgnI2Fib3V0TWVudS12ZXJzaW9uJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNhYm91dE1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBwYXVzZU1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjcGF1c2VNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI3BhdXNlTWVudSAub3ZlcmxheScpLFxyXG4gICAgICAgIHJlc3VtZUJ0bjogJCgnI3BhdXNlTWVudS1yZXN1bWUnKSxcclxuICAgICAgICByZXN0YXJ0QnRuOiAkKCcjcGF1c2VNZW51LXJlc3RhcnQnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI3BhdXNlTWVudS1tYWluTWVudScpXHJcbiAgICB9LFxyXG5cclxuICAgIGdhbWVPdmVyTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUnKSxcclxuICAgICAgICBvdmVybGF5OiAkKCcjZ2FtZU92ZXJNZW51IC5vdmVybGF5JyksXHJcblxyXG4gICAgICAgIGhpZ2hTY29yZToge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZScpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtaGlnaFNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1zY29yZScpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUgLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGFyZmlzaDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51LXN0YXJmaXNoJyksXHJcbiAgICAgICAgICAgIG51bWJlcjogJCgnI2dhbWVPdmVyTWVudS1zdGFyZmlzaCAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHBsYXlBZ2FpbkJ0bjogJCgnI2dhbWVPdmVyTWVudS1wbGF5QWdhaW4nKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2dhbWVPdmVyTWVudS1tYWluTWVudScpXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRGlzcGxheSBhbmQgbWVudXMgbWFuaXB1bGF0aW9uXHJcbiAqIG9iamVjdFxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5ID0ge307XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gRXhwb3J0IGZ1bmN0aW9uc1xyXG4gICAgRGlzcGxheS5zaG93RWxlbWVudHMgPSBzaG93RWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyA9IGhpZGVFbGVtZW50cztcclxuICAgIERpc3BsYXkuc2hvd01lbnUgPSBzaG93TWVudTtcclxuICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzID0gaGlkZUFsbE1lbnVzO1xyXG4gICAgRGlzcGxheS5oaWRlQWxsRWxlbWVudHMgPSBoaWRlQWxsRWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LnVwZGF0ZUhpZ2hTY29yZXMgPSB1cGRhdGVIaWdoU2NvcmVzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBnaXZlbiBlbGVtZW50IG9uIHNjcmVlblxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2hvd0VsZW1lbnRzKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBnaXZlbiBlbGVtZW50cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVFbGVtZW50cyhlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBtZW51IGJ5IGZpcnN0IGhpZGluZyBhbGwgb3RoZXIgbWVudXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7RE9NRWxlbWVudH0gbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzaG93TWVudShtZW51KSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsRWxlbWVudHMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbbWVudV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgbWVudXMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVBbGxNZW51cygpIHtcclxuICAgICAgICB2YXIgbWVudXMgPSBbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQsIFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5wYXVzZU1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmVsZW1lbnRcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBtZW51cy5mb3JFYWNoKGZ1bmN0aW9uKG1lbnUpIHtcclxuICAgICAgICAgICAgbWVudS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGlkZUFsbEVsZW1lbnRzKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50XSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgc2NvcmVzIGluIEFib3V0IG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlSGlnaFNjb3JlcygpIHtcclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy51bmlxdWUoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBTb3J0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBIVE1MIGZvciBzY29yZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3Jlc0h0bWwgPSAnJztcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc0h0bWwgKz0gJzxkaXY+JyArIERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1tpXSArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHVwZGF0ZWQgc2NvcmVzIChwYWdlIDEpXHJcbiAgICAgICAgaWYgKERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5saXN0KS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDU7IGogPCAxMDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbal0pIHtcclxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8ZGl2PicgKyBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbal0gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAyKVxyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzSHRtbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5saXN0UGFnZTIpLmh0bWwoaGlnaFNjb3Jlc0h0bWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8qKlxyXG4gKiBDb250cm9scyB0aGUgcGxheWJhY2sgb2YgYW5pbWF0aW9uc1xyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBQbGF5QW5pbWF0aW9ucyA9IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gRXhwb3J0IGFuaW1hdGlvbnNcclxuICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51ID0gbWFpbk1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSA9IGhpZ2hTY29yZXNNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUyID0gaGlnaFNjb3Jlc01lbnUyO1xyXG4gICAgUGxheUFuaW1hdGlvbnMucGF1c2VNZW51ID0gcGF1c2VNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuYWJvdXRNZW51ID0gYWJvdXRNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSA9IGhvd1RvUGxheU1lbnU7XHJcbiAgICBQbGF5QW5pbWF0aW9ucy5nYW1lT3Zlck1lbnUgPSBnYW1lT3Zlck1lbnU7XHJcblxyXG4gICAgLy8gTWFpbiBNZW51IGFuaW1hdGlvbnNcclxuICAgIGZ1bmN0aW9uIG1haW5NZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgbWVudSB0aXRsZVxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNtYWluTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNixcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI21haW5NZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51IGFuaW1hdGlvbnNcclxuICAgIGZ1bmN0aW9uIGhpZ2hTY29yZXNNZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0IGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhpZ2ggc2NvcmVzIG1lbnUgcGFnZSAyXHJcbiAgICBmdW5jdGlvbiBoaWdoU2NvcmVzTWVudTIoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBzY29yZXNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTIgZGl2JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1wYWdlMiBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaG93VG9QbGF5TWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjaG93VG9QbGF5TWVudSAudGV4dCcsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWJvdXRNZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgdGV4dFxyXG4gICAgICAgIFR3ZWVuTWF4LmZyb20oJyNhYm91dE1lbnUgLnRleHQnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhdXNlIE1lbnUgYW5pbWF0aW9uc1xyXG4gICAgZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjcGF1c2VNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDc1LFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdhbWVPdmVyTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjZ2FtZU92ZXJNZW51IGgxJywgMSwge1xyXG4gICAgICAgICAgICBzY2FsZTogMC40LFxyXG4gICAgICAgICAgICBlYXNlOiBCb3VuY2UuZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjZ2FtZU92ZXJNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gRXhwb3J0IGdhbWUgYWN0aW9ucyBhbmQgYWN0aW9uLXJlbGF0ZWQgZnVuY3Rpb25zXHJcbiAgICBERC5nYW1lLmFjdGlvbnMgPSB7XHJcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgIGNyZWF0ZUp1bmtzOiBjcmVhdGVKdW5rcyxcclxuICAgICAgICBjbGVhblVwOiBjbGVhblVwLFxyXG4gICAgICAgIGtpbGxTcHJpdGU6IGtpbGxTcHJpdGUsXHJcbiAgICAgICAgY3JlYXRlU3RhcmZpc2g6IGNyZWF0ZVN0YXJmaXNoLFxyXG4gICAgICAgIHJlc3RvcmVTYXZlZFZhbHVlczogcmVzdG9yZVNhdmVkVmFsdWVzLFxyXG4gICAgICAgIHVwZGF0ZUhpZ2hTY29yZXM6IHVwZGF0ZUhpZ2hTY29yZXMsXHJcbiAgICAgICAgY3JlYXRlTmV0czogY3JlYXRlTmV0cyxcclxuICAgICAgICByZXN0YXJ0OiByZXN0YXJ0LFxyXG4gICAgICAgIGdhbWVPdmVyOiBnYW1lT3ZlclxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGdhbWVcclxuICAgICAqIFxyXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgZ2xvYmFsIGdhbWUgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTI4MCwgNzIwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCB7XHJcbiAgICAgICAgICAgIHByZWxvYWQ6IERELmdhbWUucHJlbG9hZCxcclxuICAgICAgICAgICAgY3JlYXRlOiBERC5nYW1lLmNyZWF0ZSxcclxuICAgICAgICAgICAgdXBkYXRlOiBERC5nYW1lLnVwZGF0ZSxcclxuICAgICAgICAgICAgcmVuZGVyOiBERC5nYW1lLnJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBKdW5rIGdlbmVyYXRpb24gb24gZ2FtZS5jcmVhdGUoKVxyXG4gICAgICpcclxuICAgICAqIENyZWF0ZXMgYSB0aG91c2FuZCBqdW5rIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlSnVua3MoKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIganVua3MgPSBbXTtcclxuICAgICAgICB2YXIganVuaztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IERELm9iamVjdHMuanVua3MuYW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBqdW5rXHJcbiAgICAgICAgICAgIGp1bmsgPSBnYW1lLmFkZC5zcHJpdGUoXHJcbiAgICAgICAgICAgICAgICBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbihjdXJyZW50RWRnZSwgbmV4dEVkZ2UpLCAvLyBERC5wbGF5ZXIuZWxlbWVudC54ICsgMTAwLCAvLyBcclxuICAgICAgICAgICAgICAgIGdhbWUud29ybGQucmFuZG9tWSxcclxuICAgICAgICAgICAgICAgIFsnYmFnJywgJ2JhcnJlbCcsICdib290JywgJ2JvdHRsZScsICd0eXJlJ11bSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMCwgNCldXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgcGh5c2ljc1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKGp1bmspO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHNpemUgb2YgdGhlIG9iamVjdCB3aWxsIGxpa2VseSBjaGFuZ2UgdG9vLCBpZiB0aGF0IGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHN3aXRjaCAoanVuay5rZXkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JhZyc6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIGJhZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC44LCAwLjgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMTAgLDEwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdiYXJyZWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC44LCAwLjgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRSZWN0YW5nbGUoMzAsIDQwKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXMgYmFycmVsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdib290JzpcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNiwgMC42KTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDE1LCAxNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIGJvb3QnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5zY2FsZS5zZXRUbygwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgICAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSg1LCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIGJvdHRsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndHlyZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIHR5cmUnKTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLnNjYWxlLnNldFRvKDAuNiwgMC42KTtcclxuICAgICAgICAgICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI1LCAyNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3aHV0PycpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVua3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcmZpc2ggZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcbiAgICAgKlxyXG4gICAgICogQ3JlYXRlcyBhIHRob3VzYW5kIHN0YXJmaXNoIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhcmZpc2goKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgc3RhcmZpc2hlcyA9IFtdO1xyXG4gICAgICAgIHZhciBzdGFyZmlzaDtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnc3RhcmZpc2gnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHN0YXJmaXNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBzdGFyZmlzaC5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBzdGFyZmlzaCB0byB1c2UgdGhlIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFyZmlzaGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAgICAgc3RhcmZpc2guY29sbGVjdGlvbkluZGV4ID0gajtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoZXMucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLnB1c2goc3RhcmZpc2hlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW5VcCgpIHtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPD0gMykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ2xlYW5pbmcgdXAnKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5jbGVhbmluZ1VwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdmFyIHRvQ2xlYXIgPSBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnNwbGljZSgwLCBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCAtIDMpO1xyXG5cclxuICAgICAgICB0b0NsZWFyLmZvckVhY2goZnVuY3Rpb24oZ2VuZXJhdGlvbiwgaSkge1xyXG4gICAgICAgICAgICBnZW5lcmF0aW9uLmZvckVhY2goZnVuY3Rpb24oanVuaywgaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGp1bmspIHtcclxuICAgICAgICAgICAgICAgICAgICBraWxsU3ByaXRlKGp1bmspO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25bal0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRvQ2xlYXJbaV0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NsZWFuaW5nIHVwIGRvbmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBraWxsU3ByaXRlKHNwcml0ZSkge1xyXG4gICAgICAgIHNwcml0ZS5ib2R5ID0gbnVsbDtcclxuICAgICAgICBzcHJpdGUua2lsbCgpO1xyXG5cclxuICAgICAgICBpZiAoc3ByaXRlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHNwcml0ZS5ncm91cC5yZW1vdmUoc3ByaXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNwcml0ZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXN0b3JlIHNhdmVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgIGZ1bmN0aW9uIHJlc3RvcmVTYXZlZFZhbHVlcygpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIaWdoU2NvcmVzKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoID0gc2NvcmUuc3RhcmZpc2ggKyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdzdGFyZmlzaCcsIHN0YXJmaXNoKTtcclxuICAgIH1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZU5ldHMoKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgbmV0cyA9IFtdO1xyXG4gICAgICAgIHZhciBuZXQ7XHJcbiAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgdmFyIHdhbGxYO1xyXG4gICAgICAgIHZhciB3YWxsQVk7XHJcbiAgICAgICAgdmFyIHdhbGxCWTtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMubmV0cy5hbW91bnQ7IGorKykge1xyXG4gICAgICAgICAgICBjdXJyZW50RWRnZSA9IERELnBsYXllci5lbGVtZW50LnggKyAoZ2FtZS5jYW1lcmEud2lkdGggLyAyKSArIDIwMDtcclxuICAgICAgICAgICAgbmV4dEVkZ2UgPSBjdXJyZW50RWRnZSArIGdhbWUuY2FtZXJhLndpZHRoO1xyXG5cclxuICAgICAgICAgICAgd2FsbFggPSBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbihjdXJyZW50RWRnZSwgbmV4dEVkZ2UpO1xyXG4gICAgICAgICAgICB3YWxsQVkgPSBIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbigtNTYwLCA0MjApO1xyXG4gICAgICAgICAgICB3YWxsQlkgPSB3YWxsQVkgKyAxMDgwICsgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMTAwLCA1MDApO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cod2FsbEFZKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cod2FsbEJZKTtcclxuXHJcbiAgICAgICAgICAgIG5ldEEgPSBnYW1lLmFkZC5zcHJpdGUoY3VycmVudEVkZ2UgKyB3YWxsWCwgd2FsbEFZLCAndG9wbmV0Jyk7XHJcbiAgICAgICAgICAgIG5ldEIgPSBnYW1lLmFkZC5zcHJpdGUoY3VycmVudEVkZ2UgKyB3YWxsWCwgd2FsbEJZLCAndG9wbmV0Jyk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldEEpO1xyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKG5ldEIpO1xyXG4gICAgICAgICAgICBuZXRBLmJvZHkuc3RhdGljID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV0Qi5ib2R5LnN0YXRpYyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBuZXRCLmJvZHkuYW5nbGUgPSAxODA7XHJcblxyXG4gICAgICAgICAgICBuZXRBLmJvZHkuc2V0UmVjdGFuZ2xlKDI1MCwgOTUwKTtcclxuICAgICAgICAgICAgbmV0Qi5ib2R5LnNldFJlY3RhbmdsZSgyNTAsIDk1MCk7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldC5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAgbmV0QS5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELm9iamVjdHMubmV0cy5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXApO1xyXG5cclxuICAgICAgICAgICAgLy8gbmV0ZXMgd2lsbCBjb2xsaWRlIGFnYWluc3QgdGhlbXNlbHZlcyBhbmQgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAvLyBJZiB5b3UgZG9uJ3Qgc2V0IHRoaXMgdGhleSdsbCBub3QgY29sbGlkZSB3aXRoIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmlyc3QgcGFyYW1ldGVyIGlzIGVpdGhlciBhbiBhcnJheSBvciBhIHNpbmdsZSBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgICAgIG5ldEEuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgICAgIG5ldEIuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgICAgIG5ldEEuY29sbGVjdGlvbkluZGV4ID0gajtcclxuICAgICAgICAgICAgbmV0Qi5jb2xsZWN0aW9uSW5kZXggPSBqO1xyXG5cclxuICAgICAgICAgICAgbmV0cy5wdXNoKG5ldEEpO1xyXG4gICAgICAgICAgICBuZXRzLnB1c2gobmV0Qik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXRBKTtcclxuICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXRCKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIHJlc3RhcnRcclxuICAgICAqIFxyXG4gICAgICogUmVzZXQgcnVubmluZyB2YXJpYWJsZXMgYW5kIHJlc3RhcnQgZ2FtZSBieVxyXG4gICAgICogZGVzdHJveWluZyBjdXJyZW50IGdhbWUgY2FjaGUgYW5kIFxyXG4gICAgICogcmUtaW5pdGlhbGl6aW5nIHRoZSBnYW1lXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gS2lsbCBvZmYganVua3NcclxuICAgICAgICAvLyBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oanVuaywgaW5kZXgpIHtcclxuICAgICAgICAvLyAgICAganVuay5ib2R5ID0gbnVsbDtcclxuICAgICAgICAvLyAgICAganVuay5raWxsKCk7XHJcbiAgICAgICAgLy8gICAgIERELm9iamVjdHMuanVua3NbaW5kZXhdID0gbnVsbDtcclxuICAgICAgICAvLyB9KTtcclxuXHJcbiAgICAgICAgLy8gS2lsbCBvZmYgc3RhcmZpc2hlc1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdGFyZmlzaCwgaW5kZXgpIHtcclxuICAgICAgICAvLyAgICAgc3RhcmZpc2guYm9keSA9IG51bGw7XHJcbiAgICAgICAgLy8gICAgIHN0YXJmaXNoLmtpbGwoKTtcclxuICAgICAgICAvLyAgICAgREQub2JqZWN0cy5zdGFyZmlzaFtpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBqdW5rcyBhbmQgc3RhcmZpc2ggYXJyYXlzXHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guZWxlbWVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgZ2FtZSB3b3JsZFxyXG4gICAgICAgIERELmdhbWUud29ybGQubGV2ZWwgPSAxO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RSdW4gPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSAwO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSAwO1xyXG5cclxuICAgICAgICBnYW1lLmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lID0gbnVsbDtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgZ2FtZSBvdmVyXHJcbiAgICAgKiBcclxuICAgICAqIEVuZHMgY3VycmVudCBnYW1lIGFuZCBkaXNwbGF5c1xyXG4gICAgICogZ2FtZSBvdmVyIG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XHJcbiAgICAgICAgdmFyIG5ld0hpZ2hlc3RTY29yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIURELmdhbWUuZ2FtZU92ZXJDYWxsZWQpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5ydW5FbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKERELmdhbWUuc2NvcmUubGFzdFJ1biA+IERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgbmV3SGlnaGVzdFNjb3JlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnVwZGF0ZUhpZ2hTY29yZXMoe1xyXG4gICAgICAgICAgICAgICAgc2NvcmU6IERELmdhbWUuc2NvcmUubGFzdFJ1bixcclxuICAgICAgICAgICAgICAgIHN0YXJmaXNoOiBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgIFBsYXlBbmltYXRpb25zLmdhbWVPdmVyTWVudSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCBoYWxmIGEgc2Vjb25kLCB0aGVuIHRyaWdnZXIgc2NvcmUgZGlzcGxheSBhbmltYXRpb25cclxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc3RhcmZpc2gubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobmV3SGlnaGVzdFNjb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LmhpZ2hTY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuc2NvcmUubnVtYmVyLnRleHQoREQuZ2FtZS5zY29yZS5sYXN0UnVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ2FtZU92ZXIoKSBmcm9tIGJlaW5nIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAgICBERC5nYW1lLmdhbWVPdmVyQ2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuLy8gU2V0dXAgZXZlbnRzIGFuZCBsaXN0ZW5lcnMgd2hlbiB0aGUgcGFnZSBpcyByZWFkeVxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIC8vIFVwZGF0ZSB2ZXJzaW9uIG51bWJlciBpbiBBYm91dCBtZW51XHJcbiAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUudmVyc2lvbi50ZXh0KERELnZlcnNpb24pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogTmV3IEdhbWUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51Lm5ld0dhbWVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSGlnaCBTY29yZXMgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmhpZ2hTY29yZXNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkudXBkYXRlSGlnaFNjb3JlcygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogSG93IHRvIFBsYXkgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51Lmhvd1RvUGxheUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE1haW4gbWVudTogQWJvdXQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLm1haW5NZW51LmFib3V0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmFib3V0TWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5hYm91dE1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBuZXh0IFBhZ2UgMiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubmV4dFBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogcHJldiBQYWdlIDEgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IFJldHVybiB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTFCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTFcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgYW5kIHByZXYgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlMkJ0bikuYWRkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucHJldlBhZ2UyQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTIsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggdG8gUGxheSBtZW51OiBuZXh0IFBhZ2UgMyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5uZXh0UGFnZTNCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTNcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWJvdXQgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuYWJvdXRNZW51Lm1haW5NZW51QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLm1haW5NZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLm1haW5NZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBiYWNrZ3JvdW5kIG92ZXJsYXlcclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51Lm92ZXJsYXkpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdW1lIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUucmVzdW1lQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFJlc3RhcnQgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN0YXJ0QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgc2NvcmUgaGVyZVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFJlc2V0IEhVRCBzY29yZXNcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dCgwKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcblxyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IFF1aXQgdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIEZpcnN0IHJ1biB3aWxsIHNob3cgTWFpbiBNZW51IGFuZCBwbGF5IGl0cyBhbmltYXRpb25cclxuICAgICAgICBERC5nYW1lLmZpcnN0UnVuID0gdHJ1ZTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR2FtZSBvdmVyIG1lbnU6IFBsYXkgYWdhaW4gYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5wbGF5QWdhaW5CdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IEhVRCBzY29yZXNcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dCgwKTtcclxuICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dCgwKTtcclxuXHJcbiAgICAgICAgLy8gU2hvdyBIVUQgYW5kIHBhdXNlIGJ1dHRvblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudCwgRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcblxyXG4gICAgICAgIC8vUmVzZXR0aW5nIHZhbHVlcyB0aGF0IHNlZW0gdG8gZ2V0IGFsdGVyZWQgYXQgc29tZSBwb2ludFxyXG4gICAgICAgIERELnBsYXllci5zcGVlZCA9IDMwMDtcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLnNwZWVkID0gMjgwO1xyXG4gICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIE92ZXIgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcblxyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFVEOiBQYXVzZSBidXR0b246IGhhbmRsZXMgcGF1c2UgYWN0aXZhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAgICAgKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWRcclxuICAgICAqL1xyXG4gICAgJChEaXNwbGF5RGF0YS5odWQucGF1c2VCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50XSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZ2FtZSBmdW5jdGlvbnNcclxuICAgIERELmdhbWUucHJlbG9hZCA9IHByZWxvYWQ7XHJcbiAgICBERC5nYW1lLmNyZWF0ZSA9IGNyZWF0ZTtcclxuICAgIERELmdhbWUudXBkYXRlID0gdXBkYXRlO1xyXG4gICAgREQuZ2FtZS5yZW5kZXIgPSByZW5kZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAgICAgKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuXHJcbiAgICAgICAgaW9uLnNvdW5kKHtcclxuICAgICAgICAgICAgc291bmRzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJHYW1lTXVzaWNcIixcclxuICAgICAgICAgICAgICAgICAgICBsb29wOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxheTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuXHJcbiAgICAgICAgICAgIHBhdGg6IFwiL2Fzc2V0cy9hdWRpby9cIixcclxuICAgICAgICAgICAgcHJlbG9hZDogdHJ1ZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJhY2tncm91bmRzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL1N0YXRpY0JhY2tncm91bmQucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kTDEnLCAnL2Fzc2V0cy9pbWFnZXMvTGF5ZXIxLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwyJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnd2F2ZXMnLCAnL2Fzc2V0cy9pbWFnZXMvd2F2ZUZpbmFsLnBuZycsIDEyODAsIDQ1KTtcclxuXHJcbiAgICAgICAgLy8gSnVua3NcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhZycsICcvYXNzZXRzL2ltYWdlcy9iYWcucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdiYXJyZWwnLCAnL2Fzc2V0cy9pbWFnZXMvYmFycmVsLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYm9vdCcsICcvYXNzZXRzL2ltYWdlcy9ib290LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYm90dGxlJywgJy9hc3NldHMvaW1hZ2VzL2JvdHRsZS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3R5cmUnLCAnL2Fzc2V0cy9pbWFnZXMvdHlyZS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JvdG5ldCcsICcvYXNzZXRzL2ltYWdlcy9ib3RuZXQucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCd0b3BuZXQnLCAnL2Fzc2V0cy9pbWFnZXMvdG9wbmV0LnBuZycpO1xyXG5cclxuICAgICAgICAvLyBPYmplY3RzXHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdjcmFiJywgJy9hc3NldHMvaW1hZ2VzL2FuZ3J5Y3JhYi5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXJmaXNoJywgJy9hc3NldHMvaW1hZ2VzL3N0YXJmaXNoLnBuZycpO1xyXG5cclxuICAgICAgICAvLyBNYWluIGNoYXJhY3RlcnNcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL29pbGJhY2sucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkb2xwaGluJywgJy9hc3NldHMvaW1hZ2VzL2RvbHBoaW5GaW5hbC5wbmcnLCA1NzMsIDI5NSk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdiYXJyaWVyJywgJy9hc3NldHMvaW1hZ2VzL2Jvb3N0LnBuZycsIDI4OCwgMjg5KTtcclxuXHJcbiAgICAgICAgLy8gQXVkaW9cclxuICAgICAgICBnYW1lLmxvYWQuYXVkaW8oJ0p1bmtzJywgJy9hc3NldHMvYXVkaW8vSnVua3Mub2dnJyk7XHJcblxyXG4gICAgICAgIC8vIEVuYWJsZSBhZHZhbmNlZCB0aW1pbmcgZm9yIEZQUyBjb3VudGVyXHJcbiAgICAgICAgZ2FtZS50aW1lLmFkdmFuY2VkVGltaW5nID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBmdW5jdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBXaGVyZSB3ZSBjcmVhdGUgYW5kIGluaXRpYWxpemUgb2JqZWN0c1xyXG4gICAgICogZm9yIHRoZSBnYW1lXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAgICAgZ2FtZS5sb2FkLm9uTG9hZENvbXBsZXRlLmFkZChwbGF5TXVzaWMsIHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBTZXQgYm91bmRhcmllcyBvZiB0aGUgd29ybGRcclxuICAgICAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMDAsIDEwODApO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgdGhlIFAyIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQSA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQiA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwxJyk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJDID0gZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kTDInKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRyYW5zcGFyZW5jeSBvZiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5hbHBoYSA9IDE7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmFscGhhID0gMC42O1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5hbHBoYSA9IDE7XHJcblxyXG4gICAgICAgIC8vIEVuYWJsZSBQaHlzaWNzIG9uIGJhY2tncm91bmQgbGF5ZXJzXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckEsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckIsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC50ZXh0dXJlcy5sYXllckMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIFBhcmFsbGF4IHNjcm9sbGluZyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMyAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDIgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJDLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgxICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG5cclxuICAgICAgICAvLyBNYWtlIGJhY2tncm91bmQgbGF5ZXJzIGltbXVuZSB0byBjb2xsaXNpb25zXHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJBLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIEFkZCBwbGF5ZXJcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgzMDAwLCBnYW1lLndvcmxkLmNlbnRlclksICdkb2xwaGluJyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuc2NhbGUuc2V0VG8oMC4yLCAwLjIpO1xyXG5cclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdiYXJyaWVyJyk7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLmVuYWJsZShERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgPSAwO1xyXG4gICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ2Jvb3N0JywgWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMV0sIDEwLCB0cnVlKTtcclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnYm9vc3QnKTtcclxuXHJcbiAgICAgICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQucGxheWVyLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQWRkIG9pbHNwaWxsIGVsZW1lbnQgYW5kIGVuYWJsZSBQaHlzaWNzXHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDE2MDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQub2JqZWN0cy5zcGlsbC5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy8gV2F2ZXNcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICd3YXZlcycpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5hbmltYXRpb25zLmFkZCgnd2F2ZScsIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSwgMTAsIHRydWUpO1xyXG5cclxuICAgICAgICAvLyBTYW5kXHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50ID0gZ2FtZS5hZGQuc3ByaXRlKDAsIDEwODAsICd3YXZlcycpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUoREQudGV4dHVyZXMuc2FuZC5lbGVtZW50KTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYWxwaGEgPSAwO1xyXG5cclxuICAgICAgICAvLyBTb3VuZCBzdHVmZlxyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kID0gZ2FtZS5hZGQuYXVkaW8oJ0p1bmtzJyk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWxsb3dNdWx0aXBsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcignYmFycmVsJywgMCwgMik7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib3R0bGUnLCAyLCAwLjUpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcignYmFnJywgMywgMC40KTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2Jvb3QnLCAzLjUsIDAuMSk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCd0eXJlJywgNCwgMC4yKTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ3N0YXJmaXNoJywgMy42LCAwLjM1KTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2Jvb3N0JywgNC41LCAxKTtcclxuXHJcbiAgICAgICAgLy8gUGxheWVyIGFuaW1hdGlvbnNcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbMCwgMSwgMiwgMywgNCwgNSwgNiwgN10sIDE1LCB0cnVlKTtcclxuICAgICAgICAvLyBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLmFkZCgnY29sbGlkZScsIFs5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxLCAwXSwgMTAwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGNvbGxpc2lvbiBncm91cHNcclxuICAgICAgICBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5zcGlsbC5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLm5ldHMuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBwYXJ0IGlzIHZpdGFsIGlmIHlvdSB3YW50IHRoZSBvYmplY3RzIHdpdGggdGhlaXIgb3duIGNvbGxpc2lvbiBncm91cHMgdG8gc3RpbGwgXHJcbiAgICAgICAgLy8gQ29sbGlkZSB3aXRoIHRoZSB3b3JsZCBib3VuZHMgKHdoaWNoIHdlIGRvKVxyXG4gICAgICAgIC8vIFdoYXQgdGhpcyBkb2VzIGlzIGFkanVzdCB0aGUgYm91bmRzIHRvIHVzZSBpdHMgb3duIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIudXBkYXRlQm91bmRzQ29sbGlzaW9uR3JvdXAoKTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUganVua3MgYW5kIHN0YXJmaXNoZXNcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlSnVua3MoKTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlU3RhcmZpc2goKTtcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlTmV0cygpO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIGNvbGxpc2lvbnNcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAsIERELmdhbWUuYWN0aW9ucy5nYW1lT3ZlciwgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0U3RhcmZpc2gsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAsIGhpdFdhdmVzLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAsIGhpdFNhbmQsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwLCBuZXRIaXQsIHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBrZXlib2FyZCBjb250cm9sc1xyXG4gICAgICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgICAgICBnYW1lLmNhbWVyYS5mb2xsb3coREQucGxheWVyLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICAgICAgaWYgKERELmdhbWUuZmlyc3RSdW4pIHtcclxuICAgICAgICAgICAgLy9wbGF5TXVzaWMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgICAgIGlmICggZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT24gZGVtYW5kIGdlbmVyYXRpb25cclxuICAgICAgICBpZiAoREQucGxheWVyLmVsZW1lbnQueCA+PSBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiArIGdhbWUuY2FtZXJhLndpZHRoICsgMjAwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVKdW5rcygpO1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuY3JlYXRlU3RhcmZpc2goKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZU5ldHMoKTtcclxuICAgICAgICAgICAgREQuZ2FtZS53b3JsZC5sYXN0R2VuZXJhdGVkUG9zaXRpb24gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2xlYW51cCBcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPj0gMiAmICFERC5nYW1lLndvcmxkLmNsZWFuaW5nVXApIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNsZWFuVXAoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgoREQucGxheWVyLmVsZW1lbnQueCAtIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luKSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMudG90YWwgKz0gIC0wLjQgKihERC5wbGF5ZXIuc3BlZWQvREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgZmFkZU91dCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgKz0gLTAuMztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZmFkZU91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLnRvdGFsIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jvb3N0IEVuZCA6KCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueCA9IGdhbWUuY2FtZXJhLnggKyA2NDc7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnkgPSAyMDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS54ID0gZ2FtZS5jYW1lcmEueDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS55ID0gMTA4MDtcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgnd2F2ZScpO1xyXG5cclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkuYW5nbGUgPSAwLjAwMDAwMDtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS4gYW5nbGUgPSAwLjAwMDAwMDtcclxuXHJcbiAgICAgICAgLy8gR292ZXJucyBhbmQgY29udHJvbHMgYm9vc3RcclxuICAgICAgICBpZiAoIURELmdhbWUucnVuRW5kKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXRzIERELmdhbWUuc2NvcmUubGFzdFJ1biBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllci4gXHJcbiAgICAgICAgICAgIC8vIFRoZSAtOCBjb21wZW5zYXRlcyBmb3IgdGhlIHBvc2l0aW9uIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIHdvcmxkXHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9ICgoREQucGxheWVyLmVsZW1lbnQueCAvIDQwMCkgLSA4KSAqIERELmdhbWUubW9kaWZpZXJzLm11bHRpcGxpZXI7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IHBhcnNlSW50KERELmdhbWUuc2NvcmUubGFzdFJ1biwgMTApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluaW1hcDogdXBkYXRlIHByb2dyZXNzIGJhclxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuc3BpbGwud2lkdGgoIChERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQueCAqIDUwMCApIC8gMTkyMDAwICk7XHJcblxyXG4gICAgICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgZG9scGhpbiB4XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5kb2xwaGluLmNzcyhcclxuICAgICAgICAgICAgICAgICdsZWZ0JywgKCAoREQucGxheWVyLmVsZW1lbnQueCAqIDQ5MiApIC8gMTkyMDAwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbmltYXA6IFVwZGF0ZSBkb2xwaGluIHlcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmRvbHBoaW4uY3NzKFxyXG4gICAgICAgICAgICAgICAgJ3RvcCcsICggKERELnBsYXllci5lbGVtZW50LnkgKiAyMCkgLyAxMDgwIClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHZlbG9jaXR5IGFuZCBwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgKyAoMzAgKiBERC5nYW1lLndvcmxkLmxldmVsKSArIERELmdhbWUubW9kaWZpZXJzLnRvdGFsO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmJvZHkueCA9IERELnBsYXllci5lbGVtZW50LmJvZHkueCAtIDEwMDtcclxuICAgICAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5ib2R5LnkgPSBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnkgLSAxNTA7XHJcbiAgICBcclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBvaWxzcGlsbCB2ZWxvY2l0eVxyXG4gICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMjgwICsgKDI4ICogREQuZ2FtZS53b3JsZC5sZXZlbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIURELm9iamVjdHMuanVua3MuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBwbGF5ZXIncyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoREQucGxheWVyLmVsZW1lbnQuYm9keS54ID49IChERC5nYW1lLndvcmxkLmludGVydmFsICogREQuZ2FtZS53b3JsZC5sZXZlbCkpIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUud29ybGQubGV2ZWwgPCAxOSkge1xyXG4gICAgICAgICAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCArPSAxO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xldmVsIChzcGVlZCkgdXAhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChERC5nYW1lLmN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5jaGFyZ2VzICs9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1biArPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSAoREQucGxheWVyLnNwZWVkKkRELmdhbWUubW9kaWZpZXJzLmJvb3N0LnRvdGFsKTtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmJlZ2luID0gREQucGxheWVyLmVsZW1lbnQueDtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5wbGF5KCdib29zdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYWxwaGEgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCT09TVCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBjaGFyZ2VzIGxlZnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKERELmdhbWUuY3Vyc29ycy51cC5pc0Rvd24gfHwgaXNUb3VjaGluZ1VwKCkpIHtcclxuICAgICAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIERELnBsYXllci52ZXJ0U3BlZWQ7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gLTEgKiBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoREQuZ2FtZS5jdXJzb3JzLmRvd24uaXNEb3duIHx8IGlzVG91Y2hpbmdEb3duKCkpIHtcclxuICAgICAgICAgICAgaWYgKCFERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gREQucGxheWVyLmFuZ2xlO1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgICAgICBnYW1lLmRlYnVnLnRleHQoZ2FtZS50aW1lLmZwcyB8fCAnLS0nLCAyLCAxNCwgJyMwMGZmMDAnKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHNjb3JlXHJcbiAgICAgICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgIT09IERELmdhbWUuc2NvcmUubGFzdFJ1bikge1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuc2NvcmUudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnNjb3JlID0gREQuZ2FtZS5zY29yZS5sYXN0UnVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHN0YXJmaXNoXHJcbiAgICAgICAgaWYgKERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggIT09IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bikge1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuc3RhcmZpc2gudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICBERC5nYW1lLnNjb3JlLmxhc3RGcmFtZVZhbHVlLnN0YXJmaXNoID0gREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZ2FtZS5kZWJ1Zy50ZXh0KCdTY29yZSBNdWx0aXBsaWVyOiAnICsgREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllciwgMzIsIDcyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCBpZiBvaWxzcGlsbCBpcyBjb3ZlcmluZyBEb2xwaGluXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGRvbHBoaW5Jc0NvdmVyZWQoKSB7XHJcbiAgICAgICAgaWYgKChERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQueCAtIERELnBsYXllci5lbGVtZW50LngpID4gLTc1MCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiB1cHBlciByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNUb3VjaGluZ1VwKCkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjEuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnkgPCAzNjApIHx8XHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIyLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi55IDwgMzYwKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdCB0b3VjaCBpbnB1dCBpbiBsb3dlciByaWdodCBoYWxmIG9mIHNjcmVlblxyXG4gICAgICogZm9yIGJvdGggcG9pbnRlcjEgKGZpcnN0IGZpbmdlcikgJiBwb2ludGVyMiAoc2Vjb25kIGZpbmdlcilcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNUb3VjaGluZ0Rvd24oKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA+IDM2MCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPiAzNjApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluY3JlYXNlIHBsYXllciBzcGVlZCBhZnRlclxyXG4gICAgICogY29sbGlzaW9uIHdpdGgganVua1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBqdW5rSGl0KHBsYXllciwganVuaykge1xyXG5cclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5wbGF5KGp1bmsuc3ByaXRlLmtleSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAgICAgLy8gVGhlIHNwZWVkIHRoYXQgdGhlIHBsYXllciBzaG91bGQgYmUgdHJhdmVsbGluZyBhdCBpcyBzdG9yZWQsIFxyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgdGhlIGZ1bmN0aW9uIGJlbG93IHdpbGwgc2xvdyBkb3duIHJhdGhlciB0aGFuIHNwZWVkIHVwLlxyXG4gICAgICAgICAgICB2YXIgb3JpZ2luYWxTcGVlZCA9IERELnBsYXllci5zcGVlZDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHRpbmcgYSBzbG93IHNwZWVkIHN0cmFpZ2h0IGF3YXkgc28gaXQgZG9lc24ndCBmZWVsIGxhZ2d5XHJcbiAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiAoREQub2JqZWN0cy5qdW5rcy5zbG93L0RELmdhbWUud29ybGQubGV2ZWwpO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0SW50ZXJ2YWwgbWVhbnMgdGhhdCBJIGNhbiBwZXJmb3JtIHRoaXMgb3ZlciBzb21lIHRpbWUgXHJcbiAgICAgICAgICAgIC8vIGFuZCBncmFkdWFsbHkgd2l0aG91dCB1c2luZyBQaGFzZXJzIHN0dXBpZCB0aW1lIGZ1bmN0aW9uLlxyXG4gICAgICAgICAgICAvLyBUaW1lIG9uIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgaW4gbWlsbGlzZWNvbmRzLiBcclxuICAgICAgICAgICAgdmFyIHNwZWVkVXAgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLnNsb3cgPD0gMS4wNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgb3JpZ2luYWxTcGVlZCBpcyB1c2VkIHRvIHByb3ZpZGUgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBncmFkdWFsIHNwZWVkIHVwIHRoYXQgZmVlbHMgYSBsaXR0bGUgbW9yZSBuYXR1cmFsLlxyXG4gICAgICAgICAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlcnkgc2Vjb25kIHRoZSBkb2xwaGluIGdldHMgMTAlIGNsb3NlciB0byBmdWxsIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuanVua3Muc2xvdyArPSAwLjA1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gRGV0ZWN0aW5nIHdoZW4gdGhlIG1heGltdW0gc3BlZWQgaXMgcmVhY2hlZCwgc28gdGhlIGZ1bmN0aW9uIGNhbiBlbmQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcnZhbCB0aGF0IGlzIGNhdXNpbmcgdGhlIGNoYW5nZSBpbiBkb2xwaGluIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzcGVlZFVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0dGluZyB0aGUgc2xvd2luZyBlZmZlY3QgYWZ0ZXIgdGhlIG5vcm1hbCBzcGVlZCBpcyByZWFjaGVkIGFnYWluLlxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLnNsb3cgPSAwLjQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCB3YXZlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaXRXYXZlcygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV2F2ZSBoaXQnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHN0YXJmaXNoXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gcGxheWVyXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gc3RhcmZpc2hcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29sbGVjdFN0YXJmaXNoKHBsYXllciwgc3RhcmZpc2gpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaWQgPSBzdGFyZmlzaC5kYXRhLmlkO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5raWxsU3ByaXRlKHN0YXJmaXNoLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIGlmIChERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5pbmRleE9mKGlkKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQucGxheSgnc3RhcmZpc2gnKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gMTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMucHVzaChpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFyZmlzaCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIHBsYXllcidzIGJvdW5jZSBhY2NlbGVyYXRpb25cclxuICAgICAqIGFmdGVyIGNvbGxpZGluZyB3aXRoIHdhdmVzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHN0b3BBY2NlbGVyYXRpb24oKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ICs9IDEwMDtcclxuICAgICAgICBjb25zb2xlLmxvZygnU3RvcCBBY2NlbGVyYXRpb24nKTtcclxuICAgICAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHNhbmRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGl0U2FuZCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2FuZCBoYXMgYmVlbiBoaXQnKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG5ldEhpdChwbGF5ZXIsIG5ldCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCduZXRIaXQnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhuZXQpO1xyXG4gICAgICAgIC8vIGlmIChERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuICAgICAgICAvLyAgICAgbmV0LmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBuZXQua2lsbCgpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBsYXlNdXNpYygpIHtcclxuICAgICAgICBpb24uc291bmQucGxheShcIkdhbWVNdXNpY1wiKTtcclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG4vLyBSZXN0b3JlIHBlcnNpc3RlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbkRELmdhbWUuYWN0aW9ucy5yZXN0b3JlU2F2ZWRWYWx1ZXMoKTtcclxuXHJcbi8vIEV2ZXJ5dGhpbmcgaXMgZGVjbGFyZWQ6IGluaXRpYWxpemUgZ2FtZVxyXG5ERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9