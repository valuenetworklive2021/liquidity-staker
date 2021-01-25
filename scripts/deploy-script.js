const fs = require('fs');
const hre = require('hardhat');



async function main() {
  checkDir();
  const rewardsToken = '0xd0f05D3D4e4d1243Ac826d8c6171180c58eaa9BC'; // VNTW_ADDRESS
  const stakingRewardsGenesis = parseInt(new Date("2020-12-28T00:00:00.000Z").getTime()/1000);
  const infoStakingRewardsFactory = await deployStakingRewardsFactory(rewardsToken, stakingRewardsGenesis);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


function checkDir() {
  const isExists = fs.existsSync('./cache/deployed');
  if (!isExists)
    fs.mkdirSync('./cache/deployed', { recursive: true });
}


async function deployStakingRewardsFactory(rewardsToken, stakingRewardsGenesis) {
  const name = 'StakingRewardsFactory';
  const arguments = [rewardsToken, stakingRewardsGenesis];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}


function updateDeployedContractInfo(name, instance, arguments = []) {
  const newInfo = {
    [instance.provider.network.name]: {
      name: name,
      address: instance.address,
      signer: instance.signer.address,
      arguments: arguments,
    }
  };
  console.log(newInfo);

  const fileName = `./cache/deployed/${name}.json`;
  const isExists = fs.existsSync(fileName);
  if (!isExists) {
    fs.writeFileSync(fileName, JSON.stringify({}, null, 2));
  }

  const oldInfo = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
  const info = Object.assign({}, oldInfo, newInfo);
  fs.writeFileSync(fileName, JSON.stringify(info, null, 2));
}
