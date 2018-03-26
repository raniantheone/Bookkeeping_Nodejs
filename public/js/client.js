require.config({
  baseUrl: "js",
  paths: {
    text: "./lib/text",
    d3: "./lib/d3"
  }
});

require(["skeleton", "function/expense", "function/income", "function/configuration", "function/transfer", "function/distribution", "function/authentication"], function(skeletonMod, expenseMod, incomeMod, configMod, transferMod, distroMod, authenMod) {

  // TODO
  // 1. authentication here
  // 2. register cookie expiration checking function on skeleton
  window.onerror = function (message, file, line, col, error) {
    alert("Error occurred: " + error.message);
    return false;
  };

  /**
  * Initialize side nav:
  * 1. Set up function list
  * 2. Register click event handler for initializing function content
  */
  skeletonMod.registerNavFunction(expenseMod);
  skeletonMod.registerNavFunction(incomeMod);
  skeletonMod.registerNavFunction(configMod);
  skeletonMod.registerNavFunction(transferMod);
  skeletonMod.registerNavFunction(distroMod);

  /**
  * Initialize default function content
  */
  // expenseMod.initialize();
  authenMod.initialize();

});
