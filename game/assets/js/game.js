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
var result;
var speed = 300;
var x = 2000;
var level = 1;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);


    // Adding of background for our game
    game.add.tileSprite(0, 0, 192000, 1080, 'background');
    game.add.tileSprite(0, 0, 192000, 1080, 'seafloor');

    //Set boundaries of the game world
    game.world.setBounds(0, 0, 192000, 1080);

    // Grouping of the objects
    oilSpill = game.add.group();
    oilSpill.enableBody = true;

    // Adding of the objects
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');
    player = game.add.sprite(20, game.world.centerY, 'dude');
    player.scale.setTo(.4, .4);
    point = game.add.sprite(20, game.world.centerY, 'star');

    //  Enable physics on each of the objects
    game.physics.p2.enable(player);
    game.physics.p2.enable(spill);

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

    var playerCollisionGroup = game.physics.p2.createCollisionGroup();
    var junkCollisionGroup = game.physics.p2.createCollisionGroup();

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    var junks = game.add.group();
    junks.enableBody = true;
    junks.physicsBodyType = Phaser.Physics.P2JS;

    for (var i = 0; i < 1000; i++)
    {
        var junk = junks.create(game.world.randomX, game.world.randomY, 'star');
        junk.body.setRectangle(24, 22);

        //  Tell the junk to use the junkCollisionGroup 
        junk.body.setCollisionGroup(junkCollisionGroup);

        //  junks will collide against themselves and the player
        //  If you don't set this they'll not collide with anything.
        //  The first parameter is either an array or a single collision group.
        junk.body.collides([junkCollisionGroup, playerCollisionGroup]);
    }

    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(junkCollisionGroup, gameOver, this);


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

	// junkMaker.x = game.camera.x  + 850;

 //    //Collisions
 //   player.body.onBeginContact.add(gameOver, this)
 //    game.physics.arcade.collide(player, junkMaker);
 //    game.physics.arcade.overlap(player, spill, gameOver, null, this);

    //  Reset the players velocity (movement)
    spill.body.velocity.x = speed - 200;
    spillFront.body.velocity.x = speed - 200;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    angle = 45;
    if (player.body.x >= (x*level))
    {
        console.log('speed up!')
        speed += 50;
        level += 1
    }
    if (cursors.left.isDown) 
    {
    	player.body.velocity.x = -1*speed;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    else if (cursors.right.isDown)
    {
    	player.body.velocity.x = speed;
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
    	player.body.velocity.y = -1*300;
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
    	player.body.velocity.x = speed;
    	player.body.angle = 45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.down.isDown && cursors.left.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = -1*speed;
    	player.body.angle = -45;
    	player.animations.play('left');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = speed;
    	player.body.angle = -45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.left.isDown)
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = -speed;
    	player.body.angle = 45;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    // if (game.physics.arcade.collide(player, junkMaker) === true)
    // {
    // 	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    // }
}

function gameOver(body, shapeA, shapeB, equation) {
    result = 'Game Over!'
}

