var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

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
// Setting all the variables
var player;
var cursors;
var spill;
var spillFront;
var deathAlert;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Adding of background for our game
    game.add.tileSprite(0, 0, 19200, 1080, 'background');
    game.add.tileSprite(0, 0, 19200, 1080, 'seafloor');

    //Set boundaries of the game world
    game.world.setBounds(0, 0, 19200, 1080);

    // Grouping of the objects
    oilSpill = game.add.group();
    oilSpill.enableBody = true;

    // Adding of the objects
    player = game.add.sprite(20, game.world.centerY, 'dude');
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');

    //  Enable physics on each of the objects
    game.physics.arcade.enable(player);

    //  Player physics properties.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

    //Collisions
    game.physics.arcade.overlap(player, spill, gameOver, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    spill.body.velocity.x = 200;
    spillFront.body.velocity.x = 200;

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

function gameOver(player, spill) {
    deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Game Over', { fontSize: '32px', fill: '#FFF' });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuXHJcblx0Z2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL0JhY2tncm91bmRTdGF0aWMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NreScsICcvYXNzZXRzL2ltYWdlcy9za3kucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvT2lsU3BpbGwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsZnJvbnQnLCAnL2Fzc2V0cy9pbWFnZXMvR3JhZGllbnRPaWwucG5nJylcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9kdWRlLnBuZycsIDMyLCA0OCk7XHJcbn1cclxuLy8gU2V0dGluZyBhbGwgdGhlIHZhcmlhYmxlc1xyXG52YXIgcGxheWVyO1xyXG52YXIgY3Vyc29ycztcclxudmFyIHNwaWxsO1xyXG52YXIgc3BpbGxGcm9udDtcclxudmFyIGRlYXRoQWxlcnQ7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUoKSB7XHJcblxyXG4gICAgLy8gIFdlJ3JlIGdvaW5nIHRvIGJlIHVzaW5nIHBoeXNpY3MsIHNvIGVuYWJsZSB0aGUgQXJjYWRlIFBoeXNpY3Mgc3lzdGVtXHJcbiAgICBnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcbiAgICAvLyBBZGRpbmcgb2YgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwLCAxMDgwLCAnc2VhZmxvb3InKTtcclxuXHJcbiAgICAvL1NldCBib3VuZGFyaWVzIG9mIHRoZSBnYW1lIHdvcmxkXHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gR3JvdXBpbmcgb2YgdGhlIG9iamVjdHNcclxuICAgIG9pbFNwaWxsID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIG9pbFNwaWxsLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZGluZyBvZiB0aGUgb2JqZWN0c1xyXG4gICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDIwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBzcGlsbCA9IG9pbFNwaWxsLmNyZWF0ZSgtMzEwMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBzcGlsbEZyb250ID0gb2lsU3BpbGwuY3JlYXRlKC04MDAsIDAsICdvaWxzcGlsbGZyb250Jyk7XHJcblxyXG4gICAgLy8gIEVuYWJsZSBwaHlzaWNzIG9uIGVhY2ggb2YgdGhlIG9iamVjdHNcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHBsYXllcik7XHJcblxyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuXHJcbiAgICBwbGF5ZXIuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xyXG5cclxuICAgIC8vICBPdXIgdHdvIGFuaW1hdGlvbnMsIHdhbGtpbmcgbGVmdCBhbmQgcmlnaHQuXHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ2xlZnQnLCBbMCwgMSwgMiwgM10sIDEwLCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNSwgNiwgNywgOF0sIDEwLCB0cnVlKTtcclxuXHJcbiAgICAvLyAgT3VyIGNvbnRyb2xzLlxyXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhwbGF5ZXIpO1xyXG4gICAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHJcbiAgICAvL0NvbGxpc2lvbnNcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHNwaWxsLCBnYW1lT3ZlciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcbiAgICBzcGlsbEZyb250LmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuXHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgbGVmdFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMzAwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMzAwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIC8vICBTdGFuZCBzdGlsbFxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnN0b3AoKTtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSBkb3dud2FyZHNcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgdXB3YXJkc1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2FtZU92ZXIocGxheWVyLCBzcGlsbCkge1xyXG4gICAgZGVhdGhBbGVydCA9IGdhbWUuYWRkLnRleHQoKGdhbWUuY2FtZXJhLnggKyAxNiksIChnYW1lLmNhbWVyYS55ICsgMTYpLCAnR2FtZSBPdmVyJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnI0ZGRicgfSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=