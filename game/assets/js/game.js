var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('background', '/assets/images/BackgroundStatic.png');
    game.load.image('sky', '/assets/images/sky.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('oilspillfront', '/assets/images/GradientOil.png')
    game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
}

var player;
var cursors;
var spill;
var spillfront;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.tileSprite(0, 0, 19200, 1080, 'background');
    game.add.tileSprite(0, 0, 19200, 1080, 'seafloor');
    game.world.setBounds(0, 0, 19200, 1080);


    // The player and its settings
    player = game.add.sprite(20, game.world.centerY, 'dude');
    spill = game.add.sprite(-3100, 0, 'oilspill');
    spillfront = game.add.sprite(-800, 0, 'oilspillfront');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(spill);
    game.physics.arcade.enable(spillfront);
    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    spill.body.velocity.x = 200;
    spillfront.body.velocity.x = 200;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -300;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 300;

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
    	player.body.velocity.y = 300;
    }
    if (cursors.up.isDown)
    {
    	//	Move upwards
    	player.body.velocity.y = -300;
    }
}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnJywgeyBwcmVsb2FkOiBwcmVsb2FkLCBjcmVhdGU6IGNyZWF0ZSwgdXBkYXRlOiB1cGRhdGUsIHJlbmRlcjogcmVuZGVyIH0pO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuXHJcblx0Z2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL0JhY2tncm91bmRTdGF0aWMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NreScsICcvYXNzZXRzL2ltYWdlcy9za3kucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvT2lsU3BpbGwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsZnJvbnQnLCAnL2Fzc2V0cy9pbWFnZXMvR3JhZGllbnRPaWwucG5nJylcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbn1cclxuXHJcbnZhciBwbGF5ZXI7XHJcbnZhciBjdXJzb3JzO1xyXG52YXIgc3BpbGw7XHJcbnZhciBzcGlsbGZyb250O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cclxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gIEEgc2ltcGxlIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMCwgMTA4MCwgJ3NlYWZsb29yJyk7XHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMCwgMTA4MCk7XHJcblxyXG5cclxuICAgIC8vIFRoZSBwbGF5ZXIgYW5kIGl0cyBzZXR0aW5nc1xyXG4gICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDIwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBzcGlsbCA9IGdhbWUuYWRkLnNwcml0ZSgtMzEwMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBzcGlsbGZyb250ID0gZ2FtZS5hZGQuc3ByaXRlKC04MDAsIDAsICdvaWxzcGlsbGZyb250Jyk7XHJcblxyXG4gICAgLy8gIFdlIG5lZWQgdG8gZW5hYmxlIHBoeXNpY3Mgb24gdGhlIHBsYXllclxyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHNwaWxsKTtcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHNwaWxsZnJvbnQpO1xyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuIEdpdmUgdGhlIGxpdHRsZSBndXkgYSBzbGlnaHQgYm91bmNlLlxyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDIsIDNdLCAxMCwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzUsIDYsIDcsIDhdLCAxMCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcbiAgICBzcGlsbGZyb250LmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuXHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMzAwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMzAwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgdXB3YXJkc1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG5cclxuICAgIGdhbWUuZGVidWcuY2FtZXJhSW5mbyhnYW1lLmNhbWVyYSwgMzIsIDMyKTtcclxuICAgIGdhbWUuZGVidWcuc3ByaXRlQ29vcmRzKHBsYXllciwgMzIsIDUwMCk7XHJcblxyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9