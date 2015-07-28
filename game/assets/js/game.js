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
var junkMaker;

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
    player.pivot = new PIXI.Point(120, 48);

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
    if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 300;

        player.animations.play('right');
    }
    else if (cursors.left.isDown)
    {
        player.body.velocity.x = -300;

        player.animations.play('left');
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 300;
        player.rotation = 0.5707963268;
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = -300;
        player.rotation = -0.5707963268;
    }
    if (cursors.right.isDown && cursors.down.isDown)
    {
        player.body.velocity.x = 300;
        player.body.velocity.y = 300;
        player.animations.play('right');
        player.rotation = 0.785398163;

    }
    else if (cursors.right.isDown && cursors.up.isDown)
    {
        player.body.velocity.x = 300;
        player.body.velocity.y = -300;
        player.animations.play('right');
        player.rotation = -0.785398163;
    }
    else if (cursors.left.isDown && cursors.down.isDown)
    {
        player.body.velocity.x = -300;
        player.body.velocity.y = 300;
        player.animations.play('left');
        player.rotation = -0.785398163;
    }
    else if (cursors.left.isDown && cursors.up.isDown)
    {
        player.body.velocity.x = -300;
        player.body.velocity.y = -300;
        player.animations.play('left');
        player.rotation = 0.785398163;
    }
    else
    {
        player.rotation = 0;
    }
    if (game.physics.arcade.collide(player, junkMaker) === true)
    {
    	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    }
}

