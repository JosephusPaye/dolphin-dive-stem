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

var firstRun = true;

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

    if (firstRun) {
        game.paused = true;
        firstRun = false;
        mainMenu();
    }

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

function mainMenu() {
    var beginButton = document.getElementById("beginButton");
    beginButton.onclick = function() {
        game.paused = false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOiBzZXQgZXhwYW5kdGFiIHRzPTQgc3RzPTQgc3c9NDpcbmNvbnNvbGUubG9nKCdJdFxcJ3Mgd29ya2luZycpO1xudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnJywgeyBwcmVsb2FkOiBwcmVsb2FkLCBjcmVhdGU6IGNyZWF0ZSwgdXBkYXRlOiB1cGRhdGUgfSk7XG5cbmZ1bmN0aW9uIHByZWxvYWQoKSB7XG4gICAgXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XG4gICAgXG59XG5cbnZhciBwbGF5ZXI7XG52YXIgcGxhdGZvcm1zO1xudmFyIGN1cnNvcnM7XG5cbnZhciBzdGFycztcbnZhciBzY29yZSA9IDA7XG52YXIgc2NvcmVUZXh0O1xuXG52YXIgZmlyc3RSdW4gPSB0cnVlO1xuXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG5cbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblxuICAgIC8vICBBIHNpbXBsZSBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxuICAgIGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAnc2t5Jyk7XG5cbiAgICAvLyAgVGhlIHBsYXRmb3JtcyBncm91cCBjb250YWlucyB0aGUgZ3JvdW5kIGFuZCB0aGUgMiBsZWRnZXMgd2UgY2FuIGp1bXAgb25cbiAgICBwbGF0Zm9ybXMgPSBnYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gIFdlIHdpbGwgZW5hYmxlIHBoeXNpY3MgZm9yIGFueSBvYmplY3QgdGhhdCBpcyBjcmVhdGVkIGluIHRoaXMgZ3JvdXBcbiAgICBwbGF0Zm9ybXMuZW5hYmxlQm9keSA9IHRydWU7XG5cbiAgICAvLyBIZXJlIHdlIGNyZWF0ZSB0aGUgZ3JvdW5kLlxuICAgIHZhciBncm91bmQgPSBwbGF0Zm9ybXMuY3JlYXRlKDAsIGdhbWUud29ybGQuaGVpZ2h0IC0gNjQsICdncm91bmQnKTtcblxuICAgIC8vICBTY2FsZSBpdCB0byBmaXQgdGhlIHdpZHRoIG9mIHRoZSBnYW1lICh0aGUgb3JpZ2luYWwgc3ByaXRlIGlzIDQwMHgzMiBpbiBzaXplKVxuICAgIGdyb3VuZC5zY2FsZS5zZXRUbygyLCAyKTtcblxuICAgIC8vICBUaGlzIHN0b3BzIGl0IGZyb20gZmFsbGluZyBhd2F5IHdoZW4geW91IGp1bXAgb24gaXRcbiAgICBncm91bmQuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gIE5vdyBsZXQncyBjcmVhdGUgdHdvIGxlZGdlc1xuICAgIHZhciBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoNDAwLCA0MDAsICdncm91bmQnKTtcbiAgICBsZWRnZS5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICBsZWRnZSA9IHBsYXRmb3Jtcy5jcmVhdGUoLTE1MCwgMjUwLCAnZ3JvdW5kJyk7XG4gICAgbGVkZ2UuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xuXG4gICAgLy8gVGhlIHBsYXllciBhbmQgaXRzIHNldHRpbmdzXG4gICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDMyLCBnYW1lLndvcmxkLmhlaWdodCAtIDE1MCwgJ2R1ZGUnKTtcblxuICAgIC8vICBXZSBuZWVkIHRvIGVuYWJsZSBwaHlzaWNzIG9uIHRoZSBwbGF5ZXJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShwbGF5ZXIpO1xuXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuIEdpdmUgdGhlIGxpdHRsZSBndXkgYSBzbGlnaHQgYm91bmNlLlxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG5cbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpO1xuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcblxuICAgIC8vICBGaW5hbGx5IHNvbWUgc3RhcnMgdG8gY29sbGVjdFxuICAgIHN0YXJzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIC8vICBXZSB3aWxsIGVuYWJsZSBwaHlzaWNzIGZvciBhbnkgc3RhciB0aGF0IGlzIGNyZWF0ZWQgaW4gdGhpcyBncm91cFxuICAgIHN0YXJzLmVuYWJsZUJvZHkgPSB0cnVlO1xuXG4gICAgLy8gIEhlcmUgd2UnbGwgY3JlYXRlIDEyIG9mIHRoZW0gZXZlbmx5IHNwYWNlZCBhcGFydFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI7IGkrKylcbiAgICB7XG4gICAgICAgIC8vICBDcmVhdGUgYSBzdGFyIGluc2lkZSBvZiB0aGUgJ3N0YXJzJyBncm91cFxuICAgICAgICB2YXIgc3RhciA9IHN0YXJzLmNyZWF0ZShpICogNzAsIDAsICdzdGFyJyk7XG5cbiAgICAgICAgLy8gIExldCBncmF2aXR5IGRvIGl0cyB0aGluZ1xuICAgICAgICBzdGFyLmJvZHkuZ3Jhdml0eS55ID0gMzAwO1xuXG4gICAgICAgIC8vICBUaGlzIGp1c3QgZ2l2ZXMgZWFjaCBzdGFyIGEgc2xpZ2h0bHkgcmFuZG9tIGJvdW5jZSB2YWx1ZVxuICAgICAgICBzdGFyLmJvZHkuYm91bmNlLnkgPSAwLjcgKyBNYXRoLnJhbmRvbSgpICogMC4yO1xuICAgIH1cblxuICAgIC8vICBUaGUgc2NvcmVcbiAgICBzY29yZVRleHQgPSBnYW1lLmFkZC50ZXh0KDE2LCAxNiwgJ3Njb3JlOiAwJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnIzAwMCcgfSk7XG5cbiAgICAvLyAgT3VyIGNvbnRyb2xzLlxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcblxuICAgIGlmIChmaXJzdFJ1bikge1xuICAgICAgICBnYW1lLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIGZpcnN0UnVuID0gZmFsc2U7XG4gICAgICAgIG1haW5NZW51KCk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBQQVVTRSBBQ1RJVkFUSU9OXG4gICAgICogKi8gICAgXG4gICAgLy9BZGQgYSBidXR0b24gdXNpbmcganVzdCB0ZXh0LiBUaGlzIGNhbiBiZSBhIHNwcml0ZSBIZWF0aCBtYWtlcywgYXMgc2hvd24gaW4gdGhlIGV4YW1wbGUuXG4gICAgcGF1c2VCdXR0b24gPSBnYW1lLmFkZC50ZXh0KDcwMCwgMjAsICdQQVVTRScsIHsgZm9udCA6ICcyNHB4IGN1cnNpdmUnLCBmaWxsIDogJ2JsYWNrJyB9ICk7XG4gICAgLy9wYXVzZUJ1dHRvbiA9IGdhbWUuYWRkLnNwcml0ZSg3MDAsIDIwLCAncGF1c2VCdXR0b24nKTtcbiAgICAvL0FjdGl2YXRpbmcgdGhlIGlucHV0IGZvciB0aGlzIGJ1dHRvbiwgaXQgY2FuIGJlIGNsaWNrZWQgb24uXG4gICAgcGF1c2VCdXR0b24uaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICAvL09uIHRoZSBldmVudCB3aGVyZSB0aGUgcGxheWVyIGNsaWNrcyB0aGUgYnV0dG9uIGNoYW5nZSB0aGUgZ2FtZSBzdGF0ZSB0byBwYXVzZWQuXG4gICAgcGF1c2VCdXR0b24uZXZlbnRzLm9uSW5wdXRVcC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vSXJyZWxldmFudCB0ZXN0LCBsZXRzIG1lIGtub3cgd2hlbiBpbnB1dCBpcyBiZWluZyBwcm9jZXNzZWQuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiV09XXCIpO1xuICAgICAgICAvL1RoaXMgd2lsbCBhY3RpdmF0ZSBwaGFzZXJzIHBhdXNlIGZ1bmN0aW9uLCB3aGVyZSBzb21lIG1hZ2ljIHNob3VsZCBoYXBwZW4uXG4gICAgICAgIGdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgLy9NYWtlcyB0aGUgYnV0dG9uIGludmlzaWJsZSBhbmQgZ2V0cyByaWQgb2YgYWxsIGludGVyYWN0aW9uIHdpdGggaXQuXG4gICAgICAgIHBhdXNlQnV0dG9uLmV4aXN0cyA9IGZhbHNlO1xuICAgICAgICAvL0FjdGl2YXRpbmcgdGhlIGV4dGVybmFsIGZ1bmN0aW9uLlxuICAgICAgICBleHRNZW51KCk7XG4gICAgfSk7XG4gICAgXG59XG5cbi8vVGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBydW4gd2l0aGluIHRoZSBjb25maW5lcyBvZiB0aGUgcGhhc2VyIGZyYW1ld29yaywgYW5kIGhlbmNlIHNob3VsZCBwcm9iYWJseSBiZSBtb3ZlZCBvdXQuIEZpbmUgaGVyZSBmb3Igbm93LlxuZnVuY3Rpb24gZXh0TWVudSgpIHtcbiAgICB2YXIgcmVzdW1lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bWVCdXR0b25cIik7XG4gICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEJ1dHRvblwiKTtcbiAgICB2YXIgbWVudUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVudUJ1dHRvblwiKTtcbiAgICByZXN1bWVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIllFRUVFU1lFRUVFU1lFRUVTXCIpO1xuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICBwYXVzZUJ1dHRvbi5leGlzdHMgPSB0cnVlO1xuICAgIH1cbiAgICByZXNldEJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNyZWF0ZSgpO1xuICAgICAgICAvL3Njb3JlIGlzIGluaXRpYWxpc2VkIHdpdGggYSB2YWx1ZSBvdXRzaWRlIG9mIGNyZWF0ZSgpLCBzbyBpdCBuZWVkcyB0byBiZSByZXNldCBoZXJlLlxuICAgICAgICBzY29yZSA9IDA7XG4gICAgfVxuICAgIG1lbnVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL1RoaXMgc2hvdWxkIHJlaW5pdGlhbGlzZSB0aGUgbWVudSBob3BlZnVsbHkgc2ltcGx5IG9uY2UgY29tcGxldGVkLlxuICAgICAgICBjb25zb2xlLmxvZyhcIk9QRU4gVEhFIFBPRCBCQVkgRE9PUlMgSEFMXCIpOyBcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1haW5NZW51KCkge1xuICAgIHZhciBiZWdpbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmVnaW5CdXR0b25cIik7XG4gICAgYmVnaW5CdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlKCkge1xuXG4gICAgLy8gIENvbGxpZGUgdGhlIHBsYXllciBhbmQgdGhlIHN0YXJzIHdpdGggdGhlIHBsYXRmb3Jtc1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShwbGF5ZXIsIHBsYXRmb3Jtcyk7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHN0YXJzLCBwbGF0Zm9ybXMpO1xuXG4gICAgLy8gIENoZWNrcyB0byBzZWUgaWYgdGhlIHBsYXllciBvdmVybGFwcyB3aXRoIGFueSBvZiB0aGUgc3RhcnMsIGlmIGhlIGRvZXMgY2FsbCB0aGUgY29sbGVjdFN0YXIgZnVuY3Rpb25cbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAocGxheWVyLCBzdGFycywgY29sbGVjdFN0YXIsIG51bGwsIHRoaXMpO1xuXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMDtcblxuICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKVxuICAgIHtcbiAgICAgICAgLy8gIE1vdmUgdG8gdGhlIGxlZnRcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xNTA7XG5cbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcbiAgICB7XG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMTUwO1xuXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24pXG4gICAge1xuICAgIFx0Ly9cdE1vdmUgZG93bndhcmRzXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMTUwO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdXJzb3JzLnVwLmlzRG93bilcbiAgICB7XG4gICAgXHQvL1x0TW92ZSB1cHdhcmRzXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTE1MDtcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgICAgLy8gIFN0YW5kIHN0aWxsXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcblxuICAgICAgICBwbGF5ZXIuZnJhbWUgPSA0O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdFN0YXIgKHBsYXllciwgc3Rhcikge1xuICAgIFxuICAgIC8vIFJlbW92ZXMgdGhlIHN0YXIgZnJvbSB0aGUgc2NyZWVuXG4gICAgc3Rhci5raWxsKCk7XG5cbiAgICAvLyAgQWRkIGFuZCB1cGRhdGUgdGhlIHNjb3JlXG4gICAgc2NvcmUgKz0gMTA7XG4gICAgc2NvcmVUZXh0LnRleHQgPSAnU2NvcmU6ICcgKyBzY29yZTtcblxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9