function render() {
    //player.body.debug = true;
    game.debug.text(result, 32, 32);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJycsIHsgcHJlbG9hZDogcHJlbG9hZCwgY3JlYXRlOiBjcmVhdGUsIHVwZGF0ZTogdXBkYXRlLCByZW5kZXI6IHJlbmRlciB9KTtcclxuXHJcbmZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcblxyXG5cdGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICcvYXNzZXRzL2ltYWdlcy9CYWNrZ3JvdW5kU3RhdGljLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdncm91bmQnLCAnL2Fzc2V0cy9pbWFnZXMvcGxhdGZvcm0ucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ3N0YXInLCAnL2Fzc2V0cy9pbWFnZXMvc3Rhci5wbmcnKTtcclxuICAgIGdhbWUubG9hZC5pbWFnZSgnc2VhZmxvb3InLCAnL2Fzc2V0cy9pbWFnZXMvU2VhRmxvb3IucG5nJyk7XHJcbiAgICBnYW1lLmxvYWQuaW1hZ2UoJ29pbHNwaWxsJywgJy9hc3NldHMvaW1hZ2VzL09pbFNwaWxsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLmltYWdlKCdvaWxzcGlsbGZyb250JywgJy9hc3NldHMvaW1hZ2VzL0dyYWRpZW50T2lsLnBuZycpO1xyXG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdkdWRlJywgJy9hc3NldHMvaW1hZ2VzL0RvbHBoaW4ucG5nJywgMjM1LCA5Nik7XHJcbn1cclxuLy8gU2V0dGluZyBhbGwgdGhlIHZhcmlhYmxlc1xyXG52YXIgcGxheWVyO1xyXG52YXIgY3Vyc29ycztcclxudmFyIHNwaWxsO1xyXG52YXIgc3BpbGxGcm9udDtcclxudmFyIGRlYXRoQWxlcnQ7XHJcbnZhciBvYnN0YWNsZXM7XHJcbnZhciBqdW5rTWFrZXI7XHJcbnZhciBhbmdsZTtcclxudmFyIGFuZ2xlQ29tcGVuc2F0aW9uO1xyXG52YXIgcmVzdWx0O1xyXG52YXIgc3BlZWQgPSAzMDA7XHJcbnZhciB4ID0gMjAwMDtcclxudmFyIGxldmVsID0gMTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAvLyAgV2UncmUgZ29pbmcgdG8gYmUgdXNpbmcgcGh5c2ljcywgc28gZW5hYmxlIHRoZSBBcmNhZGUgUGh5c2ljcyBzeXN0ZW1cclxuICAgIGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuICAgIGdhbWUucGh5c2ljcy5wMi5zZXRJbXBhY3RFdmVudHModHJ1ZSk7XHJcblxyXG5cclxuICAgIC8vIEFkZGluZyBvZiBiYWNrZ3JvdW5kIGZvciBvdXIgZ2FtZVxyXG4gICAgZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCAxOTIwMDAsIDEwODAsICdiYWNrZ3JvdW5kJyk7XHJcbiAgICBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDE5MjAwMCwgMTA4MCwgJ3NlYWZsb29yJyk7XHJcblxyXG4gICAgLy9TZXQgYm91bmRhcmllcyBvZiB0aGUgZ2FtZSB3b3JsZFxyXG4gICAgZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgMTkyMDAwLCAxMDgwKTtcclxuXHJcbiAgICAvLyBHcm91cGluZyBvZiB0aGUgb2JqZWN0c1xyXG4gICAgb2lsU3BpbGwgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgb2lsU3BpbGwuZW5hYmxlQm9keSA9IHRydWU7XHJcblxyXG4gICAgLy8gQWRkaW5nIG9mIHRoZSBvYmplY3RzXHJcbiAgICBzcGlsbCA9IG9pbFNwaWxsLmNyZWF0ZSgtMzEwMCwgMCwgJ29pbHNwaWxsJyk7XHJcbiAgICBzcGlsbEZyb250ID0gb2lsU3BpbGwuY3JlYXRlKC04MDAsIDAsICdvaWxzcGlsbGZyb250Jyk7XHJcbiAgICBwbGF5ZXIgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ2R1ZGUnKTtcclxuICAgIHBsYXllci5zY2FsZS5zZXRUbyguNCwgLjQpO1xyXG4gICAgcG9pbnQgPSBnYW1lLmFkZC5zcHJpdGUoMjAsIGdhbWUud29ybGQuY2VudGVyWSwgJ3N0YXInKTtcclxuXHJcbiAgICAvLyAgRW5hYmxlIHBoeXNpY3Mgb24gZWFjaCBvZiB0aGUgb2JqZWN0c1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShwbGF5ZXIpO1xyXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZShzcGlsbCk7XHJcblxyXG4gICAgLy8gIFBsYXllciBwaHlzaWNzIHByb3BlcnRpZXMuXHJcblxyXG4gICAgLy8gIE91ciB0d28gYW5pbWF0aW9ucywgd2Fsa2luZyBsZWZ0IGFuZCByaWdodC5cclxuICAgIHBsYXllci5hbmltYXRpb25zLmFkZCgnbGVmdCcsIFswLCAxLCAyXSwgNiwgdHJ1ZSk7XHJcbiAgICBwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ3JpZ2h0JywgWzQsIDMsIDVdLCA2LCB0cnVlKTtcclxuXHJcbiAgICAvLyBqdW5rTWFrZXIgPSBnYW1lLmFkZC5lbWl0dGVyKDEsIDEsIDUwMDApO1xyXG4gICAgLy8ganVua01ha2VyLmFyZWEgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZShnYW1lLmNhbWVyYS54LCAxLCAxMCwgMTA4MCk7XHJcbiAgICAvLyBqdW5rTWFrZXIuZW5hYmxlQm9keSA9IHRydWU7XHJcbiAgICAvLyBqdW5rTWFrZXIuZnJlcXVlbmN5ID0gMTAwMDtcclxuICAgIC8vIGp1bmtNYWtlci5tYXhSb3RhdGlvbiA9IDIwO1xyXG4gICAgLy8ganVua01ha2VyLm1pblJvdGF0aW9uID0gMjA7XHJcbiAgICAvLyBqdW5rTWFrZXIubGlmZXNwYW4gPSAxMDAwMDAwMDtcclxuICAgIC8vIGp1bmtNYWtlci5tYWtlUGFydGljbGVzKCdzdGFyJyk7XHJcbiAgICAvLyBqdW5rTWFrZXIuYm91bmNlLnNldFRvKDAuNSwgMC41KTtcclxuICAgIC8vIGp1bmtNYWtlci5ncmF2aXR5ID0gMDtcclxuICAgIC8vIGp1bmtNYWtlci5vbiA9IHRydWU7XHJcblxyXG4gICAgdmFyIHBsYXllckNvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcbiAgICB2YXIganVua0NvbGxpc2lvbkdyb3VwID0gZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZUNvbGxpc2lvbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gIFRoaXMgcGFydCBpcyB2aXRhbCBpZiB5b3Ugd2FudCB0aGUgb2JqZWN0cyB3aXRoIHRoZWlyIG93biBjb2xsaXNpb24gZ3JvdXBzIHRvIHN0aWxsIGNvbGxpZGUgd2l0aCB0aGUgd29ybGQgYm91bmRzXHJcbiAgICAvLyAgKHdoaWNoIHdlIGRvKSAtIHdoYXQgdGhpcyBkb2VzIGlzIGFkanVzdCB0aGUgYm91bmRzIHRvIHVzZSBpdHMgb3duIGNvbGxpc2lvbiBncm91cC5cclxuICAgIGdhbWUucGh5c2ljcy5wMi51cGRhdGVCb3VuZHNDb2xsaXNpb25Hcm91cCgpO1xyXG5cclxuICAgIHZhciBqdW5rcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICBqdW5rcy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuICAgIGp1bmtzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLlAySlM7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDAwOyBpKyspXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIGp1bmsgPSBqdW5rcy5jcmVhdGUoZ2FtZS53b3JsZC5yYW5kb21YLCBnYW1lLndvcmxkLnJhbmRvbVksICdzdGFyJyk7XHJcbiAgICAgICAganVuay5ib2R5LnNldFJlY3RhbmdsZSgyNCwgMjIpO1xyXG5cclxuICAgICAgICAvLyAgVGVsbCB0aGUganVuayB0byB1c2UgdGhlIGp1bmtDb2xsaXNpb25Hcm91cCBcclxuICAgICAgICBqdW5rLmJvZHkuc2V0Q29sbGlzaW9uR3JvdXAoanVua0NvbGxpc2lvbkdyb3VwKTtcclxuXHJcbiAgICAgICAgLy8gIGp1bmtzIHdpbGwgY29sbGlkZSBhZ2FpbnN0IHRoZW1zZWx2ZXMgYW5kIHRoZSBwbGF5ZXJcclxuICAgICAgICAvLyAgSWYgeW91IGRvbid0IHNldCB0aGlzIHRoZXknbGwgbm90IGNvbGxpZGUgd2l0aCBhbnl0aGluZy5cclxuICAgICAgICAvLyAgVGhlIGZpcnN0IHBhcmFtZXRlciBpcyBlaXRoZXIgYW4gYXJyYXkgb3IgYSBzaW5nbGUgY29sbGlzaW9uIGdyb3VwLlxyXG4gICAgICAgIGp1bmsuYm9keS5jb2xsaWRlcyhbanVua0NvbGxpc2lvbkdyb3VwLCBwbGF5ZXJDb2xsaXNpb25Hcm91cF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXllci5ib2R5LnNldENvbGxpc2lvbkdyb3VwKHBsYXllckNvbGxpc2lvbkdyb3VwKTtcclxuICAgIHBsYXllci5ib2R5LmNvbGxpZGVzKGp1bmtDb2xsaXNpb25Hcm91cCwgZ2FtZU92ZXIsIHRoaXMpO1xyXG5cclxuXHJcbiAgICAvLyAgT3VyIGNvbnRyb2xzLlxyXG4gICAgY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xyXG5cclxuICAgIGdhbWUuY2FtZXJhLmZvbGxvdyhwbGF5ZXIpO1xyXG4gICAgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHJcblx0Ly8ganVua01ha2VyLnggPSBnYW1lLmNhbWVyYS54ICArIDg1MDtcclxuXHJcbiAvLyAgICAvL0NvbGxpc2lvbnNcclxuIC8vICAgcGxheWVyLmJvZHkub25CZWdpbkNvbnRhY3QuYWRkKGdhbWVPdmVyLCB0aGlzKVxyXG4gLy8gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5jb2xsaWRlKHBsYXllciwganVua01ha2VyKTtcclxuIC8vICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcChwbGF5ZXIsIHNwaWxsLCBnYW1lT3ZlciwgbnVsbCwgdGhpcyk7XHJcblxyXG4gICAgLy8gIFJlc2V0IHRoZSBwbGF5ZXJzIHZlbG9jaXR5IChtb3ZlbWVudClcclxuICAgIHNwaWxsLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkIC0gMjAwO1xyXG4gICAgc3BpbGxGcm9udC5ib2R5LnZlbG9jaXR5LnggPSBzcGVlZCAtIDIwMDtcclxuXHJcbiAgICBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuICAgIHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG4gICAgYW5nbGUgPSA0NTtcclxuICAgIGlmIChwbGF5ZXIuYm9keS54ID49ICh4KmxldmVsKSlcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnc3BlZWQgdXAhJylcclxuICAgICAgICBzcGVlZCArPSA1MDtcclxuICAgICAgICBsZXZlbCArPSAxXHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy5sZWZ0LmlzRG93bikgXHJcbiAgICB7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMSpzcGVlZDtcclxuICAgIFx0cGxheWVyLmFuaW1hdGlvbnMucGxheSgnbGVmdCcpO1xyXG4gICAgXHRhbmdsZUNvbXBlbnNhdGlvbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bilcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkO1xyXG4gICAgXHRwbGF5ZXIuYW5pbWF0aW9ucy5wbGF5KCdyaWdodCcpO1xyXG4gICAgXHRhbmdsZUNvbXBlbnNhdGlvbiA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDA7XHJcbiAgICB9XHJcbiAgICBpZiAoY3Vyc29ycy51cC5pc0Rvd24pXHJcbiAgICB7XHJcbiAgICBcdGlmIChhbmdsZUNvbXBlbnNhdGlvbiA9PT0gZmFsc2Upe1xyXG4gICAgXHRcdGFuZ2xlID0gYW5nbGUqKC0xKTtcclxuICAgIFx0fVxyXG4gICAgXHRwbGF5ZXIuYm9keS5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTEqMzAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3Vyc29ycy5kb3duLmlzRG93bilcclxuICAgIHtcclxuICAgIFx0aWYgKGFuZ2xlQ29tcGVuc2F0aW9uID09PSB0cnVlKXtcclxuICAgIFx0XHRhbmdsZSA9IGFuZ2xlKigtMSk7XHJcbiAgICBcdH1cclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSBhbmdsZTtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IDMwMDtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSAwO1xyXG4gICAgfVxyXG4gICAgaWYgKGN1cnNvcnMuZG93bi5pc0Rvd24gJiYgY3Vyc29ycy5yaWdodC5pc0Rvd24pIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gMzAwO1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID0gc3BlZWQ7XHJcbiAgICBcdHBsYXllci5ib2R5LmFuZ2xlID0gNDU7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ3JpZ2h0Jyk7XHJcbiAgICBcdGFuZ2xlQ29tcGVuc2F0aW9uID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKGN1cnNvcnMuZG93bi5pc0Rvd24gJiYgY3Vyc29ycy5sZWZ0LmlzRG93bikgXHJcbiAgICB7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnkgPSAzMDA7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMSpzcGVlZDtcclxuICAgIFx0cGxheWVyLmJvZHkuYW5nbGUgPSAtNDU7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIFx0YW5nbGVDb21wZW5zYXRpb24gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYoY3Vyc29ycy51cC5pc0Rvd24gJiYgY3Vyc29ycy5yaWdodC5pc0Rvd24pIFxyXG4gICAge1xyXG4gICAgXHRwbGF5ZXIuYm9keS52ZWxvY2l0eS55ID0gLTMwMDtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IHNwZWVkO1xyXG4gICAgXHRwbGF5ZXIuYm9keS5hbmdsZSA9IC00NTtcclxuICAgIFx0cGxheWVyLmFuaW1hdGlvbnMucGxheSgncmlnaHQnKTtcclxuICAgIFx0YW5nbGVDb21wZW5zYXRpb24gPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYoY3Vyc29ycy51cC5pc0Rvd24gJiYgY3Vyc29ycy5sZWZ0LmlzRG93bilcclxuICAgIHtcclxuICAgIFx0cGxheWVyLmJvZHkudmVsb2NpdHkueSA9IC0zMDA7XHJcbiAgICBcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtc3BlZWQ7XHJcbiAgICBcdHBsYXllci5ib2R5LmFuZ2xlID0gNDU7XHJcbiAgICBcdHBsYXllci5hbmltYXRpb25zLnBsYXkoJ2xlZnQnKTtcclxuICAgIFx0YW5nbGVDb21wZW5zYXRpb24gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy8gaWYgKGdhbWUucGh5c2ljcy5hcmNhZGUuY29sbGlkZShwbGF5ZXIsIGp1bmtNYWtlcikgPT09IHRydWUpXHJcbiAgICAvLyB7XHJcbiAgICAvLyBcdGRlYXRoQWxlcnQgPSBnYW1lLmFkZC50ZXh0KChnYW1lLmNhbWVyYS54ICsgMTYpLCAoZ2FtZS5jYW1lcmEueSArIDE2KSwgJ0l0cyB0b3VjaGluZyBtZSEnLCB7IGZvbnRTaXplOiAnMzJweCcsIGZpbGw6ICcjRkZGJyB9KTtcclxuICAgIC8vIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2FtZU92ZXIoYm9keSwgc2hhcGVBLCBzaGFwZUIsIGVxdWF0aW9uKSB7XHJcbiAgICByZXN1bHQgPSAnR2FtZSBPdmVyISdcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgLy9wbGF5ZXIuYm9keS5kZWJ1ZyA9IHRydWU7XHJcbiAgICBnYW1lLmRlYnVnLnRleHQocmVzdWx0LCAzMiwgMzIpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9