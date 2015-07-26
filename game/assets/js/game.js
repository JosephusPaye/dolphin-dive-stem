// vim: set expandtab ts=4 sts=4 sw=4:
console.log('It\'s working');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, paused: paused, update: update });

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
    pauseButton.events.onInputUp.add(function() {
        console.log("WOW")
        game.paused = true;
    });
    
}

function paused() {
    pauseMenu = game.add.text(400, 300, 'PAUSED', {font : '40px cursive', fill : 'black'});
    pauseMenu.inputEnabled = true;
    //The issue here is that when the game is set to paused, everything stops. Including input. Ugh.
    pauseMenu.events.onInputUp.add(function() {
        console.log("OOH")
        pauseMenu.destroy();
        game.paused = false
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB2aW06IHNldCBleHBhbmR0YWIgdHM9NCBzdHM9NCBzdz00OlxyXG5jb25zb2xlLmxvZygnSXRcXCdzIHdvcmtpbmcnKTtcclxuXHJcbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHBhdXNlZDogcGF1c2VkLCB1cGRhdGU6IHVwZGF0ZSB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAgICBcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2t5JywgJy9hc3NldHMvaW1hZ2VzL3NreS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2Fzc2V0cy9pbWFnZXMvZHVkZS5wbmcnLCAzMiwgNDgpO1xyXG4gICAgXHJcbn1cclxuXHJcbnZhciBwbGF5ZXI7XHJcbnZhciBwbGF0Zm9ybXM7XHJcbnZhciBjdXJzb3JzO1xyXG5cclxudmFyIHN0YXJzO1xyXG52YXIgc2NvcmUgPSAwO1xyXG52YXIgc2NvcmVUZXh0O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cclxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gIEEgc2ltcGxlIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXHJcbiAgICBnYW1lLmFkZC5zcHJpdGUoMCwgMCwgJ3NreScpO1xyXG5cclxuICAgIC8vICBUaGUgcGxhdGZvcm1zIGdyb3VwIGNvbnRhaW5zIHRoZSBncm91bmQgYW5kIHRoZSAyIGxlZGdlcyB3ZSBjYW4ganVtcCBvblxyXG4gICAgcGxhdGZvcm1zID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHJcbiAgICAvLyAgV2Ugd2lsbCBlbmFibGUgcGh5c2ljcyBmb3IgYW55IG9iamVjdCB0aGF0IGlzIGNyZWF0ZWQgaW4gdGhpcyBncm91cFxyXG4gICAgcGxhdGZvcm1zLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEhlcmUgd2UgY3JlYXRlIHRoZSBncm91bmQuXHJcbiAgICB2YXIgZ3JvdW5kID0gcGxhdGZvcm1zLmNyZWF0ZSgwLCBnYW1lLndvcmxkLmhlaWdodCAtIDY0LCAnZ3JvdW5kJyk7XHJcblxyXG4gICAgLy8gIFNjYWxlIGl0IHRvIGZpdCB0aGUgd2lkdGggb2YgdGhlIGdhbWUgKHRoZSBvcmlnaW5hbCBzcHJpdGUgaXMgNDAweDMyIGluIHNpemUpXHJcbiAgICBncm91bmQuc2NhbGUuc2V0VG8oMiwgMik7XHJcblxyXG4gICAgLy8gIFRoaXMgc3RvcHMgaXQgZnJvbSBmYWxsaW5nIGF3YXkgd2hlbiB5b3UganVtcCBvbiBpdFxyXG4gICAgZ3JvdW5kLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgTm93IGxldCdzIGNyZWF0ZSB0d28gbGVkZ2VzXHJcbiAgICB2YXIgbGVkZ2UgPSBwbGF0Zm9ybXMuY3JlYXRlKDQwMCwgNDAwLCAnZ3JvdW5kJyk7XHJcbiAgICBsZWRnZS5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgbGVkZ2UgPSBwbGF0Zm9ybXMuY3JlYXRlKC0xNTAsIDI1MCwgJ2dyb3VuZCcpO1xyXG4gICAgbGVkZ2UuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIC8vIFRoZSBwbGF5ZXIgYW5kIGl0cyBzZXR0aW5nc1xyXG4gICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDMyLCBnYW1lLndvcmxkLmhlaWdodCAtIDE1MCwgJ2R1ZGUnKTtcclxuXHJcbiAgICAvLyAgV2UgbmVlZCB0byBlbmFibGUgcGh5c2ljcyBvbiB0aGUgcGxheWVyXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShwbGF5ZXIpO1xyXG5cclxuICAgIC8vICBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLiBHaXZlIHRoZSBsaXR0bGUgZ3V5IGEgc2xpZ2h0IGJvdW5jZS5cclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcblxyXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyLCAzXSwgMTAsIHRydWUpO1xyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpO1xyXG5cclxuICAgIC8vICBGaW5hbGx5IHNvbWUgc3RhcnMgdG8gY29sbGVjdFxyXG4gICAgc3RhcnMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cclxuICAgIC8vICBXZSB3aWxsIGVuYWJsZSBwaHlzaWNzIGZvciBhbnkgc3RhciB0aGF0IGlzIGNyZWF0ZWQgaW4gdGhpcyBncm91cFxyXG4gICAgc3RhcnMuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gIEhlcmUgd2UnbGwgY3JlYXRlIDEyIG9mIHRoZW0gZXZlbmx5IHNwYWNlZCBhcGFydFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBDcmVhdGUgYSBzdGFyIGluc2lkZSBvZiB0aGUgJ3N0YXJzJyBncm91cFxyXG4gICAgICAgIHZhciBzdGFyID0gc3RhcnMuY3JlYXRlKGkgKiA3MCwgMCwgJ3N0YXInKTtcclxuXHJcbiAgICAgICAgLy8gIExldCBncmF2aXR5IGRvIGl0cyB0aGluZ1xyXG4gICAgICAgIHN0YXIuYm9keS5ncmF2aXR5LnkgPSAzMDA7XHJcblxyXG4gICAgICAgIC8vICBUaGlzIGp1c3QgZ2l2ZXMgZWFjaCBzdGFyIGEgc2xpZ2h0bHkgcmFuZG9tIGJvdW5jZSB2YWx1ZVxyXG4gICAgICAgIHN0YXIuYm9keS5ib3VuY2UueSA9IDAuNyArIE1hdGgucmFuZG9tKCkgKiAwLjI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIFRoZSBzY29yZVxyXG4gICAgc2NvcmVUZXh0ID0gZ2FtZS5hZGQudGV4dCgxNiwgMTYsICdzY29yZTogMCcsIHsgZm9udFNpemU6ICczMnB4JywgZmlsbDogJyMwMDAnIH0pO1xyXG5cclxuICAgIC8vICBPdXIgY29udHJvbHMuXHJcbiAgICBjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgLy9BbGwgd29ya2luZyBvbiBjcmVhdGluZyBhIGZ1bnRpb25pbmcgcGF1c2UgYWN0aXZhdGlvbi5cclxuICAgIC8vQWRkIGEgYnV0dG9uIHVzaW5nIGp1c3QgdGV4dC4gVGhpcyBjYW4gYmUgYSBzcHJpdGUgSGVhdGggbWFrZXMsIGFzIHNob3duIGluIHRoZSBleGFtcGxlLlxyXG4gICAgcGF1c2VCdXR0b24gPSBnYW1lLmFkZC50ZXh0KDcwMCwgMjAsICdQQVVTRScsIHsgZm9udCA6ICcyNHB4IGN1cnNpdmUnLCBmaWxsIDogJ2JsYWNrJyB9ICk7XHJcbiAgICAvL3BhdXNlQnV0dG9uID0gZ2FtZS5hZGQuc3ByaXRlKDcwMCwgMjAsICdwYXVzZUJ1dHRvbicpO1xyXG4gICAgLy9BY3RpdmF0aW5nIHRoZSBpbnB1dCBmb3IgdGhpcyBidXR0b24sIGl0IGNhbiBiZSBjbGlja2VkIG9uLlxyXG4gICAgcGF1c2VCdXR0b24uaW5wdXRFbmFibGVkID0gdHJ1ZTtcclxuICAgIC8vT24gdGhlIGV2ZW50IHdoZXJlIHRoZSBwbGF5ZXIgY2xpY2tzIHRoZSBidXR0b24gY2hhbmdlIHRoZSBnYW1lIHN0YXRlIHRvIHBhdXNlZC5cclxuICAgIHBhdXNlQnV0dG9uLmV2ZW50cy5vbklucHV0VXAuYWRkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiV09XXCIpXHJcbiAgICAgICAgZ2FtZS5wYXVzZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICBcclxufVxyXG5cclxuZnVuY3Rpb24gcGF1c2VkKCkge1xyXG4gICAgcGF1c2VNZW51ID0gZ2FtZS5hZGQudGV4dCg0MDAsIDMwMCwgJ1BBVVNFRCcsIHtmb250IDogJzQwcHggY3Vyc2l2ZScsIGZpbGwgOiAnYmxhY2snfSk7XHJcbiAgICBwYXVzZU1lbnUuaW5wdXRFbmFibGVkID0gdHJ1ZTtcclxuICAgIC8vVGhlIGlzc3VlIGhlcmUgaXMgdGhhdCB3aGVuIHRoZSBnYW1lIGlzIHNldCB0byBwYXVzZWQsIGV2ZXJ5dGhpbmcgc3RvcHMuIEluY2x1ZGluZyBpbnB1dC4gVWdoLlxyXG4gICAgcGF1c2VNZW51LmV2ZW50cy5vbklucHV0VXAuYWRkKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiT09IXCIpXHJcbiAgICAgICAgcGF1c2VNZW51LmRlc3Ryb3koKTtcclxuICAgICAgICBnYW1lLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuICAgIC8vICBDb2xsaWRlIHRoZSBwbGF5ZXIgYW5kIHRoZSBzdGFycyB3aXRoIHRoZSBwbGF0Zm9ybXNcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShwbGF5ZXIsIHBsYXRmb3Jtcyk7XHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoc3RhcnMsIHBsYXRmb3Jtcyk7XHJcblxyXG4gICAgLy8gIENoZWNrcyB0byBzZWUgaWYgdGhlIHBsYXllciBvdmVybGFwcyB3aXRoIGFueSBvZiB0aGUgc3RhcnMsIGlmIGhlIGRvZXMgY2FsbCB0aGUgY29sbGVjdFN0YXIgZnVuY3Rpb25cclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHN0YXJzLCBjb2xsZWN0U3RhciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG5cclxuICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0xNTA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAxNTA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDE1MDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSB1cHdhcmRzXHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMTUwO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuXHJcbiAgICAgICAgcGxheWVyLmZyYW1lID0gNDtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29sbGVjdFN0YXIgKHBsYXllciwgc3Rhcikge1xyXG4gICAgXHJcbiAgICAvLyBSZW1vdmVzIHRoZSBzdGFyIGZyb20gdGhlIHNjcmVlblxyXG4gICAgc3Rhci5raWxsKCk7XHJcblxyXG4gICAgLy8gIEFkZCBhbmQgdXBkYXRlIHRoZSBzY29yZVxyXG4gICAgc2NvcmUgKz0gMTA7XHJcbiAgICBzY29yZVRleHQudGV4dCA9ICdTY29yZTogJyArIHNjb3JlO1xyXG5cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=