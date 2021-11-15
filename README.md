![Logo](admin/thehome.png)

# ioBroker.thehome

[![NPM version](https://img.shields.io/npm/v/iobroker.thehome.svg)](https://www.npmjs.com/package/iobroker.thehome)
[![Downloads](https://img.shields.io/npm/dm/iobroker.thehome.svg)](https://www.npmjs.com/package/iobroker.thehome)
![Number of Installations (latest)](https://iobroker.live/badges/thehome-installed.svg)
![Number of Installations (stable)](https://iobroker.live/badges/thehome-stable.svg)
[![Dependency Status](https://img.shields.io/david/swissglider/iobroker.thehome.svg)](https://david-dm.org/swissglider/iobroker.thehome)

[![NPM](https://nodei.co/npm/iobroker.thehome.png?downloads=true)](https://nodei.co/npm/iobroker.thehome/)

**Tests:** ![Test and Release](https://github.com/swissglider/ioBroker.thehome/workflows/Test%20and%20Release/badge.svg)

## thehome adapter for ioBroker

Configure ioBroker for Swissglider --> upload/download deviceConfiguration / set Swissglider Tags / change influxDB names

## Developer manual

This section is intended for the developer. It can be deleted later

### Getting started

You are almost done, only a few steps left:

1. Create a new repository on GitHub with the name `ioBroker.thehome`

1. Push all files to the GitHub repo. The creator has already set up the local repository for you:
    ```bash
    git push origin master
    ```
1. Add a new secret under https://github.com/swissglider/ioBroker.thehome/settings/secrets. It must be named `AUTO_MERGE_TOKEN` and contain a personal access token with push access to the repository, e.g. yours. You can create a new token under https://github.com/settings/tokens.

1. Head over to [src/main.ts](src/main.ts) and start programming!

### Best Practices

We've collected some [best practices](https://github.com/ioBroker/ioBroker.repositories#development-and-coding-best-practices) regarding ioBroker development and coding in general. If you're new to ioBroker or Node.js, you should
check them out. If you're already experienced, you should also take a look at them - you might learn something new :)

### Scripts in `package.json`

Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description |
|-------------|-------------|
| `build:parcel` | Compile the React sources. |
| `watch:parcel` | Compile the React sources and watch for changes. |
| `build:ts` | Compile the TypeScript sources. |
| `watch:ts` | Compile the TypeScript sources and watch for changes. |
| `watch` | Shortcut for `npm run watch:ts` |
| `build` | Compile the TypeScript and the React sources. |
| `test:ts` | Executes the tests you defined in `*.test.ts` files. |
| `test:package` | Ensures your `package.json` and `io-package.json` are valid. |
| `test:unit` | Tests the adapter startup with unit tests (fast, but might require module mocks to work). |
| `test:integration` | Tests the adapter startup with an actual instance of ioBroker. |
| `test` | Performs a minimal test run on package files and your tests. |
| `check` | Performs a type-check on your code (without compiling anything). |
| `lint` | Runs `ESLint` to check your code for formatting errors and potential bugs. |
| `release` | Creates a new release, see [`@alcalzone/release-script`](https://github.com/AlCalzone/release-script#usage) for more details. |

### Writing tests

When done right, testing code is invaluable, because it gives you the
confidence to change your code while knowing exactly if and when
something breaks. A good read on the topic of test-driven development
is https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92.
Although writing tests before the code might seem strange at first, but it has very
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.

### Publishing the adapter

Since you have chosen GitHub Actions as your CI service, you can
enable automatic releases on npm whenever you push a new git tag that matches the form
`v<major>.<minor>.<patch>`. The necessary steps are described in `.github/workflows/test-and-release.yml`.

Since you installed the release script, you can create a new
release simply by calling:

```bash
npm run release
```

Additional command line options for the release script are explained in the
[release-script documentation](https://github.com/AlCalzone/release-script#command-line).

To get your adapter released in ioBroker, please refer to the documentation
of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually with dev-server

Since you set up `dev-server`, you can use it to run, test and debug your adapter.

You may start `dev-server` by calling from your dev directory:

```bash
dev-server watch
```

The ioBroker.admin interface will then be available at http://localhost:8081/

Please refer to the [`dev-server` documentation](https://github.com/ioBroker/dev-server#command-line) for more details.

## Changelog

### **WORK IN PROGRESS**

-   (swissglider) AutoChangeWizard finished

### 0.0.2-15 (2021-11-14)

-   (swissglider) Sonoff iobAdapterHandler implemented (Basic, 4CH)
-   (swissglider) JeeLink iobAdapterHandler implemented (not yet testet)
-   (swissglider) Hue iobAdapterHandler implemented

### 0.0.2-14 (2021-11-03)

-   (swissglider) Shelly iobAdapterHandler implemented

### 0.0.2-13 (2021-11-01)

-   (swissglider) Bugfixing

### 0.0.2-12 (2021-11-01)

-   (swissglider) Bugfixing

### 0.0.2-11 (2021-10-31)

-   (swissglider) Auto Change Name WIZARD
-   (swissglider) Changed to Grommet

### 0.0.2-10 (2021-09-29)

-   (swissglider) ConfigChangeListener_active and InfluxDBHandlerAdapter_active on adapter and admin

### 0.0.2-9 (2021-09-29)

-   (swissglider) some InfluxDBHandler Adapter topics fixed and swissglider native removed

### 0.0.2-8 (2021-09-29)

-   (swissglider) implemented the InfluxDBHandler Adapter and Admin page

### 0.0.2-7 (2021-09-23)

-   (swissglider) implemented the configChange Listener and Admin state name reset view

### 0.0.2-6 (2021-09-12)

-   (swissglider) added translations

### 0.0.2-5 (2021-09-12)

-   (swissglider) added changed ConfigFile UseCases with store2DB

### 0.0.2-4 (2021-09-07)

-   (swissglider) the following UseCases has been implemented

    -   Upload ConfigFile
    -   Download ConfigFile
    -   Single ConfigFile Upload

-   (swissglider) ToDo:
    -   all InfluxDB functions
    -   all Service/Listener functions

### 0.0.2-3 (2021-08-29)

-   (swissglider) the following UseCases has been implemented

    -   Upload ConfigFile
    -   Download ConfigFile

-   (swissglider) ToDo:
    -   all InfluxDB functions
    -   all Service/Listener functions

### 0.0.2-2 (2021-08-27)

-   (swissglider) initial release

### 0.0.2-1 (2021-08-27)

-   (swissglider) initial release

### 0.0.2-0 (2021-08-27)

-   (swissglider) initial release

## License

MIT License

Copyright (c) 2021 swissglider <npm@mailschweiz.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