function gameOver(player, spill) {
    deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Game Over', { fontSize: '32px', fill: '#FFF' });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG5cclxuZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuXHJcblx0Z2FtZS5sb2FkLmltYWdlKCdiYWNrZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL0JhY2tncm91bmRTdGF0aWMucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9wbGF0Zm9ybS5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc3RhcicsICcvYXNzZXRzL2ltYWdlcy9zdGFyLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzZWFmbG9vcicsICcvYXNzZXRzL2ltYWdlcy9TZWFGbG9vci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGwnLCAnL2Fzc2V0cy9pbWFnZXMvT2lsU3BpbGwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsZnJvbnQnLCAnL2Fzc2V0cy9pbWFnZXMvR3JhZGllbnRPaWwucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2R1ZGUnLCAnL2Fzc2V0cy9pbWFnZXMvRG9scGhpbi5wbmcnLCAyMzUsIDk2KTtcclxufVxyXG4vLyBTZXR0aW5nIGFsbCB0aGUgdmFyaWFibGVzXHJcbnZhciBwbGF5ZXI7XHJcbnZhciBjdXJzb3JzO1xyXG52YXIgc3BpbGw7XHJcbnZhciBzcGlsbEZyb250O1xyXG52YXIgZGVhdGhBbGVydDtcclxudmFyIG9ic3RhY2xlcztcclxudmFyIGp1bmtNYWtlcjtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xyXG5cclxuICAgIC8vIEFkZGluZyBvZiBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAsIDEwODAsICdzZWFmbG9vcicpO1xyXG5cclxuICAgIC8vU2V0IGJvdW5kYXJpZXMgb2YgdGhlIGdhbWUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBHcm91cGluZyBvZiB0aGUgb2JqZWN0c1xyXG4gICAgb2lsU3BpbGwgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgb2lsU3BpbGwuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkaW5nIG9mIHRoZSBvYmplY3RzXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIHNwaWxsID0gb2lsU3BpbGwuY3JlYXRlKC0zMTAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIHNwaWxsRnJvbnQgPSBvaWxTcGlsbC5jcmVhdGUoLTgwMCwgMCwgJ29pbHNwaWxsZnJvbnQnKTtcclxuXHJcbiAgICAvLyAgRW5hYmxlIHBoeXNpY3Mgb24gZWFjaCBvZiB0aGUgb2JqZWN0c1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUocGxheWVyKTtcclxuXHJcbiAgICAvLyAgUGxheWVyIHBoeXNpY3MgcHJvcGVydGllcy5cclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XHJcbiAgICBwbGF5ZXIucGl2b3QgPSBuZXcgUElYSS5Qb2ludCgxMjAsIDQ4KTtcclxuXHJcbiAgICAvLyAgT3VyIHR3byBhbmltYXRpb25zLCB3YWxraW5nIGxlZnQgYW5kIHJpZ2h0LlxyXG4gICAgcGxheWVyLmFuaW1hdGlvbnMuYWRkKCdsZWZ0JywgWzAsIDEsIDJdLCA2LCB0cnVlKTtcclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgncmlnaHQnLCBbNCwgMywgNV0sIDYsIHRydWUpO1xyXG5cclxuICAgIGp1bmtNYWtlciA9IGdhbWUuYWRkLmVtaXR0ZXIoMSwgMSwgNTAwMCk7XHJcbiAgICBqdW5rTWFrZXIuYXJlYSA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKGdhbWUuY2FtZXJhLngsIDEsIDEwLCAxMDgwKTtcclxuICAgIGp1bmtNYWtlci5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIGp1bmtNYWtlci5mcmVxdWVuY3kgPSAxMDAwO1xyXG4gICAganVua01ha2VyLm1heFJvdGF0aW9uID0gMjA7XHJcbiAgICBqdW5rTWFrZXIubWluUm90YXRpb24gPSAyMDtcclxuICAgIGp1bmtNYWtlci5saWZlc3BhbiA9IDEwMDAwMDAwO1xyXG4gICAganVua01ha2VyLm1ha2VQYXJ0aWNsZXMoJ3N0YXInKTtcclxuICAgIGp1bmtNYWtlci5ib3VuY2Uuc2V0VG8oMC41LCAwLjUpO1xyXG4gICAganVua01ha2VyLmdyYXZpdHkgPSAwO1xyXG4gICAganVua01ha2VyLm9uID0gdHJ1ZTtcclxuXHJcblxyXG4gICAgLy8gIE91ciBjb250cm9scy5cclxuICAgIGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICBnYW1lLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUoKSB7XHJcblxyXG5cdGp1bmtNYWtlci54ID0gZ2FtZS5jYW1lcmEueCAgKyA4NTA7XHJcblxyXG4gICAgLy9Db2xsaXNpb25zXHJcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUocGxheWVyLCBqdW5rTWFrZXIpO1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHBsYXllciwgc3BpbGwsIGdhbWVPdmVyLCBudWxsLCB0aGlzKTtcclxuXHJcbiAgICAvLyAgUmVzZXQgdGhlIHBsYXllcnMgdmVsb2NpdHkgKG1vdmVtZW50KVxyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuICAgIHNwaWxsRnJvbnQuYm9keS52ZWxvY2l0eS54ID0gMjAwO1xyXG4gICAgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIC8vICBNb3ZlIHRvIHRoZSByaWdodFxyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAzMDA7XHJcblxyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMzAwO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gMC41NzA3OTYzMjY4O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy51cC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0zMDA7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gLTAuNTcwNzk2MzI2ODtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93biAmJiBjdXJzb3JzLmRvd24uaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAzMDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgICAgIHBsYXllci5yb3RhdGlvbiA9IDAuNzg1Mzk4MTYzO1xyXG5cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duICYmIGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAzMDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0zMDA7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBwbGF5ZXIucm90YXRpb24gPSAtMC43ODUzOTgxNjM7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duICYmIGN1cnNvcnMuZG93bi5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0zMDA7XHJcbiAgICAgICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gLTAuNzg1Mzk4MTYzO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93biAmJiBjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTMwMDtcclxuICAgICAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgICAgICBwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdsZWZ0Jyk7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gMC43ODUzOTgxNjM7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gMDtcclxuICAgIH1cclxuICAgIGlmIChnYW1lLnBoeXNpY3MuYXJjYWRlLmNvbGxpZGUocGxheWVyLCBqdW5rTWFrZXIpID09PSB0cnVlKVxyXG4gICAge1xyXG4gICAgXHRkZWF0aEFsZXJ0ID0gZ2FtZS5hZGQudGV4dCgoZ2FtZS5jYW1lcmEueCArIDE2KSwgKGdhbWUuY2FtZXJhLnkgKyAxNiksICdJdHMgdG91Y2hpbmcgbWUhJywgeyBmb250U2l6ZTogJzMycHgnLCBmaWxsOiAnI0ZGRicgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdhbWVPdmVyKHBsYXllciwgc3BpbGwpIHtcclxuICAgIGRlYXRoQWxlcnQgPSBnYW1lLmFkZC50ZXh0KChnYW1lLmNhbWVyYS54ICsgMTYpLCAoZ2FtZS5jYW1lcmEueSArIDE2KSwgJ0dhbWUgT3ZlcicsIHsgZm9udFNpemU6ICczMnB4JywgZmlsbDogJyNGRkYnIH0pO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9