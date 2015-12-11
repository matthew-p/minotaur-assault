
/* globals Phaser:false */
// create BasicGame Class
var BasicGame = BasicGame || {};

// create Boot function in BasicGame
BasicGame.Boot = function(game) {
};

// set Boot function prototype
BasicGame.Boot.prototype = {

    init: function () {
      // timing for fps
      this.game.time.advancedTiming = true;

      // set up input max pointers
      this.input.maxPointers = 2;

      // set up stage disable visibility change
      this.stage.disableVisibilityChange = true;
      // Set up the scaling method used by the ScaleManager
      // Valid values for scaleMode are:
      // * EXACT_FIT
      // * NO_SCALE
      // * SHOW_ALL
      // * RESIZE
      // See http://docs.phaser.io/Phaser.ScaleManager.html for full document
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // scaling 
      this.game.height = window.innerHeight;
      this.game.width = window.innerWidth;

      // If you wish to align your game in the middle of the page then you can
      // set this value to true. It will place a re-calculated margin-left
      // pixel value onto the canvas element which is updated on orientation /
      // resizing events. It doesn't care about any other DOM element that may
      // be on the page, it literally just sets the margin.
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      // Force the orientation in landscape or portrait.
      // * Set first to true to force landscape. 
      // * Set second to true to force portrait.
      this.scale.forceOrientation(true, false);
      // Sets the callback that will be called when the window resize event
      // occurs, or if set the parent container changes dimensions. Use this 
      // to handle responsive game layout options. Note that the callback will
      // only be called if the ScaleManager.scaleMode is set to RESIZE.
      // this.scale.setResizeCallback(this.gameResized, this);
      // Set screen size automatically based on the scaleMode. This is only
      // needed if ScaleMode is not set to RESIZE.
      this.scale.updateLayout(true);
      // Re-calculate scale mode and update screen size. This only applies if
      // ScaleMode is not set to RESIZE.
      this.scale.refresh();

    },

    preload: function () {

      // Here we load the assets required for our preloader (in this case a 
      // background and a loading indicator)
      this.load.image('logo', 'asset/boosterEngineLogo.png');
      this.load.spritesheet("spinner", "asset/spinner-white-on-black.png", 34,34);
      
        
    },

    create: function () {

      // scaling input to screen for custom resolution scale in app.js
      this.game.input.scale.setTo(this.game.inputScaleFactor, this.game.inputScaleFactor);


    },
    update: function () {

        this.game.state.start("Preload");

    },
  

    gameResized: function (width, height) {

        // This could be handy if you need to do any extra processing if the 
        // game resizes. A resize could happen if for example swapping 
        // orientation on a device or resizing the browser window. Note that 
        // this callback is only really useful if you use a ScaleMode of RESIZE 
        // and place it inside your main game state.

    }

};