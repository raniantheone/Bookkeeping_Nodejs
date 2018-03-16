require.config({
  baseUrl: "js",
  paths: {
    text :"./lib/text"
  }
});

require(["skeleton", "function/expense"], function(skeletonMod, expenseMod) {

  /**
  * Initialize side nav:
  * 1. Set up function list
  * 2. Register click event handler for initializing function content
  */
  skeletonMod.registerNavFunction(expenseMod);

  /**
  * Initialize default function content
  */
  expenseMod.initialize();

});
