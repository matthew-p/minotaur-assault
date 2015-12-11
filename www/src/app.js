      // set to either landscape

      

document.addEventListener("deviceready", function() {

    screen.lockOrientation('landscape');
  
    setTimeout(startGame, 400);
}, false);





function startGame() {
    /* globals Phaser:false, BasicGame: false */
    //  Create your Phaser game and inject it into the game div.
    //  We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
    
    var gameWidth = window.innerWidth * window.devicePixelRatio;
    var gameHeight = window.innerHeight * window.devicePixelRatio;

    // internal logic height
    // note, scale factor of 4x for 144 @ 9 by 16x16 > 576
    // 144, 288, 432, 576
    var baseHeight = 576;
    var inputScaleFactor = gameHeight / baseHeight;
    var baseWidth = (baseHeight / gameHeight) * gameWidth;
    
    var game = new Phaser.Game(baseWidth, baseHeight, Phaser.CANVAS, 'game', null, false, false);
    
    // set scaling data scoped vars
    game.baseHeight = baseHeight;
    game.baseWidth = baseWidth;
    game.inputScaleFactor = baseHeight / window.innerHeight;
    game.gameWidth = window.innerWidth * window.devicePixelRatio;
    game.gameHeight = window.innerHeight * window.devicePixelRatio;
    // asset scale factor
    game.assetScaleFactor = 4;
      // font size multiplier
    game.fontSize = (baseHeight * 0.08) + 'px Arial';
    game.bitmapFontSize = baseHeight * 0.08;
  

    //  Add the States your game has.
    //  You don't have to do this in the html, it could be done in your Game state too, but for simplicity I'll keep it here.
    game.state.add('Boot', BasicGame.Boot);
    game.state.add("Preload", BasicGame.Preload);
    game.state.add("Menu", BasicGame.Menu);
    game.state.add("Game", BasicGame.Game);
    game.state.add("Boss", BasicGame.Boss);
    game.state.add("Infinite", BasicGame.Infinite);
    game.state.add("InfiniteGameOver", BasicGame.InfiniteGameOver);
    

    //  Now start the Game state.
    game.state.start('Boot');

}