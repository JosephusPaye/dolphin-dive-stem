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
        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        // game.physics.arcade.overlap(player, stars, collectStar, null, this);

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

    // This function does not run within the confines of the phaser framework, and hence should probably be moved out. Fine here for now.
    function extMenu() {
        var resumeButton = document.getElementById('resumeButton');
        var resetButton = document.getElementById('resetButton');
        var menuButton = document.getElementById('menuButton');

        resumeButton.onclick = function() {
            console.log('YEEEESYEEEESYEEES');
            game.paused = false;
            gamePauseButton.exists = true;
        };

        resetButton.onclick = function() {
            create();
        };

        menuButton.onclick = function() {
            // This should reinitialise the menu hopefully simply once completed.
            console.log('OPEN THE POD BAY DOORS HAL'); 
        };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5cclxudmFyIERvbHBoaW5EaXZlID0ge1xyXG4gICAgdmVyc2lvbjogJzAuMC4xJ1xyXG59O1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNvbnNvbGUuaW5mbygnU3RhcnRpbmcgRG9scGhpbiBEaXZlIHYnICsgRG9scGhpbkRpdmUudmVyc2lvbik7XHJcblxyXG4gICAgdmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIHtcclxuICAgICAgICBwcmVsb2FkOiBwcmVsb2FkLFxyXG4gICAgICAgIGNyZWF0ZTogY3JlYXRlLFxyXG4gICAgICAgIHVwZGF0ZTogdXBkYXRlXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgcGxheWVyO1xyXG4gICAgdmFyIHNwaWxsO1xyXG4gICAgdmFyIGN1cnNvcnM7XHJcbiAgICB2YXIgdGltZTtcclxuICAgIHZhciBzcGVlZCA9IDMwMDtcclxuICAgIHZhciBmaXJzdFJ1biA9IHRydWU7XHJcbiAgICB2YXIgZ2FtZVBhdXNlQnV0dG9uO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlcmUgd2UgcmVnaXN0ZXIgYW5kIGxvYWQgYXNzZXRzXHJcbiAgICAgKiBpbmNsdWRpbmcgaW1hZ2VzIGFuZCBzcHJpdGUgc2hlZXRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xyXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZSgnc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvYmFsbC5wbmcnKTtcclxuICAgICAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2Fzc2V0cy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlcmUgd2UgaW5pdGlhbGl6ZSBvYmplY3RzXHJcbiAgICAgKiBmb3IgdGhlIGdhbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgICAgIC8vIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICAgICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgICAgIC8vIEEgc2ltcGxlIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXHJcbiAgICAgICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCA5ODIwMCwgNjAwLCAnc2t5Jyk7XHJcbiAgICAgICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgOTgyMDAsIDYwMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVGhlIHBsYXllciBhbmQgaXRzIHNldHRpbmdzXHJcbiAgICAgICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKHBhcnNlSW50KChnYW1lLmNhbWVyYS53aWR0aCAvIDIpLCAxMCksIGdhbWUud29ybGQuaGVpZ2h0IC0gMTUwLCAnZHVkZScpO1xyXG5cclxuICAgICAgICAvLyBUaGUgc3BpbGwgKGJhbGwgZm9yIG5vdylcclxuICAgICAgICBzcGlsbCA9IGdhbWUuYWRkLnNwcml0ZSgtNTc1LCAwLCAnc3BpbGwnKTtcclxuXHJcbiAgICAgICAgLy8gV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyIGFuZCB0aGUgc3BpbGxcclxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShwbGF5ZXIpO1xyXG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHNwaWxsKTtcclxuXHJcbiAgICAgICAgLy8gUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy4gR2l2ZSB0aGUgbGl0dGxlIGd1eSBhIHNsaWdodCBib3VuY2UuXHJcbiAgICAgICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpO1xyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gIE91ciBjb250cm9scy5cclxuICAgICAgICBjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhwbGF5ZXIpO1xyXG5cclxuICAgICAgICAvLyBUaW1lciAtIGZvciBiYWxsIGFjY2VsZXJhdGlvblxyXG4gICAgICAgIHRpbWUgPSAxO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3RSdW4pIHtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBmaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgICAgICBtYWluTWVudSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBQQVVTRSBBQ1RJVkFUSU9OXHJcbiAgICAgICAgICogKi9cclxuICAgICAgICAvLyBBZGQgYSBidXR0b24gdXNpbmcganVzdCB0ZXh0LiBUaGlzIGNhbiBiZSBhIHNwcml0ZSBIZWF0aCBtYWtlcywgYXMgc2hvd24gaW4gdGhlIGV4YW1wbGUuXHJcbiAgICAgICAgZ2FtZVBhdXNlQnV0dG9uID0gZ2FtZS5hZGQudGV4dCg3MDAsIDIwLCAnUEFVU0UnLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6ICcyNHB4IGN1cnNpdmUnLFxyXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWVQYXVzZUJ1dHRvbiA9IGdhbWUuYWRkLnNwcml0ZSg3MDAsIDIwLCAnZ2FtZVBhdXNlQnV0dG9uJyk7XHJcbiAgICAgICAgLy8gQWN0aXZhdGluZyB0aGUgaW5wdXQgZm9yIHRoaXMgYnV0dG9uLCBpdCBjYW4gYmUgY2xpY2tlZCBvbi5cclxuICAgICAgICBnYW1lUGF1c2VCdXR0b24uaW5wdXRFbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZC5cclxuICAgICAgICAvLyBcclxuICAgICAgICBnYW1lUGF1c2VCdXR0b24uZXZlbnRzLm9uSW5wdXRVcC5hZGQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBhY3RpdmF0ZSBwaGFzZXJzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2VzIHRoZSBidXR0b24gaW52aXNpYmxlIGFuZCBnZXRzIHJpZCBvZiBhbGwgaW50ZXJhY3Rpb24gd2l0aCBpdC5cclxuICAgICAgICAgICAgZ2FtZVBhdXNlQnV0dG9uLmV4aXN0cyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gQWN0aXZhdGluZyB0aGUgZXh0ZXJuYWwgZnVuY3Rpb24uXHJcbiAgICAgICAgICAgIHBhdXNlTWVudSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gIENoZWNrcyB0byBzZWUgaWYgdGhlIHBsYXllciBvdmVybGFwcyB3aXRoIGFueSBvZiB0aGUgc3RhcnMsIGlmIGhlIGRvZXMgY2FsbCB0aGUgY29sbGVjdFN0YXIgZnVuY3Rpb25cclxuICAgICAgICAvLyBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAocGxheWVyLCBzdGFycywgY29sbGVjdFN0YXIsIG51bGwsIHRoaXMpO1xyXG5cclxuICAgICAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG5cclxuICAgICAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSB0aW1lO1xyXG4gICAgICAgIHRpbWUrKztcclxuXHJcbiAgICAgICAgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcclxuICAgICAgICAgICAgLy8gIE1vdmUgdG8gdGhlIGxlZnRcclxuICAgICAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xICogc3BlZWQ7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bikge1xyXG4gICAgICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pIHtcclxuICAgICAgICAgICAgLy8gIE1vdmUgZG93bndhcmRzXHJcbiAgICAgICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSBzcGVlZDtcclxuICAgICAgICB9IGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKSB7XHJcbiAgICAgICAgICAgIC8vICBNb3ZlIHVwd2FyZHNcclxuICAgICAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0xICogc3BlZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gIFN0YW5kIHN0aWxsXHJcbiAgICAgICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5mcmFtZSA9IDQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgZnVuY3Rpb24gZG9lcyBub3QgcnVuIHdpdGhpbiB0aGUgY29uZmluZXMgb2YgdGhlIHBoYXNlciBmcmFtZXdvcmssIGFuZCBoZW5jZSBzaG91bGQgcHJvYmFibHkgYmUgbW92ZWQgb3V0LiBGaW5lIGhlcmUgZm9yIG5vdy5cclxuICAgIGZ1bmN0aW9uIGV4dE1lbnUoKSB7XHJcbiAgICAgICAgdmFyIHJlc3VtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN1bWVCdXR0b24nKTtcclxuICAgICAgICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcclxuICAgICAgICB2YXIgbWVudUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51QnV0dG9uJyk7XHJcblxyXG4gICAgICAgIHJlc3VtZUJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZRUVFRVNZRUVFRVNZRUVFUycpO1xyXG4gICAgICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBnYW1lUGF1c2VCdXR0b24uZXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXNldEJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG1lbnVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCByZWluaXRpYWxpc2UgdGhlIG1lbnUgaG9wZWZ1bGx5IHNpbXBseSBvbmNlIGNvbXBsZXRlZC5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ09QRU4gVEhFIFBPRCBCQVkgRE9PUlMgSEFMJyk7IFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFpbk1lbnUoKSB7XHJcbiAgICAgICAgLy8gU2hvdyB0aGUgbWFpbiBtZW51XHJcbiAgICAgICAgJCgnI2JlZ2luQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBtYWluIG1lbnUgYnV0dG9uXHJcbiAgICAgICAgJCgnI2JlZ2luQnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGdhbWUucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAkKCcjbWFpbk1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGF1c2VNZW51KCkge1xyXG4gICAgICAgIC8vIFNob3cgdGhlIHBhdXNlIG1lbnVcclxuICAgICAgICAkKCcjcGF1c2VNZW51JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgcmVzdW1lIGJ1dHRvblxyXG4gICAgICAgICQoJyNyZXN1bWVCdXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICQoJyNwYXVzZU1lbnUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=