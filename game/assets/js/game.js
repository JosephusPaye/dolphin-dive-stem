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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHZpbTogc2V0IGV4cGFuZHRhYiB0YWJzdG9wPTQ6XG5jb25zb2xlLmxvZygnSXRcXCdzIHdvcmtpbmcnKTtcblxudmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnJywgeyBwcmVsb2FkOiBwcmVsb2FkLCBjcmVhdGU6IGNyZWF0ZSwgdXBkYXRlOiB1cGRhdGUgfSk7XG5cbmZ1bmN0aW9uIHByZWxvYWQoKSB7XG5cbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NreScsICcvYXNzZXRzL2ltYWdlcy9za3kucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL2R1ZGUucG5nJywgMzIsIDQ4KTtcbiAgICBcbn1cblxudmFyIHBsYXllcjtcbnZhciBwbGF0Zm9ybXM7XG52YXIgY3Vyc29ycztcblxudmFyIHN0YXJzO1xudmFyIHNjb3JlID0gMDtcbnZhciBzY29yZVRleHQ7XG5cbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcblxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG4gICAgLy8gIEEgc2ltcGxlIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXG4gICAgZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdza3knKTtcblxuICAgIC8vICBUaGUgcGxhdGZvcm1zIGdyb3VwIGNvbnRhaW5zIHRoZSBncm91bmQgYW5kIHRoZSAyIGxlZGdlcyB3ZSBjYW4ganVtcCBvblxuICAgIHBsYXRmb3JtcyA9IGdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAvLyAgV2Ugd2lsbCBlbmFibGUgcGh5c2ljcyBmb3IgYW55IG9iamVjdCB0aGF0IGlzIGNyZWF0ZWQgaW4gdGhpcyBncm91cFxuICAgIHBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZTtcblxuICAgIC8vIEhlcmUgd2UgY3JlYXRlIHRoZSBncm91bmQuXG4gICAgdmFyIGdyb3VuZCA9IHBsYXRmb3Jtcy5jcmVhdGUoMCwgZ2FtZS53b3JsZC5oZWlnaHQgLSA2NCwgJ2dyb3VuZCcpO1xuXG4gICAgLy8gIFNjYWxlIGl0IHRvIGZpdCB0aGUgd2lkdGggb2YgdGhlIGdhbWUgKHRoZSBvcmlnaW5hbCBzcHJpdGUgaXMgNDAweDMyIGluIHNpemUpXG4gICAgZ3JvdW5kLnNjYWxlLnNldFRvKDIsIDIpO1xuXG4gICAgLy8gIFRoaXMgc3RvcHMgaXQgZnJvbSBmYWxsaW5nIGF3YXkgd2hlbiB5b3UganVtcCBvbiBpdFxuICAgIGdyb3VuZC5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyAgTm93IGxldCdzIGNyZWF0ZSB0d28gbGVkZ2VzXG4gICAgdmFyIGxlZGdlID0gcGxhdGZvcm1zLmNyZWF0ZSg0MDAsIDQwMCwgJ2dyb3VuZCcpO1xuICAgIGxlZGdlLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcblxuICAgIGxlZGdlID0gcGxhdGZvcm1zLmNyZWF0ZSgtMTUwLCAyNTAsICdncm91bmQnKTtcbiAgICBsZWRnZS5ib2R5LmltbW92YWJsZSA9IHRydWU7XG5cbiAgICAvLyBUaGUgcGxheWVyIGFuZCBpdHMgc2V0dGluZ3NcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMzIsIGdhbWUud29ybGQuaGVpZ2h0IC0gMTUwLCAnZHVkZScpO1xuXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHBsYXllcik7XG5cbiAgICAvLyAgUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy4gR2l2ZSB0aGUgbGl0dGxlIGd1eSBhIHNsaWdodCBib3VuY2UuXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcblxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdyaWdodCcsIFs1LCA2LCA3LCA4XSwgMTAsIHRydWUpO1xuXG4gICAgLy8gIEZpbmFsbHkgc29tZSBzdGFycyB0byBjb2xsZWN0XG4gICAgc3RhcnMgPSBnYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gIFdlIHdpbGwgZW5hYmxlIHBoeXNpY3MgZm9yIGFueSBzdGFyIHRoYXQgaXMgY3JlYXRlZCBpbiB0aGlzIGdyb3VwXG4gICAgc3RhcnMuZW5hYmxlQm9keSA9IHRydWU7XG5cbiAgICAvLyAgSGVyZSB3ZSdsbCBjcmVhdGUgMTIgb2YgdGhlbSBldmVubHkgc3BhY2VkIGFwYXJ0XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKVxuICAgIHtcbiAgICAgICAgLy8gIENyZWF0ZSBhIHN0YXIgaW5zaWRlIG9mIHRoZSAnc3RhcnMnIGdyb3VwXG4gICAgICAgIHZhciBzdGFyID0gc3RhcnMuY3JlYXRlKGkgKiA3MCwgMCwgJ3N0YXInKTtcblxuICAgICAgICAvLyAgTGV0IGdyYXZpdHkgZG8gaXRzIHRoaW5nXG4gICAgICAgIHN0YXIuYm9keS5ncmF2aXR5LnkgPSAzMDA7XG5cbiAgICAgICAgLy8gIFRoaXMganVzdCBnaXZlcyBlYWNoIHN0YXIgYSBzbGlnaHRseSByYW5kb20gYm91bmNlIHZhbHVlXG4gICAgICAgIHN0YXIuYm9keS5ib3VuY2UueSA9IDAuNyArIE1hdGgucmFuZG9tKCkgKiAwLjI7XG4gICAgfVxuXG4gICAgLy8gIFRoZSBzY29yZVxuICAgIHNjb3JlVGV4dCA9IGdhbWUuYWRkLnRleHQoMTYsIDE2LCAnc2NvcmU6IDAnLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjMDAwJyB9KTtcblxuICAgIC8vICBPdXIgY29udHJvbHMuXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgIFxufVxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG5cbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwgcGxhdGZvcm1zKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUoc3RhcnMsIHBsYXRmb3Jtcyk7XG5cbiAgICAvLyAgQ2hlY2tzIHRvIHNlZSBpZiB0aGUgcGxheWVyIG92ZXJsYXBzIHdpdGggYW55IG9mIHRoZSBzdGFycywgaWYgaGUgZG9lcyBjYWxsIHRoZSBjb2xsZWN0U3RhciBmdW5jdGlvblxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHN0YXJzLCBjb2xsZWN0U3RhciwgbnVsbCwgdGhpcyk7XG5cbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xuXG4gICAgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pXG4gICAge1xuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTE1MDtcblxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxuICAgIHtcbiAgICAgICAgLy8gIE1vdmUgdG8gdGhlIHJpZ2h0XG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAxNTA7XG5cbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcbiAgICB7XG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAxNTA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxuICAgIHtcbiAgICBcdC8vXHRNb3ZlIHVwd2FyZHNcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMTUwO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICAvLyAgU3RhbmQgc3RpbGxcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMuc3RvcCgpO1xuXG4gICAgICAgIHBsYXllci5mcmFtZSA9IDQ7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjb2xsZWN0U3RhciAocGxheWVyLCBzdGFyKSB7XG4gICAgXG4gICAgLy8gUmVtb3ZlcyB0aGUgc3RhciBmcm9tIHRoZSBzY3JlZW5cbiAgICBzdGFyLmtpbGwoKTtcblxuICAgIC8vICBBZGQgYW5kIHVwZGF0ZSB0aGUgc2NvcmVcbiAgICBzY29yZSArPSAxMDtcbiAgICBzY29yZVRleHQudGV4dCA9ICdTY29yZTogJyArIHNjb3JlO1xuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=