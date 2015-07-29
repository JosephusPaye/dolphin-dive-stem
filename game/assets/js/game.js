var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

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
    game.physics.startSystem(Phaser.Physics.P2JS);

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
    game.physics.p2.enable(player);

    //  Player physics properties.
    player.body.collideWorldBounds = true;
    player.pivot = new PIXI.Point(120, 48);
    player.body.fixedRotation = true;

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
        player.body.moveRight(300);

        player.animations.play('right');
    }
    else if (cursors.left.isDown)
    {
        player.body.moveLeft(300);

        player.animations.play('left');
    }
    else if (cursors.down.isDown)
    {
        player.body.moveDown(300);
        player.rotation = 0.5707963268;
    }
    else if (cursors.up.isDown)
    {
        player.body.moveUp(300);
        player.rotation = -0.5707963268;
    }
    if (cursors.right.isDown && cursors.down.isDown)
    {
        player.body.moveRight(300);
        player.body.moveDown(300);
        player.animations.play('right');
        player.rotation = 0.785398163;

    }
    else if (cursors.right.isDown && cursors.up.isDown)
    {
        player.body.moveRight(300);
        player.body.moveUp(300);
        player.animations.play('right');
        player.rotation = -0.785398163;
    }
    else if (cursors.left.isDown && cursors.down.isDown)
    {
        player.body.moveLeft(300);
        player.body.moveDown(300);
        player.animations.play('left');
        player.rotation = -0.785398163;
    }
    else if (cursors.left.isDown && cursors.up.isDown)
    {
        player.body.moveLeft(300);
        player.body.moveUp(300);
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

function render(argument) {
	game.debug.body(player);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg4MDAsIDYwMCwgUGhhc2VyLkFVVE8sICcnLCB7IHByZWxvYWQ6IHByZWxvYWQsIGNyZWF0ZTogY3JlYXRlLCB1cGRhdGU6IHVwZGF0ZSwgcmVuZGVyOiByZW5kZXIgfSk7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkKCkge1xyXG5cclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvQmFja2dyb3VuZFN0YXRpYy5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnZ3JvdW5kJywgJy9hc3NldHMvaW1hZ2VzL3BsYXRmb3JtLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdzdGFyJywgJy9hc3NldHMvaW1hZ2VzL3N0YXIucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3NlYWZsb29yJywgJy9hc3NldHMvaW1hZ2VzL1NlYUZsb29yLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbCcsICcvYXNzZXRzL2ltYWdlcy9PaWxTcGlsbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnb2lsc3BpbGxmcm9udCcsICcvYXNzZXRzL2ltYWdlcy9HcmFkaWVudE9pbC5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZHVkZScsICcvYXNzZXRzL2ltYWdlcy9Eb2xwaGluLnBuZycsIDIzNSwgOTYpO1xyXG59XHJcbi8vIFNldHRpbmcgYWxsIHRoZSB2YXJpYWJsZXNcclxudmFyIHBsYXllcjtcclxudmFyIGN1cnNvcnM7XHJcbnZhciBzcGlsbDtcclxudmFyIHNwaWxsRnJvbnQ7XHJcbnZhciBkZWF0aEFsZXJ0O1xyXG52YXIgb2JzdGFjbGVzO1xyXG52YXIganVua01ha2VyO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cclxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG5cclxuICAgIC8vIEFkZGluZyBvZiBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMCwgMTA4MCwgJ2JhY2tncm91bmQnKTtcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAsIDEwODAsICdzZWFmbG9vcicpO1xyXG5cclxuICAgIC8vU2V0IGJvdW5kYXJpZXMgb2YgdGhlIGdhbWUgd29ybGRcclxuICAgIGdhbWUud29ybGQuc2V0Qm91bmRzKDAsIDAsIDE5MjAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBHcm91cGluZyBvZiB0aGUgb2JqZWN0c1xyXG4gICAgb2lsU3BpbGwgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgb2lsU3BpbGwuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkaW5nIG9mIHRoZSBvYmplY3RzXHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIHNwaWxsID0gb2lsU3BpbGwuY3JlYXRlKC0zMTAwLCAwLCAnb2lsc3BpbGwnKTtcclxuICAgIHNwaWxsRnJvbnQgPSBvaWxTcGlsbC5jcmVhdGUoLTgwMCwgMCwgJ29pbHNwaWxsZnJvbnQnKTtcclxuXHJcbiAgICAvLyAgRW5hYmxlIHBoeXNpY3Mgb24gZWFjaCBvZiB0aGUgb2JqZWN0c1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShwbGF5ZXIpO1xyXG5cclxuICAgIC8vICBQbGF5ZXIgcGh5c2ljcyBwcm9wZXJ0aWVzLlxyXG4gICAgcGxheWVyLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuICAgIHBsYXllci5waXZvdCA9IG5ldyBQSVhJLlBvaW50KDEyMCwgNDgpO1xyXG4gICAgcGxheWVyLmJvZHkuZml4ZWRSb3RhdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyXSwgNiwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuXHJcbiAgICBqdW5rTWFrZXIgPSBnYW1lLmFkZC5lbWl0dGVyKDEsIDEsIDUwMDApO1xyXG4gICAganVua01ha2VyLmFyZWEgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZShnYW1lLmNhbWVyYS54LCAxLCAxMCwgMTA4MCk7XHJcbiAgICBqdW5rTWFrZXIuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICBqdW5rTWFrZXIuZnJlcXVlbmN5ID0gMTAwMDtcclxuICAgIGp1bmtNYWtlci5tYXhSb3RhdGlvbiA9IDIwO1xyXG4gICAganVua01ha2VyLm1pblJvdGF0aW9uID0gMjA7XHJcbiAgICBqdW5rTWFrZXIubGlmZXNwYW4gPSAxMDAwMDAwMDtcclxuICAgIGp1bmtNYWtlci5tYWtlUGFydGljbGVzKCdzdGFyJyk7XHJcbiAgICBqdW5rTWFrZXIuYm91bmNlLnNldFRvKDAuNSwgMC41KTtcclxuICAgIGp1bmtNYWtlci5ncmF2aXR5ID0gMDtcclxuICAgIGp1bmtNYWtlci5vbiA9IHRydWU7XHJcblxyXG5cclxuICAgIC8vICBPdXIgY29udHJvbHMuXHJcbiAgICBjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcbiAgICBcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuXHRqdW5rTWFrZXIueCA9IGdhbWUuY2FtZXJhLnggICsgODUwO1xyXG5cclxuICAgIC8vQ29sbGlzaW9uc1xyXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKTtcclxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHNwaWxsLCBnYW1lT3ZlciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBzcGlsbC5ib2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcbiAgICBzcGlsbEZyb250LmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuICAgIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgICAgICAvLyAgTW92ZSB0byB0aGUgcmlnaHRcclxuICAgICAgICBwbGF5ZXIuYm9keS5tb3ZlUmlnaHQoMzAwKTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLmJvZHkubW92ZUxlZnQoMzAwKTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS5tb3ZlRG93bigzMDApO1xyXG4gICAgICAgIHBsYXllci5yb3RhdGlvbiA9IDAuNTcwNzk2MzI2ODtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5Lm1vdmVVcCgzMDApO1xyXG4gICAgICAgIHBsYXllci5yb3RhdGlvbiA9IC0wLjU3MDc5NjMyNjg7XHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24gJiYgY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgICAgICBwbGF5ZXIuYm9keS5tb3ZlUmlnaHQoMzAwKTtcclxuICAgICAgICBwbGF5ZXIuYm9keS5tb3ZlRG93bigzMDApO1xyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICAgICAgcGxheWVyLnJvdGF0aW9uID0gMC43ODUzOTgxNjM7XHJcblxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24gJiYgY3Vyc29ycy51cC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLmJvZHkubW92ZVJpZ2h0KDMwMCk7XHJcbiAgICAgICAgcGxheWVyLmJvZHkubW92ZVVwKDMwMCk7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgICAgICBwbGF5ZXIucm90YXRpb24gPSAtMC43ODUzOTgxNjM7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duICYmIGN1cnNvcnMuZG93bi5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICAgICAgcGxheWVyLmJvZHkubW92ZUxlZnQoMzAwKTtcclxuICAgICAgICBwbGF5ZXIuYm9keS5tb3ZlRG93bigzMDApO1xyXG4gICAgICAgIHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgICAgICBwbGF5ZXIucm90YXRpb24gPSAtMC43ODUzOTgxNjM7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duICYmIGN1cnNvcnMudXAuaXNEb3duKVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5ib2R5Lm1vdmVMZWZ0KDMwMCk7XHJcbiAgICAgICAgcGxheWVyLmJvZHkubW92ZVVwKDMwMCk7XHJcbiAgICAgICAgcGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgICAgIHBsYXllci5yb3RhdGlvbiA9IDAuNzg1Mzk4MTYzO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIHBsYXllci5yb3RhdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICBpZiAoZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKSA9PT0gdHJ1ZSlcclxuICAgIHtcclxuICAgIFx0ZGVhdGhBbGVydCA9IGdhbWUuYWRkLnRleHQoKGdhbWUuY2FtZXJhLnggKyAxNiksIChnYW1lLmNhbWVyYS55ICsgMTYpLCAnSXRzIHRvdWNoaW5nIG1lIScsIHsgZm9udFNpemU6ICczMnB4JywgZmlsbDogJyNGRkYnIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnYW1lT3ZlcihwbGF5ZXIsIHNwaWxsKSB7XHJcbiAgICBkZWF0aEFsZXJ0ID0gZ2FtZS5hZGQudGV4dCgoZ2FtZS5jYW1lcmEueCArIDE2KSwgKGdhbWUuY2FtZXJhLnkgKyAxNiksICdHYW1lIE92ZXInLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjRkZGJyB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKGFyZ3VtZW50KSB7XHJcblx0Z2FtZS5kZWJ1Zy5ib2R5KHBsYXllcik7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=