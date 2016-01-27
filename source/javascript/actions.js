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
        console.log(nets)
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
