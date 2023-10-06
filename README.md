# EVM XCM - Patterns

Welcome to the EVM-XCM Examples repository! This repository contains examples demonstrating solidity contracts using XCM precompiles on Astar network.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Examples](#examples)
- [Contributing](#contributing)

## Introduction

The EVM-XCM Examples repository provides code implementation, set up scripts and integrations tests showcasing how to use XCM precompiles in solidity contracts in Astar.
There is one example for each precompile function. Each example is compose by:
- a set up script (in ./scripts/assetsSetUp.ts)
- a solidity implementation (in ./contracts/**example**)
- integration tests (in ./tests/**example.ts**)

The goal is to provide a **simple and easy to understand** examples for each precompile function. The examples are not meant to be used in production but to help developers to understand how to use XCM precompiles in Astar.

## Getting Started

To get started with these examples, follow these steps:

#### 1. Set up zombie-net      
Please download those binaries for your OS and copy then in `./zombie-net`      
[Polkadot](https://github.com/paritytech/polkadot/releases/tag/v0.9.43) - For non linux user. Download source code and compile it with `cargo build --release`    
[Zombie net binary](https://github.com/paritytech/zombienet/releases/tag/v1.3.62)      
[Astar](https://github.com/AstarNetwork/Astar/releases/tag/v5.20.0)    

**1.2** please **rename binaries**:
`polakdot`
`astar-collator`
`zombienet`

**1.3** Please make the binaries **executable**:
```bash
chmod +x ./polkadot ./astar-collator ./zombienet
```

**1.4** Run zombie-net with the command:
```bash
./zombienet -p native spawn multi.toml
```

#### 2. Run scripts - Set up the environment
The examples rely on a Shibuya and Shiden parachain with an open HRMP channel. an asset TST (id = 1) is created in both parachain. Location is registerd as Shibuya.
First ensure **zombienet is running**
```bash
yarn
yarn setup
```

#### 3. Run the tests
```bash
yarn transfer
yarn withdraw
yarn native
```

## Examples

All examples use XCM precompiles that use xToken pallet.

### Transfer asset
This example will transfer asset id = 1 owned by alith (EVM H160 address of Alice) from Shibuya to Shiden using xToken `transfer`.
The contract can be found in `./contracts/transfer-assets/assetTransfer.sol`. Integrations tests are in the file `./test/transferAssets.ts`.

### Withdraw asset
After having transferred asset id = 1 form reserve to another parachain, we will call withdraw to transfer back the asset to reserve. This example will transfer asset id = 1 owned by alith from Shiden to Shibuya using xToken `transfer_multiasset`.    
The contract can be found in `./contracts/withdraw-assets/withdrawAsset.sol`. Integrations tests are in the file `./test/withdrawAssets.ts`.

### Transfer Native token
This example will transfer native Shibuya token to a wrapped Shibuya token in Shiden using xToken `transfer_multiasset`.
The contract can be found in `./contracts/transfer-native/transferNative.sol`. Integrations tests are in the file `./test/transferNative.ts`.

## Contributing

Contributions to this repository are welcome! If you have an example or tutorial related to EVM and XCM that you'd like to add, please follow these steps:

1. Fork this repository.
2. Create a new branch, commit, and open a Pull Request

