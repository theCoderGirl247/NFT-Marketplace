const Marketplace = artifacts.require("Marketplace");

module.exports = function (deployer) {
  deployer.deploy(Marketplace)
    .then(() => {
      console.log("Marketplace contract deployed successfully!");
    })
    .catch((error) => {
      console.error("Error deploying Marketplace contract:", error);
    });
};