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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG52YXIgRG9scGhpbkRpdmUgPSB7XHJcbiAgICB2ZXJzaW9uOiAnMC4wLjEnXHJcbn07XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY29uc29sZS5pbmZvKCdTdGFydGluZyBEb2xwaGluIERpdmUgdicgKyBEb2xwaGluRGl2ZS52ZXJzaW9uKTtcclxuXHJcbiAgICB2YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xyXG4gICAgICAgIHByZWxvYWQ6IHByZWxvYWQsXHJcbiAgICAgICAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBwbGF5ZXI7XHJcbiAgICB2YXIgc3BpbGw7XHJcbiAgICB2YXIgY3Vyc29ycztcclxuICAgIHZhciB0aW1lO1xyXG4gICAgdmFyIHNwZWVkID0gMzAwO1xyXG4gICAgdmFyIGZpcnN0UnVuID0gdHJ1ZTtcclxuICAgIHZhciBnYW1lUGF1c2VCdXR0b247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHNcclxuICAgICAqIGluY2x1ZGluZyBpbWFnZXMgYW5kIHNwcml0ZSBzaGVldHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NreScsICcvYXNzZXRzL2ltYWdlcy9za3kucG5nJyk7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9iYWxsLnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVyZSB3ZSBpbml0aWFsaXplIG9iamVjdHNcclxuICAgICAqIGZvciB0aGUgZ2FtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAgICAgLy8gV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cclxuICAgICAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAgICAgLy8gQSBzaW1wbGUgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgICAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDk4MjAwLCA2MDAsICdza3knKTtcclxuICAgICAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCA5ODIwMCwgNjAwKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBUaGUgcGxheWVyIGFuZCBpdHMgc2V0dGluZ3NcclxuICAgICAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUocGFyc2VJbnQoKGdhbWUuY2FtZXJhLndpZHRoIC8gMiksIDEwKSwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAsICdkdWRlJyk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzcGlsbCAoYmFsbCBmb3Igbm93KVxyXG4gICAgICAgIHNwaWxsID0gZ2FtZS5hZGQuc3ByaXRlKC01NzUsIDAsICdzcGlsbCcpO1xyXG5cclxuICAgICAgICAvLyBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXIgYW5kIHRoZSBzcGlsbFxyXG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHBsYXllcik7XHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUoc3BpbGwpO1xyXG5cclxuICAgICAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLiBHaXZlIHRoZSBsaXR0bGUgZ3V5IGEgc2xpZ2h0IGJvdW5jZS5cclxuICAgICAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpO1xyXG5cclxuICAgICAgICAvLyAgT3VyIGNvbnRyb2xzLlxyXG4gICAgICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAgICAgZ2FtZS5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcblxyXG4gICAgICAgIC8vIFRpbWVyIC0gZm9yIGJhbGwgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgdGltZSA9IDE7XHJcblxyXG4gICAgICAgIGlmIChmaXJzdFJ1bikge1xyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFBBVVNFIEFDVElWQVRJT05cclxuICAgICAgICAgKiAqL1xyXG4gICAgICAgIC8vIEFkZCBhIGJ1dHRvbiB1c2luZyBqdXN0IHRleHQuIFRoaXMgY2FuIGJlIGEgc3ByaXRlIEhlYXRoIG1ha2VzLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZS5cclxuICAgICAgICBnYW1lUGF1c2VCdXR0b24gPSBnYW1lLmFkZC50ZXh0KDcwMCwgMjAsICdQQVVTRScsIHtcclxuICAgICAgICAgICAgZm9udDogJzI0cHggY3Vyc2l2ZScsXHJcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZVBhdXNlQnV0dG9uID0gZ2FtZS5hZGQuc3ByaXRlKDcwMCwgMjAsICdnYW1lUGF1c2VCdXR0b24nKTtcclxuICAgICAgICAvLyBBY3RpdmF0aW5nIHRoZSBpbnB1dCBmb3IgdGhpcyBidXR0b24sIGl0IGNhbiBiZSBjbGlja2VkIG9uLlxyXG4gICAgICAgIGdhbWVQYXVzZUJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gICAgICAgIC8vIFxyXG4gICAgICAgIGdhbWVQYXVzZUJ1dHRvbi5ldmVudHMub25JbnB1dFVwLmFkZChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyB3aWxsIGFjdGl2YXRlIHBoYXNlcnMgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gTWFrZXMgdGhlIGJ1dHRvbiBpbnZpc2libGUgYW5kIGdldHMgcmlkIG9mIGFsbCBpbnRlcmFjdGlvbiB3aXRoIGl0LlxyXG4gICAgICAgICAgICBnYW1lUGF1c2VCdXR0b24uZXhpc3RzID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBBY3RpdmF0aW5nIHRoZSBleHRlcm5hbCBmdW5jdGlvbi5cclxuICAgICAgICAgICAgcGF1c2VNZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgICAgIC8vICBSZXNldCB0aGUgcGxheWVycyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG4gICAgICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IHRpbWU7XHJcbiAgICAgICAgdGltZSsrO1xyXG5cclxuICAgICAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bikge1xyXG4gICAgICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxyXG4gICAgICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTEgKiBzcGVlZDtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcbiAgICAgICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxyXG4gICAgICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bikge1xyXG4gICAgICAgICAgICAvLyAgTW92ZSBkb3dud2FyZHNcclxuICAgICAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IHNwZWVkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY3Vyc29ycy51cC5pc0Rvd24pIHtcclxuICAgICAgICAgICAgLy8gIE1vdmUgdXB3YXJkc1xyXG4gICAgICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTEgKiBzcGVlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgU3RhbmQgc3RpbGxcclxuICAgICAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmZyYW1lID0gNDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAgICAgLy8gU2hvdyB0aGUgbWFpbiBtZW51XHJcbiAgICAgICAgJCgnI2JlZ2luQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAgICAgJCgnI2JlZ2luQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgICAgIC8vIFNob3cgdGhlIHBhdXNlIG1lbnVcclxuICAgICAgICAkKCcjcGF1c2VNZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgcmVzdW1lIGJ1dHRvblxyXG4gICAgICAgICQoJyNyZXN1bWVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwYXVzZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=