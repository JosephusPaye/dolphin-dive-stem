// vim: set expandtab ts=4 sts=4 sw=4:
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

    /*
     * PAUSE ACTIVATION
     * */    
    //Add a button using just text. This can be a sprite Heath makes, as shown in the example.
    pauseButton = game.add.text(700, 20, 'PAUSE', { font : '24px cursive', fill : 'black' } );
    //pauseButton = game.add.sprite(700, 20, 'pauseButton');
    //Activating the input for this button, it can be clicked on.
    pauseButton.inputEnabled = true;
    //On the event where the player clicks the button change the game state to paused.
    pauseButton.events.onInputUp.add(function() {
        //Irrelevant test, lets me know when input is being processed.
        console.log("WOW");
        //This will activate phasers pause function, where some magic should happen.
        game.paused = true;
        //Makes the button invisible and gets rid of all interaction with it.
        pauseButton.exists = false;
        //Activating the external function.
        extMenu();
    });
    
}

//This function does not run within the confines of the phaser framework, and hence should probably be moved out. Fine here for now.
function extMenu() {
    var resumeButton = document.getElementById("resumeButton");
    var resetButton = document.getElementById("resetButton");
    var menuButton = document.getElementById("menuButton");
    resumeButton.onclick = function() {
        console.log("YEEEESYEEEESYEEES");
        game.paused = false;
        pauseButton.exists = true;
    }
    resetButton.onclick = function() {
        create();
        //score is initialised with a value outside of create(), so it needs to be reset here.
        score = 0;
    }
    menuButton.onclick = function() {
        //This should reinitialise the menu hopefully simply once completed.
        console.log("OPEN THE POD BAY DOORS HAL"); 
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5jb25zb2xlLmxvZygnSXRcXCdzIHdvcmtpbmcnKTtcclxuXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICAgIFxyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbiAgICBcclxufVxyXG5cclxudmFyIHBsYXllcjtcclxudmFyIHBsYXRmb3JtcztcclxudmFyIGN1cnNvcnM7XHJcblxyXG52YXIgc3RhcnM7XHJcbnZhciBzY29yZSA9IDA7XHJcbnZhciBzY29yZVRleHQ7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcblxyXG4gICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAvLyAgQSBzaW1wbGUgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgIGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnc2t5Jyk7XHJcblxyXG4gICAgLy8gIFRoZSBwbGF0Zm9ybXMgZ3JvdXAgY29udGFpbnMgdGhlIGdyb3VuZCBhbmQgdGhlIDIgbGVkZ2VzIHdlIGNhbiBqdW1wIG9uXHJcbiAgICBwbGF0Zm9ybXMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cclxuICAgIC8vICBXZSB3aWxsIGVuYWJsZSBwaHlzaWNzIGZvciBhbnkgb2JqZWN0IHRoYXQgaXMgY3JlYXRlZCBpbiB0aGlzIGdyb3VwXHJcbiAgICBwbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gSGVyZSB3ZSBjcmVhdGUgdGhlIGdyb3VuZC5cclxuICAgIHZhciBncm91bmQgPSBwbGF0Zm9ybXMuY3JlYXRlKDAsIGdhbWUud29ybGQuaGVpZ2h0IC0gNjQsICdncm91bmQnKTtcclxuXHJcbiAgICAvLyAgU2NhbGUgaXQgdG8gZml0IHRoZSB3aWR0aCBvZiB0aGUgZ2FtZSAodGhlIG9yaWdpbmFsIHNwcml0ZSBpcyA0MDB4MzIgaW4gc2l6ZSlcclxuICAgIGdyb3VuZC5zY2FsZS5zZXRUbygyLCAyKTtcclxuXHJcbiAgICAvLyAgVGhpcyBzdG9wcyBpdCBmcm9tIGZhbGxpbmcgYXdheSB3aGVuIHlvdSBqdW1wIG9uIGl0XHJcbiAgICBncm91bmQuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vICBOb3cgbGV0J3MgY3JlYXRlIHR3byBsZWRnZXNcclxuICAgIHZhciBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoNDAwLCA0MDAsICdncm91bmQnKTtcclxuICAgIGxlZGdlLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoLTE1MCwgMjUwLCAnZ3JvdW5kJyk7XHJcbiAgICBsZWRnZS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gVGhlIHBsYXllciBhbmQgaXRzIHNldHRpbmdzXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMzIsIGdhbWUud29ybGQuaGVpZ2h0IC0gMTUwLCAnZHVkZScpO1xyXG5cclxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHBsYXllcik7XHJcblxyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuIEdpdmUgdGhlIGxpdHRsZSBndXkgYSBzbGlnaHQgYm91bmNlLlxyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gIEZpbmFsbHkgc29tZSBzdGFycyB0byBjb2xsZWN0XHJcbiAgICBzdGFycyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG4gICAgLy8gIFdlIHdpbGwgZW5hYmxlIHBoeXNpY3MgZm9yIGFueSBzdGFyIHRoYXQgaXMgY3JlYXRlZCBpbiB0aGlzIGdyb3VwXHJcbiAgICBzdGFycy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgSGVyZSB3ZSdsbCBjcmVhdGUgMTIgb2YgdGhlbSBldmVubHkgc3BhY2VkIGFwYXJ0XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgLy8gIENyZWF0ZSBhIHN0YXIgaW5zaWRlIG9mIHRoZSAnc3RhcnMnIGdyb3VwXHJcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFycy5jcmVhdGUoaSAqIDcwLCAwLCAnc3RhcicpO1xyXG5cclxuICAgICAgICAvLyAgTGV0IGdyYXZpdHkgZG8gaXRzIHRoaW5nXHJcbiAgICAgICAgc3Rhci5ib2R5LmdyYXZpdHkueSA9IDMwMDtcclxuXHJcbiAgICAgICAgLy8gIFRoaXMganVzdCBnaXZlcyBlYWNoIHN0YXIgYSBzbGlnaHRseSByYW5kb20gYm91bmNlIHZhbHVlXHJcbiAgICAgICAgc3Rhci5ib2R5LmJvdW5jZS55ID0gMC43ICsgTWF0aC5yYW5kb20oKSAqIDAuMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyAgVGhlIHNjb3JlXHJcbiAgICBzY29yZVRleHQgPSBnYW1lLmFkZC50ZXh0KDE2LCAxNiwgJ3Njb3JlOiAwJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnIzAwMCcgfSk7XHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogUEFVU0UgQUNUSVZBVElPTlxyXG4gICAgICogKi8gICAgXHJcbiAgICAvL0FkZCBhIGJ1dHRvbiB1c2luZyBqdXN0IHRleHQuIFRoaXMgY2FuIGJlIGEgc3ByaXRlIEhlYXRoIG1ha2VzLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZS5cclxuICAgIHBhdXNlQnV0dG9uID0gZ2FtZS5hZGQudGV4dCg3MDAsIDIwLCAnUEFVU0UnLCB7IGZvbnQgOiAnMjRweCBjdXJzaXZlJywgZmlsbCA6ICdibGFjaycgfSApO1xyXG4gICAgLy9wYXVzZUJ1dHRvbiA9IGdhbWUuYWRkLnNwcml0ZSg3MDAsIDIwLCAncGF1c2VCdXR0b24nKTtcclxuICAgIC8vQWN0aXZhdGluZyB0aGUgaW5wdXQgZm9yIHRoaXMgYnV0dG9uLCBpdCBjYW4gYmUgY2xpY2tlZCBvbi5cclxuICAgIHBhdXNlQnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgICAvL09uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWQuXHJcbiAgICBwYXVzZUJ1dHRvbi5ldmVudHMub25JbnB1dFVwLmFkZChmdW5jdGlvbigpIHtcclxuICAgICAgICAvL0lycmVsZXZhbnQgdGVzdCwgbGV0cyBtZSBrbm93IHdoZW4gaW5wdXQgaXMgYmVpbmcgcHJvY2Vzc2VkLlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiV09XXCIpO1xyXG4gICAgICAgIC8vVGhpcyB3aWxsIGFjdGl2YXRlIHBoYXNlcnMgcGF1c2UgZnVuY3Rpb24sIHdoZXJlIHNvbWUgbWFnaWMgc2hvdWxkIGhhcHBlbi5cclxuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgLy9NYWtlcyB0aGUgYnV0dG9uIGludmlzaWJsZSBhbmQgZ2V0cyByaWQgb2YgYWxsIGludGVyYWN0aW9uIHdpdGggaXQuXHJcbiAgICAgICAgcGF1c2VCdXR0b24uZXhpc3RzID0gZmFsc2U7XHJcbiAgICAgICAgLy9BY3RpdmF0aW5nIHRoZSBleHRlcm5hbCBmdW5jdGlvbi5cclxuICAgICAgICBleHRNZW51KCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG59XHJcblxyXG4vL1RoaXMgZnVuY3Rpb24gZG9lcyBub3QgcnVuIHdpdGhpbiB0aGUgY29uZmluZXMgb2YgdGhlIHBoYXNlciBmcmFtZXdvcmssIGFuZCBoZW5jZSBzaG91bGQgcHJvYmFibHkgYmUgbW92ZWQgb3V0LiBGaW5lIGhlcmUgZm9yIG5vdy5cclxuZnVuY3Rpb24gZXh0TWVudSgpIHtcclxuICAgIHZhciByZXN1bWVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VtZUJ1dHRvblwiKTtcclxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXRCdXR0b25cIik7XHJcbiAgICB2YXIgbWVudUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudUJ1dHRvblwiKTtcclxuICAgIHJlc3VtZUJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJZRUVFRVNZRUVFRVNZRUVFU1wiKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIHBhdXNlQnV0dG9uLmV4aXN0cyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXNldEJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3JlYXRlKCk7XHJcbiAgICAgICAgLy9zY29yZSBpcyBpbml0aWFsaXNlZCB3aXRoIGEgdmFsdWUgb3V0c2lkZSBvZiBjcmVhdGUoKSwgc28gaXQgbmVlZHMgdG8gYmUgcmVzZXQgaGVyZS5cclxuICAgICAgICBzY29yZSA9IDA7XHJcbiAgICB9XHJcbiAgICBtZW51QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL1RoaXMgc2hvdWxkIHJlaW5pdGlhbGlzZSB0aGUgbWVudSBob3BlZnVsbHkgc2ltcGx5IG9uY2UgY29tcGxldGVkLlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiT1BFTiBUSEUgUE9EIEJBWSBET09SUyBIQUxcIik7IFxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG4gICAgLy8gIENvbGxpZGUgdGhlIHBsYXllciBhbmQgdGhlIHN0YXJzIHdpdGggdGhlIHBsYXRmb3Jtc1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwgcGxhdGZvcm1zKTtcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShzdGFycywgcGxhdGZvcm1zKTtcclxuXHJcbiAgICAvLyAgQ2hlY2tzIHRvIHNlZSBpZiB0aGUgcGxheWVyIG92ZXJsYXBzIHdpdGggYW55IG9mIHRoZSBzdGFycywgaWYgaGUgZG9lcyBjYWxsIHRoZSBjb2xsZWN0U3RhciBmdW5jdGlvblxyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHBsYXllciwgc3RhcnMsIGNvbGxlY3RTdGFyLCBudWxsLCB0aGlzKTtcclxuXHJcbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcblxyXG4gICAgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgLy8gIE1vdmUgdG8gdGhlIGxlZnRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTE1MDtcclxuXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgLy8gIE1vdmUgdG8gdGhlIHJpZ2h0XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDE1MDtcclxuXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICBcdC8vXHRNb3ZlIGRvd253YXJkc1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMTUwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy51cC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICBcdC8vXHRNb3ZlIHVwd2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0xNTA7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgLy8gIFN0YW5kIHN0aWxsXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpO1xyXG5cclxuICAgICAgICBwbGF5ZXIuZnJhbWUgPSA0O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0U3RhciAocGxheWVyLCBzdGFyKSB7XHJcbiAgICBcclxuICAgIC8vIFJlbW92ZXMgdGhlIHN0YXIgZnJvbSB0aGUgc2NyZWVuXHJcbiAgICBzdGFyLmtpbGwoKTtcclxuXHJcbiAgICAvLyAgQWRkIGFuZCB1cGRhdGUgdGhlIHNjb3JlXHJcbiAgICBzY29yZSArPSAxMDtcclxuICAgIHNjb3JlVGV4dC50ZXh0ID0gJ1Njb3JlOiAnICsgc2NvcmU7XHJcblxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==