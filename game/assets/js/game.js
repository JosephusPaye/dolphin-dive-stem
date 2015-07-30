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
var angle;
var angleCompensation;

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
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');
    player = game.add.sprite(20, game.world.centerY, 'dude');
    point = game.add.sprite(20, game.world.centerY, 'star');

    //  Enable physics on each of the objects
    game.physics.p2.enable(player);

    //  Player physics properties.

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2], 6, true);
    player.animations.add('right', [4, 3, 5], 6, true);

    // junkMaker = game.add.emitter(1, 1, 5000);
    // junkMaker.area = new Phaser.Rectangle(game.camera.x, 1, 10, 1080);
    // junkMaker.enableBody = true;
    // junkMaker.frequency = 1000;
    // junkMaker.maxRotation = 20;
    // junkMaker.minRotation = 20;
    // junkMaker.lifespan = 10000000;
    // junkMaker.makeParticles('star');
    // junkMaker.bounce.setTo(0.5, 0.5);
    // junkMaker.gravity = 0;
    // junkMaker.on = true;


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

	// junkMaker.x = game.camera.x  + 850;

 //    //Collisions
 //    game.physics.arcade.collide(player, junkMaker);
 //    game.physics.arcade.overlap(player, spill, gameOver, null, this);

    //  Reset the players velocity (movement)
    spill.body.velocity.x = 200;
    spillFront.body.velocity.x = 200;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    angle = 45;

    if (cursors.left.isDown) 
    {
    	player.body.velocity.x = -300;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    else if (cursors.right.isDown)
    {
    	player.body.velocity.x = 300;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else 
    {
    	player.body.velocity.x = 0;
    }
    if (cursors.up.isDown)
    {
    	if (angleCompensation === false){
    		angle = angle*(-1);
    	}
    	player.body.angle = angle;
    	player.body.velocity.y = -300;
    }
    else if (cursors.down.isDown)
    {
    	if (angleCompensation === true){
    		angle = angle*(-1);
    	}
    	player.body.angle = angle;
    	player.body.velocity.y = 300;
    }
    else
    {
    	player.body.angle = 0;
    }
    if (cursors.down.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = 300;
    	player.body.angle = 45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.down.isDown && cursors.left.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = -300;
    	player.body.angle = -45;
    	player.animations.play('left');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = 300;
    	player.body.angle = -45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.left.isDown)
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = -300;
    	player.body.angle = 45;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    // if (game.physics.arcade.collide(player, junkMaker) === true)
    // {
    // 	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    // }
}

// function gameOver(player, spill) {
//     deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Game Over', { fontSize: '32px', fill: '#FFF' });
// }

function render(argument) {
	game.debug.body(player);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHVwZGF0ZTogdXBkYXRlLCByZW5kZXI6IHJlbmRlciB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcblxyXG5cdGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9CYWNrZ3JvdW5kU3RhdGljLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL0RvbHBoaW4ucG5nJywgMjM1LCA5Nik7XHJcbn1cclxuLy8gU2V0dGluZyBhbGwgdGhlIHZhcmlhYmxlc1xyXG52YXIgcGxheWVyO1xyXG52YXIgY3Vyc29ycztcclxudmFyIHNwaWxsO1xyXG52YXIgc3BpbGxGcm9udDtcclxudmFyIGRlYXRoQWxlcnQ7XHJcbnZhciBvYnN0YWNsZXM7XHJcbnZhciBqdW5rTWFrZXI7XHJcbnZhciBhbmdsZTtcclxudmFyIGFuZ2xlQ29tcGVuc2F0aW9uO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cclxuICAgIC8vICBXZSdyZSBnb2luZyB0byBiZSB1c2luZyBwaHlzaWNzLCBzbyBlbmFibGUgdGhlIEFyY2FkZSBQaHlzaWNzIHN5c3RlbVxyXG4gICAgZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xyXG5cclxuXHJcbiAgICAvLyBBZGRpbmcgb2YgYmFja2dyb3VuZCBmb3Igb3VyIGdhbWVcclxuICAgIGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMTkyMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwLCAxMDgwLCAnc2VhZmxvb3InKTtcclxuXHJcbiAgICAvL1NldCBib3VuZGFyaWVzIG9mIHRoZSBnYW1lIHdvcmxkXHJcbiAgICBnYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCAxOTIwMCwgMTA4MCk7XHJcblxyXG4gICAgLy8gR3JvdXBpbmcgb2YgdGhlIG9iamVjdHNcclxuICAgIG9pbFNwaWxsID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgIG9pbFNwaWxsLmVuYWJsZUJvZHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEFkZGluZyBvZiB0aGUgb2JqZWN0c1xyXG4gICAgc3BpbGwgPSBvaWxTcGlsbC5jcmVhdGUoLTMxMDAsIDAsICdvaWxzcGlsbCcpO1xyXG4gICAgc3BpbGxGcm9udCA9IG9pbFNwaWxsLmNyZWF0ZSgtODAwLCAwLCAnb2lsc3BpbGxmcm9udCcpO1xyXG4gICAgcGxheWVyID0gZ2FtZS5hZGQuc3ByaXRlKDIwLCBnYW1lLndvcmxkLmNlbnRlclksICdkdWRlJyk7XHJcbiAgICBwb2ludCA9IGdhbWUuYWRkLnNwcml0ZSgyMCwgZ2FtZS53b3JsZC5jZW50ZXJZLCAnc3RhcicpO1xyXG5cclxuICAgIC8vICBFbmFibGUgcGh5c2ljcyBvbiBlYWNoIG9mIHRoZSBvYmplY3RzXHJcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHBsYXllcik7XHJcblxyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuXHJcblxyXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyXSwgNiwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuXHJcbiAgICAvLyBqdW5rTWFrZXIgPSBnYW1lLmFkZC5lbWl0dGVyKDEsIDEsIDUwMDApO1xyXG4gICAgLy8ganVua01ha2VyLmFyZWEgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZShnYW1lLmNhbWVyYS54LCAxLCAxMCwgMTA4MCk7XHJcbiAgICAvLyBqdW5rTWFrZXIuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAvLyBqdW5rTWFrZXIuZnJlcXVlbmN5ID0gMTAwMDtcclxuICAgIC8vIGp1bmtNYWtlci5tYXhSb3RhdGlvbiA9IDIwO1xyXG4gICAgLy8ganVua01ha2VyLm1pblJvdGF0aW9uID0gMjA7XHJcbiAgICAvLyBqdW5rTWFrZXIubGlmZXNwYW4gPSAxMDAwMDAwMDtcclxuICAgIC8vIGp1bmtNYWtlci5tYWtlUGFydGljbGVzKCdzdGFyJyk7XHJcbiAgICAvLyBqdW5rTWFrZXIuYm91bmNlLnNldFRvKDAuNSwgMC41KTtcclxuICAgIC8vIGp1bmtNYWtlci5ncmF2aXR5ID0gMDtcclxuICAgIC8vIGp1bmtNYWtlci5vbiA9IHRydWU7XHJcblxyXG5cclxuICAgIC8vICBPdXIgY29udHJvbHMuXHJcbiAgICBjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgZ2FtZS5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcbiAgICBcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlKCkge1xyXG5cclxuXHQvLyBqdW5rTWFrZXIueCA9IGdhbWUuY2FtZXJhLnggICsgODUwO1xyXG5cclxuIC8vICAgIC8vQ29sbGlzaW9uc1xyXG4gLy8gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKTtcclxuIC8vICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHNwaWxsLCBnYW1lT3ZlciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IDIwMDtcclxuICAgIHNwaWxsRnJvbnQuYm9keS52ZWxvY2l0eS54ID0gMjAwO1xyXG5cclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG4gICAgcGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDA7XHJcbiAgICBhbmdsZSA9IDQ1O1xyXG5cclxuICAgIGlmIChjdXJzb3JzLmxlZnQuaXNEb3duKSBcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0zMDA7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIFx0YW5nbGVDb21wZW5zYXRpb24gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5yaWdodC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAzMDA7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICBcdGFuZ2xlQ29tcGVuc2F0aW9uID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIH1cclxuICAgIGlmIChjdXJzb3JzLnVwLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0aWYgKGFuZ2xlQ29tcGVuc2F0aW9uID09PSBmYWxzZSl7XHJcbiAgICBcdFx0YW5nbGUgPSBhbmdsZSooLTEpO1xyXG4gICAgXHR9XHJcbiAgICBcdHBsYXllci5ib2R5LmFuZ2xlID0gYW5nbGU7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMzAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0aWYgKGFuZ2xlQ29tcGVuc2F0aW9uID09PSB0cnVlKXtcclxuICAgIFx0XHRhbmdsZSA9IGFuZ2xlKigtMSk7XHJcbiAgICBcdH1cclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSBhbmdsZTtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24gJiYgY3Vyc29ycy5yaWdodC5pc0Rvd24pIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMzAwO1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMzAwO1xyXG4gICAgXHRwbGF5ZXIuYm9keS5hbmdsZSA9IDQ1O1xyXG4gICAgXHRwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgXHRhbmdsZUNvbXBlbnNhdGlvbiA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihjdXJzb3JzLmRvd24uaXNEb3duICYmIGN1cnNvcnMubGVmdC5pc0Rvd24pIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMzAwO1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTMwMDtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSAtNDU7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIFx0YW5nbGVDb21wZW5zYXRpb24gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYoY3Vyc29ycy51cC5pc0Rvd24gJiYgY3Vyc29ycy5yaWdodC5pc0Rvd24pIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDMwMDtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSAtNDU7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICBcdGFuZ2xlQ29tcGVuc2F0aW9uID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKGN1cnNvcnMudXAuaXNEb3duICYmIGN1cnNvcnMubGVmdC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAtMzAwO1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gLTMwMDtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSA0NTtcclxuICAgIFx0cGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgXHRhbmdsZUNvbXBlbnNhdGlvbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyBpZiAoZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKSA9PT0gdHJ1ZSlcclxuICAgIC8vIHtcclxuICAgIC8vIFx0ZGVhdGhBbGVydCA9IGdhbWUuYWRkLnRleHQoKGdhbWUuY2FtZXJhLnggKyAxNiksIChnYW1lLmNhbWVyYS55ICsgMTYpLCAnSXRzIHRvdWNoaW5nIG1lIScsIHsgZm9udFNpemU6ICczMnB4JywgZmlsbDogJyNGRkYnIH0pO1xyXG4gICAgLy8gfVxyXG59XHJcblxyXG4vLyBmdW5jdGlvbiBnYW1lT3ZlcihwbGF5ZXIsIHNwaWxsKSB7XHJcbi8vICAgICBkZWF0aEFsZXJ0ID0gZ2FtZS5hZGQudGV4dCgoZ2FtZS5jYW1lcmEueCArIDE2KSwgKGdhbWUuY2FtZXJhLnkgKyAxNiksICdHYW1lIE92ZXInLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjRkZGJyB9KTtcclxuLy8gfVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKGFyZ3VtZW50KSB7XHJcblx0Z2FtZS5kZWJ1Zy5ib2R5KHBsYXllcik7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=