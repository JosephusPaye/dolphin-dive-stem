var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

	game.load.image('background', '/assets/images/BackgroundStatic.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('oilspillfront', '/assets/images/GradientOil.png');
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);
}
// Setting all the variables
var player;
var cursors;
var spill;
var spillFront;
var deathAlert;
var obstacles;

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
    player.animations.add('left', [0, 1, 2], 6, true);
    player.animations.add('right', [4, 3, 5], 6, true);

    junkMaker = game.add.emitter(1, 1, 5000);
    junkMaker.area = new Phaser.Rectangle(game.camera.x, 1, 10, 1080);
    junkMaker.enableBody = true;
    junkMaker.frequency = 1000;
    junkMaker.maxRotation = 20;
    junkMaker.minRotation = 20;
    junkMaker.lifespan = 10000000;
    junkMaker.makeParticles('star');
    junkMaker.bounce.setTo(0.5, 0.5);
    junkMaker.gravity = 0;
    junkMaker.on = true;


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

	junkMaker.x = game.camera.x  + 850;

    //Collisions
    game.physics.arcade.collide(player, junkMaker);
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
    if (game.physics.arcade.collide(player, junkMaker) === true)
    {
    	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    }
}

function gameOver(player, spill) {
    deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Game Over', { fontSize: '32px', fill: '#FFF' });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoODAwLCA2MDAsIFBoYXNlci5BVVRPLCAnJywgeyBwcmVsb2FkOiBwcmVsb2FkLCBjcmVhdGU6IGNyZWF0ZSwgdXBkYXRlOiB1cGRhdGUgfSk7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG5cclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvQmFja2dyb3VuZFN0YXRpYy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcbi8vIFNldHRpbmcgYWxsIHRoZSB2YXJpYWJsZXNcclxudmFyIHBsYXllcjtcclxudmFyIGN1cnNvcnM7XHJcbnZhciBzcGlsbDtcclxudmFyIHNwaWxsRnJvbnQ7XHJcbnZhciBkZWF0aEFsZXJ0O1xyXG52YXIgb2JzdGFjbGVzO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cclxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG4gICAgLy8gQWRkaW5nIG9mIGJhY2tncm91bmQgZm9yIG91ciBnYW1lXHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwLCAxMDgwLCAnYmFja2dyb3VuZCcpO1xyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMCwgMTA4MCwgJ3NlYWZsb29yJyk7XHJcblxyXG4gICAgLy9TZXQgYm91bmRhcmllcyBvZiB0aGUgZ2FtZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAsIDEwODApO1xyXG5cclxuICAgIC8vIEdyb3VwaW5nIG9mIHRoZSBvYmplY3RzXHJcbiAgICBvaWxTcGlsbCA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICBvaWxTcGlsbC5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGRpbmcgb2YgdGhlIG9iamVjdHNcclxuICAgIHBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgyMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnZHVkZScpO1xyXG4gICAgc3BpbGwgPSBvaWxTcGlsbC5jcmVhdGUoLTMxMDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgc3BpbGxGcm9udCA9IG9pbFNwaWxsLmNyZWF0ZSgtODAwLCAwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG5cclxuICAgIC8vICBFbmFibGUgcGh5c2ljcyBvbiBlYWNoIG9mIHRoZSBvYmplY3RzXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZShwbGF5ZXIpO1xyXG5cclxuICAgIC8vICBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLlxyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDJdLCA2LCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNCwgMywgNV0sIDYsIHRydWUpO1xyXG5cclxuICAgIGp1bmtNYWtlciA9IGdhbWUuYWRkLmVtaXR0ZXIoMSwgMSwgNTAwMCk7XHJcbiAgICBqdW5rTWFrZXIuYXJlYSA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKGdhbWUuY2FtZXJhLngsIDEsIDEwLCAxMDgwKTtcclxuICAgIGp1bmtNYWtlci5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIGp1bmtNYWtlci5mcmVxdWVuY3kgPSAxMDAwO1xyXG4gICAganVua01ha2VyLm1heFJvdGF0aW9uID0gMjA7XHJcbiAgICBqdW5rTWFrZXIubWluUm90YXRpb24gPSAyMDtcclxuICAgIGp1bmtNYWtlci5saWZlc3BhbiA9IDEwMDAwMDAwO1xyXG4gICAganVua01ha2VyLm1ha2VQYXJ0aWNsZXMoJ3N0YXInKTtcclxuICAgIGp1bmtNYWtlci5ib3VuY2Uuc2V0VG8oMC41LCAwLjUpO1xyXG4gICAganVua01ha2VyLmdyYXZpdHkgPSAwO1xyXG4gICAganVua01ha2VyLm9uID0gdHJ1ZTtcclxuXHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG5cdGp1bmtNYWtlci54ID0gZ2FtZS5jYW1lcmEueCAgKyA4NTA7XHJcblxyXG4gICAgLy9Db2xsaXNpb25zXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUocGxheWVyLCBqdW5rTWFrZXIpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHBsYXllciwgc3BpbGwsIGdhbWVPdmVyLCBudWxsLCB0aGlzKTtcclxuXHJcbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuICAgIHNwaWxsRnJvbnQuYm9keS52ZWxvY2l0eS54ID0gMjAwO1xyXG5cclxuICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0zMDA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAzMDA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0Ly9cdE1vdmUgZG93bndhcmRzXHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcblxyXG4gICAgfVxyXG4gICAgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgXHQvL1x0TW92ZSB1cHdhcmRzXHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMzAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShwbGF5ZXIsIGp1bmtNYWtlcikgPT09IHRydWUpXHJcbiAgICB7XHJcbiAgICBcdGRlYXRoQWxlcnQgPSBnYW1lLmFkZC50ZXh0KChnYW1lLmNhbWVyYS54ICsgMTYpLCAoZ2FtZS5jYW1lcmEueSArIDE2KSwgJ0l0cyB0b3VjaGluZyBtZSEnLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjRkZGJyB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2FtZU92ZXIocGxheWVyLCBzcGlsbCkge1xyXG4gICAgZGVhdGhBbGVydCA9IGdhbWUuYWRkLnRleHQoKGdhbWUuY2FtZXJhLnggKyAxNiksIChnYW1lLmNhbWVyYS55ICsgMTYpLCAnR2FtZSBPdmVyJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnI0ZGRicgfSk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=