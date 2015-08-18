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
                'star'
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
                'healthpack'
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
