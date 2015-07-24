// vim: set expandtab tabstop=4:
console.log('It\'s working');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', '/assets/images/sky.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
    
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    //All working on creating a funtioning pause activation.
    //Add a button using just text. This can be a sprite Heath makes, as shown in the example.
    pauseButton = game.add.text(700, 20, 'PAUSE', { font : '24px cursive', fill : 'black' } );
    //pauseButton = game.add.sprite(700, 20, 'pauseButton');
    //Activating the input for this button, it can be clicked on.
    pauseButton.inputEnabled = true;
    //On the event where the player clicks the button change the game state to paused.
    pauseButton.events.onInputUp.add( function() {
        game.paused = true;
    } );
    
    //Some pause state tests.
    //When the game state is paused in this instance activate the function. Useful for a focus paused menu.
    game.onPause.add(GamePause, this);
    game.onResume.add(GameResume, this);

    function GamePause() {
        console.log("game paused!");
        //Paused game stuff goes here.
        //Changing the pause button to reflect the status change.
        pauseButton = game.add.text(700, 20, 'PAUSED', { font : '24px cursive', fill : 'black' } );
        //When the button is pressed, this should unpause.
        pauseButton.events.onInputUp.add( function() {
            game.paused = false; //For some reason this isn't being recognised, may need some more context.
        } );
    };
}



