// vim: set expandtab ts=4 sts=4 sw=4:
var DolphinDive = {
    version: '0.0.1'
};


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

/*
 * PAUSE ACTIVATION
 * */

// On the event where the player clicks the button change the game state to paused.
// 
$('#pauseButton').click(function() {
    // This will activate phasers pause function, where some magic should happen.
    game.paused = !game.paused;

    console.log('click!');
    // Activating the external function.
    pauseMenu();
});

function pauseMenu() {
    if (game.paused) {
        $('#pauseMenu').removeClass('hidden');

        //Returning to main menu.
        $('#mainMenuButton').click(function() {
            //Do score calculations.
            
            $('#pauseMenu').addClass('hidden');
            firstRun = true;
            create();
        });
        //Reset the game, with the same principle.
        $('#restartButton').click(function() {
            //Score calc

            $('#pauseMenu').addClass('hidden');
            create();
            game.paused = false;
        });
    }
    else {
        $('#pauseMenu').addClass('hidden');
        console.log('this happens');
    }
}

function mainMenu() {
    // Show the main menu
    $('#mainMenu').removeClass('hidden');
    $('#pauseButton').addClass('hidden');

    // Setup main menu button
    $('#beginButton').click(function() {
        game.paused = false;

        $('#mainMenu').addClass('hidden');
        $('#pauseButton').removeClass('hidden');
    });

    // Setup high scores stuff
    $('#highScoresButton').click(function() {
        $('#mainMenu').addClass('hidden');
        //Score array changes elements before display here.
        $('#scoreMenu').removeClass('hidden');

        $('#scoreReturnButton').click(function() {
            $('#scoreMenu').addClass('hidden');
            mainMenu();
        });
    });
    $('#aboutButton').click(function() {
        $('#mainMenu').addClass('hidden');
        //Score array changes elements before display here.
        $('#aboutMenu').removeClass('hidden');

        $('#aboutReturnButton').click(function() {
            $('#aboutMenu').addClass('hidden');
            mainMenu();
        });
    });

    // Setup about stuff
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0cz00IHN0cz00IHN3PTQ6XHJcbnZhciBEb2xwaGluRGl2ZSA9IHtcclxuICAgIHZlcnNpb246ICcwLjAuMSdcclxufTtcclxuXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5jb25zb2xlLmluZm8oJ1N0YXJ0aW5nIERvbHBoaW4gRGl2ZSB2JyArIERvbHBoaW5EaXZlLnZlcnNpb24pO1xyXG5cclxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgIHByZWxvYWQ6IHByZWxvYWQsXHJcbiAgICBjcmVhdGU6IGNyZWF0ZSxcclxuICAgIHVwZGF0ZTogdXBkYXRlXHJcbn0pO1xyXG5cclxudmFyIHBsYXllcjtcclxudmFyIHNwaWxsO1xyXG52YXIgY3Vyc29ycztcclxudmFyIHRpbWU7XHJcbnZhciBzcGVlZCA9IDMwMDtcclxudmFyIGZpcnN0UnVuID0gdHJ1ZTtcclxudmFyIGdhbWVQYXVzZUJ1dHRvbjtcclxuXHJcbi8qKlxyXG4gKiBXaGVyZSB3ZSByZWdpc3RlciBhbmQgbG9hZCBhc3NldHNcclxuICogaW5jbHVkaW5nIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xyXG4gKi9cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2t5JywgJy9hc3NldHMvaW1hZ2VzL3NreS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvYmFsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXaGVyZSB3ZSBpbml0aWFsaXplIG9iamVjdHNcclxuICogZm9yIHRoZSBnYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICAvLyBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gQSBzaW1wbGUgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgOTgyMDAsIDYwMCwgJ3NreScpO1xyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgOTgyMDAsIDYwMCk7XHJcblxyXG4gICAgLy8gVGhlIHBsYXllciBhbmQgaXRzIHNldHRpbmdzXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUocGFyc2VJbnQoKGdhbWUuY2FtZXJhLndpZHRoIC8gMiksIDEwKSwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAsICdkdWRlJyk7XHJcblxyXG4gICAgLy8gVGhlIHNwaWxsIChiYWxsIGZvciBub3cpXHJcbiAgICBzcGlsbCA9IGdhbWUuYWRkLnNwcml0ZSgtNTc1LCAwLCAnc3BpbGwnKTtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXIgYW5kIHRoZSBzcGlsbFxyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHNwaWxsKTtcclxuXHJcbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLiBHaXZlIHRoZSBsaXR0bGUgZ3V5IGEgc2xpZ2h0IGJvdW5jZS5cclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuXHJcbiAgICAvLyBUaW1lciAtIGZvciBiYWxsIGFjY2VsZXJhdGlvblxyXG4gICAgdGltZSA9IDE7XHJcblxyXG4gICAgaWYgKGZpcnN0UnVuKSB7XHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIGZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgbWFpbk1lbnUoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG4gICAgc3BpbGwuYm9keS52ZWxvY2l0eS54ID0gdGltZTtcclxuICAgIHRpbWUrKztcclxuXHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bikge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xICogc3BlZWQ7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIH0gZWxzZSBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24pIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICB9IGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pIHtcclxuICAgICAgICAvLyAgTW92ZSBkb3dud2FyZHNcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gc3BlZWQ7XHJcbiAgICB9IGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKSB7XHJcbiAgICAgICAgLy8gIE1vdmUgdXB3YXJkc1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIHNwZWVkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgU3RhbmQgc3RpbGxcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKCk7XHJcblxyXG4gICAgICAgIHBsYXllci5mcmFtZSA9IDQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qXHJcbiAqIFBBVVNFIEFDVElWQVRJT05cclxuICogKi9cclxuXHJcbi8vIE9uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWQuXHJcbi8vIFxyXG4kKCcjcGF1c2VCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgIC8vIFRoaXMgd2lsbCBhY3RpdmF0ZSBwaGFzZXJzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXHJcbiAgICBnYW1lLnBhdXNlZCA9ICFnYW1lLnBhdXNlZDtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnY2xpY2shJyk7XHJcbiAgICAvLyBBY3RpdmF0aW5nIHRoZSBleHRlcm5hbCBmdW5jdGlvbi5cclxuICAgIHBhdXNlTWVudSgpO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcclxuICAgIGlmIChnYW1lLnBhdXNlZCkge1xyXG4gICAgICAgICQoJyNwYXVzZU1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIC8vUmV0dXJuaW5nIHRvIG1haW4gbWVudS5cclxuICAgICAgICAkKCcjbWFpbk1lbnVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy9EbyBzY29yZSBjYWxjdWxhdGlvbnMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkKCcjcGF1c2VNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBmaXJzdFJ1biA9IHRydWU7XHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vUmVzZXQgdGhlIGdhbWUsIHdpdGggdGhlIHNhbWUgcHJpbmNpcGxlLlxyXG4gICAgICAgICQoJyNyZXN0YXJ0QnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vU2NvcmUgY2FsY1xyXG5cclxuICAgICAgICAgICAgJCgnI3BhdXNlTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgY3JlYXRlKCk7XHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAkKCcjcGF1c2VNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGhhcHBlbnMnKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAvLyBTaG93IHRoZSBtYWluIG1lbnVcclxuICAgICQoJyNtYWluTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgJCgnI3BhdXNlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0dXAgaGlnaCBzY29yZXMgc3R1ZmZcclxuICAgICQoJyNoaWdoU2NvcmVzQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI21haW5NZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgIC8vU2NvcmUgYXJyYXkgY2hhbmdlcyBlbGVtZW50cyBiZWZvcmUgZGlzcGxheSBoZXJlLlxyXG4gICAgICAgICQoJyNzY29yZU1lbnUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICQoJyNzY29yZVJldHVybkJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjc2NvcmVNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICAkKCcjYWJvdXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgLy9TY29yZSBhcnJheSBjaGFuZ2VzIGVsZW1lbnRzIGJlZm9yZSBkaXNwbGF5IGhlcmUuXHJcbiAgICAgICAgJCgnI2Fib3V0TWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgJCgnI2Fib3V0UmV0dXJuQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNhYm91dE1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIG1haW5NZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXR1cCBhYm91dCBzdHVmZlxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==