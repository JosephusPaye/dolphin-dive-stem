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
        $('#resetButton').click(function() {
            //Score calc

            $('#pauseMenu').addClass('hidden');
            create();
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
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxudmFyIERvbHBoaW5EaXZlID0ge1xuICAgIHZlcnNpb246ICcwLjAuMSdcbn07XG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zb2xlLmluZm8oJ1N0YXJ0aW5nIERvbHBoaW4gRGl2ZSB2JyArIERvbHBoaW5EaXZlLnZlcnNpb24pO1xuXG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICdnYW1lJywge1xuICAgIHByZWxvYWQ6IHByZWxvYWQsXG4gICAgY3JlYXRlOiBjcmVhdGUsXG4gICAgdXBkYXRlOiB1cGRhdGVcbn0pO1xuXG52YXIgcGxheWVyO1xudmFyIHNwaWxsO1xudmFyIGN1cnNvcnM7XG52YXIgdGltZTtcbnZhciBzcGVlZCA9IDMwMDtcbnZhciBmaXJzdFJ1biA9IHRydWU7XG52YXIgZ2FtZVBhdXNlQnV0dG9uO1xuXG4vKipcbiAqIFdoZXJlIHdlIHJlZ2lzdGVyIGFuZCBsb2FkIGFzc2V0c1xuICogaW5jbHVkaW5nIGltYWdlcyBhbmQgc3ByaXRlIHNoZWV0c1xuICovXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xuICAgIGdhbWUubG9hZC5pbWFnZSgnc2t5JywgJy9hc3NldHMvaW1hZ2VzL3NreS5wbmcnKTtcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NwaWxsJywgJy9hc3NldHMvaW1hZ2VzL2JhbGwucG5nJyk7XG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KTtcbn1cblxuLyoqXG4gKiBXaGVyZSB3ZSBpbml0aWFsaXplIG9iamVjdHNcbiAqIGZvciB0aGUgZ2FtZVxuICovXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgLy8gV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vIEEgc2ltcGxlIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCA5ODIwMCwgNjAwLCAnc2t5Jyk7XG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgOTgyMDAsIDYwMCk7XG5cbiAgICAvLyBUaGUgcGxheWVyIGFuZCBpdHMgc2V0dGluZ3NcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUocGFyc2VJbnQoKGdhbWUuY2FtZXJhLndpZHRoIC8gMiksIDEwKSwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAsICdkdWRlJyk7XG5cbiAgICAvLyBUaGUgc3BpbGwgKGJhbGwgZm9yIG5vdylcbiAgICBzcGlsbCA9IGdhbWUuYWRkLnNwcml0ZSgtNTc1LCAwLCAnc3BpbGwnKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllciBhbmQgdGhlIHNwaWxsXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShzcGlsbCk7XG5cbiAgICAvLyBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLiBHaXZlIHRoZSBsaXR0bGUgZ3V5IGEgc2xpZ2h0IGJvdW5jZS5cbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuXG4gICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpO1xuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcblxuICAgIC8vICBPdXIgY29udHJvbHMuXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KHBsYXllcik7XG5cbiAgICAvLyBUaW1lciAtIGZvciBiYWxsIGFjY2VsZXJhdGlvblxuICAgIHRpbWUgPSAxO1xuXG4gICAgaWYgKGZpcnN0UnVuKSB7XG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgZmlyc3RSdW4gPSBmYWxzZTtcbiAgICAgICAgbWFpbk1lbnUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAwO1xuXG4gICAgc3BpbGwuYm9keS52ZWxvY2l0eS54ID0gdGltZTtcbiAgICB0aW1lKys7XG5cbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bikge1xuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTEgKiBzcGVlZDtcblxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XG4gICAgfSBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bikge1xuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkO1xuXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XG4gICAgfSBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKSB7XG4gICAgICAgIC8vICBNb3ZlIGRvd253YXJkc1xuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gc3BlZWQ7XG4gICAgfSBlbHNlIGlmIChjdXJzb3JzLnVwLmlzRG93bikge1xuICAgICAgICAvLyAgTW92ZSB1cHdhcmRzXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMSAqIHNwZWVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKCk7XG5cbiAgICAgICAgcGxheWVyLmZyYW1lID0gNDtcbiAgICB9XG59XG5cbi8qXG4gKiBQQVVTRSBBQ1RJVkFUSU9OXG4gKiAqL1xuXG4vLyBPbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxuLy8gXG4kKCcjcGF1c2VCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAvLyBUaGlzIHdpbGwgYWN0aXZhdGUgcGhhc2VycyBwYXVzZSBmdW5jdGlvbiwgd2hlcmUgc29tZSBtYWdpYyBzaG91bGQgaGFwcGVuLlxuICAgIGdhbWUucGF1c2VkID0gIWdhbWUucGF1c2VkO1xuXG4gICAgY29uc29sZS5sb2coJ2NsaWNrIScpO1xuICAgIC8vIEFjdGl2YXRpbmcgdGhlIGV4dGVybmFsIGZ1bmN0aW9uLlxuICAgIHBhdXNlTWVudSgpO1xufSk7XG5cbmZ1bmN0aW9uIHBhdXNlTWVudSgpIHtcbiAgICBpZiAoZ2FtZS5wYXVzZWQpIHtcbiAgICAgICAgJCgnI3BhdXNlTWVudScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblxuICAgICAgICAvL1JldHVybmluZyB0byBtYWluIG1lbnUuXG4gICAgICAgICQoJyNtYWluTWVudUJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9EbyBzY29yZSBjYWxjdWxhdGlvbnMuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNwYXVzZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBmaXJzdFJ1biA9IHRydWU7XG4gICAgICAgICAgICBjcmVhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vUmVzZXQgdGhlIGdhbWUsIHdpdGggdGhlIHNhbWUgcHJpbmNpcGxlLlxuICAgICAgICAkKCcjcmVzZXRCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vU2NvcmUgY2FsY1xuXG4gICAgICAgICAgICAkKCcjcGF1c2VNZW51JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY3JlYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgJCgnI3BhdXNlTWVudScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaGFwcGVucycpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFpbk1lbnUoKSB7XG4gICAgLy8gU2hvdyB0aGUgbWFpbiBtZW51XG4gICAgJCgnI21haW5NZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICQoJyNwYXVzZUJ1dHRvbicpLmFkZENsYXNzKCdoaWRkZW4nKTtcblxuICAgIC8vIFNldHVwIG1haW4gbWVudSBidXR0b25cbiAgICAkKCcjYmVnaW5CdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcblxuICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICQoJyNwYXVzZUJ1dHRvbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==