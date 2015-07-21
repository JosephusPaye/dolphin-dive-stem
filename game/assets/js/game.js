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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ0l0XFwncyB3b3JraW5nJyk7XHJcblxyXG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICcnLCB7IHByZWxvYWQ6IHByZWxvYWQsIGNyZWF0ZTogY3JlYXRlLCB1cGRhdGU6IHVwZGF0ZSB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcblxyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcblxyXG59XHJcblxyXG52YXIgcGxheWVyO1xyXG52YXIgcGxhdGZvcm1zO1xyXG52YXIgY3Vyc29ycztcclxuXHJcbnZhciBzdGFycztcclxudmFyIHNjb3JlID0gMDtcclxudmFyIHNjb3JlVGV4dDtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vICBBIHNpbXBsZSBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxyXG4gICAgZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdza3knKTtcclxuXHJcbiAgICAvLyAgVGhlIHBsYXRmb3JtcyBncm91cCBjb250YWlucyB0aGUgZ3JvdW5kIGFuZCB0aGUgMiBsZWRnZXMgd2UgY2FuIGp1bXAgb25cclxuICAgIHBsYXRmb3JtcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG4gICAgLy8gIFdlIHdpbGwgZW5hYmxlIHBoeXNpY3MgZm9yIGFueSBvYmplY3QgdGhhdCBpcyBjcmVhdGVkIGluIHRoaXMgZ3JvdXBcclxuICAgIHBsYXRmb3Jtcy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBIZXJlIHdlIGNyZWF0ZSB0aGUgZ3JvdW5kLlxyXG4gICAgdmFyIGdyb3VuZCA9IHBsYXRmb3Jtcy5jcmVhdGUoMCwgZ2FtZS53b3JsZC5oZWlnaHQgLSA2NCwgJ2dyb3VuZCcpO1xyXG5cclxuICAgIC8vICBTY2FsZSBpdCB0byBmaXQgdGhlIHdpZHRoIG9mIHRoZSBnYW1lICh0aGUgb3JpZ2luYWwgc3ByaXRlIGlzIDQwMHgzMiBpbiBzaXplKVxyXG4gICAgZ3JvdW5kLnNjYWxlLnNldFRvKDIsIDIpO1xyXG5cclxuICAgIC8vICBUaGlzIHN0b3BzIGl0IGZyb20gZmFsbGluZyBhd2F5IHdoZW4geW91IGp1bXAgb24gaXRcclxuICAgIGdyb3VuZC5ib2R5LmltbW92YWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gIE5vdyBsZXQncyBjcmVhdGUgdHdvIGxlZGdlc1xyXG4gICAgdmFyIGxlZGdlID0gcGxhdGZvcm1zLmNyZWF0ZSg0MDAsIDQwMCwgJ2dyb3VuZCcpO1xyXG4gICAgbGVkZ2UuYm9keS5pbW1vdmFibGUgPSB0cnVlO1xyXG5cclxuICAgIGxlZGdlID0gcGxhdGZvcm1zLmNyZWF0ZSgtMTUwLCAyNTAsICdncm91bmQnKTtcclxuICAgIGxlZGdlLmJvZHkuaW1tb3ZhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBUaGUgcGxheWVyIGFuZCBpdHMgc2V0dGluZ3NcclxuICAgIHBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgzMiwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAsICdkdWRlJyk7XHJcblxyXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcclxuXHJcbiAgICAvLyAgUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy4gR2l2ZSB0aGUgbGl0dGxlIGd1eSBhIHNsaWdodCBib3VuY2UuXHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAvLyAgRmluYWxseSBzb21lIHN0YXJzIHRvIGNvbGxlY3RcclxuICAgIHN0YXJzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHJcbiAgICAvLyAgV2Ugd2lsbCBlbmFibGUgcGh5c2ljcyBmb3IgYW55IHN0YXIgdGhhdCBpcyBjcmVhdGVkIGluIHRoaXMgZ3JvdXBcclxuICAgIHN0YXJzLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG5cclxuICAgIC8vICBIZXJlIHdlJ2xsIGNyZWF0ZSAxMiBvZiB0aGVtIGV2ZW5seSBzcGFjZWQgYXBhcnRcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI7IGkrKylcclxuICAgIHtcclxuICAgICAgICAvLyAgQ3JlYXRlIGEgc3RhciBpbnNpZGUgb2YgdGhlICdzdGFycycgZ3JvdXBcclxuICAgICAgICB2YXIgc3RhciA9IHN0YXJzLmNyZWF0ZShpICogNzAsIDAsICdzdGFyJyk7XHJcblxyXG4gICAgICAgIC8vICBMZXQgZ3Jhdml0eSBkbyBpdHMgdGhpbmdcclxuICAgICAgICBzdGFyLmJvZHkuZ3Jhdml0eS55ID0gMzAwO1xyXG5cclxuICAgICAgICAvLyAgVGhpcyBqdXN0IGdpdmVzIGVhY2ggc3RhciBhIHNsaWdodGx5IHJhbmRvbSBib3VuY2UgdmFsdWVcclxuICAgICAgICBzdGFyLmJvZHkuYm91bmNlLnkgPSAwLjcgKyBNYXRoLnJhbmRvbSgpICogMC4yO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICBUaGUgc2NvcmVcclxuICAgIHNjb3JlVGV4dCA9IGdhbWUuYWRkLnRleHQoMTYsIDE2LCAnc2NvcmU6IDAnLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjMDAwJyB9KTtcclxuXHJcbiAgICAvLyAgT3VyIGNvbnRyb2xzLlxyXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG4gICAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHJcbiAgICAvLyAgQ29sbGlkZSB0aGUgcGxheWVyIGFuZCB0aGUgc3RhcnMgd2l0aCB0aGUgcGxhdGZvcm1zXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUocGxheWVyLCBwbGF0Zm9ybXMpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHN0YXJzLCBwbGF0Zm9ybXMpO1xyXG5cclxuICAgIC8vICBDaGVja3MgdG8gc2VlIGlmIHRoZSBwbGF5ZXIgb3ZlcmxhcHMgd2l0aCBhbnkgb2YgdGhlIHN0YXJzLCBpZiBoZSBkb2VzIGNhbGwgdGhlIGNvbGxlY3RTdGFyIGZ1bmN0aW9uXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAocGxheWVyLCBzdGFycywgY29sbGVjdFN0YXIsIG51bGwsIHRoaXMpO1xyXG5cclxuICAgIC8vICBSZXNldCB0aGUgcGxheWVycyB2ZWxvY2l0eSAobW92ZW1lbnQpXHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMTUwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMTUwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgZG93bndhcmRzXHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAxNTA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgdXB3YXJkc1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTE1MDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICAvLyAgU3RhbmQgc3RpbGxcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5zdG9wKCk7XHJcblxyXG4gICAgICAgIHBsYXllci5mcmFtZSA9IDQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbGxlY3RTdGFyIChwbGF5ZXIsIHN0YXIpIHtcclxuICAgIFxyXG4gICAgLy8gUmVtb3ZlcyB0aGUgc3RhciBmcm9tIHRoZSBzY3JlZW5cclxuICAgIHN0YXIua2lsbCgpO1xyXG5cclxuICAgIC8vICBBZGQgYW5kIHVwZGF0ZSB0aGUgc2NvcmVcclxuICAgIHNjb3JlICs9IDEwO1xyXG4gICAgc2NvcmVUZXh0LnRleHQgPSAnU2NvcmU6ICcgKyBzY29yZTtcclxuXHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=