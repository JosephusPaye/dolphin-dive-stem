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

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
}

function update() {

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

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
    else
    {
        //  Stand still
        player.animations.stop();
    }
    if (cursors.down.isDown)
    {
    	//	Move downwards
    	player.body.velocity.y = 150;
    }
    if (cursors.up.isDown)
    {
    	//	Move upwards
    	player.body.velocity.y = -150;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ0l0XFwncyB3b3JraW5nJyk7XHJcblxyXG52YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICcnLCB7IHByZWxvYWQ6IHByZWxvYWQsIGNyZWF0ZTogY3JlYXRlLCB1cGRhdGU6IHVwZGF0ZSB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcblxyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdza3knLCAnL2Fzc2V0cy9pbWFnZXMvc2t5LnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcblxyXG59XHJcblxyXG52YXIgcGxheWVyO1xyXG52YXIgcGxhdGZvcm1zO1xyXG52YXIgY3Vyc29ycztcclxuXHJcbnZhciBzdGFycztcclxudmFyIHNjb3JlID0gMDtcclxudmFyIHNjb3JlVGV4dDtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vICBBIHNpbXBsZSBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxyXG4gICAgZ2FtZS5hZGQuc3ByaXRlKDAsIDAsICdza3knKTtcclxuXHJcbiAgICAvLyBUaGUgcGxheWVyIGFuZCBpdHMgc2V0dGluZ3NcclxuICAgIHBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgzMiwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxNTAsICdkdWRlJyk7XHJcblxyXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcclxuXHJcbiAgICAvLyAgUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy4gR2l2ZSB0aGUgbGl0dGxlIGd1eSBhIHNsaWdodCBib3VuY2UuXHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAvLyAgT3VyIGNvbnRyb2xzLlxyXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG4gICAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHJcbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMTUwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMTUwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDE1MDtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgdXB3YXJkc1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTE1MDtcclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==