function GameResume() {
    console.log("game resumed");
    //Possibly have return to game functions, or animations.
    pauseButton = game.add.text(700, 20, 'PAUSE', { font : '24px cursive', fill : 'black' } );
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else if (cursors.down.isDown)
    {
    	//	Move downwards
    	player.body.velocity.y = 150;
    }
    else if (cursors.up.isDown)
    {
    	//	Move upwards
    	player.body.velocity.y = -150;
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRhYnN0b3A9NDpcclxuY29uc29sZS5sb2coJ0l0XFwncyB3b3JraW5nJyk7XHJcblxyXG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICcnLCB7IHByZWxvYWQ6IHByZWxvYWQsIGNyZWF0ZTogY3JlYXRlLCB1cGRhdGU6IHVwZGF0ZSB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcblxyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbiAgICBcclxufVxyXG5cclxudmFyIHBsYXllcjtcclxudmFyIHBsYXRmb3JtcztcclxudmFyIGN1cnNvcnM7XHJcblxyXG52YXIgc3RhcnM7XHJcbnZhciBzY29yZSA9IDA7XHJcbnZhciBzY29yZVRleHQ7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcblxyXG4gICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAvLyAgQSBzaW1wbGUgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgIGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnc2t5Jyk7XHJcblxyXG4gICAgLy8gIFRoZSBwbGF0Zm9ybXMgZ3JvdXAgY29udGFpbnMgdGhlIGdyb3VuZCBhbmQgdGhlIDIgbGVkZ2VzIHdlIGNhbiBqdW1wIG9uXHJcbiAgICBwbGF0Zm9ybXMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cclxuICAgIC8vICBXZSB3aWxsIGVuYWJsZSBwaHlzaWNzIGZvciBhbnkgb2JqZWN0IHRoYXQgaXMgY3JlYXRlZCBpbiB0aGlzIGdyb3VwXHJcbiAgICBwbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gSGVyZSB3ZSBjcmVhdGUgdGhlIGdyb3VuZC5cclxuICAgIHZhciBncm91bmQgPSBwbGF0Zm9ybXMuY3JlYXRlKDAsIGdhbWUud29ybGQuaGVpZ2h0IC0gNjQsICdncm91bmQnKTtcclxuXHJcbiAgICAvLyAgU2NhbGUgaXQgdG8gZml0IHRoZSB3aWR0aCBvZiB0aGUgZ2FtZSAodGhlIG9yaWdpbmFsIHNwcml0ZSBpcyA0MDB4MzIgaW4gc2l6ZSlcclxuICAgIGdyb3VuZC5zY2FsZS5zZXRUbygyLCAyKTtcclxuXHJcbiAgICAvLyAgVGhpcyBzdG9wcyBpdCBmcm9tIGZhbGxpbmcgYXdheSB3aGVuIHlvdSBqdW1wIG9uIGl0XHJcbiAgICBncm91bmQuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vICBOb3cgbGV0J3MgY3JlYXRlIHR3byBsZWRnZXNcclxuICAgIHZhciBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoNDAwLCA0MDAsICdncm91bmQnKTtcclxuICAgIGxlZGdlLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoLTE1MCwgMjUwLCAnZ3JvdW5kJyk7XHJcbiAgICBsZWRnZS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gVGhlIHBsYXllciBhbmQgaXRzIHNldHRpbmdzXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMzIsIGdhbWUud29ybGQuaGVpZ2h0IC0gMTUwLCAnZHVkZScpO1xyXG5cclxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHBsYXllcik7XHJcblxyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuIEdpdmUgdGhlIGxpdHRsZSBndXkgYSBzbGlnaHQgYm91bmNlLlxyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gIEZpbmFsbHkgc29tZSBzdGFycyB0byBjb2xsZWN0XHJcbiAgICBzdGFycyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG4gICAgLy8gIFdlIHdpbGwgZW5hYmxlIHBoeXNpY3MgZm9yIGFueSBzdGFyIHRoYXQgaXMgY3JlYXRlZCBpbiB0aGlzIGdyb3VwXHJcbiAgICBzdGFycy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgSGVyZSB3ZSdsbCBjcmVhdGUgMTIgb2YgdGhlbSBldmVubHkgc3BhY2VkIGFwYXJ0XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgLy8gIENyZWF0ZSBhIHN0YXIgaW5zaWRlIG9mIHRoZSAnc3RhcnMnIGdyb3VwXHJcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFycy5jcmVhdGUoaSAqIDcwLCAwLCAnc3RhcicpO1xyXG5cclxuICAgICAgICAvLyAgTGV0IGdyYXZpdHkgZG8gaXRzIHRoaW5nXHJcbiAgICAgICAgc3Rhci5ib2R5LmdyYXZpdHkueSA9IDMwMDtcclxuXHJcbiAgICAgICAgLy8gIFRoaXMganVzdCBnaXZlcyBlYWNoIHN0YXIgYSBzbGlnaHRseSByYW5kb20gYm91bmNlIHZhbHVlXHJcbiAgICAgICAgc3Rhci5ib2R5LmJvdW5jZS55ID0gMC43ICsgTWF0aC5yYW5kb20oKSAqIDAuMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyAgVGhlIHNjb3JlXHJcbiAgICBzY29yZVRleHQgPSBnYW1lLmFkZC50ZXh0KDE2LCAxNiwgJ3Njb3JlOiAwJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnIzAwMCcgfSk7XHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvL0FsbCB3b3JraW5nIG9uIGNyZWF0aW5nIGEgZnVudGlvbmluZyBwYXVzZSBhY3RpdmF0aW9uLlxyXG4gICAgLy9BZGQgYSBidXR0b24gdXNpbmcganVzdCB0ZXh0LiBUaGlzIGNhbiBiZSBhIHNwcml0ZSBIZWF0aCBtYWtlcywgYXMgc2hvd24gaW4gdGhlIGV4YW1wbGUuXHJcbiAgICBwYXVzZUJ1dHRvbiA9IGdhbWUuYWRkLnRleHQoNzAwLCAyMCwgJ1BBVVNFJywgeyBmb250IDogJzI0cHggY3Vyc2l2ZScsIGZpbGwgOiAnYmxhY2snIH0gKTtcclxuICAgIC8vcGF1c2VCdXR0b24gPSBnYW1lLmFkZC5zcHJpdGUoNzAwLCAyMCwgJ3BhdXNlQnV0dG9uJyk7XHJcbiAgICAvL0FjdGl2YXRpbmcgdGhlIGlucHV0IGZvciB0aGlzIGJ1dHRvbiwgaXQgY2FuIGJlIGNsaWNrZWQgb24uXHJcbiAgICBwYXVzZUJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgLy9PbiB0aGUgZXZlbnQgd2hlcmUgdGhlIHBsYXllciBjbGlja3MgdGhlIGJ1dHRvbiBjaGFuZ2UgdGhlIGdhbWUgc3RhdGUgdG8gcGF1c2VkLlxyXG4gICAgcGF1c2VCdXR0b24uZXZlbnRzLm9uSW5wdXRVcC5hZGQoIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcclxuICAgIH0gKTtcclxuICAgIFxyXG4gICAgLy9Tb21lIHBhdXNlIHN0YXRlIHRlc3RzLlxyXG4gICAgLy9XaGVuIHRoZSBnYW1lIHN0YXRlIGlzIHBhdXNlZCBpbiB0aGlzIGluc3RhbmNlIGFjdGl2YXRlIHRoZSBmdW5jdGlvbi4gVXNlZnVsIGZvciBhIGZvY3VzIHBhdXNlZCBtZW51LlxyXG4gICAgZ2FtZS5vblBhdXNlLmFkZChHYW1lUGF1c2UsIHRoaXMpO1xyXG4gICAgZ2FtZS5vblJlc3VtZS5hZGQoR2FtZVJlc3VtZSwgdGhpcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gR2FtZVBhdXNlKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2FtZSBwYXVzZWQhXCIpO1xyXG4gICAgICAgIC8vUGF1c2VkIGdhbWUgc3R1ZmYgZ29lcyBoZXJlLlxyXG4gICAgICAgIC8vQ2hhbmdpbmcgdGhlIHBhdXNlIGJ1dHRvbiB0byByZWZsZWN0IHRoZSBzdGF0dXMgY2hhbmdlLlxyXG4gICAgICAgIHBhdXNlQnV0dG9uID0gZ2FtZS5hZGQudGV4dCg3MDAsIDIwLCAnUEFVU0VEJywgeyBmb250IDogJzI0cHggY3Vyc2l2ZScsIGZpbGwgOiAnYmxhY2snIH0gKTtcclxuICAgICAgICAvL1doZW4gdGhlIGJ1dHRvbiBpcyBwcmVzc2VkLCB0aGlzIHNob3VsZCB1bnBhdXNlLlxyXG4gICAgICAgIHBhdXNlQnV0dG9uLmV2ZW50cy5vbklucHV0VXAuYWRkKCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ2FtZS5wYXVzZWQgPSBmYWxzZTsgLy9Gb3Igc29tZSByZWFzb24gdGhpcyBpc24ndCBiZWluZyByZWNvZ25pc2VkLCBtYXkgbmVlZCBzb21lIG1vcmUgY29udGV4dC5cclxuICAgICAgICB9ICk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIEdhbWVSZXN1bWUoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgcmVzdW1lZFwiKTtcclxuICAgIC8vUG9zc2libHkgaGF2ZSByZXR1cm4gdG8gZ2FtZSBmdW5jdGlvbnMsIG9yIGFuaW1hdGlvbnMuXHJcbiAgICBwYXVzZUJ1dHRvbiA9IGdhbWUuYWRkLnRleHQoNzAwLCAyMCwgJ1BBVVNFJywgeyBmb250IDogJzI0cHggY3Vyc2l2ZScsIGZpbGwgOiAnYmxhY2snIH0gKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShwbGF5ZXIsIHBsYXRmb3Jtcyk7XHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoc3RhcnMsIHBsYXRmb3Jtcyk7XHJcblxyXG4gICAgLy8gIENoZWNrcyB0byBzZWUgaWYgdGhlIHBsYXllciBvdmVybGFwcyB3aXRoIGFueSBvZiB0aGUgc3RhcnMsIGlmIGhlIGRvZXMgY2FsbCB0aGUgY29sbGVjdFN0YXIgZnVuY3Rpb25cclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHN0YXJzLCBjb2xsZWN0U3RhciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG5cclxuICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xNTA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAxNTA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDE1MDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSB1cHdhcmRzXHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMTUwO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuXHJcbiAgICAgICAgcGxheWVyLmZyYW1lID0gNDtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGVjdFN0YXIgKHBsYXllciwgc3Rhcikge1xyXG4gICAgXHJcbiAgICAvLyBSZW1vdmVzIHRoZSBzdGFyIGZyb20gdGhlIHNjcmVlblxyXG4gICAgc3Rhci5raWxsKCk7XHJcblxyXG4gICAgLy8gIEFkZCBhbmQgdXBkYXRlIHRoZSBzY29yZVxyXG4gICAgc2NvcmUgKz0gMTA7XHJcbiAgICBzY29yZVRleHQudGV4dCA9ICdTY29yZTogJyArIHNjb3JlO1xyXG5cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=