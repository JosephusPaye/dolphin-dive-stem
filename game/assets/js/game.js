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
            amount: 1,
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
        vertSpeed: 300,
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
                    //console.log('is bag');
                    junk.body.offset.x = 32;
                    junk.body.offset.y = 24;
                    junk.body.setCircle(35);
                    break;
                case 'barrel':
                    //console.log('is barrel');
                    break;
                case 'boot':
                    //console.log('is boot');
                    break;
                case 'bottle':
                    //console.log('is bottle');
                    break;
                case 'tyre':
                    //console.log('is tyre');
                    break;
                default:
                    //console.log('whut?');
            };

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

        for (j = 0; j < DD.objects.nets.amount; j++) {
            currentEdge = DD.player.element.x + (game.camera.width / 2) + 200;
            nextEdge = currentEdge + game.camera.width;

            net = game.add.sprite(currentEdge + (Helper.getRandomIntBetween(j*100, nextEdge)), game.world.randomY, 'ball');

            game.physics.p2.enable(net);
            net.body.setCircle(500*0.3);
            net.scale.setTo(0.3, 0.3);
            net.body.static = true;

            // Tell the net to use the DD.objects.net.collisionGroup 
            net.body.setCollisionGroup(DD.objects.nets.collisionGroup);

            // netes will collide against themselves and the player
            // If you don't set this they'll not collide with anything.
            // The first parameter is either an array or a single collision group.
            net.body.collides([DD.objects.junks.collisionGroup, DD.player.collisionGroup]);
            net.collectionIndex = j;

            nets.push(net);
        }

        DD.objects.nets.elements.push(net);
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
        // Backgrounds
        game.load.image('background', '/assets/images/StaticBackground.png');
        game.load.image('backgroundL1', '/assets/images/Layer1.png');
        game.load.image('backgroundL2', '/assets/images/Layer2.png');
        game.load.image('seafloor', '/assets/images/SeaFloor.png');
        game.load.spritesheet('waves', '/assets/images/waveNew.png', 1280, 45);

        // Junks
        game.load.image('bag', '/assets/images/bag.png');
        game.load.image('barrel', '/assets/images/barrel.png');
        game.load.image('boot', '/assets/images/boot.png');
        game.load.image('bottle', '/assets/images/bottle.png');
        game.load.image('tyre', '/assets/images/tyre.png');
        game.load.image('ball', '/assets/images/ball.png');
        game.load.image('undernet', '/assets/images/undernet.png');

        // Objects
        game.load.image('crab', '/assets/images/angrycrab.png');
        game.load.image('starfish', '/assets/images/starfish.png');

        // Main characters
        game.load.image('oilspill', '/assets/images/oilback.png');
        game.load.spritesheet('dolphin', '/assets/images/new-dolphin.png', 245, 103);
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
        DD.player.element.animations.add('right', [0, 1, 2, 3, 4], 10, true);
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
        //DD.game.actions.createNets();

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
            };
        };

        // On demand generation
        if (DD.player.element.x >= DD.game.world.lastGeneratedPosition + game.camera.width + 200) {
            DD.game.actions.createJunks();
            DD.game.actions.createStarfish();
            //DD.game.actions.createNets();
            DD.game.world.lastGeneratedPosition = DD.player.element.x;
        }

        // Cleanup 
        if (DD.objects.junks.elements.length >= 2 & !DD.game.world.cleaningUp) {
            DD.game.actions.cleanUp();
        }

        if (DD.game.modifiers.boost.active) { 
            if ((DD.player.element.x - DD.game.modifiers.boost.begin) >= 300) {
                DD.game.modifiers.total +=  -0.4 *(DD.player.speed/DD.game.modifiers.boost.total);
                if (DD.objects.junks.active) {
                    DD.player.barrier.element.alpha += -1;
                } else {
                    DD.player.barrier.element.alpha += -0.3;
                }
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
            DD.objects.spill.element.body.velocity.x = 350 + (20 * DD.game.world.level);

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
        if (!DD.game.modifiers.boost.active) {

            DD.game.audio.JunkSound.play(junk.sprite.key);
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
    
    function netHit() {
        console.log('netHit');
    }
})();

// Restore persisted values from local storage
DD.game.actions.restoreSavedValues();

// Everything is declared: initialize game
DD.game.actions.start();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvbHlmaWxscy5qcyIsImRhdGEuanMiLCJkaXNwbGF5LmpzIiwiYW5pbWF0aW9ucy5qcyIsImFjdGlvbnMuanMiLCJldmVudHMuanMiLCJnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlZ2lzdGVyIEFycmF5LmdldFVuaXF1ZSgpXHJcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvID0ge307XHJcbiAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgdmFyIGwgPSB0aGlzLmxlbmd0aDtcclxuICAgIHZhciByID0gW107XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xyXG4gICAgICAgIG9bdGhpc1tpXV0gPSB0aGlzW2ldO1xyXG4gICAgfSBcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG4gICAgICAgIHIucHVzaChvW2ldKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG52YXIgSGVscGVyID0ge1xyXG4gICAgZ2V0UmFuZG9tSW50QmV0d2VlbjogZ2V0UmFuZG9tSW50QmV0d2VlblxyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50QmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn1cclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuJ3VzZSBzdHJpY3QnOyAvLyBTaG93cyBhbGwgZXJyb3JzIGFuZCB3YXJuaW5nc1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBERCBvYmplY3RcclxuICogXHJcbiAqIENvbnRhaW5zIGdhbWUgc3RhdGUgaW5kZXBlbmRlbnQgb2YgUGhhc2VyXHJcbiAqL1xyXG52YXIgREQgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxyXG5cclxuICAgIG9iamVjdHM6IHtcclxuICAgICAgICBzcGlsbDoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgZ3JhZGllbnQ6IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgIGFtb3VudDogSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oMSwgMiksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGVjdGVkSWRzOiBbXSxcclxuICAgICAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBqdW5rczoge1xyXG4gICAgICAgICAgICBhbW91bnQ6IEhlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDEwLCAxNSksXHJcbiAgICAgICAgICAgIGVsZW1lbnRzOiBbXSxcclxuICAgICAgICAgICAgc2xvdzogMC40LFxyXG4gICAgICAgICAgICBjb2xsaXNpb25Hcm91cDogbnVsbCxcclxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG5ldHM6IHtcclxuICAgICAgICAgICAgYW1vdW50OiAxLFxyXG4gICAgICAgICAgICBlbGVtZW50czogW10sXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0dXJlczoge1xyXG4gICAgICAgIGxheWVyQTogbnVsbCxcclxuICAgICAgICBsYXllckI6IG51bGwsXHJcbiAgICAgICAgbGF5ZXJDOiBudWxsLFxyXG4gICAgICAgIHdhdmVzOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYW5kOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkdyb3VwOiBudWxsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzcGVlZDogNTBcclxuICAgIH0sXHJcblxyXG4gICAgcGxheWVyOiB7XHJcbiAgICAgICAgYWNjZWxlcmF0aW9uQWN0aXZlOiBmYWxzZSxcclxuICAgICAgICBzcGVlZDogMzAwLFxyXG4gICAgICAgIHZlcnRTcGVlZDogMzAwLFxyXG4gICAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgICAgY29sbGlzaW9uR3JvdXA6IG51bGwsXHJcbiAgICAgICAgYW5nbGU6IDIwLFxyXG4gICAgICAgIGJhcnJpZXI6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZToge1xyXG4gICAgICAgIGdhbWVPdmVyQ2FsbGVkOiBmYWxzZSxcclxuICAgICAgICBmaXJzdFJ1bjogdHJ1ZSxcclxuICAgICAgICBydW5FbmQ6IGZhbHNlLFxyXG4gICAgICAgIGN1cnNvcnM6IG51bGwsXHJcblxyXG4gICAgICAgIHdvcmxkOiB7XHJcbiAgICAgICAgICAgIGNsZWFuaW5nVXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYXN0R2VuZXJhdGVkUG9zaXRpb246IDAsXHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBpbnRlcnZhbDogMjAwMFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIHRleHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHN0YXJmaXNoOiB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgbGFzdFJ1bjogMCxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBsYXN0UnVuOiAwLFxyXG4gICAgICAgICAgICBsYXN0RnJhbWVWYWx1ZToge1xyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IDAsXHJcbiAgICAgICAgICAgICAgICBzY29yZTogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoaWdoU2NvcmVzOiBbXVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1vZGlmaWVyczoge1xyXG4gICAgICAgICAgICB0b3RhbDogMCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYm9vc3Q6IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMi41LFxyXG4gICAgICAgICAgICAgICAgYmVnaW46IDAsXHJcbiAgICAgICAgICAgICAgICBjaGFyZ2VzOiAwXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgYXVkaW86IHtcclxuICAgICAgICAgICAganVua0NvbGxpZGU6IG51bGwsXHJcbiAgICAgICAgICAgIEdhbWVTb3VuZDogbnVsbCxcclxuICAgICAgICAgICAgYm90dGxlOiBudWxsLFxyXG4gICAgICAgICAgICBiYXJyZWw6IG51bGwsXHJcbiAgICAgICAgICAgIHBsYXN0aWNCYWc6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBKdXN0IGEgZnJpZW5kbHkgcmVtaW5kZXJcclxuY29uc29sZS5pbmZvKCdEb2xwaGluIERpdmUgdicgKyBERC52ZXJzaW9uKTtcclxuXHJcbi8vIEdsb2JhbCBnYW1lIG9iamVjdFxyXG52YXIgZ2FtZTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbi8qKlxyXG4gKiBIb2xkcyByZWZlcmVuY2VzIHRvIGFsbCBvbi1zY3JlZW4gZWxlbWVudHNcclxuICogKGV4dGVyYWwgdG8gUGhhc2VyKVxyXG4gKiBcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnZhciBEaXNwbGF5RGF0YSA9IHtcclxuICAgIGdhbWU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZScpXHJcbiAgICB9LFxyXG5cclxuICAgIGh1ZDoge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNodWQnKSxcclxuICAgICAgICBzY29yZTogJCgnI2h1ZC1zY29yZScpLFxyXG4gICAgICAgIHN0YXJmaXNoOiAkKCcjaHVkLXN0YXJmaXNoJyksXHJcbiAgICAgICAgcGF1c2VCdG46ICQoJyNodWQtcGF1c2VCdG4nKSxcclxuICAgICAgICBwcm9ncmVzc0Jhcjoge1xyXG4gICAgICAgICAgICBlbGVtZW50OiAkKCcjaHVkLXByb2dyZXNzYmFyJyksXHJcbiAgICAgICAgICAgIHNwaWxsOiAkKCcjaHVkLXByb2dyZXNzYmFyLW9pbHNwaWxsJyksXHJcbiAgICAgICAgICAgIGRvbHBoaW46ICQoJyNodWQtcHJvZ3Jlc3NiYXItZG9scGhpbicpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWluTWVudToge1xyXG4gICAgICAgIGVsZW1lbnQ6ICQoJyNtYWluTWVudScpLFxyXG4gICAgICAgIG5ld0dhbWVCdG46ICQoJyNtYWluTWVudS1uZXdHYW1lJyksXHJcbiAgICAgICAgaGlnaFNjb3Jlc0J0bjogJCgnI21haW5NZW51LWhpZ2hTY29yZXMnKSxcclxuICAgICAgICBob3dUb1BsYXlCdG46ICQoJyNtYWluTWVudS1ob3dUb1BsYXknKSxcclxuICAgICAgICBhYm91dEJ0bjogJCgnI21haW5NZW51LWFib3V0JylcclxuICAgIH0sXHJcblxyXG4gICAgaGlnaFNjb3Jlc01lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjaGlnaFNjb3Jlc01lbnUnKSxcclxuICAgICAgICBsaXN0OiAkKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCcpLFxyXG4gICAgICAgIGxpc3RQYWdlMjogJCgnI2hpZ2hTY29yZXNNZW51LWxpc3QtcGFnZTInKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LW1haW5NZW51JyksXHJcbiAgICAgICAgbmV4dFBhZ2UyQnRuOiAkKCcjaGlnaFNjb3Jlc01lbnUtbmV4dC1wYWdlMkJ0bicpLFxyXG4gICAgICAgIHByZXZQYWdlMUJ0bjogJCgnI2hpZ2hTY29yZXNNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNoaWdoU2NvcmVzTWVudS1wYWdlMScpLFxyXG4gICAgICAgIHBhZ2UyOiAkKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTInKVxyXG4gICAgfSxcclxuXHJcbiAgICBob3dUb1BsYXlNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2hvd1RvUGxheU1lbnUnKSxcclxuICAgICAgICBtYWluTWVudUJ0bjogJCgnI2hvd1RvUGxheU1lbnUtbWFpbk1lbnUnKSxcclxuICAgICAgICBuZXh0UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTJCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTFCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTFCdG4nKSxcclxuICAgICAgICBuZXh0UGFnZTNCdG46ICQoJyNob3dUb1BsYXlNZW51LW5leHQtcGFnZTNCdG4nKSxcclxuICAgICAgICBwcmV2UGFnZTJCdG46ICQoJyNob3dUb1BsYXlNZW51LXByZXYtcGFnZTJCdG4nKSxcclxuXHJcbiAgICAgICAgcGFnZTE6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UxJyksXHJcbiAgICAgICAgcGFnZTI6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UyJyksXHJcbiAgICAgICAgcGFnZTM6ICQoJyNob3dUb1BsYXlNZW51LXBhZ2UzJylcclxuICAgIH0sXHJcblxyXG4gICAgYWJvdXRNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI2Fib3V0TWVudScpLFxyXG4gICAgICAgIHZlcnNpb246ICQoJyNhYm91dE1lbnUtdmVyc2lvbicpLFxyXG4gICAgICAgIG1haW5NZW51QnRuOiAkKCcjYWJvdXRNZW51LW1haW5NZW51JylcclxuICAgIH0sXHJcblxyXG4gICAgcGF1c2VNZW51OiB7XHJcbiAgICAgICAgZWxlbWVudDogJCgnI3BhdXNlTWVudScpLFxyXG4gICAgICAgIG92ZXJsYXk6ICQoJyNwYXVzZU1lbnUgLm92ZXJsYXknKSxcclxuICAgICAgICByZXN1bWVCdG46ICQoJyNwYXVzZU1lbnUtcmVzdW1lJyksXHJcbiAgICAgICAgcmVzdGFydEJ0bjogJCgnI3BhdXNlTWVudS1yZXN0YXJ0JyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNwYXVzZU1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lT3Zlck1lbnU6IHtcclxuICAgICAgICBlbGVtZW50OiAkKCcjZ2FtZU92ZXJNZW51JyksXHJcbiAgICAgICAgb3ZlcmxheTogJCgnI2dhbWVPdmVyTWVudSAub3ZlcmxheScpLFxyXG5cclxuICAgICAgICBoaWdoU2NvcmU6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1oaWdoU2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LWhpZ2hTY29yZSAuc2NvcmUnKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNjb3JlOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICQoJyNnYW1lT3Zlck1lbnUtc2NvcmUnKSxcclxuICAgICAgICAgICAgbnVtYmVyOiAkKCcjZ2FtZU92ZXJNZW51LXNjb3JlIC5zY29yZScpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhcmZpc2g6IHtcclxuICAgICAgICAgICAgZWxlbWVudDogJCgnI2dhbWVPdmVyTWVudS1zdGFyZmlzaCcpLFxyXG4gICAgICAgICAgICBudW1iZXI6ICQoJyNnYW1lT3Zlck1lbnUtc3RhcmZpc2ggLnNjb3JlJylcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwbGF5QWdhaW5CdG46ICQoJyNnYW1lT3Zlck1lbnUtcGxheUFnYWluJyksXHJcbiAgICAgICAgbWFpbk1lbnVCdG46ICQoJyNnYW1lT3Zlck1lbnUtbWFpbk1lbnUnKVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYW5kIG1lbnVzIG1hbmlwdWxhdGlvblxyXG4gKiBvYmplY3RcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgRGlzcGxheSA9IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBmdW5jdGlvbnNcclxuICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzID0gc2hvd0VsZW1lbnRzO1xyXG4gICAgRGlzcGxheS5oaWRlRWxlbWVudHMgPSBoaWRlRWxlbWVudHM7XHJcbiAgICBEaXNwbGF5LnNob3dNZW51ID0gc2hvd01lbnU7XHJcbiAgICBEaXNwbGF5LmhpZGVBbGxNZW51cyA9IGhpZGVBbGxNZW51cztcclxuICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzID0gaGlkZUFsbEVsZW1lbnRzO1xyXG4gICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzID0gdXBkYXRlSGlnaFNjb3JlcztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgZ2l2ZW4gZWxlbWVudCBvbiBzY3JlZW5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50cyhlbGVtZW50cykge1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgZ2l2ZW4gZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaWRlRWxlbWVudHMoZWxlbWVudHMpIHtcclxuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGEgbWVudSBieSBmaXJzdCBoaWRpbmcgYWxsIG90aGVyIG1lbnVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IG1lbnVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gc2hvd01lbnUobWVudSkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbEVsZW1lbnRzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW21lbnVdKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgYWxsIG1lbnVzIGZyb20gdGhlIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaWRlQWxsTWVudXMoKSB7XHJcbiAgICAgICAgdmFyIG1lbnVzID0gW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50LCBcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5lbGVtZW50LFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5hYm91dE1lbnUuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEucGF1c2VNZW51LmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbWVudXMuZm9yRWFjaChmdW5jdGlvbihtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGlkZSBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGhpZGVBbGxFbGVtZW50cygpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQuZWxlbWVudF0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHNjb3JlcyBpbiBBYm91dCBtZW51XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUhpZ2hTY29yZXMoKSB7XHJcbiAgICAgICAgLy8gR2V0IHVuaXF1ZSBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU29ydCBzY29yZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhIDwgYjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgSFRNTCBmb3Igc2NvcmVzXHJcbiAgICAgICAgdmFyIGhpZ2hTY29yZXNIdG1sID0gJyc7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZXNIdG1sICs9ICc8ZGl2PicgKyBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXNbaV0gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB1cGRhdGVkIHNjb3JlcyAocGFnZSAxKVxyXG4gICAgICAgIGlmIChERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdCkuaHRtbChoaWdoU2NvcmVzSHRtbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaWdoU2NvcmVzSHRtbCA9ICcnO1xyXG4gICAgICAgIGZvciAodmFyIGogPSA1OyBqIDwgMTA7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdKSB7XHJcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzSHRtbCArPSAnPGRpdj4nICsgREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzW2pdICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdXBkYXRlZCBzY29yZXMgKHBhZ2UgMilcclxuICAgICAgICBpZiAoaGlnaFNjb3Jlc0h0bWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubGlzdFBhZ2UyKS5odG1sKGhpZ2hTY29yZXNIdG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIvKipcclxuICogQ29udHJvbHMgdGhlIHBsYXliYWNrIG9mIGFuaW1hdGlvbnNcclxuICogXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgUGxheUFuaW1hdGlvbnMgPSB7fTtcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgIC8vIEV4cG9ydCBhbmltYXRpb25zXHJcbiAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSA9IG1haW5NZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUgPSBoaWdoU2NvcmVzTWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51MiA9IGhpZ2hTY29yZXNNZW51MjtcclxuICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSA9IHBhdXNlTWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmFib3V0TWVudSA9IGFib3V0TWVudTtcclxuICAgIFBsYXlBbmltYXRpb25zLmhvd1RvUGxheU1lbnUgPSBob3dUb1BsYXlNZW51O1xyXG4gICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51ID0gZ2FtZU92ZXJNZW51O1xyXG5cclxuICAgIC8vIE1haW4gTWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBtYWluTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIG1lbnUgdGl0bGVcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjbWFpbk1lbnUgaDEnLCAxLCB7XHJcbiAgICAgICAgICAgIHNjYWxlOiAwLjYsXHJcbiAgICAgICAgICAgIGVhc2U6IEJvdW5jZS5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZSBidXR0b25zXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNtYWluTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudSBhbmltYXRpb25zXHJcbiAgICBmdW5jdGlvbiBoaWdoU2NvcmVzTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHNjb3Jlc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtbGlzdCBkaXYnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2hpZ2hTY29yZXNNZW51IGxpJywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIaWdoIHNjb3JlcyBtZW51IHBhZ2UgMlxyXG4gICAgZnVuY3Rpb24gaGlnaFNjb3Jlc01lbnUyKCkge1xyXG4gICAgICAgIC8vIEFuaW1hdGUgc2NvcmVzXHJcbiAgICAgICAgVHdlZW5NYXguc3RhZ2dlckZyb20oJyNoaWdoU2NvcmVzTWVudS1saXN0LXBhZ2UyIGRpdicsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgYnV0dG9uc1xyXG4gICAgICAgIFR3ZWVuTWF4LnN0YWdnZXJGcm9tKCcjaGlnaFNjb3Jlc01lbnUtcGFnZTIgbGknLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhvd1RvUGxheU1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSB0ZXh0XHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2hvd1RvUGxheU1lbnUgLnRleHQnLCAwLjMsIHtcclxuICAgICAgICAgICAgeTogMTAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICBlYXNlOiBCYWNrLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFib3V0TWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIHRleHRcclxuICAgICAgICBUd2Vlbk1heC5mcm9tKCcjYWJvdXRNZW51IC50ZXh0JywgMC4zLCB7XHJcbiAgICAgICAgICAgIHk6IDEwMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXVzZSBNZW51IGFuaW1hdGlvbnNcclxuICAgIGZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI3BhdXNlTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiA3NSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgZWFzZTogQmFjay5lYXNlT3V0XHJcbiAgICAgICAgfSwgMC4xKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnYW1lT3Zlck1lbnUoKSB7XHJcbiAgICAgICAgLy8gQW5pbWF0ZSBtZW51IHRpdGxlXHJcbiAgICAgICAgVHdlZW5NYXguZnJvbSgnI2dhbWVPdmVyTWVudSBoMScsIDEsIHtcclxuICAgICAgICAgICAgc2NhbGU6IDAuNCxcclxuICAgICAgICAgICAgZWFzZTogQm91bmNlLmVhc2VPdXRcclxuICAgICAgICB9LCAwLjEpO1xyXG5cclxuICAgICAgICAvLyBBbmltYXRlIGJ1dHRvbnNcclxuICAgICAgICBUd2Vlbk1heC5zdGFnZ2VyRnJvbSgnI2dhbWVPdmVyTWVudSBsaScsIDAuMywge1xyXG4gICAgICAgICAgICB5OiAxMDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgIGVhc2U6IEJhY2suZWFzZU91dFxyXG4gICAgICAgIH0sIDAuMSk7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBnYW1lIGFjdGlvbnMgYW5kIGFjdGlvbi1yZWxhdGVkIGZ1bmN0aW9uc1xyXG4gICAgREQuZ2FtZS5hY3Rpb25zID0ge1xyXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICBjcmVhdGVKdW5rczogY3JlYXRlSnVua3MsXHJcbiAgICAgICAgY2xlYW5VcDogY2xlYW5VcCxcclxuICAgICAgICBraWxsU3ByaXRlOiBraWxsU3ByaXRlLFxyXG4gICAgICAgIGNyZWF0ZVN0YXJmaXNoOiBjcmVhdGVTdGFyZmlzaCxcclxuICAgICAgICByZXN0b3JlU2F2ZWRWYWx1ZXM6IHJlc3RvcmVTYXZlZFZhbHVlcyxcclxuICAgICAgICB1cGRhdGVIaWdoU2NvcmVzOiB1cGRhdGVIaWdoU2NvcmVzLFxyXG4gICAgICAgIGNyZWF0ZU5ldHM6IGNyZWF0ZU5ldHMsXHJcbiAgICAgICAgcmVzdGFydDogcmVzdGFydCxcclxuICAgICAgICBnYW1lT3ZlcjogZ2FtZU92ZXJcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBnYW1lXHJcbiAgICAgKiBcclxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBnYW1lIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcclxuICAgICAgICBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDEyODAsIDcyMCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xyXG4gICAgICAgICAgICBwcmVsb2FkOiBERC5nYW1lLnByZWxvYWQsXHJcbiAgICAgICAgICAgIGNyZWF0ZTogREQuZ2FtZS5jcmVhdGUsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogREQuZ2FtZS51cGRhdGUsXHJcbiAgICAgICAgICAgIHJlbmRlcjogREQuZ2FtZS5yZW5kZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSnVuayBnZW5lcmF0aW9uIG9uIGdhbWUuY3JlYXRlKClcclxuICAgICAqXHJcbiAgICAgKiBDcmVhdGVzIGEgdGhvdXNhbmQganVuayBvYmplY3RzIGFuZCBzdG9yZXNcclxuICAgICAqIHRoZW0gaW4gREQub2JqZWN0cy5qdW5rcy5lbGVtZW50c1tdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUp1bmtzKCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50RWRnZTtcclxuICAgICAgICB2YXIgbmV4dEVkZ2U7XHJcbiAgICAgICAgdmFyIGp1bmtzID0gW107XHJcbiAgICAgICAgdmFyIGp1bms7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBERC5vYmplY3RzLmp1bmtzLmFtb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gREQucGxheWVyLmVsZW1lbnQueCArIChnYW1lLmNhbWVyYS53aWR0aCAvIDIpICsgMjAwO1xyXG4gICAgICAgICAgICBuZXh0RWRnZSA9IGN1cnJlbnRFZGdlICsgZ2FtZS5jYW1lcmEud2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSByYW5kb20ganVua1xyXG4gICAgICAgICAgICBqdW5rID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICBbJ2JhZycsICdiYXJyZWwnLCAnYm9vdCcsICdib3R0bGUnLCAndHlyZSddW0hlbHBlci5nZXRSYW5kb21JbnRCZXR3ZWVuKDAsIDQpXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIHBoeXNpY3NcclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShqdW5rKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzd2l0Y2ggKGp1bmsua2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdiYWcnOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2lzIGJhZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5vZmZzZXQueCA9IDMyO1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5vZmZzZXQueSA9IDI0O1xyXG4gICAgICAgICAgICAgICAgICAgIGp1bmsuYm9keS5zZXRDaXJjbGUoMzUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYmFycmVsJzpcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdpcyBiYXJyZWwnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jvb3QnOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2lzIGJvb3QnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaXMgYm90dGxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd0eXJlJzpcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdpcyB0eXJlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3dodXQ/Jyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0UmVjdGFuZ2xlKDI0LCAyMik7XHJcbiAgICAgICAgICAgIGp1bmsuc2NhbGUuc2V0VG8oMC41LCAwLjUpO1xyXG5cclxuICAgICAgICAgICAganVuay5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IE1hdGgucmFuZG9tKCkgKiAyO1xyXG4gICAgICAgICAgICBqdW5rLmJvZHkudmVsb2NpdHkueSA9IE1hdGgucmFuZG9tKCkgKiA4MDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRlbGwgdGhlIGp1bmsgdG8gdXNlIHRoZSBERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwIFxyXG4gICAgICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBqdW5rcyB3aWxsIGNvbGxpZGUgYWdhaW5zdCB0aGVtc2VsdmVzIGFuZCB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBkb24ndCBzZXQgdGhpcyB0aGV5J2xsIG5vdCBjb2xsaWRlIHdpdGggYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgZWl0aGVyIGFuIGFycmF5IG9yIGEgc2luZ2xlIGNvbGxpc2lvbiBncm91cC5cclxuICAgICAgICAgICAganVuay5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgICAgIGp1bmtzLnB1c2goanVuayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnB1c2goanVua3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcmZpc2ggZ2VuZXJhdGlvbiBvbiBnYW1lLmNyZWF0ZSgpXHJcbiAgICAgKlxyXG4gICAgICogQ3JlYXRlcyBhIHRob3VzYW5kIHN0YXJmaXNoIG9iamVjdHMgYW5kIHN0b3Jlc1xyXG4gICAgICogdGhlbSBpbiBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzW11cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhcmZpc2goKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgc3RhcmZpc2hlcyA9IFtdO1xyXG4gICAgICAgIHZhciBzdGFyZmlzaDtcclxuICAgICAgICB2YXIgajtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IERELm9iamVjdHMuc3RhcmZpc2guYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoID0gZ2FtZS5hZGQuc3ByaXRlKFxyXG4gICAgICAgICAgICAgICAgSGVscGVyLmdldFJhbmRvbUludEJldHdlZW4oY3VycmVudEVkZ2UsIG5leHRFZGdlKSwgLy8gREQucGxheWVyLmVsZW1lbnQueCArIDEwMCwgLy8gXHJcbiAgICAgICAgICAgICAgICBnYW1lLndvcmxkLnJhbmRvbVksXHJcbiAgICAgICAgICAgICAgICAnc3RhcmZpc2gnXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHN0YXJmaXNoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXplIG9mIHRoZSBvYmplY3Qgd2lsbCBsaWtlbHkgY2hhbmdlIHRvbywgaWYgdGhhdCBpcyBwb3NzaWJsZVxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG4gICAgICAgICAgICBzdGFyZmlzaC5zY2FsZS5zZXRUbygwLjYsIDAuNik7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBzdGFyZmlzaCB0byB1c2UgdGhlIERELm9iamVjdHMuc3RhcmZpc2guY29sbGlzaW9uR3JvdXAgXHJcbiAgICAgICAgICAgIHN0YXJmaXNoLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsaXNpb25Hcm91cCk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFyZmlzaGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBzdGFyZmlzaC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuICAgICAgICAgICAgc3RhcmZpc2guY29sbGVjdGlvbkluZGV4ID0gajtcclxuXHJcbiAgICAgICAgICAgIHN0YXJmaXNoZXMucHVzaChzdGFyZmlzaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmVsZW1lbnRzLnB1c2goc3RhcmZpc2hlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW5VcCgpIHtcclxuICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5lbGVtZW50cy5sZW5ndGggPD0gMykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ2xlYW5pbmcgdXAnKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5jbGVhbmluZ1VwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdmFyIHRvQ2xlYXIgPSBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLnNwbGljZSgwLCBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzLmxlbmd0aCAtIDMpO1xyXG5cclxuICAgICAgICB0b0NsZWFyLmZvckVhY2goZnVuY3Rpb24oZ2VuZXJhdGlvbiwgaSkge1xyXG4gICAgICAgICAgICBnZW5lcmF0aW9uLmZvckVhY2goZnVuY3Rpb24oanVuaywgaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGp1bmspIHtcclxuICAgICAgICAgICAgICAgICAgICBraWxsU3ByaXRlKGp1bmspO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25bal0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRvQ2xlYXJbaV0gPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmNsZWFuaW5nVXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NsZWFuaW5nIHVwIGRvbmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBraWxsU3ByaXRlKHNwcml0ZSkge1xyXG4gICAgICAgIHNwcml0ZS5ib2R5ID0gbnVsbDtcclxuICAgICAgICBzcHJpdGUua2lsbCgpO1xyXG5cclxuICAgICAgICBpZiAoc3ByaXRlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHNwcml0ZS5ncm91cC5yZW1vdmUoc3ByaXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNwcml0ZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXN0b3JlIHNhdmVkIHZhbHVlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICAgIGZ1bmN0aW9uIHJlc3RvcmVTYXZlZFZhbHVlcygpIHtcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcztcclxuICAgICAgICB2YXIgc3RhcmZpc2g7XHJcblxyXG4gICAgICAgIGlmICghc2ltcGxlU3RvcmFnZS5jYW5Vc2UoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhbCBzdG9yYWdlIG5vdCBhdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBoaWdoIHNjb3Jlc1xyXG4gICAgICAgIGhpZ2hTY29yZXMgPSBzaW1wbGVTdG9yYWdlLmdldCgnaGlnaFNjb3JlcycpO1xyXG4gICAgICAgIGlmIChoaWdoU2NvcmVzKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUuaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXJmaXNoIGNvdW50XHJcbiAgICAgICAgc3RhcmZpc2ggPSBzaW1wbGVTdG9yYWdlLmdldCgnc3RhcmZpc2gnKTtcclxuICAgICAgICBpZiAoc3RhcmZpc2gpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC50b3RhbCA9IHN0YXJmaXNoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVIaWdoU2NvcmVzKHNjb3JlKSB7XHJcbiAgICAgICAgaWYgKHNjb3JlLnNjb3JlIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyB2YWx1ZXMgdG8gY3VycmVudCB2YWx1ZXNcclxuICAgICAgICB2YXIgaGlnaFNjb3JlcyA9IFtzY29yZS5zY29yZV0uY29uY2F0KERELmdhbWUuc2NvcmUuaGlnaFNjb3Jlcyk7XHJcbiAgICAgICAgdmFyIHN0YXJmaXNoID0gc2NvcmUuc3RhcmZpc2ggKyBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLnRvdGFsO1xyXG5cclxuICAgICAgICAvLyBHZXQgdW5pcXVlIHNjb3JlcyBhbmQgc29ydCBpbiBERVNDXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMudW5pcXVlKCk7XHJcbiAgICAgICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCBiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBHZXQgb25seSB0b3AgMTAgc2NvcmVzXHJcbiAgICAgICAgaGlnaFNjb3JlcyA9IGhpZ2hTY29yZXMuc3BsaWNlKDAsIDkpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaW4tZ2FtZSB2YWx1ZXNcclxuICAgICAgICBERC5nYW1lLnNjb3JlLmhpZ2hTY29yZXMgPSBoaWdoU2NvcmVzO1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUuc3RhcmZpc2gudG90YWwgPSBzdGFyZmlzaDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBlcnNpc3RlZCB2YWx1ZXNcclxuICAgICAgICBzaW1wbGVTdG9yYWdlLnNldCgnaGlnaFNjb3JlcycsIGhpZ2hTY29yZXMpO1xyXG4gICAgICAgIHNpbXBsZVN0b3JhZ2Uuc2V0KCdzdGFyZmlzaCcsIHN0YXJmaXNoKTtcclxuICAgIH1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZU5ldHMoKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRFZGdlO1xyXG4gICAgICAgIHZhciBuZXh0RWRnZTtcclxuICAgICAgICB2YXIgbmV0cyA9IFtdO1xyXG4gICAgICAgIHZhciBuZXQ7XHJcbiAgICAgICAgdmFyIGo7XHJcblxyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBERC5vYmplY3RzLm5ldHMuYW1vdW50OyBqKyspIHtcclxuICAgICAgICAgICAgY3VycmVudEVkZ2UgPSBERC5wbGF5ZXIuZWxlbWVudC54ICsgKGdhbWUuY2FtZXJhLndpZHRoIC8gMikgKyAyMDA7XHJcbiAgICAgICAgICAgIG5leHRFZGdlID0gY3VycmVudEVkZ2UgKyBnYW1lLmNhbWVyYS53aWR0aDtcclxuXHJcbiAgICAgICAgICAgIG5ldCA9IGdhbWUuYWRkLnNwcml0ZShjdXJyZW50RWRnZSArIChIZWxwZXIuZ2V0UmFuZG9tSW50QmV0d2VlbihqKjEwMCwgbmV4dEVkZ2UpKSwgZ2FtZS53b3JsZC5yYW5kb21ZLCAnYmFsbCcpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShuZXQpO1xyXG4gICAgICAgICAgICBuZXQuYm9keS5zZXRDaXJjbGUoNTAwKjAuMyk7XHJcbiAgICAgICAgICAgIG5ldC5zY2FsZS5zZXRUbygwLjMsIDAuMyk7XHJcbiAgICAgICAgICAgIG5ldC5ib2R5LnN0YXRpYyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBUZWxsIHRoZSBuZXQgdG8gdXNlIHRoZSBERC5vYmplY3RzLm5ldC5jb2xsaXNpb25Hcm91cCBcclxuICAgICAgICAgICAgbmV0LmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG5ldGVzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgICAgICBuZXQuYm9keS5jb2xsaWRlcyhbREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgICAgIG5ldC5jb2xsZWN0aW9uSW5kZXggPSBqO1xyXG5cclxuICAgICAgICAgICAgbmV0cy5wdXNoKG5ldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBERC5vYmplY3RzLm5ldHMuZWxlbWVudHMucHVzaChuZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIGdhbWUgcmVzdGFydFxyXG4gICAgICogXHJcbiAgICAgKiBSZXNldCBydW5uaW5nIHZhcmlhYmxlcyBhbmQgcmVzdGFydCBnYW1lIGJ5XHJcbiAgICAgKiBkZXN0cm95aW5nIGN1cnJlbnQgZ2FtZSBjYWNoZSBhbmQgXHJcbiAgICAgKiByZS1pbml0aWFsaXppbmcgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVzdGFydCgpIHtcclxuICAgICAgICAvLyBLaWxsIG9mZiBqdW5rc1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuanVua3MuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihqdW5rLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBqdW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIC8vICAgICBqdW5rLmtpbGwoKTtcclxuICAgICAgICAvLyAgICAgREQub2JqZWN0cy5qdW5rc1tpbmRleF0gPSBudWxsO1xyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAvLyBLaWxsIG9mZiBzdGFyZmlzaGVzXHJcbiAgICAgICAgLy8gREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXJmaXNoLCBpbmRleCkge1xyXG4gICAgICAgIC8vICAgICBzdGFyZmlzaC5ib2R5ID0gbnVsbDtcclxuICAgICAgICAvLyAgICAgc3RhcmZpc2gua2lsbCgpO1xyXG4gICAgICAgIC8vICAgICBERC5vYmplY3RzLnN0YXJmaXNoW2luZGV4XSA9IG51bGw7XHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGp1bmtzIGFuZCBzdGFyZmlzaCBhcnJheXNcclxuICAgICAgICBERC5vYmplY3RzLmp1bmtzLmVsZW1lbnRzID0gW107XHJcbiAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5lbGVtZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBnYW1lIHdvcmxkXHJcbiAgICAgICAgREQuZ2FtZS53b3JsZC5sZXZlbCA9IDE7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHNjb3Jlc1xyXG4gICAgICAgIERELmdhbWUuc2NvcmUubGFzdFJ1biA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCA9IDA7XHJcbiAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSA9IDA7XHJcblxyXG4gICAgICAgIGdhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgIGdhbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZSBnYW1lIG92ZXJcclxuICAgICAqIFxyXG4gICAgICogRW5kcyBjdXJyZW50IGdhbWUgYW5kIGRpc3BsYXlzXHJcbiAgICAgKiBnYW1lIG92ZXIgbWVudVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcclxuICAgICAgICB2YXIgbmV3SGlnaGVzdFNjb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghREQuZ2FtZS5nYW1lT3ZlckNhbGxlZCkge1xyXG4gICAgICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0UnVuID4gREQuZ2FtZS5zY29yZS5oaWdoU2NvcmVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdIaWdoZXN0U2NvcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMudXBkYXRlSGlnaFNjb3Jlcyh7XHJcbiAgICAgICAgICAgICAgICBzY29yZTogREQuZ2FtZS5zY29yZS5sYXN0UnVuLFxyXG4gICAgICAgICAgICAgICAgc3RhcmZpc2g6IERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1blxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5lbGVtZW50XHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5ld0hpZ2hlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5oaWdoU2NvcmUuZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgICAgICAgICAgRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnNjb3JlLmVsZW1lbnRcclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMuZ2FtZU92ZXJNZW51KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGhhbGYgYSBzZWNvbmQsIHRoZW4gdHJpZ2dlciBzY29yZSBkaXNwbGF5IGFuaW1hdGlvblxyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zdGFyZmlzaC5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW4pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEaXNwbGF5RGF0YS5nYW1lT3Zlck1lbnUuaGlnaFNjb3JlLm51bWJlci50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5zY29yZS5udW1iZXIudGV4dChERC5nYW1lLnNjb3JlLmxhc3RSdW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCBnYW1lT3ZlcigpIGZyb20gYmVpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcbiIsIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcblxyXG4vLyBTZXR1cCBldmVudHMgYW5kIGxpc3RlbmVycyB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVXBkYXRlIHZlcnNpb24gbnVtYmVyIGluIEFib3V0IG1lbnVcclxuICAgIERpc3BsYXlEYXRhLmFib3V0TWVudS52ZXJzaW9uLnRleHQoREQudmVyc2lvbik7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBOZXcgR2FtZSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUubmV3R2FtZUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQuZWxlbWVudCxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmVsZW1lbnQsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0blxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIaWdoIFNjb3JlcyBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaGlnaFNjb3Jlc0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS51cGRhdGVIaWdoU2NvcmVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5oaWdoU2NvcmVzTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBIb3cgdG8gUGxheSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuaG93VG9QbGF5QnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LnNob3dNZW51KERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBtZW51OiBBYm91dCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEubWFpbk1lbnUuYWJvdXRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEuYWJvdXRNZW51LmVsZW1lbnQpO1xyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmFib3V0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCBTY29yZXMgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhpZ2ggU2NvcmVzIG1lbnU6IG5leHQgUGFnZSAyIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5uZXh0UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTEsXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UyXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaGlnaFNjb3Jlc01lbnUyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIFNjb3JlcyBtZW51OiBwcmV2IFBhZ2UgMSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaGlnaFNjb3Jlc01lbnUucHJldlBhZ2UxQnRuKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5oaWdoU2NvcmVzTWVudS5wYWdlMlxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhpZ2hTY29yZXNNZW51LnBhZ2UxXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLmhpZ2hTY29yZXNNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogUmV0dXJuIHRvIE1haW4gTWVudSBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5tYWluTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IHByZXYgUGFnZSAxIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnByZXZQYWdlMUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIaWdoIHRvIFBsYXkgbWVudTogbmV4dCBhbmQgcHJldiBQYWdlIDIgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUubmV4dFBhZ2UyQnRuKS5hZGQoRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wcmV2UGFnZTJCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuaGlkZUVsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMSxcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlMixcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmhvd1RvUGxheU1lbnUucGFnZTJcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMuaG93VG9QbGF5TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGlnaCB0byBQbGF5IG1lbnU6IG5leHQgUGFnZSAzIGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51Lm5leHRQYWdlM0J0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlRWxlbWVudHMoW1xyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UxLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UyLFxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5ob3dUb1BsYXlNZW51LnBhZ2UzXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaG93VG9QbGF5TWVudS5wYWdlM1xyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBQbGF5QW5pbWF0aW9ucy5ob3dUb1BsYXlNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBYm91dCBtZW51OiBSZXR1cm4gdG8gTWFpbiBNZW51IGJ1dHRvblxyXG4gICAgJChEaXNwbGF5RGF0YS5hYm91dE1lbnUubWFpbk1lbnVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIERpc3BsYXkuc2hvd01lbnUoRGlzcGxheURhdGEubWFpbk1lbnUuZWxlbWVudCk7XHJcbiAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFBhdXNlIG1lbnU6IGJhY2tncm91bmQgb3ZlcmxheVxyXG4gICAgJChEaXNwbGF5RGF0YS5wYXVzZU1lbnUub3ZlcmxheSkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuICAgICAgICBEaXNwbGF5LnNob3dFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQYXVzZSBtZW51OiBSZXN1bWUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5yZXN1bWVCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIERpc3BsYXkuaGlkZUFsbE1lbnVzKCk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5wYXVzZUJ0bl0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUmVzdGFydCBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEucGF1c2VNZW51LnJlc3RhcnRCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSBzY29yZSBoZXJlXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICBEaXNwbGF5LmhpZGVBbGxNZW51cygpO1xyXG4gICAgICAgIERpc3BsYXkuc2hvd0VsZW1lbnRzKFtEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLnJlc3RhcnQoKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUGF1c2UgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLnBhdXNlTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHNjb3JlIGhlcmVcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIG92ZXIgbWVudTogUGxheSBhZ2FpbiBidXR0b25cclxuICAgICQoRGlzcGxheURhdGEuZ2FtZU92ZXJNZW51LnBsYXlBZ2FpbkJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRGlzcGxheS5oaWRlQWxsTWVudXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgSFVEIHNjb3Jlc1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KDApO1xyXG4gICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KDApO1xyXG5cclxuICAgICAgICAvLyBTaG93IEhVRCBhbmQgcGF1c2UgYnV0dG9uXHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLmh1ZC5lbGVtZW50LCBEaXNwbGF5RGF0YS5odWQucGF1c2VCdG5dKTtcclxuXHJcbiAgICAgICAgLy9SZXNldHRpbmcgdmFsdWVzIHRoYXQgc2VlbSB0byBnZXQgYWx0ZXJlZCBhdCBzb21lIHBvaW50XHJcbiAgICAgICAgREQucGxheWVyLnNwZWVkID0gMzAwO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IGdhbWVcclxuICAgICAgICBERC5nYW1lLmFjdGlvbnMucmVzdGFydCgpO1xyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgICBERC5nYW1lLnJ1bkVuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBSZXN1bWUgZ2FtZVxyXG4gICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHYW1lIE92ZXIgbWVudTogUXVpdCB0byBNYWluIE1lbnUgYnV0dG9uXHJcbiAgICAkKERpc3BsYXlEYXRhLmdhbWVPdmVyTWVudS5tYWluTWVudUJ0bikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gRmlyc3QgcnVuIHdpbGwgc2hvdyBNYWluIE1lbnUgYW5kIHBsYXkgaXRzIGFuaW1hdGlvblxyXG4gICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5yZXN0YXJ0KCk7XHJcblxyXG4gICAgICAgIERELmdhbWUuZ2FtZU92ZXJDYWxsZWQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSFVEOiBQYXVzZSBidXR0b246IGhhbmRsZXMgcGF1c2UgYWN0aXZhdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgXHJcbiAgICAgKiB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWRcclxuICAgICAqL1xyXG4gICAgJChEaXNwbGF5RGF0YS5odWQucGF1c2VCdG4pLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICBEaXNwbGF5LmhpZGVFbGVtZW50cyhbRGlzcGxheURhdGEuaHVkLnBhdXNlQnRuXSk7XHJcbiAgICAgICAgRGlzcGxheS5zaG93RWxlbWVudHMoW0Rpc3BsYXlEYXRhLnBhdXNlTWVudS5lbGVtZW50XSk7XHJcblxyXG4gICAgICAgIFBsYXlBbmltYXRpb25zLnBhdXNlTWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuIiwiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFeHBvcnQgZ2FtZSBmdW5jdGlvbnNcclxuICAgIERELmdhbWUucHJlbG9hZCA9IHByZWxvYWQ7XHJcbiAgICBERC5nYW1lLmNyZWF0ZSA9IGNyZWF0ZTtcclxuICAgIERELmdhbWUudXBkYXRlID0gdXBkYXRlO1xyXG4gICAgREQuZ2FtZS5yZW5kZXIgPSByZW5kZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcmVsb2FkIGZ1bmN0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0cyBpbmNsdWRpbmcgXHJcbiAgICAgKiBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgICAgICAvLyBCYWNrZ3JvdW5kc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9TdGF0aWNCYWNrZ3JvdW5kLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZEwxJywgJy9hc3NldHMvaW1hZ2VzL0xheWVyMS5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmRMMicsICcvYXNzZXRzL2ltYWdlcy9MYXllcjIucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3dhdmVzJywgJy9hc3NldHMvaW1hZ2VzL3dhdmVOZXcucG5nJywgMTI4MCwgNDUpO1xyXG5cclxuICAgICAgICAvLyBKdW5rc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFnJywgJy9hc3NldHMvaW1hZ2VzL2JhZy5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2JhcnJlbCcsICcvYXNzZXRzL2ltYWdlcy9iYXJyZWwucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib290JywgJy9hc3NldHMvaW1hZ2VzL2Jvb3QucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdib3R0bGUnLCAnL2Fzc2V0cy9pbWFnZXMvYm90dGxlLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgndHlyZScsICcvYXNzZXRzL2ltYWdlcy90eXJlLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnYmFsbCcsICcvYXNzZXRzL2ltYWdlcy9iYWxsLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgndW5kZXJuZXQnLCAnL2Fzc2V0cy9pbWFnZXMvdW5kZXJuZXQucG5nJyk7XHJcblxyXG4gICAgICAgIC8vIE9iamVjdHNcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ2NyYWInLCAnL2Fzc2V0cy9pbWFnZXMvYW5ncnljcmFiLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcmZpc2gnLCAnL2Fzc2V0cy9pbWFnZXMvc3RhcmZpc2gucG5nJyk7XHJcblxyXG4gICAgICAgIC8vIE1haW4gY2hhcmFjdGVyc1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvb2lsYmFjay5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2RvbHBoaW4nLCAnL2Fzc2V0cy9pbWFnZXMvbmV3LWRvbHBoaW4ucG5nJywgMjQ1LCAxMDMpO1xyXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnYmFycmllcicsICcvYXNzZXRzL2ltYWdlcy9ib29zdC5wbmcnLCAyODgsIDI4OSk7XHJcblxyXG4gICAgICAgIC8vIEF1ZGlvXHJcbiAgICAgICAgZ2FtZS5sb2FkLmF1ZGlvKCdKdW5rcycsICcvYXNzZXRzL2F1ZGlvL0p1bmtzLm9nZycpO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgYWR2YW5jZWQgdGltaW5nIGZvciBGUFMgY291bnRlclxyXG4gICAgICAgIGdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogV2hlcmUgd2UgY3JlYXRlIGFuZCBpbml0aWFsaXplIG9iamVjdHNcclxuICAgICAqIGZvciB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAgICAgLy8gU2V0IGJvdW5kYXJpZXMgb2YgdGhlIHdvcmxkXHJcbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAgICAgLy8gRW5hYmxlIHRoZSBQMiBQaHlzaWNzIHN5c3RlbVxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckIgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ2JhY2tncm91bmRMMScpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAwLCAxMDgwLCAnYmFja2dyb3VuZEwyJyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB0cmFuc3BhcmVuY3kgb2YgYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYWxwaGEgPSAxO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQi5hbHBoYSA9IDAuNjtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYWxwaGEgPSAxO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUgUGh5c2ljcyBvbiBiYWNrZ3JvdW5kIGxheWVyc1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJBLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJCLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQudGV4dHVyZXMubGF5ZXJDLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBQYXJhbGxheCBzY3JvbGxpbmcgb24gYmFja2dyb3VuZCBsYXllcnNcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckEuYm9keS52ZWxvY2l0eS54ID0gREQucGxheWVyLnNwZWVkIC0gKDMgKiBERC50ZXh0dXJlcy5zcGVlZCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCAtICgyICogREQudGV4dHVyZXMuc3BlZWQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQy5ib2R5LnZlbG9jaXR5LnggPSBERC5wbGF5ZXIuc3BlZWQgLSAoMSAqIERELnRleHR1cmVzLnNwZWVkKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSBiYWNrZ3JvdW5kIGxheWVycyBpbW11bmUgdG8gY29sbGlzaW9uc1xyXG4gICAgICAgIERELnRleHR1cmVzLmxheWVyQS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcbiAgICAgICAgREQudGV4dHVyZXMubGF5ZXJCLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuICAgICAgICBERC50ZXh0dXJlcy5sYXllckMuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBBZGQgcGxheWVyXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQgPSBnYW1lLmFkZC5zcHJpdGUoMzAwMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZG9scGhpbicpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LnNjYWxlLnNldFRvKDAuNCwgMC40KTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnYmFycmllcicpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5lbmFibGUoREQucGxheWVyLmJhcnJpZXIuZWxlbWVudCwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFscGhhID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFuaW1hdGlvbnMuYWRkKCdib29zdCcsIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTFdLCAxMCwgdHJ1ZSk7XHJcbiAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5hbmltYXRpb25zLnBsYXkoJ2Jvb3N0Jyk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXNcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnBsYXllci5lbGVtZW50KTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIEFkZCBvaWxzcGlsbCBlbGVtZW50IGFuZCBlbmFibGUgUGh5c2ljc1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgxNjAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELm9iamVjdHMuc3BpbGwuZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vIFdhdmVzXHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQpO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3dhdmUnLCBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gU2FuZFxyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudCA9IGdhbWUuYWRkLnNwcml0ZSgwLCAxMDgwLCAnd2F2ZXMnKTtcclxuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKERELnRleHR1cmVzLnNhbmQuZWxlbWVudCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmFscGhhID0gMDtcclxuXHJcbiAgICAgICAgLy8gU291bmQgc3R1ZmZcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZCA9IGdhbWUuYWRkLmF1ZGlvKCdKdW5rcycpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFsbG93TXVsdGlwbGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhcnJlbCcsIDAsIDIpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcignYm90dGxlJywgMiwgMC41KTtcclxuICAgICAgICBERC5nYW1lLmF1ZGlvLkp1bmtTb3VuZC5hZGRNYXJrZXIoJ2JhZycsIDMsIDAuNCk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib290JywgMy41LCAwLjEpO1xyXG4gICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLmFkZE1hcmtlcigndHlyZScsIDQsIDAuMik7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdzdGFyZmlzaCcsIDMuNiwgMC4zNSk7XHJcbiAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQuYWRkTWFya2VyKCdib29zdCcsIDQuNSwgMSk7XHJcblxyXG4gICAgICAgIC8vIFBsYXllciBhbmltYXRpb25zXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzAsIDEsIDIsIDMsIDRdLCAxMCwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gREQucGxheWVyLmVsZW1lbnQuYW5pbWF0aW9ucy5hZGQoJ2NvbGxpZGUnLCBbOSwgOCwgNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sIDEwMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBjb2xsaXNpb24gZ3JvdXBzXHJcbiAgICAgICAgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5qdW5rcy5jb2xsaXNpb25Hcm91cCA9IGdhbWUucGh5c2ljcy5wMi5jcmVhdGVDb2xsaXNpb25Hcm91cCgpO1xyXG4gICAgICAgIERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAgPSBnYW1lLnBoeXNpY3MucDIuY3JlYXRlQ29sbGlzaW9uR3JvdXAoKTtcclxuICAgICAgICBERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICAgICAgREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIFxyXG4gICAgICAgIC8vIENvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzICh3aGljaCB3ZSBkbylcclxuICAgICAgICAvLyBXaGF0IHRoaXMgZG9lcyBpcyBhZGp1c3QgdGhlIGJvdW5kcyB0byB1c2UgaXRzIG93biBjb2xsaXNpb24gZ3JvdXAuXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLnVwZGF0ZUJvdW5kc0NvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGp1bmtzIGFuZCBzdGFyZmlzaGVzXHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUp1bmtzKCk7XHJcbiAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZVN0YXJmaXNoKCk7XHJcbiAgICAgICAgLy9ERC5nYW1lLmFjdGlvbnMuY3JlYXRlTmV0cygpO1xyXG5cclxuICAgICAgICBERC5nYW1lLndvcmxkLmxhc3RHZW5lcmF0ZWRQb3NpdGlvbiA9IERELnBsYXllci5lbGVtZW50Lng7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIGNvbGxpc2lvbnNcclxuICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnBsYXllci5jb2xsaXNpb25Hcm91cCk7XHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LnNldENvbGxpc2lvbkdyb3VwKERELnRleHR1cmVzLndhdmVzLmNvbGxpc2lvbkdyb3VwKTtcclxuICAgICAgICBERC50ZXh0dXJlcy5zYW5kLmVsZW1lbnQuYm9keS5zZXRDb2xsaXNpb25Hcm91cChERC50ZXh0dXJlcy5zYW5kLmNvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgREQudGV4dHVyZXMud2F2ZXMuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC50ZXh0dXJlcy53YXZlcy5jb2xsaXNpb25Hcm91cCwgREQucGxheWVyLmNvbGxpc2lvbkdyb3VwXSk7XHJcbiAgICAgICAgREQudGV4dHVyZXMuc2FuZC5lbGVtZW50LmJvZHkuY29sbGlkZXMoW0RELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAsIERELnBsYXllci5jb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgICAgIC8vIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LmNvbGxpZGVzKFtERC5vYmplY3RzLnNwaWxsLmNvbGxpc2lvbkdyb3VwLCBERC5wbGF5ZXIuY29sbGlzaW9uR3JvdXBdKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLmp1bmtzLmNvbGxpc2lvbkdyb3VwLCBqdW5rSGl0LCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELm9iamVjdHMuc3BpbGwuY29sbGlzaW9uR3JvdXAsIERELmdhbWUuYWN0aW9ucy5nYW1lT3ZlciwgdGhpcyk7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5jb2xsaWRlcyhERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxpc2lvbkdyb3VwLCBjb2xsZWN0U3RhcmZpc2gsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQudGV4dHVyZXMud2F2ZXMuY29sbGlzaW9uR3JvdXAsIGhpdFdhdmVzLCB0aGlzKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmNvbGxpZGVzKERELnRleHR1cmVzLnNhbmQuY29sbGlzaW9uR3JvdXAsIGhpdFNhbmQsIHRoaXMpO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuY29sbGlkZXMoREQub2JqZWN0cy5uZXRzLmNvbGxpc2lvbkdyb3VwLCBuZXRIaXQsIHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBrZXlib2FyZCBjb250cm9sc1xyXG4gICAgICAgIERELmdhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBjYW1lcmFcclxuICAgICAgICBnYW1lLmNhbWVyYS5mb2xsb3coREQucGxheWVyLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAvLyBQYXVzZSBhbmQgc2hvdyBNYWluIE1lbnUgb24gZmlyc3QgcnVuXHJcbiAgICAgICAgaWYgKERELmdhbWUuZmlyc3RSdW4pIHtcclxuICAgICAgICAgICAgLy9wbGF5TXVzaWMoKTtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuZmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGxheS5zaG93TWVudShEaXNwbGF5RGF0YS5tYWluTWVudS5lbGVtZW50KTtcclxuICAgICAgICAgICAgUGxheUFuaW1hdGlvbnMubWFpbk1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgZnVuY3Rpb25cclxuICAgICAqIFxyXG4gICAgICogVGhlIGdhbWUgbG9vcCAtIHJ1biBvbmNlIHBlciBmcmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhbWUgb3ZlclxyXG4gICAgICAgIGlmICggZG9scGhpbklzQ292ZXJlZCgpICkge1xyXG4gICAgICAgICAgICBERC5nYW1lLmFjdGlvbnMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggREQub2JqZWN0cy5zcGlsbC5lbGVtZW50LnggPj0gKGdhbWUuY2FtZXJhLnggKyA1MDApKSB7XHJcbiAgICAgICAgICAgICAgICBERC5vYmplY3RzLnNwaWxsLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBPbiBkZW1hbmQgZ2VuZXJhdGlvblxyXG4gICAgICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC54ID49IERELmdhbWUud29ybGQubGFzdEdlbmVyYXRlZFBvc2l0aW9uICsgZ2FtZS5jYW1lcmEud2lkdGggKyAyMDApIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hY3Rpb25zLmNyZWF0ZUp1bmtzKCk7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jcmVhdGVTdGFyZmlzaCgpO1xyXG4gICAgICAgICAgICAvL0RELmdhbWUuYWN0aW9ucy5jcmVhdGVOZXRzKCk7XHJcbiAgICAgICAgICAgIERELmdhbWUud29ybGQubGFzdEdlbmVyYXRlZFBvc2l0aW9uID0gREQucGxheWVyLmVsZW1lbnQueDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsZWFudXAgXHJcbiAgICAgICAgaWYgKERELm9iamVjdHMuanVua3MuZWxlbWVudHMubGVuZ3RoID49IDIgJiAhREQuZ2FtZS53b3JsZC5jbGVhbmluZ1VwKSB7XHJcbiAgICAgICAgICAgIERELmdhbWUuYWN0aW9ucy5jbGVhblVwKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYWN0aXZlKSB7IFxyXG4gICAgICAgICAgICBpZiAoKERELnBsYXllci5lbGVtZW50LnggLSBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5iZWdpbikgPj0gMzAwKSB7XHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy50b3RhbCArPSAgLTAuNCAqKERELnBsYXllci5zcGVlZC9ERC5nYW1lLm1vZGlmaWVycy5ib29zdC50b3RhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoREQub2JqZWN0cy5qdW5rcy5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFscGhhICs9IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmFscGhhICs9IC0wLjM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoREQuZ2FtZS5tb2RpZmllcnMudG90YWwgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQm9vc3QgRW5kIDooJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS54ID0gZ2FtZS5jYW1lcmEueCArIDY0NztcclxuICAgICAgICBERC50ZXh0dXJlcy53YXZlcy5lbGVtZW50LmJvZHkueSA9IDIwO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnggPSBnYW1lLmNhbWVyYS54O1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LnkgPSAxMDgwO1xyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYW5pbWF0aW9ucy5wbGF5KCd3YXZlJyk7XHJcblxyXG4gICAgICAgIERELnRleHR1cmVzLndhdmVzLmVsZW1lbnQuYm9keS5hbmdsZSA9IDAuMDAwMDAwO1xyXG4gICAgICAgIERELnRleHR1cmVzLnNhbmQuZWxlbWVudC5ib2R5LiBhbmdsZSA9IDAuMDAwMDAwO1xyXG5cclxuICAgICAgICAvLyBHb3Zlcm5zIGFuZCBjb250cm9scyBib29zdFxyXG4gICAgICAgIGlmICghREQuZ2FtZS5ydW5FbmQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHMgREQuZ2FtZS5zY29yZS5sYXN0UnVuIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyLiBcclxuICAgICAgICAgICAgLy8gVGhlIC04IGNvbXBlbnNhdGVzIGZvciB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXllciBpbiB0aGUgd29ybGRcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gKChERC5wbGF5ZXIuZWxlbWVudC54IC8gNDAwKSAtIDgpICogREQuZ2FtZS5tb2RpZmllcnMubXVsdGlwbGllcjtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5sYXN0UnVuID0gcGFyc2VJbnQoREQuZ2FtZS5zY29yZS5sYXN0UnVuLCAxMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBNaW5pbWFwOiB1cGRhdGUgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5wcm9ncmVzc0Jhci5zcGlsbC53aWR0aCggKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54ICogNTAwICkgLyAxOTIwMDAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pbmltYXA6IHVwZGF0ZSBkb2xwaGluIHhcclxuICAgICAgICAgICAgRGlzcGxheURhdGEuaHVkLnByb2dyZXNzQmFyLmRvbHBoaW4uY3NzKFxyXG4gICAgICAgICAgICAgICAgJ2xlZnQnLCAoIChERC5wbGF5ZXIuZWxlbWVudC54ICogNDkyICkgLyAxOTIwMDAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWluaW1hcDogVXBkYXRlIGRvbHBoaW4geVxyXG4gICAgICAgICAgICBEaXNwbGF5RGF0YS5odWQucHJvZ3Jlc3NCYXIuZG9scGhpbi5jc3MoXHJcbiAgICAgICAgICAgICAgICAndG9wJywgKCAoREQucGxheWVyLmVsZW1lbnQueSAqIDIwKSAvIDEwODAgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgdmVsb2NpdHkgYW5kIHBsYXkgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCA9IERELnBsYXllci5zcGVlZCArICgzMCAqIERELmdhbWUud29ybGQubGV2ZWwpICsgREQuZ2FtZS5tb2RpZmllcnMudG90YWw7XHJcbiAgICAgICAgICAgIERELnBsYXllci5iYXJyaWVyLmVsZW1lbnQuYm9keS54ID0gREQucGxheWVyLmVsZW1lbnQuYm9keS54IC0gMTAwO1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuYmFycmllci5lbGVtZW50LmJvZHkueSA9IERELnBsYXllci5lbGVtZW50LmJvZHkueSAtIDE1MDtcclxuICAgIFxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIG9pbHNwaWxsIHZlbG9jaXR5XHJcbiAgICAgICAgICAgIERELm9iamVjdHMuc3BpbGwuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggPSAzNTAgKyAoMjAgKiBERC5nYW1lLndvcmxkLmxldmVsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghREQub2JqZWN0cy5qdW5rcy5hY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVzZXQgdGhlIHBsYXllcidzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnggPj0gKERELmdhbWUud29ybGQuaW50ZXJ2YWwgKiBERC5nYW1lLndvcmxkLmxldmVsKSkge1xyXG4gICAgICAgICAgICBpZiAoREQuZ2FtZS53b3JsZC5sZXZlbCA8IDE5KSB7XHJcbiAgICAgICAgICAgICAgICBERC5nYW1lLndvcmxkLmxldmVsICs9IDE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTGV2ZWwgKHNwZWVkKSB1cCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKERELmdhbWUuY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICAgICAgaWYgKERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIURELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuICs9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLnRvdGFsICs9IChERC5wbGF5ZXIuc3BlZWQqREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QudG90YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgREQuZ2FtZS5tb2RpZmllcnMuYm9vc3QuYmVnaW4gPSBERC5wbGF5ZXIuZWxlbWVudC54O1xyXG4gICAgICAgICAgICAgICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLnBsYXkoJ2Jvb3N0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgREQucGxheWVyLmJhcnJpZXIuZWxlbWVudC5hbHBoYSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JPT1NUIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIGNoYXJnZXMgbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoREQuZ2FtZS5jdXJzb3JzLnVwLmlzRG93biB8fCBpc1RvdWNoaW5nVXAoKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueSA9IC0xICogREQucGxheWVyLnZlcnRTcGVlZDtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAtMSAqIERELnBsYXllci5hbmdsZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChERC5nYW1lLmN1cnNvcnMuZG93bi5pc0Rvd24gfHwgaXNUb3VjaGluZ0Rvd24oKSkge1xyXG4gICAgICAgICAgICBpZiAoIURELnBsYXllci5hY2NlbGVyYXRpb25BY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuYW5nbGUgPSBERC5wbGF5ZXIuYW5nbGU7XHJcbiAgICAgICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSBERC5wbGF5ZXIudmVydFNwZWVkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS5hbmdsZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmFuZ2xlID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXIgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGdhbWUuZGVidWcudGV4dChnYW1lLnRpbWUuZnBzIHx8ICctLScsIDIsIDE0LCAnIzAwZmYwMCcpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2NvcmVcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zY29yZSAhPT0gREQuZ2FtZS5zY29yZS5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zY29yZS50ZXh0KERELmdhbWUuc2NvcmUubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc2NvcmUgPSBERC5nYW1lLnNjb3JlLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc3RhcmZpc2hcclxuICAgICAgICBpZiAoREQuZ2FtZS5zY29yZS5sYXN0RnJhbWVWYWx1ZS5zdGFyZmlzaCAhPT0gREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuKSB7XHJcbiAgICAgICAgICAgIERpc3BsYXlEYXRhLmh1ZC5zdGFyZmlzaC50ZXh0KERELmdhbWUuc2NvcmUuc3RhcmZpc2gubGFzdFJ1bik7XHJcbiAgICAgICAgICAgIERELmdhbWUuc2NvcmUubGFzdEZyYW1lVmFsdWUuc3RhcmZpc2ggPSBERC5nYW1lLnNjb3JlLnN0YXJmaXNoLmxhc3RSdW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBnYW1lLmRlYnVnLnRleHQoJ1Njb3JlIE11bHRpcGxpZXI6ICcgKyBERC5nYW1lLm1vZGlmaWVycy5tdWx0aXBsaWVyLCAzMiwgNzIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IGlmIG9pbHNwaWxsIGlzIGNvdmVyaW5nIERvbHBoaW5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZG9scGhpbklzQ292ZXJlZCgpIHtcclxuICAgICAgICBpZiAoKERELm9iamVjdHMuc3BpbGwuZWxlbWVudC54IC0gREQucGxheWVyLmVsZW1lbnQueCkgPiAtNzUwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIHVwcGVyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1RvdWNoaW5nVXAoKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMS5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjEueSA8IDM2MCkgfHxcclxuICAgICAgICAgICAgKGdhbWUuaW5wdXQucG9pbnRlcjIuaXNEb3duICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueCA+IDc4MCAmJiBnYW1lLmlucHV0LnBvaW50ZXIyLnkgPCAzNjApXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZWN0IHRvdWNoIGlucHV0IGluIGxvd2VyIHJpZ2h0IGhhbGYgb2Ygc2NyZWVuXHJcbiAgICAgKiBmb3IgYm90aCBwb2ludGVyMSAoZmlyc3QgZmluZ2VyKSAmIHBvaW50ZXIyIChzZWNvbmQgZmluZ2VyKVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1RvdWNoaW5nRG93bigpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChnYW1lLmlucHV0LnBvaW50ZXIxLmlzRG93biAmJiBnYW1lLmlucHV0LnBvaW50ZXIxLnggPiA3ODAgJiYgZ2FtZS5pbnB1dC5wb2ludGVyMS55ID4gMzYwKSB8fFxyXG4gICAgICAgICAgICAoZ2FtZS5pbnB1dC5wb2ludGVyMi5pc0Rvd24gJiYgZ2FtZS5pbnB1dC5wb2ludGVyMi54ID4gNzgwICYmIGdhbWUuaW5wdXQucG9pbnRlcjIueSA+IDM2MClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5jcmVhc2UgcGxheWVyIHNwZWVkIGFmdGVyXHJcbiAgICAgKiBjb2xsaXNpb24gd2l0aCBqdW5rXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGp1bmtIaXQocGxheWVyLCBqdW5rKSB7XHJcbiAgICAgICAgaWYgKCFERC5nYW1lLm1vZGlmaWVycy5ib29zdC5hY3RpdmUpIHtcclxuXHJcbiAgICAgICAgICAgIERELmdhbWUuYXVkaW8uSnVua1NvdW5kLnBsYXkoanVuay5zcHJpdGUua2V5KTtcclxuICAgICAgICAgICAgLy8gVGhlIHNwZWVkIHRoYXQgdGhlIHBsYXllciBzaG91bGQgYmUgdHJhdmVsbGluZyBhdCBpcyBzdG9yZWQsIFxyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgdGhlIGZ1bmN0aW9uIGJlbG93IHdpbGwgc2xvdyBkb3duIHJhdGhlciB0aGFuIHNwZWVkIHVwLlxyXG4gICAgICAgICAgICB2YXIgb3JpZ2luYWxTcGVlZCA9IERELnBsYXllci5zcGVlZDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHRpbmcgYSBzbG93IHNwZWVkIHN0cmFpZ2h0IGF3YXkgc28gaXQgZG9lc24ndCBmZWVsIGxhZ2d5XHJcbiAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiAoREQub2JqZWN0cy5qdW5rcy5zbG93L0RELmdhbWUud29ybGQubGV2ZWwpO1xyXG5cclxuICAgICAgICAgICAgLy8gc2V0SW50ZXJ2YWwgbWVhbnMgdGhhdCBJIGNhbiBwZXJmb3JtIHRoaXMgb3ZlciBzb21lIHRpbWUgXHJcbiAgICAgICAgICAgIC8vIGFuZCBncmFkdWFsbHkgd2l0aG91dCB1c2luZyBQaGFzZXJzIHN0dXBpZCB0aW1lIGZ1bmN0aW9uLlxyXG4gICAgICAgICAgICAvLyBUaW1lIG9uIHRoZSBzZWNvbmQgYXJndW1lbnQgaXMgaW4gbWlsbGlzZWNvbmRzLiBcclxuICAgICAgICAgICAgdmFyIHNwZWVkVXAgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChERC5vYmplY3RzLmp1bmtzLnNsb3cgPD0gMS4wNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgb3JpZ2luYWxTcGVlZCBpcyB1c2VkIHRvIHByb3ZpZGUgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBncmFkdWFsIHNwZWVkIHVwIHRoYXQgZmVlbHMgYSBsaXR0bGUgbW9yZSBuYXR1cmFsLlxyXG4gICAgICAgICAgICAgICAgICAgIERELnBsYXllci5zcGVlZCA9IG9yaWdpbmFsU3BlZWQgKiBERC5vYmplY3RzLmp1bmtzLnNsb3c7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlcnkgc2Vjb25kIHRoZSBkb2xwaGluIGdldHMgMTAlIGNsb3NlciB0byBmdWxsIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIERELm9iamVjdHMuanVua3Muc2xvdyArPSAwLjA1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gRGV0ZWN0aW5nIHdoZW4gdGhlIG1heGltdW0gc3BlZWQgaXMgcmVhY2hlZCwgc28gdGhlIGZ1bmN0aW9uIGNhbiBlbmQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcnZhbCB0aGF0IGlzIGNhdXNpbmcgdGhlIGNoYW5nZSBpbiBkb2xwaGluIHNwZWVkLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKERELnBsYXllci5lbGVtZW50LmJvZHkudmVsb2NpdHkueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzcGVlZFVwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0dGluZyB0aGUgc2xvd2luZyBlZmZlY3QgYWZ0ZXIgdGhlIG5vcm1hbCBzcGVlZCBpcyByZWFjaGVkIGFnYWluLlxyXG4gICAgICAgICAgICBERC5vYmplY3RzLmp1bmtzLnNsb3cgPSAwLjQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlIHBsYXllciBjb2xsaXNpb24gd2l0aCB3YXZlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBoaXRXYXZlcygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV2F2ZSBoaXQnKTtcclxuXHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHN0YXJmaXNoXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gcGxheWVyXHJcbiAgICAgKiBAcGFyYW0gIHtHYW1lLnNwcml0ZX0gc3RhcmZpc2hcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29sbGVjdFN0YXJmaXNoKHBsYXllciwgc3RhcmZpc2gpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgaWQgPSBzdGFyZmlzaC5kYXRhLmlkO1xyXG4gICAgICAgIERELmdhbWUuYWN0aW9ucy5raWxsU3ByaXRlKHN0YXJmaXNoLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIGlmIChERC5vYmplY3RzLnN0YXJmaXNoLmNvbGxlY3RlZElkcy5pbmRleE9mKGlkKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgREQuZ2FtZS5hdWRpby5KdW5rU291bmQucGxheSgnc3RhcmZpc2gnKTtcclxuICAgICAgICAgICAgREQuZ2FtZS5zY29yZS5zdGFyZmlzaC5sYXN0UnVuICs9IDE7XHJcbiAgICAgICAgICAgIERELmdhbWUubW9kaWZpZXJzLmJvb3N0LmNoYXJnZXMgKz0gMTtcclxuICAgICAgICAgICAgREQub2JqZWN0cy5zdGFyZmlzaC5jb2xsZWN0ZWRJZHMucHVzaChpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFyZmlzaCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIHBsYXllcidzIGJvdW5jZSBhY2NlbGVyYXRpb25cclxuICAgICAqIGFmdGVyIGNvbGxpZGluZyB3aXRoIHdhdmVzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHN0b3BBY2NlbGVyYXRpb24oKSB7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LmdyYXZpdHkueSA9IDA7XHJcbiAgICAgICAgREQucGxheWVyLmVsZW1lbnQuYm9keS52ZWxvY2l0eS54ICs9IDEwMDtcclxuICAgICAgICBjb25zb2xlLmxvZygnU3RvcCBBY2NlbGVyYXRpb24nKTtcclxuICAgICAgICBERC5wbGF5ZXIuYWNjZWxlcmF0aW9uQWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGUgcGxheWVyIGNvbGxpc2lvbiB3aXRoIHNhbmRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaGl0U2FuZCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU2FuZCBoYXMgYmVlbiBoaXQnKTtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnkgPSAtNTAwO1xyXG4gICAgICAgIERELnBsYXllci5lbGVtZW50LmJvZHkuZ3Jhdml0eS55ID0gLTUwMDtcclxuICAgICAgICBERC5wbGF5ZXIuZWxlbWVudC5ib2R5LnZlbG9jaXR5LnggKz0gLTEwMDtcclxuICAgICAgICBzZXRUaW1lb3V0KHN0b3BBY2NlbGVyYXRpb24sIDEwMCk7XHJcbiAgICAgICAgREQucGxheWVyLmFjY2VsZXJhdGlvbkFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG5ldEhpdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnbmV0SGl0Jyk7XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4vLyBSZXN0b3JlIHBlcnNpc3RlZCB2YWx1ZXMgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbkRELmdhbWUuYWN0aW9ucy5yZXN0b3JlU2F2ZWRWYWx1ZXMoKTtcclxuXHJcbi8vIEV2ZXJ5dGhpbmcgaXMgZGVjbGFyZWQ6IGluaXRpYWxpemUgZ2FtZVxyXG5ERC5nYW1lLmFjdGlvbnMuc3RhcnQoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9