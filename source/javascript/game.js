// vim: set expandtab ts=4 sts=4 sw=4:
var DolphinDive = {
    version: '0.0.1'
};

(function() {
    'use strict';

    console.info('Starting Dolphin Dive v' + DolphinDive.version);

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update
    });

    var player;
    var spill;
    var cursors;
    var time;
    var speed = 300;
    var firstRun = true;
    var gamePauseButton;

    /**
     * Where we register and load assets
     * including images and sprite sheets
     */
    function preload() {
        game.load.image('sky', '/assets/images/sky.png');
        game.load.image('spill', '/assets/images/ball.png');
        game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
    }

    /**
     * Where we initialize objects
     * for the game
     */
    function create() {
        // We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // A simple background for our game
        game.add.tileSprite(0, 0, 98200, 600, 'sky');
        game.world.setBounds(0, 0, 98200, 600);
        
        // The player and its settings
        player = game.add.sprite(parseInt((game.camera.width / 2), 10), game.world.height - 150, 'dude');

        // The spill (ball for now)
        spill = game.add.sprite(-575, 0, 'spill');

        // We need to enable physics on the player and the spill
        game.physics.arcade.enable(player);
        game.physics.arcade.enable(spill);

        // Player physics properties. Give the little guy a slight bounce.
        player.body.collideWorldBounds = true;

        // Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();

        game.camera.follow(player);

        // Timer - for ball acceleration
        time = 1;

        if (firstRun) {
            game.paused = true;
            firstRun = false;
            mainMenu();
        }

        /*
         * PAUSE ACTIVATION
         * */
        // Add a button using just text. This can be a sprite Heath makes, as shown in the example.
        gamePauseButton = game.add.text(700, 20, 'PAUSE', {
            font: '24px cursive',
            fill: 'black'
        });

        // gamePauseButton = game.add.sprite(700, 20, 'gamePauseButton');
        // Activating the input for this button, it can be clicked on.
        gamePauseButton.inputEnabled = true;

        // On the event where the player clicks the button change the game state to paused.
        // 
        gamePauseButton.events.onInputUp.add(function() {
            // This will activate phasers pause function, where some magic should happen.
            game.paused = true;

            // Makes the button invisible and gets rid of all interaction with it.
            gamePauseButton.exists = false;

            // Activating the external function.
            pauseMenu();
        });
    }

    function update() {
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        spill.body.velocity.x = time;
        time++;

        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -1 * speed;

            player.animations.play('left');
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = speed;

            player.animations.play('right');
        } else if (cursors.down.isDown) {
            //  Move downwards
            player.body.velocity.y = speed;
        } else if (cursors.up.isDown) {
            //  Move upwards
            player.body.velocity.y = -1 * speed;
        } else {
            //  Stand still
            player.animations.stop();

            player.frame = 4;
        }
    }

    function mainMenu() {
        // Show the main menu
        $('#beginButton').removeClass('hidden');

        // Setup main menu button
        $('#beginButton').click(function() {
            game.paused = false;

            $('#mainMenu').addClass('hidden');
        });
    }

    function pauseMenu() {
        // Show the pause menu
        $('#pauseMenu').removeClass('hidden');

        // Set up resume button
        $('#resumeButton').click(function() {
            game.paused = false;

            $('#pauseMenu').addClass('hidden');
        });
    }

})();
