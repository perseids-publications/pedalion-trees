# Treebank Template

Template for publishing collections of treebanks.

The treebanks themselves live in the `./public/xml` directory.
All other configuration is done using `./src/config.json`.

## Try it Out

[https://perseids-publications.github.io/treebank-template/](https://perseids-publications.github.io/treebank-template/)

## How to configure with your own treebanks

```
git clone git@github.com:perseids-publications/treebank-template.git my-trees
cd my-trees
git remote rename origin source
git remote add origin <my-trees origin>
git push -u origin master
```

* Copy all your trees into `public/xml`
* Update the `src/config.json` file
* Update `name` and `homepage` in `package.json`
* Set the version in `package.json` to `1.0.0`
* Update the information in `.env`

### Configuration

See [docs/CONFIG.md](docs/CONFIG.md) for more information about the format of `src/config.json`.

### Updating

* `git pull source master`
* Fix merge conflicts
* `git push origin master`

### Setting up automatic deployment with Travis

* `gem install travis`
* `ssh-keygen -t rsa -b 4096 -f .travis-deploy-key -N ''`
* Copy `.travis-deploy-key.pub` to clipboard
* Visit `github.com/<user>/<repository>/settings/keys`
* Click `Add deploy key`
* Title the key `Travis deploy key`, paste the contents of `.travis-deploy-key.pub`, check `Allow write access`, and click `Add key`
* `rm .travis-deploy-key.pub`
* `travis login --com`
* Open `.travis.yml` and remove the line starting with `openssl ...` in the `before_install` section
* `travis encrypt-file .travis-deploy-key --pro --add`
* Update the formatting in `.travis.yml`
* `rm .travis-deploy-key`
* `git add .travis-deploy-key.enc`
* `git commit`
* `git push`

## Installation

`yarn install`

## Running the development server

`yarn start`

## Building for deployment

Before creating a production build you need to know the path where it will be accessed.
Then run the command `PUBLIC_URL='./path/of/app' yarn build`.
This will generate a set of static files in the `build/` directory that you can serve.

For example, if you want to deploy it at `www.example.com/` then run `PUBLIC_URL='./' yarn build`.
If you want to deploy it at `www.example.com/lexica/lsj` then run
`PUBLIC_URL='./lexica/lsj' yarn build`.

## Deploying a new version to github.io

`yarn deploy`

## Zenodo DOI

The instructions below are for uploading a collection of treebanks to Zenodo.
The Treebank Template repository itself is uploaded to Zenodo but the steps are slightly different
(the version of the Treebank Template application is used for the version, the upload type is software, the contributors are different, and the license is MIT instead of CC BY-SA)

### Zenodo

* Visit [Zenodo](https://zenodo.org/deposit/new), log in, and create a new upload
* Click the "Reserve DOI" button in the "Basic information" section
* Keeping the window open, open your command line/console and navigate to the repository

### Git

* In `src/config.json`, add or update the `doi` field to the DOI generated in the above step (preceded by `https://dx.doi.org/`)
* Update the version in `package.json` (try to use [SemVer](https://semver.org/))
* Push the code to `master`
* Keeping the Zenodo window open, in another tab or window open the repository on GitHub

### GitHub

* Make a new release titled "Release vA.B.C" where "A.b.C" is the version in `package.json` and use the same string ("vA.B.C") in the "Tag Version" field
* Enter a description then click "Publish release"
* Download the release as a `tar.gz` file
* Go back to the Zenodo window or tab

### Zenodo

* Add the `tar.gz` file to the upload
* Fill in the following fields:
  * Communities: add the `perseids-project` community and any others that may be relevant
  * Upload type: Dataset
  * Basic information:
    * Title: the title of the treebank collection
    * Authors: the author(s) who contributed to the treebanks
    * Description: a description of the dataset
    * Version: the version in `package.json`
  * License:
    * Access right: Open Access
    * License: Creative Commons Attribution 4.0 International
  * Fill in any other fields that are relevant
* Click "Publish"

## Alpheios Integration

For instructions on how to make your trees available in the [Alpheios Reading Tools](https://alpheios.net) visit [https://perseids-publications.github.io/treebank-template/examples/alpheios-integration](https://perseids-publications.github.io/treebank-template/examples/alpheios-integration).

## Licenses

The code is licensed under the MIT license (see `LICENSE` file).
The treebanks are licensed under the CC0 1.0 license (see `TREEBANK_LICENSE` file).
